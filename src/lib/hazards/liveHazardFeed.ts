/**
 * NERIXA — Live Regional Hazard & Transportation Intelligence Feed
 * Real-time monitoring for:
 * 1. Floods & Inundation percentages
 * 2. Bridge Collapses & Structural health
 * 3. Accidents & Highway collisions
 * 4. National Highway network live status
 */

export interface LiveFloodZone {
  id: string;
  name: string;
  highway: string;
  state: string;
  district: string;
  location: { lat: number; lng: number };
  floodPercentage: number;
  waterLevelMeters: number; // relative to danger level (+ / -)
  dangerMarkMeters: number;
  currentLevelMeters: number;
  trend: 'RISING' | 'STABLE' | 'RECEDING';
  rainfallRateMmPerHour: number;
  status: 'CRITICAL_SUBMERGENCE' | 'HIGH_WATERLOGGING' | 'WARNING';
  affectedRoadLengthKm: number;
  divertedRoute: string;
  sensorId: string;
  source: string;
  lastUpdated: string;
}

export interface LiveBridgeStatus {
  id: string;
  name: string;
  river: string;
  highway: string;
  state: string;
  location: { lat: number; lng: number };
  condition: 'COLLAPSED' | 'SCOUR_CRITICAL' | 'RESTRICTED' | 'OPERATIONAL';
  healthPercentage: number;
  collapseAlert: boolean;
  description: string;
  pierStatus: string;
  loadCapacityTons: number;
  diversion: string;
  builtYear: number;
  sensorId: string;
  source: string;
  lastUpdated: string;
}

export interface LiveAccidentAlert {
  id: string;
  title: string;
  highway: string;
  locationName: string;
  state: string;
  location: { lat: number; lng: number };
  severity: 'FATAL' | 'MAJOR' | 'MODERATE';
  lanesBlocked: string;
  blockagePercentage: number;
  vehiclesInvolved: string;
  casualties: string;
  emergencyUnits: string[];
  clearanceEtaMinutes: number;
  alternateRoute: string;
  sensorId: string;
  source: string;
  lastUpdated: string;
}

export interface LiveHighwayStatus {
  id: string;
  highway: string;
  name: string;
  sector: string;
  status: 'BLOCKED' | 'RESTRICTED' | 'CAUTION' | 'OPEN';
  currentRisk: number; // 0 - 100
  averageSpeedKmh: number;
  normalSpeedKmh: number;
  delaysMinutes: number;
  activeDisruptions: string[];
  recommendedAction: string;
  location: { lat: number; lng: number };
  lastUpdated: string;
}

// ── Initial Seed Data for NER Region ──

