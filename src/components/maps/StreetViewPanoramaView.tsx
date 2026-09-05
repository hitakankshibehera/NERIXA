// ============================================================
// NER-SHIELD AI — Street View Panorama & Ground Reality Component
// Strictly adheres to Google Maps Platform Street View terms:
// - Metadata verification check prior to loading
// - Honest "No Google Street View imagery available at this location."
// - Authentic imagery date presentation
// - NEVER generates fake Street View imagery
// ============================================================

'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { StreetViewMetadata } from '@/lib/types/googleMaps';
import { StreetViewIcon, SatelliteImageryIcon, CloseIcon } from '@/components/common/Icons';

interface StreetViewPanoramaViewProps {
  lat: number;
  lng: number;
  locationName?: string;
  roadNumber?: string;
  onClose?: () => void;
  inline?: boolean;
}

export default function StreetViewPanoramaView({
  lat,
  lng,
  locationName,
  roadNumber,
  onClose,
  inline = false,
}: StreetViewPanoramaViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<StreetViewMetadata | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setErrorMsg(null);

    async function checkAndMountStreetView() {
      try {
        // Step 1: Query metadata check endpoint
        const res = await fetch(`/api/maps/streetview?lat=${lat}&lng=${lng}`);
        if (!res.ok) {
          throw new Error('Failed to verify Street View metadata');
        }
        const data: StreetViewMetadata = await res.json();
        if (isCancelled) return;

        setMetadata(data);

        // Step 2: If available and Google Maps JS API is on window, attach panorama
        if (data.available && typeof window !== 'undefined' && window.google?.maps?.StreetViewPanorama && containerRef.current) {
          try {
            new window.google.maps.StreetViewPanorama(containerRef.current, {
              position: { lat: data.lat, lng: data.lng },
              pov: { heading: 165, pitch: 0 },
              zoom: 1,
              addressControl: true,
              linksControl: true,
              panControl: true,
              enableCloseButton: false,
            });
          } catch (mountErr) {
            console.warn('Google Street View canvas mount note:', mountErr);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setErrorMsg(err?.message || 'Error checking imagery availability');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    checkAndMountStreetView();

    return () => {
      isCancelled = true;
    };
  }, [lat, lng]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#090d16',
        color: '#f1f5f9',
        borderRadius: inline ? '8px' : '12px',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* ── Header Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StreetViewIcon size={16} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
              Google Street View™ Ground Context
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {roadNumber ? `${roadNumber} • ` : ''}{locationName || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {metadata && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '4px',
                background: metadata.available ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                color: metadata.available ? '#34d399' : '#f87171',
                border: `1px solid ${metadata.available ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              {metadata.available ? 'COVERAGE AVAILABLE' : 'NO COVERAGE'}
            </span>
          )}
          {onClose && (
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
          )}
        </div>
      </div>

      {/* ── Street View Viewport / Fallback ── */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: '#020617',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(56, 189, 248, 0.2)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            Querying Google Street View Metadata...
          </div>
        )}

        {!loading && metadata && !metadata.available && (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              maxWidth: '440px',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <StreetViewIcon size={24} color="#f87171" />
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#f87171',
                marginBottom: '8px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              No Google Street View imagery available at this location.
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              Google Street View vehicles have not surveyed this remote Himalayan mountain pass or restricted border corridor.
              NERIXA relies on real-time Copernicus Satellite Sentinel-1/2 and Field Officer camera uploads for ground evidence.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <SatelliteImageryIcon size={14} color="#c084fc" />
              <span>Ground reality fallback available via Satellite & Field Reports</span>
            </div>
          </div>
        )}

        {!loading && metadata && metadata.available && (
          <div
            ref={containerRef}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '260px',
              position: 'relative',
            }}
          >
            {/* Overlay telemetry info */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '11px',
                color: '#e2e8f0',
                maxWidth: '85%',
              }}
            >
              <div><strong>Imagery Date:</strong> {metadata.imageryDate || 'Archive Date Recorded'}</div>
              <div><strong>Copyright:</strong> {metadata.copyright || '© Google'}</div>
              <div style={{ color: '#38bdf8', fontSize: '10px', marginTop: '2px' }}>
                {metadata.statusMessage}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Telemetry ── */}
      <div
        style={{
          padding: '8px 14px',
          background: 'rgba(15, 23, 42, 0.9)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#64748b',
        }}
      >
        <span>GPS: {lat.toFixed(5)}°N, {lng.toFixed(5)}°E</span>
        <span>Strict Anti-Faking Policy: Active</span>
      </div>
    </div>
  );
}
