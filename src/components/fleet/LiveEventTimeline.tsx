'use client';

import React, { useState, useEffect } from 'react';
import { LiveSystemEvent } from '@/lib/types';
import {
  FiClock,
  FiTruck,
  FiCloudRain,
  FiRadio,
  FiAlertTriangle,
  FiCamera,
  FiCpu,
  FiMapPin,
  FiX,
} from '@/components/common/FeatherIcons';

interface LiveEventTimelineProps {
  events: LiveSystemEvent[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (event: LiveSystemEvent) => void;
}

export const LiveEventTimeline: React.FC<LiveEventTimelineProps> = ({
  events,
  isOpen,
  onClose,
  onSelectEvent,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'SATELLITE' | 'FIELD' | 'REROUTE'>('ALL');

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

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'vehicle_location_updated':
        return <FiTruck size={14} color="#38bdf8" />;
      case 'weather_warning_received':
        return <FiCloudRain size={14} color="#06b6d4" />;
      case 'satellite_observation_processed':
        return <FiRadio size={14} color="#a855f7" />;
      case 'risk_changed':
        return <FiAlertTriangle size={14} color="#f59e0b" />;
      case 'field_evidence_uploaded':
      case 'field_report_received':
        return <FiCamera size={14} color="#10b981" />;
      case 'ai_incident_verified':
      case 'incident_created':
        return <FiCpu size={14} color="#f43f5e" />;
      case 'shipment_at_risk':
      case 'vehicles_at_risk':
        return <FiAlertTriangle size={14} color="#ec4899" />;
      case 'reroute_required':
      case 'reroute_approved':
      case 'reroute_sent_to_driver':
        return <FiMapPin size={14} color="#14b8a6" />;
      default:
        return <FiClock size={14} color="#94a3b8" />;
    }
  };

  const filteredEvents = events.filter((evt) => {
    if (filter === 'CRITICAL') return evt.severity === 'CRITICAL';
    if (filter === 'SATELLITE') return evt.type.includes('satellite');
    if (filter === 'FIELD') return evt.type.includes('field');
    if (filter === 'REROUTE') return evt.type.includes('reroute');
    return true;
  });

  const criticalCount = events.filter((e) => e.severity === 'CRITICAL').length;

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
          maxWidth: '780px',
          maxHeight: '90vh',
          background: 'var(--bg-secondary, #0f172a)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(168, 85, 247, 0.15)',
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
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiClock size={18} color="#c084fc" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                  Live System Event Timeline
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#c084fc',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c084fc', animation: 'pulse 1.2s infinite' }} />
                  AUDITED BUS
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Audited chronological operational cascade from hardware GPS, weather, and AI engines
              </p>
            </div>
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

        {/* Filter Navigation Bar */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.5rem 1rem',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {[
            { id: 'ALL', label: `All Events (${events.length})` },
            { id: 'CRITICAL', label: `Critical Hazards (${criticalCount})` },
            { id: 'SATELLITE', label: 'Satellite Passes' },
            { id: 'FIELD', label: 'Field Evidence' },
            { id: 'REROUTE', label: 'Reroutes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: filter === tab.id ? '1px solid #c084fc' : '1px solid transparent',
                background: filter === tab.id ? 'rgba(168, 85, 247, 0.18)' : 'transparent',
                color: filter === tab.id ? '#e9d5ff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events Content List */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            maxHeight: '68vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b', fontSize: '13px' }}>
              No system events found under this filter. Waiting for incoming telemetry...
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '22px', borderLeft: '2px solid rgba(255, 255, 255, 0.1)', marginLeft: '8px' }}>
              {filteredEvents.map((evt) => {
                const isCritical = evt.severity === 'CRITICAL';
                const isWarning = evt.severity === 'WARNING';
                const sevColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8';

                return (
                  <div
                    key={evt.id}
                    onClick={() => onSelectEvent?.(evt)}
                    style={{
                      position: 'relative',
                      marginBottom: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Glowing timeline pin */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '10px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#0f172a',
                        border: `2px solid ${sevColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 8px ${sevColor}60`,
                      }}
                    >
                      {getEventIcon(evt.type)}
                    </div>

                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '10px',
                        padding: '10px 14px',
                        transition: 'border-color 0.2s ease, background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#c084fc';
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isCritical ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.025)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: '#38bdf8' }}>
                            {evt.timestamp}
                          </span>
                          <span style={{ color: '#64748b' }}>•</span>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                            {evt.title}
                          </h4>
                        </div>

                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: `${sevColor}20`,
                            border: `1px solid ${sevColor}40`,
                            color: sevColor,
                            fontFamily: 'var(--font-mono, monospace)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {evt.source === 'DEMO' ? 'DEMO SIM' : 'LIVE'}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: 1.45 }}>
                        {evt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            Total Logged Events: <b style={{ color: '#f8fafc' }}>{events.length}</b>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#c084fc',
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