export const INITIAL_FLOOD_ZONES: LiveFloodZone[] = [
  {
    id: 'fld-kzr',
    name: 'Kaziranga National Park Corridor (Brahmaputra Basin)',
    highway: 'NH-715 (Old NH-37)',
    state: 'Assam',
    district: 'Golaghat & Nagaon',
    location: { lat: 26.5775, lng: 93.1711 },
    floodPercentage: 92.4,
    waterLevelMeters: 1.84, // +1.84m above danger mark
    dangerMarkMeters: 74.5,
    currentLevelMeters: 76.34,
    trend: 'RISING',
    rainfallRateMmPerHour: 22.4,
    status: 'CRITICAL_SUBMERGENCE',
    affectedRoadLengthKm: 1.8,
    divertedRoute: 'Divert via Kaliabor–Silghat South Embankment Line',
    sensorId: 'CWC-GAU-7702 (Nematighat Hydro-Gauge)',
    source: 'Central Water Commission & IMD Radar Doppler',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'fld-maj',
    name: 'Majuli River Island Embankment Breach',
    highway: 'SH-1 / Kamalabari Ghat Road',
    state: 'Assam',
    district: 'Majuli',
    location: { lat: 26.9500, lng: 94.2000 },
    floodPercentage: 88.0,
    waterLevelMeters: 1.35,
    dangerMarkMeters: 85.2,
    currentLevelMeters: 86.55,
    trend: 'RISING',
    rainfallRateMmPerHour: 16.0,
    status: 'CRITICAL_SUBMERGENCE',
    affectedRoadLengthKm: 3.2,
    divertedRoute: 'Ferry operations suspended; emergency motorboat link only',
    sensorId: 'CWC-MJL-3109 (Kamalabari Sensor)',
    source: 'Assam State Disaster Management Authority (ASDMA)',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'fld-slc',
    name: 'Silchar Barak River Valley Inundation',
    highway: 'NH-37 / Annapurna Ghat',
    state: 'Assam',
    district: 'Cachar',
    location: { lat: 24.8250, lng: 92.7950 },
    floodPercentage: 76.5,
    waterLevelMeters: 0.92,
    dangerMarkMeters: 19.83,
    currentLevelMeters: 20.75,
    trend: 'RECEDING',
    rainfallRateMmPerHour: 6.8,
    status: 'HIGH_WATERLOGGING',
    affectedRoadLengthKm: 0.9,
    divertedRoute: 'Use Silchar Bypass via Badarpurghat',
    sensorId: 'CWC-BARAK-102',
    source: 'Barak River Forecast Division',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'fld-dhm',
    name: 'Dhemaji Jiadhal Flash Flood Spillway',
    highway: 'NH-15 (North Bank Corridor)',
    state: 'Assam',
    district: 'Dhemaji',
    location: { lat: 27.4800, lng: 94.5800 },
    floodPercentage: 83.2,
    waterLevelMeters: 1.15,
    dangerMarkMeters: 104.0,
    currentLevelMeters: 105.15,
    trend: 'RISING',
    rainfallRateMmPerHour: 28.0,
    status: 'CRITICAL_SUBMERGENCE',
    affectedRoadLengthKm: 2.1,
    divertedRoute: 'Divert light vehicles via Sisiborgaon railway feeder road',
    sensorId: 'NER-HYDRO-DHM-04',
    source: 'Central Water Commission Hydro-Met Division',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'fld-tst',
    name: 'Teesta River Basin Flash Flood Corridor',
    highway: 'NH-10 (Sikkim Lifeline)',
    state: 'Sikkim / West Bengal Border',
    district: 'East Sikkim / Kalimpong',
    location: { lat: 27.1200, lng: 88.5100 },
    floodPercentage: 81.6,
    waterLevelMeters: 1.42,
    dangerMarkMeters: 280.0,
    currentLevelMeters: 281.42,
    trend: 'RISING',
    rainfallRateMmPerHour: 34.2,
    status: 'CRITICAL_SUBMERGENCE',
    affectedRoadLengthKm: 4.5,
    divertedRoute: 'Use Lava-Algarah-Reshi alternative mountain pass',
    sensorId: 'CWC-TEESTA-NHPC',
    source: 'NHPC Teesta Stage V Inflow Warning Unit',
    lastUpdated: new Date().toISOString(),
  },
];

