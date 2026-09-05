// ============================================================
// NER-SHIELD AI — Comprehensive NER Seed Data
// Real geographic coordinates for the North Eastern Region
// ============================================================

import type {
  Road, Bridge, Vehicle, Shipment, Warehouse, Hospital,
  WeatherData, Incident, District, NERState, Alert, GeoPoint,
} from '@/lib/types';

// ── States ──────────────────────────────────────────────────
export const SEED_STATES: NERState[] = [
  { id: 'assam', name: 'Assam', code: 'AS', capital: 'Dispur', center: { lat: 26.2006, lng: 92.9376 }, districtCount: 35 },
  { id: 'arunachal', name: 'Arunachal Pradesh', code: 'AR', capital: 'Itanagar', center: { lat: 27.0844, lng: 93.6053 }, districtCount: 26 },
  { id: 'meghalaya', name: 'Meghalaya', code: 'ML', capital: 'Shillong', center: { lat: 25.4670, lng: 91.3662 }, districtCount: 12 },
  { id: 'manipur', name: 'Manipur', code: 'MN', capital: 'Imphal', center: { lat: 24.6637, lng: 93.9063 }, districtCount: 16 },
  { id: 'mizoram', name: 'Mizoram', code: 'MZ', capital: 'Aizawl', center: { lat: 23.1645, lng: 92.9376 }, districtCount: 11 },
  { id: 'nagaland', name: 'Nagaland', code: 'NL', capital: 'Kohima', center: { lat: 26.1584, lng: 94.5624 }, districtCount: 16 },
  { id: 'tripura', name: 'Tripura', code: 'TR', capital: 'Agartala', center: { lat: 23.9408, lng: 91.9882 }, districtCount: 8 },
  { id: 'sikkim', name: 'Sikkim', code: 'SK', capital: 'Gangtok', center: { lat: 27.5330, lng: 88.5122 }, districtCount: 6 },
];

// ── Districts (selected key districts per state) ────────────
export const SEED_DISTRICTS: District[] = [
  // Assam
  { id: 'kamrup-metro', stateId: 'assam', stateName: 'Assam', name: 'Kamrup Metropolitan', center: { lat: 26.1445, lng: 91.7362 }, population: 1253938, accessibilityScore: 88 },
  { id: 'nagaon', stateId: 'assam', stateName: 'Assam', name: 'Nagaon', center: { lat: 26.3500, lng: 92.6800 }, population: 2823768, accessibilityScore: 72 },
  { id: 'dibrugarh', stateId: 'assam', stateName: 'Assam', name: 'Dibrugarh', center: { lat: 27.4728, lng: 94.9120 }, population: 1327929, accessibilityScore: 65 },
  { id: 'tinsukia', stateId: 'assam', stateName: 'Assam', name: 'Tinsukia', center: { lat: 27.4922, lng: 95.3547 }, population: 1316948, accessibilityScore: 58 },
  { id: 'sonitpur', stateId: 'assam', stateName: 'Assam', name: 'Sonitpur', center: { lat: 26.7500, lng: 92.9700 }, population: 1924110, accessibilityScore: 70 },
  { id: 'jorhat', stateId: 'assam', stateName: 'Assam', name: 'Jorhat', center: { lat: 26.7509, lng: 94.2037 }, population: 1091295, accessibilityScore: 68 },
  { id: 'silchar', stateId: 'assam', stateName: 'Assam', name: 'Cachar', center: { lat: 24.8333, lng: 92.7789 }, population: 1736617, accessibilityScore: 55 },
  // Arunachal Pradesh
  { id: 'papum-pare', stateId: 'arunachal', stateName: 'Arunachal Pradesh', name: 'Papum Pare', center: { lat: 27.0844, lng: 93.6053 }, population: 176573, accessibilityScore: 45 },
  { id: 'tawang', stateId: 'arunachal', stateName: 'Arunachal Pradesh', name: 'Tawang', center: { lat: 27.5860, lng: 91.8689 }, population: 49950, accessibilityScore: 32 },
  { id: 'west-kameng', stateId: 'arunachal', stateName: 'Arunachal Pradesh', name: 'West Kameng', center: { lat: 27.2343, lng: 92.3664 }, population: 83947, accessibilityScore: 38 },
  // Meghalaya
  { id: 'east-khasi-hills', stateId: 'meghalaya', stateName: 'Meghalaya', name: 'East Khasi Hills', center: { lat: 25.4670, lng: 91.3662 }, population: 825922, accessibilityScore: 62 },
  { id: 'west-garo-hills', stateId: 'meghalaya', stateName: 'Meghalaya', name: 'West Garo Hills', center: { lat: 25.5000, lng: 90.2167 }, population: 643291, accessibilityScore: 48 },
  { id: 'ri-bhoi', stateId: 'meghalaya', stateName: 'Meghalaya', name: 'Ri-Bhoi', center: { lat: 25.7750, lng: 91.8500 }, population: 258840, accessibilityScore: 55 },
  // Manipur
  { id: 'imphal-west', stateId: 'manipur', stateName: 'Manipur', name: 'Imphal West', center: { lat: 24.8170, lng: 93.9368 }, population: 517992, accessibilityScore: 60 },
  { id: 'churachandpur', stateId: 'manipur', stateName: 'Manipur', name: 'Churachandpur', center: { lat: 24.3333, lng: 93.6833 }, population: 274143, accessibilityScore: 35 },
  // Mizoram
  { id: 'aizawl-district', stateId: 'mizoram', stateName: 'Mizoram', name: 'Aizawl', center: { lat: 23.7307, lng: 92.7173 }, population: 404054, accessibilityScore: 50 },
  { id: 'lunglei', stateId: 'mizoram', stateName: 'Mizoram', name: 'Lunglei', center: { lat: 22.8810, lng: 92.7330 }, population: 161428, accessibilityScore: 38 },
  // Nagaland
  { id: 'kohima-district', stateId: 'nagaland', stateName: 'Nagaland', name: 'Kohima', center: { lat: 25.6586, lng: 94.1086 }, population: 267988, accessibilityScore: 52 },
  { id: 'dimapur', stateId: 'nagaland', stateName: 'Nagaland', name: 'Dimapur', center: { lat: 25.9065, lng: 93.7271 }, population: 378811, accessibilityScore: 60 },
  // Tripura
  { id: 'west-tripura', stateId: 'tripura', stateName: 'Tripura', name: 'West Tripura', center: { lat: 23.8315, lng: 91.2868 }, population: 917534, accessibilityScore: 65 },
  // Sikkim
  { id: 'east-sikkim', stateId: 'sikkim', stateName: 'Sikkim', name: 'East Sikkim', center: { lat: 27.3389, lng: 88.6065 }, population: 283583, accessibilityScore: 55 },
  { id: 'north-sikkim', stateId: 'sikkim', stateName: 'Sikkim', name: 'North Sikkim', center: { lat: 27.9000, lng: 88.5500 }, population: 43354, accessibilityScore: 28 },
];

