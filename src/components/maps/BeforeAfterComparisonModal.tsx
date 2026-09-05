// ============================================================
// NER-SHIELD AI — Before vs After Visual Comparison Slider
// Interactive draggable slider comparing pre-disaster baseline
// against post-disaster satellite & ground camera evidence.
// ============================================================

'use client';

import React, { useState, useRef, useCallback } from 'react';
import type { BeforeAfterComparison } from '@/lib/types/googleMaps';
import { CompareIcon, CloseIcon } from '@/components/common/Icons';

interface BeforeAfterComparisonModalProps {
  comparison?: BeforeAfterComparison;
  onClose: () => void;
}

const DEFAULT_COMPARISON: BeforeAfterComparison = {
  id: 'cmp-default',
  locationName: 'NH-27 Brahmaputra Inundation Sector',
  coords: { lat: 26.35, lng: 92.68 },
  roadNumber: 'NH-27',
  district: 'Nagaon, Assam',
  before: {
    date: '2026-08-14 (Pre-Monsoon Surge)',
    source: 'Copernicus Sentinel-2 MSI Multi-Spectral Archive',
    label: 'Normal Dry Corridor & Embankment',
    imageUrl: '/reality/normal_road_baseline.jpg',
    status: 'OPTIMAL (Risk: 18/100)',
    isRealData: true,
  },
  after: {
    date: '2026-09-04 11:45 UTC (Recent Pass)',
    source: 'Copernicus Sentinel-1 SAR + Drone Recon',
    label: 'Active Flash Overtopping (2.4 ft flood depth)',
    imageUrl: '/reality/flood_drone_recon.jpg',
    detection: 'Water Inundation across 1.2 km carriageway',
    aiConfidence: 94,
    riskScore: 86,
    isRealData: true,
  },
};

export default function BeforeAfterComparisonModal({
  comparison = DEFAULT_COMPARISON,
  onClose,
}: BeforeAfterComparisonModalProps) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = () => {
    isDragging.current = true;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          background: '#090d16',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CompareIcon size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                BEFORE vs AFTER — SATELLITE & GROUND COMPARISON
              </h3>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {comparison.roadNumber} • {comparison.locationName} ({comparison.district})
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
            <CloseIcon size={16} />
          </button>
        </div>

        {/* ── Metadata Strip ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '10px 20px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
          }}
        >
          <div style={{ borderLeft: '3px solid #38bdf8', paddingLeft: '8px' }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>BEFORE (Baseline)</div>
            <div style={{ color: '#cbd5e1' }}><strong>Date:</strong> {comparison.before.date}</div>
            <div style={{ color: '#94a3b8' }}><strong>Sensor:</strong> {comparison.before.source}</div>
          </div>
          <div style={{ borderLeft: '3px solid #f87171', paddingLeft: '8px' }}>
            <div style={{ color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>AFTER (Disaster / Surge)</div>
            <div style={{ color: '#cbd5e1' }}><strong>Date:</strong> {comparison.after.date}</div>
            <div style={{ color: '#94a3b8' }}>
              <strong>AI Detection:</strong> {comparison.after.detection} ({comparison.after.aiConfidence}% conf)
            </div>
          </div>
        </div>

        {/* ── Interactive Comparison Canvas ── */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          style={{
            position: 'relative',
            width: '100%',
            height: '420px',
            overflow: 'hidden',
            userSelect: 'none',
            cursor: 'ew-resize',
            background: '#020617',
          }}
        >
          {/* AFTER Image (Background) */}
          <div style={{ position: 'absolute', inset: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={comparison.after.imageUrl}
              alt="After disaster observation"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                background: 'rgba(239, 68, 68, 0.85)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              AFTER: {comparison.after.label}
            </div>
          </div>

          {/* BEFORE Image (Clipped Overlay) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={comparison.before.imageUrl}
              alt="Before baseline observation"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(14, 165, 233, 0.85)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              BEFORE: {comparison.before.label}
            </div>
          </div>

          {/* Vertical Divider Handle */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${sliderPos}%`,
              width: '3px',
              background: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 4px rgba(56, 189, 248, 0.8)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#0284c7',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              }}
            >
              ⇄
            </div>
          </div>
        </div>

        {/* ── Footer Telemetry ── */}
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Drag slider horizontally to inspect morphological change.</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Slider: {sliderPos}%</span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}