export const INITIAL_BRIDGES: LiveBridgeStatus[] = [
  {
    id: 'brg-sub',
    name: 'Subansiri Bailey Bridge (Pier 3 Sheared)',
    river: 'Subansiri River',
    highway: 'NH-15 Arunachal Link',
    state: 'Arunachal Pradesh / Assam Border',
    location: { lat: 27.5600, lng: 94.2500 },
    condition: 'COLLAPSED',
    healthPercentage: 12.0,
    collapseAlert: true,
    description: 'Catastrophic flash flood caused violent boulder scouring, shearing Pier 3. 45-meter center truss dropped into riverbed. Complete closure enforced.',
    pierStatus: 'Pier 3 Sheared / Pier 4 Tilted 8°',
    loadCapacityTons: 0,
    diversion: 'Emergency Military Pontoon crossing 8.4 km downstream (Army & Medical only)',
    builtYear: 1984,
    sensorId: 'STR-PIER-SUB-03',
    source: 'Border Roads Organisation (BRO Project Arunank)',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'brg-klb',
    name: 'Kolia Bhomora Setu (Pier 7 Scour)',
    river: 'Brahmaputra River',
    highway: 'NH-27 / NH-715',
    state: 'Assam',
    location: { lat: 26.6338, lng: 92.7937 },
    condition: 'SCOUR_CRITICAL',
    healthPercentage: 58.0,
    collapseAlert: false,
    description: 'Ultrasonic sensor array flagged 4.6m seabed scour depth at Pier 7. Heavy freight restricted to 30T load limit. Real-time acoustic monitoring online.',
    pierStatus: 'Foundation Scour Depth: 4.6m (Threshold: 5.0m)',
    loadCapacityTons: 30,
    diversion: 'Over-dimensional multi-axle freight rerouted to Bhupen Hazarika Setu',
    builtYear: 1987,
    sensorId: 'NHAI-SON-KB-07',
    source: 'National Highways Authority of India (NHAI) Structural Unit',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'brg-jiri',
    name: 'Jiri River Bridge (Abutment Cracking)',
    river: 'Jiri River',
    highway: 'NH-37 (Jiribam–Imphal Highway)',
    state: 'Manipur / Assam Border',
    location: { lat: 24.5500, lng: 93.3000 },
    condition: 'RESTRICTED',
    healthPercentage: 42.0,
    collapseAlert: false,
    description: 'Landslide pressure on eastern abutment caused 14cm shear displacement. Single-lane alternating convoy traffic with speed limit 10 km/h.',
    pierStatus: 'East Abutment Displaced 14cm',
    loadCapacityTons: 16,
    diversion: 'Heavy multi-axle trucks held at Jiribam checkpost',
    builtYear: 1970,
    sensorId: 'PWD-MNP-JIRI-12',
    source: 'Manipur PWD National Highways Division',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'brg-sar',
    name: 'Saraighat Rail-cum-Road Bridge',
    river: 'Brahmaputra River',
    highway: 'NH-27 Gateway',
    state: 'Assam',
    location: { lat: 26.1800, lng: 91.7300 },
    condition: 'OPERATIONAL',
    healthPercentage: 91.0,
    collapseAlert: false,
    description: 'Telemetry across 12 vibration accelerometer sensors confirms structural stability. Normal two-lane transit active.',
    pierStatus: 'All 11 Piers Normal',
    loadCapacityTons: 45,
    diversion: 'None; New Saraighat bridge shares eastbound load',
    builtYear: 1962,
    sensorId: 'NFR-SAR-VIB-01',
    source: 'Northeast Frontier Railway & Assam PWD',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'brg-bog',
    name: 'Bogibeel Rail-cum-Road Super Bridge',
    river: 'Brahmaputra River',
    highway: 'NH-15 Link',
    state: 'Assam',
    location: { lat: 27.3800, lng: 94.6500 },
    condition: 'OPERATIONAL',
    healthPercentage: 96.0,
    collapseAlert: false,
    description: 'Fully operational 4.94 km double-deck steel truss bridge. High wind velocity warning active (48 km/h). Speed limit restricted to 40 km/h.',
    pierStatus: 'Seismic Dampers Functional',
    loadCapacityTons: 70,
    diversion: 'None; Strategic all-weather crossing active',
    builtYear: 2018,
    sensorId: 'NFR-BOGI-SCADA',
    source: 'Northeast Frontier Railway Integrated SCADA',
    lastUpdated: new Date().toISOString(),
  },
];

