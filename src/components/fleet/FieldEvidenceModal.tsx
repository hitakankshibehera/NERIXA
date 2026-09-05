'use client';

import React, { useState, useEffect } from 'react';
import { IncidentType, Incident } from '@/lib/types';
import {
  FiCamera,
  FiMapPin,
  FiAlertTriangle,
  FiUploadCloud,
  FiCheckCircle,
  FiX,
  FiRefreshCw,
  FiShield
} from '@/components/common/FeatherIcons';

interface FieldEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated?: (incident: Incident) => void;
}

export const FieldEvidenceModal: React.FC<FieldEvidenceModalProps> = ({
  isOpen,
  onClose,
  onIncidentCreated,
}) => {
  const [incidentType, setIncidentType] = useState<IncidentType>('LANDSLIDE');
  const [severity, setSeverity] = useState<number>(8);
  const [description, setDescription] = useState<string>(
    'Heavy debris fall blocking 70% of dual-lane highway near Bomdila Pass. Long line of stranded logistics trucks. Boulders continuing to roll down slope.'
  );
  const [imageUrl, setImageUrl] = useState<string>('/reality/landslide_aerial_reality.jpg');
  const [latitude, setLatitude] = useState<number>(27.3000);
  const [longitude, setLongitude] = useState<number>(92.3000);
  const [officerName, setOfficerName] = useState<string>('Officer Tage (Field Unit 4)');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Capture device GPS
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported by device');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg('Unable to retrieve device GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Submit report to Incident Pipeline (Section 10 & 11)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/incidents/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          latitude,
          longitude,
          incidentType,
          severity,
          description,
          reportedBy: officerName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit incident evidence');
      }

      setSuccessResult(data);
      if (data.incident && onIncidentCreated) {
        onIncidentCreated(data.incident);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: '580px',
          maxHeight: '92vh',
          background: 'var(--bg-secondary, #0f172a)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.15)',
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
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
                flexShrink: 0,
              }}
            >
              <FiCamera size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                  Field Officer Evidence Intake
                </h3>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                  }}
                >
                  SEC 10 & 11
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                Camera + Geolocation → AI Verification Pipeline → Live Map Alert
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.4rem',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body Form */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            flex: 1,
          }}
        >
          {successResult ? (
            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(6, 78, 59, 0.3)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiCheckCircle size={28} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#6ee7b7' }}>
                  Incident Evidence Synchronized with Live Intelligence!
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  Matched to road:{' '}
                  <strong style={{ color: '#fff' }}>{successResult.spatialImpact?.matchedRoadName || 'Active Road'}</strong>
                  .<br />
                  AI Vision Confidence:{' '}
                  <strong style={{ color: '#34d399' }}>{successResult.aiDetection?.confidence || 94}%</strong>
                  . Impacted vehicles:{' '}
                  <strong style={{ color: '#fbbf24' }}>
                    {successResult.spatialImpact?.affectedVehicles?.length || 0}
                  </strong>
                  .
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSuccessResult(null);
                    onClose();
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: '#059669',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#10b981')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#059669')}
                >
                  View on Live Map
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Officer & Type Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Field Officer ID
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      color: '#f8fafc',
                      fontSize: '0.8rem',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Incident Classification
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      color: '#f8fafc',
                      fontSize: '0.8rem',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="LANDSLIDE">LANDSLIDE</option>
                    <option value="FLOOD">FLOOD / INUNDATION</option>
                    <option value="ROAD_BLOCKED">ROAD BLOCKED</option>
                    <option value="ROAD_DAMAGE">ROAD DAMAGE / SUBSIDENCE</option>
                    <option value="BRIDGE_DAMAGE">BRIDGE DAMAGE</option>
                    <option value="TRAFFIC">TRAFFIC GRIDLOCK</option>
                  </select>
                </div>
              </div>

              {/* Severity Slider */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Severity Assessment (1 - 10)
                  </label>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: severity >= 8 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: severity >= 8 ? '#f87171' : '#fbbf24',
                      border: `1px solid ${severity >= 8 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                    }}
                  >
                    {severity} / 10 &nbsp;•&nbsp; {severity >= 8 ? 'CRITICAL EVACUATION / REROUTE' : 'SEVERE HAZARD'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: severity >= 8 ? '#ef4444' : '#f59e0b',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* GPS Coordinates Section */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <FiMapPin size={14} /> GPS Geolocation Tagging
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureGPS}
                    disabled={isLocating}
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      color: '#93c5fd',
                      borderRadius: '6px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isLocating ? <FiRefreshCw size={12} className="animate-spin" /> : <FiMapPin size={12} />}
                    {isLocating ? 'Locating Device...' : 'Capture Device GPS'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#cbd5e1',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    LAT: <span style={{ color: '#fff', fontWeight: 700 }}>{latitude.toFixed(4)}° N</span>
                  </div>
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#cbd5e1',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    LNG: <span style={{ color: '#fff', fontWeight: 700 }}>{longitude.toFixed(4)}° E</span>
                  </div>
                </div>
              </div>

              {/* Photo Evidence Selector */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.35rem',
                  }}
                >
                  Evidence Photo Asset
                </label>
                <select
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="/reality/landslide_aerial_reality.jpg">Bomdila Landslide Aerial (Verified Field Photo)</option>
                  <option value="/reality/flooded_road_satellite_reality.jpg">Brahmaputra Highway Inundation Photo</option>
                  <option value="/reality/traffic_gridlock_reality.jpg">Highway Chokepoint Gridlock</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.35rem',
                  }}
                >
                  Ground Description & Observations
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                  required
                />
              </div>

              {errorMsg && (
                <div
                  style={{
                    padding: '0.6rem 0.875rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FiAlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.7rem 1rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '0.7rem 1.25rem',
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                    transition: 'all 0.15s',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <FiRefreshCw size={14} className="animate-spin" /> Processing AI Pipeline...
                    </>
                  ) : (
                    <>
                      <FiUploadCloud size={16} /> Upload Evidence & Trigger AI
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
