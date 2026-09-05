// ============================================================
// NER-SHIELD AI — Main Application Page
// Single-page command center with internal routing
// ============================================================
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { t } from '@/lib/i18n/translations';
import { getRiskLevel, getRiskColor, RISK_LEVELS, ALERT_COLORS, COMMODITY_CONFIG, VEHICLE_STATUS_COLORS, NER_STATES, MAP_LAYERS } from '@/lib/constants';
import { processCommanderQuery } from '@/lib/ai/commander';
import type { Road, RouteRequest, SimulationScenario, Incident, Alert, RiskPrediction, RouteOption, SimulationResult, CommanderResponse, IncidentType, UserRole } from '@/lib/types';
import dynamic from 'next/dynamic';
import WeatherTelemetryModal from '@/components/WeatherTelemetryModal';
import ImageIntelligenceHub from '@/components/ImageIntelligenceHub';
import SatelliteIntelligenceHub from '@/components/SatelliteIntelligenceHub';
import {
  ShieldIcon,
  DashboardIcon,
  SatelliteIcon,
  CameraIcon,
  DroneIcon,
  MapIcon,
  TruckIcon,
  BoxIcon,
  RadarIcon,
  RouteIcon,
  SimulationIcon,
  HazardIcon,
  AlertIcon,
  AnalyticsIcon,
  BotIcon,
  ScenarioIcon,
  LogOutIcon,
  PulseDotIcon,
  WeatherCloudIcon,
  WeatherStormIcon,
  CheckIcon,
  ChevronRightIcon,
  PinIcon,
  PaperAirplaneIcon,
  FileTextIcon,
  CloseIcon,
} from '@/components/common/Icons';

// Dynamically import map to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-tertiary)' }}><div className="loading-spinner" /></div> });

export type PortalRole = 'CUSTOMER' | 'SUPER_ADMIN' | 'STATE_ADMIN' | 'DISTRICT_OFFICER' | 'FIELD_OFFICER' | 'LOGISTICS_OPERATOR';

export interface PortalConfig {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  expectedRole: UserRole;
  isCustomer: boolean;
  officialQuickLogin?: { email: string; label: string; name: string };
  description: string;
  allowedNavItems: string[];
}

export const PORTAL_CONFIGS: Record<PortalRole, PortalConfig> = {
  CUSTOMER: {
    title: 'Public Citizen & Traveler Safety Portal',
    subtitle: 'Live road accessibility, flood alerts & weather intelligence across 8 North Eastern States',
    badge: 'PUBLIC CITIZEN ACCESS',
    badgeColor: '#10b981',
    expectedRole: 'VIEWER',
    isCustomer: true,
    description: 'Public traveler terminal. Access live road safety telemetry, active weather alerts, and report hazards directly to state authorities.',
    allowedNavItems: ['dashboard', 'map', 'reality', 'incidents', 'alerts', 'analytics'],
  },
  SUPER_ADMIN: {
    title: 'Super Admin National Command HQ',
    subtitle: 'Apex Disaster Management Authority • Full Strategic & Multi-Modal Intelligence',
    badge: 'SUPER ADMIN • CLASSIFIED LEVEL 1',
    badgeColor: '#ef4444',
    expectedRole: 'SUPER_ADMIN',
    isCustomer: false,
    officialQuickLogin: { email: 'admin@nershield.gov.in', label: 'Super Admin HQ (Dr. Rajesh Kumar)', name: 'Dr. Rajesh Kumar' },
    description: 'Supreme operations command. Full authority over AI Risk Engines, Copernicus Satellite SAR Feeds, Simulation Models, and inter-state convoys.',
    allowedNavItems: ['dashboard', 'satellite-intel', 'image-intel', 'reality', 'map', 'vehicles', 'shipments', 'risk', 'routes', 'simulation', 'incidents', 'alerts', 'analytics'],
  },
  STATE_ADMIN: {
    title: 'State Disaster Management Authority (SDMA)',
    subtitle: 'State Logistics Headquarters • Inter-District Emergency Command & Warehouse Mobilization',
    badge: 'STATE DISASTER ADMIN',
    badgeColor: '#3b82f6',
    expectedRole: 'STATE_ADMIN',
    isCustomer: false,
    officialQuickLogin: { email: 'state@nershield.gov.in', label: 'State Admin (Anupam Sharma)', name: 'Anupam Sharma' },
    description: 'State disaster oversight. Coordinate emergency convoys, monitor regional warehouse stockpiles, and dispatch inter-district relief resources.',
    allowedNavItems: ['dashboard', 'satellite-intel', 'reality', 'map', 'vehicles', 'shipments', 'risk', 'routes', 'simulation', 'incidents', 'alerts', 'analytics'],
  },
  DISTRICT_OFFICER: {
    title: 'District Emergency Operations Center (DEOC)',
    subtitle: 'District Magistrate Office • Local Incident Verification & Emergency Alert Dispatch',
    badge: 'DISTRICT OPERATIONS CENTER',
    badgeColor: '#a855f7',
    expectedRole: 'DISTRICT_OFFICER',
    isCustomer: false,
    officialQuickLogin: { email: 'officer@nershield.gov.in', label: 'District Officer (Priya Gogoi)', name: 'Priya Gogoi' },
    description: 'District emergency operations. Override local road blockage statuses, verify ground hazard incidents, and broadcast localized alert advisories.',
    allowedNavItems: ['dashboard', 'satellite-intel', 'image-intel', 'reality', 'map', 'risk', 'routes', 'incidents', 'alerts', 'analytics'],
  },
  FIELD_OFFICER: {
    title: 'Field First Responder Tactical Portal',
    subtitle: 'Ground Reconnaissance Units • SDRF/NDRF & Quick Action Response Teams',
    badge: 'FIELD TACTICAL UNIT',
    badgeColor: '#f97316',
    expectedRole: 'FIELD_OFFICER',
    isCustomer: false,
    officialQuickLogin: { email: 'field@nershield.gov.in', label: 'Field Officer (Bimal Das)', name: 'Bimal Das' },
    description: 'Ground reconnaissance terminal. Upload on-site camera imagery, clear obstacles, and submit offline reconnaissance reports.',
    allowedNavItems: ['dashboard', 'image-intel', 'reality', 'map', 'incidents', 'alerts', 'analytics'],
  },
  LOGISTICS_OPERATOR: {
    title: 'Strategic Convoy & Logistics Command',
    subtitle: 'Essential Commodities Fleet Control • Medical & Food Convoy Optimization',
    badge: 'CONVOY LOGISTICS COMMAND',
    badgeColor: '#06b6d4',
    expectedRole: 'LOGISTICS_OPERATOR',
    isCustomer: false,
    officialQuickLogin: { email: 'logistics@nershield.gov.in', label: 'Logistics Operator (Meena Borah)', name: 'Meena Borah' },
    description: 'Convoy routing and fleet telemetry. Optimize delivery paths around landslides, monitor truck telematics, and ensure vital hospital supply chains.',
    allowedNavItems: ['dashboard', 'reality', 'map', 'vehicles', 'shipments', 'routes', 'incidents', 'alerts', 'analytics'],
  },
};

// ── Auth Screen ──
function AuthScreen({ portalRole = 'CUSTOMER', portalTitle }: { portalRole?: PortalRole; portalTitle?: string }) {
  const { login, register, loginWithGoogle, authLoading, authError, clearAuthError, firebaseConnected } = useApp();
  const config = PORTAL_CONFIGS[portalRole] || PORTAL_CONFIGS.CUSTOMER;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      const assignedRole = config.isCustomer ? 'VIEWER' : config.expectedRole;
      await register(email, password, name, assignedRole);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: config.isCustomer ? '440px' : '480px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <ShieldIcon size={24} color="#ffffff" />
          </div>
          <h1>NER-SHIELD AI</h1>
          <p style={{ color: config.badgeColor, fontWeight: 600, fontSize: '0.8125rem' }}>
            {portalTitle || config.title}
          </p>
          
          <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '9999px', background: `${config.badgeColor}15`, border: `1px solid ${config.badgeColor}40`, fontSize: '0.6875rem', color: config.badgeColor }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.badgeColor, display: 'inline-block' }} />
            <span>{config.badge}</span>
          </div>

          <div style={{ marginTop: '0.375rem', fontSize: '0.6875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: firebaseConnected ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
            <span>Firebase: nerixa-2e6f6 {firebaseConnected ? '(Realtime Sync Active)' : '(Connecting...)'}</span>
          </div>
        </div>

        {!config.isCustomer ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#fca5a5', textAlign: 'center', lineHeight: 1.4 }}>
            <strong>RESTRICTED GOVERNMENT PORTAL:</strong> Authorized personnel only. All access is audited and synchronized with National Operations.
          </div>
        ) : (
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#6ee7b7', textAlign: 'center', lineHeight: 1.4 }}>
            <strong>PUBLIC CITIZEN & TRAVELER ACCESS:</strong> Real-time highway safety, live weather, and emergency road hazard reporting.
          </div>
        )}

        {authError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.625rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ lineHeight: 1.4 }}>{authError}</div>
            <button type="button" onClick={clearAuthError} style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
          </div>
        )}

        {!config.isCustomer && config.officialQuickLogin && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>
              Official Authorized Personnel Access
            </div>
            <button
              type="button"
              className="btn btn-primary w-full"
              style={{ background: config.badgeColor, borderColor: config.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={() => login(config.officialQuickLogin!.email, 'demo')}
            >
              <span>Authenticate as {config.officialQuickLogin.name}</span>
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.6875rem', color: '#64748b', marginTop: '0.375rem' }}>
              Official ID: {config.officialQuickLogin.email}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={config.isCustomer ? "e.g. Ananya Das" : "Official Name"}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{config.isCustomer ? "Email Address" : "Official Emergency Email"}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={config.isCustomer ? "yourname@example.com" : config.officialQuickLogin?.email || "officer@nershield.gov.in"}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={authLoading}
            style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {authLoading ? (
              <span>Authenticating...</span>
            ) : isLogin ? (
              config.isCustomer ? 'Sign In as Public Citizen' : 'Sign In with Official Credentials'
            ) : (
              config.isCustomer ? 'Create Citizen Account' : 'Register Authorized Officer'
            )}
          </button>
        </form>

        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={loginWithGoogle}
            disabled={authLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.8125rem',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setIsLogin(!isLogin);
              clearAuthError();
            }}
          >
            {isLogin ? (config.isCustomer ? 'New traveler? Register for safety alerts' : 'Register official credentials') : 'Already registered? Sign In'}
          </button>
        </div>

        {config.isCustomer && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.6875rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>Government & Emergency Responders</div>
            Official personnel must access their department terminal via designated secure URLs:<br />
            <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>/super-admin</span> • <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>/state-admin</span> • <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>/district-officer</span> • <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>/field-officer</span> • <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>/logistics-operator</span>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '1rem', lineHeight: 1.5 }}>
          Government of India — North Eastern Region<br />
          Ministry of Development of North Eastern Region • Firebase Database: nerixa-2e6f6
        </p>
      </div>
    </div>
  );
}