// ── Roads (major NER highways with real coordinates) ────────
export const SEED_ROADS: Road[] = [
  {
    id: 'nh-15', name: 'Guwahati-Tawang Highway', number: 'NH-15',
    stateIds: ['assam', 'arunachal'], districtIds: ['kamrup-metro', 'sonitpur', 'west-kameng', 'tawang'],
    status: 'OPEN', condition: 'FAIR', roadType: 'NH', length: 517, speedLimit: 60,
    path: [
      { lat: 26.1445, lng: 91.7362 }, { lat: 26.6338, lng: 92.7937 },
      { lat: 26.9500, lng: 92.5800 }, { lat: 27.2343, lng: 92.3664 },
      { lat: 27.5860, lng: 91.8689 }
    ],
    terrain: 'MOUNTAINOUS', elevation: 3048, slope: 15, riverProximity: 2,
    historicalLandslides: 23, historicalFloods: 5, bridgeIds: ['br-1', 'br-2'],
    trafficLevel: 'MODERATE', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-27', name: 'East-West Corridor (Assam)', number: 'NH-27',
    stateIds: ['assam'], districtIds: ['kamrup-metro', 'nagaon', 'jorhat', 'dibrugarh', 'tinsukia'],
    status: 'OPEN', condition: 'GOOD', roadType: 'NH', length: 640, speedLimit: 80,
    path: [
      { lat: 26.1445, lng: 91.7362 }, { lat: 26.3500, lng: 92.6800 },
      { lat: 26.7509, lng: 94.2037 }, { lat: 27.4728, lng: 94.9120 },
      { lat: 27.4922, lng: 95.3547 }
    ],
    terrain: 'FLAT', elevation: 87, slope: 2, riverProximity: 1,
    historicalLandslides: 3, historicalFloods: 18, bridgeIds: ['br-3', 'br-4'],
    trafficLevel: 'HEAVY', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-6', name: 'Guwahati-Shillong Highway', number: 'NH-6',
    stateIds: ['assam', 'meghalaya'], districtIds: ['kamrup-metro', 'ri-bhoi', 'east-khasi-hills'],
    status: 'OPEN', condition: 'GOOD', roadType: 'NH', length: 104, speedLimit: 60,
    path: [
      { lat: 26.1445, lng: 91.7362 }, { lat: 25.9400, lng: 91.7600 },
      { lat: 25.7750, lng: 91.8500 }, { lat: 25.4670, lng: 91.3662 }
    ],
    terrain: 'HILLY', elevation: 1496, slope: 12, riverProximity: 5,
    historicalLandslides: 12, historicalFloods: 4, bridgeIds: ['br-5'],
    trafficLevel: 'HEAVY', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-37', name: 'Imphal-Dimapur Highway', number: 'NH-37',
    stateIds: ['manipur', 'nagaland'], districtIds: ['imphal-west', 'kohima-district', 'dimapur'],
    status: 'OPEN', condition: 'FAIR', roadType: 'NH', length: 215, speedLimit: 50,
    path: [
      { lat: 24.8170, lng: 93.9368 }, { lat: 25.3500, lng: 94.0500 },
      { lat: 25.6586, lng: 94.1086 }, { lat: 25.9065, lng: 93.7271 }
    ],
    terrain: 'MOUNTAINOUS', elevation: 1261, slope: 18, riverProximity: 4,
    historicalLandslides: 31, historicalFloods: 7, bridgeIds: ['br-6', 'br-7'],
    trafficLevel: 'MODERATE', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-54', name: 'Silchar-Aizawl Highway', number: 'NH-54',
    stateIds: ['assam', 'mizoram'], districtIds: ['silchar', 'aizawl-district'],
    status: 'OPEN', condition: 'POOR', roadType: 'NH', length: 180, speedLimit: 40,
    path: [
      { lat: 24.8333, lng: 92.7789 }, { lat: 24.3000, lng: 92.7500 },
      { lat: 23.7307, lng: 92.7173 }
    ],
    terrain: 'MOUNTAINOUS', elevation: 1132, slope: 20, riverProximity: 3,
    historicalLandslides: 45, historicalFloods: 12, bridgeIds: ['br-8', 'br-9'],
    trafficLevel: 'LOW', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-44', name: 'Agartala-Silchar Highway', number: 'NH-44',
    stateIds: ['tripura', 'assam'], districtIds: ['west-tripura', 'silchar'],
    status: 'OPEN', condition: 'FAIR', roadType: 'NH', length: 195, speedLimit: 50,
    path: [
      { lat: 23.8315, lng: 91.2868 }, { lat: 24.2000, lng: 91.8000 },
      { lat: 24.8333, lng: 92.7789 }
    ],
    terrain: 'HILLY', elevation: 450, slope: 10, riverProximity: 3,
    historicalLandslides: 8, historicalFloods: 15, bridgeIds: ['br-10'],
    trafficLevel: 'MODERATE', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-10', name: 'Siliguri-Gangtok Highway', number: 'NH-10',
    stateIds: ['sikkim'], districtIds: ['east-sikkim'],
    status: 'OPEN', condition: 'GOOD', roadType: 'NH', length: 114, speedLimit: 40,
    path: [
      { lat: 26.7271, lng: 88.3953 }, { lat: 27.0900, lng: 88.4700 },
      { lat: 27.3389, lng: 88.6065 }
    ],
    terrain: 'MOUNTAINOUS', elevation: 1650, slope: 22, riverProximity: 1,
    historicalLandslides: 35, historicalFloods: 8, bridgeIds: ['br-11', 'br-12'],
    trafficLevel: 'MODERATE', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-51', name: 'Guwahati-Tura Highway', number: 'NH-51',
    stateIds: ['assam', 'meghalaya'], districtIds: ['kamrup-metro', 'west-garo-hills'],
    status: 'PARTIALLY_BLOCKED', condition: 'POOR', roadType: 'NH', length: 310, speedLimit: 50,
    path: [
      { lat: 26.1445, lng: 91.7362 }, { lat: 25.9000, lng: 91.2000 },
      { lat: 25.7000, lng: 90.6000 }, { lat: 25.5000, lng: 90.2167 }
    ],
    terrain: 'HILLY', elevation: 680, slope: 14, riverProximity: 2,
    historicalLandslides: 18, historicalFloods: 10, bridgeIds: ['br-13'],
    trafficLevel: 'LOW', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-29', name: 'Dimapur-Kohima-Imphal Highway', number: 'NH-29',
    stateIds: ['nagaland', 'manipur'], districtIds: ['dimapur', 'kohima-district', 'imphal-west'],
    status: 'OPEN', condition: 'FAIR', roadType: 'NH', length: 222, speedLimit: 40,
    path: [
      { lat: 25.9065, lng: 93.7271 }, { lat: 25.6586, lng: 94.1086 },
      { lat: 25.3500, lng: 94.0500 }, { lat: 24.8170, lng: 93.9368 }
    ],
    terrain: 'MOUNTAINOUS', elevation: 1444, slope: 20, riverProximity: 6,
    historicalLandslides: 40, historicalFloods: 5, bridgeIds: ['br-14'],
    trafficLevel: 'MODERATE', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-53', name: 'Jorhat-Kohima Highway', number: 'NH-53',
    stateIds: ['assam', 'nagaland'], districtIds: ['jorhat', 'dimapur', 'kohima-district'],
    status: 'OPEN', condition: 'FAIR', roadType: 'NH', length: 210, speedLimit: 50,
    path: [
      { lat: 26.7509, lng: 94.2037 }, { lat: 26.3000, lng: 94.1000 },
      { lat: 25.9065, lng: 93.7271 }, { lat: 25.6586, lng: 94.1086 }
    ],
    terrain: 'HILLY', elevation: 980, slope: 15, riverProximity: 3,
    historicalLandslides: 22, historicalFloods: 6, bridgeIds: ['br-15'],
    trafficLevel: 'LOW', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-8', name: 'Guwahati-Nagaon-Jorhat Highway', number: 'NH-8',
    stateIds: ['assam'], districtIds: ['kamrup-metro', 'nagaon', 'jorhat'],
    status: 'OPEN', condition: 'GOOD', roadType: 'NH', length: 310, speedLimit: 70,
    path: [
      { lat: 26.1445, lng: 91.7362 }, { lat: 26.3500, lng: 92.6800 },
      { lat: 26.5500, lng: 93.4000 }, { lat: 26.7509, lng: 94.2037 }
    ],
    terrain: 'FLAT', elevation: 75, slope: 1, riverProximity: 1,
    historicalLandslides: 1, historicalFloods: 22, bridgeIds: ['br-16'],
    trafficLevel: 'HEAVY', lastUpdated: new Date().toISOString(),
  },
  {
    id: 'nh-36', name: 'Silchar-Imphal Highway', number: 'NH-36',
    stateIds: ['assam', 'manipur'], districtIds: ['silchar', 'churachandpur', 'imphal-west'],
    status: 'OPEN', condition: 'POOR', roadType: 'NH', length: 240, speedLimit: 40,
    path: [
      { lat: 24.8333, lng: 92.7789 }, { lat: 24.5500, lng: 93.3000 },
      { lat: 24.3333, lng: 93.6833 }, { lat: 24.8170, lng: 93.9368 }
    ],
    terrain: 'MOUNTAINOUS', elevation: 1200, slope: 18, riverProximity: 4,
    historicalLandslides: 38, historicalFloods: 9, bridgeIds: ['br-17'],
    trafficLevel: 'LOW', lastUpdated: new Date().toISOString(),
  },
];

