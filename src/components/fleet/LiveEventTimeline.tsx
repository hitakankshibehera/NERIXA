'use client';

import React from 'react';
import { LiveSystemEvent } from '@/lib/types';
import {
  FiClock,
  FiTruck,
  FiCloudRain,
  FiRadio,
  FiAlertTriangle,
  FiCamera,
  FiCpu,
  FiMapPin,
  FiCheckCircle,
  FiX
} from '@/components/common/FeatherIcons';

interface LiveEventTimelineProps {
  events: LiveSystemEvent[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (event: LiveSystemEvent) => void;
}

export const LiveEventTimeline: React.FC<LiveEventTimelineProps> = ({
  events,
  isOpen,
  onClose,
  onSelectEvent,
}) => {
  if (!isOpen) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'vehicle_location_updated':
        return <FiTruck className="w-3.5 h-3.5 text-blue-400" />;
      case 'weather_warning_received':
        return <FiCloudRain className="w-3.5 h-3.5 text-cyan-400" />;
      case 'satellite_observation_processed':
        return <FiRadio className="w-3.5 h-3.5 text-indigo-400" />;
      case 'risk_changed':
        return <FiAlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'field_report_received':
        return <FiCamera className="w-3.5 h-3.5 text-emerald-400" />;
      case 'incident_created':
        return <FiCpu className="w-3.5 h-3.5 text-rose-400" />;
      case 'shipment_at_risk':
        return <FiAlertTriangle className="w-3.5 h-3.5 text-purple-400" />;
      case 'reroute_required':
      case 'reroute_approved':
        return <FiMapPin className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <FiClock className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-neutral-850 to-neutral-800 border-b border-neutral-700/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FiClock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  Live Event Timeline
                </h3>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 shrink-0">
                  REALTIME BUS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
                Audited chronological log generated from actual events (Section 19)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 sm:p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition shrink-0"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Events List */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 overscroll-contain flex-1 max-h-[75vh]">
          {events.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-sm">
              No system events recorded yet. Waiting for live telemetry...
            </div>
          ) : (
            <div className="relative border-l border-neutral-700/60 ml-4 space-y-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent?.(evt)}
                  className="relative pl-6 group cursor-pointer"
                >
                  {/* Pin Dot */}
                  <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center shadow-md group-hover:scale-110 transition">
                    {getEventIcon(evt.type)}
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/50 hover:bg-neutral-800 hover:border-neutral-600 transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{evt.timestamp}</span>
                        <span className="text-neutral-500">•</span>
                        <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition">
                          {evt.title}
                        </h4>
                      </div>

                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : evt.severity === 'WARNING'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {evt.source === 'DEMO' ? 'DEMO SIM' : 'LIVE'}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300/90 mt-1 leading-relaxed">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Total Stream Events: {events.length}</span>
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
