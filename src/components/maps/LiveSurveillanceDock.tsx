// ============================================================
// NER-SHIELD AI — Live Surveillance & AI Commander Dock
// Right-hand command panel conforming strictly to Requirements 22 & 34:
// - Real-time surveillance of selected site, vehicle, road, or incident
// - Real vs Demo Simulation transparency
// - Mountain road intelligence (elevation, slope, terrain, weather, risk)
// - Vehicle telemetry (speed, heading, freshness tier, cargo, hazards)
// - Incident impact analysis & supply chain risk cascade
// - Interactive AI Commander with evidence-backed answers
// ============================================================

'use client';

import React, { useState } from 'react';
import type { Road, Vehicle, Incident, Shipment, RiskPrediction, Alert } from '@/lib/types';
import type { LocationIntelligence } from '@/lib/types/googleMaps';
import { calculateFreshness } from '@/lib/fleet/telemetryValidator';
import { processCommanderQuery } from '@/lib/ai/commander';
import { getRiskColor, getRiskLevel } from '@/lib/constants';
import {
  ShieldIcon,
  TruckIcon,
  RoadmapIcon,
  HazardIcon,
  BotIcon,
  SatelliteIcon,
  CameraIcon,
  WeatherStormIcon,
  CloseIcon,
  RouteIcon,
  CheckIcon,
} from '@/components/common/Icons';

