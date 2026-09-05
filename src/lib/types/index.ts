// ============================================================
// NER-SHIELD AI — Core Type Definitions
// ============================================================

// --- Enums & Constants ---

export type RiskLevel = 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskCategory = RiskLevel;

export type UserRole = 'SUPER_ADMIN' | 'STATE_ADMIN' | 'DISTRICT_OFFICER' | 'FIELD_OFFICER' | 'LOGISTICS_OPERATOR' | 'VIEWER';

export type RoadStatus = 'OPEN' | 'PARTIALLY_BLOCKED' | 'BLOCKED' | 'UNDER_MAINTENANCE' | 'CRITICAL';

export type VehicleStatus = 'MOVING' | 'IDLE' | 'STOPPED' | 'OFFLINE' | 'EMERGENCY' | 'DELAYED' | 'AT_RISK' | 'DELIVERED';

export type ShipmentStatus = 'PLANNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELAYED' | 'AT_RISK' | 'DELIVERED' | 'CANCELLED';

export type ShipmentPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';

export type CommodityType = 'MEDICINE' | 'FOOD' | 'EMERGENCY_SUPPLIES' | 'AGRICULTURAL_PRODUCE' | 'CONSTRUCTION_MATERIAL' | 'OTHER';

export type IncidentType = 'LANDSLIDE' | 'FLOOD' | 'ROAD_DAMAGE' | 'BRIDGE_DAMAGE' | 'TRAFFIC' | 'VEHICLE_BREAKDOWN' | 'ROAD_BLOCKED' | 'OTHER';

export type AlertLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';

export type SimulationType = 'ROAD_CLOSURE' | 'BRIDGE_FAILURE' | 'HEAVY_RAINFALL' | 'FLOOD' | 'LANDSLIDE' | 'MULTIPLE_DISRUPTIONS';

export type OptimizationMode = 'FASTEST' | 'SAFEST' | 'LOWEST_COST';

// --- Geo Types ---

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoPath {
  points: GeoPoint[];
}

// --- User ---

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stateId?: string;
  districtId?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

// --- Geography ---

export interface NERState {
  id: string;
  name: string;
  code: string;
  capital: string;
  center: GeoPoint;
  boundaryGeoJSON?: unknown;
  districtCount: number;
}

export interface District {
  id: string;
  stateId: string;
  stateName: string;
  name: string;
  center: GeoPoint;
  population?: number;
  accessibilityScore: number; // 0-100
}

// --- Infrastructure ---

export interface Road {
  id: string;
  name: string;
  number: string; // e.g., "NH-15"
  stateIds: string[];
  districtIds: string[];
  status: RoadStatus;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
  roadType: 'NH' | 'SH' | 'DISTRICT' | 'RURAL';
  length: number; // km
  speedLimit: number; // km/h
  path: GeoPoint[];
  terrain: 'FLAT' | 'HILLY' | 'MOUNTAINOUS' | 'VALLEY';
  elevation: number; // meters
  slope: number; // degrees
  riverProximity: number; // km
  historicalLandslides: number;
  historicalFloods: number;
  bridgeIds: string[];
  trafficLevel: 'LOW' | 'MODERATE' | 'HEAVY' | 'CONGESTED';
  currentRisk?: RiskPrediction;
  lastUpdated: string;
}

export interface Bridge {
  id: string;
  name: string;
  roadId: string;
  location: GeoPoint;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  length: number; // meters
  capacity: number; // tons
  riverName: string;
  builtYear: number;
  lastInspection: string;
  risk: number; // 0-100
}

export interface Warehouse {
  id: string;
  name: string;
  stateId: string;
  districtId: string;
  location: GeoPoint;
  capacity: number;
  currentStock: number;
  commodities: CommodityType[];
  contactPhone: string;
}

export interface Hospital {
  id: string;
  name: string;
  stateId: string;
  districtId: string;
  location: GeoPoint;
  beds: number;
  emergencyCapacity: boolean;
  contactPhone: string;
}

