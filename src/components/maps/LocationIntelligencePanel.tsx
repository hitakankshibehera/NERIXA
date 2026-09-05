// ============================================================
// NER-SHIELD AI — Location Intelligence Panel (Map Click Intelligence)
// Displays comprehensive coordinates, district, road risk, weather,
// satellite observations, Street View status, and action buttons.
// ============================================================

'use client';

import React from 'react';
import type { LocationIntelligence } from '@/lib/types/googleMaps';
import { getRiskColor } from '@/lib/constants';
import {
  PinIcon,
  StreetViewIcon,
  SatelliteImageryIcon,
  CameraIcon,
  BotIcon,
  RouteIcon,
  HazardIcon,
  CloseIcon,
} from '@/components/common/Icons';

interface LocationIntelligencePanelProps {
  intel: LocationIntelligence;
  onClose: () => void;
  onViewStreetView: () => void;
  onViewSatellite: () => void;
  onViewFieldImages: () => void;
  onViewAIAnalysis: () => void;
  onCalculateRoute: () => void;
  onReportIncident: () => void;
}

export default function LocationIntelligencePanel({
  intel,
  onClose,
  onViewStreetView,
  onViewSatellite,
  onViewFieldImages,
  onViewAIAnalysis,
  onCalculateRoute,
  onReportIncident,
}: LocationIntelligencePanelProps) {
  const riskColor = getRiskColor(intel.roadRisk);
  const accessibilityColor = getRiskColor(100 - intel.accessibilityScore);

  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 1000,
        width: '360px',
        maxWidth: 'calc(100vw - 24px)',
        background: 'rgba(15, 23, 42, 0.96)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '14px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(20px)',
        padding: '16px',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      {/* ── Title & Close ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PinIcon size={16} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Location Intelligence
            </h3>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {intel.district}, {intel.state}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CloseIcon size={14} />
        </button>
      </div>

      {/* ── Coordinates & Nearest Road ── */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#94a3b8' }}>Coordinates:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {intel.lat.toFixed(5)}°N, {intel.lng.toFixed(5)}°E
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#94a3b8' }}>Nearest Road:</span>
          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>
            {intel.nearestRoad ? `${intel.nearestRoad.number} (${intel.nearestRoad.name})` : 'Regional Valley Path'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Street View:</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '11px',
              color: intel.streetViewStatus.available ? '#34d399' : '#f87171',
            }}
          >
            {intel.streetViewStatus.available ? 'AVAILABLE' : 'NOT AVAILABLE'}
          </span>
        </div>
      </div>

      {/* ── Metric Scores ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            padding: '8px 12px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Accessibility</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: accessibilityColor, fontFamily: 'monospace' }}>
            {intel.accessibilityScore}%
          </div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            padding: '8px 12px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Road Risk</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: riskColor, fontFamily: 'monospace' }}>
            {intel.roadRisk}/100
          </div>
        </div>
      </div>

      {/* ── Contextual Telemetry ── */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px',
          marginBottom: '14px',
          fontSize: '11px',
          lineHeight: '1.6',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Weather:</span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>
            {intel.weather.condition} • {intel.weather.temperature}°C ({intel.weather.rainfallRate > 0 ? `${intel.weather.rainfallRate}mm/h rain` : 'Dry'})
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Satellite:</span>
          <span style={{ color: '#a78bfa', fontWeight: 600 }}>
            {intel.satelliteObservation ? `${intel.satelliteObservation.satellite} (${intel.satelliteObservation.detectionType})` : 'Sentinel-1 InSAR Synced'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Nearby Vehicles:</span>
          <span style={{ fontWeight: 700, color: '#f8fafc' }}>{intel.nearbyVehiclesCount} in transit</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Affected Shipments:</span>
          <span style={{ fontWeight: 700, color: intel.affectedShipmentsCount > 0 ? '#f87171' : '#34d399' }}>
            {intel.affectedShipmentsCount} active
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Recent Incidents:</span>
          <span style={{ fontWeight: 700, color: intel.recentIncidentsCount > 0 ? '#f59e0b' : '#94a3b8' }}>
            {intel.recentIncidentsCount} reported
          </span>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <button
          onClick={onViewStreetView}
          style={{
            padding: '7px 10px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <StreetViewIcon size={13} color="#38bdf8" />
          <span>STREET VIEW</span>
        </button>

        <button
          onClick={onViewSatellite}
          style={{
            padding: '7px 10px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#c084fc',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <SatelliteImageryIcon size={13} color="#c084fc" />
          <span>SATELLITE</span>
        </button>

        <button
          onClick={onViewFieldImages}
          style={{
            padding: '7px 10px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <CameraIcon size={13} color="#34d399" />
          <span>FIELD IMAGES</span>
        </button>

        <button
          onClick={onViewAIAnalysis}
          style={{
            padding: '7px 10px',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            color: '#facc15',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <BotIcon size={13} color="#facc15" />
          <span>AI ANALYSIS</span>
        </button>

        <button
          onClick={onCalculateRoute}
          style={{
            padding: '7px 10px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: '#818cf8',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <RouteIcon size={13} color="#818cf8" />
          <span>CALCULATE ROUTE</span>
        </button>

        <button
          onClick={onReportIncident}
          style={{
            padding: '7px 10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <HazardIcon size={13} color="#f87171" />
          <span>REPORT INCIDENT</span>
        </button>
      </div>
    </div>
  );
}
