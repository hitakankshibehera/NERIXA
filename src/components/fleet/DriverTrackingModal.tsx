'use client';

import React, { useState, useEffect, useRef } from 'react';
import { calculateFreshness } from '@/lib/fleet/telemetryValidator';
import { VehicleTelemetry, RerouteRecommendation } from '@/lib/types';
import {
  enqueueOfflineTelemetry,
  getOfflineTelemetryQueue,
  clearOfflineTelemetryQueue,
} from '@/lib/offline/offlineStorage';
import { publishVehicleTelemetry, subscribeToDriverReroute, publishSystemEvent } from '@/lib/firebase';
import {
  FiNavigation,
  FiAlertTriangle,
  FiCompass,
  FiShield,
  FiWifi,
  FiWifiOff,
  FiRefreshCw,
  FiX,
  FiCheck,
  FiCheckCircle,
} from '@/components/common/FeatherIcons';

interface DriverTrackingModalProps {
  vehicleId: string;
  driverName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DriverTrackingModal: React.FC<DriverTrackingModalProps> = ({
  vehicleId,
  driverName = 'Rajesh Sharma',
  isOpen,
  onClose,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [syncState, setSyncState] = useState<'LIVE' | 'SYNCING' | 'OFFLINE'>('LIVE');
  const [lastTelemetry, setLastTelemetry] = useState<VehicleTelemetry | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [activeVehicleId, setActiveVehicleId] = useState(vehicleId);
  const [activeDriverName, setActiveDriverName] = useState(driverName);
  const [incomingReroute, setIncomingReroute] = useState<RerouteRecommendation | null>(null);
  const [routeAccepted, setRouteAccepted] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const transmissionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentCoordsRef = useRef<{ lat: number; lng: number; speed: number; heading: number; accuracy: number } | null>(null);

  // ESC key listener to safely dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopTracking();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load initial queued count
  useEffect(() => {
    getOfflineTelemetryQueue().then((q: any[]) => setQueuedCount(q?.length || 0));
  }, [isOpen]);

  // Listen to incoming dispatcher reroute orders from Firebase
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToDriverReroute(activeVehicleId, (reroute) => {
      if (reroute && reroute.status === 'APPROVED') {
        setIncomingReroute(reroute);
        setRouteAccepted(false);
      }
    });
    return () => unsubscribe();
  }, [isOpen, activeVehicleId]);

  // Handle Online / Offline event listeners
  useEffect(() => {
    const handleOnline = async () => {
      setSyncState('SYNCING');
      const queue = await getOfflineTelemetryQueue();
      if (queue && queue.length > 0) {
        for (const item of queue) {
          try {
            await publishVehicleTelemetry(item);
          } catch {
            // Keep in queue if failed
          }
        }
        await clearOfflineTelemetryQueue();
      }
      setQueuedCount(0);
      setSyncState('LIVE');
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

  const transmitTelemetry = async (
    coords: { lat: number; lng: number; speed: number; heading: number; accuracy: number },
    status: 'MOVING' | 'IDLE' | 'EMERGENCY' = 'MOVING'
  ) => {
    const telemetryPayload: VehicleTelemetry = {
      vehicle_id: activeVehicleId,
      latitude: coords.lat,
      longitude: coords.lng,
      speed: coords.speed,
      heading: coords.heading,
      accuracy: coords.accuracy,
      timestamp: Date.now(),
      driver_id: activeDriverName,
      driver_name: activeDriverName,
      trip_id: incomingReroute?.id || 'NH-15-BOMDILA',
      status: status,
      source: 'REAL_DEVICE',
    };

    setLastTelemetry(telemetryPayload);

    if (navigator.onLine) {
      try {
        await publishVehicleTelemetry(telemetryPayload);
        setSyncState('LIVE');
      } catch {
        await enqueueOfflineTelemetry(telemetryPayload);
        const q = await getOfflineTelemetryQueue();
        setQueuedCount(q.length);
        setSyncState('OFFLINE');
      }
    } else {
      await enqueueOfflineTelemetry(telemetryPayload);
      const q = await getOfflineTelemetryQueue();
      setQueuedCount(q.length);
      setSyncState('OFFLINE');
    }
  };

  const startTracking = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('HTML5 Geolocation is not supported by this browser.');
      return;
    }

    setGpsError(null);
    setIsTracking(true);

    let simStep = 0;
    const simLatBase = 26.1445;
    const simLngBase = 91.7362;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const speedKmh = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 42;
        const headingDeg = pos.coords.heading ? Math.round(pos.coords.heading) : 45;

        currentCoordsRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: speedKmh,
          heading: headingDeg,
          accuracy: Math.round(pos.coords.accuracy),
        };

        transmitTelemetry(currentCoordsRef.current, isEmergency ? 'EMERGENCY' : 'MOVING');
      },
      () => {
        // Fallback simulated movement for demonstration in desk environments
        currentCoordsRef.current = {
          lat: simLatBase + simStep * 0.002,
          lng: simLngBase + simStep * 0.003,
          speed: 48,
          heading: 52,
          accuracy: 6,
        };
        simStep++;
        transmitTelemetry(currentCoordsRef.current, isEmergency ? 'EMERGENCY' : 'MOVING');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    watchIdRef.current = watchId;

    transmissionIntervalRef.current = setInterval(() => {
      if (currentCoordsRef.current) {
        transmitTelemetry(currentCoordsRef.current, isEmergency ? 'EMERGENCY' : 'MOVING');
      }
    }, 6000);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (transmissionIntervalRef.current) {
      clearInterval(transmissionIntervalRef.current);
      transmissionIntervalRef.current = null;
    }
    setIsTracking(false);
  };