// ── Bridges ─────────────────────────────────────────────────
export const SEED_BRIDGES: Bridge[] = [
  { id: 'br-1', name: 'Saraighat Bridge', roadId: 'nh-27', location: { lat: 26.1800, lng: 91.7300 }, condition: 'GOOD', length: 1492, capacity: 40, riverName: 'Brahmaputra', builtYear: 1962, lastInspection: '2025-06-15', risk: 25 },
  { id: 'br-2', name: 'Kalia Bhomora Setu', roadId: 'nh-27', location: { lat: 26.6338, lng: 92.7937 }, condition: 'FAIR', length: 3015, capacity: 30, riverName: 'Brahmaputra', builtYear: 1987, lastInspection: '2025-03-20', risk: 35 },
  { id: 'br-3', name: 'Bogibeel Bridge', roadId: 'nh-27', location: { lat: 27.3800, lng: 94.6500 }, condition: 'EXCELLENT', length: 4940, capacity: 50, riverName: 'Brahmaputra', builtYear: 2018, lastInspection: '2025-08-10', risk: 10 },
  { id: 'br-4', name: 'Dhola Sadiya Bridge', roadId: 'nh-27', location: { lat: 27.6500, lng: 95.3000 }, condition: 'GOOD', length: 9150, capacity: 40, riverName: 'Lohit', builtYear: 2017, lastInspection: '2025-07-05', risk: 15 },
  { id: 'br-5', name: 'Umiam Bridge', roadId: 'nh-6', location: { lat: 25.6500, lng: 91.8800 }, condition: 'FAIR', length: 240, capacity: 25, riverName: 'Umiam', builtYear: 1974, lastInspection: '2025-04-12', risk: 40 },
  { id: 'br-6', name: 'Iril Bridge', roadId: 'nh-37', location: { lat: 25.0000, lng: 94.0000 }, condition: 'POOR', length: 180, capacity: 20, riverName: 'Iril', builtYear: 1968, lastInspection: '2025-01-30', risk: 60 },
  { id: 'br-7', name: 'Barak Bridge', roadId: 'nh-37', location: { lat: 25.5000, lng: 94.0300 }, condition: 'FAIR', length: 320, capacity: 25, riverName: 'Barak', builtYear: 1982, lastInspection: '2025-05-18', risk: 45 },
  { id: 'br-8', name: 'Bairabi Bridge', roadId: 'nh-54', location: { lat: 24.1000, lng: 92.7400 }, condition: 'POOR', length: 150, capacity: 15, riverName: 'Barak', builtYear: 1975, lastInspection: '2024-11-20', risk: 65 },
  { id: 'br-9', name: 'Tlawng Bridge', roadId: 'nh-54', location: { lat: 23.5000, lng: 92.7200 }, condition: 'FAIR', length: 200, capacity: 20, riverName: 'Tlawng', builtYear: 1988, lastInspection: '2025-02-14', risk: 38 },
  { id: 'br-10', name: 'Gomati Bridge', roadId: 'nh-44', location: { lat: 24.0000, lng: 91.5000 }, condition: 'FAIR', length: 280, capacity: 25, riverName: 'Gomati', builtYear: 1985, lastInspection: '2025-06-01', risk: 32 },
  { id: 'br-11', name: 'Teesta Bridge', roadId: 'nh-10', location: { lat: 27.0000, lng: 88.4500 }, condition: 'GOOD', length: 350, capacity: 30, riverName: 'Teesta', builtYear: 1995, lastInspection: '2025-07-20', risk: 28 },
  { id: 'br-12', name: 'Rangpo Bridge', roadId: 'nh-10', location: { lat: 27.1750, lng: 88.5300 }, condition: 'FAIR', length: 120, capacity: 20, riverName: 'Rangpo', builtYear: 1980, lastInspection: '2025-04-05', risk: 42 },
  { id: 'br-13', name: 'Simsang Bridge', roadId: 'nh-51', location: { lat: 25.6000, lng: 90.4000 }, condition: 'POOR', length: 200, capacity: 18, riverName: 'Simsang', builtYear: 1972, lastInspection: '2024-12-10', risk: 55 },
  { id: 'br-14', name: 'Dzükou Bridge', roadId: 'nh-29', location: { lat: 25.5000, lng: 94.0800 }, condition: 'FAIR', length: 140, capacity: 22, riverName: 'Dzükou', builtYear: 1990, lastInspection: '2025-03-15', risk: 35 },
  { id: 'br-15', name: 'Dhansiri Bridge', roadId: 'nh-53', location: { lat: 26.1000, lng: 93.9000 }, condition: 'GOOD', length: 280, capacity: 30, riverName: 'Dhansiri', builtYear: 2002, lastInspection: '2025-08-01', risk: 20 },
  { id: 'br-16', name: 'Kolong Bridge', roadId: 'nh-8', location: { lat: 26.3500, lng: 92.7000 }, condition: 'GOOD', length: 220, capacity: 30, riverName: 'Kolong', builtYear: 1998, lastInspection: '2025-05-25', risk: 18 },
  { id: 'br-17', name: 'Jiri Bridge', roadId: 'nh-36', location: { lat: 24.5500, lng: 93.3000 }, condition: 'POOR', length: 160, capacity: 15, riverName: 'Jiri', builtYear: 1970, lastInspection: '2024-10-15', risk: 70 },
];