// --- Vehicles & Shipments ---

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: 'TRUCK' | 'VAN' | 'AMBULANCE' | 'TANKER' | 'PICKUP';
  driverName: string;
  driverPhone: string;
  commodity?: CommodityType;
  currentLocation: GeoPoint;
  destination?: GeoPoint;
  destinationName?: string;
  speed: number; // km/h
  heading: number; // degrees
  eta?: string;
  routeId?: string;
  routePath?: GeoPoint[];
  status: VehicleStatus;
  shipmentIds: string[];
  risk: number; // 0-100
  lastUpdated: string;
  // Real-time GPS & Telemetry fields
  accuracy?: number; // meters
  tripId?: string;
  driverId?: string;
  isRealDevice?: boolean;
  isQueuedHistorical?: boolean;
  lastPingTimestamp?: number; // unix ms
  freshnessText?: string;
  freshnessCategory?: 'LIVE' | 'UPDATED' | 'STALE' | 'OFFLINE';
}

export interface Shipment {
  id: string;
  vehicleId: string;
  commodity: CommodityType;
  commodityName: string;
  priority: ShipmentPriority;
  origin: string;
  originLocation: GeoPoint;
  destination: string;
  destinationLocation: GeoPoint;
  currentLocation?: GeoPoint;
  routeId?: string;
  eta: string;
  requiredDeliveryTime: string;
  status: ShipmentStatus;
  supplyCriticality: number; // 0-100
  weight: number; // kg
  value: number; // INR
  createdAt: string;
  lastUpdated: string;
}

// --- Risk & AI ---

export interface RiskPrediction {
  roadId: string;
  roadName: string;
  currentRisk: number; // 0-100
  risk6h: number;
  risk12h: number;
  risk24h: number;
  accessibilityScore: number; // 0-100
  riskCategory: RiskCategory;
  primaryFactors: RiskFactor[];
  confidence: number; // 0-100
  calculatedAt: string;
  modelVersion: string;
}

export interface RiskFactor {
  name: string;
  weight: number;
  value: number; // normalized 0-1
  contribution: number; // percentage contribution to risk
  description: string;
}

export interface RiskWeights {
  weather: number;
  terrain: number;
  infrastructure: number;
  historical: number;
  traffic: number;
}

export type WeatherCondition = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG';

export interface WeatherData {
  id: string;
  districtId: string;
  location: GeoPoint;
  temperature: number; // °C
  humidity: number; // %
  rainfall: number; // mm
  rainfallForecast6h: number;
  rainfallForecast12h: number;
  rainfallForecast24h: number;
  windSpeed: number; // km/h
  visibility: number; // km
  condition: WeatherCondition;
  updatedAt: string;
}

// --- Routes ---

export interface RouteOption {
  id: string;
  name: string;
  path: GeoPoint[];
  roadIds: string[];
  distance: number; // km
  estimatedTime: number; // minutes
  risk: number; // 0-100
  reliability: number; // 0-100
  score: number; // composite score
  isRecommended: boolean;
  reasons: string[];
  roadSegments: RouteSegment[];
}

export interface RouteSegment {
  roadId: string;
  roadName: string;
  distance: number;
  risk: number;
  condition: string;
  traffic: string;
}

export interface RouteRequest {
  origin: GeoPoint;
  originName: string;
  destination: GeoPoint;
  destinationName: string;
  commodity?: CommodityType;
  priority?: ShipmentPriority;
  vehicleType?: Vehicle['type'];
  avoidBlocked: boolean;
  avoidHighRisk: boolean;
  mode: OptimizationMode;
}

// --- Incidents ---

