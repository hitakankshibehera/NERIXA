// ============================================================
// NERIXA — Telemetry Validator & Data Quality Guard
// Rejects impossible, spoofed, or malicious GPS inputs
// ============================================================

import { VehicleTelemetry } from '@/lib/types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedTelemetry?: VehicleTelemetry;
}

/**
 * Validates vehicle telemetry strictly according to NERIXA security guidelines:
 * - Latitude: -90 to +90
 * - Longitude: -180 to +180
 * - Speed: 0 to 220 km/h (rejects impossible speeds)
 * - Heading: 0 to 360 degrees
 * - Accuracy: 0.1 to 500 meters
 * - Timestamp: not in the far future (> 3 minutes) or unreasonably old (> 7 days)
 * - Vehicle ID: alphanumeric string with hyphens/underscores
 */
export function validateTelemetry(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Telemetry payload must be an object'] };
  }

  const raw = input as Record<string, unknown>;

  // 1. Validate Vehicle ID
  if (typeof raw.vehicle_id !== 'string' || !raw.vehicle_id.trim()) {
    errors.push('vehicle_id is required');
  } else {
    const sanitizedId = raw.vehicle_id.trim();
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(sanitizedId)) {
      errors.push('vehicle_id contains invalid characters (must be 3-32 alphanumeric, hyphen or underscore)');
    }
  }

  // 2. Validate Latitude & Longitude
  const lat = Number(raw.latitude);
  const lng = Number(raw.longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.push(`latitude out of range [-90, +90]: ${raw.latitude}`);
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.push(`longitude out of range [-180, +180]: ${raw.longitude}`);
  }

  // 3. Validate Speed (km/h)
  const speed = Number(raw.speed ?? 0);
  if (isNaN(speed) || speed < 0) {
    errors.push(`speed must be non-negative: ${raw.speed}`);
  } else if (speed > 220) {
    errors.push(`speed exceeds maximum plausible threshold of 220 km/h: ${speed}`);
  }

  // 4. Validate Heading (0-360)
  const heading = Number(raw.heading ?? 0);
  if (isNaN(heading) || heading < 0 || heading > 360) {
    errors.push(`heading must be between 0 and 360 degrees: ${raw.heading}`);
  }

  // 5. Validate GPS Accuracy (meters)
  const accuracy = Number(raw.accuracy ?? 10);
  if (isNaN(accuracy) || accuracy <= 0) {
    errors.push(`accuracy must be positive: ${raw.accuracy}`);
  } else if (accuracy > 500) {
    errors.push(`GPS accuracy too degraded (> 500m): ${accuracy}m`);
  }

  // 6. Validate Timestamp (ms)
  const now = Date.now();
  const timestamp = Number(raw.timestamp || now);
  if (isNaN(timestamp)) {
    errors.push(`invalid timestamp: ${raw.timestamp}`);
  } else {
    const maxFuture = now + 180000; // 3 min forward tolerance for clock drift
    const maxPast = now - 7 * 24 * 60 * 60 * 1000; // 7 days historical tolerance
    if (timestamp > maxFuture) {
      errors.push(`timestamp is in the future: ${new Date(timestamp).toISOString()}`);
    } else if (timestamp < maxPast) {
      errors.push(`timestamp is older than maximum retention limit (7 days)`);
    }
  }

  // 7. Validate Status
  const validStatuses = ['MOVING', 'IDLE', 'STOPPED', 'OFFLINE', 'EMERGENCY', 'DELAYED', 'AT_RISK', 'DELIVERED'];
  const status = typeof raw.status === 'string' && validStatuses.includes(raw.status)
    ? raw.status as VehicleTelemetry['status']
    : (speed > 3 ? 'MOVING' : 'IDLE');

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const sanitized: VehicleTelemetry = {
    vehicle_id: String(raw.vehicle_id).trim(),
    latitude: Math.round(lat * 1000000) / 1000000,
    longitude: Math.round(lng * 1000000) / 1000000,
    speed: Math.round(speed * 10) / 10,
    heading: Math.round(heading),
    accuracy: Math.round(accuracy),
    timestamp,
    trip_id: typeof raw.trip_id === 'string' ? raw.trip_id.slice(0, 40) : undefined,
    driver_id: typeof raw.driver_id === 'string' ? raw.driver_id.slice(0, 40) : undefined,
    driver_name: typeof raw.driver_name === 'string' ? raw.driver_name.slice(0, 60) : undefined,
    status,
    is_queued_historical: Boolean(raw.is_queued_historical),
    source: raw.source === 'DEMO_SIMULATION' ? 'DEMO_SIMULATION' : 'REAL_DEVICE'
  };

  return { valid: true, errors: [], sanitizedTelemetry: sanitized };
}

/**
 * Calculates human-readable data freshness according to Section 15:
 * Examples:
 * LIVE — 4 sec ago
 * UPDATED — 2 min ago
 * STALE — 15 min ago
 * OFFLINE — 30 min ago
 * LAST KNOWN LOCATION (2 hours ago)
 */
export function calculateFreshness(lastUpdatedMs: number | string | undefined): {
  text: string;
  category: 'LIVE' | 'RECENT' | 'STALE' | 'OFFLINE';
  isLive: boolean;
  ageSeconds: number;
  lastKnownLocationLabel: string;
} {
  if (!lastUpdatedMs) {
    return {
      text: 'NO GPS DATA',
      category: 'OFFLINE',
      isLive: false,
      ageSeconds: Infinity,
      lastKnownLocationLabel: 'LAST KNOWN LOCATION (No fix recorded)',
    };
  }

  const timestamp = typeof lastUpdatedMs === 'string'
    ? new Date(lastUpdatedMs).getTime()
    : lastUpdatedMs;

  if (isNaN(timestamp) || timestamp <= 0) {
    return {
      text: 'INVALID TIMESTAMP',
      category: 'OFFLINE',
      isLive: false,
      ageSeconds: Infinity,
      lastKnownLocationLabel: 'LAST KNOWN LOCATION (Invalid timestamp)',
    };
  }

  const ageMs = Math.max(0, Date.now() - timestamp);
  const ageSec = Math.floor(ageMs / 1000);
  const min = Math.floor(ageSec / 60);
  const hrs = (min / 60).toFixed(1);
  const timeLabel = min >= 120 ? `${hrs} hrs ago` : `${min} min ago`;

  if (ageSec <= 15) {
    return {
      text: `LIVE — ${ageSec || 1} sec ago`,
      category: 'LIVE',
      isLive: true,
      ageSeconds: ageSec,
      lastKnownLocationLabel: `Live fix (${ageSec}s ago)`,
    };
  } else if (ageSec <= 60) {
    return {
      text: `RECENT — ${ageSec} sec ago`,
      category: 'RECENT',
      isLive: false,
      ageSeconds: ageSec,
      lastKnownLocationLabel: `Recent fix (${ageSec}s ago)`,
    };
  } else if (ageSec < 900) {
    return {
      text: `STALE — ${Math.max(1, min)} min ago`,
      category: 'STALE',
      isLive: false,
      ageSeconds: ageSec,
      lastKnownLocationLabel: `LAST KNOWN LOCATION (${min} min ago)`,
    };
  } else {
    return {
      text: `OFFLINE — ${timeLabel}`,
      category: 'OFFLINE',
      isLive: false,
      ageSeconds: ageSec,
      lastKnownLocationLabel: `LAST KNOWN LOCATION (${timeLabel})`,
    };
  }
}
