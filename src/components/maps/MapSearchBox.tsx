// ============================================================
// NER-SHIELD AI — Google Maps Style Geospatial Search Box
// Floating operational search bar with autocomplete for NER districts,
// highways, hospitals, supply depots, and raw GPS coordinates.
// ============================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchNERLocations } from '@/lib/maps/nerGeocoding';
import type { SearchResultItem } from '@/lib/types/googleMaps';
import {
  SearchIcon,
  RoadmapIcon,
  HospitalIcon,
  WarehouseIcon,
  PinIcon,
  MapIcon,
  CloseIcon,
} from '@/components/common/Icons';

interface MapSearchBoxProps {
  onSelectLocation: (result: SearchResultItem) => void;
}

export default function MapSearchBox({ onSelectLocation }: MapSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const hits = searchNERLocations(query);
      setResults(hits);
      setIsOpen(hits.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    setQuery(item.title);
    setIsOpen(false);
    onSelectLocation(item);
  };

  const renderCategoryIcon = (cat: SearchResultItem['category']) => {
    switch (cat) {
      case 'CITY':
      case 'DISTRICT':
        return (
          <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapIcon size={13} color="#38bdf8" />
          </div>
        );
      case 'ROAD':
        return (
          <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RoadmapIcon size={13} color="#818cf8" />
          </div>
        );
      case 'HOSPITAL':
        return (
          <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HospitalIcon size={13} color="#f87171" />
          </div>
        );
      case 'WAREHOUSE':
        return (
          <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WarehouseIcon size={13} color="#34d399" />
          </div>
        );
      case 'COORDINATES':
        return (
          <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PinIcon size={13} color="#fbbf24" />
          </div>
        );
      default:
        return (
          <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(148, 163, 184, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SearchIcon size={13} color="#94a3b8" />
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '12px',
        left: '52px',
        zIndex: 1000,
        width: '340px',
        maxWidth: 'calc(100vw - 120px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '24px',
          padding: '6px 14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <SearchIcon size={14} color="#38bdf8" style={{ marginRight: '8px', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search NER district, road, hospital, GPS..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f8fafc',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
          }}
        />
        {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              aria-label="Clear search"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CloseIcon size={12} />
            </button>
        )}
      </div>

      {/* ── Autocomplete Dropdown ── */}
      {isOpen && results.length > 0 && (
        <div
          style={{
            marginTop: '6px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            Geospatial Matches ({results.length})
          </div>

          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {renderCategoryIcon(item.category)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#f1f5f9',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.subtitle}
                </div>
              </div>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {item.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
