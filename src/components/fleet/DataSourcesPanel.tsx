'use client';

import React from 'react';
import { DataSourceStatus } from '@/lib/types';
import {
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiXCircle,
  FiRadio,
  FiCloudRain,
  FiCompass,
  FiMapPin,
  FiCamera,
  FiLayers,
  FiTruck,
  FiSlash
} from '@/components/common/FeatherIcons';

interface DataSourcesPanelProps {
  sources: DataSourceStatus[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const DataSourcesPanel: React.FC<DataSourcesPanelProps> = ({
  sources,
  isOpen,
  onClose,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const getSourceIcon = (id: string) => {
    switch (id) {
      case 'GPS_FLEET': return <FiTruck className="w-4 h-4 text-emerald-400" />;
      case 'GOOGLE_TRAFFIC': return <FiActivity className="w-4 h-4 text-rose-400" />;
      case 'GOOGLE_ROUTES': return <FiCompass className="w-4 h-4 text-blue-400" />;
      case 'WEATHER': return <FiCloudRain className="w-4 h-4 text-cyan-400" />;
      case 'SENTINEL_1': return <FiRadio className="w-4 h-4 text-indigo-400" />;
      case 'SENTINEL_2': return <FiLayers className="w-4 h-4 text-teal-400" />;
      case 'FIELD_OFFICERS': return <FiCamera className="w-4 h-4 text-amber-400" />;
      case 'ROAD_NETWORK': return <FiMapPin className="w-4 h-4 text-orange-400" />;
      case 'PUBLIC_TRANSIT': return <FiSlash className="w-4 h-4 text-neutral-400" />;
      default: return <FiActivity className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (source: DataSourceStatus) => {
    if (source.id === 'PUBLIC_TRANSIT' && source.status === 'UNAVAILABLE') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
          NOT AVAILABLE
        </span>
      );
    }
    switch (source.status) {
      case 'CONNECTED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> CONNECTED
          </span>
        );
      case 'SYNCING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <FiRefreshCw className="w-2.5 h-2.5 animate-spin" /> SYNCING
          </span>
        );
      case 'ERROR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <FiAlertCircle className="w-2.5 h-2.5" /> ERROR
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
            DISCONNECTED
          </span>
        );
    }
  };

  const totalConnected = sources.filter(s => s.connected).length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-neutral-850 to-neutral-800 border-b border-neutral-700/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FiActivity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  Real-Time Data Sources
                </h3>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30 shrink-0">
                  {totalConnected} / {sources.length} ONLINE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
                Truthful health telemetry • Verified connections only
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition text-xs flex items-center gap-1.5"
                title="Refresh Stream Health"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <FiXCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Public Transit Disclaimer Banner (Section 7 Truthfulness Requirement) */}
        <div className="bg-neutral-950 px-3.5 py-2.5 sm:px-6 sm:py-3 border-b border-neutral-800 flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px] sm:text-xs">
            <FiSlash className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              <b className="text-neutral-200">Public Transit (GTFS-RT):</b> LIVE TRANSIT DATA NOT AVAILABLE for Northeastern Hill Region.
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            TRUTHFUL DATA
          </span>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 overscroll-contain flex-1 max-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/60 hover:border-neutral-600 transition flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-700">
                      {getSourceIcon(source.id)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white">{source.name}</h4>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase">{source.category}</span>
                    </div>
                  </div>
                  {getStatusBadge(source)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-neutral-700/40">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Freshness:</span>
                    <span className="font-mono text-neutral-300 font-medium">{source.freshnessLabel}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Records Sync:</span>
                    <span className="font-mono text-neutral-300 font-medium">
                      {source.recordsReceived.toLocaleString()} events
                    </span>
                  </div>
                </div>

                {source.notes && (
                  <p className="text-[10px] text-neutral-400 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800">
                    {source.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Decoupled Data Architecture • Supports WebSockets & RTDB Pub/Sub</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
