// ============================================================
// NER-SHIELD AI — Route Optimizer
// Multi-criteria risk-aware pathfinding
// ============================================================

import type { Road, RouteOption, RouteRequest, RouteSegment, GeoPoint, RiskPrediction } from '@/lib/types';
import { getRiskLevel } from '@/lib/constants';

// --- Road Graph for Pathfinding ---
interface GraphNode {
  id: string;
  location: GeoPoint;
  connectedEdges: GraphEdge[];
}

interface GraphEdge {
  roadId: string;
  from: string;
  to: string;
  distance: number; // km
  travelTime: number; // minutes
  risk: number; // 0-100
  reliability: number; // 0-100
  road: Road;
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

// Build graph from roads
export function buildRoadGraph(roads: Road[], predictions: Map<string, RiskPrediction>): { nodes: Map<string, GraphNode>; edges: GraphEdge[] } {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  for (const road of roads) {
    if (road.path.length < 2) continue;

    const startPoint = road.path[0];
    const endPoint = road.path[road.path.length - 1];
    const startId = `${startPoint.lat.toFixed(2)}_${startPoint.lng.toFixed(2)}`;
    const endId = `${endPoint.lat.toFixed(2)}_${endPoint.lng.toFixed(2)}`;

    if (!nodes.has(startId)) {
      nodes.set(startId, { id: startId, location: startPoint, connectedEdges: [] });
    }
    if (!nodes.has(endId)) {
      nodes.set(endId, { id: endId, location: endPoint, connectedEdges: [] });
    }

    const prediction = predictions.get(road.id);
    const risk = prediction?.currentRisk ?? 30;
    const reliability = 100 - risk;
    const avgSpeed = Math.max(road.speedLimit * (1 - risk / 200), 15);
    const travelTime = (road.length / avgSpeed) * 60;

    const edge: GraphEdge = {
      roadId: road.id,
      from: startId,
      to: endId,
      distance: road.length,
      travelTime,
      risk,
      reliability,
      road,
    };

    edges.push(edge);
    nodes.get(startId)!.connectedEdges.push(edge);

    // Bidirectional
    const reverseEdge: GraphEdge = { ...edge, from: endId, to: startId };
    edges.push(reverseEdge);
    nodes.get(endId)!.connectedEdges.push(reverseEdge);
  }

  return { nodes, edges };
}

// Find closest node to a point
function findClosestNode(point: GeoPoint, nodes: Map<string, GraphNode>): string | null {
  let closest: string | null = null;
  let minDist = Infinity;

  for (const [id, node] of nodes) {
    const dist = getDistanceKm(point, node.location);
    if (dist < minDist) {
      minDist = dist;
      closest = id;
    }
  }

  return closest;
}

// Dijkstra with weighted scoring
function dijkstra(
  nodes: Map<string, GraphNode>,
  startId: string,
  endId: string,
  request: RouteRequest,
  predictions: Map<string, RiskPrediction>
): { path: string[]; edges: GraphEdge[]; totalScore: number } | null {
  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge: GraphEdge } | null>();
  const visited = new Set<string>();

  for (const id of nodes.keys()) {
    dist.set(id, Infinity);
    prev.set(id, null);
  }
  dist.set(startId, 0);

  const queue = [{ id: startId, score: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.score - b.score);
    const current = queue.shift()!;
    
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    if (current.id === endId) break;

    const node = nodes.get(current.id);
    if (!node) continue;

    for (const edge of node.connectedEdges) {
      if (visited.has(edge.to)) continue;

      // Skip blocked roads if requested
      if (request.avoidBlocked && edge.road.status === 'BLOCKED') continue;
      if (request.avoidHighRisk && edge.risk > 70) continue;

      // Calculate edge score based on optimization mode
      let edgeScore: number;
      switch (request.mode) {
        case 'FASTEST':
          edgeScore = edge.travelTime * 1.0 + edge.risk * 0.3 + edge.distance * 0.1;
          break;
        case 'SAFEST':
          edgeScore = edge.risk * 1.5 + edge.travelTime * 0.3 + edge.distance * 0.1;
          break;
        case 'LOWEST_COST':
          edgeScore = edge.distance * 1.0 + edge.risk * 0.5 + edge.travelTime * 0.3;
          break;
        default:
          edgeScore = edge.travelTime * 0.4 + edge.risk * 0.4 + edge.distance * 0.2;
      }

      // Priority boost for critical shipments on risky roads
      if (request.priority === 'CRITICAL' && edge.risk > 50) {
        edgeScore *= 1.5;
      }

      const newDist = dist.get(current.id)! + edgeScore;
      if (newDist < dist.get(edge.to)!) {
        dist.set(edge.to, newDist);
        prev.set(edge.to, { nodeId: current.id, edge });
        queue.push({ id: edge.to, score: newDist });
      }
    }
  }

  if (dist.get(endId) === Infinity) return null;