export const INITIAL_ACCIDENTS: LiveAccidentAlert[] = [
  {
    id: 'acc-dima',
    title: 'Multi-Truck Head-On Collision & Fuel Tanker Spill',
    highway: 'NH-27 KM 48 (Haflong Mountain Ghat)',
    locationName: 'Dima Hasao Mountain Pass',
    state: 'Assam',
    location: { lat: 25.1850, lng: 92.9850 },
    severity: 'MAJOR',
    lanesBlocked: 'Both Lanes (100% Blockage)',
    blockagePercentage: 100,
    vehiclesInvolved: '1x Petroleum Tanker (Diesel Leak), 2x Freight Trucks',
    casualties: '3 Injured (Stabilized by SDRF Paramedics)',
    emergencyUnits: ['Assam SDRF Heavy Crane Unit 2', 'Haflong Fire Tender', '108 Ambulance Unit 5'],
    clearanceEtaMinutes: 42,
    alternateRoute: 'Southern Foothills Bypass via Lumding–Hojai Corridor',
    sensorId: 'TRAF-DIMA-CAM-09',
    source: 'Assam Highway Police & SDRF Ground Terminal',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'acc-shl',
    title: 'Container Rollover on Sharp Hairpin Descent',
    highway: 'NH-106 / Shillong Bypass',
    locationName: 'Umiam Lake Viewpoint Ghat',
    state: 'Meghalaya',
    location: { lat: 25.6650, lng: 91.8950 },
    severity: 'MODERATE',
    lanesBlocked: 'Lane 2 Blocked (50% Blockage)',
    blockagePercentage: 50,
    vehiclesInvolved: '1x 40ft Intermodal Container Trailer',
    casualties: 'Minor injuries; driver attended',
    emergencyUnits: ['Meghalaya Traffic Police Tow Crane', 'Umiam Highway Patrol'],
    clearanceEtaMinutes: 25,
    alternateRoute: 'Old Shillong City internal road for light vehicles',
    sensorId: 'MEG-POL-SHL-03',
    source: 'Meghalaya State Highway Patrol',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'acc-koh',
    title: 'Inter-District Bus Mechanical Axle Failure on Incline',
    highway: 'NH-29 (Dimapur–Kohima Highway)',
    locationName: 'Zubza Mountain Sector KM 18',
    state: 'Nagaland',
    location: { lat: 25.7100, lng: 94.0200 },
    severity: 'MODERATE',
    lanesBlocked: 'Uphill Lane Blocked (40% Blockage)',
    blockagePercentage: 40,
    vehiclesInvolved: '1x 42-Seater State Transport Bus',
    casualties: 'No injuries; passengers transferred to relief bus',
    emergencyUnits: ['Nagaland Police Traffic Wing', 'BRO Recovery Wrecker'],
    clearanceEtaMinutes: 18,
    alternateRoute: 'Single-lane alternating stop-and-go managed by BRO',
    sensorId: 'NAG-ZUB-RADAR',
    source: 'Nagaland State Transport & Highway Patrol',
    lastUpdated: new Date().toISOString(),
  },
];

