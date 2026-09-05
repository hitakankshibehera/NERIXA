// ============================================================
// NER-SHIELD AI — What-If Emergency Simulator
// ============================================================

import type {
  Road, Vehicle, Shipment, RiskPrediction,
  SimulationScenario, SimulationResult, ActionPlanItem,
  SimulationMapState, RoadStatus
} from '@/lib/types';
import { WeightedRiskModel } from './risk-engine';
import { calculateSupplyImpact } from './supply-impact-engine';
import type { WeatherData } from '@/lib/types';
import { getRiskLevel } from '@/lib/constants';

const riskModel = new WeightedRiskModel();

// Apply a scenario to create modified state
function applyScenario(
  scenario: SimulationScenario,
  roads: Road[],
  weatherData: Map<string, WeatherData>
): { modifiedRoads: Road[]; modifiedWeather: Map<string, WeatherData> } {
  const modifiedRoads = roads.map(r => ({ ...r }));
  const modifiedWeather = new Map(weatherData);

  switch (scenario.type) {
    case 'ROAD_CLOSURE': {
      const road = modifiedRoads.find(r => r.id === scenario.roadId);
      if (road) {
        road.status = 'BLOCKED';
        road.condition = 'VERY_POOR';
        road.trafficLevel = 'CONGESTED';
      }
      break;
    }
    case 'BRIDGE_FAILURE': {
      // Find road containing bridge and block it
      const road = modifiedRoads.find(r => r.bridgeIds.includes(scenario.bridgeId || ''));
      if (road) {
        road.status = 'BLOCKED';
        road.condition = 'VERY_POOR';
      }
      break;
    }
    case 'HEAVY_RAINFALL': {
      // Increase rainfall for all districts near the target road
      const targetRoad = modifiedRoads.find(r => r.id === scenario.roadId);
      if (targetRoad) {
        for (const districtId of targetRoad.districtIds) {
          const existing = modifiedWeather.get(districtId);
          if (existing) {
            const rainfallMultiplier = 1 + (scenario.severity / 10) * 3;
            modifiedWeather.set(districtId, {
              ...existing,
              rainfall: existing.rainfall * rainfallMultiplier,
              rainfallForecast6h: existing.rainfallForecast6h * rainfallMultiplier,
              rainfallForecast12h: existing.rainfallForecast12h * rainfallMultiplier,
              rainfallForecast24h: existing.rainfallForecast24h * rainfallMultiplier,
              condition: 'HEAVY_RAIN',
              windSpeed: existing.windSpeed * 1.5,
              visibility: Math.max(existing.visibility * 0.3, 1),
            });
          }
        }
      }
      break;
    }
    case 'FLOOD': {
      const road = modifiedRoads.find(r => r.id === scenario.roadId);
      if (road) {
        road.status = scenario.severity > 7 ? 'BLOCKED' : 'PARTIALLY_BLOCKED';
        road.condition = 'VERY_POOR';
        road.riverProximity = 0;
      }
      break;
    }
    case 'LANDSLIDE': {
      const road = modifiedRoads.find(r => r.id === scenario.roadId);
      if (road) {
        road.status = 'BLOCKED';
        road.condition = 'VERY_POOR';
        road.historicalLandslides += 1;
      }
      break;
    }
    case 'MULTIPLE_DISRUPTIONS': {
      // Apply a combination — block the target road and increase weather severity
      const road = modifiedRoads.find(r => r.id === scenario.roadId);
      if (road) {
        road.status = 'BLOCKED';
        road.condition = 'VERY_POOR';
      }
      break;
    }
  }

  return { modifiedRoads, modifiedWeather };
}

// Generate action plan based on impact
function generateActionPlan(
  scenario: SimulationScenario,
  affectedVehicles: Vehicle[],
  criticalShipments: Shipment[],
  roads: Road[]
): ActionPlanItem[] {
  const plan: ActionPlanItem[] = [];
  let priority = 1;

  // Reroute affected vehicles
  if (affectedVehicles.length > 0) {
    plan.push({
      priority: priority++,
      action: `Reroute ${affectedVehicles.length} affected vehicles`,
      details: `Vehicles on the affected road segment need to be redirected to alternate routes. Use AI Route Optimizer to find safest alternatives.`,
      status: 'PENDING',
    });
  }

  // Prioritize critical shipments
  if (criticalShipments.length > 0) {
    const medicineCount = criticalShipments.filter(s => s.commodity === 'MEDICINE').length;
    const foodCount = criticalShipments.filter(s => s.commodity === 'FOOD').length;
    plan.push({
      priority: priority++,
      action: `Prioritize ${criticalShipments.length} critical shipments`,
      details: `${medicineCount} medicine, ${foodCount} food shipments require immediate priority rerouting. Ensure cold chain integrity for vaccines.`,
      status: 'PENDING',
    });
  }

  // Deploy from nearest warehouse
  plan.push({
    priority: priority++,
    action: 'Deploy backup vehicles from nearest warehouse',
    details: 'Activate contingency fleet from the closest operational warehouse to supplement disrupted deliveries.',
    status: 'PENDING',
  });

  // Use emergency corridor
  const corridorRoad = roads.find(r => 
    r.status === 'OPEN' && r.id !== scenario.roadId
  );
  if (corridorRoad) {
    plan.push({
      priority: priority++,
      action: `Use Emergency Corridor — ${corridorRoad.number}`,
      details: `${corridorRoad.name} is currently open with acceptable risk. Can serve as alternate route.`,
      status: 'PENDING',
    });
  }

  // Alert district officers
  plan.push({
    priority: priority++,
    action: 'Alert District Officers & Emergency Services',
    details: 'Send notifications to all affected district officers. Activate emergency response protocol.',
    status: 'PENDING',
  });

  // If bridge failure, add structural assessment
  if (scenario.type === 'BRIDGE_FAILURE') {
    plan.push({
      priority: priority++,
      action: 'Deploy structural assessment team',
      details: 'Request immediate bridge inspection by qualified structural engineers. Restrict all heavy vehicle movement.',
      status: 'PENDING',
    });
  }

  return plan;
}

