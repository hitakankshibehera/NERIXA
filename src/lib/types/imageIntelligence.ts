// ============================================================
// NERIXA — Real-Time Image Intelligence Type Definitions
// Computer Vision, CCTV, Field Officer, Satellite & Logistics Impact
// ============================================================

import type { GeoPoint, RoadStatus } from '@/lib/types';

export type ImageSourceType = 'FIELD_OFFICER' | 'CCTV_CAMERA' | 'SATELLITE_REMOTE_SENSING';

export type IncidentCategory =
  | 'LANDSLIDE'
  | 'FLOODED_ROAD'
  | 'WATERLOGGING'
  | 'ROAD_BLOCKAGE'
  | 'FALLEN_TREES'
  | 'DEBRIS'
  | 'DAMAGED_ROAD'
  | 'DAMAGED_BRIDGE'
  | 'TRAFFIC_CONGESTION'
  | 'ACCIDENT_OBSTRUCTION'
  | 'CONSTRUCTION_ROADWORK'
  | 'NORMAL_ROAD'
  | 'POOR_VISIBILITY'
  | 'INFRASTRUCTURE_DAMAGE';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VerificationStatus =
  | 'AI_DETECTED'
  | 'OFFICER_VERIFIED'
  | 'AUTHORITY_CONFIRMED'
  | 'REJECTED'
  | 'FALSE_POSITIVE'
  | 'ESCALATED';

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  districtId: string;
  districtName: string;
  state: string;
  roadId: string;
  roadNumber: string;
  streamUrl: string;
  status: 'ONLINE' | 'OFFLINE';
  isDemo: boolean;
  lastImageReceived: string;
  lastUpdateTime: string;
  frequencyMinutes: number;
  alertThreshold: SeverityLevel;
  currentRiskScore: number;
  resolution: string;
}

export interface SatellitePass {
  id: string;
  satelliteName: string; // e.g. "ISRO RISAT-2BR1", "Sentinel-2 SAR"
  sensorType: string;    // e.g. "C-Band Synthetic Aperture Radar"
  captureTime: string;
  location: string;
  lat: number;
  lng: number;
  areaCoveredKm2: number;
  imageType: 'RADAR_SAR' | 'MULTISPECTRAL' | 'THERMAL_INFRARED';
  processingStatus: 'PROCESSED' | 'ANALYZING' | 'PENDING';
  orbitAltitude: string;
  hazardDetected: string;
  confidence: number;
  downloadUrl?: string;
  imageUrl: string;
}

export interface FieldOfficerReport {
  id: string;
  officerId: string;
  officerName: string;
  officerPhone?: string;
  districtId: string;
  districtName: string;
  roadId: string;
  roadNumber: string;
  lat: number;
  lng: number;
  timestamp: string;
  incidentType: IncidentCategory;
  description: string;
  imageUrl: string;
  offlineSyncStatus: 'SYNCED' | 'PENDING_SYNC';
  syncedAt?: string;
  fileSizeBytes?: number;
  deviceInfo?: string;
}

export interface ImageAIDetection {
  incidentType: IncidentCategory;
  severity: SeverityLevel;
  confidence: number; // 0 - 100 percentage
  description: string;
  affectedRoad: string;
  accessibilityStatus: 'OPEN' | 'HIGH_RISK' | 'PARTIALLY_BLOCKED' | 'BLOCKED';
  recommendedAction: string;
  roadBlockagePercent: number; // 0 - 100%
  debrisVolumeM3?: number;
  waterDepthCm?: number;
  detectedFeatures: string[];
}

export interface ImageRiskUpdate {
  previousRisk: number; // 0 - 100
  newRisk: number;      // 0 - 100
  reason: string;
  applied: boolean;
  timestamp: string;
  previousAccessibility: RoadStatus;
  newAccessibility: RoadStatus;
}

export interface ImageLogisticsImpact {
  affectedVehiclesCount: number;
  affectedShipmentsCount: number;
  criticalShipmentsCount: number;
  criticalMedicineDeliveries: string[];
  estimatedDelayMinutes: number; // e.g. 320 for 5h 20m
  supplyDisruptionRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  alternativeRouteAvailable: boolean;
  alternativeRouteName: string;
  alternativeRouteDeltaKm: number;
  affectedVehicleIds: string[];
  affectedShipmentIds: string[];
}

export interface VerificationAuditItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'VERIFY' | 'REJECT' | 'MARK_FALSE_POSITIVE' | 'ESCALATE' | 'UPDATE_ROAD_STATUS';
  notes: string;
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
}

export interface RoadImageIntel {
  id: string;
  title: string;
  sourceType: ImageSourceType;
  sourceId: string;
  sourceName: string;
  imageUrl: string;
  beforeImageUrl: string; // Baseline comparison photo
  thumbnailUrl: string;
  timestamp: string;
  lat: number;
  lng: number;
  districtId: string;
  districtName: string;
  state: string;
  roadId: string;
  roadNumber: string;
  isDemo: boolean;
  aiDetection: ImageAIDetection;
  riskUpdate: ImageRiskUpdate;
  logisticsImpact: ImageLogisticsImpact;
  verification: {
    status: VerificationStatus;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
    auditTrail: VerificationAuditItem[];
  };
  metadata: {
    resolution?: string;
    altitudeAGL?: string;
    fileSize?: string;
    shutterSpeed?: string;
    lensType?: string;
    satelliteSensor?: string;
  };
}

export interface RoadImageTimelineItem {
  timeLabel: string;
  timestamp: string;
  imageUrl: string;
  condition: string;
  riskScore: number;
  roadStatus: RoadStatus;
  waterLevel?: string;
  trafficState: string;
}

export interface ImageIntelligenceSummary {
  imagesReceivedToday: number;
  aiIncidentsDetected: number;
  criticalIncidents: number;
  highSeverityIncidents: number;
  mediumSeverityIncidents: number;
  camerasTotal: number;
  camerasOnline: number;
  camerasOffline: number;
  fieldReportsPendingSync: number;
  roadsAffectedCount: number;
  medicineShipmentsAtRisk: number;
}
