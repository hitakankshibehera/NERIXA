// ============================================================
// NER-SHIELD AI — Supply Impact Engine
// Links Road → Vehicle → Shipment → Supply Risk
// ============================================================

import type { Road, Vehicle, Shipment, RiskPrediction, GeoPoint } from '@/lib/types';
import { PRIORITY_CONFIG } from '@/lib/constants';

export interface SupplyImpact {
  affectedVehicles: Vehicle[];
  affectedShipments: Shipment[];
  criticalShipments: Shipment[];
  medicineShipments: Shipment[];
  foodShipments: Shipment[];
  emergencyShipments: Shipment[];
  expectedDelay: number; // hours
  supplyShortageProb: number; // 0-100
  estimatedAdditionalCost: number; // INR
  impactByPriority: Record<string, number>;
  impactByCommodity: Record<string, number>;
}

// Check if a vehicle's route passes through or near a road
function vehicleUsesRoad(vehicle: Vehicle, road: Road): boolean {
  if (!vehicle.routePath || vehicle.routePath.length === 0) {
    // Check if vehicle is near any road point
    return road.path.some(rp => 
      getDistanceKm(vehicle.currentLocation, rp) < 30
    );
  }
  // Check route overlap
  return vehicle.routePath.some(vp =>
    road.path.some(rp => getDistanceKm(vp, rp) < 15)
  );
}

function getDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Calculate supply impact for a road risk change
export function calculateSupplyImpact(
  road: Road,
  riskPrediction: RiskPrediction,
  vehicles: Vehicle[],
  shipments: Shipment[]
): SupplyImpact {
  // Find vehicles on or near this road
  const affectedVehicles = vehicles.filter(v => {
    if (v.status === 'DELIVERED') return false;
    return vehicleUsesRoad(v, road);
  });

  const affectedVehicleIds = new Set(affectedVehicles.map(v => v.id));

  // Find shipments on affected vehicles
  const affectedShipments = shipments.filter(s => 
    affectedVehicleIds.has(s.vehicleId) && s.status !== 'DELIVERED' && s.status !== 'CANCELLED'
  );

  // Critical shipments
  const criticalShipments = affectedShipments.filter(s => 
    s.priority === 'CRITICAL' || s.supplyCriticality > 80
  );

  // By commodity type
  const medicineShipments = affectedShipments.filter(s => s.commodity === 'MEDICINE');
  const foodShipments = affectedShipments.filter(s => s.commodity === 'FOOD');
  const emergencyShipments = affectedShipments.filter(s => s.commodity === 'EMERGENCY_SUPPLIES');

  // Calculate expected delay based on risk
  const riskFactor = riskPrediction.currentRisk / 100;
  const baseDelay = road.status === 'BLOCKED' ? 12 : riskFactor * 8;
  const expectedDelay = Math.round(baseDelay * 10) / 10;

  // Supply shortage probability
  const criticalRatio = criticalShipments.length / Math.max(affectedShipments.length, 1);
  const supplyShortageProb = Math.min(
    Math.round(riskFactor * 60 + criticalRatio * 30 + (expectedDelay > 6 ? 10 : 0)),
    100
  );

  // Cost estimation (simplified)
  const fuelCostPerKm = 12; // INR
  const detourMultiplier = riskFactor * 0.5 + 0.1;
  const avgDetourKm = road.length * detourMultiplier;
  const estimatedAdditionalCost = Math.round(
    avgDetourKm * fuelCostPerKm * affectedVehicles.length +
    expectedDelay * 500 * affectedVehicles.length // hourly cost per vehicle
  );

  // Impact by priority
  const impactByPriority: Record<string, number> = {};
  for (const p of Object.keys(PRIORITY_CONFIG)) {
    impactByPriority[p] = affectedShipments.filter(s => s.priority === p).length;
  }

  // Impact by commodity
  const impactByCommodity: Record<string, number> = {};
  for (const s of affectedShipments) {
    impactByCommodity[s.commodity] = (impactByCommodity[s.commodity] || 0) + 1;
  }

  return {
    affectedVehicles,
    affectedShipments,
    criticalShipments,
    medicineShipments,
    foodShipments,
    emergencyShipments,
    expectedDelay,
    supplyShortageProb,
    estimatedAdditionalCost,
    impactByPriority,
    impactByCommodity,
  };
}

// Recalculate impact for all roads
export function calculateTotalImpact(
  roads: Road[],
  predictions: Map<string, RiskPrediction>,
  vehicles: Vehicle[],
  shipments: Shipment[]
): {
  totalAffectedVehicles: number;
  totalAffectedShipments: number;
  totalCriticalShipments: number;
  totalExpectedDelay: number;
  totalShortageProb: number;
  roadImpacts: Map<string, SupplyImpact>;
} {
  const roadImpacts = new Map<string, SupplyImpact>();
  const affectedVehicleSet = new Set<string>();
  const affectedShipmentSet = new Set<string>();
  const criticalShipmentSet = new Set<string>();
  let maxDelay = 0;
  let maxShortage = 0;

  for (const road of roads) {
    const prediction = predictions.get(road.id);
    if (!prediction || prediction.currentRisk <= 40) continue;

    const impact = calculateSupplyImpact(road, prediction, vehicles, shipments);
    roadImpacts.set(road.id, impact);

    impact.affectedVehicles.forEach(v => affectedVehicleSet.add(v.id));
    impact.affectedShipments.forEach(s => affectedShipmentSet.add(s.id));
    impact.criticalShipments.forEach(s => criticalShipmentSet.add(s.id));
    maxDelay = Math.max(maxDelay, impact.expectedDelay);
    maxShortage = Math.max(maxShortage, impact.supplyShortageProb);
  }

  return {
    totalAffectedVehicles: affectedVehicleSet.size,
    totalAffectedShipments: affectedShipmentSet.size,
    totalCriticalShipments: criticalShipmentSet.size,
    totalExpectedDelay: maxDelay,
    totalShortageProb: maxShortage,
    roadImpacts,
  };
}
