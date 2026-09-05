// ============================================================
// NERIXA — Satellite AI Intelligence Type Definitions
// Copernicus Data Space Ecosystem (Sentinel-1 SAR / Sentinel-2 Optical)
// ============================================================

import type { RoadStatus, RouteOption } from '@/lib/types';

export type CopernicusSatellite = 'Sentinel-1' | 'Sentinel-2';
export type CopernicusSensor = 'SAR-C' | 'MSI-Optical';
export type SatelliteSource = 'COPERNICUS_CDSE' | 'SENTINEL_1_SAR' | 'SENTINEL_2_OPTICAL';

export type SatelliteObservationStatus = 
  | 'AVAILABLE' 
  | 'DOWNLOADING' 
  | 'PROCESSING' 
  | 'PROCESSED' 
  | 'FAILED';

export type SatelliteDetectionType =
  | 'POSSIBLE_FLOOD'
  | 'FLOOD_EXPANSION'
  | 'POSSIBLE_LANDSLIDE'
  | 'TERRAIN_CHANGE'
  | 'SURFACE_CHANGE'
  | 'ROAD_CORRIDOR_CHANGE'
  | 'NO_SIGNIFICANT_CHANGE';

export type DetectionConfidenceStatus =
  | 'DETECTED'
  | 'POSSIBLE'
  | 'HIGH_CONFIDENCE'
  | 'NEEDS_FIELD_VERIFICATION';

export type SatelliteSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SatelliteProduct {
  id: string;
  title: string;
  satellite: CopernicusSatellite;
  sensor: CopernicusSensor;
  productType: 'GRD' | 'SLC' | 'L2A' | 'L1C';
  acquisitionDate: string; // Actual observation timestamp
  cloudCoverage?: number; // 0 - 100 percentage
  orbitNumber?: number;
  relativeOrbit?: number;
  footprintGeometry: [number, number][]; // Lat/Lng polygon
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  thumbnailUrl: string;
  downloadUrl?: string;
  sizeBytes?: number;
  status: SatelliteObservationStatus;
  isDemo?: boolean;
}

export interface SatelliteObservation {
  id: string;
  productId: string;
  satellite: CopernicusSatellite;
  sensor: CopernicusSensor;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  lat: number;
  lng: number;
  acquisitionTime: string; // Formatted "Latest Available Satellite Observation"
  cloudCoverage?: number; // e.g. 14.2%
  isCloudCovered?: boolean; // If Sentinel-2 is unsuitable due to cloud cover
  cloudSuitabilityWarning?: string;
  imageUrl: string;
  baselineComparisonUrl?: string;
  radarPolarization?: 'VV' | 'VH' | 'VV+VH';
  spatialResolutionMeters: number; // e.g. 10m for Sentinel-2, 20m for Sentinel-1
  nearbyRoadIds: string[];
  nearbyRoadNumbers: string[];
  isDemo: boolean;
  status: SatelliteObservationStatus;
  detection?: SatelliteDetection;
  changeDetection?: SatelliteChangeDetection;
  roadImpact?: SatelliteRoadImpact;
}

export interface SatelliteDetection {
  id: string;
  observationId: string;
  detectionType: SatelliteDetectionType;
  status: DetectionConfidenceStatus;
  confidence: number; // Calibrated 0 - 100% (never claiming 100%)
  severity: SatelliteSeverity;
  polygon: [number, number][]; // Lat/Lng polygon of detected flood/hazard
  areaKm2: number;
  observationTime: string;
  waterDepthEstimateCm?: number;
  estimatedVolumeM3?: number;
  explanation: string;
  recommendedAction: string;
  needsFieldVerification: boolean;
  fieldVerificationStatus?: 'NOT_REQUESTED' | 'DISPATCHED' | 'OFFICER_CONFIRMED' | 'REJECTED';
}

export interface SatelliteChangeDetection {
  id: string;
  observationId: string;
  previousObservationDate: string;
  latestObservationDate: string;
  satellite: CopernicusSatellite;
  previousImageUrl: string;
  latestImageUrl: string;
  changeDetected: string;
  changeAreaKm2: number;
  floodExpansionKm2?: number;
  confidence: number;
  keyObservationFindings: string[];
}

export interface SatelliteRoadImpact {
  roadId: string;
  roadNumber: string;
  roadName: string;
  previousRisk: number; // e.g. 34
  updatedRisk: number;  // e.g. 84
  previousAccessibility: number; // e.g. 78%
  updatedAccessibility: number;  // e.g. 24%
  roadStatus: RoadStatus; // e.g. 'HIGH_RISK' or 'BLOCKED'
  affectedLengthKm: number;
  intersectingPolygon: [number, number][];
  affectedVehiclesCount: number;
  affectedVehicleNumbers: string[];
  affectedShipmentsCount: number;
  criticalShipmentsCount: number;
  criticalMedicineShipments: string[]; // e.g. ['Oxygen Cylinders (Tawang Hospital)', 'Emergency Vaccines (Bomdila PHC)']
  recommendedRoute?: RouteOption;
  whyThisRouteExplanation: string;
}

export interface SatelliteProcessingJob {
  id: string;
  satellite: CopernicusSatellite;
  areaName: string;
  status: 'QUEUED' | 'DOWNLOADING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  productsFound: number;
  detectionsCount: number;
  logMessage: string;
}

export interface SatelliteAdminConfig {
  connected: boolean;
  credentialsConfigured: boolean;
  clientIdMasked: string;
  apiProvider: string;
  monitoredStates: string[];
  monitoredDistricts: string[];
  sentinel1Enabled: boolean;
  sentinel2Enabled: boolean;
  autoIngestIntervalHours: number;
  lastSyncTimestamp: string;
  syncStatus: 'CONNECTED' | 'NOT_CONFIGURED' | 'FAILED';
  totalProductsCataloged: number;
  processingJobs: SatelliteProcessingJob[];
}

export interface SatelliteIntelligenceSummary {
  latestObservationTime: string;
  areasMonitored: number;
  floodDetections: number;
  possibleLandslides: number;
  roadsAffected: number;
  criticalShipmentsAffected: number;
}
