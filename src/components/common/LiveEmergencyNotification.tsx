// ============================================================
// NER-SHIELD AI — Live Emergency Alert & Customer Notification System
// Broadcasts active floods, bridge collapses, and real-time satellite triggers
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import type { LiveFloodZone, LiveBridgeStatus } from '@/lib/hazards/liveHazardFeed';
import { SatelliteIcon, AlertIcon, CloseIcon } from '@/components/common/Icons';

interface LiveEmergencyNotificationProps {
  floods: LiveFloodZone[];
  bridges: LiveBridgeStatus[];
  onOpenSatelliteForHazard: (hazard: {
    id?: string;
    title: string;
    category: 'FLOOD' | 'BRIDGE' | 'LANDSLIDE' | 'ACCIDENT' | 'HIGHWAY';
    locationName?: string;
    state?: string;
    district?: string;
    lat: number;
    lng: number;
    severity?: string;
    percentage?: number;
    details?: string;
    divertedRoute?: string;
    waterLevelMeters?: number;
    affectedRoadLengthKm?: number;
    river?: string;
    highway?: string;
  }) => void;
  onLocateOnMap: (target: {
    lat: number;
    lng: number;
    title: string;
    category: 'FLOOD' | 'BRIDGE' | 'ACCIDENT' | 'HIGHWAY';
    details: string;
    percentage?: number;
  }) => void;
}

