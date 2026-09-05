// ============================================================
// NERIXA — Spatial Incident Analysis & Road Matching Engine
// Implements geometric road matching, vehicle trajectory analysis,
// and shipment risk evaluation (Section 12 & 13)
// ============================================================

import { GeoPoint, Road, Vehicle, Shipment, Hospital, Warehouse, Incident, SpatialIncidentImpact } from '@/lib/types';

// Earth radius in km
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates accurate Haversine distance between two coordinates in km
 */
export function haversineDistanceKm(p1: GeoPoint, p2: GeoPoint): number {
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculates cross-track perpendicular distance from point P to line segment AB in km
 */
export function distanceToSegmentKm(p: GeoPoint, a: GeoPoint, b: GeoPoint): number {
  const l2 = Math.pow(b.lat - a.lat, 2) + Math.pow(b.lng - a.lng, 2);
  if (l2 === 0) return haversineDistanceKm(p, a);

  // Projection scalar t on segment AB
  let t = ((p.lat - a.lat) * (b.lat - a.lat) + (p.lng - a.lng) * (b.lng - a.lng)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection: GeoPoint = {
    lat: a.lat + t * (b.lat - a.lat),
    lng: a.lng + t * (b.lng - a.lng),
  };

  return haversineDistanceKm(p, projection);
}

/**
 * Calculates minimum distance from a point to a polyline path
 */
export function distanceToPolylineKm(point: GeoPoint, path: GeoPoint[]): number {
  if (!path || path.length === 0) return Infinity;
  if (path.length === 1) return haversineDistanceKm(point, path[0]);

  let minDistance = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const dist = distanceToSegmentKm(point, path[i], path[i + 1]);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}

/**
 * Calculates initial bearing from p1 to p2 in degrees (0 - 360)
 */
export function calculateBearing(p1: GeoPoint, p2: GeoPoint): number {
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Checks whether a vehicle with current heading is moving towards the hazard
 */
export function isVehicleApproaching(vehicleLoc: GeoPoint, vehicleHeading: number, hazardLoc: GeoPoint): boolean {
  const bearingToHazard = calculateBearing(vehicleLoc, hazardLoc);
  const diff = Math.abs(vehicleHeading - bearingToHazard);
  const angleDiff = diff > 180 ? 360 - diff : diff;
  // If heading within 65 degrees of the bearing to the hazard, it is approaching
  return angleDiff < 65;
}

/**
 * Matches an incident coordinate to the closest road using actual road geometry
 */
export function matchIncidentToRoad(
  incidentLoc: GeoPoint,
  roads: Road[],
  toleranceKm: number = 3.5
): { matchedRoad: Road | null; distanceKm: number } {
  let closestRoad: Road | null = null;
  let minDistance = Infinity;

  for (const road of roads) {
    const dist = distanceToPolylineKm(incidentLoc, road.path);
    if (dist < minDistance) {
      minDistance = dist;
      closestRoad = road;
    }
  }

  if (closestRoad && minDistance <= toleranceKm) {
    return { matchedRoad: closestRoad, distanceKm: minDistance };
  }

  return { matchedRoad: closestRoad, distanceKm: minDistance };
}

/**
 * Executes full spatial impact analysis for an incident (Section 12)
 */
export function analyzeSpatialIncidentImpact(
  incident: Incident,
  roads: Road[],
  vehicles: Vehicle[],
  shipments: Shipment[],
  hospitals: Hospital[],
  warehouses: Warehouse[]
): SpatialIncidentImpact {
  // 1. Match to actual road geometry
  const { matchedRoad, distanceKm } = matchIncidentToRoad(incident.location, roads);
  const affectedRoadIds: string[] = [];

  if (matchedRoad) {
    affectedRoadIds.push(matchedRoad.id);
  }

  // Also include roads whose geometries pass within 5 km of the hazard
  roads.forEach((road) => {
    if (road.id !== matchedRoad?.id) {
      const dist = distanceToPolylineKm(incident.location, road.path);
      if (dist <= 5.0) {
        affectedRoadIds.push(road.id);
      }
    }
  });

  // 2. Identify approaching vehicles and vehicles in affected zones
  const affectedVehicles: SpatialIncidentImpact['affectedVehicles'] = [];

  for (const vehicle of vehicles) {
    const distToHazard = haversineDistanceKm(vehicle.currentLocation, incident.location);
    const approaching = isVehicleApproaching(vehicle.currentLocation, vehicle.heading, incident.location);

    // Vehicle is affected if within 35 km and approaching, or within 10 km regardless of heading
    if ((distToHazard <= 35 && approaching) || distToHazard <= 10) {
      const speedKmH = Math.max(15, vehicle.speed || 30);
      const estTimeMinutes = Math.round((distToHazard / speedKmH) * 60);

      affectedVehicles.push({
        vehicleId: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        driverName: vehicle.driverName,
        distanceToHazardKm: Math.round(distToHazard * 10) / 10,
        isApproaching: approaching,
        estimatedTimeToHazardMinutes: estTimeMinutes,
      });
    }
  }

  // Sort by urgency (approaching first, then closest)
  affectedVehicles.sort((a, b) => {
    if (a.isApproaching && !b.isApproaching) return -1;
    if (!a.isApproaching && b.isApproaching) return 1;
    return a.distanceToHazardKm - b.distanceToHazardKm;
  });

  // 3. Identify shipments using affected roads or vehicles
  const affectedVehicleIds = new Set(affectedVehicles.map((v) => v.vehicleId));
  const affectedShipments: SpatialIncidentImpact['affectedShipments'] = [];

  for (const shipment of shipments) {
    if (affectedVehicleIds.has(shipment.vehicleId)) {
      affectedShipments.push({
        shipmentId: shipment.id,
        commodityName: shipment.commodityName,
        priority: shipment.priority,
        supplyCriticality: shipment.supplyCriticality,
        vehicleId: shipment.vehicleId,
      });
    }
  }

  // 4. Identify critical hospitals / warehouses along hazard corridor (< 25km)
  const affectedCriticalFacilities: SpatialIncidentImpact['affectedCriticalFacilities'] = [];

  for (const hospital of hospitals) {
    const d = haversineDistanceKm(incident.location, hospital.location);
    if (d <= 25) {
      affectedCriticalFacilities.push({
        type: 'HOSPITAL',
        name: hospital.name,
        distanceKm: Math.round(d * 10) / 10,
      });
    }
  }

  for (const warehouse of warehouses) {
    const d = haversineDistanceKm(incident.location, warehouse.location);
    if (d <= 20) {
      affectedCriticalFacilities.push({
        type: 'WAREHOUSE',
        name: warehouse.name,
        distanceKm: Math.round(d * 10) / 10,
      });
    }
  }

  // 5. Calculate explainable risk score delta
  const baseDelta = incident.severity * 5; // e.g., severity 8 = +40
  const blockageWeight = ((incident.roadBlockagePercent || 50) / 100) * 20;
  const criticalShipmentMultiplier = affectedShipments.some((s) => s.priority === 'CRITICAL') ? 1.25 : 1.0;
  const riskScoreDelta = Math.min(65, Math.round((baseDelta + blockageWeight) * criticalShipmentMultiplier));

  let recommendedAction = 'Monitor hazard zone and notify approaching transport dispatch.';
  if (incident.severity >= 7 || (incident.roadBlockagePercent && incident.roadBlockagePercent >= 60)) {
    recommendedAction = `IMMEDIATE REROUTE MANDATORY: Highway blocked ${incident.roadBlockagePercent || 70}%. Dispatch emergency reroute orders to ${affectedVehicles.length} vehicles.`;
  }

  return {
    incidentId: incident.id,
    hazardType: incident.type,
    matchedRoadId: matchedRoad?.id,
    matchedRoadName: matchedRoad?.name || 'Corridor Highway',
    affectedRoadIds,
    affectedVehicles,
    affectedShipments,
    affectedCriticalFacilities,
    riskScoreDelta,
    recommendedAction,
  };
}
