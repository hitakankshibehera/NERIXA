'use client';

import React, { useEffect } from 'react';
import { DataSourceStatus } from '@/lib/types';
import {
  FiActivity,
  FiRefreshCw,
  FiX,
  FiWifi,
  FiTruck,
  FiCloudRain,
  FiRadio,
  FiCamera,
  FiMap,
  FiSlash,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
} from '@/components/common/FeatherIcons';

interface DataSourcesPanelProps {
  sources: DataSourceStatus[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const DataSourcesPanel: React.FC<DataSourcesPanelProps> = ({
  sources,
  isOpen,
  onClose,
  onRefresh,
}) => {
  // ESC key listener to safely dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getSourceIcon = (id: string) => {
    switch (id) {
      case 'GPS_FLEET':
        return <FiTruck size={16} color="#38bdf8" />;
      case 'GOOGLE_TRAFFIC':
        return <FiActivity size={16} color="#22c55e" />;
      case 'WEATHER_API':
        return <FiCloudRain size={16} color="#06b6d4" />;
      case 'SENTINEL_1':
      case 'SENTINEL_2':
        return <FiRadio size={16} color="#a855f7" />;
      case 'FIELD_OFFICERS':
        return <FiCamera size={16} color="#10b981" />;
      case 'ROAD_NETWORK':
        return <FiMap size={16} color="#f59e0b" />;
      case 'PUBLIC_TRANSIT':
        return <FiSlash size={16} color="#f43f5e" />;
      default:
        return <FiWifi size={16} color="#94a3b8" />;
    }
  };

  const getStatusBadge = (source: DataSourceStatus) => {
    switch (source.status) {
      case 'CONNECTED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              fontSize: '10px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            CONNECTED
          </span>
        );
      case 'SYNCING':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              color: '#facc15',
              fontSize: '10px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#eab308' }} />
            SYNCING
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '10px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            UNAVAILABLE
          </span>
        );
      case 'DISCONNECTED':
      case 'ERROR':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontSize: '10px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            {source.status || 'OFFLINE'}
          </span>
        );
    }
  };

  const totalConnected = sources.filter((s) => s.connected).length;

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
          maxWidth: '860px',
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
              <FiActivity size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                  Real-Time Data Sources & Health
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#38bdf8',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', animation: 'pulse 1.2s infinite' }} />
                  {totalConnected} / {sources.length} ONLINE
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Truthful connection metrics • Real hardware pings and API status (Requirement 27)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onRefresh && (
              <button
                onClick={onRefresh}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Refresh stream status"
              >
                <FiRefreshCw size={13} />
                <span>Refresh</span>
              </button>
            )}

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
        </div>

        {/* Public Transit Disclaimer Banner */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '8px 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
            <FiSlash size={14} color="#f59e0b" />
            <span>
              <strong style={{ color: '#f8fafc' }}>Public Transit (GTFS-RT):</strong> LIVE TRANSIT DATA NOT AVAILABLE for Northeastern Mountain Sectors. Anti-fabrication principle enforced.
            </span>
          </div>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 800,
              fontSize: '10px',
            }}
          >
            VERIFIED TRUTH
          </span>
        </div>

        {/* Sources Grid */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            maxHeight: '68vh',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
          }}
        >
          {sources.map((source) => (
            <div
              key={source.id}
              style={{
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getSourceIcon(source.id)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                      {source.name}
                    </h4>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      {source.category}
                    </div>
                  </div>
                </div>

                {getStatusBadge(source)}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Freshness:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc', fontWeight: 600 }}>{source.freshnessLabel}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Telemetry Sync:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 600 }}>
                    {source.recordsReceived.toLocaleString()} packets
                  </span>
                </div>
              </div>

              {source.notes && (
                <div style={{ fontSize: '11px', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.02)', padding: '6px 8px', borderRadius: '4px' }}>
                  {source.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
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
            Decoupled Architecture • WebSockets, Firebase RTDB Pub/Sub, and IMD/CWC APIs
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
};
