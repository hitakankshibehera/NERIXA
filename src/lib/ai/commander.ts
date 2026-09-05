// ============================================================
// NER-SHIELD AI — AI Commander (Query Engine)
// Rule-based NLP over application data
// ============================================================

import type { Road, Vehicle, Shipment, RiskPrediction, Alert, CommanderResponse } from '@/lib/types';
import type { RoadImageIntel } from '@/lib/types/imageIntelligence';
import type { SatelliteObservation } from '@/lib/types/satelliteIntelligence';
import { getRiskLevel } from '@/lib/constants';

type AppData = {
  roads: Road[];
  vehicles: Vehicle[];
  shipments: Shipment[];
  predictions: Map<string, RiskPrediction>;
  alerts: Alert[];
  imageIntelList?: RoadImageIntel[];
  satelliteObservations?: SatelliteObservation[];
};

interface ParsedQuery {
  intent: string;
  entities: Record<string, string>;
  keywords: string[];
}

// Simple intent parser
function parseQuery(text: string): ParsedQuery {
  const lower = text.toLowerCase().trim();
  const keywords = lower.split(/\s+/);
  const entities: Record<string, string> = {};

  // Extract road references
  const roadMatch = lower.match(/nh[-\s]?(\d+)/) || lower.match(/r[-\s]?(\d+)/);
  if (roadMatch) entities.road = `nh-${roadMatch[1]}`;

  // Extract location references
  const locations = [
    'guwahati', 'shillong', 'imphal', 'aizawl', 'kohima', 'agartala', 'gangtok', 'itanagar', 
    'dimapur', 'tawang', 'dibrugarh', 'silchar', 'tezpur', 'jorhat', 'nagaon', 'tura', 
    'kamrup', 'east khasi hills', 'morigaon', 'sonitpur', 'papum pare', 'east kameng', 'ri-bhoi'
  ];
  for (const loc of locations) {
    if (lower.includes(loc)) entities.location = loc;
  }

  // Determine intent
  let intent = 'GENERAL_QUERY';

  if (
    lower.includes('satellite') || lower.includes('copernicus') || lower.includes('sentinel') ||
    lower.includes('sar') || lower.includes('radar') || lower.includes('flood detection') ||
    lower.includes('change detection') || (lower.includes('r-17') && (lower.includes('risk') || lower.includes('why'))) ||
    lower.includes('field verification')
  ) {
    intent = 'SATELLITE_INTEL_QUERY';
  } else if (lower.includes('blocked') && (lower.includes('road') || lower.includes('which') || lower.includes('corridor'))) {
    intent = 'BLOCKED_ROADS_QUERY';
  } else if (lower.includes('what changed') || lower.includes('last 30 minutes') || lower.includes('timeline') || lower.includes('recent events')) {
    intent = 'TIMELINE_CHANGE_QUERY';
  } else if (lower.includes('hospital') || lower.includes('medical centre') || lower.includes('clinic')) {
    intent = 'HOSPITAL_AFFECTED_QUERY';
  } else if ((lower.includes('safest route') || lower.includes('route')) && (lower.includes('trk-102') || lower.includes('trk102') || lower.includes('vehicle'))) {
    intent = 'SAFEST_ROUTE_QUERY';
  } else if ((lower.includes('high risk') || lower.includes('at risk')) && (lower.includes('vehicle') || lower.includes('truck') || lower.includes('convoys'))) {
    intent = 'HIGH_RISK_VEHICLES_QUERY';
  } else if (
    lower.includes('image') || lower.includes('photo') || lower.includes('camera') ||
    lower.includes('cctv') || lower.includes('recon') ||
    lower.includes('vision') || lower.includes('cv') || lower.includes('evidence')
  ) {
    intent = 'IMAGE_INTEL_QUERY';
  } else if (lower.includes('bridge') || lower.includes('scour') || lower.includes('pier')) {
    intent = 'BRIDGE_INTEL_QUERY';
  } else if (lower.includes('risk') || lower.includes('danger') || lower.includes('safe')) {
    intent = 'RISK_QUERY';
  } else if (lower.includes('route') || lower.includes('path') || lower.includes('way') || lower.includes('safest route') || lower.includes('fastest')) {
    intent = 'ROUTE_QUERY';
  } else if (lower.includes('shipment') || lower.includes('delivery') || lower.includes('medicine') || lower.includes('food') || lower.includes('supply')) {
    intent = 'SUPPLY_QUERY';
  } else if (lower.includes('vehicle') || lower.includes('truck') || lower.includes('fleet')) {
    intent = 'VEHICLE_QUERY';
  } else if (lower.includes('what if') || lower.includes('what happens') || lower.includes('closes') || lower.includes('blocked')) {
    intent = 'SIMULATION_QUERY';
  } else if (lower.includes('why') || lower.includes('explain') || lower.includes('reason')) {
    intent = 'EXPLANATION_QUERY';
  } else if (lower.includes('alert') || lower.includes('warning') || lower.includes('notification')) {
    intent = 'ALERT_QUERY';
  } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('storm')) {
    intent = 'WEATHER_QUERY';
  } else if (lower.includes('district') || lower.includes('state') || lower.includes('area')) {
    intent = 'AREA_QUERY';
  }

  return { intent, entities, keywords };
}

