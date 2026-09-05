// ============================================================
// NER-SHIELD AI — North Eastern Region Geospatial Search Index
// Comprehensive local search index for all 8 NER states,
// arterial highway corridors, hospitals, supply depots, and coordinates.
// ============================================================

import type { SearchResultItem } from '@/lib/types/googleMaps';

export const NER_SEARCH_INDEX: SearchResultItem[] = [
  // ── Capital Cities & Logistics Nodes ──
  {
    id: 'loc-ghy',
    title: 'Guwahati (Metro Gateway)',
    subtitle: 'Kamrup Metropolitan, Assam — Primary Northeast Logistics Terminal',
    category: 'CITY',
    lat: 26.1821,
    lng: 91.7486,
    zoom: 12,
  },
  {
    id: 'loc-shl',
    title: 'Shillong (Capital Corridor)',
    subtitle: 'East Khasi Hills, Meghalaya — NH-6 Hill Artery',
    category: 'CITY',
    lat: 25.5788,
    lng: 91.8933,
    zoom: 13,
  },
  {
    id: 'loc-ita',
    title: 'Itanagar (State Capital)',
    subtitle: 'Papum Pare, Arunachal Pradesh — Northern Frontier Foothills',
    category: 'CITY',
    lat: 27.0844,
    lng: 93.6053,
    zoom: 13,
  },
  {
    id: 'loc-aiz',
    title: 'Aizawl (Southern Hub)',
    subtitle: 'Aizawl District, Mizoram — NH-54 Mountain Corridor',
    category: 'CITY',
    lat: 23.7307,
    lng: 92.7173,
    zoom: 13,
  },
  {
    id: 'loc-imp',
    title: 'Imphal (Valley Junction)',
    subtitle: 'Imphal West, Manipur — Asian Highway 1 Gateway',
    category: 'CITY',
    lat: 24.817,
    lng: 93.9368,
    zoom: 13,
  },
  {
    id: 'loc-koh',
    title: 'Kohima (Highland Post)',
    subtitle: 'Kohima District, Nagaland — NH-29 Lifeline Corridor',
    category: 'CITY',
    lat: 25.6701,
    lng: 94.1077,
    zoom: 13,
  },
  {
    id: 'loc-agt',
    title: 'Agartala (Western Plain)',
    subtitle: 'West Tripura, Tripura — Border Economic Belt',
    category: 'CITY',
    lat: 23.8315,
    lng: 91.2868,
    zoom: 13,
  },
  {
    id: 'loc-gtk',
    title: 'Gangtok (Himalayan Ridge)',
    subtitle: 'East Sikkim, Sikkim — NH-10 Teesta Gorge Road',
    category: 'CITY',
    lat: 27.3389,
    lng: 88.6065,
    zoom: 13,
  },
  {
    id: 'loc-slc',
    title: 'Silchar (Barak Valley Gateway)',
    subtitle: 'Cachar, Assam — Crucial Multi-State Transshipment Node',
    category: 'CITY',
    lat: 24.8333,
    lng: 92.7789,
    zoom: 12,
  },
  {
    id: 'loc-bmd',
    title: 'Bomdila Pass (High Risk)',
    subtitle: 'West Kameng, Arunachal Pradesh — High Elevation Landslide Sector',
    category: 'CITY',
    lat: 27.2645,
    lng: 92.4231,
    zoom: 13,
  },

  // ── National Highway Corridors ──
  {
    id: 'road-nh15',
    title: 'NH-15 (Tezpur-Bomdila Artery)',
    subtitle: 'Arunachal Frontier Route — Mountainous, High Landslide Sensitivity',
    category: 'ROAD',
    lat: 27.2645,
    lng: 92.4231,
    zoom: 11,
    associatedId: 'road-1',
  },
  {
    id: 'road-nh27',
    title: 'NH-27 (East-West Corridor)',
    subtitle: 'Assam Valley Superhighway — Active Brahmaputra Flood Inundation Sector',
    category: 'ROAD',
    lat: 26.35,
    lng: 92.68,
    zoom: 11,
    associatedId: 'road-2',
  },
  {
    id: 'road-nh54',
    title: 'NH-54 (Silchar to Aizawl Mountain Route)',
    subtitle: 'Mizoram Lifeline Highway — Active Heavy Earthmoving & Rockfall',
    category: 'ROAD',
    lat: 24.58,
    lng: 92.72,
    zoom: 11,
    associatedId: 'road-3',
  },
  {
    id: 'road-nh13',
    title: 'NH-13 (Trans-Arunachal Highway)',
    subtitle: 'Sela-Tawang Strategic Corridor — InSAR Monitored Glacial Runoff',
    category: 'ROAD',
    lat: 27.5,
    lng: 92.1,
    zoom: 10,
    associatedId: 'road-4',
  },
  {
    id: 'road-nh37',
    title: 'NH-37 (Kaziranga Buffer Corridor)',
    subtitle: 'Golaghat / Nagaon, Assam — Wildlife Corridor & Monsoon Flash Inundation',
    category: 'ROAD',
    lat: 26.58,
    lng: 93.17,
    zoom: 11,
  },

  // ── Critical Hospitals & Medical Nodes ──
  {
    id: 'hosp-gmch',
    title: 'Gauhati Medical College & Hospital (GMCH)',
    subtitle: 'Guwahati, Assam — Level 1 Regional Trauma & Intensive Care Center',
    category: 'HOSPITAL',
    lat: 26.1582,
    lng: 91.7719,
    zoom: 15,
  },
  {
    id: 'hosp-neigrihms',
    title: 'NEIGRIHMS Super-Specialty Medical Institute',
    subtitle: 'Mawdiangdiang, Shillong, Meghalaya — Apex Tertiary Care Hub',
    category: 'HOSPITAL',
    lat: 25.5997,
    lng: 91.9362,
    zoom: 15,
  },
  {
    id: 'hosp-trihms',
    title: 'Tomo Riba State Institute (TRIHMS)',
    subtitle: 'Naharlagun, Arunachal Pradesh — Key Mountain Emergency Center',
    category: 'HOSPITAL',
    lat: 27.1065,
    lng: 93.6932,
    zoom: 15,
  },
  {
    id: 'hosp-rims',
    title: 'Regional Institute of Medical Sciences (RIMS)',
    subtitle: 'Lamphelpat, Imphal, Manipur — Critical Blood & Trauma Center',
    category: 'HOSPITAL',
    lat: 24.8214,
    lng: 93.9167,
    zoom: 15,
  },

  // ── Warehouses & Supply Terminals ──
  {
    id: 'wh-ghy',
    title: 'Guwahati Central Logistics Depot (Food & Medicine)',
    subtitle: 'Amingaon Inland Container Depot, Assam — 12,000 MT Storage Capacity',
    category: 'WAREHOUSE',
    lat: 26.195,
    lng: 91.685,
    zoom: 14,
  },
  // ── Mountain Passes ──
  {
    id: 'pass-sela',
    title: 'Sela Pass (4,170 m)',
    subtitle: 'Tawang-West Kameng Border, Arunachal Pradesh — High-Altitude Snow & Landslide Corridor',
    category: 'PASS',
    lat: 27.5050,
    lng: 92.1030,
    zoom: 13,
  },
  {
    id: 'pass-bomdila',
    title: 'Bomdila Pass (2,850 m)',
    subtitle: 'West Kameng, Arunachal Pradesh — NH-15 Critical Mountain Corridor',
    category: 'PASS',
    lat: 27.2645,
    lng: 92.4231,
    zoom: 13,
  },
  {
    id: 'pass-nathula',
    title: 'Nathu La Pass (4,310 m)',
    subtitle: 'East Sikkim — High Himalayan Mountain Pass on Old Silk Route',
    category: 'PASS',
    lat: 27.3860,
    lng: 88.8310,
    zoom: 13,
  },

  // ── Airports ──
  {
    id: 'air-gau',
    title: 'Lokpriya Gopinath Bordoloi International Airport (GAU)',
    subtitle: 'Guwahati, Assam — Northeast Apex Aviation Gateway & Air Cargo Terminal',
    category: 'AIRPORT',
    lat: 26.1061,
    lng: 91.5859,
    zoom: 13,
  },
  {
    id: 'air-dib',
    title: 'Dibrugarh Airport (DIB)',
    subtitle: 'Mohanbari, Dibrugarh, Assam — Upper Assam Logistics & Emergency Lifeline',
    category: 'AIRPORT',
    lat: 27.4839,
    lng: 95.0189,
    zoom: 13,
  },
  {
    id: 'air-imf',
    title: 'Bir Tikendrajit International Airport (IMF)',
    subtitle: 'Imphal, Manipur — Manipur Valley Air Freight Terminal',
    category: 'AIRPORT',
    lat: 24.7600,
    lng: 93.8967,
    zoom: 13,
  },
  {
    id: 'air-shl',
    title: 'Shillong Airport (SHL)',
    subtitle: 'Umroi, Ri-Bhoi, Meghalaya — Regional Hill Connectivity Airport',
    category: 'AIRPORT',
    lat: 25.7037,
    lng: 91.9787,
    zoom: 13,
  },
  {
    id: 'air-ixa',
    title: 'Maharaja Bir Bikram Airport (IXA)',
    subtitle: 'Agartala, Tripura — Second Busiest Airport in North East',
    category: 'AIRPORT',
    lat: 23.8869,
    lng: 91.2405,
    zoom: 13,
  },

  // ── Major Railway Stations ──
  {
    id: 'rail-ghy',
    title: 'Guwahati Railway Station',
    subtitle: 'Paltan Bazaar, Guwahati, Assam — NF Railway Apex Freight & Passenger Junction',
    category: 'RAILWAY',
    lat: 26.1834,
    lng: 91.7523,
    zoom: 14,
  },
  {
    id: 'rail-dmp',
    title: 'Dimapur Railway Station',
    subtitle: 'Dimapur, Nagaland — Sole Railhead Serving Nagaland & Manipur Supplies',
    category: 'RAILWAY',
    lat: 25.9126,
    lng: 93.7314,
    zoom: 14,
  },
  {
    id: 'rail-nhln',
    title: 'Naharlagun Railway Station',
    subtitle: 'Papum Pare, Arunachal Pradesh — Arunachal Frontier Rail Terminal',
    category: 'RAILWAY',
    lat: 27.1084,
    lng: 93.6934,
    zoom: 14,
  },

  // ── States ──
  { id: 'state-as', title: 'Assam', subtitle: 'State of Assam (Capital: Dispur) — Brahmaputra Valley & Arterial Highway System', category: 'STATE', lat: 26.2006, lng: 92.9376, zoom: 8 },
  { id: 'state-ar', title: 'Arunachal Pradesh', subtitle: 'State of Arunachal Pradesh (Capital: Itanagar) — Eastern Himalayan Mountain Frontier', category: 'STATE', lat: 27.0844, lng: 93.6053, zoom: 8 },
  { id: 'state-ml', title: 'Meghalaya', subtitle: 'State of Meghalaya (Capital: Shillong) — Khasi & Garo Highlands', category: 'STATE', lat: 25.4670, lng: 91.3662, zoom: 8 },
  { id: 'state-mn', title: 'Manipur', subtitle: 'State of Manipur (Capital: Imphal) — Imphal Valley & Hill Corridors', category: 'STATE', lat: 24.6637, lng: 93.9063, zoom: 8 },
  { id: 'state-mz', title: 'Mizoram', subtitle: 'State of Mizoram (Capital: Aizawl) — Southern Mountain Ridge Corridors', category: 'STATE', lat: 23.1645, lng: 92.9376, zoom: 8 },
  { id: 'state-nl', title: 'Nagaland', subtitle: 'State of Nagaland (Capital: Kohima) — Naga Hills Highway Network', category: 'STATE', lat: 26.1584, lng: 94.5624, zoom: 8 },
  { id: 'state-tr', title: 'Tripura', subtitle: 'State of Tripura (Capital: Agartala) — Southwest Plain & Border Logistics', category: 'STATE', lat: 23.9408, lng: 91.9882, zoom: 8 },
  { id: 'state-sk', title: 'Sikkim', subtitle: 'State of Sikkim (Capital: Gangtok) — Teesta River Basin & High Passes', category: 'STATE', lat: 27.5330, lng: 88.5122, zoom: 8 },
];

