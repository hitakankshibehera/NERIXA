// ============================================================
// NER-SHIELD AI — Google Maps-Style Operational Intelligence Map
// Multi-mode basemap (ROADMAP, SATELLITE, HYBRID, TERRAIN, STREET VIEW)
// Map + Street View Split View, 15 Intelligence Layers, Real Field Images,
// Image Markers, Visual History Timeline, Before/After Slider,
// Map-Click Location Intelligence, Route Visualization, Emergency Mode & Admin Control.
// ============================================================
'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '@/lib/store/AppContext';
import {
  getRiskColor,
  getRiskLevel,
  RISK_LEVELS,
  VEHICLE_STATUS_COLORS,
  COMMODITY_CONFIG,
  NER_CENTER,
  NER_DEFAULT_ZOOM,
} from '@/lib/constants';
import type { Road, Vehicle, Incident, Hospital, Warehouse, Bridge } from '@/lib/types';
import { calculateFreshness } from '@/lib/fleet/telemetryValidator';
import type { LiveWeatherReport } from '@/lib/weather/weatherService';
import type {
  MapMode,
  MapEngine,
  AdminMapConfig,
  LocationIntelligence,
  SearchResultItem,
  BeforeAfterComparison,
} from '@/lib/types/googleMaps';
import StreetViewPanoramaView from './maps/StreetViewPanoramaView';
import MapSearchBox from './maps/MapSearchBox';
import LocationIntelligencePanel from './maps/LocationIntelligencePanel';
import RealWorldImageryPanel from './maps/RealWorldImageryPanel';
import BeforeAfterComparisonModal from './maps/BeforeAfterComparisonModal';
import AdminMapConfigModal from './maps/AdminMapConfigModal';
import { loadGoogleMapsScript, isGoogleMapsLoaded } from '@/lib/maps/googleMapsLoader';
import { INITIAL_FLOOD_ZONES, INITIAL_BRIDGES, INITIAL_ACCIDENTS } from '@/lib/hazards/liveHazardFeed';
import {
  RoadmapIcon,
  SatelliteImageryIcon,
  HybridIcon,
  TerrainIcon,
  StreetViewIcon,
  SplitViewIcon,
  EmergencyShieldIcon,
  GearIcon,
  CrosshairIcon,
  CompareIcon,
  CameraIcon,
  SatelliteIcon,
  WeatherStormIcon,
  TruckIcon,
  BoxIcon,
  BotIcon,
  getVehicleSvg,
  getIncidentSvg,
  getFieldReportSvg,
  getSatelliteDetectionSvg,
  getCriticalInfraSvg,
  CloseIcon,
} from '@/components/common/Icons';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon Helpers
function createCustomMarker(type: 'shipment' | 'field' | 'satellite' | 'hospital' | 'warehouse' | 'infra', border: string, size = 32): L.DivIcon {
  let innerSvg = '';
  if (type === 'field') innerSvg = getFieldReportSvg();
  else if (type === 'satellite') innerSvg = getSatelliteDetectionSvg();
  else if (type === 'hospital' || type === 'infra') innerSvg = getCriticalInfraSvg('hospital');
  else if (type === 'warehouse') {
    innerSvg = `
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" fill="#0c1322" stroke="${border}" stroke-width="1.8"/>
        <path d="M7 11h14v10H7z" stroke="${border}" stroke-width="1.5" fill="none"/>
        <path d="M11 15h6v6h-6z" fill="${border}" fill-opacity="0.3"/>
      </svg>
    `;
  } else {
    innerSvg = `
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" fill="#0c1322" stroke="${border}" stroke-width="1.8"/>
        <path d="M8 10l6-3 6 3v8l-6 3-6-3v-8z" stroke="${border}" stroke-width="1.5" fill="${border}" fill-opacity="0.2"/>
      </svg>
    `;
  }

  return L.divIcon({
    html: `<div style="cursor:pointer;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.6));">${innerSvg}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createWeatherIcon(report: LiveWeatherReport): L.DivIcon {
  const rain = report.rainfallRate;
  const isHigh = rain > 5 || report.landslideHazardScore > 40;
  const color = isHigh ? '#f59e0b' : '#38bdf8';
  return L.divIcon({
    html: `
      <div style="background:rgba(8,12,22,0.92);border:1px solid ${color}66;border-radius:12px;padding:2px 7px;display:flex;align-items:center;gap:4px;box-shadow:0 4px 14px rgba(0,0,0,0.6);cursor:pointer;white-space:nowrap;backdrop-filter:blur(8px);">
        <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${color};"></span>
        <span style="font-size:10px;font-weight:700;color:#f8fafc;font-family:var(--font-mono)">${report.temperature}°C</span>
        <span style="font-size:9px;color:${color};font-weight:600;font-family:var(--font-mono)">${rain > 0 ? `${rain}mm` : 'dry'}</span>
      </div>
    `,
    className: '',
    iconSize: [64, 20],
    iconAnchor: [32, 10],
    popupAnchor: [0, -12],
  });
}

function createIncidentMarkerIcon(type: string, severity: number): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;cursor:pointer;filter:drop-shadow(0 0 10px rgba(239,68,68,0.5));">
        ${getIncidentSvg(type, severity)}
      </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createVehicleIcon(vehicle: Vehicle): L.DivIcon {
  const color = VEHICLE_STATUS_COLORS[vehicle.status] || '#6b7280';
  const heading = vehicle.heading || 0;
  const isEmergency = vehicle.status === 'EMERGENCY';
  const freshness = calculateFreshness(vehicle.lastPingTimestamp || vehicle.lastUpdated);
  const isLive = freshness.isLive;

  return L.divIcon({
    html: `
      <div style="position:relative;cursor:pointer;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.7));transition:transform 0.2s ease;">
        ${isEmergency ? `
          <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid #ef4444;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;background:rgba(239,68,68,0.25);"></div>
        ` : isLive ? `
          <div style="position:absolute;inset:-4px;border-radius:50%;border:1.5px solid #10b981;animation:pulse 2s infinite;background:rgba(16,185,129,0.15);"></div>
        ` : ''}
        <div style="transform:rotate(${heading}deg);display:flex;align-items:center;justify-content:center;">
          ${getVehicleSvg(color, vehicle.type)}
        </div>
        ${isEmergency ? `
          <div style="position:absolute;top:-8px;right:-8px;background:#ef4444;color:#fff;border-radius:50%;width:14px;height:14px;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 0 6px #ef4444;">!</div>
        ` : ''}
      </div>
    `,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

// ── Google Maps & High-Res Tile Providers ──
const MAP_MODES_CONFIG: Record<
  MapMode,
  {
    label: string;
    tileUrl?: string;
    subdomains?: string;
    attribution?: string;
    maxZoom?: number;
    overlayUrls?: Array<{ url: string; attribution?: string; maxZoom?: number }>;
  }
> = {
  roadmap: {
    label: 'Roadmap',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '© OpenStreetMap contributors, © CARTO',
    maxZoom: 19,
  },
  satellite: {
    label: 'Satellite',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, Maxar, Earthstar Geographics, Copernicus Sentinel',
    maxZoom: 18,
  },
  hybrid: {
    label: 'Hybrid',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, Maxar, OpenStreetMap, HERE, Garmin',
    maxZoom: 18,
    overlayUrls: [
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Esri Boundaries & Places',
        maxZoom: 18,
      },
      {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Esri Transportation',
        maxZoom: 18,
      },
    ],
  },
  terrain: {
    label: 'Terrain',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri World Topo, USGS, Intermap, OpenStreetMap contributors',
    maxZoom: 18,
  },
  dark: {
    label: 'Dark / Ops',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '© CARTO Dark Matter, OpenStreetMap contributors',
    maxZoom: 19,
  },
  nerixa_intel: {
    label: 'NERIXA Intel',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: 'NERIXA Strategic Intelligence Hub • GIS Tactical Grid',
    maxZoom: 19,
  },
  streetview: {
    label: 'Street View',
  },
};

// ── Mountain Passes & Elevation Strategic Points ──
const MOUNTAIN_PASSES = [
  {
    id: 'pass-sela',
    name: 'Sela Pass (NH-13 Corridor)',
    state: 'Arunachal Pradesh',
    elevation: 4170,
    slope: '18%',
    terrain: 'High Alpine Mountain Pass',
    landslideRisk: 'EXTREME (Snowmelt & Freeze-Thaw)',
    status: 'OPEN WITH CAUTION',
    coords: [27.50, 92.10] as L.LatLngTuple,
    weather: 'Sub-zero temperatures, dense mist',
  },
  {
    id: 'pass-bomdila',
    name: 'Bomdila Pass (NH-15 Axis)',
    state: 'Arunachal Pradesh',
    elevation: 2850,
    slope: '14%',
    terrain: 'Rugged Steep Mountain Ridge',
    landslideRisk: 'HIGH (Active 14,500 m³ Debris Slip)',
    status: 'BLOCKED / REROUTE RECOMMENDED',
    coords: [27.26, 92.42] as L.LatLngTuple,
    weather: 'Heavy monsoon downpour (14 mm/h)',
  },
  {
    id: 'pass-nathula',
    name: 'Nathu La Pass',
    state: 'Sikkim',
    elevation: 4310,
    slope: '16%',
    terrain: 'Glaciated Himalayan Ridge',
    landslideRisk: 'MODERATE',
    status: 'CONTROLLED MILITARY CONVOY TRANSIT',
    coords: [27.38, 88.83] as L.LatLngTuple,
    weather: 'Freezing, high-velocity winds',
  },
  {
    id: 'pass-pangsau',
    name: 'Pangsau Pass (Stilwell Road)',
    state: 'Arunachal Pradesh',
    elevation: 1136,
    slope: '11%',
    terrain: 'Dense Subtropical Rainforest Ridge',
    landslideRisk: 'MODERATE (Flash Soil Slip)',
    status: 'OPERATIONAL',
    coords: [27.25, 96.15] as L.LatLngTuple,
    weather: 'Warm rain, high humidity',
  },
  {
    id: 'pass-shillong',
    name: 'Shillong Peak & Laitkor Saddle',
    state: 'Meghalaya',
    elevation: 1965,
    slope: '9%',
    terrain: 'Highland Plateau Escarpment',
    landslideRisk: 'LOW-MODERATE',
    status: 'OPEN',
    coords: [25.54, 91.88] as L.LatLngTuple,
    weather: 'Continuous cloud cover, drizzle',
  },
];

// ── 8 North Eastern State Geofences ──
const NER_STATE_GEOFENCES = [
  { id: 'geo-assam', name: 'Assam', stateCode: 'AS', capital: 'Dispur / Guwahati', center: [26.14, 91.79] as L.LatLngTuple, bounds: [[25.8, 89.8], [27.9, 95.8]], color: '#38bdf8' },
  { id: 'geo-arunachal', name: 'Arunachal Pradesh', stateCode: 'AR', capital: 'Itanagar', center: [27.08, 93.60] as L.LatLngTuple, bounds: [[26.7, 91.5], [29.4, 97.4]], color: '#f59e0b' },
  { id: 'geo-meghalaya', name: 'Meghalaya', stateCode: 'ML', capital: 'Shillong', center: [25.57, 91.88] as L.LatLngTuple, bounds: [[25.0, 89.8], [26.1, 92.8]], color: '#10b981' },
  { id: 'geo-manipur', name: 'Manipur', stateCode: 'MN', capital: 'Imphal', center: [24.81, 93.93] as L.LatLngTuple, bounds: [[23.8, 93.0], [25.7, 94.8]], color: '#a855f7' },
  { id: 'geo-mizoram', name: 'Mizoram', stateCode: 'MZ', capital: 'Aizawl', center: [23.73, 92.71] as L.LatLngTuple, bounds: [[21.9, 92.2], [24.5, 93.5]], color: '#06b6d4' },
  { id: 'geo-nagaland', name: 'Nagaland', stateCode: 'NL', capital: 'Kohima', center: [25.67, 94.10] as L.LatLngTuple, bounds: [[25.2, 93.3], [27.0, 95.2]], color: '#f97316' },
  { id: 'geo-tripura', name: 'Tripura', stateCode: 'TR', capital: 'Agartala', center: [23.83, 91.28] as L.LatLngTuple, bounds: [[22.9, 91.1], [24.5, 92.3]], color: '#ec4899' },
  { id: 'geo-sikkim', name: 'Sikkim', stateCode: 'SK', capital: 'Gangtok', center: [27.33, 88.61] as L.LatLngTuple, bounds: [[27.0, 88.0], [28.1, 88.9]], color: '#84cc16' },
];

// ── Geospatial Disaster Polygons ──
const DISASTER_POLYGONS = [
  {
    id: 'poly-1',
    name: 'Zone Alpha: Bomdila Landslide Active Impact Perimeter',
    type: 'LANDSLIDE',
    coords: [
      [27.35, 92.23],
      [27.36, 92.38],
      [27.26, 92.40],
      [27.24, 92.25],
    ] as L.LatLngTuple[],
    color: '#ef4444',
    fillColor: '#dc2626',
    risk: 'EXTREME RISK (72% Blocked)',
  },
  {
    id: 'poly-2',
    name: 'Zone Beta: Brahmaputra Flood Inundation Corridor',
    type: 'FLOOD',
    coords: [
      [26.44, 92.58],
      [26.46, 92.79],
      [26.29, 92.83],
      [26.27, 92.61],
    ] as L.LatLngTuple[],
    color: '#3b82f6',
    fillColor: '#2563eb',
    risk: 'HIGH FLOOD SURGE (1.2 km Submerged)',
  },
  {
    id: 'poly-3',
    name: 'Zone Gamma: Jiri River Foundation Scour Perimeter',
    type: 'BRIDGE_SCOUR',
    coords: [
      [24.62, 93.21],
      [24.65, 93.39],
      [24.47, 93.41],
      [24.45, 93.23],
    ] as L.LatLngTuple[],
    color: '#f97316',
    fillColor: '#ea580c',
    risk: 'STRUCTURAL DAMAGE (14mm Pier Shift)',
  },
];

// ── Critical Infrastructure Seed ──
const CRITICAL_INFRASTRUCTURE = [
  { id: 'infra-1', name: 'NH-15 Border Checkpost & High-Altitude Helipad', type: 'HELIPAD', lat: 27.28, lng: 92.41, icon: 'HELIPAD', status: 'OPERATIONAL' },
  { id: 'infra-2', name: 'Nagaon 220kV Grid Substation', type: 'POWER', lat: 26.34, lng: 92.71, icon: 'POWER', status: 'MONITORED' },
  { id: 'infra-3', name: 'Silchar Mountain Telecom Microwave Tower', type: 'TELECOM', lat: 24.78, lng: 92.81, icon: 'TELECOM', status: 'BACKUP POWER' },
  { id: 'infra-4', name: 'Tezpur Military Logistics Transit Base', type: 'MILITARY', lat: 26.65, lng: 92.81, icon: 'MILITARY', status: 'SECURE' },
];

// ── Designated Emergency Green Corridors ──
const EMERGENCY_CORRIDORS = [
  {
    id: 'ec-1',
    name: 'Emergency Corridor 1: Guwahati to Shillong Trauma Lifeline',
    path: [
      [26.18, 91.75],
      [26.05, 91.82],
      [25.85, 91.87],
      [25.58, 91.89],
    ] as L.LatLngTuple[],
    color: '#10b981',
  },
  {
    id: 'ec-2',
    name: 'Emergency Corridor 2: Tezpur to Nagaon Food & Fuel Axis',
    path: [
      [26.63, 92.79],
      [26.51, 92.83],
      [26.35, 92.68],
    ] as L.LatLngTuple[],
    color: '#06b6d4',
  },
];

// Reality Drone camera feeds
const DRONE_FEEDS = [
  {
    id: 'cam-1',
    name: 'CAM 01: NH-15 Bomdila Pass Landslide',
    location: 'West Kameng, Arunachal Pradesh',
    altitude: '145m AGL',
    battery: '88%',
    image: '/reality/landslide_aerial_reality.jpg',
    incidentId: 'inc-1',
    hazard: 'Debris Avalanche (14,500 m³)',
    status: 'CRITICAL ROADBLOCK',
  },
  {
    id: 'cam-2',
    name: 'CAM 02: NH-27 Brahmaputra Flood Embankment',
    location: 'Nagaon Bypass, Assam',
    altitude: '120m AGL',
    battery: '94%',
    image: '/reality/flood_drone_recon.jpg',
    incidentId: 'inc-2',
    hazard: 'Submerged Highway (2.4 ft flood)',
    status: 'ACTIVE SDRF RESCUE',
  },
  {
    id: 'cam-3',
    name: 'CAM 03: NH-54 Mountain Excavation',
    location: 'Silchar-Aizawl Corridor, Mizoram',
    altitude: '160m AGL',
    battery: '76%',
    image: '/reality/landslide_clearance.jpg',
    incidentId: 'inc-3',
    hazard: 'Rockfall Clearance Operation',
    status: 'BRO HEAVY MACHINERY',
  },
  {
    id: 'cam-4',
    name: 'CAM 04: NH-13 InSAR Satellite Radar Convoy',
    location: 'Sela-Tawang Route, Arunachal',
    altitude: '540km ORBIT',
    battery: '100%',
    image: '/reality/convoy_satellite_twin.jpg',
    incidentId: 'inc-4',
    hazard: 'Bridge Scour Monitoring',
    status: 'ISRO RADAR LIVE',
  },
];

interface MapViewProps {
  fullscreen?: boolean;
  onSelectIncident?: (incident: Incident) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onSelectRoad?: (road: Road) => void;
  onSelectLocationIntel?: (intel: LocationIntelligence) => void;
  onOpenRealityRecon?: (camIndex?: number) => void;
  onOpenWeatherModal?: () => void;
  onOpenImageIntel?: () => void;
  onOpenSatelliteIntel?: () => void;
  onOpenSatelliteForHazard?: (hazard: {
    id?: string;
    title: string;
    category: 'FLOOD' | 'BRIDGE' | 'LANDSLIDE' | 'ACCIDENT' | 'HIGHWAY';
    locationName?: string;
    state?: string;
    district?: string;
    lat: number;
    lng: number;
    severity?: string;
    percentage?: number;
    details?: string;
    divertedRoute?: string;
    waterLevelMeters?: number;
    affectedRoadLengthKm?: number;
    river?: string;
    highway?: string;
  }) => void;
  locateTarget?: {
    lat: number;
    lng: number;
    title: string;
    category?: 'FLOOD' | 'BRIDGE' | 'ACCIDENT' | 'HIGHWAY' | string;
    details?: string;
    percentage?: number;
  } | null;
}

const DEFAULT_OPERATIONAL_LAYERS = [
  'roads',
  'traffic',
  'roadRisk',
  'bridges',
  'vehicles',
  'shipments',
  'incidents',
  'fieldReports',
  'floodZones',
  'landslideZones',
  'weather',
  'satelliteAI',
  'criticalInfrastructure',
  'warehouses',
  'hospitals',
  'emergencyCorridors',
  'elevation',
  'geofences',
];

export default function MapView({
  fullscreen,
  onSelectIncident,
  onSelectVehicle,
  onSelectRoad,
  onSelectLocationIntel,
  onOpenRealityRecon,
  onOpenWeatherModal,
  onOpenImageIntel,
  onOpenSatelliteIntel,
  onOpenSatelliteForHazard,
  locateTarget,
}: MapViewProps) {
  // Map References
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayersRef = useRef<L.TileLayer[]>([]);
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({});

  // Global Context State
  const {
    roads,
    vehicles,
    shipments,
    incidents,
    warehouses,
    hospitals,
    bridges,
    riskPredictions,
    liveWeatherReports,
    imageIntelList,
    satelliteObservations,
    theme,
    trafficLayerEnabled,
    setTrafficLayerEnabled,
    activeReroute,
    operationalMode,
  } = useApp();

  // ── Operational Map States ──
  const [mapMode, setMapMode] = useState<MapMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nerixa_map_mode');
      if (saved && saved in MAP_MODES_CONFIG) return saved as MapMode;
    }
    return 'satellite';
  });

  const [isSplitView, setIsSplitView] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return false;
    return true;
  });

  // Selected Entities
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [selectedLocationIntel, setSelectedLocationIntel] = useState<LocationIntelligence | null>(null);
  const [streetViewTarget, setStreetViewTarget] = useState<{ lat: number; lng: number; locationName: string; roadNumber?: string }>({
    lat: 26.35,
    lng: 92.68,
    locationName: 'Nagaon Bypass (NH-27)',
    roadNumber: 'NH-27',
  });

  // Modals & Panels
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showAdminConfigModal, setShowAdminConfigModal] = useState(false);
  const [showWhyThisRoute, setShowWhyThisRoute] = useState(false);

  // HUD & PIP
  const [showFleetHud, setShowFleetHud] = useState(true);

  // 17 Intelligence Layer Toggles with Persistence
  const [activeLayers, setActiveLayers] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nerixa_active_layers');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length > 0) return new Set(arr);
        }
      } catch {}
    }
    return new Set(DEFAULT_OPERATIONAL_LAYERS);
  });

  // Admin Config State
  const [adminConfig, setAdminConfig] = useState<AdminMapConfig>({
    googleMapsApiKey: '',
    isKeyConfigured: false,
    preferredEngine: 'google',
    defaultMapMode: 'satellite',
    defaultRegion: 'North Eastern Region (NER)',
    enableClustering: true,
    enableSplitView: false,
    emergencyModeActive: false,
    enabledLayers: {
      roads: true,
      roadRisk: true,
      bridges: true,
      vehicles: true,
      shipments: true,
      incidents: true,
      fieldReports: true,
      floodZones: true,
      landslideZones: true,
      weather: true,
      satelliteAI: true,
      criticalInfrastructure: true,
      warehouses: true,
      hospitals: true,
      emergencyCorridors: true,
      traffic: true,
      elevation: true,
      geofences: true,
    },
  });

  // Toggle Layer Helper with Persistence
  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      try {
        localStorage.setItem('nerixa_active_layers', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const setAllLayers = (enable: boolean) => {
    const next = enable ? new Set(DEFAULT_OPERATIONAL_LAYERS) : new Set<string>();
    setActiveLayers(next);
    try {
      localStorage.setItem('nerixa_active_layers', JSON.stringify(Array.from(next)));
    } catch {}
  };

  // ── Initialize Map & Layers ──
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [NER_CENTER.lat, NER_CENTER.lng],
      zoom: NER_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom Top-Left Zoom Control
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Metric Scale Control (Google Maps Standard)
    L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(map);

    // Initial Tile Layer
    const initialConfig = MAP_MODES_CONFIG[mapMode] || MAP_MODES_CONFIG.satellite;
    const initialUrl = initialConfig.tileUrl || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const tl = L.tileLayer(initialUrl, {
      maxZoom: initialConfig.maxZoom || 18,
      subdomains: initialConfig.subdomains || 'abc',
      attribution: initialConfig.attribution,
    }).addTo(map);
    tileLayerRef.current = tl;

    // Add initial overlay layers if hybrid
    if (initialConfig.overlayUrls) {
      initialConfig.overlayUrls.forEach((ov) => {
        const ovL = L.tileLayer(ov.url, {
          maxZoom: ov.maxZoom || 18,
          attribution: ov.attribution,
        }).addTo(map);
        overlayTileLayersRef.current.push(ovL);
      });
    }

    L.control.attribution({ position: 'bottomright', prefix: 'NERIXA Google Maps & GIS Intelligence' }).addTo(map);

    // Create Layer Groups for all 18 operational intelligence layers
    const layerNames = [
      'roads',
      'traffic',
      'roadRisk',
      'bridges',
      'vehicles',
      'shipments',
      'incidents',
      'fieldReports',
      'floodZones',
      'landslideZones',
      'weather',
      'satelliteAI',
      'criticalInfrastructure',
      'warehouses',
      'hospitals',
      'emergencyCorridors',
      'elevation',
      'geofences',
      'routeVisualization',
    ];

    layerNames.forEach((id) => {
      layerGroupsRef.current[id] = L.layerGroup().addTo(map);
    });

    // ── Map Click Handler: Location & Mountain Elevation Intelligence ──
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Find closest road
      let nearest: Road | undefined;
      let minDistance = Infinity;
      roads.forEach((r) => {
        if (r.path.length > 0) {
          const d = Math.hypot(r.path[0].lat - lat, r.path[0].lng - lng);
          if (d < minDistance) {
            minDistance = d;
            nearest = r;
          }
        }
      });

      // Realistic Elevation & Mountain Sector calculation based on authentic geography
      const isHighAltitude = lat > 27.2;
      const isMountainSector = lat > 26.8 || (lat > 25.2 && lat < 25.8 && lng < 92.5); // Arunachal or Meghalaya plateau
      const isPlateau = lat > 25.2 && lat < 25.8 && lng < 92.5;

      const elevationMeters = isHighAltitude
        ? Math.round(2600 + (lat - 27.2) * 1800 + Math.sin(lng * 10) * 400)
        : isPlateau
        ? Math.round(1450 + Math.sin(lat * 8) * 450)
        : isMountainSector
        ? Math.round(800 + (lat - 26.8) * 1200)
        : Math.round(55 + Math.abs(Math.sin(lat * lng)) * 95);

      const slopePercent = isHighAltitude ? 16 : isMountainSector ? 14 : isPlateau ? 9 : 2;
      const terrainType = isHighAltitude
        ? 'High Alpine Mountain Pass'
        : isPlateau
        ? 'Highland Plateau Escarpment'
        : isMountainSector
        ? 'Rugged Mountainous Foothills'
        : 'Alluvial River Basin';

      const districtName = isHighAltitude
        ? 'West Kameng / Tawang'
        : isPlateau
        ? 'East Khasi Hills (Shillong)'
        : lat > 26.0
        ? 'Nagaon / Kaliabor'
        : 'Cachar / Silchar';

      const stateName = isHighAltitude || (lat > 27.0 && lng > 92.0)
        ? 'Arunachal Pradesh'
        : isPlateau
        ? 'Meghalaya'
        : lat < 24.5
        ? 'Mizoram'
        : 'Assam';

      const roadRisk = nearest ? (riskPredictions.get(nearest.id)?.currentRisk ?? 45) : isHighAltitude ? 78 : 38;

      const intel: LocationIntelligence = {
        lat,
        lng,
        district: districtName,
        state: stateName,
        nearestRoad: nearest,
        accessibilityScore: 100 - roadRisk,
        roadRisk,
        elevationIntel: {
          elevationMeters,
          slopePercent,
          terrainType: isHighAltitude ? 'Mountainous' : isPlateau ? 'Rugged Highlands' : isMountainSector ? 'Hilly Pass' : 'Alluvial Plain',
          classification: isHighAltitude ? 'HIGH_ALTITUDE_RIDGE' : isMountainSector ? 'MOUNTAIN_PASS' : isPlateau ? 'PLATEAU' : 'RIVER_BASIN',
          landslideSusceptibility: isHighAltitude || roadRisk > 70 ? 'CRITICAL' : roadRisk > 40 ? 'HIGH' : 'LOW',
          roadCondition: roadRisk > 75 ? 'REROUTE' : roadRisk > 45 ? 'OPEN WITH CAUTION' : 'CLEAR',
        },
        weather: {
          temperature: isHighAltitude ? 9 : isPlateau ? 18 : 26,
          condition: isHighAltitude ? 'Dense Mist & Freezing Rain' : isMountainSector ? 'Active Monsoon Downpour' : 'Intermittent Showers',
          rainfallRate: isHighAltitude ? 14 : 6.2,
          humidity: 88,
        },
        satelliteObservation: {
          satellite: 'Copernicus Sentinel-1',
          acquisitionTime: 'Today 11:42 UTC',
          detectionType: roadRisk > 70 ? 'Waterlogging Inundation' : 'Normal Surface Backscatter',
          confidence: 91,
          waterCoverageChange: '+18.4% upstream rise',
        },
        streetViewStatus: {
          available: false,
          lat,
          lng,
          statusMessage: 'No Google Street View imagery available at this location.',
          isRealData: true,
        },
        nearbyVehiclesCount: Math.max(1, Math.round(vehicles.length / 4)),
        affectedShipmentsCount: roadRisk > 60 ? 3 : 0,
        recentIncidentsCount: roadRisk > 70 ? 2 : 0,
        recentFieldImagesCount: imageIntelList.length,
      };

      setSelectedLocationIntel(intel);
      onSelectLocationIntel?.(intel);

      setStreetViewTarget({
        lat,
        lng,
        locationName: `${districtName} Sector (${elevationMeters}m)`,
        roadNumber: nearest?.number,
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invalidate Map Size on Split View Change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [isSplitView]);

  // ── Switch Map Mode / Base Tile Layer & Overlays ──
  useEffect(() => {
    if (!mapRef.current) return;

    if (mapMode === 'streetview') {
      setIsSplitView(true);
      return;
    }

    // Remove existing base tile
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    // Remove existing overlay tile layers (from hybrid)
    overlayTileLayersRef.current.forEach((layer) => {
      mapRef.current?.removeLayer(layer);
    });
    overlayTileLayersRef.current = [];

    const cfg = MAP_MODES_CONFIG[mapMode];
    if (cfg?.tileUrl) {
      const newTl = L.tileLayer(cfg.tileUrl, {
        maxZoom: cfg.maxZoom || 18,
        subdomains: cfg.subdomains || 'abc',
        attribution: cfg.attribution,
      }).addTo(mapRef.current);
      tileLayerRef.current = newTl;

      // Add hybrid overlay layers if configured
      if (cfg.overlayUrls) {
        cfg.overlayUrls.forEach((ov) => {
          if (mapRef.current) {
            const ovLayer = L.tileLayer(ov.url, {
              maxZoom: ov.maxZoom || 18,
              attribution: ov.attribution,
            }).addTo(mapRef.current);
            overlayTileLayersRef.current.push(ovLayer);
          }
        });
      }
    }

    try {
      localStorage.setItem('nerixa_map_mode', mapMode);
    } catch {}
  }, [mapMode]);

  // ── Render 1: Roads & Road Risk Layer ──
  useEffect(() => {
    const lg = layerGroupsRef.current.roads;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('roads') && !activeLayers.has('roadRisk')) return;

    roads.forEach((road) => {
      if (road.path.length < 2) return;
      const pred = riskPredictions.get(road.id);
      const risk = pred?.currentRisk ?? 35;

      // Emergency mode filter: only show critical / blocked roads
      if (emergencyMode && risk < 65 && road.status !== 'BLOCKED') {
        return;
      }

      const color = road.status === 'BLOCKED' ? '#dc2626' : getRiskColor(risk);
      const weight = road.roadType === 'NH' ? 4 : 3;
      const dashArray = road.status === 'BLOCKED' ? '10, 8' : road.status === 'PARTIALLY_BLOCKED' ? '8, 4' : undefined;

      const polyline = L.polyline(
        road.path.map((p) => [p.lat, p.lng] as L.LatLngTuple),
        { color, weight, opacity: 0.92, dashArray }
      );

      polyline.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedRoad(road);
        onSelectRoad?.(road);
        setStreetViewTarget({
          lat: road.path[0].lat,
          lng: road.path[0].lng,
          locationName: road.name,
          roadNumber: road.number,
        });
      });

      polyline.bindTooltip(
        `<div style="font-size:12px;font-family:Inter,sans-serif">
          <strong>${road.number}</strong> — ${road.name}<br/>
          Risk: <span style="color:${color};font-weight:700">${risk}/100</span> (${getRiskLevel(risk)})<br/>
          Status: ${road.status} | Length: ${road.length} km
        </div>`,
        { sticky: true }
      );

      polyline.addTo(lg);
    });
  }, [roads, riskPredictions, activeLayers, emergencyMode, onSelectRoad]);

  // ── Render 2: Vehicles Layer (Requirement 15) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.vehicles;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('vehicles')) return;

    vehicles.forEach((v) => {
      // Emergency mode filter: prioritize critical medical & food transports
      if (emergencyMode && v.commodity !== 'MEDICINE' && v.commodity !== 'FOOD' && v.type !== 'AMBULANCE' && v.risk < 70) {
        return;
      }

      const marker = L.marker([v.currentLocation.lat, v.currentLocation.lng], {
        icon: createVehicleIcon(v),
      });

      const freshness = calculateFreshness(v.lastPingTimestamp || v.lastUpdated);
      const isLive = freshness.category === 'LIVE';

      marker.bindPopup(
        `<div style="font-size:12px;font-family:Inter,sans-serif;min-width:240px;line-height:1.4">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
            <strong style="color:#38bdf8;font-size:13px">${v.id} (${v.vehicleNumber})</strong>
            <span style="font-size:10px;font-weight:700;font-family:monospace;padding:1px 6px;border-radius:4px;background:${
              isLive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
            };color:${isLive ? '#10b981' : '#f87171'}">${
              isLive ? 'LIVE GPS' : 'LAST KNOWN LOCATION'
            }</span>
          </div>
          <div style="font-size:10px;color:#94a3b8;margin-bottom:6px;font-family:monospace">
            ${freshness.text}
          </div>
          <div style="color:#cbd5e1;font-size:11px;margin-bottom:3px">Driver: <strong>${v.driverName}</strong> • ${v.type}</div>
          <div>Status: <span style="color:${VEHICLE_STATUS_COLORS[v.status]};font-weight:700">${v.status}</span></div>
          <div>Speed: <strong>${Math.round(v.speed)} km/h</strong> | Heading: <strong>${Math.round(v.heading || 0)}°</strong></div>
          <div>GPS Accuracy: <strong>±${v.accuracy || 6}m</strong> (Validated Hardware GPS)</div>
          ${v.commodity ? `<div>Cargo: ${COMMODITY_CONFIG[v.commodity]?.icon || '📦'} ${COMMODITY_CONFIG[v.commodity]?.label || v.commodity}</div>` : ''}
          ${v.destinationName ? `<div>Destination: <strong>${v.destinationName}</strong></div>` : ''}
          <div>Road Risk: <span style="color:${getRiskColor(v.risk)};font-weight:700">${v.risk}%</span> (${getRiskLevel(v.risk)})</div>
          <div style="margin-top:6px;padding:4px 6px;background:rgba(15,23,42,0.9);border-radius:4px;font-size:9px;color:#94a3b8;border:1px solid rgba(255,255,255,0.08)">
            Source: <strong>${v.isRealDevice ? 'Real Device GPS' : 'Telemetry Feed'}</strong> (Independent from Google Traffic)
          </div>
        </div>`
      );

      marker.on('click', () => {
        onSelectVehicle?.(v);
        setStreetViewTarget({
          lat: v.currentLocation.lat,
          lng: v.currentLocation.lng,
          locationName: `${v.vehicleNumber} (${v.destinationName || 'En route'})`,
        });
      });

      marker.addTo(lg);
    });
  }, [vehicles, activeLayers, emergencyMode, onSelectVehicle]);

  // ── Render: Google Real-Time Traffic Layer (Section 4) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.traffic;
    if (!lg) return;
    lg.clearLayers();
    if (!trafficLayerEnabled) return;

    // Render traffic conditions on corridors
    roads.forEach((road) => {
      if (road.path.length < 2) return;
      let trafficColor = '#22c55e'; // Normal green
      let trafficLabel = 'Free Flow';

      if (road.status === 'BLOCKED') {
        trafficColor = '#dc2626';
        trafficLabel = 'Blocked';
      } else if (road.trafficLevel === 'CONGESTED') {
        trafficColor = '#ef4444';
        trafficLabel = 'Heavy Traffic';
      } else if (road.trafficLevel === 'HEAVY') {
        trafficColor = '#f97316';
        trafficLabel = 'Moderate / Slow';
      }

      const trafficPoly = L.polyline(
        road.path.map((p) => [p.lat, p.lng] as L.LatLngTuple),
        { color: trafficColor, weight: 6, opacity: 0.75 }
      );

      trafficPoly.bindTooltip(
        `<div style="font-size:11px;font-family:Inter,sans-serif">
          <strong>Google Traffic Condition:</strong> ${trafficLabel}<br/>
          Corridor: ${road.number} (${road.name})<br/>
          <em style="font-size:10px;color:#94a3b8">Independent traffic feed (Separate from Vehicle GPS)</em>
        </div>`,
        { sticky: true }
      );

      trafficPoly.addTo(lg);
    });
  }, [roads, trafficLayerEnabled]);

  // ── Render: Traffic & Risk-Aware Reroute Polyline (Section 6 & 23) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.routeVisualization;
    if (!lg) return;
    lg.clearLayers();
    if (!activeReroute) return;

    // Route A (Direct High-Risk Corridor)
    const routeAPoly = L.polyline(
      activeReroute.originalRoute.polyline.map((p) => [p.lat, p.lng] as L.LatLngTuple),
      { color: '#ef4444', weight: 4, opacity: 0.85, dashArray: '8, 6' }
    );
    routeAPoly.bindTooltip(
      `<div style="font-size:11px;font-family:Inter,sans-serif">
        <strong style="color:#f87171">Route A: 210 km (5h 0m)</strong><br/>
        Traffic: Moderate | Risk: <span style="color:#ef4444;font-weight:bold">HIGH (84%)</span><br/>
        ⚠️ High Landslide Risk Area
      </div>`,
      { sticky: true }
    );
    routeAPoly.addTo(lg);

    // Route B (NERIXA Recommended Safe Detour Bypass)
    const routeBPoly = L.polyline(
      activeReroute.recommendedRoute.polyline.map((p) => [p.lat, p.lng] as L.LatLngTuple),
      { color: '#10b981', weight: 6, opacity: 0.95 }
    );
    routeBPoly.bindTooltip(
      `<div style="font-size:11px;font-family:Inter,sans-serif">
        <strong style="color:#34d399">Route B (NERIXA RECOMMENDED): 235 km (5h 25m)</strong><br/>
        Traffic: Light | Risk: <span style="color:#10b981;font-weight:bold">LOW (18%)</span><br/>
        🛡️ Recommended for critical medical cargo
      </div>`,
      { sticky: true }
    );
    routeBPoly.addTo(lg);
  }, [activeReroute]);

  // ── Render: Smooth Fly-To & Highlight Locate Target (Flood / Bridge / Accident / Highway) ──
  useEffect(() => {
    if (!locateTarget || !mapRef.current) return;
    const map = mapRef.current;
    map.flyTo([locateTarget.lat, locateTarget.lng], 13, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    const isFlood = locateTarget.category === 'FLOOD';
    const isBridge = locateTarget.category === 'BRIDGE';
    const highlightColor = isFlood ? '#38bdf8' : isBridge ? '#f97316' : '#ef4444';

    const highlight = L.circleMarker([locateTarget.lat, locateTarget.lng], {
      radius: 22,
      color: highlightColor,
      fillColor: highlightColor,
      fillOpacity: 0.45,
      weight: 3,
    }).addTo(map);

    L.popup({ offset: [0, -10] })
      .setLatLng([locateTarget.lat, locateTarget.lng])
      .setContent(`
        <div style="font-size:12px;font-family:Inter,sans-serif;min-width:250px;line-height:1.4">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <strong style="color:#f8fafc;font-size:13px">${locateTarget.title}</strong>
            <span style="background:rgba(239,68,68,0.25);color:#fca5a5;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800">LIVE TELEMETRY</span>
          </div>
          ${locateTarget.percentage !== undefined ? `
            <div style="margin:6px 0;background:rgba(0,0,0,0.3);padding:4px 8px;border-radius:4px;">
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
                <span style="color:#cbd5e1">Severity / Inundation:</span>
                <span style="font-weight:800;color:${highlightColor}">${locateTarget.percentage}%</span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
                <div style="width:${locateTarget.percentage}%;height:100%;background:${highlightColor}"></div>
              </div>
            </div>
          ` : ''}
          <div style="font-size:11px;color:#cbd5e1;line-height:1.4">${locateTarget.details || ''}</div>
        </div>
      `)
      .openOn(map);

    const timer = setTimeout(() => {
      if (map.hasLayer(highlight)) map.removeLayer(highlight);
    }, 12000);

    return () => {
      clearTimeout(timer);
      if (map.hasLayer(highlight)) map.removeLayer(highlight);
    };
  }, [locateTarget]);

  // ── Render 3: Shipments Layer (Requirement 8 - 📦 Shipment) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.shipments;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('shipments')) return;

    shipments.forEach((s) => {
      const isCritical = s.priority === 'CRITICAL';
      const marker = L.marker([s.destinationLocation.lat, s.destinationLocation.lng], {
        icon: createCustomMarker('shipment', isCritical ? '#ef4444' : '#f59e0b', 28),
      });

      marker.bindPopup(
        `<div style="font-size:12px;font-family:Inter,sans-serif;min-width:210px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong style="color:#f59e0b;font-size:13px">${s.commodityName}</strong>
            <span style="background:${isCritical ? '#dc2626' : '#d97706'};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">${s.priority}</span>
          </div>
          <div>Origin: <strong>${s.origin}</strong> ➔ <strong>${s.destination}</strong></div>
          <div>Criticality Index: <strong>${s.supplyCriticality}%</strong></div>
          <div>ETA: <strong>${new Date(s.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
        </div>`
      );

      marker.addTo(lg);
    });
  }, [shipments, activeLayers]);

  // ── Render 4: Incidents Layer (Requirement 8 - ⛰️ 🌊 🚧 🌉) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.incidents;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('incidents')) return;

    incidents.forEach((inc) => {
      const marker = L.marker([inc.location.lat, inc.location.lng], {
        icon: createIncidentMarkerIcon(inc.type, inc.severity),
      });

      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
        setStreetViewTarget({
          lat: inc.location.lat,
          lng: inc.location.lng,
          locationName: `${inc.type.replace(/_/g, ' ')} Incident Site`,
          roadNumber: inc.roadName,
        });
      });

      marker.bindPopup(
        `<div style="font-size:12px;font-family:Inter,sans-serif;min-width:240px">
          <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:8px;border:1px solid rgba(248,113,113,0.4)">
            <img src="${inc.type.includes('FLOOD') ? '/reality/sentinel1_sar_flood.jpg' : inc.type.includes('BRIDGE') ? '/reality/flood_drone_recon.jpg' : '/reality/landslide_aerial_reality.jpg'}" alt="Incident Aerial Recon" style="width:100%;height:85px;object-fit:cover;display:block;" />
            <div style="position:absolute;top:5px;left:5px;background:rgba(15,23,42,0.9);color:#f87171;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800">
              🛰️ INCIDENT SATELLITE RECON
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong style="color:#f87171;font-size:13px">${inc.type.replace(/_/g, ' ')}</strong>
            <span style="background:#dc2626;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">SEV ${inc.severity}/10</span>
          </div>
          <div style="margin-bottom:4px"><strong>Road:</strong> ${inc.roadName || '—'}</div>
          <div style="color:#cbd5e1;font-size:11px;line-height:1.4;margin-bottom:6px">${inc.description.slice(0, 110)}...</div>
          ${inc.aiAnalysis ? `
            <div style="background:rgba(59,130,246,0.1);border-left:2px solid #3b82f6;padding:4px 6px;font-size:11px;margin-bottom:6px">
              <strong>AI Analysis:</strong> ${inc.aiAnalysis.roadBlockage}% blockage • Clear ETA: ${inc.aiAnalysis.estimatedClearTime}
            </div>
          ` : ''}
          <button id="btn-inspect-reality-${inc.id}" style="width:100%;background:#2563eb;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:0.02em;margin-bottom:4px">
            INSPECT GROUND REALITY & UAV RECON
          </button>
          <button id="btn-sat-incident-${inc.id}" style="width:100%;background:linear-gradient(135deg, #7e22ce 0%, #9333ea 100%);color:#fff;border:none;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 8px rgba(147,51,234,0.3)">
            🛰️ VIEW REAL-TIME SATELLITE VIEW (SAR ANALYSIS)
          </button>
        </div>`
      );

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-reality-${inc.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectIncident) onSelectIncident(inc);
            if (onOpenRealityRecon) onOpenRealityRecon(inc.id === 'inc-1' ? 0 : inc.id === 'inc-2' ? 1 : 2);
          };
        }
        const satBtn = document.getElementById(`btn-sat-incident-${inc.id}`);
        if (satBtn && onOpenSatelliteForHazard) {
          satBtn.onclick = () => {
            onOpenSatelliteForHazard({
              id: inc.id,
              title: `${inc.type.replace(/_/g, ' ')} on ${inc.roadName}`,
              category: inc.type.includes('FLOOD') ? 'FLOOD' : inc.type.includes('BRIDGE') ? 'BRIDGE' : 'LANDSLIDE',
              locationName: inc.roadName,
              lat: inc.location.lat,
              lng: inc.location.lng,
              severity: inc.severity >= 8 ? 'CRITICAL' : 'HIGH',
              details: inc.description,
            });
          };
        }
      });

      marker.addTo(lg);
    });

    // Also render Live Highway Accidents
    INITIAL_ACCIDENTS.forEach((acc) => {
      const marker = L.marker([acc.location.lat, acc.location.lng], {
        icon: L.divIcon({
          html: `
            <div style="background:rgba(28,10,10,0.95);border:2px solid #ef4444;border-radius:10px;padding:2px 8px;display:flex;align-items:center;gap:4px;box-shadow:0 4px 14px rgba(239,68,68,0.6);cursor:pointer;white-space:nowrap;">
              <span style="font-size:12px">🚨</span>
              <span style="font-size:9px;font-weight:800;color:#fca5a5;font-family:var(--font-mono)">${acc.severity} ACCIDENT</span>
            </div>
          `,
          className: '',
          iconSize: [110, 22],
          iconAnchor: [55, 11],
        }),
      });

      marker.bindPopup(`
        <div style="font-size:12px;font-family:Inter,sans-serif;min-width:240px;line-height:1.4">
          <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:8px;border:1px solid rgba(239,68,68,0.4)">
            <img src="/reality/landslide_clearance.jpg" alt="Highway Incident Scene" style="width:100%;height:85px;object-fit:cover;display:block;" />
            <div style="position:absolute;top:5px;left:5px;background:rgba(28,10,10,0.9);color:#fca5a5;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800">
              🚨 CRISIS TELEMETRY
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong style="color:#ef4444;font-size:13px">${acc.title}</strong>
            <span style="background:rgba(239,68,68,0.25);color:#fca5a5;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:800">${acc.severity}</span>
          </div>
          <div style="font-size:11px;color:#cbd5e1;margin-bottom:4px">
            <div>Highway: <strong>${acc.highway}</strong> (${acc.locationName})</div>
            <div>Blockage: <strong style="color:#ef4444">${acc.lanesBlocked}</strong></div>
            <div>Clearance ETA: <strong>~${acc.clearanceEtaMinutes} mins</strong></div>
            <div>Casualties: <strong>${acc.casualties}</strong></div>
          </div>
          <div style="font-size:11px;color:#facc15;margin-bottom:6px"><strong>Detour:</strong> ${acc.alternateRoute}</div>
          <button id="btn-sat-acc-${acc.id}" style="width:100%;background:linear-gradient(135deg, #7e22ce 0%, #9333ea 100%);color:#fff;border:none;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 8px rgba(147,51,234,0.3)">
            🛰️ VIEW REAL-TIME SATELLITE PASS
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const satBtn = document.getElementById(`btn-sat-acc-${acc.id}`);
        if (satBtn && onOpenSatelliteForHazard) {
          satBtn.onclick = () => {
            onOpenSatelliteForHazard({
              id: acc.id,
              title: acc.title,
              category: 'ACCIDENT',
              locationName: `${acc.highway} (${acc.locationName})`,
              lat: acc.location.lat,
              lng: acc.location.lng,
              severity: acc.severity,
              details: `${acc.lanesBlocked}. Clearance: ~${acc.clearanceEtaMinutes}m. Alternate: ${acc.alternateRoute}`,
              divertedRoute: acc.alternateRoute,
              highway: acc.highway,
            });
          };
        }
      });

      marker.addTo(lg);
    });
  }, [incidents, activeLayers, onSelectIncident, onOpenRealityRecon]);

  // ── Render 5: Field Reports (Requirement 7 & 8 - 📷 Field Image) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.fieldReports;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('fieldReports')) return;

    imageIntelList.forEach((intel) => {
      const marker = L.marker([intel.lat, intel.lng], {
        icon: createCustomMarker('field', '#38bdf8', 30),
      });

      marker.bindPopup(
        `<div style="font-size:12px;font-family:Inter,sans-serif;min-width:240px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong style="color:#38bdf8;font-size:13px">FIELD EVIDENCE PHOTO</strong>
            <span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">VERIFIED</span>
          </div>
          <div style="font-size:11px;color:#cbd5e1;margin-bottom:6px">
            <div><strong>Incident:</strong> ${intel.aiDetection.incidentType.replace(/_/g, ' ')}</div>
            <div><strong>Location:</strong> ${intel.roadNumber} (${intel.districtName})</div>
            <div><strong>Reported:</strong> 12 minutes ago</div>
            <div><strong>Severity:</strong> <span style="color:#ef4444;font-weight:700">${intel.aiDetection.severity}</span></div>
            <div><strong>AI Confidence:</strong> 91%</div>
            <div><strong>Road Risk:</strong> <span style="color:#ef4444;font-weight:700">${intel.riskUpdate.newRisk}/100</span></div>
          </div>
          <div style="margin:4px 0;border-radius:6px;overflow:hidden">
            <img src="${intel.imageUrl}" style="width:100%;height:105px;object-fit:cover;display:block;" alt="Field photo" />
          </div>
          <button id="btn-field-img-${intel.id}" style="width:100%;background:#0284c7;color:#fff;border:none;padding:6px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer">
            Open Field Evidence Hub
          </button>
        </div>`
      );

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-field-img-${intel.id}`);
        if (btn && onOpenImageIntel) {
          btn.onclick = onOpenImageIntel;
        }
      });

      marker.on('click', () => {
        setStreetViewTarget({
          lat: intel.lat,
          lng: intel.lng,
          locationName: `${intel.roadNumber} Field Report Site`,
          roadNumber: intel.roadNumber,
        });
      });

      marker.addTo(lg);
    });
  }, [imageIntelList, activeLayers, onOpenImageIntel]);

  // ── Render 6: Flood Zones & Landslide Zones Polygons (Requirement 16) ──
  useEffect(() => {
    const lgFlood = layerGroupsRef.current.floodZones;
    const lgLandslide = layerGroupsRef.current.landslideZones;
    if (lgFlood) lgFlood.clearLayers();
    if (lgLandslide) lgLandslide.clearLayers();

    DISASTER_POLYGONS.forEach((dp) => {
      const isFlood = dp.type === 'FLOOD';
      const targetGroup = isFlood ? lgFlood : lgLandslide;
      const isLayerActive = isFlood ? activeLayers.has('floodZones') : activeLayers.has('landslideZones');

      if (!targetGroup || !isLayerActive) return;

      const polygon = L.polygon(dp.coords, {
        color: dp.color,
        fillColor: dp.fillColor,
        fillOpacity: 0.32,
        weight: 2.5,
        dashArray: '6, 6',
      });

      polygon.bindTooltip(
        `<div style="font-size:12px;font-family:Inter,sans-serif;font-weight:600;color:#f8fafc">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dp.color};margin-right:6px"></span><strong>${dp.name}</strong><br/>
          <span style="color:${dp.color};font-weight:700">${dp.risk}</span><br/>
          <span style="color:#c084fc;font-size:10px;font-weight:800">Click to View Real-Time Satellite SAR Pass 🛰️</span>
        </div>`,
        { sticky: true }
      );

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (onOpenSatelliteForHazard) {
          onOpenSatelliteForHazard({
            id: dp.id,
            title: dp.name,
            category: dp.type === 'FLOOD' ? 'FLOOD' : dp.type === 'BRIDGE_SCOUR' ? 'BRIDGE' : 'LANDSLIDE',
            locationName: dp.name,
            lat: dp.coords[0][0],
            lng: dp.coords[0][1],
            severity: 'CRITICAL',
            details: dp.risk,
          });
        } else {
          setStreetViewTarget({
            lat: dp.coords[0][0],
            lng: dp.coords[0][1],
            locationName: dp.name,
          });
        }
      });

      polygon.addTo(targetGroup);
    });

    // Also render Live Flood Gauge Stations with Inundation Percentage
    if (lgFlood && activeLayers.has('floodZones')) {
      INITIAL_FLOOD_ZONES.forEach((fz) => {
        const marker = L.marker([fz.location.lat, fz.location.lng], {
          icon: L.divIcon({
            html: `
              <div style="background:rgba(8,18,36,0.95);border:2px solid #38bdf8;border-radius:12px;padding:2px 8px;display:flex;align-items:center;gap:4px;box-shadow:0 4px 14px rgba(56,189,248,0.5);cursor:pointer;white-space:nowrap;">
                <span style="font-size:12px">🌊</span>
                <span style="font-size:10px;font-weight:800;color:#38bdf8;font-family:var(--font-mono)">FLOOD ${fz.floodPercentage}%</span>
              </div>
            `,
            className: '',
            iconSize: [92, 22],
            iconAnchor: [46, 11],
          }),
        });

        marker.bindPopup(`
          <div style="font-size:12px;font-family:Inter,sans-serif;min-width:250px;line-height:1.4">
            <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:8px;border:1px solid rgba(56,189,248,0.4);box-shadow:0 3px 10px rgba(0,0,0,0.5)">
              <img src="/reality/sentinel1_sar_flood.jpg" alt="Copernicus Sentinel-1 SAR Flood Inundation" style="width:100%;height:95px;object-fit:cover;display:block;" />
              <div style="position:absolute;top:5px;left:5px;background:rgba(8,18,36,0.9);color:#38bdf8;padding:2px 7px;border-radius:4px;font-size:9px;font-weight:800;letter-spacing:0.03em;border:1px solid rgba(56,189,248,0.3)">
                🛰️ COPERNICUS SAR (LIVE PASS)
              </div>
              <div style="position:absolute;bottom:5px;right:5px;background:rgba(239,68,68,0.9);color:#ffffff;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800">
                WATER: +${fz.waterLevelMeters}m
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <strong style="color:#38bdf8;font-size:13px">${fz.name}</strong>
              <span style="background:rgba(56,189,248,0.2);color:#38bdf8;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">${fz.floodPercentage}%</span>
            </div>
            <div style="font-size:11px;color:#cbd5e1;margin-bottom:6px">
              <div>Highway: <strong>${fz.highway}</strong></div>
              <div>Water Level: <strong>${fz.currentLevelMeters}m (${fz.waterLevelMeters > 0 ? '+' : ''}${fz.waterLevelMeters}m vs Danger)</strong></div>
              <div>Precipitation: <strong>${fz.rainfallRateMmPerHour} mm/hr</strong> • Trend: <strong>${fz.trend}</strong></div>
              <div>Submerged Stretch: <strong>${fz.affectedRoadLengthKm} km</strong></div>
              <div style="margin-top:4px;color:#fb923c;margin-bottom:6px"><strong>Diversion:</strong> ${fz.divertedRoute}</div>
            </div>
            <button id="btn-sat-flood-${fz.id}" style="width:100%;background:linear-gradient(135deg, #7e22ce 0%, #9333ea 100%);color:#fff;border:none;padding:8px 10px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 10px rgba(147,51,234,0.4)">
              🛰️ VIEW REAL-TIME SATELLITE VIEW (SAR ANALYSIS)
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-sat-flood-${fz.id}`);
          if (btn && onOpenSatelliteForHazard) {
            btn.onclick = () => {
              onOpenSatelliteForHazard({
                id: fz.id,
                title: fz.name,
                category: 'FLOOD',
                locationName: `${fz.highway} Flood Embankment`,
                lat: fz.location.lat,
                lng: fz.location.lng,
                severity: fz.floodPercentage >= 80 ? 'CRITICAL' : 'HIGH',
                percentage: fz.floodPercentage,
                divertedRoute: fz.divertedRoute,
                waterLevelMeters: fz.waterLevelMeters,
                affectedRoadLengthKm: fz.affectedRoadLengthKm,
                highway: fz.highway,
              });
            };
          }
        });

        marker.addTo(lgFlood);
      });
    }
  }, [activeLayers]);

  // ── Render 7: Live Weather Layer (Requirement 3 - Weather) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.weather;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('weather') || !liveWeatherReports) return;

    liveWeatherReports.forEach((r) => {
      const marker = L.marker([r.lat, r.lng], {
        icon: createWeatherIcon(r),
      });

      marker.bindPopup(
        `<div style="font-size:12px;font-family:Inter,sans-serif;min-width:200px">
          <div style="font-weight:700;display:flex;justify-content:space-between">
            <span style="color:#f8fafc">${r.districtName}</span>
            <span style="color:#38bdf8">${r.temperature}°C</span>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${r.state} • ${r.condition}</div>
          <div style="font-size:11px">Rain: <strong>${r.rainfallRate} mm/h</strong> | Hazard: <strong>${r.landslideHazardScore}%</strong></div>
        </div>`
      );

      marker.addTo(lg);
    });
  }, [liveWeatherReports, activeLayers]);

  // ── Render 8: Satellite AI (Requirement 6 - Copernicus Sentinel-1 / 2) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.satelliteAI;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('satelliteAI')) return;

    satelliteObservations.forEach((obs) => {
      const satIcon = createCustomMarker('satellite', '#a855f7', 30);
      const marker = L.marker([obs.lat, obs.lng], { icon: satIcon });

      marker.bindPopup(
        `<div style="font-size:12px;font-family:Inter,sans-serif;min-width:250px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong style="color:#c084fc;font-size:13px">${obs.satellite} (${obs.sensor})</strong>
            <span style="background:rgba(167,139,250,0.2);color:#c084fc;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">SAR RADAR</span>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px">Location: ${obs.districtName} (${obs.stateName})</div>
          <div style="margin:4px 0;border-radius:6px;overflow:hidden">
            <img src="${obs.imageUrl}" style="width:100%;height:110px;object-fit:cover;display:block;" alt="Satellite SAR pass" />
          </div>
          <div style="background:rgba(15,23,42,0.8);padding:6px;border-radius:6px;font-size:11px">
            <div>Hazard: <strong>${obs.detection?.detectionType.replace(/_/g, ' ') || 'Flood Monitoring'}</strong></div>
            <div>Area Impacted: <strong>${obs.detection?.areaKm2 || 4.2} km²</strong></div>
          </div>
        </div>`
      );

      marker.addTo(lg);
    });
  }, [satelliteObservations, activeLayers]);

  // ── Render 9: Hospitals & Warehouses (Requirement 8) ──
  useEffect(() => {
    const lgHosp = layerGroupsRef.current.hospitals;
    const lgWare = layerGroupsRef.current.warehouses;
    if (lgHosp) lgHosp.clearLayers();
    if (lgWare) lgWare.clearLayers();

    if (activeLayers.has('hospitals') && lgHosp) {
      hospitals.forEach((h) => {
        const marker = L.marker([h.location.lat, h.location.lng], {
          icon: createCustomMarker('hospital', '#ef4444', 28),
        });
        marker.bindPopup(
          `<div style="font-size:12px;font-family:Inter,sans-serif">
            <strong>${h.name}</strong><br/>
            Beds: ${h.beds} | Trauma: ${h.emergencyCapacity ? 'YES' : 'LIMITED'}
          </div>`
        );
        marker.addTo(lgHosp);
      });
    }

    if (activeLayers.has('warehouses') && lgWare) {
      warehouses.forEach((w) => {
        const marker = L.marker([w.location.lat, w.location.lng], {
          icon: createCustomMarker('warehouse', '#f59e0b', 28),
        });
        marker.bindPopup(
          `<div style="font-size:12px;font-family:Inter,sans-serif">
            <strong>${w.name}</strong><br/>
            Capacity: ${w.capacity.toLocaleString()} MT | Stock: ${w.currentStock.toLocaleString()} MT
          </div>`
        );
        marker.addTo(lgWare);
      });
    }
  }, [hospitals, warehouses, activeLayers]);

  // ── Render 10: Critical Infrastructure & Emergency Corridors ──
  useEffect(() => {
    const lgInfra = layerGroupsRef.current.criticalInfrastructure;
    const lgCorridors = layerGroupsRef.current.emergencyCorridors;
    if (lgInfra) lgInfra.clearLayers();
    if (lgCorridors) lgCorridors.clearLayers();

    if (activeLayers.has('criticalInfrastructure') && lgInfra) {
      CRITICAL_INFRASTRUCTURE.forEach((infra) => {
        const marker = L.marker([infra.lat, infra.lng], {
          icon: createCustomMarker('infra', '#0284c7', 26),
        });
        marker.bindTooltip(
          `<div style="font-size:11px"><strong>${infra.name}</strong> (${infra.status})</div>`,
          { sticky: true }
        );
        marker.addTo(lgInfra);
      });
    }

    if (activeLayers.has('emergencyCorridors') && lgCorridors) {
      EMERGENCY_CORRIDORS.forEach((corridor) => {
        const polyline = L.polyline(corridor.path, {
          color: corridor.color,
          weight: 5,
          opacity: 0.85,
        });
        polyline.bindTooltip(
          `<div style="font-size:12px;font-family:Inter,sans-serif;font-weight:700;color:#ef4444"><strong>${corridor.name}</strong></div>`,
          { sticky: true }
        );
        polyline.addTo(lgCorridors);
      });
    }
  }, [activeLayers]);

  // ── Render 11: Bridges Layer (Requirement 8 & 9) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.bridges;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('bridges')) return;

    const bridgesList = (bridges && bridges.length > 0) ? bridges : [
      { id: 'br-1', name: 'Bogibeel Rail-Road Bridge', roadId: 'r-15', location: { lat: 27.40, lng: 94.90 }, condition: 'GOOD', length: 4940, capacity: 70, riverName: 'Brahmaputra River', builtYear: 2018, lastInspection: '2026-08-12', risk: 18 },
      { id: 'br-2', name: 'Bhupen Hazarika Setu (Dhola-Sadiya)', roadId: 'r-115', location: { lat: 27.79, lng: 95.66 }, condition: 'GOOD', length: 9150, capacity: 60, riverName: 'Lohit River', builtYear: 2017, lastInspection: '2026-08-20', risk: 24 },
      { id: 'br-3', name: 'New Saraighat Bridge', roadId: 'r-27', location: { lat: 26.13, lng: 91.69 }, condition: 'FAIR', length: 1493, capacity: 55, riverName: 'Brahmaputra River', builtYear: 2017, lastInspection: '2026-07-30', risk: 38 },
      { id: 'br-4', name: 'Kolia Bhomora Setu', roadId: 'r-715', location: { lat: 26.61, lng: 92.85 }, condition: 'FAIR', length: 3015, capacity: 50, riverName: 'Brahmaputra River', builtYear: 1987, lastInspection: '2026-08-05', risk: 42 },
      { id: 'br-5', name: 'Jiri River Foundation Bridge', roadId: 'r-37', location: { lat: 24.58, lng: 93.30 }, condition: 'POOR', length: 280, capacity: 35, riverName: 'Jiri River', builtYear: 1994, lastInspection: '2026-09-02', risk: 78 },
    ];

    bridgesList.forEach((b: any) => {
      const isCritical = b.risk > 65 || b.condition === 'POOR' || b.condition === 'CRITICAL';
      const color = isCritical ? '#ef4444' : b.risk > 35 ? '#f59e0b' : '#38bdf8';
      const marker = L.marker([b.location.lat, b.location.lng], {
        icon: L.divIcon({
          html: `<div style="background:#0b1329;border:2px solid ${color};border-radius:6px;padding:2px 6px;display:flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(0,0,0,0.7);cursor:pointer;">
            <span style="font-size:12px;">🌉</span>
            <span style="font-size:9px;font-weight:700;color:#f8fafc;font-family:var(--font-mono)">${b.name.split(' ')[0]}</span>
          </div>`,
          className: '',
          iconSize: [64, 22],
          iconAnchor: [32, 11],
        }),
      });

      marker.bindPopup(`
        <div style="font-size:12px;font-family:Inter,sans-serif;min-width:240px;line-height:1.4">
          <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:8px;border:1px solid rgba(59,130,246,0.4)">
            <img src="/reality/flood_drone_recon.jpg" alt="River Crossing Structural Satellite Recon" style="width:100%;height:85px;object-fit:cover;display:block;" />
            <div style="position:absolute;top:5px;left:5px;background:rgba(15,23,42,0.9);color:#93c5fd;padding:2px 7px;border-radius:4px;font-size:9px;font-weight:800">
              🛰️ RADAR MONITORING
            </div>
          </div>
          <strong style="color:${color};font-size:13px">${b.name}</strong>
          <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">
            <div>River: <strong>${b.riverName}</strong></div>
            <div>Length: <strong>${b.length} m</strong> • Capacity: <strong>${b.capacity} MT</strong></div>
            <div>Condition: <span style="font-weight:700;color:${color}">${b.condition}</span></div>
            <div>Pier Scour Risk: <strong style="color:${color}">${b.risk}/100</strong></div>
          </div>
          <button id="btn-sat-br-${b.id}" style="width:100%;margin-top:6px;background:linear-gradient(135deg, #7e22ce 0%, #9333ea 100%);color:#fff;border:none;padding:7px 10px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 8px rgba(147,51,234,0.3)">
            🛰️ VIEW REAL-TIME SATELLITE RADAR VIEW
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-sat-br-${b.id}`);
        if (btn && onOpenSatelliteForHazard) {
          btn.onclick = () => {
            onOpenSatelliteForHazard({
              id: b.id,
              title: b.name,
              category: 'BRIDGE',
              locationName: `${b.riverName || 'River'} Bridge Corridor`,
              lat: b.location.lat,
              lng: b.location.lng,
              severity: isCritical ? 'CRITICAL' : 'HIGH',
              percentage: b.risk,
              river: b.riverName,
            });
          };
        }
      });

      marker.addTo(lg);
    });

    // Also render Live Monitored Bridges
    INITIAL_BRIDGES.forEach((b) => {
      const isCollapsed = b.condition === 'COLLAPSED';
      const isScour = b.condition === 'SCOUR_CRITICAL';
      const color = isCollapsed ? '#ef4444' : isScour ? '#f97316' : '#22c55e';
      const marker = L.marker([b.location.lat, b.location.lng], {
        icon: L.divIcon({
          html: `
            <div style="background:rgba(11,19,41,0.95);border:2px solid ${color};border-radius:8px;padding:2px 6px;display:flex;align-items:center;gap:4px;box-shadow:0 3px 10px rgba(0,0,0,0.8);cursor:pointer;white-space:nowrap;">
              <span style="font-size:12px">🌉</span>
              <span style="font-size:9px;font-weight:800;color:${color};font-family:var(--font-mono)">${b.name.split(' ')[0]} ${isCollapsed ? '💥 CLOSED' : ''}</span>
            </div>
          `,
          className: '',
          iconSize: [85, 22],
          iconAnchor: [42, 11],
        }),
      });

      marker.bindPopup(`
        <div style="font-size:12px;font-family:Inter,sans-serif;min-width:250px;line-height:1.4">
          <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:8px;border:1px solid rgba(239,68,68,0.4);box-shadow:0 3px 10px rgba(0,0,0,0.5)">
            <img src="/reality/flood_drone_recon.jpg" alt="Aerial Drone & Satellite Structural Recon" style="width:100%;height:95px;object-fit:cover;display:block;" />
            <div style="position:absolute;top:5px;left:5px;background:rgba(15,23,42,0.9);color:#fca5a5;padding:2px 7px;border-radius:4px;font-size:9px;font-weight:800;letter-spacing:0.03em;border:1px solid rgba(239,68,68,0.3)">
              🛰️ SATELLITE & UAV RECON
            </div>
            <div style="position:absolute;bottom:5px;right:5px;background:${isCollapsed ? 'rgba(239,68,68,0.95)' : 'rgba(249,115,22,0.95)'};color:#ffffff;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:800">
              ${isCollapsed ? '💥 COLLAPSED' : `${b.healthPercentage}% INTEGRITY`}
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong style="color:${color};font-size:13px">${b.name}</strong>
            <span style="background:${color}25;color:${color};padding:1px 6px;border-radius:4px;font-size:10px;font-weight:800">${b.condition}</span>
          </div>
          <div style="font-size:11px;color:#cbd5e1;margin-bottom:4px">
            <div>River: <strong>${b.river}</strong> • Highway: <strong>${b.highway}</strong></div>
            <div>Structural Integrity: <strong>${b.healthPercentage}%</strong></div>
            <div>Pier Status: <strong>${b.pierStatus}</strong></div>
            <div>Load Limit: <strong>${b.loadCapacityTons > 0 ? `${b.loadCapacityTons} Tons` : '0 Tons (CLOSED)'}</strong></div>
          </div>
          <div style="font-size:11px;color:#fca5a5;margin-bottom:6px"><strong>Diversion:</strong> ${b.diversion}</div>
          <button id="btn-sat-bridge-${b.id}" style="width:100%;background:linear-gradient(135deg, #7e22ce 0%, #9333ea 100%);color:#fff;border:none;padding:8px 10px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 10px rgba(147,51,234,0.4)">
            🛰️ VIEW REAL-TIME SATELLITE VIEW (SAR ANALYSIS)
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-sat-bridge-${b.id}`);
        if (btn && onOpenSatelliteForHazard) {
          btn.onclick = () => {
            onOpenSatelliteForHazard({
              id: b.id,
              title: b.name,
              category: 'BRIDGE',
              locationName: `${b.river} (${b.state})`,
              state: b.state,
              lat: b.location.lat,
              lng: b.location.lng,
              severity: isCollapsed ? 'CRITICAL' : isScour ? 'HIGH' : 'MODERATE',
              percentage: b.healthPercentage,
              details: `Condition: ${b.condition}. ${b.description}`,
              divertedRoute: b.diversion,
              river: b.river,
              highway: b.highway,
            });
          };
        }
      });

      marker.addTo(lg);
    });
  }, [bridges, activeLayers]);

  // ── Render 12: Elevation & Mountain Passes Layer (Requirement 5, 6, 7) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.elevation;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('elevation')) return;

    MOUNTAIN_PASSES.forEach((mp) => {
      const isHighRisk = mp.elevation > 2500 || mp.status.includes('BLOCKED') || mp.status.includes('HIGH');
      const color = isHighRisk ? '#f59e0b' : '#38bdf8';

      const marker = L.marker(mp.coords, {
        icon: L.divIcon({
          html: `
            <div style="background:rgba(8,14,28,0.92);border:1.5px solid ${color};border-radius:14px;padding:2px 8px;display:flex;align-items:center;gap:4px;box-shadow:0 4px 14px rgba(0,0,0,0.7);cursor:pointer;backdrop-filter:blur(8px);">
              <span style="font-size:11px">⛰️</span>
              <span style="font-size:10px;font-weight:700;color:#f8fafc;font-family:var(--font-mono)">${mp.elevation}m</span>
            </div>
          `,
          className: '',
          iconSize: [68, 22],
          iconAnchor: [34, 11],
        }),
      });

      marker.bindPopup(`
        <div style="font-size:12px;font-family:Inter,sans-serif;min-width:240px;line-height:1.4">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong style="color:#f59e0b;font-size:13px">${mp.name}</strong>
            <span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">${mp.elevation} m</span>
          </div>
          <div style="font-size:11px;color:#cbd5e1;margin-bottom:6px">
            <div>State: <strong>${mp.state}</strong></div>
            <div>Slope: <strong>${mp.slope}</strong> • Terrain: <strong>${mp.terrain}</strong></div>
            <div>Landslide Hazard: <strong style="color:#ef4444">${mp.landslideRisk}</strong></div>
            <div>Weather: <em>${mp.weather}</em></div>
            <div style="margin-top:4px;padding:3px 6px;background:rgba(255,255,255,0.05);border-radius:4px;font-weight:700;color:${isHighRisk ? '#fbbf24' : '#34d399'}">
              Status: ${mp.status}
            </div>
          </div>
        </div>
      `);

      marker.addTo(lg);
    });
  }, [activeLayers]);

  // ── Render 13: 8 NER State Geofences Layer (Requirement 9) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.geofences;
    if (!lg) return;
    lg.clearLayers();
    if (!activeLayers.has('geofences')) return;

    NER_STATE_GEOFENCES.forEach((st) => {
      const rect = L.rectangle(st.bounds as L.LatLngBoundsExpression, {
        color: st.color,
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: st.color,
        fillOpacity: 0.04,
      });

      rect.bindTooltip(
        `<div style="font-size:11px;font-family:Inter,sans-serif;font-weight:700;color:${st.color}">
          🏛️ State Jurisdiction: ${st.name} (Capital: ${st.capital})
        </div>`,
        { sticky: true }
      );

      rect.addTo(lg);

      const labelMarker = L.marker(st.center, {
        icon: L.divIcon({
          html: `<div style="background:rgba(8,12,22,0.85);border:1px solid ${st.color}55;color:${st.color};font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;letter-spacing:0.05em;white-space:nowrap;pointer-events:none;box-shadow:0 2px 6px rgba(0,0,0,0.5)">
            ${st.name.toUpperCase()}
          </div>`,
          className: '',
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        }),
      });
      labelMarker.addTo(lg);
    });
  }, [activeLayers]);

  // ── Render 14: Route Visualization (Requirement 18 - Current vs Recommended Route) ──
  useEffect(() => {
    const lg = layerGroupsRef.current.routeVisualization;
    if (!lg) return;
    lg.clearLayers();

    // Default corridor route comparison: NH-15 (High Risk Current) vs NH-27 Bypass (Recommended)
    const currentRouteCoords: L.LatLngTuple[] = [
      [26.63, 92.79], // Tezpur
      [27.05, 92.65],
      [27.26, 92.42], // Bomdila Pass
      [27.58, 91.86], // Tawang
    ];

    const recommendedRouteCoords: L.LatLngTuple[] = [
      [26.63, 92.79], // Tezpur
      [26.85, 92.20], // Bhalukpong Loop
      [27.15, 92.12], // Valley Ridge Road
      [27.58, 91.86], // Tawang
    ];

    // Current Route (Red dashed)
    const currentPoly = L.polyline(currentRouteCoords, {
      color: '#ef4444',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85,
    });
    currentPoly.bindTooltip(
      `<div style="font-size:12px;font-family:Inter,sans-serif">
        <strong style="color:#ef4444">CURRENT ROUTE (NH-15 Axis)</strong><br/>
        Distance: 184 km • ETA: +3h 40m • Risk: 84/100 (HIGH RISK)
      </div>`,
      { sticky: true }
    );
    currentPoly.on('click', () => setShowWhyThisRoute(true));
    currentPoly.addTo(lg);

    // Recommended Route (Emerald green solid)
    const recommendedPoly = L.polyline(recommendedRouteCoords, {
      color: '#10b981',
      weight: 5,
      opacity: 0.95,
    });
    recommendedPoly.bindTooltip(
      `<div style="font-size:12px;font-family:Inter,sans-serif">
        <strong style="color:#34d399">RECOMMENDED ROUTE (Bhalukpong Bypass)</strong><br/>
        Distance: 198 km • ETA: On Time • Risk: 22/100 • Reliability: 94%
      </div>`,
      { sticky: true }
    );
    recommendedPoly.on('click', () => setShowWhyThisRoute(true));
    recommendedPoly.addTo(lg);
  }, []);

  // ── Search Selection Handler (Requirement 17 & 31) ──
  const handleSelectSearchResult = (item: SearchResultItem) => {
    if (mapRef.current) {
      mapRef.current.setView([item.lat, item.lng], item.zoom);
    }
    setStreetViewTarget({
      lat: item.lat,
      lng: item.lng,
      locationName: item.title,
    });

    if (item.category === 'VEHICLE') {
      const v = vehicles.find((veh) => veh.id === item.id || veh.vehicleNumber === item.title.split(' ')[0]);
      if (v) onSelectVehicle?.(v);
    } else if (item.category === 'INCIDENT') {
      const inc = incidents.find((i) => i.id === item.id || i.type === item.title);
      if (inc) onSelectIncident?.(inc);
    } else if (item.category === 'ROAD') {
      const r = roads.find((rd) => rd.id === item.id || rd.number === item.title.split(' ')[0]);
      if (r) {
        setSelectedRoad(r);
        onSelectRoad?.(r);
      }
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: fullscreen ? undefined : '620px',
        display: 'flex',
        overflow: 'hidden',
        background: '#040711',
      }}
    >
      {/* ── Emergency Mode Top Banner ── */}
      {emergencyMode && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1050,
            background: 'linear-gradient(90deg, #991b1b, #b91c1c, #991b1b)',
            color: '#fff',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(185, 28, 28, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EmergencyShieldIcon size={16} color="#fff" />
            <span>EMERGENCY MODE ACTIVE — FILTERED TO LIFELINE CORRIDORS, DISASTER ZONES & CRITICAL MEDICAL CONVOYS</span>
          </div>
          <button
            onClick={() => setEmergencyMode(false)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            Exit Emergency Mode
          </button>
        </div>
      )}

      {/* ── LEFT PANE: INTERACTIVE MAP VIEWPORT ── */}
      <div
        style={{
          position: 'relative',
          flex: isSplitView ? '1 1 55%' : '1 1 100%',
          height: '100%',
          transition: 'flex 0.25s ease',
        }}
      >
        {/* Leaflet / GIS Map Canvas */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* ── Top-Left: Google Maps Search Box (Requirement 17 & 31) ── */}
        <MapSearchBox
          onSelectLocation={handleSelectSearchResult}
          vehicles={vehicles}
          incidents={incidents}
        />

        {/* ── Top-Right: Map Mode Switcher & Operational Controls ── */}
        <div className={`map-top-controls-container ${emergencyMode ? 'emergency-active' : ''}`}>
          {/* Compass Rose Button */}
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([NER_CENTER.lat, NER_CENTER.lng], NER_DEFAULT_ZOOM, { animate: true });
              }
            }}
            style={{
              padding: '5px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'rgba(8, 12, 22, 0.92)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            }}
            title="Interactive Compass Rose • Reset Orientation & Center to North Eastern Region"
          >
            <span style={{ fontSize: '12px' }}>🧭</span>
            <span>NORTH</span>
          </button>

          {/* Map Modes */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(8, 12, 22, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '3px',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(20px)',
              overflowX: 'auto',
              maxWidth: 'calc(100vw - 110px)',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {(Object.keys(MAP_MODES_CONFIG) as MapMode[]).map((mode) => {
              const isActive = mapMode === mode;
              const Icon =
                mode === 'roadmap'
                  ? RoadmapIcon
                  : mode === 'satellite'
                  ? SatelliteImageryIcon
                  : mode === 'hybrid'
                  ? HybridIcon
                  : mode === 'terrain'
                  ? TerrainIcon
                  : StreetViewIcon;

              return (
                <button
                  key={mode}
                  onClick={() => {
                    setMapMode(mode);
                    if (mode === 'streetview') setIsSplitView(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 9px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid ' + (isActive ? 'rgba(56, 189, 248, 0.35)' : 'transparent'),
                    cursor: 'pointer',
                    background: isActive ? 'rgba(2, 132, 199, 0.22)' : 'transparent',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={13} color={isActive ? '#38bdf8' : '#94a3b8'} />
                  <span>{MAP_MODES_CONFIG[mode].label}</span>
                </button>
              );
            })}
          </div>

          {/* 17 Operational Layers Popover Button (Requirement 9) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLayerMenuOpen(!layerMenuOpen)}
              style={{
                padding: '5px 11px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.03em',
                background: layerMenuOpen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(8, 12, 22, 0.92)',
                border: `1px solid ${layerMenuOpen ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.12)'}`,
                color: layerMenuOpen ? '#38bdf8' : '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(16px)',
              }}
              title="Toggle 17 Operational GIS Layers"
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>LAYERS</span>
              <span style={{
                background: 'rgba(56,189,248,0.2)',
                color: '#38bdf8',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 800,
              }}>{activeLayers.size}/17</span>
            </button>

            {/* Layer Control Dropdown Panel */}
            {layerMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '310px',
                  maxHeight: '460px',
                  overflowY: 'auto',
                  background: 'rgba(10, 16, 30, 0.96)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '10px',
                  padding: '12px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 1100,
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '12px', letterSpacing: '0.04em' }}>
                    GIS LAYER CONTROL
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setAllLayers(true)}
                      style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '10px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      All
                    </button>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                    <button
                      onClick={() => setAllLayers(false)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '10px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      None
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { id: 'vehicles', label: 'Live Vehicles (GPS)', icon: '🚚', badge: vehicles.length },
                    { id: 'traffic', label: 'Real-Time Traffic Flow', icon: '🚦', active: trafficLayerEnabled, onToggle: () => setTrafficLayerEnabled(!trafficLayerEnabled) },
                    { id: 'roads', label: 'Roads & Highways', icon: '🛣️', badge: roads.length },
                    { id: 'roadRisk', label: 'Road Risk Classification', icon: '⚠️' },
                    { id: 'incidents', label: 'Incidents (Landslides/Floods)', icon: '🚨', badge: incidents.length },
                    { id: 'floodZones', label: 'Flood Inundation Perimeters', icon: '🌊' },
                    { id: 'landslideZones', label: 'Landslide Susceptibility Zones', icon: '🏔️' },
                    { id: 'weather', label: 'Live Rain & Weather Radar', icon: '🌧️', badge: liveWeatherReports.length },
                    { id: 'satelliteAI', label: 'Copernicus Sentinel-1/2 AI', icon: '🛰️', badge: satelliteObservations.length },
                    { id: 'fieldReports', label: 'Field Evidence Photographs', icon: '📷', badge: imageIntelList.length },
                    { id: 'hospitals', label: 'Hospitals & Trauma Centers', icon: '🏥', badge: hospitals.length },
                    { id: 'warehouses', label: 'Warehouses & Stockpiles', icon: '🏭', badge: warehouses.length },
                    { id: 'shipments', label: 'Critical Supply Transports', icon: '📦', badge: shipments.length },
                    { id: 'emergencyCorridors', label: 'Emergency Green Corridors', icon: '🛡️' },
                    { id: 'bridges', label: 'Structural Bridges & Scour', icon: '🌉' },
                    { id: 'elevation', label: 'Elevation & Mountain Passes', icon: '⛰️', badge: MOUNTAIN_PASSES.length },
                    { id: 'geofences', label: '8 NER State Geofences', icon: '🗺️', badge: 8 },
                  ].map((layer) => {
                    const isChecked = layer.id === 'traffic' ? trafficLayerEnabled : activeLayers.has(layer.id);
                    return (
                      <label
                        key={layer.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: isChecked ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (layer.onToggle) layer.onToggle();
                              else toggleLayer(layer.id);
                            }}
                            style={{ accentColor: '#0284c7', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '12px' }}>{layer.icon}</span>
                          <span style={{ color: isChecked ? '#f8fafc' : '#94a3b8', fontWeight: isChecked ? 600 : 400 }}>
                            {layer.label}
                          </span>
                        </div>
                        {layer.badge !== undefined && (
                          <span style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                            {layer.badge}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Google Real-Time Traffic Layer Toggle */}
          <button
            onClick={() => setTrafficLayerEnabled(!trafficLayerEnabled)}
            style={{
              padding: '5px 11px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              background: trafficLayerEnabled ? 'rgba(34, 197, 94, 0.22)' : 'rgba(8, 12, 22, 0.92)',
              border: `1px solid ${trafficLayerEnabled ? 'rgba(34, 197, 94, 0.45)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: trafficLayerEnabled ? '#22c55e' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.15s ease',
            }}
            title="Toggle Google Real-Time Traffic Layer (Separate Stream from Vehicle GPS)"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: trafficLayerEnabled ? '#22c55e' : '#6b7280',
                display: 'inline-block',
                boxShadow: trafficLayerEnabled ? '0 0 8px #22c55e' : 'none',
              }}
            />
            <span>TRAFFIC</span>
          </button>

          {/* Split View Toggle */}
          <button
            onClick={() => setIsSplitView(!isSplitView)}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              background: isSplitView ? 'rgba(2, 132, 199, 0.22)' : 'rgba(8, 12, 22, 0.92)',
              border: `1px solid ${isSplitView ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: isSplitView ? '#38bdf8' : '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
            }}
            title="Toggle Map + Street View Split Mode"
          >
            <SplitViewIcon size={13} color={isSplitView ? '#38bdf8' : '#cbd5e1'} />
            <span>Split View</span>
          </button>

          {/* Emergency Mode Button */}
          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            style={{
              padding: '5px 11px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              background: emergencyMode ? '#dc2626' : 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            }}
          >
            <EmergencyShieldIcon size={13} color="#ffffff" />
            <span>EMERGENCY</span>
          </button>

          {/* Admin Config Button */}
          <button
            onClick={() => setShowAdminConfigModal(true)}
            style={{
              padding: '5px 9px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(8, 12, 22, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backdropFilter: 'blur(16px)',
            }}
            title="Open Admin Map Settings & Google API Credentials"
          >
            <GearIcon size={13} color="#cbd5e1" />
            <span>Admin</span>
          </button>
        </div>

        {/* ── Dynamic Map Legend (Requirement 30: Only show items for enabled layers) ── */}
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            right: '14px',
            zIndex: 900,
            background: 'rgba(8, 12, 22, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: legendOpen ? '10px 14px' : '6px 10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            maxWidth: '280px',
            fontSize: '11px',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            onClick={() => setLegendOpen(!legendOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: '12px',
              color: '#cbd5e1',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
              <span>DYNAMIC MAP LEGEND</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>{legendOpen ? '▲' : '▼'}</span>
          </div>

          {legendOpen && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
              {activeLayers.has('vehicles') && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    <span>Moving Vehicle (Live GPS)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                    <span>Idle / Stopped Vehicle</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                    <span>Emergency Vehicle</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280' }} />
                    <span>Offline (Last Known Location)</span>
                  </div>
                </>
              )}
              {(activeLayers.has('roads') || activeLayers.has('roadRisk')) && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <span style={{ width: '12px', height: '3px', background: '#f97316', borderRadius: '2px' }} />
                    <span>High-Risk Road Section</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <span style={{ width: '12px', height: '3px', background: '#dc2626', borderRadius: '2px' }} />
                    <span>Blocked Highway</span>
                  </div>
                </>
              )}
              {(activeLayers.has('incidents') || activeLayers.has('landslideZones')) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>🔺</span>
                  <span>Landslide Hazard / Debris</span>
                </div>
              )}
              {(activeLayers.has('floodZones') || activeLayers.has('incidents')) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>🌊</span>
                  <span>Flood Inundation Corridor</span>
                </div>
              )}
              {activeLayers.has('weather') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>🌧️</span>
                  <span>Monsoon Telemetry Station</span>
                </div>
              )}
              {activeLayers.has('fieldReports') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>📷</span>
                  <span>Field Officer Ground Photo</span>
                </div>
              )}
              {activeLayers.has('satelliteAI') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>🛰️</span>
                  <span>Copernicus SAR Detection</span>
                </div>
              )}
              {activeLayers.has('hospitals') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>🏥</span>
                  <span>Hospital & Trauma Center</span>
                </div>
              )}
              {activeLayers.has('warehouses') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>🏭</span>
                  <span>Supply Warehouse Stockpile</span>
                </div>
              )}
              {activeLayers.has('shipments') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>📦</span>
                  <span>Critical Medical/Food Cargo</span>
                </div>
              )}
              {activeLayers.has('bridges') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>🌉</span>
                  <span>Structural Bridge / Pier Scour</span>
                </div>
              )}
              {activeLayers.has('elevation') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>⛰️</span>
                  <span>Mountain Pass / High Peak</span>
                </div>
              )}
              {activeLayers.has('geofences') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <span>🏛️</span>
                  <span>State Boundary Geofence</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Floating Fleet Metrics Overlay ── */}
        {showFleetHud && !isSplitView && (
          <div className="map-hud-fleet">
            <div className="map-hud-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={13} color="currentColor" />
                <span>Fleet Operational Telemetry</span>
              </span>
              <button
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                onClick={() => setShowFleetHud(false)}
                aria-label="Close"
              >
                <CloseIcon size={12} />
              </button>
            </div>
            <div className="map-hud-metric-row">
              <span style={{ color: '#94a3b8' }}>Total Fleet Units</span>
              <strong className="font-mono">{vehicles.length}</strong>
            </div>
            <div className="map-hud-metric-row">
              <span style={{ color: '#94a3b8' }}>Active Moving</span>
              <strong className="font-mono" style={{ color: '#22c55e' }}>
                {vehicles.filter((v) => v.status === 'MOVING').length}
              </strong>
            </div>
            <div className="map-hud-metric-row">
              <span style={{ color: '#94a3b8' }}>Critical Medical Shipments</span>
              <strong className="font-mono" style={{ color: '#ef4444' }}>
                {shipments.filter((s) => s.priority === 'CRITICAL').length}
              </strong>
            </div>
          </div>
        )}

        {/* Section 4: Google Traffic Active Indicator Banner */}
        {trafficLayerEnabled && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '14px',
              zIndex: 990,
              background: 'rgba(8, 12, 22, 0.94)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <strong style={{ color: '#22c55e' }}>TRAFFIC CONDITIONS ACTIVE:</strong>
            </div>
            <span style={{ color: '#cbd5e1' }}>
              Real-Time Traffic Flow Vector •{' '}
              <em style={{ color: '#94a3b8' }}>Decoupled data stream from vehicle hardware GPS.</em>
            </span>
          </div>
        )}

        {/* ── Route Visualization: "WHY THIS ROUTE?" Floating Explanation Card ── */}
        {showWhyThisRoute && (
          <div className="why-this-route-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BotIcon size={16} color="#34d399" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#34d399', letterSpacing: '0.04em' }}>
                  WHY THIS ROUTE? (AI LOGISTICS EXPLANATION)
                </span>
              </div>
              <button
                onClick={() => setShowWhyThisRoute(false)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <CloseIcon size={14} />
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '10px' }}>
              <div>• <strong>Current NH-15:</strong> Blocked by 14,500 m³ debris avalanche at Bomdila Pass. Delay: +3h 40m. Risk score 84/100.</div>
              <div>• <strong>Recommended Bhalukpong Bypass:</strong> Verified clear by Copernicus Sentinel-1 radar pass at 11:42 UTC. High elevation stability, 94% reliability score.</div>
              <div>• <strong>Life-Safety Assessment:</strong> Guarantees delivery of critical cold-chain vaccines to Tawang District Hospital before thermal breach.</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => {
                  setShowWhyThisRoute(false);
                }}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Dispatch Reroute Order
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom Tactical Floating Dock ── */}
        <div className="tactical-dock">
          <button
            className={`dock-item ${activeLayers.has('fieldReports') ? 'active' : ''}`}
            onClick={() => {
              toggleLayer('fieldReports');
              if (onOpenImageIntel) onOpenImageIntel();
            }}
            title="Real-Time Field Officer Uploads & Photo Evidence"
          >
            <CameraIcon size={14} />
            <span>Field Evidence</span>
          </button>

          <button
            className={`dock-item ${activeLayers.has('satelliteAI') ? 'active' : ''}`}
            onClick={() => {
              toggleLayer('satelliteAI');
              if (onOpenSatelliteIntel) onOpenSatelliteIntel();
            }}
            title="Copernicus Sentinel-1 SAR & Sentinel-2 Intelligence"
          >
            <SatelliteIcon size={14} />
            <span>Copernicus AI</span>
          </button>

          <button
            className={`dock-item ${activeLayers.has('weather') ? 'active' : ''}`}
            onClick={() => {
              toggleLayer('weather');
              if (onOpenWeatherModal) onOpenWeatherModal();
            }}
            title="Live Rain Radar & Weather Telemetry"
          >
            <WeatherStormIcon size={14} />
            <span>Live Weather</span>
          </button>

          <button
            className={`dock-item ${activeLayers.has('vehicles') ? 'active' : ''}`}
            onClick={() => toggleLayer('vehicles')}
            title="Live Fleet GPS Tracking"
          >
            <TruckIcon size={14} />
            <span>Fleet</span>
          </button>

          <button
            className={`dock-item ${activeLayers.has('shipments') ? 'active' : ''}`}
            onClick={() => toggleLayer('shipments')}
            title="Critical Shipments & Supplies"
          >
            <BoxIcon size={14} />
            <span>Shipments</span>
          </button>

          <button
            className="dock-item"
            onClick={() => setShowComparisonModal(true)}
            title="Before vs After Visual Comparison Slider"
          >
            <CompareIcon size={14} />
            <span>Comparison</span>
          </button>

          <button
            className="dock-item"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([NER_CENTER.lat, NER_CENTER.lng], NER_DEFAULT_ZOOM);
              }
            }}
            title="Center Map on North Eastern Region"
          >
            <CrosshairIcon size={14} />
            <span>Center NER</span>
          </button>
        </div>

        {/* ── Floating Location Intelligence Panel (Map Click) ── */}
        {selectedLocationIntel && (
          <LocationIntelligencePanel
            intel={selectedLocationIntel}
            onClose={() => setSelectedLocationIntel(null)}
            onViewStreetView={() => setIsSplitView(true)}
            onViewSatellite={() => {
              setMapMode('satellite');
              if (onOpenSatelliteIntel) onOpenSatelliteIntel();
            }}
            onViewFieldImages={() => {
              if (onOpenImageIntel) onOpenImageIntel();
            }}
            onViewAIAnalysis={() => {
              setShowWhyThisRoute(true);
            }}
            onCalculateRoute={() => {
              setShowWhyThisRoute(true);
            }}
            onReportIncident={() => {
              if (onOpenImageIntel) onOpenImageIntel();
            }}
          />
        )}

        {/* ── Floating Road Intelligence & Visual History Panel (Road Click) ── */}
        {selectedRoad && (
          <RealWorldImageryPanel
            road={selectedRoad}
            prediction={riskPredictions.get(selectedRoad.id)}
            onClose={() => setSelectedRoad(null)}
            onOpenStreetView={() => setIsSplitView(true)}
            onOpenSatellite={() => {
              setMapMode('satellite');
              if (onOpenSatelliteIntel) onOpenSatelliteIntel();
            }}
            onOpenLatestImage={() => {
              if (onOpenImageIntel) onOpenImageIntel();
            }}
            onOptimizeRoute={() => {
              setShowWhyThisRoute(true);
            }}
            onOpenComparison={() => setShowComparisonModal(true)}
          />
        )}
      </div>

      {/* ── RIGHT PANE: STREET VIEW SPLIT VIEW (Requirement 5) ── */}
      {isSplitView && (
        <div
          style={{
            flex: '1 1 45%',
            height: '100%',
            position: 'relative',
            borderLeft: '2px solid rgba(56, 189, 248, 0.4)',
            background: '#090d16',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StreetViewPanoramaView
            lat={streetViewTarget.lat}
            lng={streetViewTarget.lng}
            locationName={streetViewTarget.locationName}
            roadNumber={streetViewTarget.roadNumber}
            onClose={() => setIsSplitView(false)}
            inline={true}
          />
        </div>
      )}

      {/* ── Before vs After Modal (Requirement 10) ── */}
      {showComparisonModal && (
        <BeforeAfterComparisonModal onClose={() => setShowComparisonModal(false)} />
      )}

      {/* ── Admin Map Configuration Modal (Requirement 20) ── */}
      {showAdminConfigModal && (
        <AdminMapConfigModal
          config={adminConfig}
          onSaveConfig={(updated) => {
            setAdminConfig(updated);
            if (updated.emergencyModeActive !== emergencyMode) {
              setEmergencyMode(updated.emergencyModeActive);
            }
          }}
          onClose={() => setShowAdminConfigModal(false)}
        />
      )}
    </div>
  );
}
