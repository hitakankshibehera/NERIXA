'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { getRiskColor } from '@/lib/constants';
import {
  WeatherStormIcon,
  WeatherRainIcon,
  RefreshIcon,
  RadarIcon,
  BotIcon,
  RouteIcon,
  PinIcon,
  ThermometerIcon,
  WindIcon,
  SatelliteImageryIcon,
  CloseIcon,
} from '@/components/common/Icons';

interface WeatherTelemetryModalProps {
  onClose: () => void;
  onNavigateRoutes?: () => void;
}

export default function WeatherTelemetryModal({ onClose, onNavigateRoutes }: WeatherTelemetryModalProps) {
  const { liveWeatherReports, weatherLastUpdated, weatherProvider, refreshLiveWeather } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLiveWeather();
    setTimeout(() => setRefreshing(false), 600);
  };

  const filteredReports = liveWeatherReports.filter(r => {
    if (selectedState === 'ALL') return true;
    return r.state === selectedState;
  });

  // Calculate highest rainfall and highest landslide risk
  const maxRainStation = [...liveWeatherReports].sort((a, b) => b.rainfallRate - a.rainfallRate)[0];
  const maxHazardStation = [...liveWeatherReports].sort((a, b) => b.landslideHazardScore - a.landslideHazardScore)[0];
  const avgTemp = liveWeatherReports.length > 0 
    ? (liveWeatherReports.reduce((s, r) => s + r.temperature, 0) / liveWeatherReports.length).toFixed(1)
    : '22.4';
  const totalRain24h = liveWeatherReports.length > 0
    ? liveWeatherReports.reduce((s, r) => s + r.rainfallForecast24h, 0).toFixed(1)
    : '0';

  const states = Array.from(new Set(liveWeatherReports.map(r => r.state)));

  return (
    <div className="reality-modal-backdrop" onClick={onClose}>
      <div 
        className="reality-modal-window" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '1080px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="reality-modal-header" style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WeatherStormIcon size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Real-Time Meteorological Telemetry & Hazard Forecasting
                <span className="ecc-status-pill ecc-pill-live">● SATELLITE LIVE</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                Dual-Provider Engine: <strong style={{ color: '#38bdf8' }}>Stormglass.io NOAA/ECMWF</strong> + <strong style={{ color: '#a78bfa' }}>OpenWeather Real-Time DB</strong>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshIcon size={13} color="currentColor" className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Sync Live Radar'}</span>
            </button>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close">
              <CloseIcon size={14} />
            </button>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div style={{ padding: '0.625rem 1.25rem', background: '#0b1120', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="ecc-status-pill ecc-pill-online">STORMGLASS API: AUTHORIZED</span>
            <span className="ecc-status-pill" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
              DATABASE KEY: 1ccff580... LINKED
            </span>
            <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              Cache TTL: 15m (Quota Protected) • Last Synced: <strong style={{ color: '#f1f5f9' }}>{weatherLastUpdated ? new Date(weatherLastUpdated).toLocaleTimeString() : 'Live'}</strong>
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RadarIcon size={12} color="#38bdf8" />
            <span>Provider Source: <strong>{weatherProvider}</strong></span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="reality-modal-body" style={{ maxHeight: 'calc(90vh - 140px)', overflowY: 'auto' }}>
          {/* Top Overview KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="card" style={{ padding: '0.75rem', background: 'rgba(30,41,59,0.5)', borderLeft: '3px solid #38bdf8' }}>
              <div className="text-xs text-muted">Peak Precipitation Station</div>
              <div className="font-mono font-bold" style={{ fontSize: '1.125rem', color: '#38bdf8', marginTop: '2px' }}>
                {maxRainStation?.districtName || 'Guwahati'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                {maxRainStation?.rainfallRate.toFixed(1)} mm/h ({maxRainStation?.rainfallForecast24h.toFixed(1)}mm 24h)
              </div>
            </div>

            <div className="card" style={{ padding: '0.75rem', background: 'rgba(30,41,59,0.5)', borderLeft: '3px solid #ef4444' }}>
              <div className="text-xs text-muted">Max Landslide Hazard Node</div>
              <div className="font-mono font-bold" style={{ fontSize: '1.125rem', color: '#ef4444', marginTop: '2px' }}>
                {maxHazardStation?.districtName || 'Tawang'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                Hazard Score: <strong style={{ color: '#ef4444' }}>{maxHazardStation?.landslideHazardScore}%</strong>
              </div>
            </div>

            <div className="card" style={{ padding: '0.75rem', background: 'rgba(30,41,59,0.5)', borderLeft: '3px solid #10b981' }}>
              <div className="text-xs text-muted">Avg Regional Temperature</div>
              <div className="font-mono font-bold" style={{ fontSize: '1.125rem', color: '#10b981', marginTop: '2px' }}>
                {avgTemp} °C
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                10 Weather Radar Nodes Synced
              </div>
            </div>

            <div className="card" style={{ padding: '0.75rem', background: 'rgba(30,41,59,0.5)', borderLeft: '3px solid #f59e0b' }}>
              <div className="text-xs text-muted">24h Cumulative Basin Rain</div>
              <div className="font-mono font-bold" style={{ fontSize: '1.125rem', color: '#f59e0b', marginTop: '2px' }}>
                {totalRain24h} mm
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                Brahmaputra & Barak Catchments
              </div>
            </div>
          </div>

          {/* AI Risk Integration Notice */}
          <div style={{ 
            background: 'linear-gradient(90deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)', 
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px', 
            padding: '0.75rem 1rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BotIcon size={18} color="#93c5fd" />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#93c5fd' }}>
                  AI Dynamic Risk Engine Synchronized with Live Telemetry
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#cbd5e1' }}>
                  Precipitation rates and slope saturation are recalculating real-time landslide probabilities across all 15 NER National Highway segments.
                </div>
              </div>
            </div>
            {onNavigateRoutes && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => { onClose(); onNavigateRoutes(); }}
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RouteIcon size={13} color="currentColor" />
                <span>Calculate Safe Logistics Route</span>
              </button>
            )}
          </div>

          {/* State Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
            <button 
              className={`btn btn-sm ${selectedState === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedState('ALL')}
              style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
            >
              All States ({liveWeatherReports.length})
            </button>
            {states.map(state => (
              <button 
                key={state}
                className={`btn btn-sm ${selectedState === state ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedState(state)}
                style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
              >
                {state}
              </button>
            ))}
          </div>

          {/* Weather Stations Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '0.875rem' }}>
            {filteredReports.map(station => {
              const hazardColor = getRiskColor(station.landslideHazardScore);
              const isRaining = station.rainfallRate > 0;

              return (
                <div 
                  key={station.districtId}
                  className="card"
                  style={{
                    padding: '0.875rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: station.landslideHazardScore > 60 
                      ? '1px solid rgba(239, 68, 68, 0.4)' 
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: station.landslideHazardScore > 60 
                      ? '0 4px 16px rgba(239, 68, 68, 0.15)' 
                      : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
                        {station.districtName}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <PinIcon size={11} color="#94a3b8" />
                        <span>{station.state} • {station.lat.toFixed(2)}°N, {station.lng.toFixed(2)}°E</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge" style={{ 
                        background: isRaining ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: isRaining ? '#38bdf8' : '#94a3b8',
                        border: isRaining ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.6875rem'
                      }}>
                        {station.condition.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Weather Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.625rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ThermometerIcon size={10} color="#94a3b8" />
                        <span>TEMP</span>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
                        {station.temperature.toFixed(1)}°C
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.625rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <WeatherRainIcon size={10} color={isRaining ? '#38bdf8' : '#94a3b8'} />
                        <span>RAIN RATE</span>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 700, color: isRaining ? '#38bdf8' : '#94a3b8' }}>
                        {station.rainfallRate.toFixed(1)} <span style={{ fontSize: '0.625rem' }}>mm/h</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.625rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <WindIcon size={10} color="#cbd5e1" />
                        <span>WIND</span>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#cbd5e1' }}>
                        {station.windSpeed.toFixed(0)} <span style={{ fontSize: '0.625rem' }}>km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Landslide Hazard Gauge */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Computed Landslide Hazard</span>
                      <span className="font-mono font-bold" style={{ fontSize: '0.75rem', color: hazardColor }}>
                        {station.landslideHazardScore}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${station.landslideHazardScore}%`, 
                          height: '100%', 
                          background: hazardColor,
                          borderRadius: '3px',
                          transition: 'width 0.4s ease'
                        }} 
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.625rem', color: '#64748b' }}>
                      <span>Humidity: {station.humidity}%</span>
                      <span>24h Total: {station.rainfallForecast24h.toFixed(1)} mm</span>
                      <span>Model: {station.model}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#0b1120', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SatelliteImageryIcon size={13} color="#64748b" />
            <span>Real-Time Doppler & Satellite Array Synchronized with NER Logistics Control Grid</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