export function searchNERLocations(
  query: string,
  dynamicEntities?: {
    vehicles?: Array<{ id: string; vehicleNumber: string; driverName?: string; currentLocation: { lat: number; lng: number }; status: string }>;
    incidents?: Array<{ id: string; type: string; roadName?: string; location: { lat: number; lng: number }; severity: number }>;
  }
): SearchResultItem[] {
  if (!query || query.trim().length === 0) return [];

  const cleanQuery = query.trim().toLowerCase();

  // Check if query is GPS coordinates: e.g. "26.18, 91.75" or "27.26 92.42"
  const coordMatch = cleanQuery.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [
        {
          id: `coord-${lat}-${lng}`,
          title: `GPS Coordinate [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
          subtitle: 'Direct Geographic Pinpoint Query',
          category: 'COORDINATES',
          lat,
          lng,
          zoom: 14,
        },
      ];
    }
  }

  const results: SearchResultItem[] = [];

  // 1. Dynamic Vehicles matching
  if (dynamicEntities?.vehicles) {
    for (const v of dynamicEntities.vehicles) {
      if (
        v.id.toLowerCase().includes(cleanQuery) ||
        v.vehicleNumber.toLowerCase().includes(cleanQuery) ||
        (v.driverName && v.driverName.toLowerCase().includes(cleanQuery))
      ) {
        results.push({
          id: `search-veh-${v.id}`,
          title: `${v.id} (${v.vehicleNumber})`,
          subtitle: `Live Vehicle • Status: ${v.status} • Driver: ${v.driverName || 'Operator'}`,
          category: 'VEHICLE',
          lat: v.currentLocation.lat,
          lng: v.currentLocation.lng,
          zoom: 15,
          associatedId: v.id,
        });
      }
    }
  }

  // 2. Dynamic Incidents matching
  if (dynamicEntities?.incidents) {
    for (const inc of dynamicEntities.incidents) {
      const typeStr = inc.type.replace(/_/g, ' ');
      if (
        inc.id.toLowerCase().includes(cleanQuery) ||
        typeStr.toLowerCase().includes(cleanQuery) ||
        (inc.roadName && inc.roadName.toLowerCase().includes(cleanQuery))
      ) {
        results.push({
          id: `search-inc-${inc.id}`,
          title: `${typeStr} Incident (Sev ${inc.severity}/10)`,
          subtitle: `Location: ${inc.roadName || 'NER Corridor'} • Direct Hazard Site`,
          category: 'INCIDENT',
          lat: inc.location.lat,
          lng: inc.location.lng,
          zoom: 14,
          associatedId: inc.id,
        });
      }
    }
  }

  // 3. Static Search Index
  for (const item of NER_SEARCH_INDEX) {
    if (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.subtitle.toLowerCase().includes(cleanQuery) ||
      item.category.toLowerCase().includes(cleanQuery)
    ) {
      results.push(item);
    }
  }

  return results.slice(0, 8);
}
