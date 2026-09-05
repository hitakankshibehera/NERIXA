// ============================================================
// NER-SHIELD AI — Application Constants
// ============================================================

import { RiskLevel, AlertLevel, CommodityType, ShipmentPriority, UserRole } from '@/lib/types';

// --- Risk Level Colors & Thresholds ---
export const RISK_LEVELS: Record<RiskLevel, { min: number; max: number; color: string; bgColor: string; label: string }> = {
  SAFE:     { min: 0,  max: 20,  color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)',  label: 'Safe' },
  LOW:      { min: 21, max: 40,  color: '#84cc16', bgColor: 'rgba(132, 204, 22, 0.15)', label: 'Low Risk' },
  MODERATE: { min: 41, max: 60,  color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)',  label: 'Moderate' },
  HIGH:     { min: 61, max: 80,  color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)', label: 'High Risk' },
  CRITICAL: { min: 81, max: 100, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)',  label: 'Critical' },
};

export const ROAD_RISK_COLORS = {
  safe: '#22c55e',
  low: '#84cc16',
  moderate: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
  blocked: '#dc2626',
};

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'SAFE';
  if (score <= 40) return 'LOW';
  if (score <= 60) return 'MODERATE';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

export function getRiskColor(score: number): string {
  const level = getRiskLevel(score);
  return RISK_LEVELS[level].color;
}

// --- Alert Level Colors ---
export const ALERT_COLORS: Record<AlertLevel, { color: string; bgColor: string; icon: string }> = {
  CRITICAL: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', icon: '●' },
  HIGH:     { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)', icon: '●' },
  MEDIUM:   { color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)',  icon: '●' },
  LOW:      { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)', icon: '●' },
  INFO:     { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)', icon: '●' },
};

// --- Commodity Icons & Labels ---
export const COMMODITY_CONFIG: Record<CommodityType, { label: string; icon: string; color: string }> = {
  MEDICINE:              { label: 'Medicine',              icon: 'MED',  color: '#ef4444' },
  FOOD:                  { label: 'Food',                  icon: 'FOOD', color: '#f97316' },
  EMERGENCY_SUPPLIES:    { label: 'Emergency Supplies',    icon: 'EMRG', color: '#dc2626' },
  AGRICULTURAL_PRODUCE:  { label: 'Agricultural Produce',  icon: 'AGRI', color: '#22c55e' },
  CONSTRUCTION_MATERIAL: { label: 'Construction Material', icon: 'MAT',  color: '#6366f1' },
  OTHER:                 { label: 'Other',                 icon: 'GEN',  color: '#8b5cf6' },
};

// --- Priority Config ---
export const PRIORITY_CONFIG: Record<ShipmentPriority, { label: string; color: string; weight: number }> = {
  CRITICAL: { label: 'Critical', color: '#ef4444', weight: 4 },
  HIGH:     { label: 'High',     color: '#f97316', weight: 3 },
  MEDIUM:   { label: 'Medium',   color: '#eab308', weight: 2 },
  NORMAL:   { label: 'Normal',   color: '#22c55e', weight: 1 },
};

// --- Role Config ---
export const ROLE_CONFIG: Record<UserRole, { label: string; level: number; description: string }> = {
  SUPER_ADMIN:       { label: 'Super Admin',       level: 100, description: 'Full system access' },
  STATE_ADMIN:       { label: 'State Admin',       level: 80,  description: 'State-level administration' },
  DISTRICT_OFFICER:  { label: 'District Officer',  level: 60,  description: 'District-level operations' },
  FIELD_OFFICER:     { label: 'Field Officer',     level: 40,  description: 'Field reporting & monitoring' },
  LOGISTICS_OPERATOR:{ label: 'Logistics Operator', level: 30, description: 'Vehicle & shipment management' },
  VIEWER:            { label: 'Viewer',             level: 10,  description: 'Read-only access' },
};

// --- NER Region ---
export const NER_CENTER = { lat: 26.2, lng: 92.9 };
export const NER_BOUNDS = {
  north: 29.5,
  south: 21.9,
  east: 97.5,
  west: 88.0,
};
export const NER_DEFAULT_ZOOM = 7;

