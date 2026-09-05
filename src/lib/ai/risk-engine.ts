// ============================================================
// NER-SHIELD AI — AI Risk Prediction Engine
// Explainable weighted model with pluggable architecture
// ============================================================

import type { Road, WeatherData, RiskPrediction, RiskFactor, RiskWeights } from '@/lib/types';
import { getRiskLevel, DEFAULT_RISK_WEIGHTS } from '@/lib/constants';

// --- Risk Model Interface (for future ML model replacement) ---
export interface IRiskModel {
  predict(road: Road, weather: WeatherData | null, weights?: RiskWeights): RiskPrediction;
}

// --- Factor Normalization (0-1 scale) ---
function normalizeRainfall(mm: number): number {
  return Math.min(mm / 100, 1); // 100mm = max risk
}

function normalizeTemperature(temp: number): number {
  // Extreme temps (< 0 or > 40) increase risk
  if (temp < 0) return Math.min(Math.abs(temp) / 20, 1);
  if (temp > 35) return Math.min((temp - 35) / 15, 1);
  return 0;
}

function normalizeSlope(degrees: number): number {
  return Math.min(degrees / 30, 1); // 30° = max risk
}

function normalizeElevation(meters: number): number {
  return Math.min(meters / 4000, 1); // 4000m = max risk
}

function normalizeRiverProximity(km: number): number {
  if (km <= 0.5) return 1;
  if (km >= 10) return 0;
  return 1 - (km / 10);
}

function normalizeRoadCondition(condition: Road['condition']): number {
  const map = { EXCELLENT: 0, GOOD: 0.15, FAIR: 0.4, POOR: 0.7, VERY_POOR: 1 };
  return map[condition] ?? 0.5;
}

function normalizeTraffic(level: Road['trafficLevel']): number {
  const map = { LOW: 0.1, MODERATE: 0.35, HEAVY: 0.65, CONGESTED: 1 };
  return map[level] ?? 0.35;
}

function normalizeHistoricalEvents(count: number, maxExpected: number = 50): number {
  return Math.min(count / maxExpected, 1);
}

function normalizeBridgeCondition(condition: string): number {
  const map: Record<string, number> = { EXCELLENT: 0, GOOD: 0.15, FAIR: 0.4, POOR: 0.7, CRITICAL: 1 };
  return map[condition] ?? 0.5;
}

function normalizeWindSpeed(kmh: number): number {
  return Math.min(kmh / 80, 1); // 80 km/h = max risk
}

