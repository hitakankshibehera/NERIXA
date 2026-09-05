// ============================================================
// NERIXA — Satellite AI Intelligence Hub Component
// Copernicus Data Space Ecosystem (Sentinel-1 SAR / Sentinel-2)
// ============================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/store/AppContext';
import type { SatelliteObservation } from '@/lib/types/satelliteIntelligence';
import { NER_STATES } from '@/lib/constants';
import {
  SatelliteIcon,
  RadarIcon,
  HazardIcon,
  WeatherCloudIcon,
  DroneIcon,
  TruckIcon,
  MapIcon,
  CompareIcon,
  RouteIcon,
  CloseIcon,
  GearIcon,
  FileTextIcon,
} from '@/components/common/Icons';

interface SatelliteHubProps {
  onNavigateRoutes?: () => void;
  onOpenMap?: () => void;
}

export default function SatelliteIntelligenceHub({ onNavigateRoutes, onOpenMap }: SatelliteHubProps) {
  const {
    satelliteObservations,
    satelliteProducts,
    satelliteAdminConfig,
    satelliteSummary,
    selectedSatelliteObservation,
    selectSatelliteObservation,
    searchSatelliteObservations,
    analyzeSatelliteObservation,
    runSatelliteFloodScenario,
    requestFieldVerificationForSatellite,
    updateSatelliteAdminConfig,
    roads,
  } = useApp();

  // Active Hub Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sar' | 'optical' | 'compare' | 'logistics' | 'field' | 'admin'
  >('overview');

  // Search & Filter State
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedSatellite, setSelectedSatellite] = useState<string>('ALL');
  const [maxCloudFilter, setMaxCloudFilter] = useState<number>(100);
  const [searchRoadId, setSearchRoadId] = useState<string>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Before/After Slider State (0 to 100)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  // Fullscreen Modal for High-Res View
  const [highResModalUrl, setHighResModalUrl] = useState<string | null>(null);
  const [scenarioRunning, setScenarioRunning] = useState<boolean>(false);
  const [analysisInProgress, setAnalysisInProgress] = useState<boolean>(false);

  // Selected Observation (defaults to first or Sonitpur SAR observation)
  const currentObs: SatelliteObservation = useMemo(() => {
    return (
      selectedSatelliteObservation ||
      satelliteObservations.find(o => o.id === 'sat-obs-sonitpur-01') ||
      satelliteObservations[0]
    );
  }, [selectedSatelliteObservation, satelliteObservations]);

  // Handle Search Trigger
  const handleSearch = async () => {
    setIsSearching(true);
    await searchSatelliteObservations({
      state: selectedState !== 'all' ? selectedState : undefined,
      satellite: selectedSatellite !== 'ALL' ? selectedSatellite : undefined,
      maxCloud: maxCloudFilter < 100 ? maxCloudFilter : undefined,
      roadId: searchRoadId !== 'all' ? searchRoadId : undefined,
    });
    setIsSearching(false);
  };

  // Handle AI Analysis Trigger
  const handleAnalyze = async (obsId: string) => {
    setAnalysisInProgress(true);
    await analyzeSatelliteObservation(obsId);
    setAnalysisInProgress(false);
  };

  // Handle Hackathon Scenario Trigger
  const handleRunScenario = async () => {
    setScenarioRunning(true);
    await runSatelliteFloodScenario();
    setTimeout(() => {
      setScenarioRunning(false);
      setActiveTab('logistics');
    }, 800);
  };

  // Slider Dragging Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div style={{ padding: '1.25rem', color: '#f8fafc', minHeight: '100%' }}>
      {/* ── Top Header with Hackathon Trigger ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
          borderRadius: '12px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          marginBottom: '1.25rem',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <SatelliteIcon size={24} style={{ color: '#38bdf8' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#f8fafc' }}>
              SATELLITE AI INTELLIGENCE
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: satelliteAdminConfig.connected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                color: satelliteAdminConfig.connected ? '#4ade80' : '#facc15',
                border: `1px solid ${satelliteAdminConfig.connected ? 'rgba(34, 197, 94, 0.4)' : 'rgba(234, 179, 8, 0.4)'}`,
              }}
            >
              {satelliteAdminConfig.connected ? '● COPERNICUS LIVE' : '● CDSE CATALOG MVP'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
            Copernicus Data Space Ecosystem • Sentinel-1 SAR & Sentinel-2 Optical Observation Array for the North Eastern Region
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          {/* Hackathon Flood Scenario Trigger */}
          <button
            onClick={handleRunScenario}
            disabled={scenarioRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ef4444',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: scenarioRunning ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s',
            }}
            title="Simulate Sentinel-1 SAR Flood detection on NH-15 and automatic logistics rerouting"
          >
            <span>{scenarioRunning ? 'PROCESSING SCENARIO...' : 'RUN SATELLITE FLOOD SCENARIO'}</span>
          </button>

          {onOpenMap && (
            <button
              onClick={onOpenMap}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                background: 'rgba(14, 165, 233, 0.1)',
                color: '#38bdf8',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <MapIcon size={14} />
              <span>View On GIS</span>
            </button>
          )}

          {onNavigateRoutes && (
            <button
              onClick={onNavigateRoutes}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                background: 'rgba(168, 85, 247, 0.1)',
                color: '#c084fc',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RouteIcon size={14} />
              <span>Route Optimizer</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 6 KPI Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.875rem',
          marginBottom: '1.25rem',
        }}
      >
        <div className="kpi-card" style={{ '--kpi-color': '#38bdf8' } as React.CSSProperties}>
          <div className="kpi-label">Latest Observation</div>
          <div className="kpi-value" style={{ fontSize: '1.125rem', color: '#38bdf8' }}>
            Sentinel-1 SAR
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
            {new Date(satelliteSummary.latestObservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC • Sonitpur
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#34d399' } as React.CSSProperties}>
          <div className="kpi-label">Areas Monitored</div>
          <div className="kpi-value" style={{ color: '#34d399' }}>
            {satelliteSummary.areasMonitored} States
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
            35 Critical Corridors
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#0284c7' } as React.CSSProperties}>
          <div className="kpi-label">Flood Detections</div>
          <div className="kpi-value" style={{ color: '#38bdf8' }}>
            {satelliteSummary.floodDetections} Zones
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
            18.6 km² Inundation Area
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' } as React.CSSProperties}>
          <div className="kpi-label">Possible Landslides</div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            {satelliteSummary.possibleLandslides} Anomalies
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
            Optical NDVI Slope Scars
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#ef4444' } as React.CSSProperties}>
          <div className="kpi-label">Roads Affected</div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>
            {satelliteSummary.roadsAffected} Corridors
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
            NH-15 (Risk: 84, Submerged)
          </div>
        </div>

        <div className="kpi-card" style={{ '--kpi-color': '#ec4899' } as React.CSSProperties}>
          <div className="kpi-label">Critical Meds At Risk</div>
          <div className="kpi-value" style={{ color: '#f472b6' }}>
            {satelliteSummary.criticalShipmentsAffected} Shipments
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
            Oxygen & Rabies Vaccines
          </div>
        </div>
      </div>

      {/* ── Navigation Tab Bar ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.5rem',
          marginBottom: '1.25rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'overview', label: 'Surveillance & Observations', count: satelliteObservations.length },
          { id: 'sar', label: 'Sentinel-1 SAR Flood Analysis', badge: 'RADAR' },
          { id: 'optical', label: 'Sentinel-2 Optical & Cloud', badge: 'MSI' },
          { id: 'compare', label: 'Before/After Change Slider', badge: 'DIFF' },
          { id: 'logistics', label: 'Logistics & Medicine Disruption', count: currentObs.roadImpact?.criticalShipmentsCount },
          { id: 'field', label: 'Field Verification Dispatch', badge: 'HITL' },
          { id: 'admin', label: 'Admin Copernicus Management', badge: satelliteAdminConfig.connected ? 'ONLINE' : 'CONFIG' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '6px',
              border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid transparent',
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                }}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span
                style={{
                  fontSize: '0.625rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  color: activeTab === tab.id ? '#38bdf8' : '#64748b',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Surveillance & Observations Deck ── */}
      {activeTab === 'overview' && (
        <div>
          {/* Search & Filter Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>State</label>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="form-select"
                style={{ minWidth: '140px', fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
              >
                <option value="all">All 8 NER States</option>
                {NER_STATES.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>Satellite</label>
              <select
                value={selectedSatellite}
                onChange={e => setSelectedSatellite(e.target.value)}
                className="form-select"
                style={{ minWidth: '130px', fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
              >
                <option value="ALL">All Satellites</option>
                <option value="Sentinel-1">Sentinel-1 (SAR)</option>
                <option value="Sentinel-2">Sentinel-2 (Optical)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase' }}>Road Corridor</label>
              <select
                value={searchRoadId}
                onChange={e => setSearchRoadId(e.target.value)}
                className="form-select"
                style={{ minWidth: '150px', fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
              >
                <option value="all">All Road Corridors</option>
                {roads.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.number} ({r.name})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#94a3b8' }}>
                <span>Max Cloud Cover:</span>
                <span style={{ color: '#38bdf8' }}>{maxCloudFilter}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={maxCloudFilter}
                onChange={e => setMaxCloudFilter(parseInt(e.target.value))}
                style={{ width: '110px', height: '4px', accentColor: '#38bdf8' }}
              />
            </div>

            <div style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>{isSearching ? 'Querying CDSE...' : 'Search Observations'}</span>
              </button>
            </div>
          </div>

          {/* Observations Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {satelliteObservations.map(obs => {
              const isSelected = currentObs.id === obs.id;
              const isSAR = obs.satellite === 'Sentinel-1';
              const accentColor = isSAR ? '#38bdf8' : '#34d399';

              return (
                <div
                  key={obs.id}
                  onClick={() => selectSatelliteObservation(obs)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    borderRadius: '10px',
                    border: isSelected ? `2px solid ${accentColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 0 20px ${accentColor}33` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <SatelliteIcon size={14} style={{ color: accentColor }} />
                      <strong style={{ fontSize: '0.875rem', color: accentColor }}>
                        {obs.satellite} ({obs.sensor})
                      </strong>
                    </div>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: obs.isDemo ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: obs.isDemo ? '#facc15' : '#4ade80',
                      }}
                    >
                      {obs.isDemo ? 'DEMO / SAMPLE DATA' : 'LIVE API'}
                    </span>
                  </div>

                  {/* Satellite Image Preview with Resolution Overlay */}
                  <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                    <img
                      src={obs.imageUrl}
                      alt="Satellite Observation"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        color: '#94a3b8',
                      }}
                    >
                      Res: {obs.spatialResolutionMeters}m {obs.radarPolarization ? `• ${obs.radarPolarization}` : ''}
                    </div>

                    {obs.cloudCoverage !== undefined && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: obs.cloudCoverage > 30 ? 'rgba(239, 68, 68, 0.85)' : 'rgba(15, 23, 42, 0.85)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          color: '#f8fafc',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <WeatherCloudIcon size={11} /> {obs.cloudCoverage}% Cloud
                      </div>
                    )}

                    {obs.detection && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          background: obs.detection.severity === 'CRITICAL' ? 'rgba(220, 38, 38, 0.9)' : 'rgba(217, 119, 6, 0.9)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <HazardIcon size={12} />
                        <span>{obs.detection.detectionType.replace(/_/g, ' ')} ({obs.detection.areaKm2} km²)</span>
                      </div>
                    )}
                  </div>

                  {/* Card Metadata Details */}
                  <div style={{ padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
                      {obs.districtName}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginBottom: '8px' }}>
                      {obs.stateName} • Corridors: {obs.nearbyRoadNumbers.join(', ')}
                    </div>

                    <div style={{ fontSize: '0.6875rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      <strong>Acquisition:</strong> {new Date(obs.acquisitionTime).toUTCString()}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', wordBreak: 'break-all', marginBottom: '10px' }}>
                      ID: {obs.productId}
                    </div>

                    {/* Cloud Warning Banner */}
                    {obs.isCloudCovered && (
                      <div
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          fontSize: '0.6875rem',
                          color: '#f87171',
                          marginBottom: '8px',
                        }}
                      >
                        {obs.cloudSuitabilityWarning}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setHighResModalUrl(obs.imageUrl);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}
                      >
                        VIEW
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          selectSatelliteObservation(obs);
                          onOpenMap && onOpenMap();
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}
                      >
                        ADD TO MAP
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          selectSatelliteObservation(obs);
                          setActiveTab('compare');
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}
                      >
                        COMPARE
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleAnalyze(obs.id);
                        }}
                        disabled={analysisInProgress}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}
                      >
                        ANALYZE AI
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: Sentinel-1 SAR Flood Analysis ── */}
      {activeTab === 'sar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Left: SAR Pipeline & Radar View */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="card-title" style={{ fontSize: '1rem', color: '#38bdf8' }}>
                Sentinel-1 Synthetic Aperture Radar (SAR) Pipeline
              </div>
              <span className="badge badge-primary">VV/VH DUAL POLARIZATION</span>
            </div>

            {/* Pipeline Flowchart */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                fontSize: '0.6875rem',
                color: '#94a3b8',
                marginBottom: '1rem',
              }}
            >
              <span>Sentinel-1 GRD</span>
              <span>→</span>
              <span>Speckle Filter</span>
              <span>→</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Backscatter Threshold</span>
              <span>→</span>
              <span style={{ color: '#4ade80', fontWeight: 700 }}>Flood Polygon</span>
              <span>→</span>
              <span>PostGIS Spatial ∩</span>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)', marginBottom: '1rem' }}>
              <img
                src="/reality/sentinel1_sar_flood.jpg"
                alt="Sentinel-1 SAR Flood"
                style={{ width: '100%', height: '240px', objectFit: 'cover' }}
              />
            </div>

            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              <strong>Radar Scattering Principle:</strong> Smooth open water acts as a specular reflector, scattering microwave pulses away from the radar antenna. Inundated zones yield very low backscatter (&lt; -16 dB, represented in dark navy/cyan), sharply distinguishing them from rough mountainous terrain.
            </div>
          </div>

          {/* Right: Detected Flood Attributes & Spatial Intersection */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '1rem' }}>
              PostGIS Spatial Analysis & Submersion Metrics
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Detected Flood Inundation</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>18.6 km²</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Submerged Roadway Length</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>3.8 km (NH-15)</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Estimated Water Depth</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#facc15' }}>~110 cm</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>AI Confidence Calibration</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4ade80' }}>88.4% [HIGH]</div>
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#f87171', marginBottom: '4px' }}>
                Corridor Intersection: NH-15 (Sonitpur Riverine Segment)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                Spatial intersection calculated with Road NH-15 vector between Km 40.2 and Km 44.0. Roadbed is impassable for standard logistical fleet. 3 medical supply trucks held at Tezpur staging area.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setActiveTab('logistics')}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                View Supply Disruption & Route B
              </button>
              <button
                onClick={onOpenMap}
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
              >
                Show Flood Polygon on GIS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Sentinel-2 Optical & Cloud Analysis ── */}
      {activeTab === 'optical' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#34d399', marginBottom: '1rem' }}>
              Sentinel-2 MSI Optical Terrain & Land Monitoring
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)', marginBottom: '1rem' }}>
              <img
                src="/reality/sentinel2_optical_dry.jpg"
                alt="Sentinel-2 Optical"
                style={{ width: '100%', height: '230px', objectFit: 'cover' }}
              />
            </div>

            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              <strong>Multispectral Band Analysis (B2, B3, B4, B8):</strong> Optical imagery provides 10-meter spatial resolution for visual validation, escarpment scar identification, and vegetation damage mapping along highway corridors.
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#f59e0b', marginBottom: '1rem' }}>
              Cloud Coverage Threshold & Fallback Engine
            </div>

            {/* Cloud Warning Alert Demonstration */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.875rem', marginBottom: '6px' }}>
                <WeatherCloudIcon size={16} />
                <span>Sentinel-2 observation unsuitable because of cloud conditions.</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                Optical observation over <strong>Tawang High Pass Range</strong> detected <strong>71.4% cloud coverage</strong> exceeding the maximum 30% operational threshold for automated feature detection.
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  onClick={() => setActiveTab('sar')}
                  className="btn btn-sm"
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.75rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  Switch to Sentinel-1 SAR (Radar Cloud Penetration)
                </button>
              </div>
            </div>

            <div style={{ padding: '0.875rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                Automated Sensor Selection Protocol
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.5' }}>
                <li>Cloud Cover &lt; 30%: Run Sentinel-2 Multispectral NDVI / NDWI change analysis.</li>
                <li>Cloud Cover &gt; 30%: Flag optical data as unsuitable and automatically ingest Sentinel-1 C-Band SAR radar data.</li>
                <li>Night Passes: Automatically route to Sentinel-1 SAR active microwave illumination.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Draggable Before / After Change Slider ── */}
      {activeTab === 'compare' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div className="card-title" style={{ fontSize: '1rem', color: '#38bdf8' }}>
                SATELLITE CHANGE DETECTION — PREVIOUS VS. LATEST OBSERVATION
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                Drag the interactive slider to compare the pre-monsoon dry highway corridor with the post-flood SAR inundation.
              </p>
            </div>
            <span className="badge badge-warning">CHANGE AREA: 18.6 km²</span>
          </div>

          {/* Draggable Slider Container */}
          <div
            onMouseMove={handleMouseMove}
            onMouseDown={() => setIsDraggingSlider(true)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            style={{
              position: 'relative',
              width: '100%',
              height: '420px',
              borderRadius: '10px',
              overflow: 'hidden',
              cursor: 'ew-resize',
              userSelect: 'none',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Background Image: Post-Hazard (Sentinel-1 SAR / Flood) */}
            <img
              src="/reality/sentinel1_sar_flood.jpg"
              alt="Latest Satellite Observation"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />

            {/* Foreground Image: Pre-Hazard Baseline clipped by sliderPosition */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${sliderPosition}%`,
                overflow: 'hidden',
                borderRight: '3px solid #38bdf8',
                boxShadow: '4px 0 16px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src="/reality/sentinel2_optical_dry.jpg"
                alt="Previous Satellite Baseline"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${(100 / sliderPosition) * 100}%`,
                  maxWidth: 'none',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                }}
              >
                PREVIOUS OBSERVATION (2026-08-25 • DRY BASELINE)
              </div>
            </div>

            {/* Right Tag */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
              }}
            >
              LATEST OBSERVATION (2026-09-04 • POST-FLOOD SAR)
            </div>

            {/* Slider Handle */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${sliderPosition}%`,
                transform: 'translate(-50%, -50%)',
                width: '38px',
                height: '38px',
                background: '#0f172a',
                border: '3px solid #38bdf8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                fontSize: '14px',
                fontWeight: 800,
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.8)',
                pointerEvents: 'none',
              }}
            >
              ⟷
            </div>
          </div>

          {/* Change Comparison Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginTop: '1.25rem',
            }}
          >
            <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Baseline Date</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>2026-08-25T05:22:00Z</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Observation Date</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>2026-09-04T05:22:18Z</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Detected Change Area</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>+18.6 km² Inundation</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Confidence Level</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4ade80' }}>91.2% Calibrated</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Supply Chain & Medicine Disruption ── */}
      {activeTab === 'logistics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Road Risk Recalculation & Impact */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#ef4444', marginBottom: '1rem' }}>
              Road Risk & Accessibility Impact: NH-15 (Sonitpur)
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Road Risk Index</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  <span style={{ color: '#4ade80' }}>34</span> → <span style={{ color: '#ef4444' }}>84/100</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#f87171' }}>HIGH RISK / BLOCKED</div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Corridor Accessibility</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  <span style={{ color: '#4ade80' }}>78%</span> → <span style={{ color: '#ef4444' }}>24%</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#f87171' }}>-54% Accessibility Drop</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <strong>Accessibility Explanation:</strong> Accessibility decreased from 78% to 24% because a satellite-derived flood area intersects the monitored road corridor (3.8 km submerged carriage-way).
            </div>

            <div className="card-title" style={{ fontSize: '0.875rem', color: '#f472b6', marginBottom: '0.5rem' }}>
              Critical Medicine & Food Convoys Intercepted
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {[
                { title: 'Oxygen Cylinders (Tawang Civil Hospital)', vehicle: 'TRK-AR-04', priority: 'CRITICAL', status: 'REROUTED TO ROUTE B' },
                { title: 'Emergency Antivenom & Rabies Vaccines (Tezpur PHC)', vehicle: 'TRK-AS-01', priority: 'CRITICAL', status: 'REROUTED TO ROUTE B' },
                { title: 'Dialysis Fluids & Critical Antibiotics (West Kameng)', vehicle: 'TRK-AS-09', priority: 'HIGH', status: 'HOLD AT BALIPARA' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.625rem 0.75rem',
                    background: 'rgba(244, 114, 182, 0.08)',
                    borderRadius: '6px',
                    border: '1px solid rgba(244, 114, 182, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>{item.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Vehicle: {item.vehicle}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Route Optimizer Bypass Recommendation */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#c084fc', marginBottom: '1rem' }}>
              Route Optimizer: Bypass Route B Recommendation
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#f87171', fontWeight: 700 }}>CURRENT ROUTE (NH-15)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#ef4444', margin: '4px 0' }}>Risk: 84%</div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>3.8 km Submerged • BLOCKED</div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#4ade80', fontWeight: 700 }}>RECOMMENDED (ROUTE B)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#4ade80', margin: '4px 0' }}>Risk: 21%</div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Bhalukpong Loop (+38m delay)</div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                borderLeft: '3px solid #a855f7',
                padding: '0.875rem',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#c084fc', marginBottom: '4px' }}>
                WHY THIS ROUTE? (AI Decision Audit)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {currentObs.roadImpact?.whyThisRouteExplanation ||
                  'Route B avoids the 3.8 km submerged carriage-way on NH-15 by routing via elevated foothill terrain (Risk: 21/100 vs Current: 84/100). Essential medical convoys maintain 94% delivery certainty with a transit variance of +38 minutes.'}
              </div>
            </div>

            {onNavigateRoutes && (
              <button
                onClick={onNavigateRoutes}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', padding: '0.5rem' }}
              >
                Open Full Interactive Route Optimizer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 6: Field Officer Verification Dispatch ── */}
      {activeTab === 'field' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#f59e0b', marginBottom: '1rem' }}>
              Field Verification Dispatch Loop
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '1rem' }}>
              When satellite optical or radar analysis provides an inference with confidence requiring ground truth confirmation, the system dispatches a geotagged verification mission to the nearest Field Officer.
            </p>

            <div style={{ padding: '0.875rem', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.8125rem', color: '#f8fafc' }}>SATELLITE AI INFERENCE</strong>
                <span className="badge badge-warning">NEEDS FIELD VERIFICATION</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
                Target: Papum Pare Escarpment Slope (NH-15 Cut) • Confidence: 78.5%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '8px' }}>
                <strong>Evidence Image:</strong> Sentinel-2 NDVI anomaly indicates localized slope canopy stripping.
              </div>
              <button
                onClick={() => requestFieldVerificationForSatellite('sat-obs-papum-02')}
                className="btn btn-sm"
                style={{
                  background: '#f59e0b',
                  color: '#0f172a',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                }}
              >
                REQUEST FIELD VERIFICATION
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '1rem' }}>
              Field Officer Mission Packet
            </div>

            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Coordinates:</strong> 27.0844° N, 93.6053° E</div>
              <div><strong>Assigned Officer:</strong> Bimal Das (Field Officer • Nagaon/Sonitpur Unit)</div>
              <div><strong>Hazard Classification:</strong> Incipient Mudslip / Escarpment Soil Creep</div>
              <div><strong>Ground Photo:</strong> Required within 4 hours (offline-first sync enabled)</div>
              <div><strong>Field Notes:</strong> Check culvert 14.2 drainage discharge.</div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', marginBottom: '2px' }}>
                Closed-Loop Intelligence Guarantee:
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                Once verified by the field officer's mobile app, road risk automatically updates from PROVISIONAL to VERIFIED in the central digital twin.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: Admin Copernicus Management ── */}
      {activeTab === 'admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Connection Status & Instructions */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '1rem' }}>
              Copernicus Data Space Ecosystem (CDSE) Integration
            </div>

            <div
              style={{
                padding: '0.875rem',
                borderRadius: '8px',
                background: satelliteAdminConfig.connected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                border: `1px solid ${satelliteAdminConfig.connected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.875rem', color: satelliteAdminConfig.connected ? '#4ade80' : '#facc15' }}>
                  {satelliteAdminConfig.connected ? '● CONNECTED TO COPERNICUS' : '● SATELLITE API NOT CONFIGURED'}
                </strong>
                <span className="badge badge-outline">{satelliteAdminConfig.syncStatus}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {satelliteAdminConfig.connected
                  ? 'Authenticated via OAuth2 with Copernicus Data Space Ecosystem. Automated Sentinel-1 & Sentinel-2 ingestion active.'
                  : 'Backend credentials (COPERNICUS_CLIENT_ID and COPERNICUS_CLIENT_SECRET) are not set. The platform is running in Verified Sample/Demo Mode for the North Eastern Region.'}
              </div>
            </div>

            {/* Setup Instructions */}
            <div style={{ padding: '0.875rem', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
                Free User Quota Setup Instructions
              </div>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.6' }}>
                <li>Register a free account at <strong style={{ color: '#38bdf8' }}>dataspace.copernicus.eu</strong></li>
                <li>Go to User Profile → API Keys and generate an OAuth2 Client ID and Secret.</li>
                <li>Add credentials to <code style={{ color: '#f472b6' }}>.env.local</code>:
                  <div style={{ background: '#0f172a', padding: '6px', borderRadius: '4px', margin: '4px 0', fontFamily: 'monospace', fontSize: '0.6875rem', color: '#38bdf8' }}>
                    COPERNICUS_CLIENT_ID=your_id_here<br/>
                    COPERNICUS_CLIENT_SECRET=your_secret_here
                  </div>
                </li>
                <li>Restart server to enable live querying without quota exhaustion.</li>
              </ol>
            </div>
          </div>

          {/* Monitoring Controls & Job Logs */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: '#38bdf8', marginBottom: '1rem' }}>
              Ingestion Settings & Monitored States
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>Sentinel-1 C-Band SAR Ingestion</span>
                <input
                  type="checkbox"
                  checked={satelliteAdminConfig.sentinel1Enabled}
                  onChange={e => updateSatelliteAdminConfig({ sentinel1Enabled: e.target.checked })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>Sentinel-2 Optical (MSI) Ingestion</span>
                <input
                  type="checkbox"
                  checked={satelliteAdminConfig.sentinel2Enabled}
                  onChange={e => updateSatelliteAdminConfig({ sentinel2Enabled: e.target.checked })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>Automated Search Interval</span>
                <span style={{ fontSize: '0.8125rem', color: '#38bdf8', fontWeight: 600 }}>Every 6 Hours</span>
              </div>
            </div>

            <div className="card-title" style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Recent Scheduled Processing Jobs
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {satelliteAdminConfig.processingJobs.map(job => (
                <div
                  key={job.id}
                  style={{
                    padding: '0.625rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.6875rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ color: '#f8fafc' }}>{job.areaName}</strong>
                    <span style={{ color: job.status === 'COMPLETED' ? '#4ade80' : '#ef4444' }}>{job.status}</span>
                  </div>
                  <div style={{ color: '#94a3b8' }}>
                    {job.satellite} • {job.logMessage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── High-Resolution View Modal ── */}
      {highResModalUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setHighResModalUrl(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#0f172a',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              overflow: 'hidden',
              boxShadow: '0 0 32px rgba(56, 189, 248, 0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#1e293b' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                High-Resolution Orbital Remote Sensing Inspection
              </span>
              <button
                onClick={() => setHighResModalUrl(null)}
                className="btn btn-ghost btn-icon btn-sm"
              >
                <CloseIcon size={14} />
              </button>
            </div>
            <img
              src={highResModalUrl}
              alt="High Resolution Satellite"
              style={{ maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
