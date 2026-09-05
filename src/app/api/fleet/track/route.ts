import { NextRequest, NextResponse } from 'next/server';
import { validateTelemetry } from '@/lib/fleet/telemetryValidator';
import { publishVehicleTelemetry, publishSystemEvent } from '@/lib/firebase';
import { LiveSystemEvent } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate incoming GPS telemetry strictly (Section 20 Security & Data Quality)
    const validation = validateTelemetry(body);
    if (!validation.valid || !validation.sanitizedTelemetry) {
      return NextResponse.json(
        { error: 'Invalid telemetry payload', details: validation.errors },
        { status: 400 }
      );
    }

    const telemetry = validation.sanitizedTelemetry;

    // 2. Publish to backend / Firebase Realtime Database (Section 1)
    await publishVehicleTelemetry(telemetry);

    // 3. Trigger immediate system event if emergency or critical state
    if (telemetry.status === 'EMERGENCY') {
      const emergencyEvent: LiveSystemEvent = {
        id: `evt-emg-${telemetry.vehicle_id}-${Date.now()}`,
        type: 'vehicle_emergency',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        timestampMs: Date.now(),
        title: `EMERGENCY ALERT: ${telemetry.vehicle_id}`,
        description: `Vehicle ${telemetry.vehicle_id} declared PANIC / EMERGENCY at [${telemetry.latitude.toFixed(4)}, ${telemetry.longitude.toFixed(4)}]. Speed: ${telemetry.speed} km/h`,
        entityId: telemetry.vehicle_id,
        severity: 'CRITICAL',
        source: telemetry.source === 'DEMO_SIMULATION' ? 'DEMO' : 'LIVE',
        metadata: {
          lat: telemetry.latitude,
          lng: telemetry.longitude,
          speed: telemetry.speed,
        },
      };
      await publishSystemEvent(emergencyEvent);
    }

    return NextResponse.json({
      success: true,
      vehicle_id: telemetry.vehicle_id,
      timestamp: telemetry.timestamp,
      status: telemetry.status,
    });
  } catch (error: unknown) {
    console.error('Fleet track ingestion error:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
