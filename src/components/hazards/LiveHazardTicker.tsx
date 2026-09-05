'use client';

import React, { useState, useEffect } from 'react';
import {
  LiveFloodZone,
  LiveBridgeStatus,
  LiveAccidentAlert,
  LiveHighwayStatus,
} from '@/lib/hazards/liveHazardFeed';

interface LiveHazardTickerProps {
  floods: LiveFloodZone[];
  bridges: LiveBridgeStatus[];
  accidents: LiveAccidentAlert[];
  highways: LiveHighwayStatus[];
  onOpenMonitor: () => void;
  onLocateOnMap: (target: {
    lat: number;
    lng: number;
    title: string;
    category: 'FLOOD' | 'BRIDGE' | 'ACCIDENT' | 'HIGHWAY';
    details: string;
    percentage?: number;
  }) => void;
  lastUpdatedSecondsAgo: number;
}

export default function LiveHazardTicker({
  floods,
  bridges,
  accidents,
  highways,
  onOpenMonitor,
  onLocateOnMap,
  lastUpdatedSecondsAgo,
}: LiveHazardTickerProps) {
  const [tickerIndex, setTickerIndex] = useState(0);

  // Compile unified alerts for rotation
  const items: Array<{
    type: 'FLOOD' | 'BRIDGE' | 'ACCIDENT' | 'HIGHWAY';
    badge: string;
    badgeBg: string;
    badgeColor: string;
    title: string;
    highlight: string;
    lat: number;
    lng: number;
    details: string;
    percentage?: number;
  }> = [];

  // 1. Top critical floods
  floods.forEach((f) => {
    items.push({
      type: 'FLOOD',
      badge: `🌊 FLOOD ${f.floodPercentage}%`,
      badgeBg: 'rgba(56, 189, 248, 0.2)',
      badgeColor: '#38bdf8',
      title: f.name,
      highlight: `${f.waterLevelMeters > 0 ? '+' : ''}${f.waterLevelMeters}m above danger mark • ${f.trend}`,
      lat: f.location.lat,
      lng: f.location.lng,
      details: `Flood Level: ${f.floodPercentage}%. ${f.waterLevelMeters > 0 ? '+' : ''}${f.waterLevelMeters}m above danger mark. Submerged stretch: ${f.affectedRoadLengthKm}km. ${f.divertedRoute}`,
      percentage: f.floodPercentage,
    });
  });

  // 2. Critical bridges
  bridges.forEach((b) => {
    const isCollapsed = b.condition === 'COLLAPSED';
    items.push({
      type: 'BRIDGE',
      badge: `🌉 BRIDGE ${b.condition.replace(/_/g, ' ')}`,
      badgeBg: isCollapsed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(249, 115, 22, 0.25)',
      badgeColor: isCollapsed ? '#f87171' : '#fb923c',
      title: b.name,
      highlight: isCollapsed ? 'Center span dropped • CLOSED' : `Health: ${b.healthPercentage}% • ${b.pierStatus}`,
      lat: b.location.lat,
      lng: b.location.lng,
      details: `Condition: ${b.condition}. ${b.description} Diversion: ${b.diversion}`,
      percentage: b.healthPercentage,
    });
  });

  // 3. Accidents
  accidents.forEach((a) => {
    items.push({
      type: 'ACCIDENT',
      badge: `🚨 ACCIDENT ${a.severity}`,
      badgeBg: 'rgba(239, 68, 68, 0.25)',
      badgeColor: '#f87171',
      title: `${a.highway} — ${a.locationName}`,
      highlight: `${a.lanesBlocked} • Clearance: ~${a.clearanceEtaMinutes}m`,
      lat: a.location.lat,
      lng: a.location.lng,
      details: `${a.title}. ${a.lanesBlocked}. Vehicles: ${a.vehiclesInvolved}. Alternate: ${a.alternateRoute}`,
      percentage: a.blockagePercentage,
    });
  });

  // 4. Highway status
  highways.forEach((h) => {
    const isBlocked = h.status === 'BLOCKED';
    items.push({
      type: 'HIGHWAY',
      badge: `🛣️ ${h.highway} ${h.status}`,
      badgeBg: isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)',
      badgeColor: isBlocked ? '#f87171' : '#fb923c',
      title: `${h.name} (${h.sector})`,
      highlight: `Speed: ${h.averageSpeedKmh} km/h • Delay: +${h.delaysMinutes}m`,
      lat: h.location.lat,
      lng: h.location.lng,
      details: `Status: ${h.status}. Speed: ${h.averageSpeedKmh} km/h (Normal: ${h.normalSpeedKmh} km/h). Delay: +${h.delaysMinutes} mins. Advisory: ${h.recommendedAction}`,
      percentage: h.currentRisk,
    });
  });

  // Rotate ticker item every 5 seconds
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  const currentItem = items[tickerIndex] || items[0];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '5px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        gap: '10px',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Left: Broadcast Label & Rotating Alert */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '320px', overflow: 'hidden' }}>
        <button
          onClick={onOpenMonitor}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#f87171',
            fontWeight: 800,
            fontSize: '10px',
            cursor: 'pointer',
            flexShrink: 0,
            letterSpacing: '0.04em',
          }}
          title="Click to open Full Live Disaster & Highway Monitor"
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.2s infinite' }} />
          <span>LIVE HAZARD TELEMETRY</span>
        </button>

        {currentItem && (
          <div
            onClick={() =>
              onLocateOnMap({
                lat: currentItem.lat,
                lng: currentItem.lng,
                title: currentItem.title,
                category: currentItem.type,
                details: currentItem.details,
                percentage: currentItem.percentage,
              })
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              transition: 'opacity 0.25s ease',
            }}
            title="Click to center and focus on map"
          >
            <span
              style={{
                background: currentItem.badgeBg,
                color: currentItem.badgeColor,
                fontWeight: 800,
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                flexShrink: 0,
              }}
            >
              {currentItem.badge}
            </span>
            <span style={{ fontWeight: 700, color: '#f8fafc' }}>{currentItem.title}:</span>
            <span style={{ color: '#cbd5e1' }}>{currentItem.highlight}</span>
            <span style={{ color: '#38bdf8', fontSize: '10px', textDecoration: 'underline', flexShrink: 0 }}>
              (Locate on Map 📍)
            </span>
          </div>
        )}
      </div>

      {/* Right: Quick actions & sensor freshness */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          Sensors: <b style={{ color: '#34d399' }}>8 Active</b> • Sync: <b style={{ color: '#f8fafc' }}>{lastUpdatedSecondsAgo}s ago</b>
        </div>

        <button
          onClick={onOpenMonitor}
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>VIEW FULL MONITOR</span>
          <span style={{ fontSize: '9px' }}>↗</span>
        </button>
      </div>
    </div>
  );
}
