import { NextRequest, NextResponse } from 'next/server';
import { SEED_ROADS, SEED_VEHICLES, SEED_SHIPMENTS, SEED_HOSPITALS, SEED_WAREHOUSES } from '@/data/seed';
import { analyzeRoadImage } from '@/lib/ai/visionEngine';
import { analyzeSpatialIncidentImpact } from '@/lib/spatial/spatialAnalysis';
import { pushIncidentToRealtimeDb, pushAlertToRealtimeDb, publishSystemEvent } from '@/lib/firebase';
import { Incident, Alert, LiveSystemEvent, IncidentType } from '@/lib/types';
import { IncidentCategory } from '@/lib/types/imageIntelligence';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      imageUrl,
      photoBase64,
      latitude,
      longitude,
      incidentType = 'LANDSLIDE',
      severity = 8,
      description = '',
      reportedBy = 'Field Officer (Mobile Terminal)',
    } = body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Valid GPS latitude and longitude are required' },
        { status: 400 }
      );
    }

    const timestampIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString('en-IN', { hour12: false });

    // Step 1 & 2: AI Computer Vision Image Analysis
    const categoryMap: Record<string, IncidentCategory> = {
      LANDSLIDE: 'LANDSLIDE',
      FLOOD: 'FLOODED_ROAD',
      ROAD_DAMAGE: 'DAMAGED_ROAD',
      BRIDGE_DAMAGE: 'DAMAGED_BRIDGE',
      TRAFFIC: 'TRAFFIC_CONGESTION',
      ROAD_BLOCKED: 'ROAD_BLOCKAGE',
    };
    const suggestedCategory: IncidentCategory = categoryMap[incidentType] || 'LANDSLIDE';

    const aiDetection = analyzeRoadImage(
      {
        sourceType: 'FIELD_OFFICER',
        imageUrl: imageUrl || photoBase64 || '/reality/landslide_aerial_reality.jpg',
        userDescription: description,
        suggestedType: suggestedCategory,
      },
      SEED_ROADS
    );

    // Step 3 & 4: Road Matching & Spatial Incident Analysis (Section 12)
    const incidentId = `inc-field-${Date.now()}`;
    const candidateIncident: Incident = {
      id: incidentId,
      type: incidentType as IncidentType,
      severity: Number(severity) || (aiDetection.severity === 'CRITICAL' ? 9 : 7),
      location: { lat, lng },
      roadBlockagePercent: aiDetection.roadBlockagePercent || 70,
      description: description || aiDetection.description,
      reportedBy,
      reportedAt: timestampIso,
      status: 'VERIFIED',
      imageUrl: imageUrl || photoBase64,
      districtId: 'west-kameng',
      stateId: 'arunachal',
    };

    const spatialImpact = analyzeSpatialIncidentImpact(
      candidateIncident,
      SEED_ROADS,
      SEED_VEHICLES,
      SEED_SHIPMENTS,
      SEED_HOSPITALS,
      SEED_WAREHOUSES
    );

    candidateIncident.roadId = spatialImpact.matchedRoadId;
    candidateIncident.roadName = spatialImpact.matchedRoadName;
    candidateIncident.aiAnalysis = {
      type: incidentType as IncidentType,
      severity: candidateIncident.severity,
      roadBlockage: candidateIncident.roadBlockagePercent || 70,
      confidence: aiDetection.confidence,
      affectedVehicles: spatialImpact.affectedVehicles.length,
      affectedShipments: spatialImpact.affectedShipments.length,
      estimatedClearTime: '6-8 hours (Heavy Earthmover Squad Dispatched)',
      recommendations: [
        aiDetection.recommendedAction,
        spatialImpact.recommendedAction,
        'Reroute critical medical supply vehicles via alternate southern bypass.',
      ],
      debrisVolume: aiDetection.debrisVolumeM3 ? `${aiDetection.debrisVolumeM3.toLocaleString()} m³` : '9,400 m³',
    };

    // Step 5: Push Incident to Firebase Realtime Database
    await pushIncidentToRealtimeDb(candidateIncident);

    // Step 6: Create Alert & Broadcast System Events (Section 14 & 19)
    const alertId = `alt-${Date.now()}`;
    const alert: Alert = {
      id: alertId,
      level: candidateIncident.severity >= 8 ? 'CRITICAL' : 'HIGH',
      title: `${incidentType} VERIFIED: ${spatialImpact.matchedRoadName}`,
      message: `${aiDetection.description} ${spatialImpact.affectedVehicles.length} vehicles and ${spatialImpact.affectedShipments.length} critical shipments affected.`,
      category: incidentType,
      roadId: spatialImpact.matchedRoadId,
      districtId: candidateIncident.districtId,
      status: 'ACTIVE',
      createdAt: timestampIso,
      aiRecommendation: spatialImpact.recommendedAction,
    };

    await pushAlertToRealtimeDb(alert);

    // Timeline event sequence (Section 19)
    const eventFieldReport: LiveSystemEvent = {
      id: `evt-rep-${Date.now()}`,
      type: 'field_report_received',
      timestamp: timeFormatted,
      timestampMs: Date.now(),
      title: `Field report received from ${reportedBy}`,
      description: `GPS [${lat.toFixed(4)}, ${lng.toFixed(4)}] matched to ${spatialImpact.matchedRoadName}`,
      entityId: incidentId,
      severity: 'INFO',
      source: 'LIVE',
    };
    await publishSystemEvent(eventFieldReport);

    const eventAiClass: LiveSystemEvent = {
      id: `evt-ai-${Date.now() + 1}`,
      type: 'incident_created',
      timestamp: timeFormatted,
      timestampMs: Date.now() + 100,
      title: `AI classified ${incidentType} (${aiDetection.confidence}% confidence)`,
      description: `Blockage: ${candidateIncident.roadBlockagePercent}%. Road: ${spatialImpact.matchedRoadName}`,
      entityId: incidentId,
      severity: 'WARNING',
      source: 'LIVE',
    };
    await publishSystemEvent(eventAiClass);

    const eventVehiclesAffected: LiveSystemEvent = {
      id: `evt-aff-${Date.now() + 2}`,
      type: 'shipment_at_risk',
      timestamp: timeFormatted,
      timestampMs: Date.now() + 200,
      title: `${spatialImpact.affectedVehicles.length} vehicles & ${spatialImpact.affectedShipments.length} shipments affected`,
      description: `Immediate corridor safety check initiated. Approaching units: ${spatialImpact.affectedVehicles.map(v => v.vehicleId).join(', ') || 'None in direct path'}`,
      entityId: incidentId,
      severity: 'CRITICAL',
      source: 'LIVE',
    };
    await publishSystemEvent(eventVehiclesAffected);

    return NextResponse.json({
      success: true,
      incident: candidateIncident,
      spatialImpact,
      alert,
      aiDetection,
    });
  } catch (error: unknown) {
    console.error('Incident pipeline error:', error);
    const msg = error instanceof Error ? error.message : 'Internal pipeline error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