// --- Weighted Risk Model ---
export class WeightedRiskModel implements IRiskModel {
  predict(road: Road, weather: WeatherData | null, weights: RiskWeights = DEFAULT_RISK_WEIGHTS): RiskPrediction {
    const factors: RiskFactor[] = [];
    
    // ── Weather Factors ──
    const rainfallNorm = weather ? normalizeRainfall(weather.rainfall) : 0.2;
    const tempNorm = weather ? normalizeTemperature(weather.temperature) : 0;
    const windNorm = weather ? normalizeWindSpeed(weather.windSpeed) : 0.1;
    const weatherConditionBonus = weather?.condition === 'HEAVY_RAIN' ? 0.3 :
                                  weather?.condition === 'STORM' ? 0.5 :
                                  weather?.condition === 'RAIN' ? 0.15 : 0;
    
    const weatherScore = Math.min((rainfallNorm * 0.5 + tempNorm * 0.15 + windNorm * 0.15 + weatherConditionBonus * 0.2) * 100, 100);
    
    factors.push({
      name: 'Weather',
      weight: weights.weather,
      value: weatherScore / 100,
      contribution: 0, // will calculate below
      description: weather ? `Rainfall: ${weather.rainfall}mm, ${weather.condition}, Wind: ${weather.windSpeed}km/h` : 'No weather data available'
    });

    // ── Terrain Factors ──
    const slopeNorm = normalizeSlope(road.slope);
    const elevNorm = normalizeElevation(road.elevation);
    const riverNorm = normalizeRiverProximity(road.riverProximity);
    
    const terrainScore = Math.min((slopeNorm * 0.4 + elevNorm * 0.3 + riverNorm * 0.3) * 100, 100);
    
    factors.push({
      name: 'Terrain',
      weight: weights.terrain,
      value: terrainScore / 100,
      contribution: 0,
      description: `Slope: ${road.slope}°, Elevation: ${road.elevation}m, River: ${road.riverProximity}km`
    });

    // ── Infrastructure Factors ──
    const roadCondNorm = normalizeRoadCondition(road.condition);
    // Calculate average bridge condition for roads with bridges
    const avgBridgeRisk = road.bridgeIds.length > 0 ? 0.4 : 0; // simplified
    
    const infraScore = Math.min((roadCondNorm * 0.6 + avgBridgeRisk * 0.4) * 100, 100);
    
    factors.push({
      name: 'Infrastructure',
      weight: weights.infrastructure,
      value: infraScore / 100,
      contribution: 0,
      description: `Road condition: ${road.condition}, ${road.bridgeIds.length} bridges`
    });

    // ── Historical Factors ──
    const landslideNorm = normalizeHistoricalEvents(road.historicalLandslides);
    const floodNorm = normalizeHistoricalEvents(road.historicalFloods, 30);
    
    const historicalScore = Math.min((landslideNorm * 0.6 + floodNorm * 0.4) * 100, 100);
    
    factors.push({
      name: 'Historical Risk',
      weight: weights.historical,
      value: historicalScore / 100,
      contribution: 0,
      description: `Landslides: ${road.historicalLandslides}, Floods: ${road.historicalFloods}`
    });

    // ── Traffic Factors ──
    const trafficNorm = normalizeTraffic(road.trafficLevel);
    const trafficScore = trafficNorm * 100;
    
    factors.push({
      name: 'Traffic',
      weight: weights.traffic,
      value: trafficScore / 100,
      contribution: 0,
      description: `Traffic level: ${road.trafficLevel}`
    });

    // ── Calculate Composite Risk Score ──
    let currentRisk = 0;
    factors.forEach(f => {
      const contribution = f.value * f.weight * 100;
      f.contribution = Math.round(contribution * 10) / 10;
      currentRisk += contribution;
    });
    currentRisk = Math.min(Math.round(currentRisk), 100);

    // ── Road Status Modifiers ──
    if (road.status === 'BLOCKED') currentRisk = 100;
    else if (road.status === 'CRITICAL') currentRisk = Math.max(currentRisk, 85);
    else if (road.status === 'PARTIALLY_BLOCKED') currentRisk = Math.max(currentRisk, 60);
    else if (road.status === 'UNDER_MAINTENANCE') currentRisk = Math.max(currentRisk, 45);

    // ── Temporal Projections ──
    const rainfallTrend6h = weather ? (weather.rainfallForecast6h / Math.max(weather.rainfall, 1)) : 1;
    const rainfallTrend12h = weather ? (weather.rainfallForecast12h / Math.max(weather.rainfall, 1)) : 1;
    const rainfallTrend24h = weather ? (weather.rainfallForecast24h / Math.max(weather.rainfall, 1)) : 1;

    const risk6h = Math.min(Math.round(currentRisk * (0.7 + 0.3 * Math.min(rainfallTrend6h, 2))), 100);
    const risk12h = Math.min(Math.round(currentRisk * (0.6 + 0.4 * Math.min(rainfallTrend12h, 2))), 100);
    const risk24h = Math.min(Math.round(currentRisk * (0.5 + 0.5 * Math.min(rainfallTrend24h, 2.5))), 100);

    // ── Accessibility Score (inverse of risk) ──
    const accessibilityScore = Math.max(0, 100 - currentRisk);

    // ── Confidence Score ──
    let confidence = 85; // base
    if (weather) confidence += 8;
    if (road.historicalLandslides > 10 || road.historicalFloods > 10) confidence += 5;
    if (road.condition === 'EXCELLENT' || road.condition === 'GOOD') confidence += 2;
    confidence = Math.min(confidence, 99);

    // ── Primary Risk Factors (sorted by contribution) ──
    const sortedFactors = [...factors].sort((a, b) => b.contribution - a.contribution);

    return {
      roadId: road.id,
      roadName: `${road.number} - ${road.name}`,
      currentRisk,
      risk6h,
      risk12h,
      risk24h,
      accessibilityScore,
      riskCategory: getRiskLevel(currentRisk),
      primaryFactors: sortedFactors,
      confidence,
      calculatedAt: new Date().toISOString(),
      modelVersion: 'weighted-v1.0',
    };
  }
}

// --- Explain Risk (WHY? button) ---
export function explainRisk(prediction: RiskPrediction): string {
  const topFactors = prediction.primaryFactors
    .filter(f => f.contribution > 5)
    .slice(0, 3);
  
  const parts = topFactors.map(f => 
    `${f.name} contributes ${f.contribution.toFixed(1)}% to the risk (${f.description})`
  );

  return `Risk score of ${prediction.currentRisk}/100 for ${prediction.roadName}. ` +
    parts.join('. ') + 
    `. Confidence: ${prediction.confidence}%. Model: ${prediction.modelVersion}.`;
}

// --- Batch Prediction ---
export function predictAllRoadRisks(
  roads: Road[],
  weatherByDistrict: Map<string, WeatherData>,
  weights?: RiskWeights
): Map<string, RiskPrediction> {
  const model = new WeightedRiskModel();
  const results = new Map<string, RiskPrediction>();
  
  for (const road of roads) {
    // Find closest weather data by district
    const weather = road.districtIds
      .map(d => weatherByDistrict.get(d))
      .find(w => w != null) ?? null;
    
    results.set(road.id, model.predict(road, weather, weights));
  }
  
  return results;
}

// Singleton instance
export const riskModel = new WeightedRiskModel();