// ── Warehouses ──────────────────────────────────────────────
export const SEED_WAREHOUSES: Warehouse[] = [
  { id: 'wh-1', name: 'Guwahati Central Warehouse', stateId: 'assam', districtId: 'kamrup-metro', location: { lat: 26.1800, lng: 91.7400 }, capacity: 50000, currentStock: 35000, commodities: ['MEDICINE', 'FOOD', 'EMERGENCY_SUPPLIES'], contactPhone: '+91-361-2345678' },
  { id: 'wh-2', name: 'Dibrugarh Supply Depot', stateId: 'assam', districtId: 'dibrugarh', location: { lat: 27.4728, lng: 94.9120 }, capacity: 25000, currentStock: 18000, commodities: ['FOOD', 'AGRICULTURAL_PRODUCE'], contactPhone: '+91-373-2345678' },
  { id: 'wh-3', name: 'Shillong Distribution Center', stateId: 'meghalaya', districtId: 'east-khasi-hills', location: { lat: 25.5700, lng: 91.8800 }, capacity: 20000, currentStock: 14000, commodities: ['MEDICINE', 'FOOD', 'EMERGENCY_SUPPLIES'], contactPhone: '+91-364-2345678' },
  { id: 'wh-4', name: 'Imphal Medical Warehouse', stateId: 'manipur', districtId: 'imphal-west', location: { lat: 24.8100, lng: 93.9400 }, capacity: 15000, currentStock: 8000, commodities: ['MEDICINE', 'EMERGENCY_SUPPLIES'], contactPhone: '+91-385-2345678' },
  { id: 'wh-5', name: 'Agartala Storage Facility', stateId: 'tripura', districtId: 'west-tripura', location: { lat: 23.8400, lng: 91.2800 }, capacity: 18000, currentStock: 12000, commodities: ['FOOD', 'CONSTRUCTION_MATERIAL'], contactPhone: '+91-381-2345678' },
  { id: 'wh-6', name: 'Gangtok Supply Center', stateId: 'sikkim', districtId: 'east-sikkim', location: { lat: 27.3300, lng: 88.6100 }, capacity: 10000, currentStock: 6000, commodities: ['MEDICINE', 'FOOD'], contactPhone: '+91-3592-234567' },
  { id: 'wh-7', name: 'Aizawl Emergency Depot', stateId: 'mizoram', districtId: 'aizawl-district', location: { lat: 23.7400, lng: 92.7200 }, capacity: 12000, currentStock: 7000, commodities: ['MEDICINE', 'EMERGENCY_SUPPLIES', 'FOOD'], contactPhone: '+91-389-2345678' },
  { id: 'wh-8', name: 'Silchar Logistics Hub', stateId: 'assam', districtId: 'silchar', location: { lat: 24.8200, lng: 92.7900 }, capacity: 22000, currentStock: 15000, commodities: ['FOOD', 'AGRICULTURAL_PRODUCE', 'CONSTRUCTION_MATERIAL'], contactPhone: '+91-3842-234567' },
  { id: 'wh-9', name: 'Kohima Supply Depot', stateId: 'nagaland', districtId: 'kohima-district', location: { lat: 25.6700, lng: 94.1100 }, capacity: 10000, currentStock: 5500, commodities: ['MEDICINE', 'FOOD'], contactPhone: '+91-370-2345678' },
  { id: 'wh-10', name: 'Itanagar Emergency Store', stateId: 'arunachal', districtId: 'papum-pare', location: { lat: 27.0800, lng: 93.6100 }, capacity: 8000, currentStock: 4000, commodities: ['MEDICINE', 'EMERGENCY_SUPPLIES', 'FOOD'], contactPhone: '+91-360-2345678' },
];

// ── Hospitals ───────────────────────────────────────────────
export const SEED_HOSPITALS: Hospital[] = [
  { id: 'h-1', name: 'GMCH Guwahati', stateId: 'assam', districtId: 'kamrup-metro', location: { lat: 26.1400, lng: 91.7600 }, beds: 1200, emergencyCapacity: true, contactPhone: '+91-361-2529457' },
  { id: 'h-2', name: 'Assam Medical College Hospital', stateId: 'assam', districtId: 'dibrugarh', location: { lat: 27.4600, lng: 94.8900 }, beds: 800, emergencyCapacity: true, contactPhone: '+91-373-2300080' },
  { id: 'h-3', name: 'North Eastern Indira Gandhi Medical College', stateId: 'meghalaya', districtId: 'east-khasi-hills', location: { lat: 25.5700, lng: 91.8900 }, beds: 600, emergencyCapacity: true, contactPhone: '+91-364-2224151' },
  { id: 'h-4', name: 'RIMS Imphal', stateId: 'manipur', districtId: 'imphal-west', location: { lat: 24.8200, lng: 93.9500 }, beds: 700, emergencyCapacity: true, contactPhone: '+91-385-2414625' },
  { id: 'h-5', name: 'Aizawl Civil Hospital', stateId: 'mizoram', districtId: 'aizawl-district', location: { lat: 23.7400, lng: 92.7100 }, beds: 350, emergencyCapacity: true, contactPhone: '+91-389-2341234' },
  { id: 'h-6', name: 'Naga Hospital Kohima', stateId: 'nagaland', districtId: 'kohima-district', location: { lat: 25.6600, lng: 94.1000 }, beds: 300, emergencyCapacity: true, contactPhone: '+91-370-2290100' },
  { id: 'h-7', name: 'GB Pant Hospital Agartala', stateId: 'tripura', districtId: 'west-tripura', location: { lat: 23.8400, lng: 91.2700 }, beds: 500, emergencyCapacity: true, contactPhone: '+91-381-2324567' },
  { id: 'h-8', name: 'STNM Hospital Gangtok', stateId: 'sikkim', districtId: 'east-sikkim', location: { lat: 27.3400, lng: 88.6000 }, beds: 300, emergencyCapacity: true, contactPhone: '+91-3592-222059' },
  { id: 'h-9', name: 'RK Mission Hospital Itanagar', stateId: 'arunachal', districtId: 'papum-pare', location: { lat: 27.0900, lng: 93.6000 }, beds: 200, emergencyCapacity: true, contactPhone: '+91-360-2212345' },
  { id: 'h-10', name: 'Jorhat Medical College', stateId: 'assam', districtId: 'jorhat', location: { lat: 26.7500, lng: 94.2100 }, beds: 450, emergencyCapacity: true, contactPhone: '+91-376-2370024' },
  { id: 'h-11', name: 'Silchar Medical College', stateId: 'assam', districtId: 'silchar', location: { lat: 24.8300, lng: 92.7800 }, beds: 550, emergencyCapacity: true, contactPhone: '+91-3842-230510' },
  { id: 'h-12', name: 'Tezpur Medical College', stateId: 'assam', districtId: 'sonitpur', location: { lat: 26.6300, lng: 92.8000 }, beds: 400, emergencyCapacity: true, contactPhone: '+91-3712-255123' },
];

