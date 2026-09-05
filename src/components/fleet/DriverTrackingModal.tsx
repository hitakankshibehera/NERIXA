'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VehicleTelemetry, VehicleStatus, RerouteRecommendation } from '@/lib/types';
import { validateTelemetry, calculateFreshness } from '@/lib/fleet/telemetryValidator';
import { enqueueOfflineTelemetry, flushOfflineQueue, getQueuedTelemetry, SyncState } from '@/lib/fleet/offlineGpsQueue';
import { publishVehicleTelemetry, subscribeToDriverReroute, publishSystemEvent } from '@/lib/firebase';
import { FiNavigation, FiAlertTriangle, FiCheckCircle, FiWifi, FiWifiOff, FiRefreshCw, FiCompass, FiShield, FiX, FiCheck } from '@/components/common/FeatherIcons';

interface DriverTrackingProps {
  vehicleId?: string;
  driverName?: string;
  isOpen: boolean;
  onClose: () => void;
  onTelemetrySent?: (telemetry: VehicleTelemetry) => void;
}

export const DriverTrackingModal: React.FC<DriverTrackingProps> = ({
  vehicleId = 'TRK-102',
  driverName = 'Rajesh Sharma',
  isOpen,
  onClose,
  onTelemetrySent,
}) => {
  const [activeVehicleId, setActiveVehicleId] = useState(vehicleId);
  const [activeDriverName, setActiveDriverName] = useState(driverName);
  const [isTracking, setIsTracking] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('LIVE');
  const [queuedCount, setQueuedCount] = useState(0);
  const [lastTelemetry, setLastTelemetry] = useState<VehicleTelemetry | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [incomingReroute, setIncomingReroute] = useState<RerouteRecommendation | null>(null);
  const [routeAccepted, setRouteAccepted] = useState(false);

  // Watch position and timing refs
  const watchIdRef = useRef<number | null>(null);
  const lastTransmitTimeRef = useRef<number>(0);
  const currentCoordsRef = useRef<{ lat: number; lng: number; speed: number; heading: number; accuracy: number } | null>(null);

  // Check offline queue count on mount
  useEffect(() => {
    getQueuedTelemetry().then((items) => setQueuedCount(items.length));
  }, []);

  // Monitor online / offline state
  useEffect(() => {
    const handleOnline = async () => {
      setSyncState('SYNCING');
      try {
        const res = await flushOfflineQueue(async (item) => {
          return await publishVehicleTelemetry(item);
        });
        setQueuedCount(res.remainingCount);
        setSyncState('LIVE');
      } catch {
        setSyncState('LIVE');
      }
    };

    const handleOffline = () => {
      setSyncState('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to driver reroute updates from Operator (Section 23 Step 11)
  useEffect(() => {
    const unsubscribe = subscribeToDriverReroute(activeVehicleId, (rec) => {
      if (rec && rec.status === 'APPROVED' && !routeAccepted) {
        setIncomingReroute(rec);
      }
    });
    return () => unsubscribe();
  }, [activeVehicleId, routeAccepted]);

  // Transmit telemetry to backend / Firebase with adaptive interval
  const transmitTelemetry = useCallback(
    async (
      coords: { lat: number; lng: number; speed: number; heading: number; accuracy: number },
      overrideStatus?: VehicleStatus
    ) => {
      const now = Date.now();
      const speedKmH = coords.speed ? coords.speed * 3.6 : 0; // m/s to km/h
      const status: VehicleStatus = overrideStatus || (isEmergency ? 'EMERGENCY' : speedKmH > 3 ? 'MOVING' : 'IDLE');

      const rawTelemetry: VehicleTelemetry = {
        vehicle_id: activeVehicleId,
        latitude: coords.lat,
        longitude: coords.lng,
        speed: Math.round(speedKmH * 10) / 10,
        heading: Math.round(coords.heading || 0),
        accuracy: Math.round(coords.accuracy || 10),
        timestamp: now,
        trip_id: `TRIP-${activeVehicleId}-01`,
        driver_id: 'DRV-902',
        driver_name: activeDriverName,
        status,
        source: 'REAL_DEVICE',
      };

      const validation = validateTelemetry(rawTelemetry);
      if (!validation.valid || !validation.sanitizedTelemetry) {
        console.warn('GPS Telemetry validation warning:', validation.errors);
        return;
      }

      const telemetry = validation.sanitizedTelemetry;
      setLastTelemetry(telemetry);
      onTelemetrySent?.(telemetry);

      // Check network connectivity
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncState('OFFLINE');
        const qSize = await enqueueOfflineTelemetry(telemetry);
        setQueuedCount(qSize);
        return;
      }

      try {
        setSyncState('LIVE');
        await publishVehicleTelemetry(telemetry);

        // Also broadcast location update event occasionally
        if (overrideStatus === 'EMERGENCY') {
          await publishSystemEvent({
            id: `evt-emg-${telemetry.vehicle_id}-${Date.now()}`,
            type: 'vehicle_emergency',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
            timestampMs: Date.now(),
            title: `SOS TRIGGERED: ${telemetry.vehicle_id}`,
            description: `Driver ${activeDriverName} sent EMERGENCY PANIC signal at [${telemetry.latitude.toFixed(4)}, ${telemetry.longitude.toFixed(4)}]`,
            entityId: telemetry.vehicle_id,
            severity: 'CRITICAL',
            source: 'LIVE',
          });
        }
      } catch (err) {
        console.warn('Network sync failed, queuing offline:', err);
        setSyncState('OFFLINE');
        const qSize = await enqueueOfflineTelemetry(telemetry);
        setQueuedCount(qSize);
      }
    },
    [activeVehicleId, activeDriverName, isEmergency, onTelemetrySent]
  );

  // Start GPS Geolocation tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser/device.');
      return;
    }

    setGpsError(null);
    setIsTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed || 0,
          heading: pos.coords.heading || 0,
          accuracy: pos.coords.accuracy || 10,
        };
        currentCoordsRef.current = coords;

        const now = Date.now();
        // Section 2: Adaptive update frequency:
        // 5-10s while moving (> 3 km/h), 25s while idle
        const speedKmH = (coords.speed || 0) * 3.6;
        const requiredIntervalMs = speedKmH > 3 ? 5000 : 25000;

        if (now - lastTransmitTimeRef.current >= requiredIntervalMs) {
          lastTransmitTimeRef.current = now;
          transmitTelemetry(coords);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        let msg = 'Failed to obtain GPS fix.';
        if (err.code === 1) msg = 'Location permission denied. Please allow GPS access.';
        if (err.code === 2) msg = 'Position unavailable. Check GPS satellite signal.';
        if (err.code === 3) msg = 'GPS request timed out.';
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );

    watchIdRef.current = watchId;
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  // Toggle Emergency SOS
  const triggerSOS = async () => {
    const nextEmergency = !isEmergency;
    setIsEmergency(nextEmergency);

    if (currentCoordsRef.current) {
      await transmitTelemetry(currentCoordsRef.current, nextEmergency ? 'EMERGENCY' : 'MOVING');
    }
  };

  if (!isOpen) return null;

  const freshness = calculateFreshness(lastTelemetry?.timestamp);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-neutral-800 to-neutral-850 border-b border-neutral-700/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FiNavigation className={`w-4 h-4 sm:w-5 sm:h-5 ${isTracking ? 'animate-pulse text-emerald-400' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base text-white truncate">
                  Driver Telemetry Cockpit
                </h3>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium border border-emerald-500/30 shrink-0">
                  REAL GPS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">Hardware GPS sync → NERIXA RTDB</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopTracking();
              onClose();
            }}
            aria-label="Close modal"
            className="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition shrink-0"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Incoming Reroute Notification Banner (Section 23 Step 11) */}
        {incomingReroute && !routeAccepted && (
          <div className="bg-amber-950/80 border-b border-amber-500/50 p-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Dispatcher Reroute Order Approved
                </h4>
                <p className="text-xs text-amber-200/90 mt-1">
                  {incomingReroute.recommendedRoute.name}: {incomingReroute.recommendedRoute.safetyJustification}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setRouteAccepted(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
                  >
                    <FiCheck className="w-4 h-4" /> Acknowledge & Switch Route
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto max-h-[80vh] flex-1 overscroll-contain">
          {/* Vehicle Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Vehicle ID
              </label>
              <input
                type="text"
                value={activeVehicleId}
                onChange={(e) => setActiveVehicleId(e.target.value.toUpperCase())}
                disabled={isTracking}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={activeDriverName}
                onChange={(e) => setActiveDriverName(e.target.value)}
                disabled={isTracking}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Sync & Connectivity Status Indicator (Section 21) */}
          <div className="flex items-center justify-between p-3 bg-neutral-800/60 border border-neutral-700/60 rounded-xl">
            <div className="flex items-center gap-2.5">
              {syncState === 'LIVE' && (
                <>
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <FiWifi className="w-3.5 h-3.5" /> LIVE TELEMETRY
                  </span>
                </>
              )}
              {syncState === 'SYNCING' && (
                <>
                  <FiRefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span className="text-xs font-semibold text-blue-400">SYNCING QUEUED GPS...</span>
                </>
              )}
              {syncState === 'OFFLINE' && (
                <>
                  <FiWifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">OFFLINE (QUEUEING LOCALLY)</span>
                </>
              )}
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-neutral-400">
                Offline Queue: <b className="text-white">{queuedCount}</b> pts
              </span>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl">
              <span className="text-[10px] text-neutral-400 uppercase font-medium block">Speed</span>
              <span className="text-lg font-mono font-bold text-white mt-0.5 block">
                {lastTelemetry ? `${lastTelemetry.speed} ` : '0.0 '}
                <span className="text-xs font-normal text-neutral-400">km/h</span>
              </span>
            </div>
            <div className="p-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl">
              <span className="text-[10px] text-neutral-400 uppercase font-medium block flex items-center gap-1">
                <FiCompass className="w-3 h-3" /> Heading
              </span>
              <span className="text-lg font-mono font-bold text-white mt-0.5 block">
                {lastTelemetry ? `${lastTelemetry.heading}°` : '0°'}
              </span>
            </div>
            <div className="p-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl">
              <span className="text-[10px] text-neutral-400 uppercase font-medium block flex items-center gap-1">
                <FiShield className="w-3 h-3" /> Accuracy
              </span>
              <span className="text-lg font-mono font-bold text-white mt-0.5 block">
                {lastTelemetry ? `±${lastTelemetry.accuracy}m` : '±--m'}
              </span>
            </div>
            <div className="p-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl">
              <span className="text-[10px] text-neutral-400 uppercase font-medium block">Freshness</span>
              <span
                className={`text-xs font-mono font-semibold mt-1.5 block ${
                  freshness.category === 'LIVE'
                    ? 'text-emerald-400'
                    : freshness.category === 'UPDATED'
                    ? 'text-blue-400'
                    : 'text-neutral-400'
                }`}
              >
                {freshness.text}
              </span>
            </div>
          </div>

          {/* Current GPS Coordinates */}
          <div className="p-3 bg-neutral-800/40 border border-neutral-700/50 rounded-xl">
            <span className="text-[10px] text-neutral-400 uppercase font-medium block mb-1">
              Active Geolocation Coordinates
            </span>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-300">
              <span>LAT: {lastTelemetry ? lastTelemetry.latitude.toFixed(6) : 'Waiting for GPS...'}</span>
              <span>LNG: {lastTelemetry ? lastTelemetry.longitude.toFixed(6) : 'Waiting for GPS...'}</span>
            </div>
          </div>

          {/* GPS Error Alert */}
          {gpsError && (
            <div className="p-3 bg-rose-950/60 border border-rose-600/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* SOS Panic Button (Section 1) */}
          <div className="pt-2">
            <button
              onClick={triggerSOS}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition ${
                isEmergency
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-rose-400 border border-rose-500/40'
              }`}
            >
              <FiAlertTriangle className="w-4 h-4" />
              {isEmergency ? 'EMERGENCY ACTIVE — TAP TO CANCEL' : 'DECLARE EMERGENCY / PANIC SOS'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            {isTracking ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5" /> GPS Active (5–10s adaptive interval)
              </span>
            ) : (
              <span>Tracking inactive</span>
            )}
          </div>

          <div className="flex gap-2">
            {isTracking ? (
              <button
                onClick={stopTracking}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition"
              >
                Stop Tracking
              </button>
            ) : (
              <button
                onClick={startTracking}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <FiNavigation className="w-3.5 h-3.5" /> Start Live Tracking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