export interface Incident {
  id: string;
  type: IncidentType;
  severity: number; // 1-10
  location: GeoPoint;
  roadId?: string;
  roadName?: string;
  districtId: string;
  stateId: string;
  description: string;
  imageUrl?: string;
  photoBase64?: string;
  reportedBy: string;
  reportedAt: string;
  status: 'REPORTED' | 'VERIFIED' | 'ASSIGNED' | 'RESOLVED' | 'REJECTED';
  assignedTo?: string;
  droneRecon?: {
    droneId: string;
    altitude: number; // meters
    captureTime: string;
    debrisVolume?: number; // cubic meters
    blockedLengthMeters?: number;
    clearanceMachinery?: string[];
    alternateRoute?: string;
    liveFeedAvailable?: boolean;
  };
  aiAnalysis?: IncidentAIAnalysis;
  roadBlockagePercent?: number;
  verifiedAt?: string;
  resolvedAt?: string;
}

export interface IncidentAIAnalysis {
  type: IncidentType;
  severity: number;
  roadBlockage: number; // percentage
  confidence: number;
  affectedVehicles: number;
  affectedShipments: number;
  estimatedClearTime: string;
  recommendations: string[];
  debrisVolume?: string;
  clearancePhase?: string;
}

// --- Alerts ---

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  category: string;
  roadId?: string;
  vehicleId?: string;
  shipmentId?: string;
  districtId?: string;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  assignedTo?: string;
  escalatedTo?: string;
  aiRecommendation?: string;
}

// --- Simulations ---

export interface SimulationScenario {
  type: SimulationType;
  roadId?: string;
  bridgeId?: string;
  districtId?: string;
  duration: number; // hours
  severity: number; // 1-10
  description: string;
}

export interface SimulationResult {
  id: string;
  scenario: SimulationScenario;
  affectedDistricts: number;
  affectedDistrictNames: string[];
  affectedVehicles: number;
  affectedShipments: number;
  criticalShipments: number;
  expectedDelay: number; // hours
  additionalDistance: number; // km
  estimatedAdditionalCost: number; // INR
  supplyShortageRisk: RiskLevel;
  actionPlan: ActionPlanItem[];
  beforeState: SimulationMapState;
  afterState: SimulationMapState;
  runAt: string;
  runBy: string;
}

export interface ActionPlanItem {
  priority: number;
  action: string;
  details: string;
  status: 'PENDING' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
}

export interface SimulationMapState {
  roadStatuses: Record<string, RoadStatus>;
  roadRisks: Record<string, number>;
  vehiclePositions: Record<string, GeoPoint>;
  affectedRoadIds: string[];
}

// --- Audit ---

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, string>;
}

// --- Dashboard ---

export interface DashboardSummary {
  nerConnectivity: number; // percentage
  criticalRoads: number;
  highRiskCorridors: number;
  activeVehicles: number;
  atRiskShipments: number;
  criticalAlerts: number;
  totalRoads: number;
  totalVehicles: number;
  totalShipments: number;
  totalIncidents: number;
  blockedRoads: number;
}

// --- AI Commander ---

export interface CommanderQuery {
  text: string;
  intent: CommanderIntent;
  entities: Record<string, string>;
}

export type CommanderIntent = 
  | 'ROUTE_QUERY'
  | 'RISK_QUERY'
  | 'SHIPMENT_QUERY'
  | 'VEHICLE_QUERY'
  | 'SIMULATION_QUERY'
  | 'SUPPLY_QUERY'
  | 'EXPLANATION_QUERY'
  | 'GENERAL_QUERY';

export interface CommanderResponse {
  text: string;
  data?: unknown;
  suggestions?: string[];
  mapAction?: {
    type: 'ZOOM_TO' | 'HIGHLIGHT_ROAD' | 'SHOW_ROUTE' | 'SHOW_VEHICLES';
    target: string;
  };
}

// --- Demo Mode ---

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  duration: number; // seconds
  action: () => Promise<void>;
}

export interface DemoState {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  isPaused: boolean;
  startedAt?: string;
}

// --- i18n ---