// ── Vehicles ────────────────────────────────────────────────
export const SEED_VEHICLES: Vehicle[] = [
  { id: 'v-1', vehicleNumber: 'AS01AB1234', type: 'TRUCK', driverName: 'Ranjit Das', driverPhone: '+91-9876543210', commodity: 'MEDICINE', currentLocation: { lat: 26.1445, lng: 91.7362 }, destination: { lat: 27.5860, lng: 91.8689 }, destinationName: 'Tawang', speed: 45, heading: 30, eta: '2026-09-05T06:00:00', routePath: [], status: 'MOVING', shipmentIds: ['s-1', 's-2'], risk: 28, lastUpdated: new Date().toISOString() },
  { id: 'v-2', vehicleNumber: 'AS02CD5678', type: 'TRUCK', driverName: 'Bhaskar Deka', driverPhone: '+91-9876543211', commodity: 'FOOD', currentLocation: { lat: 26.3500, lng: 92.6800 }, destination: { lat: 27.4728, lng: 94.9120 }, destinationName: 'Dibrugarh', speed: 60, heading: 70, eta: '2026-09-04T22:00:00', routePath: [], status: 'MOVING', shipmentIds: ['s-3'], risk: 18, lastUpdated: new Date().toISOString() },
  { id: 'v-3', vehicleNumber: 'ML05EF9012', type: 'VAN', driverName: 'Pawan Rymbai', driverPhone: '+91-9876543212', commodity: 'MEDICINE', currentLocation: { lat: 25.4670, lng: 91.3662 }, destination: { lat: 25.5000, lng: 90.2167 }, destinationName: 'Tura', speed: 0, heading: 0, eta: '2026-09-05T10:00:00', routePath: [], status: 'IDLE', shipmentIds: ['s-4'], risk: 42, lastUpdated: new Date().toISOString() },
  { id: 'v-4', vehicleNumber: 'MN01GH3456', type: 'TRUCK', driverName: 'Tomba Singh', driverPhone: '+91-9876543213', commodity: 'FOOD', currentLocation: { lat: 25.3500, lng: 94.0500 }, destination: { lat: 24.8170, lng: 93.9368 }, destinationName: 'Imphal', speed: 35, heading: 180, eta: '2026-09-04T20:30:00', routePath: [], status: 'DELAYED', shipmentIds: ['s-5', 's-6'], risk: 55, lastUpdated: new Date().toISOString() },
  { id: 'v-5', vehicleNumber: 'AS01IJ7890', type: 'AMBULANCE', driverName: 'Kamal Bora', driverPhone: '+91-9876543214', commodity: 'EMERGENCY_SUPPLIES', currentLocation: { lat: 26.7509, lng: 94.2037 }, destination: { lat: 25.9065, lng: 93.7271 }, destinationName: 'Dimapur', speed: 55, heading: 210, eta: '2026-09-04T21:00:00', routePath: [], status: 'MOVING', shipmentIds: ['s-7'], risk: 35, lastUpdated: new Date().toISOString() },
  { id: 'v-6', vehicleNumber: 'TR01KL2345', type: 'TRUCK', driverName: 'Sunil Debbarma', driverPhone: '+91-9876543215', commodity: 'CONSTRUCTION_MATERIAL', currentLocation: { lat: 23.8315, lng: 91.2868 }, destination: { lat: 24.8333, lng: 92.7789 }, destinationName: 'Silchar', speed: 40, heading: 50, eta: '2026-09-05T08:00:00', routePath: [], status: 'MOVING', shipmentIds: ['s-8'], risk: 22, lastUpdated: new Date().toISOString() },
  { id: 'v-7', vehicleNumber: 'SK01MN6789', type: 'VAN', driverName: 'Tshering Sherpa', driverPhone: '+91-9876543216', commodity: 'MEDICINE', currentLocation: { lat: 27.3389, lng: 88.6065 }, destination: { lat: 27.9000, lng: 88.5500 }, destinationName: 'Mangan', speed: 30, heading: 0, eta: '2026-09-04T23:00:00', routePath: [], status: 'AT_RISK', shipmentIds: ['s-9'], risk: 72, lastUpdated: new Date().toISOString() },
  { id: 'v-8', vehicleNumber: 'MZ01OP1234', type: 'TRUCK', driverName: 'Lalthanzama', driverPhone: '+91-9876543217', commodity: 'FOOD', currentLocation: { lat: 24.3000, lng: 92.7500 }, destination: { lat: 23.7307, lng: 92.7173 }, destinationName: 'Aizawl', speed: 25, heading: 180, eta: '2026-09-05T04:00:00', routePath: [], status: 'AT_RISK', shipmentIds: ['s-10'], risk: 68, lastUpdated: new Date().toISOString() },
  { id: 'v-9', vehicleNumber: 'AS03QR5678', type: 'TANKER', driverName: 'Hemanta Kalita', driverPhone: '+91-9876543218', commodity: 'OTHER', currentLocation: { lat: 26.6338, lng: 92.7937 }, destination: { lat: 26.1445, lng: 91.7362 }, destinationName: 'Guwahati', speed: 50, heading: 250, eta: '2026-09-04T19:30:00', routePath: [], status: 'MOVING', shipmentIds: ['s-11'], risk: 15, lastUpdated: new Date().toISOString() },
  { id: 'v-10', vehicleNumber: 'NL01ST9012', type: 'PICKUP', driverName: 'Viketo Sema', driverPhone: '+91-9876543219', commodity: 'MEDICINE', currentLocation: { lat: 25.9065, lng: 93.7271 }, destination: { lat: 25.6586, lng: 94.1086 }, destinationName: 'Kohima', speed: 30, heading: 150, eta: '2026-09-04T20:00:00', routePath: [], status: 'MOVING', shipmentIds: ['s-12', 's-13'], risk: 38, lastUpdated: new Date().toISOString() },
  { id: 'v-11', vehicleNumber: 'AS04UV3456', type: 'TRUCK', driverName: 'Bipul Sharma', driverPhone: '+91-9876543220', commodity: 'FOOD', currentLocation: { lat: 26.1445, lng: 91.7362 }, destination: { lat: 25.4670, lng: 91.3662 }, destinationName: 'Shillong', speed: 55, heading: 170, eta: '2026-09-04T19:00:00', routePath: [], status: 'MOVING', shipmentIds: ['s-14'], risk: 20, lastUpdated: new Date().toISOString() },
  { id: 'v-12', vehicleNumber: 'AR01WX7890', type: 'TRUCK', driverName: 'Tage Gyadi', driverPhone: '+91-9876543221', commodity: 'EMERGENCY_SUPPLIES', currentLocation: { lat: 27.0844, lng: 93.6053 }, destination: { lat: 27.5860, lng: 91.8689 }, destinationName: 'Tawang', speed: 25, heading: 310, eta: '2026-09-05T14:00:00', routePath: [], status: 'DELAYED', shipmentIds: ['s-15'], risk: 65, lastUpdated: new Date().toISOString() },
];

