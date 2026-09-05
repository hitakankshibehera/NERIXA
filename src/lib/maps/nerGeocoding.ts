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
  {
    id: 'wh-slc',
    title: 'Silchar Transshipment Supply Hub',
    subtitle: 'Cachar, Assam — Essential Corridor Staging for Tripura & Mizoram',
    category: 'WAREHOUSE',
    lat: 24.812,
    lng: 92.791,
    zoom: 14,
  },
  {
    id: 'wh-dmp',
    title: 'Dimapur Forward Railhead Supply Hub',
    subtitle: 'Dimapur, Nagaland — Strategic Food Corporation of India Silo',
    category: 'WAREHOUSE',
    lat: 25.906,
    lng: 93.727,
    zoom: 14,
  },
];

export function searchNERLocations(query: string): SearchResultItem[] {
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

  // Filter against index
  return NER_SEARCH_INDEX.filter((item) => {
    return (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.subtitle.toLowerCase().includes(cleanQuery) ||
      item.category.toLowerCase().includes(cleanQuery)
    );
  }).slice(0, 7);
}