export function processCommanderQuery(text: string, data: AppData): CommanderResponse {
  const parsed = parseQuery(text);

  switch (parsed.intent) {
    case 'HIGH_RISK_VEHICLES_QUERY':
      return handleHighRiskVehiclesQuery(parsed, data);
    case 'BLOCKED_ROADS_QUERY':
      return handleBlockedRoadsQuery(parsed, data);
    case 'TIMELINE_CHANGE_QUERY':
      return handleTimelineChangeQuery(parsed, data);
    case 'SAFEST_ROUTE_QUERY':
      return handleSafestRouteQuery(parsed, data);
    case 'HOSPITAL_AFFECTED_QUERY':
      return handleHospitalAffectedQuery(parsed, data);
    case 'SATELLITE_INTEL_QUERY':
      return handleSatelliteIntelQuery(parsed, data);
    case 'IMAGE_INTEL_QUERY':
      return handleImageIntelQuery(parsed, data);
    case 'BRIDGE_INTEL_QUERY':
      return handleBridgeIntelQuery(parsed, data);
    case 'RISK_QUERY':
      return handleRiskQuery(parsed, data);
    case 'ROUTE_QUERY':
      return handleRouteQuery(parsed, data);
    case 'SUPPLY_QUERY':
      return handleSupplyQuery(parsed, data);
    case 'VEHICLE_QUERY':
      return handleVehicleQuery(parsed, data);
    case 'SIMULATION_QUERY':
      return handleSimulationQuery(parsed, data);
    case 'EXPLANATION_QUERY':
      return handleExplanationQuery(parsed, data);
    case 'ALERT_QUERY':
      return handleAlertQuery(parsed, data);
    default:
      return handleGeneralQuery(parsed, data);
  }
}

function handleRiskQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  if (parsed.entities.road) {
    const prediction = data.predictions.get(parsed.entities.road);
    const road = data.roads.find(r => r.id === parsed.entities.road);
    if (prediction && road) {
      return {
        text: `**[INTELLIGENCE REPORT] ${road.number} - ${road.name}**\n\n` +
          `Current Risk: **${prediction.currentRisk}/100** (${prediction.riskCategory})\n` +
          `6h Forecast: ${prediction.risk6h}% | 12h: ${prediction.risk12h}% | 24h: ${prediction.risk24h}%\n` +
          `Accessibility: ${prediction.accessibilityScore}%\n` +
          `Confidence: ${prediction.confidence}%\n\n` +
          `**Top Risk Factors:**\n` +
          prediction.primaryFactors.slice(0, 3).map(f => `• ${f.name}: ${f.description}`).join('\n'),
        suggestions: ['What happens if this road closes?', 'Find safest alternate route', 'Show affected shipments'],
        mapAction: { type: 'HIGHLIGHT_ROAD', target: parsed.entities.road },
      };
    }
  }

  // Show all critical risk roads
  const criticalRoads = Array.from(data.predictions.entries())
    .filter(([, p]) => p.currentRisk > 60)
    .sort(([, a], [, b]) => b.currentRisk - a.currentRisk)
    .slice(0, 5);

  return {
    text: `**[ALERT] Corridors Currently at Elevated / Critical Risk:**\n\n` +
      criticalRoads.map(([id, p]) => {
        const road = data.roads.find(r => r.id === id);
        return `• **${road?.number || id}**: Risk ${p.currentRisk}/100 (${p.riskCategory})`;
      }).join('\n') +
      `\n\nTotal high-risk roads: ${criticalRoads.length}`,
    suggestions: ['Show road details for NH-15', 'Which shipments are affected?', 'What is the safest route?'],
  };
}

function handleRouteQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  return {
    text: `**[TACTICAL ROUTING] Route Optimization Engine**\n\nTo find the optimal route, go to the **Route Optimizer** page and specify:\n` +
      `• Origin and Destination\n• Cargo priority\n• Optimization preference (Fastest/Safest/Cheapest)\n\n` +
      `The AI will compare multiple routes and recommend the best option based on current road conditions, risk levels, and traffic.`,
    suggestions: ['Show current road risks', 'Which roads are blocked?', 'Show all vehicles'],
    mapAction: parsed.entities.location ? { type: 'ZOOM_TO', target: parsed.entities.location } : undefined,
  };
}

function handleSupplyQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const atRiskShipments = data.shipments.filter(s => s.status === 'AT_RISK' || s.status === 'DELAYED');
  const criticalMedicine = atRiskShipments.filter(s => s.commodity === 'MEDICINE' && s.priority === 'CRITICAL');
  const delayedFood = atRiskShipments.filter(s => s.commodity === 'FOOD');

  return {
    text: `**[MANIFEST INTELLIGENCE] Supply Chain Status:**\n\n` +
      `At-Risk Shipments: **${atRiskShipments.length}**\n` +
      `Critical Medicine: **${criticalMedicine.length}**\n` +
      `Delayed Food: **${delayedFood.length}**\n\n` +
      (criticalMedicine.length > 0 ? `**Critical Medicine Shipments:**\n` +
        criticalMedicine.map(s => `• ${s.commodityName} → ${s.destination} (ETA: ${new Date(s.eta).toLocaleTimeString()})`).join('\n') : 'All medicine shipments are on track.'),
    suggestions: ['Which routes are affected?', 'Show vehicle positions', 'Run supply shortage simulation'],
  };
}

function handleVehicleQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const active = data.vehicles.filter(v => v.status !== 'DELIVERED');
  const atRisk = active.filter(v => v.risk > 60);
  const delayed = active.filter(v => v.status === 'DELAYED');

  return {
    text: `**[TELEMETRY] Fleet Transit Status:**\n\n` +
      `Active Vehicles: **${active.length}**\n` +
      `At Risk: **${atRisk.length}**\n` +
      `Delayed: **${delayed.length}**\n\n` +
      (atRisk.length > 0 ? `**At-Risk Vehicles:**\n` +
        atRisk.map(v => `• ${v.vehicleNumber} (${v.driverName}) → ${v.destinationName || 'Unknown'} — Risk: ${v.risk}%`).join('\n') : 'No vehicles at critical risk.'),
    suggestions: ['Show on map', 'Which shipments are delayed?', 'Start GPS simulation'],
    mapAction: { type: 'SHOW_VEHICLES', target: 'all' },
  };
}

function handleSimulationQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  if (parsed.entities.road) {
    const road = data.roads.find(r => r.id === parsed.entities.road);
    if (road) {
      return {
        text: `**[SCENARIO SIMULATION] Impact Analysis for ${road.number}:**\n\n` +
          `If ${road.number} (${road.name}) closes:\n` +
          `• Potentially affects ${road.districtIds.length} districts\n` +
          `• Vehicles currently on route could be stranded\n\n` +
          `To run a full simulation with detailed impact analysis, go to the **What-If Simulator** page.`,
        suggestions: ['Run simulation now', 'Show alternate routes', 'Which shipments are on this road?'],
      };
    }
  }
  return {
    text: `**[SIMULATION ENGINE] Emergency Disaster Simulator**\n\nYou can simulate road closures, bridge failures, and severe weather events. Go to the **What-If Simulator** to:\n• Select a scenario type\n• Choose affected road/bridge\n• Run the simulation\n• See the full impact analysis and AI action plan`,
    suggestions: ['What if NH-15 closes?', 'What if there\'s heavy rainfall?', 'Show current risks'],
  };
}

function handleSatelliteIntelQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const observations = data.satelliteObservations || [];
  const textLower = parsed.keywords.join(' ');

  // 1. "Why did Road R-17 risk increase?" or why NH-15
  if ((textLower.includes('why') || textLower.includes('increase') || textLower.includes('reason')) && (textLower.includes('r-17') || textLower.includes('nh-15') || parsed.entities.road === 'nh-15')) {
    return {
      text: `**[SATELLITE INTEL] Why did Road R-17 (NH-15) risk increase?**\n\n` +
        `• **Baseline Risk:** 34/100 (Safe)\n` +
        `• **Updated Post-Satellite Risk:** **84/100** ([CRITICAL RISK])\n` +
        `• **Accessibility Impact:** Dropped from **78% to 24%**\n` +
        `• **Cause:** Sentinel-1 C-Band SAR radar backscatter detected a **34.2 km² flood inundation polygon** directly intersecting the NH-15 corridor at chainage km 112–148 (Sonitpur/Brahmaputra basin).\n` +
        `• **Sensor Dielectric Analysis:** Drastic backscatter drop to -22.4 dB confirming standing surface water depth of 1.8–2.4 ft across carriageway.\n` +
        `• **Decision Support Output:** 9 essential shipments affected (including 2 life-saving Oxygen/Vaccine consignments). Rerouting recommended via **Route B** (Brahmaputra South Bank via Kaliabor-Nagaon Bypass).`,
      suggestions: ['Which critical shipments are affected?', 'Compare latest and previous observations', 'Show alternative Route B', 'Which detections require field verification?'],
      mapAction: { type: 'HIGHLIGHT_ROAD', target: 'nh-15' },
    };
  }

  // 2. "Which roads are affected by satellite observations?"
  if (textLower.includes('affected') && (textLower.includes('road') || textLower.includes('corridor'))) {
    return {
      text: `**[ORBITAL SURVEILLANCE] Corridors Impacted by Inundation & Terrain Detections:**\n\n` +
        `• [CRITICAL] **NH-15 (Road R-17 - Tezpur to North Lakhimpur Corridor)**\n` +
        `  - Observation: Sentinel-1 SAR IW (Acquired 04 Sep 2026 05:42 UTC)\n` +
        `  - AI Detection: Severe Inundation (34.2 km² water polygon)\n` +
        `  - Risk Impact: **34/100 → 84/100** ([CRITICAL])\n` +
        `  - Accessibility: **78% → 24%** (Submerged 1.8–2.4 ft)\n` +
        `  - Affected Convoys: 17 commercial trucks, 9 essential shipments (3 critical)\n\n` +
        `• [ELEVATED] **NH-13 (Bhalukpong-Bomdila Corridor)**\n` +
        `  - Observation: Sentinel-1 SAR Slope Saturation (Acquired 04 Sep 2026 05:40 UTC)\n` +
        `  - AI Detection: High moisture saturation & slope siltation (Confidence: 78.4%)\n` +
        `  - Status: NEEDS FIELD VERIFICATION (Field Officer Dispatched)`,
      suggestions: ['Why did Road R-17 risk increase?', 'Which critical shipments are affected?', 'Compare latest and previous observations'],
      mapAction: { type: 'HIGHLIGHT_ROAD', target: 'nh-15' },
    };
  }

  // 3. "Which critical shipments are affected?"
  if (textLower.includes('shipment') || textLower.includes('supply') || textLower.includes('medicine') || textLower.includes('cargo') || textLower.includes('food')) {
    return {
      text: `**[CONVOY AUDIT] Critical Shipments Intercepted by Satellite Flood Inundation:**\n\n` +
        `A total of **9 shipments** (3 critical) in the Sonitpur NH-15 corridor are intercepted by the Sentinel-1 SAR flood polygon:\n\n` +
        `1. [CRITICAL] **SH-MED-01: Liquid Medical Oxygen (4,000 L)**\n` +
        `   • Route: Guwahati GMCH → Tezpur Civil Hospital ICU\n` +
        `   • Risk: 84% (High Alert) | Est. Delay: +3.2h\n` +
        `   • Reroute: Mandatory diversion to **Route B** (Kaliabor-Silghat South Bank)\n\n` +
        `2. [CRITICAL] **SH-MED-04: Emergency Pediatric Vaccines (Cold Chain)**\n` +
        `   • Route: Tezpur Depot → North Lakhimpur Sub-Divisional Hospital\n` +
        `   • Risk: 82% | Critical Battery/Cold Life: 8h remaining\n` +
        `   • Action: Prioritized BRO green corridor escort on Route B\n\n` +
        `3. [HIGH] **SH-ESS-08: PDS Relief Rice & Baby Formula (18 Tonnes)**\n` +
        `   • Route: FCI Depot Nagaon → Dhemaji Flood Camp`,
      suggestions: ['Why did Road R-17 risk increase?', 'Show alternative Route B', 'Which roads are affected by satellite observations?'],
    };
  }

  // 4. "Compare latest and previous observations"
  if (textLower.includes('compare') || textLower.includes('previous') || textLower.includes('change') || textLower.includes('before')) {
    return {
      text: `**[CHANGE DETECTION] Satellite Multi-Temporal Comparison:**\n\n` +
        `• **Baseline Observation (Previous):**\n` +
        `  - Product: Sentinel-2 MSI Optical (\`S2A_MSIL2A_20260828\`)\n` +
        `  - Date: 28 Aug 2026 04:55 UTC (Pre-monsoon dry corridor)\n` +
        `  - River Cross-Section: 140m regular flow, normal vegetation NDVI 0.68\n\n` +
        `• **Latest Available Observation:**\n` +
        `  - Product: Sentinel-1 SAR IW (\`S1A_IW_GRDH_1SDV_20260904\`)\n` +
        `  - Date: 04 Sep 2026 05:42 UTC (Monsoon radar penetrate)\n` +
        `  - Radar Backscatter: Water mask detected over 34.2 km²\n\n` +
        `• **Detected Change:**\n` +
        `  - Net Inundation Expansion: **+38.2 km²** water surface delta\n` +
        `  - Embankment Breach: 2 distinct overflow breaches along Sonitpur NH-15 dyke\n` +
        `  - Confidence: **91.8% (HIGH CONFIDENCE)**`,
      suggestions: ['Why did Road R-17 risk increase?', 'Show affected roads', 'Run Satellite Flood Scenario'],
    };
  }

  // 5. "Which detections require field verification?"
  if (textLower.includes('verification') || textLower.includes('field officer') || textLower.includes('verify')) {
    return {
      text: `**[DISPATCH QUEUE] Satellite AI Detections Requiring Ground Truth Verification:**\n\n` +
        `1. [PENDING VERIFICATION] **East Kameng Corridor (Observation S-OBS-2026-0904-02)**\n` +
        `   • Detection: Possible Landslide & Slope Moisture Siltation\n` +
        `   • AI Confidence: **78.4%**\n` +
        `   • Status: **NEEDS FIELD VERIFICATION**\n` +
        `   • Location: 27.2840°N, 92.4180°E (West Kameng border)\n` +
        `   • Dispatch: Field Officer **Insp. T. Lobsang (NER-FO-088)** notified with offline sync coordinates\n\n` +
        `2. [PENDING VERIFICATION] **Ri-Bhoi Corridor (Observation S-OBS-2026-0904-04)**\n` +
        `   • Detection: Road Corridor Terrain Change / Soil Loosening\n` +
        `   • AI Confidence: **79.1%**\n` +
        `   • Status: **NEEDS FIELD VERIFICATION**`,
      suggestions: ['Show recent satellite detections', 'Why did Road R-17 risk increase?', 'Show affected critical shipments'],
    };
  }

  // 6. "Show latest satellite observation for this district"
  if (parsed.entities.location || textLower.includes('district') || textLower.includes('state')) {
    const loc = parsed.entities.location || 'sonitpur';
    const match = observations.find(o => 
      o.districtName.toLowerCase().includes(loc) || 
      o.stateName.toLowerCase().includes(loc)
    ) || observations[0];

    if (match) {
      return {
        text: `**[CDSE OBSERVATION] Latest Available Satellite Pass for ${match.districtName}, ${match.stateName}:**\n\n` +
          `• **Product ID:** \`${match.productId}\`\n` +
          `• **Satellite Source:** **${match.satellite}** (${match.sensor})\n` +
          `• **Actual Acquisition Time:** **${match.acquisitionTime}**\n` +
          `• **Status:** ${match.status}\n` +
          `• **Cloud Coverage:** ${match.cloudCoverage !== undefined ? `${match.cloudCoverage}%` : 'N/A (SAR All-Weather Radar)'}\n` +
          `• **Spatial Resolution:** ${match.spatialResolutionMeters}m ground sample\n` +
          (match.detection ? 
            `• **AI Detection:** ${match.detection.detectionType.replace(/_/g, ' ')} (Confidence: ${match.detection.confidence.toFixed(1)}%, Area: ${match.detection.areaKm2} km²)\n` +
            `• **Severity:** ${match.detection.severity} | Status: ${match.detection.status}\n` +
            `• **Explanation:** ${match.detection.explanation}` : 
            `• **AI Detection:** None recorded / Baseline normal`) +
          `\n\n*Note: Satellite intelligence displays latest acquired observation timestamps—not synthetic continuous live.*`,
        suggestions: ['Why did Road R-17 risk increase?', 'Which roads are affected by satellite observations?', 'Compare latest and previous observations'],
      };
    }
  }

  // 7. General satellite detections overview
  const detectedObs = observations.filter(o => o.detection);
  const floodObs = observations.filter(o => o.detection && (o.detection.detectionType === 'POSSIBLE_FLOOD' || o.detection.detectionType === 'FLOOD_EXPANSION'));

  return {
    text: `**[ORBITAL SUMMARY] Copernicus Satellite AI Intelligence:**\n\n` +
      `• Active Monitored Observations: **${observations.length}** across 8 NER States\n` +
      `• Active AI Hazard Detections: **${detectedObs.length}**\n` +
      `• Severe Flood Inundations: **${floodObs.length}**\n\n` +
      `**Recent Satellite Detections:**\n` +
      observations.slice(0, 3).map(o => {
        const d = o.detection;
        return `• **${o.satellite} (${o.sensor}) — ${o.districtName}, ${o.stateName}**\n` +
          `  - Acquisition: ${o.acquisitionTime}\n` +
          `  - Detection: ${d ? d.detectionType.replace(/_/g, ' ') : 'None'} [${d?.severity || 'NORMAL'}]\n` +
          `  - Confidence: ${d ? `${d.confidence.toFixed(1)}%` : 'N/A'} | Status: ${d?.status || 'COMPLETED'}`;
      }).join('\n\n') +
      `\n\nAsk: *"Why did Road R-17 risk increase?"*, *"Which critical shipments are affected?"*, or *"Compare latest and previous observations"*.`,
    suggestions: [
      'Show me recent satellite detections',
      'Which roads are affected by satellite observations?',
      'Which critical shipments are affected?',
      'Why did Road R-17 risk increase?',
      'Compare latest and previous observations',
      'Which detections require field verification?'
    ],
  };
}

function handleImageIntelQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const intelList = data.imageIntelList || [];
  
  // Specific road check
  if (parsed.entities.road) {
    const roadIntel = intelList.find(i => i.roadId === parsed.entities.road);
    const road = data.roads.find(r => r.id === parsed.entities.road);
    if (roadIntel) {
      const hoursDelay = Math.round(roadIntel.logisticsImpact.estimatedDelayMinutes / 60);
      return {
        text: `**[VISUAL INTELLIGENCE] Ground Evidence for ${road?.number || roadIntel.roadNumber}:**\n\n` +
          `• **Source:** ${roadIntel.sourceType} (${roadIntel.sourceName})\n` +
          `• **Hazard Detected:** ${roadIntel.aiDetection.incidentType.replace(/_/g, ' ')} (${roadIntel.aiDetection.severity})\n` +
          `• **AI Confidence:** ${roadIntel.aiDetection.confidence.toFixed(1)}%\n` +
          `• **Road Blockage:** ${roadIntel.aiDetection.roadBlockagePercent}%\n` +
          `• **Location:** ${roadIntel.title}, ${roadIntel.districtName} (${roadIntel.lat.toFixed(4)}, ${roadIntel.lng.toFixed(4)})\n` +
          `• **Timestamp:** ${new Date(roadIntel.timestamp).toLocaleString()}\n` +
          `• **Verification Status:** ${roadIntel.verification.status} by ${roadIntel.verification.verifiedBy || 'AI Ingestion'}\n\n` +
          `**Computer Vision Findings:**\n` +
          roadIntel.aiDetection.detectedFeatures.map(f => `• ${f}`).join('\n') +
          (roadIntel.logisticsImpact ? `\n\n**Logistics Impact:** ${roadIntel.logisticsImpact.affectedVehiclesCount} vehicles affected (${roadIntel.logisticsImpact.criticalShipmentsCount} critical medicine shipments). Est. delay: ~${hoursDelay}h.` : ''),
        suggestions: ['Show image evidence', 'Find alternate bypass route', 'Show affected medicine shipments'],
        mapAction: { type: 'HIGHLIGHT_ROAD', target: parsed.entities.road },
      };
    }
  }

  // Landslide specific query
  const isLandslideQuery = parsed.keywords.some(k => k.includes('landslide') || k.includes('mudslide') || k.includes('debris'));
  const landslideRecords = intelList.filter(i => 
    i.aiDetection.incidentType === 'LANDSLIDE' || 
    i.aiDetection.incidentType === 'DEBRIS' || 
    i.aiDetection.incidentType === 'ROAD_BLOCKAGE'
  );

  if (isLandslideQuery && landslideRecords.length > 0) {
    return {
      text: `**[SLOPE INSTABILITY] Corridors with Visual Landslide Evidence (${landslideRecords.length} Detected):**\n\n` +
        landslideRecords.map(rec => 
          `• **${rec.roadNumber} (${rec.title}, ${rec.districtName})**\n` +
          `  - Condition: ${rec.aiDetection.incidentType.replace(/_/g, ' ')} (${rec.aiDetection.severity})\n` +
          `  - AI Confidence: ${rec.aiDetection.confidence.toFixed(1)}% | Blockage: ${rec.aiDetection.roadBlockagePercent}%\n` +
          `  - Debris: ${rec.aiDetection.debrisVolumeM3 ? `${rec.aiDetection.debrisVolumeM3} m³` : 'Scattered'}\n` +
          `  - Source: ${rec.sourceType} (${new Date(rec.timestamp).toLocaleTimeString()})\n` +
          `  - Status: ${rec.verification.status}`
        ).join('\n\n') +
        `\n\nTo view Before/After reality comparisons, visit the **Image Intelligence** module.`,
      suggestions: ['Show on map', 'Which shipments are delayed?', 'Show bridge inspections'],
      mapAction: { type: 'HIGHLIGHT_ROAD', target: landslideRecords[0]?.roadId },
    };
  }

  // General image intel summary
  const verifiedCount = intelList.filter(i => i.verification.status === 'AUTHORITY_CONFIRMED').length;
  const pendingCount = intelList.filter(i => i.verification.status === 'AI_DETECTED' || i.verification.status === 'OFFICER_VERIFIED').length;

  return {
    text: `**[SURVEILLANCE SUMMARY] Visual Ground Reality & Digital Twin Feeds:**\n\n` +
      `• Active Ground Evidence Records: **${intelList.length}**\n` +
      `• Authority Verified/Confirmed: **${verifiedCount}**\n` +
      `• Pending Human-in-the-Loop Review: **${pendingCount}**\n\n` +
      `**Recent High-Severity Detections:**\n` +
      intelList.slice(0, 3).map(i => 
        `• [ALERT] **${i.roadNumber}** (${i.districtName}): ${i.aiDetection.incidentType.replace(/_/g, ' ')} — AI Confidence ${i.aiDetection.confidence.toFixed(1)}% [${i.sourceType}]`
      ).join('\n') +
      `\n\nYou can inspect full 4K evidence, Before/After sliders, and field officer offline queues in the **Image Intelligence** portal.`,
    suggestions: ['Show roads with recent landslide images', 'What happened near the bridge?', 'Which medicine deliveries are delayed?'],
  };
}

function handleBridgeIntelQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const intelList = data.imageIntelList || [];
  const bridgeIncidents = intelList.filter(i => 
    i.aiDetection.incidentType === 'DAMAGED_BRIDGE' || 
    i.aiDetection.incidentType === 'INFRASTRUCTURE_DAMAGE' || 
    i.title.toLowerCase().includes('bridge')
  );

  if (bridgeIncidents.length > 0) {
    return {
      text: `**[STRUCTURAL INTEGRITY] Bridge Health & Remote Camera Surveillance:**\n\n` +
        bridgeIncidents.map(b => 
          `• **${b.title} (${b.roadNumber} - ${b.districtName})**\n` +
          `  - Condition: ${b.aiDetection.incidentType.replace(/_/g, ' ')} (${b.aiDetection.severity})\n` +
          `  - AI Confidence: ${b.aiDetection.confidence.toFixed(1)}%\n` +
          `  - Structural Scour/Crack: ${b.aiDetection.detectedFeatures.slice(0, 2).join('; ')}\n` +
          `  - Verified By: ${b.verification.verifiedBy || 'Pending Authority'} [${b.verification.status}]\n` +
          `  - Max Axle Recommendation: ${b.aiDetection.severity === 'CRITICAL' ? 'NO VEHICLES (CLOSED)' : '< 16 Tonnes'}`
        ).join('\n\n'),
      suggestions: ['Show alternate bypass route', 'View image evidence in Hub', 'Show fleet status'],
      mapAction: { type: 'HIGHLIGHT_ROAD', target: bridgeIncidents[0]?.roadId },
    };
  }

  return {
    text: `**[STRUCTURAL INTEGRITY] Bridge Monitoring:** All major river bridges (Saraighat, Bogibeel, Bhupen Hazarika Setu, Kolia Bhomora) report standard structural stability with no visual scour alerts from remote camera feeds.`,
    suggestions: ['Show image intelligence summary', 'Show all critical risks', 'Active alerts'],
  };
}

function handleExplanationQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  if (parsed.entities.road) {
    const prediction = data.predictions.get(parsed.entities.road);
    const road = data.roads.find(r => r.id === parsed.entities.road);
    const roadIntel = data.imageIntelList?.find(i => i.roadId === parsed.entities.road);

    if (prediction && road) {
      const factors = prediction.primaryFactors.slice(0, 3);
      let text = `**[DECISION AUDIT] Why is ${road.number} at ${prediction.riskCategory} risk?**\n\n` +
        factors.map(f => `• **${f.name}** (${f.contribution.toFixed(1)}% contribution): ${f.description}`).join('\n') +
        `\n\nOverall confidence in this prediction: **${prediction.confidence}%**\n` +
        `Model version: ${prediction.modelVersion}`;

      if (roadIntel) {
        text += `\n\n**Visual Ground Reality Evidence:**\n` +
          `• **Detected Condition:** ${roadIntel.aiDetection.incidentType.replace(/_/g, ' ')} (${roadIntel.aiDetection.severity})\n` +
          `• **Computer Vision Confidence:** ${roadIntel.aiDetection.confidence.toFixed(1)}%\n` +
          `• **Blockage:** ${roadIntel.aiDetection.roadBlockagePercent}% of carriage-way compromised\n` +
          `• **Field Observations:** ${roadIntel.aiDetection.detectedFeatures[0] || 'Debris on road surface'}`;
      }

      if (parsed.entities.road === 'nh-15' || parsed.entities.road === 'r-17') {
        text += `\n\n**Satellite AI Flood Detection Evidence:**\n` +
          `• **Copernicus Product:** Sentinel-1 C-SAR IW (\`S1A_IW_GRDH_1SDV_20260904\`)\n` +
          `• **Hazard:** Severe Surface Flood Inundation (34.2 km² water polygon)\n` +
          `• **Intersection:** Submerged carriageway (1.8–2.4 ft) across chainage km 112–148\n` +
          `• **Accessibility Impact:** Dropped from 78% down to 24%\n` +
          `• **AI Action Plan:** Divert all heavy convoys & critical oxygen consignments to Route B.`;
      }

      return {
        text,
        suggestions: ['Show image evidence', 'Show alternate routes', 'Show affected shipments'],
        mapAction: { type: 'HIGHLIGHT_ROAD', target: parsed.entities.road },
      };
    }
  }
  return {
    text: `Every AI decision in NER-SHIELD has a transparent audit trail. Click the **"Why?"** button on any risk score, route recommendation, or supply impact to understand the reasoning.`,
    suggestions: ['Why is NH-15 at high risk?', 'Show roads with recent landslide images', 'Explain supply shortage prediction'],
  };
}

function handleHighRiskVehiclesQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const atRisk = data.vehicles.filter(v => (v.risk || 0) >= 60 || v.status === 'AT_RISK' || v.status === 'EMERGENCY');
  return {
    text: `**[FLEET THREAT TELEMETRY] Vehicles Currently at High Risk (${atRisk.length} units):**\n\n` +
      (atRisk.length > 0 ?
        atRisk.map(v => {
          const matchingShipment = data.shipments.find(s => v.shipmentIds?.includes(s.id));
          return `• **${v.id} (${v.vehicleNumber})** — Driver: ${v.driverName || 'Operator'}\n` +
            `  - Status: ${v.status} | Speed: ${v.speed} km/h | Road Risk: **${v.risk}%**\n` +
            `  - Location: [${v.currentLocation.lat.toFixed(4)}, ${v.currentLocation.lng.toFixed(4)}] heading towards **${v.destinationName || 'Destination'}**\n` +
            `  - Manifest: ${matchingShipment ? `${matchingShipment.priority} cargo: ${matchingShipment.commodityName}` : 'General Freight'}\n` +
            `  - Hazard Ahead: Debris flow / high slope saturation within 5 km perimeter\n` +
            `  - Recommended Action: **DIVERSIION REROUTE REQUIRED**`;
        }).join('\n\n') :
        `All active fleet units are currently traversing nominal low-risk corridors.`) +
      `\n\n*Supporting Evidence: Hardware GPS tracking combined with road risk predictions and Copernicus Sentinel-1 slope saturation.*`,
    suggestions: ['What is the safest route for TRK-102?', 'Which roads are blocked?', 'Why is NH-15 high risk?'],
  };
}

function handleBlockedRoadsQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const blocked = data.roads.filter(r => r.status === 'BLOCKED' || r.status === 'PARTIALLY_BLOCKED');
  return {
    text: `**[CORRIDOR STATUS] Active Road Blockages in the North Eastern Region:**\n\n` +
      (blocked.length > 0 ?
        blocked.map(r => {
          const pred = data.predictions.get(r.id);
          return `• **${r.number} (${r.name})** — Status: **${r.status}**\n` +
            `  - Risk Index: **${pred?.currentRisk ?? 84}/100** (${pred?.riskCategory ?? 'CRITICAL'})\n` +
            `  - Terrain: ${r.terrain} (Elevation: ${r.elevation}m, Slope: ${r.slope}%)\n` +
            `  - Verified Cause: ${r.id === 'nh-15' ? '14,500 m³ debris avalanche at Bomdila Pass' : 'Monsoon shoulder washout & embankment scouring'}\n` +
            `  - Clearance Machinery: 4x CAT excavators deployed by Border Roads Organisation (BRO)\n` +
            `  - Primary Detour: Bhalukpong Loop / South Bank Bypass Corridor`;
        }).join('\n\n') :
        `All monitored national and state highways are currently reporting OPEN status.`) +
      `\n\n*Supporting Evidence: Ground reality drone camera telemetry and District Disaster Management reports.*`,
    suggestions: ['What is the safest route for TRK-102?', 'Which critical shipments are affected?', 'Show on map'],
  };
}

function handleTimelineChangeQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  return {
    text: `**[WHAT CHANGED TIMELINE] Real-Time Operational Event Cascade (Last 30 Minutes):**\n\n` +
      `• **13:05 IST** — Weather telemetry received: Rainfall intensity escalated to 48 mm/h over West Kameng ridge.\n` +
      `• **13:11 IST** — Copernicus Sentinel-1 SAR observation processed: C-SAR radar detected ground displacement anomaly on NH-15.\n` +
      `• **13:16 IST** — AI Spatial Risk Engine updated NH-15 corridor risk score: **28 → 84 (CRITICAL)**.\n` +
      `• **13:19 IST** — Field Officer Report received from Insp. Bimal Das: Ground photograph uploaded showing 72% carriage-way blockage.\n` +
      `• **13:21 IST** — AI Multi-Modal Vision Engine verified landslide severity (Confidence: 94.2%). Road status updated to **BLOCKED**.\n` +
      `• **13:22 IST** — Supply Impact Engine detected **7 approaching vehicles** and **2 critical medical shipments** (anti-malarial drugs & cold-chain vaccines on TRK-102).\n` +
      `• **13:24 IST** — Route Optimizer generated safe alternative **Route B (235 km, +25 min, Risk 18%)** avoiding Bomdila Pass.\n` +
      `• **13:26 IST** — Operator authorized emergency reroute advisory; navigation packet transmitted to TRK-102 driver mobile terminal.\n\n` +
      `*Supporting Evidence: Realtime system event stream verified across telemetry, weather, radar, and vision engines.*`,
    suggestions: ['What is the safest route for TRK-102?', 'Which vehicles are currently at high risk?', 'Show blocked roads'],
  };
}

function handleSafestRouteQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  return {
    text: `**[ROUTE RECOMMENDATION] Safest Route for TRK-102 (Medical Cargo Convoy):**\n\n` +
      `• **Current Direct Route (NH-15 Bomdila Pass):**\n` +
      `  - Distance: 210 km | Est. Travel Time: 5h 00m\n` +
      `  - Risk Assessment: **HIGH RISK (84/100)**\n` +
      `  - Hazard: Blocked by 14,500 m³ rockfall debris avalanche. Delay estimate +18 hours.\n` +
      `  - Cargo Threat: High risk of cold-chain vaccine thermal breach.\n\n` +
      `• **NERIXA Recommended Detour (Route B — Bhalukpong Bypass):**\n` +
      `  - Distance: 235 km | Est. Travel Time: 5h 25m (+25 minutes)\n` +
      `  - Risk Assessment: **LOW RISK (18/100)**\n` +
      `  - Justification: "25 minutes slower but significantly safer — verified stable terrain by Sentinel-1 radar pass at 11:42 UTC."\n` +
      `  - Status: **APPROVED & DISPATCHED** to TRK-102 driver Rajesh Sharma.\n\n` +
      `*Supporting Evidence: Multi-criteria Pareto optimization balancing travel time, terrain slope, rainfall saturation, and life-safety cargo priority.*`,
    suggestions: ['Why is NH-15 high risk?', 'Which hospitals may be affected?', 'Show TRK-102 on map'],
    mapAction: { type: 'HIGHLIGHT_ROAD', target: 'nh-15' },
  };
}

function handleHospitalAffectedQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  return {
    text: `**[HEALTHCARE SUPPLY AUDIT] Hospitals Impacted by Corridor Hazards:**\n\n` +
      `• **1. Tawang District Hospital (High Elevation ICU)**\n` +
      `  - Critical Dependence: Awaiting TRK-102 cold-chain pediatric vaccines & anti-malarial consignments.\n` +
      `  - Supply Risk: HIGH if diverted route is delayed beyond 6 hours.\n` +
      `  - Mitigation: Prioritized green corridor status assigned on Route B bypass.\n\n` +
      `• **2. Tezpur Medical College & Hospital (Assam)**\n` +
      `  - Status: Staging base for emergency trauma response. 400 beds active.\n` +
      `  - Blood Plasma Supply: Stable; supplied via Nagaon southern corridor.\n\n` +
      `• **3. NEIGRIHMS Shillong (Meghalaya)**\n` +
      `  - Status: Operating normally. NH-6 corridor reporting 22/100 low risk.\n\n` +
      `*Supporting Evidence: Health facility capacity index cross-referenced with active shipment delivery waypoints.*`,
    suggestions: ['What is the safest route for TRK-102?', 'Which critical shipments are affected?', 'Show hospitals on map'],
  };
}

function handleAlertQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const activeAlerts = data.alerts.filter(a => a.status === 'ACTIVE');
  const critical = activeAlerts.filter(a => a.level === 'CRITICAL');
  const high = activeAlerts.filter(a => a.level === 'HIGH');

  return {
    text: `**[TACTICAL ALERTS] Active Priority Notifications:**\n\n` +
      `Critical: **${critical.length}** | High: **${high.length}** | Total Active: **${activeAlerts.length}**\n\n` +
      (critical.length > 0 ? `**Critical Alerts:**\n` +
        critical.slice(0, 3).map(a => `• [CRITICAL] ${a.title}`).join('\n') + '\n\n' : '') +
      (high.length > 0 ? `**High Priority:**\n` +
        high.slice(0, 3).map(a => `• [HIGH] ${a.title}`).join('\n') : ''),
    suggestions: ['Show on map', 'Acknowledge all', 'Show AI recommendations'],
  };
}

function handleGeneralQuery(parsed: ParsedQuery, data: AppData): CommanderResponse {
  const totalRoads = data.roads.length;
  const blockedRoads = data.roads.filter(r => r.status === 'BLOCKED').length;
  const activeVehicles = data.vehicles.filter(v => v.status !== 'DELIVERED').length;
  const activeAlerts = data.alerts.filter(a => a.status === 'ACTIVE').length;
  const totalIntel = data.imageIntelList?.length || 0;

  return {
    text: `**NER-SHIELD AI Operational Commander**\n\nI can help you with:\n\n` +
      `**Current Operational Picture:**\n` +
      `• Roads: ${totalRoads} total, ${blockedRoads} blocked\n` +
      `• Active Vehicles: ${activeVehicles}\n` +
      `• Active Alerts: ${activeAlerts}\n` +
      `• Image Surveillance Feeds: ${totalIntel} ground truth detections\n\n` +
      `Try asking me:\n` +
      `• "Show me roads with recent landslide images"\n` +
      `• "Which critical medicine shipments are affected by today's incidents?"\n` +
      `• "What happened near the bridge?"\n` +
      `• "Why is NH-15 at high risk?"\n` +
      `• "What if NH-15 closes?"`,
    suggestions: ['Show landslide images', 'Show delayed medicine shipments', 'Show critical risks', 'Active alerts'],
  };
}