// ── Shipments ───────────────────────────────────────────────
export const SEED_SHIPMENTS: Shipment[] = [
  { id: 's-1', vehicleId: 'v-1', commodity: 'MEDICINE', commodityName: 'Anti-malarial drugs', priority: 'CRITICAL', origin: 'Guwahati', originLocation: { lat: 26.1445, lng: 91.7362 }, destination: 'Tawang District Hospital', destinationLocation: { lat: 27.5860, lng: 91.8689 }, eta: '2026-09-05T06:00:00', requiredDeliveryTime: '2026-09-05T12:00:00', status: 'IN_TRANSIT', supplyCriticality: 92, weight: 500, value: 450000, createdAt: '2026-09-04T08:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-2', vehicleId: 'v-1', commodity: 'MEDICINE', commodityName: 'Vaccines (cold chain)', priority: 'CRITICAL', origin: 'Guwahati', originLocation: { lat: 26.1445, lng: 91.7362 }, destination: 'Tawang District Hospital', destinationLocation: { lat: 27.5860, lng: 91.8689 }, eta: '2026-09-05T06:00:00', requiredDeliveryTime: '2026-09-05T10:00:00', status: 'IN_TRANSIT', supplyCriticality: 95, weight: 200, value: 800000, createdAt: '2026-09-04T08:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-3', vehicleId: 'v-2', commodity: 'FOOD', commodityName: 'Rice & pulses', priority: 'HIGH', origin: 'Nagaon', originLocation: { lat: 26.3500, lng: 92.6800 }, destination: 'Dibrugarh PDS Center', destinationLocation: { lat: 27.4728, lng: 94.9120 }, eta: '2026-09-04T22:00:00', requiredDeliveryTime: '2026-09-05T06:00:00', status: 'IN_TRANSIT', supplyCriticality: 75, weight: 5000, value: 350000, createdAt: '2026-09-04T10:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-4', vehicleId: 'v-3', commodity: 'MEDICINE', commodityName: 'Emergency medical kits', priority: 'HIGH', origin: 'Shillong', originLocation: { lat: 25.4670, lng: 91.3662 }, destination: 'Tura Civil Hospital', destinationLocation: { lat: 25.5000, lng: 90.2167 }, eta: '2026-09-05T10:00:00', requiredDeliveryTime: '2026-09-05T14:00:00', status: 'PLANNED', supplyCriticality: 80, weight: 300, value: 250000, createdAt: '2026-09-04T09:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-5', vehicleId: 'v-4', commodity: 'FOOD', commodityName: 'Baby food & nutrition', priority: 'CRITICAL', origin: 'Dimapur', originLocation: { lat: 25.9065, lng: 93.7271 }, destination: 'Imphal Relief Camp', destinationLocation: { lat: 24.8170, lng: 93.9368 }, eta: '2026-09-04T20:30:00', requiredDeliveryTime: '2026-09-04T22:00:00', status: 'DELAYED', supplyCriticality: 88, weight: 2000, value: 180000, createdAt: '2026-09-04T06:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-6', vehicleId: 'v-4', commodity: 'FOOD', commodityName: 'Drinking water', priority: 'HIGH', origin: 'Dimapur', originLocation: { lat: 25.9065, lng: 93.7271 }, destination: 'Imphal Relief Camp', destinationLocation: { lat: 24.8170, lng: 93.9368 }, eta: '2026-09-04T20:30:00', requiredDeliveryTime: '2026-09-04T23:00:00', status: 'DELAYED', supplyCriticality: 82, weight: 8000, value: 40000, createdAt: '2026-09-04T06:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-7', vehicleId: 'v-5', commodity: 'EMERGENCY_SUPPLIES', commodityName: 'Blood plasma & surgical kits', priority: 'CRITICAL', origin: 'Jorhat Medical College', originLocation: { lat: 26.7509, lng: 94.2037 }, destination: 'Dimapur Civil Hospital', destinationLocation: { lat: 25.9065, lng: 93.7271 }, eta: '2026-09-04T21:00:00', requiredDeliveryTime: '2026-09-04T22:00:00', status: 'IN_TRANSIT', supplyCriticality: 96, weight: 100, value: 1200000, createdAt: '2026-09-04T14:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-8', vehicleId: 'v-6', commodity: 'CONSTRUCTION_MATERIAL', commodityName: 'Steel & cement', priority: 'NORMAL', origin: 'Agartala', originLocation: { lat: 23.8315, lng: 91.2868 }, destination: 'Silchar Road Repair', destinationLocation: { lat: 24.8333, lng: 92.7789 }, eta: '2026-09-05T08:00:00', requiredDeliveryTime: '2026-09-06T12:00:00', status: 'IN_TRANSIT', supplyCriticality: 30, weight: 15000, value: 500000, createdAt: '2026-09-04T05:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-9', vehicleId: 'v-7', commodity: 'MEDICINE', commodityName: 'Oxygen cylinders', priority: 'CRITICAL', origin: 'Gangtok', originLocation: { lat: 27.3389, lng: 88.6065 }, destination: 'Mangan Hospital', destinationLocation: { lat: 27.5100, lng: 88.5200 }, eta: '2026-09-04T23:00:00', requiredDeliveryTime: '2026-09-05T02:00:00', status: 'AT_RISK', supplyCriticality: 94, weight: 800, value: 600000, createdAt: '2026-09-04T16:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-10', vehicleId: 'v-8', commodity: 'FOOD', commodityName: 'Emergency ration kits', priority: 'HIGH', origin: 'Silchar', originLocation: { lat: 24.8333, lng: 92.7789 }, destination: 'Aizawl Distribution Center', destinationLocation: { lat: 23.7307, lng: 92.7173 }, eta: '2026-09-05T04:00:00', requiredDeliveryTime: '2026-09-05T08:00:00', status: 'AT_RISK', supplyCriticality: 78, weight: 3000, value: 220000, createdAt: '2026-09-04T12:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-11', vehicleId: 'v-9', commodity: 'OTHER', commodityName: 'Fuel tanker', priority: 'MEDIUM', origin: 'Tezpur', originLocation: { lat: 26.6338, lng: 92.7937 }, destination: 'Guwahati Fuel Depot', destinationLocation: { lat: 26.1445, lng: 91.7362 }, eta: '2026-09-04T19:30:00', requiredDeliveryTime: '2026-09-05T00:00:00', status: 'IN_TRANSIT', supplyCriticality: 50, weight: 20000, value: 900000, createdAt: '2026-09-04T14:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-12', vehicleId: 'v-10', commodity: 'MEDICINE', commodityName: 'Insulin & diabetic supplies', priority: 'CRITICAL', origin: 'Dimapur', originLocation: { lat: 25.9065, lng: 93.7271 }, destination: 'Kohima Hospital', destinationLocation: { lat: 25.6586, lng: 94.1086 }, eta: '2026-09-04T20:00:00', requiredDeliveryTime: '2026-09-04T22:00:00', status: 'IN_TRANSIT', supplyCriticality: 90, weight: 150, value: 380000, createdAt: '2026-09-04T15:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-13', vehicleId: 'v-10', commodity: 'MEDICINE', commodityName: 'Antibiotics', priority: 'HIGH', origin: 'Dimapur', originLocation: { lat: 25.9065, lng: 93.7271 }, destination: 'Kohima Hospital', destinationLocation: { lat: 25.6586, lng: 94.1086 }, eta: '2026-09-04T20:00:00', requiredDeliveryTime: '2026-09-05T06:00:00', status: 'IN_TRANSIT', supplyCriticality: 72, weight: 250, value: 150000, createdAt: '2026-09-04T15:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-14', vehicleId: 'v-11', commodity: 'FOOD', commodityName: 'PDS rice & wheat', priority: 'MEDIUM', origin: 'Guwahati', originLocation: { lat: 26.1445, lng: 91.7362 }, destination: 'Shillong PDS Center', destinationLocation: { lat: 25.4670, lng: 91.3662 }, eta: '2026-09-04T19:00:00', requiredDeliveryTime: '2026-09-05T08:00:00', status: 'IN_TRANSIT', supplyCriticality: 55, weight: 6000, value: 280000, createdAt: '2026-09-04T13:00:00', lastUpdated: new Date().toISOString() },
  { id: 's-15', vehicleId: 'v-12', commodity: 'EMERGENCY_SUPPLIES', commodityName: 'Disaster relief kits', priority: 'CRITICAL', origin: 'Itanagar', originLocation: { lat: 27.0844, lng: 93.6053 }, destination: 'Tawang Emergency Camp', destinationLocation: { lat: 27.5860, lng: 91.8689 }, eta: '2026-09-05T14:00:00', requiredDeliveryTime: '2026-09-05T18:00:00', status: 'DELAYED', supplyCriticality: 85, weight: 1500, value: 350000, createdAt: '2026-09-04T07:00:00', lastUpdated: new Date().toISOString() },
];

// ── Weather Data ────────────────────────────────────────────
export const SEED_WEATHER: WeatherData[] = [
  { id: 'w-1', districtId: 'kamrup-metro', location: { lat: 26.1445, lng: 91.7362 }, temperature: 28, humidity: 85, rainfall: 12, rainfallForecast6h: 25, rainfallForecast12h: 45, rainfallForecast24h: 68, windSpeed: 15, visibility: 8, condition: 'RAIN', updatedAt: new Date().toISOString() },
  { id: 'w-2', districtId: 'tawang', location: { lat: 27.5860, lng: 91.8689 }, temperature: 14, humidity: 92, rainfall: 35, rainfallForecast6h: 55, rainfallForecast12h: 78, rainfallForecast24h: 95, windSpeed: 25, visibility: 3, condition: 'HEAVY_RAIN', updatedAt: new Date().toISOString() },
  { id: 'w-3', districtId: 'dibrugarh', location: { lat: 27.4728, lng: 94.9120 }, temperature: 30, humidity: 78, rainfall: 5, rainfallForecast6h: 10, rainfallForecast12h: 15, rainfallForecast24h: 22, windSpeed: 10, visibility: 12, condition: 'CLOUDY', updatedAt: new Date().toISOString() },
  { id: 'w-4', districtId: 'east-khasi-hills', location: { lat: 25.4670, lng: 91.3662 }, temperature: 20, humidity: 90, rainfall: 28, rainfallForecast6h: 40, rainfallForecast12h: 55, rainfallForecast24h: 72, windSpeed: 20, visibility: 5, condition: 'HEAVY_RAIN', updatedAt: new Date().toISOString() },
  { id: 'w-5', districtId: 'imphal-west', location: { lat: 24.8170, lng: 93.9368 }, temperature: 26, humidity: 82, rainfall: 18, rainfallForecast6h: 30, rainfallForecast12h: 42, rainfallForecast24h: 58, windSpeed: 12, visibility: 7, condition: 'RAIN', updatedAt: new Date().toISOString() },
  { id: 'w-6', districtId: 'aizawl-district', location: { lat: 23.7307, lng: 92.7173 }, temperature: 22, humidity: 88, rainfall: 32, rainfallForecast6h: 48, rainfallForecast12h: 65, rainfallForecast24h: 85, windSpeed: 18, visibility: 4, condition: 'HEAVY_RAIN', updatedAt: new Date().toISOString() },
  { id: 'w-7', districtId: 'kohima-district', location: { lat: 25.6586, lng: 94.1086 }, temperature: 18, humidity: 86, rainfall: 22, rainfallForecast6h: 35, rainfallForecast12h: 50, rainfallForecast24h: 65, windSpeed: 22, visibility: 6, condition: 'RAIN', updatedAt: new Date().toISOString() },
  { id: 'w-8', districtId: 'west-tripura', location: { lat: 23.8315, lng: 91.2868 }, temperature: 31, humidity: 80, rainfall: 8, rainfallForecast6h: 15, rainfallForecast12h: 25, rainfallForecast24h: 35, windSpeed: 8, visibility: 10, condition: 'CLOUDY', updatedAt: new Date().toISOString() },
  { id: 'w-9', districtId: 'east-sikkim', location: { lat: 27.3389, lng: 88.6065 }, temperature: 16, humidity: 94, rainfall: 40, rainfallForecast6h: 60, rainfallForecast12h: 82, rainfallForecast24h: 100, windSpeed: 30, visibility: 2, condition: 'STORM', updatedAt: new Date().toISOString() },
  { id: 'w-10', districtId: 'dimapur', location: { lat: 25.9065, lng: 93.7271 }, temperature: 27, humidity: 75, rainfall: 10, rainfallForecast6h: 18, rainfallForecast12h: 28, rainfallForecast24h: 40, windSpeed: 12, visibility: 9, condition: 'RAIN', updatedAt: new Date().toISOString() },
];