export default function LiveEmergencyNotification({
  floods,
  bridges,
  onOpenSatelliteForHazard,
  onLocateOnMap,
}: LiveEmergencyNotificationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'FLOOD' | 'BRIDGE'>('FLOOD');
  const [isMinimized, setIsMinimized] = useState(false);

  // Focus on highest severity emergencies
  const criticalBridge = bridges.find((b) => b.condition === 'COLLAPSED') || bridges[0];
  const criticalFlood = floods.find((f) => f.floodPercentage >= 80) || floods[0];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '70px',
        right: '16px',
        zIndex: 9995,
        width: isMinimized ? 'auto' : '420px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.55)',
        borderRadius: '14px',
        boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.85), 0 0 25px rgba(239, 68, 68, 0.25)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      {/* ── Top Emergency Header Bar ── */}
      <div
        style={{
          padding: '10px 14px',
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.08) 100%)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'pulse 1.2s infinite',
            }}
          />
          <strong style={{ fontSize: '11px', color: '#fca5a5', letterSpacing: '0.04em', fontWeight: 800 }}>
            🚨 LIVE EMERGENCY NOTIFICATION
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '2px 6px',
            }}
            title={isMinimized ? 'Expand notification' : 'Minimize notification'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '13px',
              padding: '2px 6px',
            }}
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Expanded Content ── */}
      {!isMinimized && (
        <div style={{ padding: '14px' }}>
          <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '10px', lineHeight: 1.4 }}>
            Central Water Commission (CWC) & Border Roads Organisation telemetry detected active disasters:
          </div>

          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '10px',
              background: 'rgba(0,0,0,0.3)',
              padding: '3px',
              borderRadius: '8px',
            }}
          >
            <button
              onClick={() => setSelectedTab('FLOOD')}
              style={{
                flex: 1,
                background: selectedTab === 'FLOOD' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                border: selectedTab === 'FLOOD' ? '1px solid rgba(56, 189, 248, 0.5)' : 'none',
                color: selectedTab === 'FLOOD' ? '#38bdf8' : '#94a3b8',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🌊 Active Flood
            </button>
            <button
              onClick={() => setSelectedTab('BRIDGE')}
              style={{
                flex: 1,
                background: selectedTab === 'BRIDGE' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                border: selectedTab === 'BRIDGE' ? '1px solid rgba(239, 68, 68, 0.5)' : 'none',
                color: selectedTab === 'BRIDGE' ? '#fca5a5' : '#94a3b8',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🌉 Bridge Collapse
            </button>
          </div>

          {/* ACTIVE DISASTER CARD */}
          {selectedTab === 'FLOOD' && criticalFlood && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#f8fafc' }}>{criticalFlood.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Highway: <b style={{ color: '#38bdf8' }}>{criticalFlood.highway}</b> • {criticalFlood.state} ({criticalFlood.district})
                  </div>
                </div>
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  {criticalFlood.floodPercentage}% INUNDATED
                </span>
              </div>

              {/* Satellite thumbnail preview */}
              <div
                style={{
                  width: '100%',
                  height: '95px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  margin: '8px 0',
                  position: 'relative',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                }}
              >
                <img
                  src="/reality/sentinel1_sar_flood.jpg"
                  alt="Real-Time Copernicus SAR Satellite View"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#c084fc',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  🛰️ REAL-TIME SENTINEL-1 SAR PASS
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#f87171',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  Water Depth: +{criticalFlood.waterLevelMeters}m
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '10px' }}>
                Copernicus microwave SAR reflection confirms total carriageway submergence across {criticalFlood.affectedRoadLengthKm} km.
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    onOpenSatelliteForHazard({
                      id: criticalFlood.id,
                      title: criticalFlood.name,
                      category: 'FLOOD',
                      locationName: `${criticalFlood.district}, ${criticalFlood.state}`,
                      state: criticalFlood.state,
                      district: criticalFlood.district,
                      lat: criticalFlood.location.lat,
                      lng: criticalFlood.location.lng,
                      severity: 'CRITICAL',
                      percentage: criticalFlood.floodPercentage,
                      details: `Flood Level: ${criticalFlood.floodPercentage}%. ${criticalFlood.divertedRoute}`,
                      divertedRoute: criticalFlood.divertedRoute,
                      waterLevelMeters: criticalFlood.waterLevelMeters,
                      affectedRoadLengthKm: criticalFlood.affectedRoadLengthKm,
                      highway: criticalFlood.highway,
                    });
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #7e22ce 0%, #9333ea 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(147, 51, 234, 0.4)',
                  }}
                >
                  <SatelliteIcon size={13} color="#ffffff" />
                  <span>🛰️ View Real-Time Satellite</span>
                </button>

                <button
                  onClick={() => {
                    onLocateOnMap({
                      lat: criticalFlood.location.lat,
                      lng: criticalFlood.location.lng,
                      title: criticalFlood.name,
                      category: 'FLOOD',
                      details: `Inundation: ${criticalFlood.floodPercentage}%. ${criticalFlood.divertedRoute}`,
                      percentage: criticalFlood.floodPercentage,
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>📍 Locate</span>
                </button>
              </div>
            </div>
          )}

          {/* BRIDGE COLLAPSE CARD */}
          {selectedTab === 'BRIDGE' && criticalBridge && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#f8fafc' }}>{criticalBridge.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    River: <b style={{ color: '#38bdf8' }}>{criticalBridge.river}</b> • {criticalBridge.highway}
                  </div>
                </div>
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  💥 {criticalBridge.condition}
                </span>
              </div>

              {/* Satellite/Airborne thumbnail */}
              <div
                style={{
                  width: '100%',
                  height: '95px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  margin: '8px 0',
                  position: 'relative',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                }}
              >
                <img
                  src="/reality/flood_drone_recon.jpg"
                  alt="Real-Time Recon & Satellite Twin"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#f87171',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  🛰️ RECON: PIER 3 SHEARED
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#fca5a5',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                >
                  Health: {criticalBridge.healthPercentage}%
                </div>
              </div>

              <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '10px' }}>
                {criticalBridge.description.slice(0, 110)}... Complete carriageway closure enforced.
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    onOpenSatelliteForHazard({
                      id: criticalBridge.id,
                      title: criticalBridge.name,
                      category: 'BRIDGE',
                      locationName: `${criticalBridge.river} (${criticalBridge.state})`,
                      state: criticalBridge.state,
                      lat: criticalBridge.location.lat,
                      lng: criticalBridge.location.lng,
                      severity: 'CRITICAL',
                      percentage: criticalBridge.healthPercentage,
                      details: `Condition: ${criticalBridge.condition}. ${criticalBridge.description}`,
                      divertedRoute: criticalBridge.diversion,
                      river: criticalBridge.river,
                      highway: criticalBridge.highway,
                    });
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #7e22ce 0%, #9333ea 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(147, 51, 234, 0.4)',
                  }}
                >
                  <SatelliteIcon size={13} color="#ffffff" />
                  <span>🛰️ View Real-Time Satellite</span>
                </button>

                <button
                  onClick={() => {
                    onLocateOnMap({
                      lat: criticalBridge.location.lat,
                      lng: criticalBridge.location.lng,
                      title: criticalBridge.name,
                      category: 'BRIDGE',
                      details: `Condition: ${criticalBridge.condition}. ${criticalBridge.diversion}`,
                      percentage: criticalBridge.healthPercentage,
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.4)',
                    color: '#fb923c',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>📍 Locate</span>
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              fontSize: '10px',
              color: '#64748b',
              textAlign: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '6px',
            }}
          >
            Copernicus Sentinel-1 SAR • Central Water Commission • BRO Tactical Link
          </div>
        </div>
      )}
    </div>
  );
}