  // Reconstruct path
  const path: string[] = [];
  const edges: GraphEdge[] = [];
  let current: string | null = endId;

  while (current && current !== startId) {
    path.unshift(current);
    const prevEntry = prev.get(current);
    if (prevEntry) {
      edges.unshift(prevEntry.edge);
      current = prevEntry.nodeId;
    } else {
      break;
    }
  }
  path.unshift(startId);

  return { path, edges, totalScore: dist.get(endId)! };
}

// Generate route options
export function optimizeRoutes(
  request: RouteRequest,
  roads: Road[],
  predictions: Map<string, RiskPrediction>
): RouteOption[] {
  const { nodes } = buildRoadGraph(roads, predictions);

  const startNode = findClosestNode(request.origin, nodes);
  const endNode = findClosestNode(request.destination, nodes);

  if (!startNode || !endNode) return [];

  const modes: Array<{ mode: RouteRequest['mode']; label: string }> = [
    { mode: 'FASTEST', label: 'Fastest Route' },
    { mode: 'SAFEST', label: 'Safest Route' },
    { mode: 'LOWEST_COST', label: 'Most Efficient Route' },
  ];

  const results: RouteOption[] = [];

  for (let i = 0; i < modes.length; i++) {
    const { mode, label } = modes[i];
    const modifiedRequest = { ...request, mode: mode as RouteRequest['mode'] };
    const result = dijkstra(nodes, startNode, endNode, modifiedRequest, predictions);

    if (!result) continue;

    const totalDistance = result.edges.reduce((s, e) => s + e.distance, 0);
    const totalTime = result.edges.reduce((s, e) => s + e.travelTime, 0);
    const avgRisk = result.edges.length > 0 
      ? Math.round(result.edges.reduce((s, e) => s + e.risk, 0) / result.edges.length)
      : 0;
    const avgReliability = 100 - avgRisk;

    // Composite score (lower is better)
    const score = result.totalScore;

    const routePath: GeoPoint[] = [];
    for (const edge of result.edges) {
      routePath.push(...edge.road.path);
    }

    const roadSegments: RouteSegment[] = result.edges.map(e => ({
      roadId: e.roadId,
      roadName: `${e.road.number} - ${e.road.name}`,
      distance: e.distance,
      risk: e.risk,
      condition: e.road.condition,
      traffic: e.road.trafficLevel,
    }));

    const reasons: string[] = [];
    if (avgRisk < 30) reasons.push('Low disruption risk');
    if (avgRisk < 20) reasons.push('Minimal landslide exposure');
    if (avgReliability > 80) reasons.push('High route reliability');
    if (totalTime < 240) reasons.push('Quick delivery time');
    const hasGoodRoads = result.edges.every(e => e.road.condition !== 'POOR' && e.road.condition !== 'VERY_POOR');
    if (hasGoodRoads) reasons.push('Good road conditions throughout');
    const lowTraffic = result.edges.every(e => e.road.trafficLevel !== 'CONGESTED');
    if (lowTraffic) reasons.push('No traffic congestion');
    if (request.priority === 'CRITICAL' && avgRisk < 30) reasons.push('Suitable for critical shipment');

    results.push({
      id: `route-${String.fromCharCode(65 + i)}`,
      name: `Route ${String.fromCharCode(65 + i)} — ${label}`,
      path: routePath,
      roadIds: result.edges.map(e => e.roadId),
      distance: Math.round(totalDistance),
      estimatedTime: Math.round(totalTime),
      risk: avgRisk,
      reliability: avgReliability,
      score: Math.round(score * 100) / 100,
      isRecommended: false,
      reasons,
      roadSegments,
    });
  }

  // Mark the best route as recommended
  if (results.length > 0) {
    // For critical priority, prefer safest
    const sortKey = request.priority === 'CRITICAL' ? 'risk' : 'score';
    results.sort((a, b) => {
      if (sortKey === 'risk') return a.risk - b.risk;
      return a.score - b.score;
    });
    results[0].isRecommended = true;
  }

  return results;
}

// Explain route recommendation
export function explainRouteChoice(recommended: RouteOption, alternatives: RouteOption[]): string {
  const parts = [`Route ${recommended.name} is recommended.`];
  
  if (alternatives.length > 0) {
    const riskiest = alternatives.reduce((a, b) => a.risk > b.risk ? a : b);
    if (riskiest.risk > recommended.risk + 10) {
      parts.push(`Risk is ${riskiest.risk - recommended.risk}% lower than ${riskiest.name}.`);
    }
    const fastest = alternatives.reduce((a, b) => a.estimatedTime < b.estimatedTime ? a : b);
    if (fastest.estimatedTime < recommended.estimatedTime) {
      const diff = recommended.estimatedTime - fastest.estimatedTime;
      parts.push(`Adds ${diff} minutes vs fastest route but significantly reduces risk.`);
    }
  }

  parts.push(...recommended.reasons);

  return parts.join(' ');
}
