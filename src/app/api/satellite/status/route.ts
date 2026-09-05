// ============================================================
// NERIXA — Next.js API Route for Copernicus Satellite Connection Status
// Verifies backend credentials and Copernicus Data Space connection
// ============================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = process.env.COPERNICUS_CLIENT_ID;
  const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;

  const isConfigured = Boolean(clientId && clientSecret && clientId.trim() !== '' && clientSecret.trim() !== '');

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      connected: false,
      status: 'NOT_CONFIGURED',
      provider: 'Copernicus Data Space Ecosystem (CDSE)',
      message: 'Satellite API Not Configured',
      instructions: [
        '1. Register a free account at https://dataspace.copernicus.eu',
        '2. Navigate to User Profile -> User API Keys and generate an OAuth2 Client ID and Secret.',
        '3. Add the following to your .env.local file:',
        '   COPERNICUS_CLIENT_ID=your_client_id_here',
        '   COPERNICUS_CLIENT_SECRET=your_client_secret_here',
        '4. Restart the development server to activate live Sentinel-1 & Sentinel-2 querying.'
      ],
      quotaMode: 'FREE_USER_QUOTA_MVP',
      supportedSatellites: ['Sentinel-1 SAR', 'Sentinel-2 Optical (MSI)'],
    });
  }

  // Attempt token handshake if credentials exist
  try {
    const tokenUrl = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId!);
    params.append('client_secret', clientSecret!);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!tokenRes.ok) {
      return NextResponse.json({
        configured: true,
        connected: false,
        status: 'AUTH_FAILED',
        provider: 'Copernicus Data Space Ecosystem (CDSE)',
        message: 'Authentication failed with Copernicus Identity Service. Please verify Client ID and Secret.',
        statusCode: tokenRes.status,
      });
    }

    const tokenData = await tokenRes.json();

    return NextResponse.json({
      configured: true,
      connected: true,
      status: 'CONNECTED',
      provider: 'Copernicus Data Space Ecosystem (CDSE)',
      message: 'Connected successfully to Copernicus Data Space Ecosystem',
      expiresIn: tokenData.expires_in,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      connected: false,
      status: 'NETWORK_TIMEOUT',
      provider: 'Copernicus Data Space Ecosystem (CDSE)',
      message: error instanceof Error ? error.message : 'Connection to Copernicus identity server timed out',
    });
  }
}
