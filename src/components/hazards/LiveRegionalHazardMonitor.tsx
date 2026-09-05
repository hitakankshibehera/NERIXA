'use client';

import React, { useState } from 'react';
import {
  LiveFloodZone,
  LiveBridgeStatus,
  LiveAccidentAlert,
  LiveHighwayStatus,
} from '@/lib/hazards/liveHazardFeed';

interface LiveRegionalHazardMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  floods: LiveFloodZone[];
  bridges: LiveBridgeStatus[];
  accidents: LiveAccidentAlert[];
  highways: LiveHighwayStatus[];
  onLocateOnMap: (target: {
    lat: number;
    lng: number;
    title: string;
    category: 'FLOOD' | 'BRIDGE' | 'ACCIDENT' | 'HIGHWAY';
    details: string;
    percentage?: number;
  }) => void;
  lastUpdatedSecondsAgo: number;
}

export default function LiveRegionalHazardMonitor({
  isOpen,
  onClose,
  floods,
  bridges,
  accidents,
  highways,
  onLocateOnMap,
  lastUpdatedSecondsAgo,
}: LiveRegionalHazardMonitorProps) {
  const [activeTab, setActiveTab] = useState<'FLOOD' | 'BRIDGE' | 'ACCIDENT' | 'HIGHWAY'>('FLOOD');

  if (!isOpen) return null;

  const criticalFloodCount = floods.filter(f => f.floodPercentage >= 80).length;
  const criticalBridgeCount = bridges.filter(b => b.condition === 'COLLAPSED' || b.condition === 'SCOUR_CRITICAL').length;
  const majorAccidentCount = accidents.filter(a => a.severity === 'MAJOR' || a.severity === 'FATAL').length;
  const blockedHighwayCount = highways.filter(h => h.status === 'BLOCKED').length;

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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          background: 'var(--bg-secondary, #0f172a)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
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
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              📡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                  NER LIVE DISASTER & TRANSPORTATION MONITOR
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#f87171',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.2s infinite' }} />
                  LIVE REAL-TIME TELEMETRY
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Central Water Commission (CWC) • NHAI • Border Roads Organisation • SDRF Ground Units
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)' }}>
              ⚡ Sync: <b style={{ color: '#f8fafc' }}>{lastUpdatedSecondsAgo}s ago</b>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
              }}
              aria-label="Close modal"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.5rem 1.25rem 0',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('FLOOD')}
            style={{
              padding: '0.625rem 1.125rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: activeTab === 'FLOOD' ? '3px solid #38bdf8' : '3px solid transparent',
              background: activeTab === 'FLOOD' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              color: activeTab === 'FLOOD' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🌊 Floods & Inundation</span>
            <span style={{ padding: '2px 6px', borderRadius: '10px', background: '#38bdf825', fontSize: '11px', color: '#38bdf8' }}>
              {floods.length} ({criticalFloodCount} Critical)
            </span>
          </button>

          <button
            onClick={() => setActiveTab('BRIDGE')}
            style={{
              padding: '0.625rem 1.125rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: activeTab === 'BRIDGE' ? '3px solid #f97316' : '3px solid transparent',
              background: activeTab === 'BRIDGE' ? 'rgba(249, 115, 22, 0.12)' : 'transparent',
              color: activeTab === 'BRIDGE' ? '#fb923c' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🌉 Bridge Collapses & Health</span>
            <span style={{ padding: '2px 6px', borderRadius: '10px', background: '#f9731625', fontSize: '11px', color: '#fb923c' }}>
              {bridges.length} ({criticalBridgeCount} Alert)
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ACCIDENT')}
            style={{
              padding: '0.625rem 1.125rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: activeTab === 'ACCIDENT' ? '3px solid #ef4444' : '3px solid transparent',
              background: activeTab === 'ACCIDENT' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
              color: activeTab === 'ACCIDENT' ? '#f87171' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🚨 Accidents & Collisions</span>
            <span style={{ padding: '2px 6px', borderRadius: '10px', background: '#ef444425', fontSize: '11px', color: '#f87171' }}>
              {accidents.length} ({majorAccidentCount} Blocked)
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HIGHWAY')}
            style={{
              padding: '0.625rem 1.125rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: activeTab === 'HIGHWAY' ? '3px solid #22c55e' : '3px solid transparent',
              background: activeTab === 'HIGHWAY' ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
              color: activeTab === 'HIGHWAY' ? '#4ade80' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🛣️ National Highways</span>
            <span style={{ padding: '2px 6px', borderRadius: '10px', background: '#22c55e25', fontSize: '11px', color: '#4ade80' }}>
              {highways.length} ({blockedHighwayCount} Closed)
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: FLOODS */}
          {activeTab === 'FLOOD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                Real-time hydrographic gauge telemetry across the Brahmaputra, Barak, and Teesta river basins. Click <b>Locate on Map</b> to center and view the affected corridor.
              </div>

              {floods.map((flood) => {
                const isCritical = flood.floodPercentage >= 80;
                return (
                  <div
                    key={flood.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.25)'}`,
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>🌊</span>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>
                            {flood.name}
                          </span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                              color: isCritical ? '#fca5a5' : '#fde047',
                            }}
                          >
                            {flood.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          Highway: <b style={{ color: '#38bdf8' }}>{flood.highway}</b> • State: {flood.state} ({flood.district})
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onLocateOnMap({
                            lat: flood.location.lat,
                            lng: flood.location.lng,
                            title: flood.name,
                            category: 'FLOOD',
                            details: `Flood Level: ${flood.floodPercentage}% (${flood.waterLevelMeters > 0 ? '+' : ''}${flood.waterLevelMeters}m above danger mark). ${flood.divertedRoute}`,
                            percentage: flood.floodPercentage,
                          });
                          onClose();
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                          color: '#38bdf8',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📍 Locate on Map
                      </button>
                    </div>

                    {/* Flood Inundation Progress Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#cbd5e1', fontWeight: 600 }}>Inundation Severity:</span>
                        <span style={{ fontWeight: 800, color: isCritical ? '#f87171' : '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                          {flood.floodPercentage}% INUNDATED ({flood.trend})
                        </span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${flood.floodPercentage}%`,
                            height: '100%',
                            background: isCritical
                              ? 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)'
                              : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '8px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b' }}>Water Level:</span>{' '}
                        <b style={{ color: '#f8fafc' }}>
                          {flood.currentLevelMeters} m ({flood.waterLevelMeters > 0 ? `+${flood.waterLevelMeters}m` : `${flood.waterLevelMeters}m`} vs Danger)
                        </b>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Precipitation:</span>{' '}
                        <b style={{ color: '#38bdf8' }}>{flood.rainfallRateMmPerHour} mm/hr</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Submerged Stretch:</span>{' '}
                        <b style={{ color: '#f87171' }}>{flood.affectedRoadLengthKm} km</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Telemetry Gauge:</span>{' '}
                        <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{flood.sensorId}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#fb923c' }}>
                      <b>DIVERSION:</b> {flood.divertedRoute}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: BRIDGES */}
          {activeTab === 'BRIDGE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                Ultrasonic acoustic scour sensors, piezoelectric vibration accelerometers, and live structural health telemetry across major river crossings.
              </div>

              {bridges.map((bridge) => {
                const isCollapsed = bridge.condition === 'COLLAPSED';
                const isScour = bridge.condition === 'SCOUR_CRITICAL';
                return (
                  <div
                    key={bridge.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: `1px solid ${
                        isCollapsed
                          ? 'rgba(239, 68, 68, 0.45)'
                          : isScour
                          ? 'rgba(249, 115, 22, 0.35)'
                          : 'rgba(16, 185, 129, 0.25)'
                      }`,
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>🌉</span>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>
                            {bridge.name}
                          </span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: isCollapsed
                                ? 'rgba(239, 68, 68, 0.25)'
                                : isScour
                                ? 'rgba(249, 115, 22, 0.25)'
                                : 'rgba(34, 197, 94, 0.2)',
                              color: isCollapsed ? '#fca5a5' : isScour ? '#fdba74' : '#86efac',
                            }}
                          >
                            {bridge.condition.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          River: <b style={{ color: '#38bdf8' }}>{bridge.river}</b> • Highway: {bridge.highway} • Built: {bridge.builtYear}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onLocateOnMap({
                            lat: bridge.location.lat,
                            lng: bridge.location.lng,
                            title: bridge.name,
                            category: 'BRIDGE',
                            details: `Condition: ${bridge.condition}. ${bridge.description} ${bridge.diversion}`,
                            percentage: bridge.healthPercentage,
                          });
                          onClose();
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(249, 115, 22, 0.15)',
                          border: '1px solid rgba(249, 115, 22, 0.4)',
                          color: '#fb923c',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📍 Locate on Map
                      </button>
                    </div>

                    <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4 }}>
                      {bridge.description}
                    </p>

                    {/* Structural Health Meter */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#cbd5e1' }}>Structural Health Integrity:</span>
                        <span style={{ fontWeight: 800, color: isCollapsed ? '#ef4444' : isScour ? '#f97316' : '#22c55e', fontFamily: 'var(--font-mono)' }}>
                          {bridge.healthPercentage}% INTEGRITY
                        </span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${bridge.healthPercentage}%`,
                            height: '100%',
                            background: isCollapsed
                              ? '#ef4444'
                              : isScour
                              ? '#f97316'
                              : '#22c55e',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '8px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b' }}>Pier Telemetry:</span>{' '}
                        <b style={{ color: isCollapsed || isScour ? '#fca5a5' : '#86efac' }}>{bridge.pierStatus}</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Max Load Capacity:</span>{' '}
                        <b style={{ color: '#f8fafc' }}>{bridge.loadCapacityTons > 0 ? `${bridge.loadCapacityTons} Tons` : '0 Tons (CLOSED)'}</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Sensor Unit:</span>{' '}
                        <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{bridge.sensorId}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#fca5a5' }}>
                      <b>EMERGENCY DIVERSION:</b> {bridge.diversion}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: ACCIDENTS */}
          {activeTab === 'ACCIDENT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                Active highway collision alerts, vehicle pileups, tanker leaks, and live clearance response teams.
              </div>

              {accidents.map((accident) => {
                const isMajor = accident.severity === 'MAJOR' || accident.severity === 'FATAL';
                return (
                  <div
                    key={accident.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: `1px solid ${isMajor ? 'rgba(239, 68, 68, 0.4)' : 'rgba(234, 179, 8, 0.3)'}`,
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>🚨</span>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>
                            {accident.title}
                          </span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: 'rgba(239, 68, 68, 0.25)',
                              color: '#fca5a5',
                            }}
                          >
                            {accident.severity} ACCIDENT
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          Location: <b style={{ color: '#f87171' }}>{accident.highway}</b> ({accident.locationName}, {accident.state})
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onLocateOnMap({
                            lat: accident.location.lat,
                            lng: accident.location.lng,
                            title: accident.title,
                            category: 'ACCIDENT',
                            details: `${accident.lanesBlocked}. Vehicles: ${accident.vehiclesInvolved}. Emergency Units: ${accident.emergencyUnits.join(', ')}. Clearance ETA: ~${accident.clearanceEtaMinutes} mins. Alternate: ${accident.alternateRoute}`,
                            percentage: accident.blockagePercentage,
                          });
                          onClose();
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#f87171',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📍 Locate on Map
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '8px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b' }}>Lanes Blocked:</span>{' '}
                        <b style={{ color: '#f87171' }}>{accident.lanesBlocked}</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Clearance ETA:</span>{' '}
                        <b style={{ color: '#facc15' }}>~{accident.clearanceEtaMinutes} mins remaining</b>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Vehicles Involved:</span>{' '}
                        <span style={{ color: '#f8fafc' }}>{accident.vehiclesInvolved}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Casualties / Triage:</span>{' '}
                        <span style={{ color: '#cbd5e1' }}>{accident.casualties}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                        Dispatched First Responders:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {accident.emergencyUnits.map((u, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(56, 189, 248, 0.12)',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              color: '#38bdf8',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                            }}
                          >
                            🚑 {u}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#facc15' }}>
                      <b>RECOMMENDED DETOUR:</b> {accident.alternateRoute}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: HIGHWAYS */}
          {activeTab === 'HIGHWAY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                Real-time condition, vehicle velocity, and disruption telemetry for arterial National Highways across the North Eastern Region.
              </div>

              {highways.map((highway) => {
                const isBlocked = highway.status === 'BLOCKED';
                const isCaution = highway.status === 'CAUTION' || highway.status === 'RESTRICTED';
                const statusColor = isBlocked ? '#ef4444' : isCaution ? '#f97316' : '#22c55e';

                return (
                  <div
                    key={highway.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.025)',
                      border: `1px solid ${statusColor}40`,
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              background: '#1e293b',
                              border: `1px solid ${statusColor}`,
                              color: statusColor,
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {highway.highway}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>
                            {highway.name}
                          </span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: `${statusColor}25`,
                              color: statusColor,
                            }}
                          >
                            {highway.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          Sector: {highway.sector}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onLocateOnMap({
                            lat: highway.location.lat,
                            lng: highway.location.lng,
                            title: `${highway.highway} - ${highway.name}`,
                            category: 'HIGHWAY',
                            details: `Status: ${highway.status}. Speed: ${highway.averageSpeedKmh} km/h (Normal: ${highway.normalSpeedKmh} km/h). Delay: +${highway.delaysMinutes} mins. ${highway.recommendedAction}`,
                            percentage: highway.currentRisk,
                          });
                          onClose();
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: `${statusColor}15`,
                          border: `1px solid ${statusColor}40`,
                          color: statusColor,
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📍 Locate on Map
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '8px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b' }}>Current Speed:</span>{' '}
                        <b style={{ color: highway.averageSpeedKmh < 30 ? '#f87171' : '#f8fafc' }}>
                          {highway.averageSpeedKmh} km/h
                        </b>{' '}
                        <span style={{ color: '#64748b', fontSize: '10px' }}>(avg {highway.normalSpeedKmh})</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Traffic Delay:</span>{' '}
                        <b style={{ color: highway.delaysMinutes > 30 ? '#facc15' : '#86efac' }}>
                          +{highway.delaysMinutes} mins
                        </b>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Hazard Risk Index:</span>{' '}
                        <b style={{ color: statusColor }}>{highway.currentRisk} / 100</b>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                        Active Highway Obstructions:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '11px', color: '#cbd5e1' }}>
                        {highway.activeDisruptions.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                      <b>AI ADVISORY:</b> {highway.recommendedAction}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
            color: '#64748b',
          }}
        >
          <div>
            Data sources synchronized: Central Water Commission • Assam ASDMA • BRO Arunank • NHAI
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#38bdf8',
              color: '#0f172a',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '6px',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Return to Command Center
          </button>
        </div>
      </div>
    </div>
  );
}
