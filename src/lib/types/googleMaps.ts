// ============================================================
// NER-SHIELD AI — Google Maps & Operational Intelligence Types
// Complete type contracts for Google Maps modes, Street View,
// 15 intelligence layers, visual history, and multi-source verification
// ============================================================

import type { Road } from './index';

export type MapEngine = 'google' | 'leaflet';

export type MapMode = 'roadmap' | 'satellite' | 'hybrid' | 'terrain' | 'dark' | 'nerixa_intel' | 'streetview';

export interface StreetViewMetadata {
  available: boolean;
  lat: number;
  lng: number;
  panoId?: string;
  imageryDate?: string; // e.g., "2023-08" or "Oct 2022"
  locationDescription?: string;
  copyright?: string;
  statusMessage: string;
  isRealData: boolean;
}

export interface ElevationIntelligence {
  elevationMeters: number;
  slopePercent: number;
  terrainType: 'Mountainous' | 'Rugged Highlands' | 'River Valley' | 'Hilly Pass' | 'Alluvial Plain';
  classification: 'HIGH_ALTITUDE_RIDGE' | 'MOUNTAIN_PASS' | 'VALLEY_FLOOR' | 'RIVER_BASIN' | 'PLATEAU';
  landslideSusceptibility: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  roadCondition: string;
}

export interface MountainRoadIntelligence {
  roadId: string;
  roadName: string;
  roadNumber: string;
  elevationMeters: number;
  slopePercent: number;
  terrainType: string;
  roadCondition: string;
  weather: {
    condition: string;
    temperature: number;
    rainfallRate: number;
    windSpeed: number;
  };
  trafficLevel: string;
  floodRisk: number; // 0-100
  landslideRisk: number; // 0-100
  bridgeCondition: string;
  nearbyIncidentsCount: number;
  vehiclesApproachingCount: number;
  criticalShipmentsCount: number;
  latestFieldReport?: {
    timeAgo: string;
    incidentType: string;
    severity: number;
    imageUrl?: string;
  };
  satelliteEvidence?: {
    satellite: string;
    acquisitionTime: string;
    finding: string;
    confidence: number;
  };
  aiRecommendation: 'PROCEED_NORMAL' | 'PROCEED_WITH_CAUTION' | 'RESTRICT_HEAVY_CONVOYS' | 'REROUTE';
  recommendationReason: string;
}

export interface LocationIntelligence {
  lat: number;
  lng: number;
  district: string;
  state: string;
  nearestRoad?: Road;
  accessibilityScore: number; // 0-100%
  roadRisk: number; // 0-100
  elevationIntel?: ElevationIntelligence;
  weather: {
    temperature: number;
    condition: string;
    rainfallRate: number;
    humidity: number;
  };
  satelliteObservation?: {
    satellite: string;
    acquisitionTime: string;
    detectionType: string;
    confidence: number;
    waterCoverageChange?: string;
  };
  streetViewStatus: StreetViewMetadata;
  nearbyVehiclesCount: number;
  affectedShipmentsCount: number;
  recentIncidentsCount: number;
  recentFieldImagesCount: number;
  evidenceFusion?: EvidenceFusion;
}

export interface VisualHistoryEvent {
  id: string;
  timestamp: string;
  formattedTime: string;
  type: 'FIELD_IMAGE' | 'SATELLITE_OBSERVATION' | 'STREET_VIEW' | 'AI_DETECTION';
  title: string;
  description: string;
  source: string;
  imageUrl?: string;
  aiConfidence?: number;
  riskScore?: number;
  isRealData: boolean;
}

export interface BeforeAfterComparison {
  id: string;
  locationName: string;
  coords: { lat: number; lng: number };
  roadNumber: string;
  district: string;
  before: {
    date: string;
    source: string;
    label: string;
    imageUrl: string;
    status: string;
    isRealData: boolean;
  };
  after: {
    date: string;
    source: string;
    label: string;
    imageUrl: string;
    detection: string;
    aiConfidence: number;
    riskScore: number;
    isRealData: boolean;
  };
}

export interface AIVisualVerification {
  locationName: string;
  roadNumber: string;
  lat: number;
  lng: number;
  sourceStreetView: {
    available: boolean;
    date?: string;
    note: string;
    isCurrent: boolean;
  };
  sourceSatellite: {
    available: boolean;
    sensor: string;
    acquisitionTime: string;
    finding: string;
    confidence: number;
  };
  sourceFieldReport: {
    available: boolean;
    officer: string;
    timestamp: string;
    finding: string;
    severity: number;
    imageUrl?: string;
  };
  commanderConclusion: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedAction: string;
  verifiedAt: string;
}

export interface AdminMapConfig {
  googleMapsApiKey: string;
  isKeyConfigured: boolean;
  preferredEngine: MapEngine;
  defaultMapMode: MapMode;
  defaultRegion: string;
  enableClustering: boolean;
  enableSplitView: boolean;
  emergencyModeActive: boolean;
  enabledLayers: {
    roads: boolean;
    traffic: boolean;
    roadRisk: boolean;
    bridges: boolean;
    vehicles: boolean;
    shipments: boolean;
    incidents: boolean;
    fieldReports: boolean;
    floodZones: boolean;
    landslideZones: boolean;
    weather: boolean;
    satelliteAI: boolean;
    criticalInfrastructure: boolean;
    warehouses: boolean;
    hospitals: boolean;
    emergencyCorridors: boolean;
    elevation: boolean;
    geofences: boolean;
  };
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'DISTRICT' | 'CITY' | 'ROAD' | 'HOSPITAL' | 'WAREHOUSE' | 'INCIDENT' | 'COORDINATES' | 'VEHICLE' | 'PASS' | 'AIRPORT' | 'RAILWAY' | 'STATE';
  lat: number;
  lng: number;
  zoom: number;
  associatedId?: string;
}

// ── Evidence Cascade Types ──

export type EvidenceSourceType =
  | 'GOOGLE_STREET_VIEW'
  | 'FIELD_OFFICER'
  | 'SENTINEL_1_SAR'
  | 'SENTINEL_2_OPTICAL'
  | 'CCTV_CAMERA';

export interface LocationEvidence {
  id: string;
  sourceType: EvidenceSourceType;
  sourceName: string;
  imageUrl?: string;
  capturedAt: string;
  lat: number;
  lng: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceAge: string;
  finding?: string;
  severity?: number;
  officerId?: string;
  officerName?: string;
  sensor?: string;
  resolution?: string;
  isRealData: boolean;
}

export interface EvidenceFusion {
  location: { lat: number; lng: number; name: string };
  bestAvailable: LocationEvidence | null;
  allSources: LocationEvidence[];
  streetViewAvailable: boolean;
  fieldEvidenceAvailable: boolean;
  satelliteEvidenceAvailable: boolean;
  aiAnalysis: {
    currentCondition: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    evidenceSources: string[];
    evidenceAge: string;
    recommendedAction: string;
  };
  noRecentEvidence: boolean;
}
