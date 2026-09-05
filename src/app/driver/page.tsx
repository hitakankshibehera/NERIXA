'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DriverTrackingModal } from '@/components/fleet/DriverTrackingModal';
import { FiNavigation, FiArrowLeft, FiTruck, FiShield, FiWifi, FiClock } from '@/components/common/FeatherIcons';

export default function DriverCockpitPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-neutral-950 to-neutral-950"></div>

      <div className="relative z-10 w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
          <FiTruck className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-block mb-2">
            NERIXA LIVE FLEET NETWORK
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Driver Terminal (TRK-102)</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time GPS synchronization, adaptive transmission frequency, and dispatcher routing terminal.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/40">
            <FiNavigation className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-xs font-semibold text-white block">5–10s Adaptive GPS</span>
            <span className="text-[11px] text-neutral-400">High-frequency moving updates</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/40">
            <FiWifi className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-xs font-semibold text-white block">Offline Resilient</span>
            <span className="text-[11px] text-neutral-400">Queued in IndexedDB</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/40">
            <FiShield className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-xs font-semibold text-white block">Instant SOS Panic</span>
            <span className="text-[11px] text-neutral-400">Direct Command Center alert</span>
          </div>
          <div className="p-3 rounded-2xl bg-neutral-800/40 border border-neutral-700/40">
            <FiClock className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-xs font-semibold text-white block">Dynamic Reroute</span>
            <span className="text-[11px] text-neutral-400">Live safety course updates</span>
          </div>
        </div>

        {/* Launch Cockpit Button */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition transform active:scale-[0.98]"
          >
            <FiNavigation className="w-4 h-4" /> Open GPS Cockpit Console
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Return to Command Center
          </Link>
        </div>
      </div>

      {/* Driver Modal */}
      <DriverTrackingModal
        vehicleId="TRK-102"
        driverName="Rajesh Sharma (TRK-102)"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