// Run simulation
export function runSimulation(
  scenario: SimulationScenario,
  roads: Road[],
  vehicles: Vehicle[],
  shipments: Shipment[],
  weatherData: Map<string, WeatherData>,
  predictions: Map<string, RiskPrediction>,
  userId: string
): SimulationResult {
  // Capture before state
  const beforeRoadStatuses: Record<string, RoadStatus> = {};
  const beforeRoadRisks: Record<string, number> = {};
  const vehiclePositions: Record<string, { lat: number; lng: number }> = {};

  for (const road of roads) {
    beforeRoadStatuses[road.id] = road.status;
    beforeRoadRisks[road.id] = predictions.get(road.id)?.currentRisk ?? 0;
  }
  for (const v of vehicles) {
    vehiclePositions[v.id] = v.currentLocation;
  }

  const beforeState: SimulationMapState = {
    roadStatuses: { ...beforeRoadStatuses },
    roadRisks: { ...beforeRoadRisks },
    vehiclePositions: { ...vehiclePositions },
    affectedRoadIds: [],
  };

  // Apply scenario
  const { modifiedRoads, modifiedWeather } = applyScenario(scenario, roads, weatherData);

  // Recalculate risks
  const afterRoadStatuses: Record<string, RoadStatus> = {};
  const afterRoadRisks: Record<string, number> = {};
  const affectedRoadIds: string[] = [];

  for (const road of modifiedRoads) {
    afterRoadStatuses[road.id] = road.status;
    
    const weather = road.districtIds
      .map(d => modifiedWeather.get(d))
      .find(w => w != null) ?? null;
    
    const newPrediction = riskModel.predict(road, weather);
    afterRoadRisks[road.id] = newPrediction.currentRisk;

    if (afterRoadRisks[road.id] > beforeRoadRisks[road.id] + 10 ||
        afterRoadStatuses[road.id] !== beforeRoadStatuses[road.id]) {
      affectedRoadIds.push(road.id);
    }
  }

  const afterState: SimulationMapState = {
    roadStatuses: afterRoadStatuses,
    roadRisks: afterRoadRisks,
    vehiclePositions: { ...vehiclePositions },
    affectedRoadIds,
  };

  // Calculate supply impact on the primary road
  const targetRoad = modifiedRoads.find(r => r.id === scenario.roadId);
  let affectedVehiclesList: Vehicle[] = [];
  let affectedShipmentsList: Shipment[] = [];
  let criticalShipmentsList: Shipment[] = [];
  let expectedDelay = 0;
  let additionalDistance = 0;
  let estimatedCost = 0;

  if (targetRoad) {
    const targetPrediction = riskModel.predict(targetRoad, null);
    const impact = calculateSupplyImpact(targetRoad, targetPrediction, vehicles, shipments);
    affectedVehiclesList = impact.affectedVehicles;
    affectedShipmentsList = impact.affectedShipments;
    criticalShipmentsList = impact.criticalShipments;
    expectedDelay = impact.expectedDelay;
    
    // Calculate additional distance for detour
    additionalDistance = Math.round(targetRoad.length * 0.6 * affectedVehiclesList.length);
    estimatedCost = impact.estimatedAdditionalCost;
  }

  // Find affected districts
  const affectedDistrictIds = new Set<string>();
  for (const roadId of affectedRoadIds) {
    const road = modifiedRoads.find(r => r.id === roadId);
    if (road) {
      road.districtIds.forEach(d => affectedDistrictIds.add(d));
    }
  }

  // Determine supply shortage risk
  const shortageRisk = criticalShipmentsList.length > 5 ? 'CRITICAL' :
                       criticalShipmentsList.length > 3 ? 'HIGH' :
                       criticalShipmentsList.length > 1 ? 'MODERATE' :
                       criticalShipmentsList.length > 0 ? 'LOW' : 'SAFE';

  // Generate action plan
  const actionPlan = generateActionPlan(scenario, affectedVehiclesList, criticalShipmentsList, roads);

  return {
    id: `sim-${Date.now()}`,
    scenario,
    affectedDistricts: affectedDistrictIds.size,
    affectedDistrictNames: Array.from(affectedDistrictIds),
    affectedVehicles: affectedVehiclesList.length,
    affectedShipments: affectedShipmentsList.length,
    criticalShipments: criticalShipmentsList.length,
    expectedDelay,
    additionalDistance,
    estimatedAdditionalCost: estimatedCost,
    supplyShortageRisk: shortageRisk,
    actionPlan,
    beforeState,
    afterState,
    runAt: new Date().toISOString(),
    runBy: userId,
  };
}