// ── Incidents ───────────────────────────────────────────────
export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    type: 'LANDSLIDE',
    severity: 8,
    location: { lat: 27.3000, lng: 92.3000 },
    roadId: 'nh-15',
    roadName: 'NH-15 (Bomdila Pass)',
    districtId: 'west-kameng',
    stateId: 'arunachal',
    description: 'Catastrophic debris avalanche blocking 70% of dual-lane highway near Bomdila Pass. Long queue of stranded logistics trucks and tankers. Mountain rockface sheared 180m above road.',
    imageUrl: '/reality/landslide_aerial_reality.jpg',
    reportedBy: 'UAV-Recon-04 / Officer Tage',
    reportedAt: '2026-09-04T14:30:00',
    status: 'VERIFIED',
    droneRecon: {
      droneId: 'NER-DRONE-DELTA-9',
      altitude: 145,
      captureTime: '2026-09-04 14:28 IST',
      debrisVolume: 14500,
      blockedLengthMeters: 210,
      clearanceMachinery: ['4x CAT 320D Excavators', '2x Komatsu D85 Bulldozers', '6x Tipper Trucks'],
      alternateRoute: 'Balipara-Bhalukpong-Charduar Bypass Corridor',
      liveFeedAvailable: true,
    },
    aiAnalysis: {
      type: 'LANDSLIDE',
      severity: 8.4,
      roadBlockage: 72,
      confidence: 94,
      affectedVehicles: 8,
      affectedShipments: 4,
      estimatedClearTime: '18-24 hours',
      debrisVolume: '14,500 m³',
      clearancePhase: 'Heavy Rock Breaker Deployment',
      recommendations: [
        'Reroute critical medicine convoy via Balipara-Bhalukpong road',
        'Deploy heavy hydraulic rock breakers from Tezpur BRO Depot',
        'Maintain priority radio link with stranded convoys',
        'Establish medical shelter at Tenga transit station'
      ],
    },
  },
  {
    id: 'inc-2',
    type: 'FLOOD',
    severity: 7,
    location: { lat: 26.3500, lng: 92.6800 },
    roadId: 'nh-27',
    roadName: 'NH-27 (Nagaon Bypass)',
    districtId: 'nagaon',
    stateId: 'assam',
    description: 'Brahmaputra tributary overflow has submerged 1.2 km of highway embankment under 2.4 feet of turbulent brown water. NDRF motorized rescue boats and heavy trucks mobilized.',
    imageUrl: '/reality/flood_drone_recon.jpg',
    reportedBy: 'Assam SDRF Aerial Unit',
    reportedAt: '2026-09-04T10:00:00',
    status: 'VERIFIED',
    droneRecon: {
      droneId: 'NER-UAV-ASSAM-02',
      altitude: 120,
      captureTime: '2026-09-04 10:15 IST',
      debrisVolume: 3200,
      blockedLengthMeters: 1200,
      clearanceMachinery: ['8x NDRF Inflatable Boats', '3x High-Clearance Ashok Leyland Rescue Trucks', '2x Water Deflection Barges'],
      alternateRoute: 'Kaliabor South Bank Relief Line',
      liveFeedAvailable: true,
    },
    aiAnalysis: {
      type: 'FLOOD',
      severity: 7.5,
      roadBlockage: 48,
      confidence: 92,
      affectedVehicles: 15,
      affectedShipments: 8,
      estimatedClearTime: '12-18 hours',
      debrisVolume: 'Sediment Silt Washout',
      clearancePhase: 'Water Level Receding (0.8 cm/hr)',
      recommendations: [
        'Divert commercial freight to South Bank Corridor via Silghat',
        'Deploy inflatable motorboats for critical life-saving cargo transfer',
        'Pre-position high-wheelbase emergency tankers at Nagaon PDS depot',
        'Issue flood surge warnings to Jorhat and Golaghat dispatchers'
      ],
    },
  },
  {
    id: 'inc-3',
    type: 'ROAD_DAMAGE',
    severity: 6,
    location: { lat: 24.1000, lng: 92.7400 },
    roadId: 'nh-54',
    roadName: 'NH-54 (Silchar-Aizawl Corridor)',
    districtId: 'aizawl-district',
    stateId: 'mizoram',
    description: 'Active cliff clearance operation underway following multi-tier rockfall. Heavy excavators clearing boulders to carve single-lane bypass along river gorge.',
    imageUrl: '/reality/landslide_clearance.jpg',
    reportedBy: 'BRO Swastik Engineering Task Force',
    reportedAt: '2026-09-04T08:00:00',
    status: 'ASSIGNED',
    assignedTo: 'Border Roads Organisation (BRO)',
    droneRecon: {
      droneId: 'NER-DRONE-MIZO-01',
      altitude: 160,
      captureTime: '2026-09-04 08:30 IST',
      debrisVolume: 8900,
      blockedLengthMeters: 90,
      clearanceMachinery: ['3x Tracked Excavators', '1x Crawler Dozer', '2x Controlled Blast Teams'],
      alternateRoute: 'Kolasib-Bairabi Alternate Mountain Loop',
      liveFeedAvailable: true,
    },
    aiAnalysis: {
      type: 'ROAD_DAMAGE',
      severity: 6.2,
      roadBlockage: 35,
      confidence: 89,
      affectedVehicles: 6,
      affectedShipments: 3,
      estimatedClearTime: '8-12 hours for single lane',
      debrisVolume: '8,900 m³ Granite/Shale',
      clearancePhase: 'Phase 2: Boulder Splitting & Single-Lane Escort',
      recommendations: [
        'Enforce pilot vehicle convoy escort at 15 km/h limit',
        'Priority transit for essential food & liquid medical oxygen trucks',
        'Coordinate seismic slope sensor alerts with Kolasib control room'
      ],
    },
  },
  {
    id: 'inc-4',
    type: 'BRIDGE_DAMAGE',
    severity: 9,
    location: { lat: 24.5500, lng: 93.3000 },
    roadId: 'nh-36',
    roadName: 'NH-36 (Jiri River Bridge)',
    districtId: 'churachandpur',
    stateId: 'manipur',
    description: 'High-resolution satellite InSAR radar shows 14mm displacement on Pier #3 following river scouring. Load capacity de-rated from 40t to 10t.',
    imageUrl: '/reality/convoy_satellite_twin.jpg',
    reportedBy: 'ISRO Satellite InSAR / Bridge Inspector Tomba',
    reportedAt: '2026-09-04T06:00:00',
    status: 'VERIFIED',
    droneRecon: {
      droneId: 'NER-SAT-RADAR-RISAT',
      altitude: 540000,
      captureTime: '2026-09-04 06:12 IST',
      blockedLengthMeters: 140,
      clearanceMachinery: ['Pontoon Bridge Unit (Indian Army Engineers)', 'Pier Strengthening Crane'],
      alternateRoute: 'NH-37 Imphal-Dimapur Corridor',
      liveFeedAvailable: true,
    },
    aiAnalysis: {
      type: 'BRIDGE_DAMAGE',
      severity: 9.3,
      roadBlockage: 85,
      confidence: 96,
      affectedVehicles: 12,
      affectedShipments: 7,
      estimatedClearTime: '48-72 hours',
      debrisVolume: 'Sub-surface Foundation Scour',
      clearancePhase: 'Structural Grouting & Army Pontoon Setup',
      recommendations: [
        'Total ban on multi-axle freight vehicles over Jiri span',
        'Reroute heavy petroleum tankers via NH-37 Silchar-Imphal route',
        'Army engineers deploying 120ft Bailey Pontoon bypass within 14h'
      ],
    },
  },
  {
    id: 'inc-5',
    type: 'TRAFFIC',
    severity: 4,
    location: { lat: 25.9400, lng: 91.7600 },
    roadId: 'nh-6',
    roadName: 'NH-6 (Nongpoh Bottleneck)',
    districtId: 'ri-bhoi',
    stateId: 'meghalaya',
    description: 'Heavy traffic congestion near Nongpoh due to heavy weekend logistics transit and highway widening. 3.8 km crawl speed.',
    imageUrl: '/reality/convoy_satellite_twin.jpg',
    reportedBy: 'Meghalaya Traffic Police Ri-Bhoi',
    reportedAt: '2026-09-04T12:00:00',
    status: 'REPORTED',
    aiAnalysis: {
      type: 'TRAFFIC',
      severity: 4.2,
      roadBlockage: 18,
      confidence: 91,
      affectedVehicles: 25,
      affectedShipments: 10,
      estimatedClearTime: '3-5 hours',
      clearancePhase: 'Contraflow Lane Open',
      recommendations: [
        'Divert Guwahati-Shillong light traffic via Umroi scenic loop',
        'Hold non-perishable freight at Byrnihat checkgate to ease pulse',
        'Expected to save 45 minutes for emergency vehicles'
      ],
    },
  },
];

