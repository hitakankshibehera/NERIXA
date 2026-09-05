// ============================================================
// NER-SHIELD AI — Admin Map Intelligence Configuration Modal
// Admin console controls for Google Maps API credentials,
// active map modes, default region, and 15 intelligence layers.
// ============================================================

'use client';

import React, { useState } from 'react';
import type { AdminMapConfig, MapMode } from '@/lib/types/googleMaps';
import { GearIcon, CloseIcon } from '@/components/common/Icons';

interface AdminMapConfigModalProps {
  config: AdminMapConfig;
  onSaveConfig: (updated: AdminMapConfig) => void;
  onClose: () => void;
}

export default function AdminMapConfigModal({
  config,
  onSaveConfig,
  onClose,
}: AdminMapConfigModalProps) {
  const [apiKey, setApiKey] = useState(config.googleMapsApiKey || '');
  const [defaultMode, setDefaultMode] = useState<MapMode>(config.defaultMapMode);
  const [region, setRegion] = useState(config.defaultRegion);
  const [enableSplit, setEnableSplit] = useState(config.enableSplitView);
  const [enableClustering, setEnableClustering] = useState(config.enableClustering);
  const [layers, setLayers] = useState({ ...config.enabledLayers });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (apiKey) {
        localStorage.setItem('nerixa_gmaps_api_key', apiKey.trim());
      } else {
        localStorage.removeItem('nerixa_gmaps_api_key');
      }
    }

    onSaveConfig({
      ...config,
      googleMapsApiKey: apiKey.trim(),
      isKeyConfigured: apiKey.trim().length > 10,
      defaultMapMode: defaultMode,
      defaultRegion: region,
      enableSplitView: enableSplit,
      enableClustering,
      enabledLayers: layers,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(14px)',
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
          maxWidth: '680px',
          background: '#090d16',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 22px',
            background: 'rgba(15, 23, 42, 0.96)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GearIcon size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                ADMIN MAP & GOOGLE PLATFORM CONFIGURATION
              </h3>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Manage API credentials, default viewports, and active operational intelligence layers
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

        {/* ── Modal Body ── */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Section 1: Google Maps API Key */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
              Google Maps JavaScript API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to run on High-Res GIS Fallback Engine)"
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px', lineHeight: 1.4 }}>
              Protected credential store. When configured, official Google Maps JS API and Street View are invoked. When blank, system gracefully activates the resilient Leaflet/Esri multi-spectral satellite engine.
            </div>
          </div>

          {/* Section 2: Default Map Mode & Region */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                Default Map Mode
              </label>
              <select
                value={defaultMode}
                onChange={(e) => setDefaultMode(e.target.value as MapMode)}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              >
                <option value="roadmap">ROADMAP (Vector Navigation)</option>
                <option value="satellite">SATELLITE (High-Res Photorealistic)</option>
                <option value="hybrid">HYBRID (Satellite + Road Labels)</option>
                <option value="terrain">TERRAIN (Topographic Elevation)</option>
                <option value="streetview">STREET VIEW (Ground Reality Split)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                Operational Region Center
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>

          {/* Section 3: Operational Toggles */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableSplit}
                onChange={(e) => setEnableSplit(e.target.checked)}
                style={{ accentColor: '#38bdf8' }}
              />
              Enable Map + Street View Split Mode
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableClustering}
                onChange={(e) => setEnableClustering(e.target.checked)}
                style={{ accentColor: '#38bdf8' }}
              />
              Marker Clustering (High-Density Viewports)
            </label>
          </div>

          {/* Section 4: 15 Intelligence Layer Toggles */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase' }}>
              15 Operational Intelligence Layers
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {Object.entries(layers).map(([key, val]) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: val ? '#f1f5f9' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => toggleLayer(key as keyof typeof layers)}
                    style={{ accentColor: '#38bdf8' }}
                  />
                  <span>
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div
          style={{
            padding: '14px 22px',
            background: 'rgba(15, 23, 42, 0.96)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: savedSuccess ? '#34d399' : '#94a3b8' }}>
            {savedSuccess ? 'Configuration saved successfully!' : 'Changes apply immediately to live map view'}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '7px 18px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