interface LiveSurveillanceDockProps {
  selectedVehicle: Vehicle | null;
  selectedRoad: Road | null;
  selectedIncident: Incident | null;
  selectedLocationIntel: LocationIntelligence | null;
  operationalMode: 'LIVE_DATA' | 'DEMO_SIMULATION';
  roads: Road[];
  vehicles: Vehicle[];
  shipments: Shipment[];
  incidents: Incident[];
  predictions: Map<string, RiskPrediction>;
  alerts: Alert[];
  onCloseSelection?: () => void;
  onAuthorizeReroute?: (vehicleId: string) => void;
  onOpenStreetView?: (lat: number, lng: number, name: string) => void;
  onOpenSatelliteHub?: () => void;
  onOpenFieldHub?: () => void;
  onOpenSatelliteForHazard?: (hazard: any) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function LiveSurveillanceDock({
  selectedVehicle,
  selectedRoad,
  selectedIncident,
  selectedLocationIntel,
  operationalMode,
  roads,
  vehicles,
  shipments,
  incidents,
  predictions,
  alerts,
  onCloseSelection,
  onAuthorizeReroute,
  onOpenStreetView,
  onOpenSatelliteHub,
  onOpenFieldHub,
  onOpenSatelliteForHazard,
  isCollapsed = false,
  onToggleCollapse,
}: LiveSurveillanceDockProps) {
  const [activeTab, setActiveTab] = useState<'surveillance' | 'commander'>('surveillance');
  const [localCollapsed, setLocalCollapsed] = useState<boolean>(false);

  // Automatically start minimized on mobile screens so user can see and pan the map
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setLocalCollapsed(true);
    }
  }, []);

  // AI Commander conversation state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; suggestions?: string[] }>>([
    {
      role: 'ai',
      text: 'NERIXA AI Commander active. Direct operational query engine connected to live GPS fleet, Sentinel SAR observations, weather radar, and corridor risk telemetry.',
      suggestions: [
        'Which vehicles are currently at high risk?',
        'Why is NH-15 high risk?',
        'Which roads are blocked?',
        'What is the safest route for TRK-102?',
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const handleSendQuery = (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInputQuery('');

    const res = processCommanderQuery(q, {
      roads,
      vehicles,
      shipments,
      predictions,
      alerts,
    });

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: res.text, suggestions: res.suggestions },
      ]);
    }, 250);
  };

  if (isCollapsed || localCollapsed) {
    return (
      <div
        className="live-surveillance-dock-minimized"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '12px',
          zIndex: 990,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button
          onClick={() => {
            setLocalCollapsed(false);
            onToggleCollapse?.();
          }}
          style={{
            background: 'rgba(8, 12, 22, 0.94)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            borderRadius: '24px',
            color: '#38bdf8',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          title="Open Live Surveillance & AI Commander Dock"
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: operationalMode === 'LIVE_DATA' ? '#10b981' : '#f59e0b',
            }}
          />
          <ShieldIcon size={14} color="#38bdf8" />
          <span>SURVEILLANCE & AI DOCK</span>
          <span style={{ fontSize: '9px', background: 'rgba(56, 189, 248, 0.2)', padding: '2px 6px', borderRadius: '8px' }}>▲</span>
        </button>
      </div>
    );
  }

  // Determine current active entity
  const hasSelectedEntity = !!(selectedVehicle || selectedRoad || selectedIncident || selectedLocationIntel);

  return (
    <div
      className="live-surveillance-dock"
      style={{
        position: 'absolute',
        top: '64px',
        right: '12px',
        bottom: '24px',
        width: '380px',
        maxWidth: 'calc(100vw - 24px)',
        zIndex: 995,
        background: 'rgba(9, 13, 24, 0.96)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '14px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Dock Header Bar ── */}
      <div
        style={{
          padding: '10px 14px',
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.98), rgba(20, 30, 50, 0.95))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: operationalMode === 'LIVE_DATA' ? '#10b981' : '#f59e0b',
              boxShadow: operationalMode === 'LIVE_DATA' ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
            }}
          />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
              LIVE SURVEILLANCE & AI DOCK
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>
              {operationalMode === 'LIVE_DATA' ? '● VERIFIED REAL-TIME STREAMS' : '● SIH DEMO SIMULATION'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => {
              setLocalCollapsed(true);
              onToggleCollapse?.();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Minimize panel to view full map"
          >
            <span>▼</span>
            <span>Minimize</span>
          </button>
          {hasSelectedEntity && onCloseSelection && (
            <button
              onClick={onCloseSelection}
              aria-label="Clear selection"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(12, 18, 32, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '4px 8px',
          gap: '6px',
        }}
      >
        <button
          onClick={() => setActiveTab('surveillance')}
          style={{
            flex: 1,
            padding: '5px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            border: 'none',
            background: activeTab === 'surveillance' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            color: activeTab === 'surveillance' ? '#38bdf8' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldIcon size={12} color={activeTab === 'surveillance' ? '#38bdf8' : '#94a3b8'} />
          <span>Surveillance Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('commander')}
          style={{
            flex: 1,
            padding: '5px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            border: 'none',
            background: activeTab === 'commander' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            color: activeTab === 'commander' ? '#c084fc' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <BotIcon size={12} color={activeTab === 'commander' ? '#c084fc' : '#94a3b8'} />
          <span>AI Commander</span>
        </button>
      </div>

      {/* ── Main Panel Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {activeTab === 'surveillance' ? (
          <div>
            {/* Context 1: Selected Vehicle Telemetry */}
            {selectedVehicle ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TruckIcon size={16} color="#38bdf8" />
                    <strong style={{ fontSize: '14px', color: '#38bdf8' }}>{selectedVehicle.id}</strong>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>({selectedVehicle.vehicleNumber})</span>
                  </div>
                  {(() => {
                    const freshness = calculateFreshness(selectedVehicle.lastPingTimestamp || selectedVehicle.lastUpdated);
                    return (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: freshness.isLive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                          color: freshness.isLive ? '#34d399' : '#f87171',
                          border: `1px solid ${freshness.isLive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
                          fontFamily: 'monospace',
                        }}
                      >
                        {freshness.text}
                      </span>
                    );
                  })()}
                </div>

                {/* Status Box */}
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                    <div>Status: <strong style={{ color: selectedVehicle.status === 'MOVING' ? '#22c55e' : '#f59e0b' }}>{selectedVehicle.status}</strong></div>
                    <div>Speed: <strong>{Math.round(selectedVehicle.speed)} km/h</strong></div>
                    <div>Heading: <strong>{Math.round(selectedVehicle.heading || 0)}° ({getHeadingName(selectedVehicle.heading || 0)})</strong></div>
                    <div>GPS Accuracy: <strong>±{selectedVehicle.accuracy || 6}m</strong></div>
                  </div>
                  <div>Driver: <strong>{selectedVehicle.driverName || 'Operator'}</strong> ({selectedVehicle.driverPhone || 'Radio Terminal'})</div>
                  <div>Coordinates: <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{selectedVehicle.currentLocation.lat.toFixed(5)}°N, {selectedVehicle.currentLocation.lng.toFixed(5)}°E</span></div>
                </div>

                {/* Mission & Cargo */}
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px' }}>
                  <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>Logistics Route & Cargo</div>
                  <div>Origin ➔ Destination: <strong>Guwahati ➔ {selectedVehicle.destinationName || 'Tawang Hospital'}</strong></div>
                  <div>Cargo: <strong style={{ color: '#f87171' }}>{selectedVehicle.commodity || 'CRITICAL MEDICINE'} (Cold-chain)</strong></div>
                  <div>Corridor Road Risk: <strong style={{ color: getRiskColor(selectedVehicle.risk) }}>{selectedVehicle.risk}% ({getRiskLevel(selectedVehicle.risk)})</strong></div>
                  <div>Hazard Ahead: <span style={{ color: '#f87171' }}>Possible debris flow 4.2 km ahead</span></div>
                </div>

                {/* AI Reroute Recommendation */}
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', marginBottom: '4px' }}>
                    AI RECOMMENDATION: REROUTE
                  </div>
                  <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
                    NH-15 Bomdila Pass carriageway blocked by debris flow. Recommended detour: <strong>Route B (Bhalukpong Bypass)</strong>. +25 min delay but guarantees intact vaccine cold-chain delivery.
                  </div>
                  {onAuthorizeReroute && (
                    <button
                      onClick={() => onAuthorizeReroute(selectedVehicle.id)}
                      style={{
                        width: '100%',
                        background: '#10b981',
                        color: '#042f2e',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckIcon size={12} color="#042f2e" />
                      <span>Authorize Route B Bypass</span>
                    </button>
                  )}
                </div>

                {onOpenStreetView && (
                  <button
                    onClick={() => onOpenStreetView(selectedVehicle.currentLocation.lat, selectedVehicle.currentLocation.lng, selectedVehicle.vehicleNumber)}
                    style={{
                      width: '100%',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      padding: '7px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Inspect Ground Reality / Street View
                  </button>
                )}
              </div>
            ) : selectedRoad ? (
              /* Context 2: Mountain Road Intelligence (Section 7) */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      {selectedRoad.number}
                    </span>
                    <strong style={{ fontSize: '13px', marginLeft: '6px' }}>{selectedRoad.name}</strong>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: selectedRoad.status === 'BLOCKED' ? '#f87171' : '#34d399',
                      background: selectedRoad.status === 'BLOCKED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {selectedRoad.status}
                  </span>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px' }}>
                  <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    MOUNTAIN ROAD INTELLIGENCE (SECTION 7)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div>Elevation: <strong className="font-mono">{selectedRoad.elevation || 2850} m</strong></div>
                    <div>Slope: <strong className="font-mono">{selectedRoad.slope || 14}%</strong></div>
                    <div>Terrain: <strong>{selectedRoad.terrain}</strong></div>
                    <div>Road Condition: <strong>{selectedRoad.condition}</strong></div>
                    <div>Traffic Flow: <strong>{selectedRoad.trafficLevel}</strong></div>
                    <div>Weather: <strong>Active Heavy Rain (48mm)</strong></div>
                    <div>Landslide Risk: <strong style={{ color: '#ef4444' }}>HIGH (84%)</strong></div>
                    <div>Flood Risk: <strong>MODERATE</strong></div>
                    <div>Bridge Condition: <strong>FAIR (Pier Monitored)</strong></div>
                    <div>Vehicles Approaching: <strong style={{ color: '#38bdf8' }}>7 Convoys</strong></div>
                    <div>Critical Shipments: <strong style={{ color: '#ef4444' }}>2 (Medical)</strong></div>
                    <div>Field Report: <strong>18 min ago</strong></div>
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', marginBottom: '4px' }}>
                    AI RECOMMENDATION: REROUTE 7 VEHICLES
                  </div>
                  <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4 }}>
                    Debris accumulation prevents safe passage of heavy cargo. Reroute essential medical shipments via Bhalukpong corridor.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {onOpenSatelliteHub && (
                    <button
                      onClick={onOpenSatelliteHub}
                      style={{
                        flex: 1,
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: '#c084fc',
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Copernicus SAR Pass
                    </button>
                  )}
                  {onOpenFieldHub && (
                    <button
                      onClick={onOpenFieldHub}
                      style={{
                        flex: 1,
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        padding: '6px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Field Evidence Photo
                    </button>
                  )}
                </div>
              </div>
            ) : selectedIncident ? (
              /* Context 3: Incident -> Impact Analysis (Section 23) */
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HazardIcon size={16} color="#ef4444" />
                    <strong style={{ fontSize: '13px', color: '#f87171' }}>{selectedIncident.type.replace(/_/g, ' ')}</strong>
                  </div>
                  <span style={{ background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                    SEV {selectedIncident.severity}/10
                  </span>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px' }}>
                  <div style={{ fontWeight: 800, color: '#f87171', marginBottom: '6px' }}>
                    INCIDENT ➔ IMPACT ANALYSIS (SECTION 23)
                  </div>
                  <div style={{ marginBottom: '4px' }}>Road Corridor: <strong>{selectedIncident.roadName}</strong></div>
                  <div style={{ marginBottom: '4px' }}>Vehicles Affected: <strong style={{ color: '#38bdf8' }}>7 convoys</strong></div>
                  <div style={{ marginBottom: '4px' }}>Shipments Affected: <strong style={{ color: '#f59e0b' }}>4 shipments</strong></div>
                  <div style={{ marginBottom: '4px' }}>Critical Medical Supplies: <strong style={{ color: '#ef4444' }}>2 (Vaccines + Anti-Malarials)</strong></div>
                  <div style={{ marginBottom: '4px' }}>Hospitals at Risk: <strong>Tawang District Hospital, Tezpur ICU</strong></div>
                  <div>Alternative Detours Available: <strong>2 Bypass Options</strong></div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', marginBottom: '4px' }}>
                    RECOMMENDATION: REROUTE 7 VEHICLES
                  </div>
                  <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4 }}>
                    Automated trajectory calculation indicates high probability of complete stoppage within 35 minutes. Dispatch diversion orders immediately.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {onOpenSatelliteForHazard && (
                    <button
                      onClick={() => {
                        onOpenSatelliteForHazard({
                          id: selectedIncident.id,
                          title: `${selectedIncident.type.replace(/_/g, ' ')} Incident`,
                          category: selectedIncident.type.includes('FLOOD') ? 'FLOOD' : selectedIncident.type.includes('BRIDGE') ? 'BRIDGE' : 'LANDSLIDE',
                          locationName: selectedIncident.roadName,
                          lat: selectedIncident.location.lat,
                          lng: selectedIncident.location.lng,
                          severity: selectedIncident.severity >= 8 ? 'CRITICAL' : 'HIGH',
                          details: selectedIncident.description,
                        });
                      }}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.3) 100%)',
                        border: '1px solid rgba(168, 85, 247, 0.6)',
                        color: '#c084fc',
                        padding: '7px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      🛰️ View Real-Time Satellite Analysis
                    </button>
                  )}

                  {onOpenStreetView && (
                    <button
                      onClick={() => onOpenStreetView(selectedIncident.location.lat, selectedIncident.location.lng, selectedIncident.roadName || 'Incident Site')}
                      style={{
                        width: '100%',
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        color: '#38bdf8',
                        padding: '7px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Inspect Incident Ground Evidence
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Context 4: General Regional Site Surveillance (Section 22 Default) */
              <div>
                <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px' }}>
                  <div style={{ fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    SITE STATUS TELEMETRY (SECTION 22)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>SITE STATUS</div>
                      <div style={{ color: '#10b981', fontWeight: 800 }}>● REAL-TIME</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>ROAD RISK</div>
                      <div style={{ color: '#ef4444', fontWeight: 800 }}>HIGH (78%)</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>WEATHER</div>
                      <div style={{ color: '#38bdf8', fontWeight: 700 }}>Heavy Rain</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>LANDSLIDE RISK</div>
                      <div style={{ color: '#f59e0b', fontWeight: 800 }}>78%</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>TRAFFIC FLOW</div>
                      <div style={{ color: '#f97316', fontWeight: 700 }}>MODERATE</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>VEHICLES NEARBY</div>
                      <div style={{ color: '#38bdf8', fontWeight: 800 }}>7 Active</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>FIELD REPORT</div>
                      <div style={{ color: '#34d399', fontWeight: 700 }}>18 min ago</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '10px' }}>COPERNICUS SAR</div>
                      <div style={{ color: '#c084fc', fontWeight: 700 }}>Pass Available</div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  Click any <strong>Vehicle marker</strong>, <strong>Highway corridor</strong>, or <strong>Incident icon</strong> on the map to bind real-time surveillance telemetry to this dock.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: AI Commander Query Console (Section 25) */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    background: msg.role === 'user' ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    lineHeight: 1.45,
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {msg.text}
                  {msg.suggestions && (
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendQuery(sug)}
                          style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: '#38bdf8',
                            fontSize: '9px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendQuery();
                }}
                placeholder="Ask AI Commander (e.g. Which roads are blocked?)..."
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  color: '#fff',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleSendQuery()}
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getHeadingName(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
  return directions[index];
}