// ── Sidebar ──
function Sidebar({
  activePage,
  onNavigate,
  portalRole = 'CUSTOMER',
}: {
  activePage: string;
  onNavigate: (page: string) => void;
  portalRole?: PortalRole;
}) {
  const { user, alerts, demoState, language, imageIntelSummary, satelliteSummary } = useApp();
  const config = PORTAL_CONFIGS[portalRole] || PORTAL_CONFIGS.CUSTOMER;
  const criticalAlerts = alerts.filter(a => a.level === 'CRITICAL' && a.status === 'ACTIVE').length;

  const isViewer = config.isCustomer || user?.role === 'VIEWER';

  const allNavItems = [
    { id: 'dashboard', icon: DashboardIcon, label: isViewer ? 'Public Safety Dashboard' : t('nav.dashboard', language) },
    { id: 'satellite-intel', icon: SatelliteIcon, label: 'Satellite Intelligence', badge: (satelliteSummary?.floodDetections ?? 0) > 0 ? satelliteSummary?.floodDetections : undefined },
    { id: 'image-intel', icon: CameraIcon, label: 'Image Intelligence', badge: (imageIntelSummary?.criticalIncidents ?? 0) > 0 ? imageIntelSummary.criticalIncidents : undefined },
    { id: 'reality', icon: DroneIcon, label: 'Recon & Reality Feeds' },
    { id: 'map', icon: MapIcon, label: isViewer ? 'Public Highway Map' : t('nav.map', language) },
    { id: 'vehicles', icon: TruckIcon, label: t('nav.vehicles', language) },
    { id: 'shipments', icon: BoxIcon, label: t('nav.shipments', language) },
    { id: 'risk', icon: RadarIcon, label: t('nav.risk', language) },
    { id: 'routes', icon: RouteIcon, label: t('nav.routes', language) },
    { id: 'simulation', icon: SimulationIcon, label: t('nav.simulation', language) },
    { id: 'incidents', icon: HazardIcon, label: isViewer ? 'Report Road Hazard' : t('nav.incidents', language) },
    { id: 'alerts', icon: AlertIcon, label: isViewer ? 'Public Emergency Alerts' : t('nav.alerts', language), badge: criticalAlerts },
    { id: 'analytics', icon: AnalyticsIcon, label: isViewer ? 'Network Safety Score' : t('nav.analytics', language) },
  ];

  const navItems = allNavItems.filter(item => config.allowedNavItems.includes(item.id));

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: config.badgeColor }}>
          <ShieldIcon size={18} color="#ffffff" />
        </div>
        <div>
          <div className="sidebar-logo-text">NER-SHIELD AI</div>
          <div className="sidebar-logo-sub" style={{ color: config.badgeColor }}>
            {config.badge}
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            {config.isCustomer ? 'Public Navigation' : 'Operations Command'}
          </div>
          {navItems.map(item => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <IconComponent size={16} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
      {!config.isCustomer && demoState.isRunning && (
        <div style={{ padding: '0.625rem 0.75rem', borderTop: '1px solid var(--border-color)', background: 'rgba(239, 68, 68, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>
            <PulseDotIcon color="#ef4444" size={7} />
            <span>Interactive Demo: Step {demoState.currentStep}/{demoState.totalSteps}</span>
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Header ──
function Header({ 
  onCommanderToggle, 
  commanderOpen, 
  onOpenWeatherModal, 
  onNavigate,
  portalRole = 'CUSTOMER',
}: { 
  onCommanderToggle: () => void; 
  commanderOpen: boolean; 
  onOpenWeatherModal?: () => void; 
  onNavigate?: (page: string) => void;
  portalRole?: PortalRole;
}) {
  const { user, logout, toggleTheme, theme, language, setLanguage, startDemo, pauseDemo, resetDemo, demoState, liveWeatherReports, triggerHackathonImageScenario, runSatelliteFloodScenario, firebaseConnected } = useApp();
  const config = PORTAL_CONFIGS[portalRole] || PORTAL_CONFIGS.CUSTOMER;
  const topStation = liveWeatherReports.length > 0 ? liveWeatherReports[0] : null;

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <ShieldIcon size={15} color="#38bdf8" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.04em', color: '#f8fafc' }}>
            NER-SHIELD <span style={{ color: '#38bdf8' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '4px', background: `${config.badgeColor}15`, border: `1px solid ${config.badgeColor}40` }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.badgeColor, display: 'inline-block' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: config.badgeColor, letterSpacing: '0.04em' }}>
            {config.badge}
          </span>
        </div>

        <div style={{ display: 'none', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', color: '#64748b', fontFamily: 'var(--font-mono)' }} className="lg:flex">
          <PulseDotIcon color="#10b981" size={7} />
          <span>SYS.ONLINE 10Hz</span>
        </div>

        <div style={{ display: 'none', alignItems: 'center', gap: '5px', fontSize: '0.6875rem', color: firebaseConnected ? '#38bdf8' : '#94a3b8', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)' }} className="lg:flex" title="Firebase Realtime Database (nerixa-2e6f6)">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: firebaseConnected ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
          <span>RTDB: nerixa-2e6f6</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {!config.isCustomer && (
          <>
            <button
              className="btn btn-sm"
              onClick={() => {
                runSatelliteFloodScenario();
                onNavigate?.('satellite-intel');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.08)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
              }}
              title="Simulate Sentinel-1 SAR Flood Detection & Route Rerouting"
            >
              <SatelliteIcon size={14} color="#38bdf8" />
              <span>SATELLITE FLOOD</span>
            </button>

            <button
              className="btn btn-sm"
              onClick={() => {
                triggerHackathonImageScenario();
                onNavigate?.('image-intel');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.08)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
              }}
              title="Simulate Real-Time Landslide CV Detection"
            >
              <RadarIcon size={14} color="#f87171" />
              <span>LANDSLIDE CV</span>
            </button>
          </>
        )}

        {onOpenWeatherModal && (
          <button
            className="btn btn-outline btn-sm"
            onClick={onOpenWeatherModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              background: 'rgba(255, 255, 255, 0.03)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
            }}
            title="Stormglass NOAA & OpenWeather Telemetry"
          >
            <WeatherStormIcon size={14} color="#38bdf8" />
            <span>WEATHER {topStation ? `${topStation.temperature.toFixed(0)}°C` : ''}</span>
          </button>
        )}

        {!config.isCustomer && (
          !demoState.isRunning ? (
            <button
              className="btn btn-sm"
              onClick={startDemo}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                fontSize: '0.6875rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ScenarioIcon size={12} color="#f87171" />
              <span>DEMO MODE</span>
            </button>
          ) : (
            <div className="flex gap-1 items-center">
              <span className="badge badge-critical" style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}>
                STEP {demoState.currentStep}/10
              </span>
              <button className="btn btn-outline btn-sm" onClick={pauseDemo} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Pause</button>
              <button className="btn btn-outline btn-sm" onClick={resetDemo} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Reset</button>
            </div>
          )
        )}

        <button
          className={`btn ${commanderOpen ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={onCommanderToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
          }}
        >
          <BotIcon size={14} />
          <span>{config.isCustomer ? 'Safety AI' : 'AI Commander'}</span>
        </button>

        <select
          className="form-select"
          style={{ width: 'auto', padding: '0.25rem 1.25rem 0.25rem 0.5rem', fontSize: '0.6875rem', height: '28px', backgroundPosition: 'right 0.35rem center' }}
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="en">EN</option>
          <option value="hi">HI</option>
        </select>

        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '0.25rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.625rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>{user?.name}</div>
            <div style={{ fontSize: '0.625rem', color: config.badgeColor, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{user?.role?.replace(/_/g, ' ')}</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', color: '#94a3b8' }}
            onClick={logout}
            title="Sign Out"
          >
            <LogOutIcon size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

// ── AI Commander Panel ──
function CommanderPanel({ onClose }: { onClose: () => void }) {
  const { roads, vehicles, shipments, riskPredictions, alerts, language, imageIntelList, satelliteObservations } = useApp();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; suggestions?: string[] }>>([
    { role: 'ai', text: 'NER AI Commander online. Operational query engine ready for satellite observations, corridor risk telemetry, critical convoys, and automated routing.', suggestions: ['Why did Road R-17 risk increase?', 'Show recent satellite detections', 'Which critical shipments are affected?', 'Compare latest and previous observations'] }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    const response = processCommanderQuery(userMsg, {
      roads, vehicles, shipments,
      predictions: riskPredictions,
      alerts,
      imageIntelList,
      satelliteObservations,
    });

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: response.text, suggestions: response.suggestions }]);
    }, 500);
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    setMessages(prev => [...prev, { role: 'user', text: s }]);
    const response = processCommanderQuery(s, { roads, vehicles, shipments, predictions: riskPredictions, alerts, imageIntelList, satelliteObservations });
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: response.text, suggestions: response.suggestions }]);
    }, 400);
  };

  return (
    <div className="commander-panel">
      <div className="commander-header">
        <BotIcon size={16} color="#38bdf8" />
        <span className="font-semibold">{t('commander.title', language)}</span>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><CloseIcon size={14} /></button>
      </div>
      <div className="commander-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`commander-msg ${msg.role === 'user' ? 'commander-msg-user' : 'commander-msg-ai'}`}>
            <div className="commander-bubble" style={{ whiteSpace: 'pre-wrap' }}>
              {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
            </div>
            {msg.suggestions && (
              <div className="flex gap-1 mt-1" style={{ flexWrap: 'wrap' }}>
                {msg.suggestions.map((s, j) => (
                  <button key={j} className="btn btn-outline btn-sm" style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem' }} onClick={() => handleSuggestion(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="commander-input-area">
        <input
          className="commander-input"
          placeholder={t('commander.placeholder', language)}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSend}>→</button>
      </div>
    </div>
  );
}

// ── Reality Drone & Satellite Recon Data ──
export const REALITY_FEEDS = [
  {
    id: 'cam-1',
    name: 'CAM 01: NH-15 Bomdila Mountain Pass Landslide',
    state: 'Arunachal Pradesh',
    sector: 'West Kameng Corridor (Chainage km 142)',
    image: '/reality/landslide_aerial_reality.jpg',
    incidentType: 'LANDSLIDE',
    severity: 8.4,
    droneId: 'NER-DRONE-DELTA-9',
    altitude: '145m AGL',
    battery: '88%',
    captureTime: '04 Sep 2026, 14:28 IST',
    debrisVolume: '14,500 m³ Granite & Mud',
    blockedLength: '210 meters',
    status: 'CRITICAL ROADBLOCK (70% Blocked)',
    machinery: ['4x CAT 320D Excavators', '2x Komatsu Bulldozers', '6x Heavy Tipper Dumpers'],
    affectedConvoys: '8 Logistics Trucks • 2 Liquid Oxygen Tankers',
    detourRoute: 'Balipara-Bhalukpong-Charduar Bypass Corridor',
    etaClearance: '18-24 hours',
    description: 'Catastrophic slope collapse cutting right across NH-15. Severe rockfall debris covering dual-lane corridor with long queues of heavy trucks, oil tankers, and passenger vehicles stranded along mountain switchbacks.',
  },
  {
    id: 'cam-2',
    name: 'CAM 02: NH-27 Nagaon Brahmaputra Flood Embankment',
    state: 'Assam',
    sector: 'Kaliabor-Nagaon Basin (Chainage km 88)',
    image: '/reality/flood_drone_recon.jpg',
    incidentType: 'FLOOD',
    severity: 7.5,
    droneId: 'NER-UAV-ASSAM-02',
    altitude: '120m AGL',
    battery: '94%',
    captureTime: '04 Sep 2026, 10:15 IST',
    debrisVolume: '3,200 m³ Silt Inundation',
    blockedLength: '1,200 meters',
    status: 'ACTIVE SDRF RESCUE (Submerged 2.4 ft)',
    machinery: ['8x NDRF Inflatable Speedboats', '3x High-Clearance Ashok Leyland Trucks', '2x Water Deflection Barges'],
    affectedConvoys: '15 Commercial Convoys • 8 PDS Grain Trucks',
    detourRoute: 'Kaliabor South Bank Relief Line via Silghat',
    etaClearance: '12-18 hours (Water receding at 0.8 cm/h)',
    description: 'Brahmaputra tributary overflow has completely submerged 1.2 km of national highway. SDRF rescue boats and high-clearance disaster vehicles actively transshipping life-saving medical supplies and evacuating stranded drivers.',
  },
  {
    id: 'cam-3',
    name: 'CAM 03: NH-54 Mountain Cliff Excavation',
    state: 'Mizoram',
    sector: 'Kolasib River Gorge (Chainage km 64)',
    image: '/reality/landslide_clearance.jpg',
    incidentType: 'ROAD_DAMAGE',
    severity: 6.2,
    droneId: 'NER-DRONE-MIZO-01',
    altitude: '160m AGL',
    battery: '76%',
    captureTime: '04 Sep 2026, 08:30 IST',
    debrisVolume: '8,900 m³ Granite Shingle',
    blockedLength: '90 meters',
    status: 'BRO HEAVY MACHINERY IN ACTION',
    machinery: ['3x Tracked Excavators', '1x Crawler Dozer', 'Controlled Rock Splitting Team'],
    affectedConvoys: '6 Essential Food Trucks • 3 Ambulances',
    detourRoute: 'Kolasib-Bairabi Mountain Bypass Loop',
    etaClearance: '8-12 hours for single-lane transit',
    description: 'Border Roads Organisation (BRO) Task Force deploying heavy yellow crawler excavators to carve single-lane bypass through mountain rockfall debris perched above the steep river canyon.',
  },
  {
    id: 'cam-4',
    name: 'CAM 04: NH-13 InSAR Satellite Radar Convoy',
    state: 'Arunachal Pradesh',
    sector: 'Sela-Tawang High Altitude Axis',
    image: '/reality/convoy_satellite_twin.jpg',
    incidentType: 'DIGITAL_TWIN',
    severity: 4.8,
    droneId: 'ISRO RISAT-2BR1 SATELLITE',
    altitude: '540 km Low Earth Orbit',
    battery: '100%',
    captureTime: '04 Sep 2026, 07:34 IST',
    debrisVolume: 'Slope Stability Index: 0.82',
    blockedLength: 'Corridor Monitored: 37.2 km',
    status: 'SECURE CONVOY TRANSIT (45 km/h)',
    machinery: ['Spaceborne SAR Radar', 'Ground Seismic Telemetry Array', 'Army Convoy Escort'],
    affectedConvoys: 'Bravo Supply Unit (12 Vehicles en route)',
    detourRoute: 'NH-13 High Priority Strategic Corridor',
    etaClearance: 'Clear Corridor - Normal Transit',
    description: 'High-altitude satellite digital twin telemetry tracking a 12-vehicle essential supply convoy negotiating winding Himalayan pass at 2,850m elevation under continuous radar slope displacement surveillance.',
  },
];

// ── Ground Reality Drone Inspection Modal ──
function GroundRealityModal({
  feedIndex,
  onClose,
  onSelectFeed,
  onReroute,
}: {
  feedIndex: number;
  onClose: () => void;
  onSelectFeed: (idx: number) => void;
  onReroute?: () => void;
}) {
  const [thermalMode, setThermalMode] = useState(false);
  const [advisorySent, setAdvisorySent] = useState(false);
  const feed = REALITY_FEEDS[feedIndex] || REALITY_FEEDS[0];

  const handleSendAdvisory = () => {
    setAdvisorySent(true);
    setTimeout(() => setAdvisorySent(false), 3500);
  };

  return (
    <div className="reality-modal-backdrop" onClick={onClose}>
      <div className="reality-modal-window" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="reality-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DroneIcon size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
                Disaster Ground Reality & Drone Reconnaissance
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                Live 4K Aerial Telemetry • {feed.sector}, {feed.state}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="ecc-status-pill ecc-pill-online">● UAV TELEMETRY LIVE</span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><CloseIcon size={14} /></button>
          </div>
        </div>

        {/* Camera Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', padding: '0.625rem 1.25rem', background: '#0b1120', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
          {REALITY_FEEDS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => onSelectFeed(i)}
              style={{
                background: feedIndex === i ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.04)',
                border: feedIndex === i ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                color: feedIndex === i ? '#93c5fd' : '#94a3b8',
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: feedIndex === i ? '#38bdf8' : '#64748b' }} />
              <span>{f.name.split(':')[0]}: {f.name.split(':')[1]?.slice(0, 20)}...</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="reality-modal-body">
          {/* Main High-Resolution Reality Image Viewer */}
          <div className="reality-hero-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={feed.image}
              alt={feed.name}
              className="reality-hero-img"
              style={{
                filter: thermalMode ? 'hue-rotate(180deg) saturate(2.5) contrast(1.4)' : 'none',
                transition: 'filter 0.3s ease',
              }}
            />

            {/* Drone HUD Overlays */}
            <div className="drone-hud-rec" style={{ top: '12px', left: '14px', fontSize: '0.75rem', padding: '4px 8px' }}>
              <span className="drone-rec-dot" style={{ width: '8px', height: '8px' }} />
              <span>LIVE UAV RECON • {feed.droneId}</span>
            </div>

            <div style={{ position: 'absolute', top: '12px', right: '14px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setThermalMode(!thermalMode)}
                style={{
                  background: thermalMode ? '#f59e0b' : 'rgba(0,0,0,0.65)',
                  color: thermalMode ? '#000' : '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{thermalMode ? 'Normal Optical' : 'Thermal InSAR'}</span>
              </button>
              <div style={{ background: 'rgba(0,0,0,0.65)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                ALT: {feed.altitude} | BAT: {feed.battery}
              </div>
            </div>

            <div className="drone-hud-crosshair" style={{ width: '56px', height: '56px' }} />

            {/* Bottom Telemetry Overlay */}
            <div className="reality-overlay-telemetry">
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                  {feed.name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#cbd5e1' }}>
                  Capture Time: {feed.captureTime} | Coordinates: 27°18&apos;N, 92°18&apos;E
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-critical" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                  {feed.status}
                </span>
              </div>
            </div>
          </div>

          {/* Damage Assessment & Clearance Telemetry Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="card" style={{ padding: '0.625rem', background: 'rgba(30,41,59,0.5)', textAlign: 'center' }}>
              <div className="text-xs text-muted">Estimated Debris Volume</div>
              <div className="font-mono font-bold" style={{ fontSize: '1.125rem', color: '#ef4444' }}>{feed.debrisVolume}</div>
            </div>
            <div className="card" style={{ padding: '0.625rem', background: 'rgba(30,41,59,0.5)', textAlign: 'center' }}>
              <div className="text-xs text-muted">Blocked Carriageway</div>
              <div className="font-mono font-bold" style={{ fontSize: '1.125rem', color: '#f59e0b' }}>{feed.blockedLength}</div>
            </div>
            <div className="card" style={{ padding: '0.625rem', background: 'rgba(30,41,59,0.5)', textAlign: 'center' }}>
              <div className="text-xs text-muted">Clearance Time ETA</div>
              <div className="font-mono font-bold" style={{ fontSize: '1.125rem', color: '#38bdf8' }}>{feed.etaClearance}</div>
            </div>
            <div className="card" style={{ padding: '0.625rem', background: 'rgba(30,41,59,0.5)', textAlign: 'center' }}>
              <div className="text-xs text-muted">AI Severity Score</div>
              <div className="font-mono font-bold" style={{ fontSize: '1.125rem', color: '#ef4444' }}>{feed.severity} / 10</div>
            </div>
          </div>

          {/* Detailed Observations & Deployment Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="card" style={{ padding: '0.875rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Aerial Damage Assessment & Ground Situation
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                {feed.description}
              </p>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                <strong>Stranded Convoys:</strong> {feed.affectedConvoys}
              </div>
            </div>

            <div className="card" style={{ padding: '0.875rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Deployed Heavy Machinery & NDRF/BRO Units
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0.75rem' }}>
                {feed.machinery.map((m, idx) => (
                  <div key={idx} style={{ fontSize: '0.75rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckIcon size={12} style={{ color: '#34d399' }} /> {m}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#93c5fd', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                <strong>Recommended Alternate Route:</strong><br />
                {feed.detourRoute}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(75,85,99,0.3)', paddingTop: '0.875rem' }}>
            <div>
              {advisorySent && (
                <span className="badge badge-safe" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                  Emergency Reroute Advisory Dispatched to 24 Fleet Convoys!
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={onClose}>
                Close
              </button>
              <button className="btn btn-danger" onClick={handleSendAdvisory} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HazardIcon size={13} color="currentColor" />
                <span>Issue Emergency Reroute Advisory</span>
              </button>
              {onReroute && (
                <button className="btn btn-primary" onClick={() => { onClose(); onReroute(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RouteIcon size={13} color="currentColor" />
                  <span>Open Route Optimizer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reality Reconnaissance & Satellite Digital Twin Page ──
function RealityReconPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [selectedFeedIndex, setSelectedFeedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const filteredFeeds = REALITY_FEEDS.filter(f => {
    if (filterType === 'ALL') return true;
    return f.incidentType === filterType;
  });

  return (
    <div>
      {/* Top Banner */}
      <div className="ecc-banner">
        <div className="ecc-title-group">
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DroneIcon size={20} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Ground Reality Reconnaissance & Satellite Digital Twin Hub
              <span className="ecc-status-pill ecc-pill-online">● 4 SQUADRONS ACTIVE</span>
              <span className="ecc-status-pill ecc-pill-live">ISRO RADAR SYNCED</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              High-resolution reality drone photography, landslide debris volume analysis, flood breach telemetry, and slope displacement monitoring.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('map')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapIcon size={14} color="currentColor" />
            <span>View on GIS Map</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-3">
        <button className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterType('ALL')}>
          All Feeds (4)
        </button>
        <button className={`btn btn-sm ${filterType === 'LANDSLIDE' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterType('LANDSLIDE')}>
          Landslide Passes
        </button>
        <button className={`btn btn-sm ${filterType === 'FLOOD' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterType('FLOOD')}>
          Flood Corridors
        </button>
        <button className={`btn btn-sm ${filterType === 'DIGITAL_TWIN' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterType('DIGITAL_TWIN')}>
          InSAR Satellite Twin
        </button>
      </div>

      {/* Reality Feed Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.25rem' }}>
        {filteredFeeds.map((feed, index) => {
          const originalIdx = REALITY_FEEDS.findIndex(f => f.id === feed.id);
          return (
            <div
              key={feed.id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onClick={() => {
                setSelectedFeedIndex(originalIdx);
                setModalOpen(true);
              }}
            >
              {/* Photo Frame */}
              <div style={{ position: 'relative', width: '100%', height: '220px', background: '#000', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={feed.image}
                  alt={feed.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="drone-hud-rec">
                  <span className="drone-rec-dot" />
                  <span>{feed.droneId}</span>
                </div>
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                  ALT {feed.altitude} • BAT {feed.battery}
                </div>
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-critical" style={{ fontSize: '0.6875rem' }}>
                    {feed.status}
                  </span>
                  <span style={{ background: 'rgba(0,0,0,0.75)', color: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                    SEV {feed.severity}/10
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{feed.name}</h3>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PinIcon size={12} color="#94a3b8" />
                  <span>{feed.sector}, {feed.state} • Captured: {feed.captureTime}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '0.875rem' }}>
                  {feed.description.slice(0, 140)}...
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.625rem', borderRadius: '6px', marginBottom: '0.875rem' }}>
                  <div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>Debris Volume</div>
                    <div className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f87171' }}>{feed.debrisVolume}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>Clearance Time</div>
                    <div className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#38bdf8' }}>{feed.etaClearance}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary w-full btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFeedIndex(originalIdx);
                      setModalOpen(true);
                    }}
                  >
                    <CameraIcon size={13} color="currentColor" />
                    <span>Inspect UAV Recon Feed</span>
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('routes');
                    }}
                  >
                    <RouteIcon size={13} color="currentColor" />
                    <span>Reroute</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <GroundRealityModal
          feedIndex={selectedFeedIndex}
          onClose={() => setModalOpen(false)}
          onSelectFeed={setSelectedFeedIndex}
          onReroute={() => onNavigate('routes')}
        />
      )}
    </div>
  );
}

// ── Dashboard Page (Elevated Command Center) ──
function DashboardPage({ onNavigate, onOpenWeatherModal }: { onNavigate: (page: string) => void; onOpenWeatherModal?: () => void }) {
  const { dashboardSummary, alerts, language, liveWeatherReports } = useApp();
  const [activeMode, setActiveMode] = useState<'NORMAL' | 'DISASTER' | 'HIGH_ALERT'>('DISASTER');
  const [realityModalOpen, setRealityModalOpen] = useState(false);
  const [realityFeedIndex, setRealityFeedIndex] = useState(0);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').sort((a, b) => {
    const levels = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
    return (levels[a.level] ?? 5) - (levels[b.level] ?? 5);
  });

  const kpis = [
    { label: t('dashboard.connectivity', language), value: dashboardSummary.nerConnectivity, unit: '%', color: dashboardSummary.nerConnectivity > 70 ? 'var(--risk-safe)' : 'var(--risk-high)' },
    { label: t('dashboard.critical_roads', language), value: dashboardSummary.criticalRoads, color: 'var(--risk-critical)' },
    { label: t('dashboard.high_risk', language), value: dashboardSummary.highRiskCorridors, color: 'var(--risk-high)' },
    { label: t('dashboard.active_vehicles', language), value: dashboardSummary.activeVehicles, color: 'var(--accent-primary)' },
    { label: t('dashboard.at_risk_shipments', language), value: dashboardSummary.atRiskShipments, color: 'var(--risk-moderate)' },
    { label: t('dashboard.critical_alerts', language), value: dashboardSummary.criticalAlerts, color: 'var(--risk-critical)' },
  ];

  return (
    <div>
      {/* ── Executive Command Center Banner ── */}
      <div className="ecc-banner">
        <div className="ecc-title-group">
          <div className="sidebar-logo-icon" style={{ width: '32px', height: '32px', borderRadius: '6px' }}>
            <ShieldIcon size={17} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#f8fafc', letterSpacing: '0.02em' }}>
                NER-SHIELD LOGISTICS INTELLIGENCE COMMAND
              </span>
              <span className="ecc-status-pill ecc-pill-online">
                <PulseDotIcon color="#34d399" size={6} />
                ONLINE
              </span>
              <span className="ecc-status-pill ecc-pill-live">
                10Hz SYNC
              </span>
              <span className="ecc-status-pill ecc-pill-threat">
                MONSOON L3
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
              Ministry of Development of North Eastern Region • 8 NER States Synchronized
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Operator Load */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
              LOAD: <strong style={{ color: '#38bdf8' }}>18% OPTIMAL</strong>
            </div>
            <div style={{ width: '100px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginTop: '3px' }}>
              <div style={{ width: '18%', height: '100%', background: '#38bdf8' }} />
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="ecc-mode-tabs">
            <button
              className={`ecc-mode-tab ${activeMode === 'NORMAL' ? 'active' : ''}`}
              onClick={() => setActiveMode('NORMAL')}
            >
              Normal
            </button>
            <button
              className={`ecc-mode-tab disaster ${activeMode === 'DISASTER' ? 'active' : ''}`}
              onClick={() => setActiveMode('DISASTER')}
            >
              Disaster
            </button>
            <button
              className={`ecc-mode-tab ${activeMode === 'HIGH_ALERT' ? 'active' : ''}`}
              onClick={() => setActiveMode('HIGH_ALERT')}
            >
              High Alert
            </button>
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setRealityFeedIndex(0);
              setRealityModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
            }}
          >
            <DroneIcon size={14} color="#38bdf8" />
            <span>Recon Feeds</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card" style={{ '--kpi-color': kpi.color } as React.CSSProperties}>
            <div className="kpi-label">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: kpi.color, display: 'inline-block' }} />
              <span>{kpi.label}</span>
            </div>
            <div className="kpi-value" style={{ color: kpi.color }}>
              {kpi.value}{kpi.unit && <span className="kpi-unit">{kpi.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout: Map + Alerts */}
      <div className="dashboard-grid">
        <div className="dashboard-map">
          <MapView
            onOpenRealityRecon={(camIdx) => {
              setRealityFeedIndex(camIdx ?? 0);
              setRealityModalOpen(true);
            }}
            onSelectIncident={() => {
              setRealityFeedIndex(0);
              setRealityModalOpen(true);
            }}
            onOpenWeatherModal={onOpenWeatherModal}
            onOpenImageIntel={() => onNavigate('image-intel')}
            onOpenSatelliteIntel={() => onNavigate('satellite-intel')}
          />
        </div>
        <div className="dashboard-alerts">
          <div className="card-header">
            <span className="card-title">{t('dashboard.live_alerts', language)}</span>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.6875rem' }} onClick={() => onNavigate('alerts')}>View All</button>
          </div>
          {activeAlerts.slice(0, 8).map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              compact
              onInspectReality={() => {
                setRealityFeedIndex(alert.id === 'al-2' ? 1 : 0);
                setRealityModalOpen(true);
              }}
            />
          ))}
          {activeAlerts.length === 0 && (
            <p className="text-sm text-muted" style={{ padding: '1rem', textAlign: 'center' }}>No active alerts</p>
          )}
        </div>
      </div>

      {/* Reality Recon Modal */}
      {realityModalOpen && (
        <GroundRealityModal
          feedIndex={realityFeedIndex}
          onClose={() => setRealityModalOpen(false)}
          onSelectFeed={setRealityFeedIndex}
          onReroute={() => onNavigate('routes')}
        />
      )}
    </div>
  );
}