// ── Alerts ──────────────────────────────────────────────────
export const SEED_ALERTS: Alert[] = [
  { id: 'al-1', level: 'CRITICAL', title: 'NH-15 Landslide - Road 70% Blocked', message: 'Major landslide near Bomdila on NH-15. 8 vehicles and 4 critical shipments affected. AI recommends immediate rerouting via Balipara-Bhalukpong road.', category: 'INCIDENT', roadId: 'nh-15', status: 'ACTIVE', createdAt: '2026-09-04T14:35:00', aiRecommendation: 'Reroute all Tawang-bound vehicles via Balipara. Prioritize medicine shipments s-1 and s-2.' },
  { id: 'al-2', level: 'HIGH', title: 'NH-27 Flood Warning - Nagaon', message: 'Road submerged near Nagaon. 15 vehicles affected. Brahmaputra water level rising. Supply delivery to eastern Assam delayed.', category: 'WEATHER', roadId: 'nh-27', status: 'ACKNOWLEDGED', createdAt: '2026-09-04T10:05:00', acknowledgedAt: '2026-09-04T10:15:00', acknowledgedBy: 'State Admin Assam', aiRecommendation: 'Activate south bank emergency corridor. Deploy ferry service for critical cargo.' },
  { id: 'al-3', level: 'CRITICAL', title: 'Jiri Bridge Structural Damage', message: 'Bridge showing structural cracks on NH-36. Load capacity compromised. 12 vehicles and 7 shipments at risk. Bridge closure recommended.', category: 'INFRASTRUCTURE', roadId: 'nh-36', status: 'ACTIVE', createdAt: '2026-09-04T06:15:00', aiRecommendation: 'Close bridge to heavy vehicles immediately. Reroute via NH-37 corridor. Emergency structural assessment needed within 24h.' },
  { id: 'al-4', level: 'HIGH', title: 'Medicine Supply at Risk - Tawang', message: 'Critical medicine shipments s-1 and s-2 delayed due to NH-15 landslide. Tawang hospital stock critically low. ETA extended by 8+ hours.', category: 'SUPPLY', shipmentId: 's-1', status: 'ACTIVE', createdAt: '2026-09-04T14:40:00', aiRecommendation: 'Airlift option recommended. Alternatively, source from nearest available stock at Tezpur.' },
  { id: 'al-5', level: 'MEDIUM', title: 'Sikkim Storm Warning', message: 'Heavy storm predicted for East Sikkim in next 6 hours. NH-10 risk increasing. Gangtok-Mangan route may be affected.', category: 'WEATHER', districtId: 'east-sikkim', status: 'ACTIVE', createdAt: '2026-09-04T16:00:00', aiRecommendation: 'Expedite all Sikkim-bound deliveries. Pre-position emergency supplies. Alert North Sikkim authorities.' },
  { id: 'al-6', level: 'HIGH', title: 'NH-54 Road Deterioration', message: 'Silchar-Aizawl highway condition worsening. Risk score increased from 45 to 68. 6 vehicles on route.', category: 'INFRASTRUCTURE', roadId: 'nh-54', status: 'ACTIVE', createdAt: '2026-09-04T08:20:00', aiRecommendation: 'Reduce speed limit. Consider delaying non-critical shipments. Monitor road condition hourly.' },
  { id: 'al-7', level: 'CRITICAL', title: 'Oxygen Supply Critical - Mangan', message: 'Vehicle v-7 carrying oxygen cylinders to Mangan Hospital is at risk. Route risk 72%. Hospital stock at 15% capacity.', category: 'SUPPLY', vehicleId: 'v-7', shipmentId: 's-9', status: 'ACTIVE', createdAt: '2026-09-04T16:15:00', aiRecommendation: 'Priority escort for vehicle v-7. Prepare helicopter backup. Alert nearest military base.' },
  { id: 'al-8', level: 'LOW', title: 'Traffic Advisory - Nongpoh', message: 'Heavy traffic on NH-6 near Nongpoh. Expected clearance in 4-6 hours. Minor delays for Guwahati-Shillong traffic.', category: 'TRAFFIC', roadId: 'nh-6', status: 'ACKNOWLEDGED', createdAt: '2026-09-04T12:10:00', acknowledgedAt: '2026-09-04T12:20:00', acknowledgedBy: 'District Officer Ri-Bhoi', aiRecommendation: 'Use Umroi alternate route. Expected to save 45 minutes during peak hours.' },
];

// Helper to get a color for road risk on the map
export function getRoadColor(road: Road): string {
  if (road.status === 'BLOCKED') return '#dc2626';
  if (road.status === 'CRITICAL') return '#ef4444';
  const risk = road.currentRisk?.currentRisk ?? 0;
  if (risk <= 20) return '#22c55e';
  if (risk <= 40) return '#84cc16';
  if (risk <= 60) return '#eab308';
  if (risk <= 80) return '#f97316';
  return '#ef4444';
}
