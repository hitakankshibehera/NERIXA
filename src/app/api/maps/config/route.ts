// ============================================================
// NER-SHIELD AI — Map Config Status API
// Reports configuration status without leaking secret credentials
// ============================================================

import { NextResponse } from 'next/server';

export async function GET() {
  const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  const isKeyConfigured = envKey.trim().length > 10;

  return NextResponse.json({
    status: 'ok',
    isKeyConfigured,
    hasServerKey: !!process.env.GOOGLE_MAPS_API_KEY,
    hasPublicKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    supportedModes: ['ROADMAP', 'SATELLITE', 'HYBRID', 'TERRAIN', 'STREET VIEW'],
    defaultRegion: 'North Eastern Region (NER, India)',
    center: { lat: 26.1584, lng: 92.8317 },
    zoom: 7,
    attributionNotice: 'Follows official Google Maps Platform API terms & Copernicus Sentinel data policies.',
    timestamp: new Date().toISOString(),
  });
}