// ── Alert Card Component ──
function AlertCard({ alert, compact = false, onInspectReality }: { alert: Alert; compact?: boolean; onInspectReality?: () => void }) {
  const { acknowledgeAlert, resolveAlert } = useApp();
  const levelClass = `alert-${alert.level.toLowerCase()}`;
  const badgeBg = alert.level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : alert.level === 'HIGH' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(56, 189, 248, 0.15)';
  const badgeColor = alert.level === 'CRITICAL' ? '#f87171' : alert.level === 'HIGH' ? '#fb923c' : '#38bdf8';

  return (
    <div className={`alert-card ${levelClass}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: badgeBg, color: badgeColor, fontFamily: 'var(--font-mono)' }}>
          {alert.level}
        </span>
        <span className="alert-time" style={{ margin: 0, fontSize: '0.625rem' }}>{new Date(alert.createdAt).toLocaleTimeString()}</span>
      </div>
      <div className="alert-title" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>{alert.title}</div>
      {!compact && <div className="alert-message">{alert.message}</div>}
      {alert.aiRecommendation && !compact && (
        <div style={{ marginTop: '0.5rem', padding: '0.375rem 0.5rem', background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '4px', fontSize: '0.75rem', color: '#cbd5e1' }}>
          <strong style={{ color: '#38bdf8' }}>AI Action:</strong> {alert.aiRecommendation}
        </div>
      )}
      <div className="flex items-center justify-between mt-2 pt-1.5" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
        <div className="flex gap-1.5 items-center">
          {onInspectReality && (
            <button
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={onInspectReality}
              title="Inspect Ground Reality Drone Feed"
            >
              <DroneIcon size={12} color="#38bdf8" />
              <span>Recon</span>
            </button>
          )}
          {alert.status === 'ACTIVE' && (
            <>
              <button className="btn btn-outline btn-sm" style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }} onClick={() => acknowledgeAlert(alert.id)}>ACK</button>
              <button className="btn btn-success btn-sm" style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }} onClick={() => resolveAlert(alert.id)}>RESOLVE</button>
            </>
          )}
          {alert.status === 'ACKNOWLEDGED' && <span className="badge badge-primary" style={{ fontSize: '0.625rem' }}>Acknowledged</span>}
          {alert.status === 'RESOLVED' && <span className="badge badge-safe" style={{ fontSize: '0.625rem' }}>Resolved</span>}
        </div>
      </div>
    </div>
  );
}

// ── Risk Predictions Page ──
function RiskPage() {
  const { roads, riskPredictions, explainRiskForRoad, language } = useApp();
  const [selectedRoad, setSelectedRoad] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  const sortedRoads = [...roads].sort((a, b) => {
    const riskA = riskPredictions.get(a.id)?.currentRisk ?? 0;
    const riskB = riskPredictions.get(b.id)?.currentRisk ?? 0;
    return riskB - riskA;
  });

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <RadarIcon size={20} color="#38bdf8" />
        <span>{t('risk.title', language)}</span>
      </h2>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Road</th>
              <th>Status</th>
              <th>Current Risk</th>
              <th>6h</th>
              <th>12h</th>
              <th>24h</th>
              <th>Accessibility</th>
              <th>Confidence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedRoads.map(road => {
              const pred = riskPredictions.get(road.id);
              if (!pred) return null;
              const level = getRiskLevel(pred.currentRisk);
              return (
                <React.Fragment key={road.id}>
                  <tr onClick={() => setSelectedRoad(selectedRoad === road.id ? null : road.id)} className="cursor-pointer">
                    <td>
                      <div className="font-semibold">{road.number}</div>
                      <div className="text-xs text-muted">{road.name}</div>
                    </td>
                    <td><span className={`badge badge-${road.status === 'BLOCKED' ? 'critical' : road.status === 'PARTIALLY_BLOCKED' ? 'high' : 'safe'}`}>{road.status}</span></td>
                    <td>
                      <span className="font-mono font-bold" style={{ color: getRiskColor(pred.currentRisk), fontSize: '1.125rem' }}>{pred.currentRisk}</span>
                      <span className={`badge badge-${level.toLowerCase()}`} style={{ marginLeft: '0.375rem' }}>{level}</span>
                    </td>
                    <td className="font-mono" style={{ color: getRiskColor(pred.risk6h) }}>{pred.risk6h}%</td>
                    <td className="font-mono" style={{ color: getRiskColor(pred.risk12h) }}>{pred.risk12h}%</td>
                    <td className="font-mono" style={{ color: getRiskColor(pred.risk24h) }}>{pred.risk24h}%</td>
                    <td className="font-mono">{pred.accessibilityScore}%</td>
                    <td className="font-mono">{pred.confidence}%</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); setShowExplanation(showExplanation === road.id ? null : road.id); }}>
                        Explain Analysis
                      </button>
                    </td>
                  </tr>
                  {showExplanation === road.id && (
                    <tr>
                      <td colSpan={9} style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '0.75rem' }}>
                        <div className="text-sm">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <BotIcon size={15} color="#93c5fd" />
                            <strong>AI Explanation:</strong>
                          </div>
                          {explainRiskForRoad(road.id)}
                        </div>
                        <div className="flex gap-2 mt-2">
                          {pred.primaryFactors.slice(0, 4).map((f, i) => (
                            <div key={i} className="card" style={{ padding: '0.5rem', flex: 1 }}>
                              <div className="text-xs text-muted">{f.name}</div>
                              <div className="font-mono font-bold" style={{ color: getRiskColor(f.value * 100) }}>{f.contribution.toFixed(1)}%</div>
                              <div className="text-xs text-muted">{f.description}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Route Optimizer Page ──
function RoutesPage() {
  const { getOptimizedRoutes, roads, language } = useApp();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<'FASTEST' | 'SAFEST' | 'LOWEST_COST'>('SAFEST');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL'>('HIGH');
  const [avoidBlocked, setAvoidBlocked] = useState(true);
  const [avoidHighRisk, setAvoidHighRisk] = useState(false);
  const [results, setResults] = useState<RouteOption[]>([]);

  const locationOptions = [
    { name: 'Guwahati', lat: 26.1445, lng: 91.7362 },
    { name: 'Shillong', lat: 25.4670, lng: 91.3662 },
    { name: 'Imphal', lat: 24.8170, lng: 93.9368 },
    { name: 'Dimapur', lat: 25.9065, lng: 93.7271 },
    { name: 'Kohima', lat: 25.6586, lng: 94.1086 },
    { name: 'Aizawl', lat: 23.7307, lng: 92.7173 },
    { name: 'Agartala', lat: 23.8315, lng: 91.2868 },
    { name: 'Gangtok', lat: 27.3389, lng: 88.6065 },
    { name: 'Itanagar', lat: 27.0844, lng: 93.6053 },
    { name: 'Tawang', lat: 27.5860, lng: 91.8689 },
    { name: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
    { name: 'Silchar', lat: 24.8333, lng: 92.7789 },
    { name: 'Jorhat', lat: 26.7509, lng: 94.2037 },
    { name: 'Tura', lat: 25.5000, lng: 90.2167 },
  ];

  const handleOptimize = () => {
    const orig = locationOptions.find(l => l.name === origin);
    const dest = locationOptions.find(l => l.name === destination);
    if (!orig || !dest) return;

    const request: RouteRequest = {
      origin: { lat: orig.lat, lng: orig.lng },
      originName: orig.name,
      destination: { lat: dest.lat, lng: dest.lng },
      destinationName: dest.name,
      priority,
      avoidBlocked,
      avoidHighRisk,
      mode,
    };

    const routes = getOptimizedRoutes(request);
    setResults(routes);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <RouteIcon size={20} color="#38bdf8" />
        <span>{t('route.title', language)}</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem' }}>
        <div className="card">
          <h4 style={{ marginBottom: '0.75rem' }}>Route Parameters</h4>
          <div className="form-group">
            <label className="form-label">Origin</label>
            <select className="form-select" value={origin} onChange={e => setOrigin(e.target.value)}>
              <option value="">Select Origin</option>
              {locationOptions.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Destination</label>
            <select className="form-select" value={destination} onChange={e => setDestination(e.target.value)}>
              <option value="">Select Destination</option>
              {locationOptions.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Optimize For</label>
            <select className="form-select" value={mode} onChange={e => setMode(e.target.value as typeof mode)}>
              <option value="SAFEST">Safest Route (Min Landslide/Flood Risk)</option>
              <option value="FASTEST">Fastest Route (Min Transit Time)</option>
              <option value="LOWEST_COST">Lowest Cost (Fuel & Toll Efficient)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as typeof priority)}>
              <option value="CRITICAL">[CRITICAL] Medical & Lifeline Priority</option>
              <option value="HIGH">[HIGH] Essential Food & Fuel</option>
              <option value="MEDIUM">[MEDIUM] Standard Commercial</option>
              <option value="NORMAL">[NORMAL] Routine Cargo</option>
            </select>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={avoidBlocked} onChange={e => setAvoidBlocked(e.target.checked)} />
              <span className="text-sm">Avoid blocked roads</span>
            </label>
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={avoidHighRisk} onChange={e => setAvoidHighRisk(e.target.checked)} />
              <span className="text-sm">Avoid high-risk roads</span>
            </label>
          </div>
          <button className="btn btn-primary w-full btn-lg" onClick={handleOptimize} disabled={!origin || !destination} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <RouteIcon size={16} color="currentColor" />
            <span>Optimize Logistics Route</span>
          </button>
        </div>

        <div>
          {results.length === 0 ? (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', textAlign: 'center' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RouteIcon size={28} color="#38bdf8" />
                  </div>
                </div>
                <p className="text-muted">Select origin and destination, then click<br /><strong>Optimize Route</strong> to see AI recommendations</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map(route => (
                <div key={route.id} className={`route-card ${route.isRecommended ? 'recommended' : ''}`}>
                  <h4>{route.name}</h4>
                  <div className="route-stats">
                    <div>
                      <div className="route-stat-value">{route.distance}<span className="text-xs text-muted"> km</span></div>
                      <div className="route-stat-label">Distance</div>
                    </div>
                    <div>
                      <div className="route-stat-value">{Math.floor(route.estimatedTime / 60)}h {route.estimatedTime % 60}m</div>
                      <div className="route-stat-label">ETA</div>
                    </div>
                    <div>
                      <div className="route-stat-value" style={{ color: getRiskColor(route.risk) }}>{route.risk}%</div>
                      <div className="route-stat-label">Risk</div>
                    </div>
                    <div>
                      <div className="route-stat-value" style={{ color: getRiskColor(100 - route.reliability) }}>{route.reliability}%</div>
                      <div className="route-stat-label">Reliability</div>
                    </div>
                  </div>
                  {route.reasons.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      {route.reasons.map((r, i) => (
                        <div key={i} className="text-xs" style={{ color: 'var(--risk-safe)', marginBottom: '0.125rem' }}>{r}</div>
                      ))}
                    </div>
                  )}
                  {route.roadSegments.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      <strong>Route:</strong> {route.roadSegments.map(s => s.roadName.split(' - ')[0]).join(' → ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Simulation Page ──
function SimulationPage() {
  const { roads, runWhatIfSimulation, latestSimulation, language } = useApp();
  const [scenarioType, setScenarioType] = useState<SimulationScenario['type']>('ROAD_CLOSURE');
  const [selectedRoad, setSelectedRoad] = useState('');
  const [duration, setDuration] = useState(12);
  const [severity, setSeverity] = useState(8);

  const handleRunSimulation = () => {
    if (!selectedRoad) return;
    const scenario: SimulationScenario = {
      type: scenarioType,
      roadId: selectedRoad,
      duration,
      severity,
      description: `${scenarioType.replace(/_/g, ' ')} on ${roads.find(r => r.id === selectedRoad)?.number || selectedRoad}`,
    };
    runWhatIfSimulation(scenario);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <SimulationIcon size={22} style={{ color: 'var(--accent-primary)' }} />
        <h2 style={{ margin: 0 }}>{t('sim.title', language)}</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem' }}>
        <div className="card">
          <h4 style={{ marginBottom: '0.75rem' }}>Scenario Builder</h4>
          <div className="form-group">
            <label className="form-label">Scenario Type</label>
            <select className="form-select" value={scenarioType} onChange={e => setScenarioType(e.target.value as SimulationScenario['type'])}>
              <option value="ROAD_CLOSURE">Road Closure</option>
              <option value="BRIDGE_FAILURE">Bridge Failure</option>
              <option value="HEAVY_RAINFALL">Heavy Rainfall</option>
              <option value="FLOOD">Flash Flood</option>
              <option value="LANDSLIDE">Hill Landslide</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Affected Road</label>
            <select className="form-select" value={selectedRoad} onChange={e => setSelectedRoad(e.target.value)}>
              <option value="">Select Road</option>
              {roads.map(r => <option key={r.id} value={r.id}>{r.number} — {r.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (hours): {duration}</label>
            <input type="range" min={1} max={72} value={duration} onChange={e => setDuration(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Severity: {severity}/10</label>
            <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <button className="btn btn-danger w-full btn-lg" onClick={handleRunSimulation} disabled={!selectedRoad} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <SimulationIcon size={16} /> Run Simulation
          </button>
        </div>

        <div>
          {!latestSimulation ? (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', textAlign: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', marginBottom: '0.75rem' }}>
                  <SimulationIcon size={36} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <p className="text-muted">Configure a scenario and click<br /><strong>Run Simulation</strong> to compute multi-variable impact metrics</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="kpi-card" style={{ '--kpi-color': 'var(--risk-high)' } as React.CSSProperties}>
                  <div className="kpi-label">Affected Districts</div>
                  <div className="kpi-value">{latestSimulation.affectedDistricts}</div>
                </div>
                <div className="kpi-card" style={{ '--kpi-color': 'var(--risk-moderate)' } as React.CSSProperties}>
                  <div className="kpi-label">Affected Vehicles</div>
                  <div className="kpi-value">{latestSimulation.affectedVehicles}</div>
                </div>
                <div className="kpi-card" style={{ '--kpi-color': 'var(--risk-high)' } as React.CSSProperties}>
                  <div className="kpi-label">Affected Shipments</div>
                  <div className="kpi-value">{latestSimulation.affectedShipments}</div>
                </div>
                <div className="kpi-card" style={{ '--kpi-color': 'var(--risk-critical)' } as React.CSSProperties}>
                  <div className="kpi-label">Critical Shipments</div>
                  <div className="kpi-value">{latestSimulation.criticalShipments}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div className="card">
                  <div className="card-title">Impact Summary</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <div className="flex justify-between mb-1"><span className="text-sm text-muted">Expected Delay</span><span className="font-mono font-bold">{latestSimulation.expectedDelay}h</span></div>
                    <div className="flex justify-between mb-1"><span className="text-sm text-muted">Additional Distance</span><span className="font-mono font-bold">{latestSimulation.additionalDistance.toLocaleString()} km</span></div>
                    <div className="flex justify-between mb-1"><span className="text-sm text-muted">Est. Additional Cost</span><span className="font-mono font-bold">₹{(latestSimulation.estimatedAdditionalCost / 100000).toFixed(1)} lakh</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted">Supply Shortage Risk</span><span className={`badge badge-${latestSimulation.supplyShortageRisk.toLowerCase()}`}>{latestSimulation.supplyShortageRisk}</span></div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BotIcon size={16} style={{ color: 'var(--accent-primary)' }} /> AI Action Plan
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {latestSimulation.actionPlan.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="badge badge-primary" style={{ minWidth: '1.5rem' }}>{item.priority}</span>
                        <div style={{ flex: 1 }}>
                          <div className="text-sm font-medium">{item.action}</div>
                          <div className="text-xs text-muted">{item.details}</div>
                        </div>
                        <div className="flex gap-1">
                          <button className="btn btn-success btn-sm" style={{ fontSize: '0.625rem', padding: '0.125rem 0.35rem' }}>APPROVE</button>
                          <button className="btn btn-outline btn-sm" style={{ fontSize: '0.625rem', padding: '0.125rem 0.35rem' }}>EDIT</button>
                          <button className="btn btn-danger btn-sm" style={{ fontSize: '0.625rem', padding: '0.125rem 0.35rem' }}>REJECT</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Vehicles Page ──
function VehiclesPage() {
  const { vehicles, gpsSimRunning, startGpsSimulation, pauseGpsSimulation, resetGpsSimulation, language } = useApp();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TruckIcon size={22} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ margin: 0 }}>{t('vehicle.title', language)}</h2>
        </div>
        <div className="flex gap-2">
          {!gpsSimRunning ? (
            <button className="btn btn-success" onClick={startGpsSimulation} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PulseDotIcon color="#22c55e" size={8} /> Start GPS Simulation
            </button>
          ) : (
            <button className="btn btn-warning" onClick={pauseGpsSimulation}>Pause</button>
          )}
          <button className="btn btn-outline" onClick={resetGpsSimulation}>Reset</button>
        </div>
      </div>

      {gpsSimRunning && (
        <div className="demo-banner">
          <PulseDotIcon color="#22c55e" size={10} />
          <span className="text-sm font-semibold">GPS Simulation Active — Vehicles are moving in real-time</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1rem' }}>
        <div className="card" style={{ height: '500px' }}>
          <MapView />
        </div>
        <div style={{ overflow: 'auto', maxHeight: '500px' }}>
          {vehicles.map(v => (
            <div key={v.id} className="card" style={{ marginBottom: '0.5rem', padding: '0.75rem' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{v.vehicleNumber}</div>
                  <div className="text-xs text-muted">{v.driverName} • {v.type}</div>
                </div>
                <span className="badge" style={{ background: `${VEHICLE_STATUS_COLORS[v.status]}22`, color: VEHICLE_STATUS_COLORS[v.status] }}>{v.status}</span>
              </div>
              <div className="grid grid-3 gap-2 mt-2">
                <div><div className="text-xs text-muted">Speed</div><div className="font-mono text-sm">{Math.round(v.speed)} km/h</div></div>
                <div><div className="text-xs text-muted">Risk</div><div className="font-mono text-sm" style={{ color: getRiskColor(v.risk) }}>{v.risk}%</div></div>
                <div><div className="text-xs text-muted">To</div><div className="text-xs truncate">{v.destinationName || '—'}</div></div>
              </div>
              {v.commodity && <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Cargo: {COMMODITY_CONFIG[v.commodity]?.label || v.commodity}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shipments Page ──
function ShipmentsPage() {
  const { shipments, language } = useApp();
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filtered = shipments.filter(s => {
    if (filterPriority !== 'ALL' && s.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    return true;
  });

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      PLANNED: 'var(--text-secondary)', DISPATCHED: 'var(--accent-primary)',
      IN_TRANSIT: 'var(--risk-safe)', DELAYED: 'var(--risk-moderate)',
      AT_RISK: 'var(--risk-high)', DELIVERED: 'var(--accent-primary)', CANCELLED: 'var(--text-tertiary)',
    };
    return colors[status] || 'var(--text-secondary)';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <BoxIcon size={22} style={{ color: 'var(--accent-primary)' }} />
        <h2 style={{ margin: 0 }}>{t('shipment.title', language)}</h2>
      </div>
      <div className="flex gap-2 mb-3">
        <select className="form-select" style={{ width: 'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="NORMAL">Normal Priority</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELAYED">Delayed</option>
          <option value="AT_RISK">At Risk</option>
          <option value="DELIVERED">Delivered</option>
        </select>
        <div style={{ flex: 1 }} />
        <span className="text-sm text-muted" style={{ alignSelf: 'center' }}>{filtered.length} shipments</span>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Commodity</th>
              <th>Priority</th>
              <th>Origin → Destination</th>
              <th>Status</th>
              <th>ETA</th>
              <th>Criticality</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td className="font-mono text-sm">{s.id}</td>
                <td>
                  <span style={{ fontWeight: 500 }}>{s.commodityName}</span>
                </td>
                <td><span className={`badge badge-${s.priority === 'CRITICAL' ? 'critical' : s.priority === 'HIGH' ? 'high' : s.priority === 'MEDIUM' ? 'moderate' : 'safe'}`}>{s.priority}</span></td>
                <td className="text-sm">{s.origin} → {s.destination}</td>
                <td><span style={{ color: statusColor(s.status), fontWeight: 600, fontSize: '0.75rem' }}>{s.status.replace(/_/g, ' ')}</span></td>
                <td className="text-xs font-mono">{new Date(s.eta).toLocaleString()}</td>
                <td>
                  <div style={{ width: '60px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.supplyCriticality}%`, height: '100%', background: getRiskColor(s.supplyCriticality), borderRadius: '3px' }} />
                  </div>
                  <span className="text-xs font-mono">{s.supplyCriticality}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Incident Reporting Page ──
function IncidentsPage({ onInspectReality }: { onInspectReality?: (feedIdx: number) => void }) {
  const { incidents, reportIncident, roads, language } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
  const [incType, setIncType] = useState<IncidentType>('LANDSLIDE');
  const [severity, setSeverity] = useState(5);
  const [roadId, setRoadId] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const road = roads.find(r => r.id === roadId);
    reportIncident({
      type: incType,
      severity,
      location: road?.path[0] || { lat: 26.14, lng: 91.73 },
      roadId,
      roadName: road ? `${road.number} - ${road.name}` : '',
      districtId: road?.districtIds[0] || '',
      stateId: road?.stateIds[0] || '',
      description,
      reportedBy: 'Current User',
    });
    setShowForm(false);
    setDescription('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HazardIcon size={22} style={{ color: 'var(--risk-high)' }} />
          <h2 style={{ margin: 0 }}>{t('incident.title', language)}</h2>
          <span className="badge badge-critical">{incidents.length} Active Dispatches</span>
        </div>
        <div className="flex gap-2">
          <div className="ecc-mode-tabs">
            <button className={`ecc-mode-tab ${viewMode === 'CARDS' ? 'active' : ''}`} onClick={() => setViewMode('CARDS')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <DroneIcon size={14} /> Reality Drone Cards
            </button>
            <button className={`ecc-mode-tab ${viewMode === 'TABLE' ? 'active' : ''}`} onClick={() => setViewMode('TABLE')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <DashboardIcon size={14} /> Data Table
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FileTextIcon size={14} /> {t('incident.report', language)}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <HazardIcon size={16} style={{ color: 'var(--accent-primary)' }} />
            <h4 style={{ margin: 0 }}>Report New Incident</h4>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Incident Type</label>
                <select className="form-select" value={incType} onChange={e => setIncType(e.target.value as IncidentType)}>
                  <option value="LANDSLIDE">Landslide</option>
                  <option value="FLOOD">Flash Flood</option>
                  <option value="ROAD_DAMAGE">Road Damage</option>
                  <option value="BRIDGE_DAMAGE">Bridge Damage</option>
                  <option value="TRAFFIC">Traffic Congestion</option>
                  <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown</option>
                  <option value="ROAD_BLOCKED">Road Blocked</option>
                  <option value="OTHER">Other Disruption</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Affected Road</label>
                <select className="form-select" value={roadId} onChange={e => setRoadId(e.target.value)}>
                  <option value="">Select Road</option>
                  {roads.map(r => <option key={r.id} value={r.id}>{r.number} — {r.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity: {severity}/10</label>
                <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(Number(e.target.value))} style={{ width: '100%', marginTop: '0.5rem' }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the incident in detail..." required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <PaperAirplaneIcon size={14} /> Submit Report
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Cards View with Real Disaster Images ── */}
      {viewMode === 'CARDS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {incidents.map((inc, i) => (
            <div
              key={inc.id}
              className="card"
              style={{
                padding: '0',
                overflow: 'hidden',
                border: inc.severity >= 8 ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(75,85,99,0.3)',
              }}
            >
              {/* Reality Photo Preview */}
              {inc.imageUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '170px', background: '#000' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={inc.imageUrl} alt={inc.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="drone-hud-rec" style={{ top: '6px', left: '8px' }}>
                    <span className="drone-rec-dot" />
                    <span>{inc.droneRecon?.droneId || 'NER-UAV-RECON'}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: '6px', right: '8px', background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 800 }}>
                    SEV {inc.severity}/10
                  </div>
                </div>
              ) : (
                <div style={{ height: '80px', background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HazardIcon size={28} style={{ color: 'var(--risk-high)' }} />
                </div>
              )}

              <div style={{ padding: '0.875rem' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{inc.type.replace(/_/g, ' ')}</span>
                  <span className={`badge badge-${inc.status === 'VERIFIED' ? 'safe' : 'moderate'}`}>{inc.status}</span>
                </div>
                <div className="text-xs text-muted mb-2">{inc.roadName || 'NER Highway'} • {inc.reportedBy}</div>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                  {inc.description}
                </p>

                {inc.aiAnalysis && (
                  <div style={{ background: 'rgba(59,130,246,0.08)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.6875rem', marginBottom: '0.75rem', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <div><strong>Road Blockage:</strong> {inc.aiAnalysis.roadBlockage}% | Clear ETA: {inc.aiAnalysis.estimatedClearTime}</div>
                    {inc.aiAnalysis.debrisVolume && <div><strong>Debris Volume:</strong> {inc.aiAnalysis.debrisVolume}</div>}
                  </div>
                )}

                <button
                  className="btn btn-outline w-full btn-sm"
                  onClick={() => onInspectReality && onInspectReality(i % 4)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <DroneIcon size={14} /> Inspect Ground Reality & Drone Feed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table View ── */}
      {viewMode === 'TABLE' && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Road</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Reported</th>
                <th>AI Analysis</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, i) => (
                <tr key={inc.id}>
                  <td><span className="font-semibold text-sm">{inc.type.replace(/_/g, ' ')}</span></td>
                  <td className="text-sm">{inc.roadName || '—'}</td>
                  <td>
                    <span className="font-mono font-bold" style={{ color: getRiskColor(inc.severity * 10) }}>{inc.severity}/10</span>
                  </td>
                  <td><span className={`badge badge-${inc.status === 'VERIFIED' ? 'safe' : inc.status === 'REJECTED' ? 'critical' : 'moderate'}`}>{inc.status}</span></td>
                  <td className="text-xs">{new Date(inc.reportedAt).toLocaleString()}</td>
                  <td>
                    {inc.aiAnalysis ? (
                      <div className="text-xs">
                        <span>Blockage: <strong>{inc.aiAnalysis.roadBlockage}%</strong></span>
                        <span style={{ marginLeft: '0.5rem' }}>Conf: <strong>{Math.round(inc.aiAnalysis.confidence)}%</strong></span>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => onInspectReality && onInspectReality(i % 4)}
                    >
                      <DroneIcon size={12} /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Alerts Page ──
function AlertsPage() {
  const { alerts, language } = useApp();
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ACTIVE');

  const filtered = alerts.filter(a => {
    if (filterLevel !== 'ALL' && a.level !== filterLevel) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <AlertIcon size={22} style={{ color: 'var(--risk-critical)' }} />
        <h2 style={{ margin: 0 }}>{t('alert.title', language)}</h2>
      </div>
      <div className="flex gap-2 mb-3">
        <select className="form-select" style={{ width: 'auto' }} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
          <option value="ALL">All Levels</option>
          <option value="CRITICAL">Critical Risk</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <div style={{ flex: 1 }} />
        <span className="text-sm text-muted" style={{ alignSelf: 'center' }}>{filtered.length} alerts</span>
      </div>
      <div>
        {filtered.map(alert => <AlertCard key={alert.id} alert={alert} />)}
        {filtered.length === 0 && <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No alerts matching filters</p>}
      </div>
    </div>
  );
}

// ── Analytics Page ──
function AnalyticsPage() {
  const { roads, vehicles, shipments, incidents, riskPredictions, language } = useApp();

  const totalRoads = roads.length;
  const blockedRoads = roads.filter(r => r.status === 'BLOCKED').length;
  const criticalRoads = roads.filter(r => (riskPredictions.get(r.id)?.currentRisk ?? 0) > 80).length;
  const deliveredShipments = shipments.filter(s => s.status === 'DELIVERED').length;
  const delayedShipments = shipments.filter(s => s.status === 'DELAYED' || s.status === 'AT_RISK').length;
  const avgRisk = roads.length > 0 ? Math.round(roads.reduce((s, r) => s + (riskPredictions.get(r.id)?.currentRisk ?? 0), 0) / roads.length) : 0;
  const activeVehicles = vehicles.filter(v => v.status !== 'DELIVERED').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED').length;

  const stats = [
    { label: 'Total Roads Monitored', value: totalRoads, color: 'var(--accent-primary)' },
    { label: 'Blocked Corridors', value: blockedRoads, color: 'var(--risk-critical)' },
    { label: 'Critical Risk Corridors', value: criticalRoads, color: 'var(--risk-high)' },
    { label: 'Average Network Risk', value: `${avgRisk}%`, color: getRiskColor(avgRisk) },
    { label: 'Active Fleet in Transit', value: activeVehicles, color: 'var(--accent-primary)' },
    { label: 'Delivered Convoys', value: deliveredShipments, color: 'var(--risk-safe)' },
    { label: 'Delayed / At-Risk', value: delayedShipments, color: 'var(--risk-moderate)' },
    { label: 'Resolved Incidents', value: resolvedIncidents, color: 'var(--accent-secondary)' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AnalyticsIcon size={22} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ margin: 0 }}>{t('nav.analytics', language)}</h2>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => alert('CSV export downloaded')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FileTextIcon size={14} /> Export CSV
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => alert('PDF report generated')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FileTextIcon size={14} /> Export PDF
          </button>
        </div>
      </div>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((s, i) => (
          <div key={i} className="kpi-card" style={{ '--kpi-color': s.color || 'var(--accent-primary)' } as React.CSSProperties}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card">
          <div className="card-title">Road Risk Distribution</div>
          <div style={{ marginTop: '0.75rem' }}>
            {['SAFE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map(level => {
              const count = roads.filter(r => getRiskLevel(riskPredictions.get(r.id)?.currentRisk ?? 0) === level).length;
              const pct = totalRoads > 0 ? (count / totalRoads * 100) : 0;
              return (
                <div key={level} className="flex items-center gap-2 mb-2">
                  <span className="text-xs" style={{ width: '70px', color: RISK_LEVELS[level as keyof typeof RISK_LEVELS].color }}>{level}</span>
                  <div style={{ flex: 1, height: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: RISK_LEVELS[level as keyof typeof RISK_LEVELS].color, borderRadius: '6px', transition: 'width 0.5s' }} />
                  </div>
                  <span className="font-mono text-xs" style={{ width: '30px', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Shipment Status Distribution</div>
          <div style={{ marginTop: '0.75rem' }}>
            {['PLANNED', 'DISPATCHED', 'IN_TRANSIT', 'DELAYED', 'AT_RISK', 'DELIVERED', 'CANCELLED'].map(status => {
              const count = shipments.filter(s => s.status === status).length;
              const pct = shipments.length > 0 ? (count / shipments.length * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-2 mb-2">
                  <span className="text-xs" style={{ width: '80px' }}>{status.replace(/_/g, ' ')}</span>
                  <div style={{ flex: 1, height: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '6px' }} />
                  </div>
                  <span className="font-mono text-xs" style={{ width: '20px', textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Full Map Page ──
function MapPage({ 
  onOpenRealityRecon, 
  onOpenWeatherModal,
  onOpenImageIntel,
  onOpenSatelliteIntel,
}: { 
  onOpenRealityRecon?: (idx?: number) => void; 
  onOpenWeatherModal?: () => void;
  onOpenImageIntel?: () => void;
  onOpenSatelliteIntel?: () => void;
}) {
  return (
    <div style={{ height: 'calc(100vh - var(--header-height) - 2rem)' }}>
      <MapView 
        fullscreen 
        onOpenRealityRecon={onOpenRealityRecon} 
        onOpenWeatherModal={onOpenWeatherModal}
        onOpenImageIntel={onOpenImageIntel}
        onOpenSatelliteIntel={onOpenSatelliteIntel}
      />
    </div>
  );
}

// ── Main App ──
export default function NERCommandApp({
  portalRole = 'CUSTOMER',
  portalTitle,
}: {
  portalRole?: PortalRole;
  portalTitle?: string;
}) {
  const { user, isAuthenticated, theme } = useApp();
  const config = PORTAL_CONFIGS[portalRole] || PORTAL_CONFIGS.CUSTOMER;

  const [activePage, setActivePage] = useState('dashboard');
  const [commanderOpen, setCommanderOpen] = useState(false);
  const [realityModalOpen, setRealityModalOpen] = useState(false);
  const [realityFeedIndex, setRealityFeedIndex] = useState(0);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);

  const handleOpenReality = (feedIdx = 0) => {
    setRealityFeedIndex(feedIdx);
    setRealityModalOpen(true);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auth Guard:
  // If not authenticated, or if viewing an official portal with a customer/viewer role
  const requiresAuth = !isAuthenticated || (!config.isCustomer && user?.role === 'VIEWER');

  if (requiresAuth) {
    return <AuthScreen portalRole={portalRole} portalTitle={portalTitle} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={setActivePage} onOpenWeatherModal={() => setWeatherModalOpen(true)} />;
      case 'satellite-intel': return <SatelliteIntelligenceHub onNavigateRoutes={() => setActivePage('routes')} onOpenMap={() => setActivePage('map')} />;
      case 'image-intel': return <ImageIntelligenceHub onNavigateRoutes={() => setActivePage('routes')} onOpenMap={() => setActivePage('map')} />;
      case 'reality': return <RealityReconPage onNavigate={setActivePage} />;
      case 'map': return <MapPage onOpenRealityRecon={handleOpenReality} onOpenWeatherModal={() => setWeatherModalOpen(true)} onOpenImageIntel={() => setActivePage('image-intel')} onOpenSatelliteIntel={() => setActivePage('satellite-intel')} />;
      case 'risk': return <RiskPage />;
      case 'routes': return <RoutesPage />;
      case 'simulation': return <SimulationPage />;
      case 'vehicles': return <VehiclesPage />;
      case 'shipments': return <ShipmentsPage />;
      case 'incidents': return <IncidentsPage onInspectReality={handleOpenReality} />;
      case 'alerts': return <AlertsPage />;
      case 'analytics': return <AnalyticsPage />;
      default: return <DashboardPage onNavigate={setActivePage} onOpenWeatherModal={() => setWeatherModalOpen(true)} />;
    }
  };

  return (
    <div className="app-layout" data-theme={theme}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} portalRole={portalRole} />
      <div className="app-main">
        <Header 
          onCommanderToggle={() => setCommanderOpen(!commanderOpen)} 
          commanderOpen={commanderOpen}
          onOpenWeatherModal={() => setWeatherModalOpen(true)}
          onNavigate={setActivePage}
          portalRole={portalRole}
        />
        <main className="app-content">
          {renderPage()}
        </main>
      </div>
      {commanderOpen && <CommanderPanel onClose={() => setCommanderOpen(false)} />}
      {realityModalOpen && (
        <GroundRealityModal
          feedIndex={realityFeedIndex}
          onClose={() => setRealityModalOpen(false)}
          onSelectFeed={setRealityFeedIndex}
          onReroute={() => setActivePage('routes')}
        />
      )}
      {weatherModalOpen && (
        <WeatherTelemetryModal
          onClose={() => setWeatherModalOpen(false)}
          onNavigateRoutes={() => setActivePage('routes')}
        />
      )}
    </div>
  );
}