export const INITIAL_HIGHWAYS: LiveHighwayStatus[] = [
  {
    id: 'hw-nh27',
    highway: 'NH-27',
    name: 'East-West Corridor Lifeline',
    sector: 'Guwahati – Nagaon – Lumding – Silchar',
    status: 'BLOCKED',
    currentRisk: 88,
    averageSpeedKmh: 18,
    normalSpeedKmh: 65,
    delaysMinutes: 165,
    activeDisruptions: [
      'Multi-Truck Collision at KM 48 Haflong Ghat (100% blockage)',
      'Submergence near Kaziranga Embankment (92% Flood)',
    ],
    recommendedAction: 'Divert all medical convoys to Southern Foothills Bypass (Route B)',
    location: { lat: 25.8500, lng: 92.5000 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hw-nh29',
    highway: 'NH-29',
    name: 'Dimapur–Kohima–Imphal Mountain Corridor',
    sector: 'Dimapur – Kohima – Maram – Imphal',
    status: 'CAUTION',
    currentRisk: 74,
    averageSpeedKmh: 28,
    normalSpeedKmh: 50,
    delaysMinutes: 45,
    activeDisruptions: [
      'Heavy monsoonal mudslide risk (82%) between Zubza and Kohima',
      'Axle breakdown at Zubza KM 18 (single lane alternating)',
    ],
    recommendedAction: 'Proceed with low gear; heavy convoy movement restricted during night hours',
    location: { lat: 25.6700, lng: 94.1100 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hw-nh102',
    highway: 'NH-102',
    name: 'Asian Highway 1 (Imphal–Moreh Border Corridor)',
    sector: 'Imphal – Kakching – Pallel – Moreh',
    status: 'OPEN',
    currentRisk: 32,
    averageSpeedKmh: 48,
    normalSpeedKmh: 55,
    delaysMinutes: 10,
    activeDisruptions: ['Pallel checkpost security screening slowdown'],
    recommendedAction: 'Safe for cross-border freight; clear weather reported',
    location: { lat: 24.5000, lng: 94.1000 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hw-nh15',
    highway: 'NH-15',
    name: 'North Bank Himalayan Foothills Highway',
    sector: 'Tezpur – North Lakhimpur – Dhemaji',
    status: 'RESTRICTED',
    currentRisk: 78,
    averageSpeedKmh: 30,
    normalSpeedKmh: 60,
    delaysMinutes: 60,
    activeDisruptions: [
      'Subansiri Bridge Collapse (Traffic diverted to pontoon)',
      'Jiadhal Flash Flood spillway (83% flood inundation)',
    ],
    recommendedAction: 'Divert through South Bank via Bogibeel Bridge to Dibrugarh',
    location: { lat: 27.2500, lng: 94.1500 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hw-nh8',
    highway: 'NH-8',
    name: 'Tripura Lifeline Corridor',
    sector: 'Churaibari – Dharmanagar – Agartala',
    status: 'OPEN',
    currentRisk: 22,
    averageSpeedKmh: 56,
    normalSpeedKmh: 60,
    delaysMinutes: 5,
    activeDisruptions: ['Normal operations; low cloud cover'],
    recommendedAction: 'All petroleum and essential supply convoys running on schedule',
    location: { lat: 24.1000, lng: 91.8000 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'hw-nh10',
    highway: 'NH-10',
    name: 'Sikkim Lifeline / Teesta Gorge Highway',
    sector: 'Sevoke – Teesta Bazaar – Rangpo – Gangtok',
    status: 'BLOCKED',
    currentRisk: 91,
    averageSpeedKmh: 12,
    normalSpeedKmh: 45,
    delaysMinutes: 180,
    activeDisruptions: [
      'Teesta River discharge overtopping roadway at 29th Mile',
      'Active rockfall hazard at Likhuveer',
    ],
    recommendedAction: 'Enforce complete stoppage at Sevoke; divert light traffic via Gorubathan–Lava',
    location: { lat: 27.0500, lng: 88.4800 },
    lastUpdated: new Date().toISOString(),
  },
];

/**
 * Dynamic Telemetry Simulation Engine:
 * Simulates real-time sensor fluctuation:
 * - Flood gauge levels oscillate and report realistic percentage changes
 * - Accident clearance timers tick down
 * - Highway speeds and delay estimates recalculate
 */
export function simulateLiveHazardStep(
  floods: LiveFloodZone[],
  bridges: LiveBridgeStatus[],
  accidents: LiveAccidentAlert[],
  highways: LiveHighwayStatus[]
): {
  floods: LiveFloodZone[];
  bridges: LiveBridgeStatus[];
  accidents: LiveAccidentAlert[];
  highways: LiveHighwayStatus[];
} {
  // 1. Update floods: oscillate flood percentage subtly (+/- 0.2 to 0.6) and water level
  const updatedFloods = floods.map((f) => {
    const delta = (Math.random() - 0.48) * 0.8;
    const newPct = Math.min(99.5, Math.max(45.0, Number((f.floodPercentage + delta).toFixed(1))));
    const waterDelta = (Math.random() - 0.48) * 0.04;
    const newWater = Number((f.waterLevelMeters + waterDelta).toFixed(2));
    const newCurrent = Number((f.dangerMarkMeters + newWater).toFixed(2));
    return {
      ...f,
      floodPercentage: newPct,
      waterLevelMeters: newWater,
      currentLevelMeters: newCurrent,
      trend: delta > 0.05 ? 'RISING' : delta < -0.05 ? 'RECEDING' : f.trend,
      lastUpdated: new Date().toISOString(),
    };
  });

  // 2. Update bridges: subtle vibration sensor adjustments
  const updatedBridges = bridges.map((b) => {
    if (b.condition === 'COLLAPSED') return { ...b, lastUpdated: new Date().toISOString() };
    const healthDelta = (Math.random() - 0.5) * 0.4;
    const newHealth = Math.min(100, Math.max(15, Number((b.healthPercentage + healthDelta).toFixed(1))));
    return {
      ...b,
      healthPercentage: newHealth,
      lastUpdated: new Date().toISOString(),
    };
  });

  // 3. Update accidents: countdown clearance timer
  const updatedAccidents = accidents.map((a) => {
    const newEta = Math.max(5, a.clearanceEtaMinutes - 1);
    return {
      ...a,
      clearanceEtaMinutes: newEta,
      lastUpdated: new Date().toISOString(),
    };
  });

  // 4. Update highways: minor traffic speed adjustments
  const updatedHighways = highways.map((h) => {
    const speedDelta = Math.floor((Math.random() - 0.5) * 4);
    const newSpeed = Math.max(10, Math.min(h.normalSpeedKmh, h.averageSpeedKmh + speedDelta));
    return {
      ...h,
      averageSpeedKmh: newSpeed,
      lastUpdated: new Date().toISOString(),
    };
  });

  return {
    floods: updatedFloods,
    bridges: updatedBridges,
    accidents: updatedAccidents,
    highways: updatedHighways,
  };
}
