'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { getRiskColor } from '@/lib/constants';
import type { RoadImageIntel, CCTVCamera, IncidentCategory } from '@/lib/types/imageIntelligence';
import { SEED_ROAD_IMAGE_TIMELINE } from '@/data/seedImageIntelligence';
import { CheckIcon, CloseIcon, CameraIcon, MapIcon, RouteIcon, DroneIcon, HazardIcon, ShieldIcon, PulseDotIcon } from '@/components/common/Icons';

interface ImageIntelligenceHubProps {
  onNavigateRoutes?: () => void;
  onOpenMap?: () => void;
}

export default function ImageIntelligenceHub({ onNavigateRoutes, onOpenMap }: ImageIntelligenceHubProps) {
  const {
    imageIntelList,
    cctvCameras,
    satellitePasses,
    offlineReportsQueue,
    isOfflineMode,
    imageIntelSummary,
    roads,
    user,
    submitFieldOfficerReport,
    verifyImageIntelDecision,
    addCCTVCamera,
    updateCCTVCamera,
    deleteCCTVCamera,
    toggleOfflineSimulation,
    syncOfflineReports,
    triggerHackathonImageScenario,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'evidence' | 'matrix' | 'fieldApp' | 'verification' | 'cameras' | 'logistics' | 'timeline'>('evidence');
  const [selectedIntelId, setSelectedIntelId] = useState<string>(imageIntelList[0]?.id || 'img-intel-01');
  const [sliderPos, setSliderPos] = useState<number>(50); // Before/After split slider (0-100%)
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [addCameraModal, setAddCameraModal] = useState(false);

  // Field Officer Form State
  const [fieldOfficerName, setFieldOfficerName] = useState(user?.name || 'Bimal Das');
  const [fieldOfficerId, setFieldOfficerId] = useState(user?.id || 'officer-104');
  const [fieldDistrict, setFieldDistrict] = useState('West Kameng');
  const [fieldRoadId, setFieldRoadId] = useState('nh-15');
  const [fieldIncidentType, setFieldIncidentType] = useState<IncidentCategory>('LANDSLIDE');
  const [fieldDescription, setFieldDescription] = useState('Severe boulder collapse blocking carriageway near switchback curve.');
  const [fieldImagePreset, setFieldImagePreset] = useState('/reality/landslide_aerial_reality.jpg');
  const [fieldCustomImage, setFieldCustomImage] = useState<string>('');
  const [fieldSubmittedMsg, setFieldSubmittedMsg] = useState<string>('');

  // New Camera Form State
  const [newCamName, setNewCamName] = useState('');
  const [newCamLocation, setNewCamLocation] = useState('');
  const [newCamRoadNumber, setNewCamRoadNumber] = useState('NH-15');
  const [newCamDistrict, setNewCamDistrict] = useState('West Kameng');
  const [newCamLat, setNewCamLat] = useState('27.26');
  const [newCamLng, setNewCamLng] = useState('92.42');
  const [newCamUrl, setNewCamUrl] = useState('rtsp://ner-cctv.mha.gov.in/live/cam-new/stream.m3u8');

  // Selected Intel Record
  const activeIntel: RoadImageIntel = imageIntelList.find(i => i.id === selectedIntelId) || imageIntelList[0];

  const handleRunDemo = async () => {
    setIsDemoRunning(true);
    await triggerHackathonImageScenario();
    setSelectedIntelId('intel-demo');
    setActiveTab('evidence');
    setTimeout(() => setIsDemoRunning(false), 2000);
  };

  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = fieldCustomImage || fieldImagePreset;
    const road = roads.find(r => r.id === fieldRoadId);
    
    await submitFieldOfficerReport({
      officerId: fieldOfficerId,
      officerName: fieldOfficerName,
      districtId: fieldDistrict.toLowerCase().replace(/\s+/g, '-'),
      districtName: fieldDistrict,
      roadId: fieldRoadId,
      roadNumber: road?.number || 'NH-15',
      lat: road?.path[0]?.lat || 27.26,
      lng: road?.path[0]?.lng || 92.42,
      incidentType: fieldIncidentType,
      description: fieldDescription,
      imageUrl: finalImage,
    });

    setFieldSubmittedMsg(
      isOfflineMode 
        ? 'Report saved to local device queue! Will synchronize automatically once connection is restored.'
        : 'Report submitted and successfully processed by AI Computer Vision Engine!'
    );
    setTimeout(() => setFieldSubmittedMsg(''), 5000);
  };

  const handleCreateCamera = (e: React.FormEvent) => {
    e.preventDefault();
    addCCTVCamera({
      name: newCamName || 'CAM-New: Regional Checkpost',
      location: newCamLocation || 'North Eastern Corridor',
      lat: parseFloat(newCamLat) || 26.5,
      lng: parseFloat(newCamLng) || 92.5,
      districtId: newCamDistrict.toLowerCase().replace(/\s+/g, '-'),
      districtName: newCamDistrict,
      state: 'Assam',
      roadId: 'nh-15',
      roadNumber: newCamRoadNumber,
      streamUrl: newCamUrl,
      status: 'ONLINE',
      isDemo: true,
      frequencyMinutes: 3,
      alertThreshold: 'HIGH',
      currentRiskScore: 35,
      resolution: '1920x1080 (FHD)',
    });
    setAddCameraModal(false);
    setNewCamName('');
    setNewCamLocation('');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* ── Command Center Header ── */}
      <div className="ecc-banner" style={{ borderLeft: '4px solid #38bdf8' }}>
        <div className="ecc-title-group">
          <CameraIcon size={24} style={{ color: '#38bdf8' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              NERIXA Image Intelligence & Computer Vision Hub
              <span className="ecc-status-pill ecc-pill-online">● 42/48 CAMERAS ONLINE</span>
              <span className="ecc-status-pill ecc-pill-live">● NEURAL CV ACTIVE</span>
              <span className="ecc-status-pill" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                ISRO RADAR SYNCED
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              Ministry of Development of North Eastern Region • Field Officer Mobile Feeds • CCTV Network • InSAR Satellite Surveillance
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Hackathon Demo Trigger Button */}
          <button
            className="btn btn-danger btn-sm"
            onClick={handleRunDemo}
            disabled={isDemoRunning}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Demonstrate: Medicine Convoy → Rainfall → Landslide Image Arrival → Risk 32 to 86 → Reroute"
          >
            <span>{isDemoRunning ? 'Running Demo...' : 'Run Hackathon Demo Flow'}</span>
          </button>

          {/* Offline Simulation Toggle */}
          <button
            className={`btn btn-sm ${isOfflineMode ? 'btn-danger' : 'btn-outline'}`}
            onClick={toggleOfflineSimulation}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
            title="Simulate remote field conditions with no mobile connectivity"
          >
            <span>{isOfflineMode ? 'Simulating OFFLINE' : 'Network ONLINE'}</span>
          </button>

          {/* Sync Offline Queue Button */}
          {offlineReportsQueue.length > 0 && (
            <button
              className="btn btn-primary btn-sm animate-pulse"
              onClick={syncOfflineReports}
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Sync {offlineReportsQueue.length} Queued Reports</span>
            </button>
          )}

          {onOpenMap && (
            <button className="btn btn-outline btn-sm" onClick={onOpenMap} style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <MapIcon size={13} /> GIS Digital Twin
            </button>
          )}
        </div>
      </div>

      {/* Offline Status Alert Banner */}
      {isOfflineMode && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          padding: '0.625rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fca5a5',
          fontSize: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <strong>OFFLINE-FIRST MODE ACTIVE:</strong> Mobile connectivity is simulated as disconnected in remote mountain passes. Captures will be stored in local device storage and automatically synchronized when connectivity returns.
            </div>
          </div>
          <span className="badge badge-critical font-mono">
            {offlineReportsQueue.length} REPORTS QUEUED
          </span>
        </div>
      )}

      {/* ── KPI Row (Prompt #14) ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.25rem' }}>
        <div className="kpi-card" style={{ '--kpi-color': 'var(--accent-primary)' } as React.CSSProperties}>
          <div className="kpi-label">Images Received Today</div>
          <div className="kpi-value" style={{ color: 'var(--accent-primary)' }}>{imageIntelSummary.imagesReceivedToday.toLocaleString()}</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#38bdf8' } as React.CSSProperties}>
          <div className="kpi-label">AI Incidents Detected</div>
          <div className="kpi-value" style={{ color: '#38bdf8' }}>{imageIntelSummary.aiIncidentsDetected}</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as React.CSSProperties}>
          <div className="kpi-label">Critical Incidents</div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>{imageIntelSummary.criticalIncidents}</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as React.CSSProperties}>
          <div className="kpi-label">High Severity</div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{imageIntelSummary.highSeverityIncidents}</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#10b981' } as React.CSSProperties}>
          <div className="kpi-label">CCTV Cameras Active</div>
          <div className="kpi-value" style={{ color: '#10b981' }}>{cctvCameras.filter(c => c.status === 'ONLINE').length} / {cctvCameras.length}</div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': offlineReportsQueue.length > 0 ? '#ef4444' : '#94a3b8' } as React.CSSProperties}>
          <div className="kpi-label">Field Queue Pending</div>
          <div className="kpi-value" style={{ color: offlineReportsQueue.length > 0 ? '#ef4444' : '#94a3b8' }}>
            {offlineReportsQueue.length}
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#eab308' } as React.CSSProperties}>
          <div className="kpi-label">Critical Medicine Convoys</div>
          <div className="kpi-value" style={{ color: '#eab308' }}>{imageIntelSummary.medicineShipmentsAtRisk} At Risk</div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`btn btn-sm ${activeTab === 'evidence' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('evidence')}
          style={{ fontSize: '0.75rem' }}
        >
          AI Evidence & Before/After
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'matrix' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('matrix')}
          style={{ fontSize: '0.75rem' }}
        >
          CCTV Matrix & Feeds ({cctvCameras.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'fieldApp' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('fieldApp')}
          style={{ fontSize: '0.75rem' }}
        >
          Field Officer Mobile Capture
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'verification' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('verification')}
          style={{ fontSize: '0.75rem' }}
        >
          Authority Verification ({imageIntelList.filter(i => i.verification.status === 'AI_DETECTED').length} Pending)
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'cameras' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('cameras')}
          style={{ fontSize: '0.75rem' }}
        >
          Admin Camera Management
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'logistics' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('logistics')}
          style={{ fontSize: '0.75rem' }}
        >
          Logistics & Supply Disruption
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('timeline')}
          style={{ fontSize: '0.75rem' }}
        >
          Road Image Timeline
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: AI EVIDENCE & BEFORE / AFTER COMPARISON PANEL
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'evidence' && activeIntel && (
        <div>
          {/* Incident Selector Bar */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '4px' }}>
            {imageIntelList.map(intel => {
              const isSelected = intel.id === selectedIntelId;
              const sevColor = intel.aiDetection.severity === 'CRITICAL' ? '#ef4444' : intel.aiDetection.severity === 'HIGH' ? '#f59e0b' : '#10b981';
              return (
                <button
                  key={intel.id}
                  onClick={() => setSelectedIntelId(intel.id)}
                  style={{
                    background: isSelected ? 'rgba(59,130,246,0.25)' : 'rgba(15,23,42,0.6)',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minWidth: '220px',
                    color: isSelected ? '#93c5fd' : '#cbd5e1',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: sevColor }}>
                      ● {intel.aiDetection.incidentType.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: '#94a3b8' }}>{intel.roadNumber}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {intel.districtName}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
            {/* Left: Interactive Before / After Split Slider */}
            <div className="card" style={{ padding: '1rem', background: 'rgba(15,23,42,0.7)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                    Visual Ground Evidence: Baseline vs. Current Disruption
                  </h3>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                    Drag slider below to compare baseline dry highway against current disruption
                  </div>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => setModalImage({ url: activeIntel.imageUrl, title: activeIntel.title })}
                >
                  View 4K Full-Res
                </button>
              </div>

              {/* Before / After Frame */}
              <div style={{ position: 'relative', width: '100%', height: '340px', borderRadius: '8px', overflow: 'hidden', background: '#000', userSelect: 'none' }}>
                {/* Background Image: Baseline Normal Road */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeIntel.beforeImageUrl}
                  alt="Baseline Road"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>
                  BASELINE (CLEAR ROAD)
                </div>

                {/* Foreground Image: Current Disrupted Road (Clipped by Slider) */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${sliderPos}%`,
                  height: '100%',
                  overflow: 'hidden',
                  borderRight: '2px solid #38bdf8',
                  boxShadow: '2px 0 12px rgba(56, 189, 248, 0.6)',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeIntel.imageUrl}
                    alt="Current Disrupted Road"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', minWidth: '100%' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', color: '#f87171', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>
                    CURRENT (AI DETECTED DISRUPTION)
                  </div>
                </div>

                {/* Telemetry Overlays */}
                <div className="drone-hud-rec" style={{ bottom: '10px', left: '10px', top: 'auto', fontSize: '0.6875rem' }}>
                  <span className="drone-rec-dot" />
                  <span>{activeIntel.sourceName}</span>
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                  GPS: {activeIntel.lat.toFixed(4)}°N, {activeIntel.lng.toFixed(4)}°E
                </div>
              </div>

              {/* Slider Control */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 600 }}>◄ Baseline (Before)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#38bdf8' }}
                />
                <span style={{ fontSize: '0.6875rem', color: '#f87171', fontWeight: 600 }}>Current (After) ►</span>
              </div>
            </div>

            {/* Right: AI Computer Vision Assessment & Risk Delta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Computer Vision Result Card */}
              <div className="card" style={{ padding: '1rem', background: 'rgba(15,23,42,0.7)', borderLeft: '3px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI Computer Vision Engine Detection
                  </div>
                  <span className="badge badge-critical font-mono" style={{ fontSize: '0.6875rem' }}>
                    CONFIDENCE {activeIntel.aiDetection.confidence}%
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#f8fafc', marginBottom: '0.375rem' }}>
                  {activeIntel.aiDetection.incidentType.replace(/_/g, ' ')}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '0.75rem' }}>
                  {activeIntel.aiDetection.description}
                </p>

                {/* Detected Features Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.75rem' }}>
                  {activeIntel.aiDetection.detectedFeatures.map((f, i) => (
                    <span key={i} style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', borderRadius: '4px', padding: '2px 6px', fontSize: '0.625rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckIcon size={10} style={{ color: '#34d399' }} /> {f}
                    </span>
                  ))}
                </div>

                {/* Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>BLOCKAGE</div>
                    <div className="font-mono font-bold" style={{ fontSize: '0.9375rem', color: '#ef4444' }}>
                      {activeIntel.aiDetection.roadBlockagePercent}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>DEBRIS VOL</div>
                    <div className="font-mono font-bold" style={{ fontSize: '0.9375rem', color: '#f59e0b' }}>
                      {activeIntel.aiDetection.debrisVolumeM3 ? `${activeIntel.aiDetection.debrisVolumeM3.toLocaleString()} m³` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>STATUS</div>
                    <div className="font-mono font-bold" style={{ fontSize: '0.8125rem', color: '#ef4444' }}>
                      {activeIntel.aiDetection.accessibilityStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Road Risk Dynamic Jump (Prompt #3) */}
              <div className="card" style={{ padding: '0.875rem', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.7) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.375rem' }}>
                  DYNAMIC ROAD RISK RECALCULATION
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>PREVIOUS</div>
                    <div className="font-mono font-bold" style={{ fontSize: '1.25rem', color: getRiskColor(activeIntel.riskUpdate.previousRisk) }}>
                      {activeIntel.riskUpdate.previousRisk}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.25rem', color: '#ef4444' }}>→</span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>NEW RISK</div>
                    <div className="font-mono font-bold" style={{ fontSize: '1.5rem', color: getRiskColor(activeIntel.riskUpdate.newRisk) }}>
                      {activeIntel.riskUpdate.newRisk}
                    </div>
                  </div>
                  <div style={{ flex: 1, paddingLeft: '8px' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#f8fafc', fontWeight: 600 }}>
                      Accessibility: <span style={{ color: '#ef4444' }}>{activeIntel.riskUpdate.previousAccessibility} → {activeIntel.riskUpdate.newAccessibility}</span>
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                      {activeIntel.riskUpdate.reason}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics & Medicine Impact Preview (Prompt #6) */}
              <div className="card" style={{ padding: '0.875rem', background: 'rgba(15,23,42,0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#eab308' }}>
                    LOGISTICS & SUPPLY DISRUPTION IMPACT
                  </div>
                  <span className="badge badge-critical" style={{ fontSize: '0.625rem' }}>
                    {activeIntel.logisticsImpact.supplyDisruptionRisk} SUPPLY RISK
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center', margin: '6px 0' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>Vehicles</div>
                    <div className="font-mono font-bold" style={{ color: '#38bdf8' }}>{activeIntel.logisticsImpact.affectedVehiclesCount}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>Shipments</div>
                    <div className="font-mono font-bold" style={{ color: '#f59e0b' }}>{activeIntel.logisticsImpact.affectedShipmentsCount}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>Critical Meds</div>
                    <div className="font-mono font-bold" style={{ color: '#ef4444' }}>{activeIntel.logisticsImpact.criticalShipmentsCount}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>Delay ETA</div>
                    <div className="font-mono font-bold" style={{ color: '#f87171' }}>{Math.floor(activeIntel.logisticsImpact.estimatedDelayMinutes / 60)}h {activeIntel.logisticsImpact.estimatedDelayMinutes % 60}m</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.6875rem', color: '#93c5fd', marginTop: '4px' }}>
                  <strong>Alternative Bypass:</strong> {activeIntel.logisticsImpact.alternativeRouteName} (+{activeIntel.logisticsImpact.alternativeRouteDeltaKm} km)
                </div>

                {onNavigateRoutes && (
                  <button 
                    className="btn btn-outline w-full btn-sm"
                    onClick={onNavigateRoutes}
                    style={{ marginTop: '0.5rem', fontSize: '0.6875rem' }}
                  >
                    Open Risk-Aware Route Optimizer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: CCTV STREAM MATRIX & CAMERA FEEDS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'matrix' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Live CCTV Camera Network & Automated Frame Ingestion
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Periodic AI optical analysis over 12 high-priority national highway chokepoints and mountain bridges.
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setAddCameraModal(true)}
              style={{ fontSize: '0.75rem' }}
            >
              + Register New Camera
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {cctvCameras.map(cam => {
              const isOnline = cam.status === 'ONLINE';
              const riskColor = getRiskColor(cam.currentRiskScore);

              return (
                <div
                  key={cam.id}
                  className="card"
                  style={{
                    padding: '0',
                    overflow: 'hidden',
                    border: cam.currentRiskScore > 75 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(15, 23, 42, 0.7)',
                  }}
                >
                  {/* Camera Frame Preview */}
                  <div style={{ position: 'relative', width: '100%', height: '160px', background: '#000' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cam.id === 'cctv-1' ? '/reality/landslide_aerial_reality.jpg' : cam.id === 'cctv-2' ? '/reality/flood_drone_recon.jpg' : cam.id === 'cctv-3' ? '/reality/landslide_clearance.jpg' : '/reality/normal_road_baseline.jpg'}
                      alt={cam.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isOnline ? 1 : 0.4 }}
                    />
                    <div className="drone-hud-rec" style={{ top: '8px', left: '8px', fontSize: '0.625rem' }}>
                      <span className="drone-rec-dot" style={{ background: isOnline ? '#ef4444' : '#6b7280' }} />
                      <span>{isOnline ? 'LIVE FEED' : 'OFFLINE'}</span>
                    </div>
                    {cam.isDemo && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 800 }}>
                        DEMO DATA
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(0,0,0,0.75)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.625rem', fontFamily: 'monospace' }}>
                        {cam.resolution.split(' ')[0]}
                      </span>
                      <span className="font-mono font-bold" style={{ background: 'rgba(0,0,0,0.75)', color: riskColor, padding: '2px 6px', borderRadius: '4px', fontSize: '0.6875rem' }}>
                        RISK {cam.currentRiskScore}
                      </span>
                    </div>
                  </div>

                  {/* Camera Details */}
                  <div style={{ padding: '0.875rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f8fafc', marginBottom: '2px' }}>
                      {cam.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '6px' }}>
                      {cam.location} • {cam.state} ({cam.roadNumber})
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginBottom: '8px' }}>
                      <span>Last Ingest: {cam.lastImageReceived}</span>
                      <span>Freq: Every {cam.frequencyMinutes}m</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-outline w-full btn-sm"
                        style={{ fontSize: '0.6875rem' }}
                        onClick={() => {
                          setSelectedIntelId('img-intel-01');
                          setActiveTab('evidence');
                        }}
                      >
                        Inspect CV Evidence
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: FIELD OFFICER MOBILE CAMERA CAPTURE (PROMPT #1A & #11)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'fieldApp' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Mobile Upload Form */}
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(15,23,42,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  Field Officer Mobile Inspection Portal
                </h3>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                  Auto-captures GPS, timestamp, officer credentials, and queues offline if remote.
                </div>
              </div>
              <span className="badge badge-primary">MOBILE DISPATCH</span>
            </div>

            {fieldSubmittedMsg && (
              <div style={{
                background: isOfflineMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: isOfflineMode ? '1px solid #ef4444' : '1px solid #10b981',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                color: isOfflineMode ? '#fca5a5' : '#6ee7b7',
                fontSize: '0.75rem',
                marginBottom: '1rem',
              }}>
                {fieldSubmittedMsg}
              </div>
            )}

            <form onSubmit={handleFieldSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.6875rem' }}>Officer ID / Name</label>
                  <input
                    className="form-input"
                    style={{ fontSize: '0.75rem' }}
                    value={fieldOfficerName}
                    onChange={e => setFieldOfficerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.6875rem' }}>District</label>
                  <input
                    className="form-input"
                    style={{ fontSize: '0.75rem' }}
                    value={fieldDistrict}
                    onChange={e => setFieldDistrict(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.6875rem' }}>Road Corridor</label>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.75rem' }}
                    value={fieldRoadId}
                    onChange={e => setFieldRoadId(e.target.value)}
                  >
                    {roads.map(r => (
                      <option key={r.id} value={r.id}>{r.number} — {r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.6875rem' }}>Observed Hazard Category</label>
                  <select
                    className="form-select"
                    style={{ fontSize: '0.75rem' }}
                    value={fieldIncidentType}
                    onChange={e => setFieldIncidentType(e.target.value as IncidentCategory)}
                  >
                    <option value="LANDSLIDE">Landslide / Rockfall</option>
                    <option value="FLOODED_ROAD">Flooded Carriageway</option>
                    <option value="WATERLOGGING">Waterlogging</option>
                    <option value="ROAD_BLOCKAGE">Road Blockage</option>
                    <option value="FALLEN_TREES">Fallen Trees</option>
                    <option value="DEBRIS">Heavy Debris</option>
                    <option value="DAMAGED_ROAD">Pavement Subsidence</option>
                    <option value="DAMAGED_BRIDGE">Bridge Structural Damage</option>
                    <option value="TRAFFIC_CONGESTION">Traffic Bottleneck</option>
                    <option value="ACCIDENT_OBSTRUCTION">Vehicle Accident</option>
                    <option value="NORMAL_ROAD">Normal Clear Road</option>
                  </select>
                </div>
              </div>

              {/* Photo Selector / Upload */}
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.6875rem' }}>
                  Camera Photo Evidence (Select or Upload)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '0.5rem' }}>
                  {[
                    { label: 'Landslide', url: '/reality/landslide_aerial_reality.jpg' },
                    { label: 'Flood', url: '/reality/flood_drone_recon.jpg' },
                    { label: 'Clearance', url: '/reality/landslide_clearance.jpg' },
                    { label: 'Normal', url: '/reality/normal_road_baseline.jpg' },
                  ].map(preset => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => {
                        setFieldImagePreset(preset.url);
                        setFieldCustomImage('');
                      }}
                      style={{
                        padding: '4px',
                        borderRadius: '4px',
                        border: fieldImagePreset === preset.url && !fieldCustomImage ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                        background: '#000',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '2px' }} />
                      <div style={{ fontSize: '0.625rem', color: '#cbd5e1', marginTop: '2px' }}>{preset.label}</div>
                    </button>
                  ))}
                </div>

                {/* Upload from device file input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setFieldCustomImage(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ fontSize: '0.6875rem', color: '#94a3b8' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.6875rem' }}>Field Observations & Clearance Notes</label>
                <textarea
                  className="form-textarea"
                  style={{ fontSize: '0.75rem', minHeight: '60px' }}
                  value={fieldDescription}
                  onChange={e => setFieldDescription(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full btn-sm">
                {isOfflineMode ? 'Save Report to Offline Device Queue' : 'Upload & Trigger AI Vision Analysis'}
              </button>
            </form>
          </div>

          {/* Offline Queue Tracker */}
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(15,23,42,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                  Offline Storage & Sync Status
                </h4>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                  Local device IndexedDB / localStorage queue
                </div>
              </div>
              <span className="badge font-mono" style={{ background: offlineReportsQueue.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: offlineReportsQueue.length > 0 ? '#ef4444' : '#10b981' }}>
                {offlineReportsQueue.length} PENDING SYNC
              </span>
            </div>

            {offlineReportsQueue.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', marginBottom: '0.5rem' }}>
                  <CheckIcon size={24} style={{ color: '#10b981' }} />
                </div>
                <div>All field reports are currently synchronized with the NERIXA central GIS Digital Twin.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {offlineReportsQueue.map(item => (
                  <div key={item.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.625rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt="Queue thumbnail" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                        {item.roadNumber} • {item.incidentType.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                        Officer: {item.officerName} • {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="badge badge-warning" style={{ fontSize: '0.625rem' }}>QUEUED</span>
                  </div>
                ))}

                <button
                  className="btn btn-primary w-full btn-sm"
                  style={{ marginTop: '0.5rem' }}
                  onClick={syncOfflineReports}
                >
                  Synchronize All {offlineReportsQueue.length} Queued Reports Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: HUMAN-IN-THE-LOOP VERIFICATION WORKBENCH (PROMPT #8)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'verification' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Human-in-the-Loop Authority Verification Pipeline
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              AI Computer Vision recommendations are reviewed before making irreversible government decisions:
              <strong style={{ color: '#38bdf8' }}> AI Detection → Officer Verification → Authority Confirmation → Road Status Update</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {imageIntelList.map(intel => {
              const isVerified = intel.verification.status === 'OFFICER_VERIFIED' || intel.verification.status === 'AUTHORITY_CONFIRMED';
              const isPending = intel.verification.status === 'AI_DETECTED';

              return (
                <div
                  key={intel.id}
                  className="card"
                  style={{
                    padding: '1rem',
                    background: 'rgba(15,23,42,0.7)',
                    border: isPending ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={intel.imageUrl} alt={intel.title} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>{intel.title}</span>
                        <span className={`badge ${isVerified ? 'badge-safe' : isPending ? 'badge-critical' : 'badge-warning'}`}>
                          {intel.verification.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '4px' }}>
                        {intel.roadNumber} • {intel.districtName}, {intel.state} • Source: {intel.sourceName} • Confidence: {intel.aiDetection.confidence}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                        {intel.aiDetection.description.slice(0, 140)}...
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.6875rem' }}
                        onClick={() => verifyImageIntelDecision(intel.id, 'VERIFY', 'Authority confirmed aerial drone evidence')}
                      >
                        VERIFY INCIDENT
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.6875rem' }}
                        onClick={() => verifyImageIntelDecision(intel.id, 'UPDATE_ROAD_STATUS', 'Road status set to BLOCKED by District Officer')}
                      >
                        UPDATE ROAD STATUS
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.625rem', flex: 1 }}
                          onClick={() => verifyImageIntelDecision(intel.id, 'MARK_FALSE_POSITIVE', 'Officer confirmed corridor is passable')}
                        >
                          [FALSE POSITIVE]
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.625rem', flex: 1 }}
                          onClick={() => verifyImageIntelDecision(intel.id, 'ESCALATE', 'Escalated to State Disaster Management Authority')}
                        >
                          [ESCALATE]
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Audit Trail Snippet */}
                  {intel.verification.auditTrail.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.6875rem', color: '#94a3b8' }}>
                      <strong>Latest Audit Record:</strong> {intel.verification.auditTrail[0].action} by {intel.verification.auditTrail[0].userName} at {new Date(intel.verification.auditTrail[0].timestamp).toLocaleTimeString()} ({intel.verification.auditTrail[0].notes})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: ADMIN CAMERA MANAGEMENT (PROMPT #10)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'cameras' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Admin Camera Management & Feed Registry
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Configure road assignments, RTSP/HLS stream URLs, ingestion frequency, and alert thresholds.
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setAddCameraModal(true)}>
              + Add Camera Feed
            </button>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Camera Name & ID</th>
                  <th>Corridor</th>
                  <th>District / State</th>
                  <th>Stream Endpoint</th>
                  <th>Status</th>
                  <th>Ingestion Freq</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cctvCameras.map(cam => (
                  <tr key={cam.id}>
                    <td>
                      <div className="font-semibold text-sm">{cam.name}</div>
                      <div className="text-xs text-muted">{cam.id} • {cam.resolution}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{cam.roadNumber}</span>
                    </td>
                    <td>
                      <div className="text-sm">{cam.districtName}</div>
                      <div className="text-xs text-muted">{cam.state}</div>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ color: '#38bdf8' }}>
                        {cam.streamUrl.slice(0, 32)}...
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${cam.status === 'ONLINE' ? 'badge-safe' : 'badge-critical'}`}>
                        {cam.status}
                      </span>
                    </td>
                    <td className="text-xs font-mono">Every {cam.frequencyMinutes}m</td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}
                          onClick={() => updateCCTVCamera(cam.id, { status: cam.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' })}
                        >
                          {cam.status === 'ONLINE' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}
                          onClick={() => deleteCCTVCamera(cam.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: LOGISTICS & CRITICAL MEDICINE DISRUPTION TRACKER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'logistics' && activeIntel && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Supply Chain & Essential Medicine Disruption Intelligence
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Real-time correlation of image-confirmed road disruptions against active transport manifests.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1rem', background: 'rgba(15,23,42,0.7)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>
                Critical Medicine Deliveries at Immediate Risk
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeIntel.logisticsImpact.criticalMedicineDeliveries.map((med, i) => (
                  <div key={i} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.625rem', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#fca5a5' }}>
                      {med.split(':')[0]}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#e2e8f0' }}>
                      {med.split(':')[1]}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '2px' }}>AI Tactical Recommendation</div>
                <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                  {activeIntel.aiDetection.recommendedAction}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1rem', background: 'rgba(15,23,42,0.7)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
                Alternate Route Bypass Synthesis
              </div>
              <div style={{ fontSize: '0.75rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
                <strong>Recommended Corridor:</strong> {activeIntel.logisticsImpact.alternativeRouteName}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                Additional Distance: <strong>+{activeIntel.logisticsImpact.alternativeRouteDeltaKm} km</strong> • Avoids blocked section completely.
              </div>

              {onNavigateRoutes && (
                <button className="btn btn-primary w-full btn-sm" onClick={onNavigateRoutes}>
                  Open in Route Optimizer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 7: ROAD IMAGE TIMELINE (PROMPT #9)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'timeline' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Historical Road Degradation & Recovery Timeline (NH-15 Bomdila Axis)
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Chronological image evidence tracking condition deterioration from clear road to major landslide blockage.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {SEED_ROAD_IMAGE_TIMELINE.map((item, i) => (
              <div key={i} className="card" style={{ padding: '0', overflow: 'hidden', background: 'rgba(15,23,42,0.7)' }}>
                <div style={{ position: 'relative', width: '100%', height: '140px', background: '#000' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.timeLabel} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.8)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    {item.timeLabel}
                  </div>
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', color: getRiskColor(item.riskScore), padding: '2px 6px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 800 }}>
                    RISK {item.riskScore}
                  </div>
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#f8fafc', marginBottom: '2px' }}>
                    {item.condition}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '4px' }}>
                    Status: <span style={{ color: item.roadStatus === 'BLOCKED' ? '#ef4444' : item.roadStatus === 'PARTIALLY_BLOCKED' ? '#f59e0b' : '#10b981' }}>{item.roadStatus}</span>
                  </div>
                  <div style={{ fontSize: '0.625rem', color: '#cbd5e1' }}>
                    Traffic: {item.trafficState}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4K Full Resolution Zoom Modal ── */}
      {modalImage && (
        <div className="reality-modal-backdrop" onClick={() => setModalImage(null)}>
          <div className="reality-modal-window" onClick={e => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
            <div className="reality-modal-header">
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>{modalImage.title}</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModalImage(null)}>
                <CloseIcon size={14} />
              </button>
            </div>
            <div className="reality-modal-body" style={{ padding: '0', background: '#000', maxHeight: '80vh', display: 'flex', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={modalImage.url} alt={modalImage.title} style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Add Camera Modal ── */}
      {addCameraModal && (
        <div className="reality-modal-backdrop" onClick={() => setAddCameraModal(false)}>
          <div className="reality-modal-window" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="reality-modal-header">
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>Register New CCTV / Video Stream</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setAddCameraModal(false)}>
                <CloseIcon size={14} />
              </button>
            </div>
            <div className="reality-modal-body">
              <form onSubmit={handleCreateCamera}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Camera Name</label>
                  <input className="form-input" value={newCamName} onChange={e => setNewCamName(e.target.value)} placeholder="CAM-113: Teesta Bridge Approach" required />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Location / Chainage</label>
                  <input className="form-input" value={newCamLocation} onChange={e => setNewCamLocation(e.target.value)} placeholder="Chainage km 52.4, Singtam" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Road Number</label>
                    <input className="form-input" value={newCamRoadNumber} onChange={e => setNewCamRoadNumber(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>District</label>
                    <input className="form-input" value={newCamDistrict} onChange={e => setNewCamDistrict(e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Latitude</label>
                    <input className="form-input" value={newCamLat} onChange={e => setNewCamLat(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Longitude</label>
                    <input className="form-input" value={newCamLng} onChange={e => setNewCamLng(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>RTSP / HLS Stream URL</label>
                  <input className="form-input" value={newCamUrl} onChange={e => setNewCamUrl(e.target.value)} required />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" className="btn btn-outline" onClick={() => setAddCameraModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Camera</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