export type SupportedLanguage = 'en' | 'hi' | 'as' | 'bn' | 'brx' | 'kha' | 'mni' | 'lus' | 'nag';

export interface Translation {
  [key: string]: string | Translation;
}

// --- Real-Time Architecture & Transportation Data ---

export type OperationalMode = 'LIVE_DATA' | 'DEMO_SIMULATION';

export interface VehicleTelemetry {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: number; // unix ms
  trip_id?: string;
  driver_id?: string;
  driver_name?: string;
  status: VehicleStatus;
  is_queued_historical?: boolean;
  source: 'REAL_DEVICE' | 'DEMO_SIMULATION';
}

export type DataSourceType =
  | 'GPS_FLEET'
  | 'GOOGLE_TRAFFIC'
  | 'GOOGLE_ROUTES'
  | 'WEATHER'
  | 'SENTINEL_1'
  | 'SENTINEL_2'
  | 'FIELD_OFFICERS'
  | 'ROAD_NETWORK'
  | 'PUBLIC_TRANSIT';

export interface DataSourceStatus {
  id: DataSourceType;
  name: string;
  category: string;
  connected: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'UNAVAILABLE' | 'SYNCING';
  lastUpdated: string | null;
  freshnessLabel: string;
  recordsReceived: number;
  errorMessage?: string;
  isRealtime: boolean;
  notes?: string;
}

export type SystemEventType =
  | 'vehicle_location_updated'
  | 'vehicle_offline'
  | 'vehicle_emergency'
  | 'route_deviation'
  | 'incident_created'
  | 'risk_changed'
  | 'road_blocked'
  | 'shipment_at_risk'
  | 'reroute_required'
  | 'reroute_approved'
  | 'reroute_sent_to_driver'
  | 'field_report_received'
  | 'satellite_observation_processed'
  | 'weather_warning_received';

export interface LiveSystemEvent {
  id: string;
  type: SystemEventType;
  timestamp: string; // HH:mm:ss or ISO
  timestampMs: number;
  title: string;
  description: string;
  entityId?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  source: 'LIVE' | 'DEMO';
  metadata?: Record<string, unknown>;
}

export interface RerouteRecommendation {
  id: string;
  vehicleId: string;
  shipmentId?: string;
  createdAt: string;
  status: 'RECOMMENDED' | 'APPROVED' | 'REJECTED' | 'DISPATCHED_TO_DRIVER';
  originalRoute: {
    name: string;
    distanceKm: number;
    durationMinutes: number;
    trafficCondition: 'Light' | 'Moderate' | 'Heavy';
    riskLevel: RiskLevel;
    riskScore: number;
    polyline: GeoPoint[];
    identifiedHazards: string[];
  };
  recommendedRoute: {
    name: string;
    distanceKm: number;
    durationMinutes: number;
    trafficCondition: 'Light' | 'Moderate' | 'Heavy';
    riskLevel: RiskLevel;
    riskScore: number;
    polyline: GeoPoint[];
    safetyJustification: string;
  };
  decisionRationale: string;
}

export interface SpatialIncidentImpact {
  incidentId: string;
  hazardType: IncidentType;
  matchedRoadId?: string;
  matchedRoadName?: string;
  affectedRoadIds: string[];
  affectedVehicles: Array<{
    vehicleId: string;
    vehicleNumber: string;
    driverName: string;
    distanceToHazardKm: number;
    isApproaching: boolean;
    estimatedTimeToHazardMinutes: number;
  }>;
  affectedShipments: Array<{
    shipmentId: string;
    commodityName: string;
    priority: ShipmentPriority;
    supplyCriticality: number;
    vehicleId: string;
  }>;
  affectedCriticalFacilities: Array<{
    type: 'HOSPITAL' | 'WAREHOUSE';
    name: string;
    distanceKm: number;
  }>;
  riskScoreDelta: number;
  recommendedAction: string;
}

