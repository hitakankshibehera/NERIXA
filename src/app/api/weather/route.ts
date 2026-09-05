// ============================================================
// NER-SHIELD AI — Next.js API Route for Real-Time Weather
// Serves live Stormglass & OpenWeather data to frontend
// ============================================================

import { NextResponse } from 'next/server';
import { getLiveNERWeather, convertToWeatherData } from '@/lib/weather/weatherService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reports = await getLiveNERWeather();
    const weatherData = convertToWeatherData(reports);

    return NextResponse.json({
      success: true,
      provider: 'Stormglass.io (NOAA/ECMWF) + OpenWeather Sensor Array',
      count: reports.length,
      timestamp: new Date().toISOString(),
      reports,
      weatherData,
    });
  } catch (error) {
    console.error('Weather API route error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch weather data',
      },
      { status: 500 }
    );
  }
}