export const NER_STATES = [
  { id: 'assam',            name: 'Assam',              code: 'AS', capital: 'Dispur',      center: { lat: 26.2006, lng: 92.9376 } },
  { id: 'arunachal',        name: 'Arunachal Pradesh',  code: 'AR', capital: 'Itanagar',    center: { lat: 27.0844, lng: 93.6053 } },
  { id: 'meghalaya',        name: 'Meghalaya',          code: 'ML', capital: 'Shillong',    center: { lat: 25.4670, lng: 91.3662 } },
  { id: 'manipur',          name: 'Manipur',            code: 'MN', capital: 'Imphal',      center: { lat: 24.6637, lng: 93.9063 } },
  { id: 'mizoram',          name: 'Mizoram',            code: 'MZ', capital: 'Aizawl',      center: { lat: 23.1645, lng: 92.9376 } },
  { id: 'nagaland',         name: 'Nagaland',           code: 'NL', capital: 'Kohima',      center: { lat: 26.1584, lng: 94.5624 } },
  { id: 'tripura',          name: 'Tripura',            code: 'TR', capital: 'Agartala',     center: { lat: 23.9408, lng: 91.9882 } },
  { id: 'sikkim',           name: 'Sikkim',             code: 'SK', capital: 'Gangtok',     center: { lat: 27.5330, lng: 88.5122 } },
];

// --- Vehicle Status Colors ---
export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  MOVING: '#22c55e',
  IDLE: '#6b7280',
  STOPPED: '#9ca3af',
  OFFLINE: '#4b5563',
  DELAYED: '#eab308',
  AT_RISK: '#f97316',
  DELIVERED: '#3b82f6',
  EMERGENCY: '#ef4444',
};

// --- Default Risk Weights ---
export const DEFAULT_RISK_WEIGHTS = {
  weather: 0.30,
  terrain: 0.25,
  infrastructure: 0.20,
  historical: 0.15,
  traffic: 0.10,
};

// --- Map Layer IDs ---
export const MAP_LAYERS = [
  { id: 'roads',           label: 'Roads',              icon: '●',  defaultOn: true },
  { id: 'traffic',         label: 'Traffic Layer',      icon: '●',  defaultOn: false },
  { id: 'bridges',         label: 'Bridges',            icon: '●',  defaultOn: true },
  { id: 'districts',       label: 'Districts',          icon: '●',  defaultOn: false },
  { id: 'vehicles',        label: 'Vehicles',           icon: '●',  defaultOn: true },
  { id: 'incidents',       label: 'Incidents',          icon: '●',  defaultOn: true },
  { id: 'weather',         label: 'Weather',            icon: '●',  defaultOn: false },
  { id: 'floodZones',      label: 'Flood Zones',        icon: '●',  defaultOn: false },
  { id: 'landslideZones',  label: 'Landslide Zones',    icon: '●',  defaultOn: false },
  { id: 'warehouses',      label: 'Warehouses',         icon: '●',  defaultOn: true },
  { id: 'hospitals',       label: 'Hospitals',          icon: '●',  defaultOn: true },
  { id: 'emergencyCorridors', label: 'Emergency Corridors', icon: '●', defaultOn: false },
  { id: 'satelliteObservations', label: 'Satellite Observations', icon: '●', defaultOn: true },
  { id: 'sentinel1Flood',  label: 'Sentinel-1 SAR Flood', icon: '●', defaultOn: true },
  { id: 'sentinel2Optical', label: 'Sentinel-2 Optical', icon: '●', defaultOn: false },
  { id: 'satelliteChanges', label: 'Satellite Changes', icon: '●', defaultOn: true },
];

// --- App Metadata ---
export const APP_NAME = 'NER-SHIELD AI';
export const APP_TAGLINE = 'Predict the disruption. Protect the supply. Optimize the route. Save the response time.';
export const APP_VERSION = '1.0.0-mvp';