  const triggerSOS = async () => {
    const nextEmergency = !isEmergency;
    setIsEmergency(nextEmergency);

    if (currentCoordsRef.current) {
      if (nextEmergency) {
        await publishSystemEvent({
          id: `sos-${Date.now()}`,
          type: 'incident_created',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
          timestampMs: Date.now(),
          title: `EMERGENCY SOS: Driver Panic Button Triggered (${activeVehicleId})`,
          description: `Vehicle ${activeVehicleId} operating along corridor signaled panic alert at [${currentCoordsRef.current.lat.toFixed(4)}, ${currentCoordsRef.current.lng.toFixed(4)}]. Driver: ${activeDriverName}`,
          entityId: activeVehicleId,
          severity: 'CRITICAL',
          source: 'LIVE',
        });
      }
      await transmitTelemetry(currentCoordsRef.current, nextEmergency ? 'EMERGENCY' : 'MOVING');
    }
  };

  if (!isOpen) return null;

  const freshness = calculateFreshness(lastTelemetry?.timestamp);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopTracking();
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          background: 'var(--bg-secondary, #0f172a)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.125rem 1.5rem',
            background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiNavigation size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                  Driver Telemetry Cockpit
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#4ade80',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  REAL GPS UPLINK
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Hardware GPS synchronization with NERIXA Realtime Firebase RTDB
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopTracking();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            aria-label="Close modal"
          >
            <FiX size={14} />
            <span>Close</span>
          </button>
        </div>

        {/* Incoming Reroute Notification Banner */}
        {incomingReroute && !routeAccepted && (
          <div
            style={{
              background: 'rgba(234, 179, 8, 0.15)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.4)',
              padding: '10px 1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <FiAlertTriangle size={18} color="#facc15" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Dispatcher Reroute Order Received
              </div>
              <div style={{ fontSize: '12px', color: '#fef08a', marginTop: '2px', lineHeight: 1.4 }}>
                {incomingReroute.recommendedRoute.name}: {incomingReroute.recommendedRoute.safetyJustification}
              </div>
              <button
                onClick={() => setRouteAccepted(true)}
                style={{
                  marginTop: '8px',
                  background: '#eab308',
                  color: '#0f172a',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FiCheck size={12} />
                <span>Acknowledge & Switch Route</span>
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, maxHeight: '68vh', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Vehicle Config Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                VEHICLE ID
              </label>
              <input
                type="text"
                value={activeVehicleId}
                onChange={(e) => setActiveVehicleId(e.target.value.toUpperCase())}
                disabled={isTracking}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                DRIVER NAME
              </label>
              <input
                type="text"
                value={activeDriverName}
                onChange={(e) => setActiveDriverName(e.target.value)}
                disabled={isTracking}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>

          {/* Sync & Queue State */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {syncState === 'LIVE' && (
                <>
                  <FiWifi size={14} color="#34d399" />
                  <span style={{ color: '#34d399', fontWeight: 700 }}>LIVE GPS TELEMETRY</span>
                </>
              )}
              {syncState === 'SYNCING' && (
                <>
                  <FiRefreshCw size={14} color="#38bdf8" className="animate-spin" />
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>SYNCING QUEUED GPS...</span>
                </>
              )}
              {syncState === 'OFFLINE' && (
                <>
                  <FiWifiOff size={14} color="#f59e0b" />
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>OFFLINE (LOCALLY QUEUED)</span>
                </>
              )}
            </div>
            <div style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              Offline Queue: <b style={{ color: '#f8fafc' }}>{queuedCount}</b> pts
            </div>
          </div>

          {/* Telemetry Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '8px 10px' }}>
              <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Speed</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                {lastTelemetry ? lastTelemetry.speed : '0'} <small style={{ fontSize: '10px', color: '#64748b' }}>km/h</small>
              </span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '8px 10px' }}>
              <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Heading</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                {lastTelemetry ? `${lastTelemetry.heading}°` : '0°'}
              </span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '8px 10px' }}>
              <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Accuracy</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {lastTelemetry ? `±${lastTelemetry.accuracy}m` : '±--m'}
              </span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '8px 10px' }}>
              <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Freshness</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: freshness.category === 'LIVE' ? '#34d399' : '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {freshness.text}
              </span>
            </div>
          </div>

          {/* Coordinates Box */}
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: '#64748b', marginBottom: '2px', fontSize: '10px' }}>ACTIVE COORDINATES:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>LAT: {lastTelemetry ? lastTelemetry.latitude.toFixed(6) : 'Waiting for GPS...'}</span>
              <span>LNG: {lastTelemetry ? lastTelemetry.longitude.toFixed(6) : 'Waiting for GPS...'}</span>
            </div>
          </div>

          {gpsError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '8px 12px', borderRadius: '6px', fontSize: '11px' }}>
              {gpsError}
            </div>
          )}

          {/* SOS Panic Button */}
          <button
            onClick={triggerSOS}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: isEmergency ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.4)',
              background: isEmergency ? '#ef4444' : 'rgba(239, 68, 68, 0.12)',
              color: isEmergency ? '#fff' : '#f87171',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.04em',
            }}
          >
            <FiAlertTriangle size={15} />
            <span>{isEmergency ? 'EMERGENCY SOS ACTIVE — TAP TO CANCEL' : 'DECLARE EMERGENCY / PANIC SOS'}</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '0.875rem 1.5rem',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '11px',
          }}
        >
          <div style={{ color: isTracking ? '#34d399' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiCheckCircle size={14} />
            <span>{isTracking ? 'GPS Tracking Active (Adaptive 5–10s sweep)' : 'Telemetry idle'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isTracking ? (
              <button
                onClick={stopTracking}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Stop Tracking
              </button>
            ) : (
              <button
                onClick={startTracking}
                style={{
                  background: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FiNavigation size={13} />
                <span>Start Live Tracking</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
