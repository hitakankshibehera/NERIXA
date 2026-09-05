'use client';

import React, { useState } from 'react';
import { IncidentType, Incident } from '@/lib/types';
import {
  FiCamera,
  FiMapPin,
  FiAlertTriangle,
  FiUploadCloud,
  FiCheckCircle,
  FiX,
  FiRefreshCw,
  FiShield
} from '@/components/common/FeatherIcons';

interface FieldEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated?: (incident: Incident) => void;
}

export const FieldEvidenceModal: React.FC<FieldEvidenceModalProps> = ({
  isOpen,
  onClose,
  onIncidentCreated,
}) => {
  const [incidentType, setIncidentType] = useState<IncidentType>('LANDSLIDE');
  const [severity, setSeverity] = useState<number>(8);
  const [description, setDescription] = useState<string>(
    'Heavy debris fall blocking 70% of dual-lane highway near Bomdila Pass. Long line of stranded logistics trucks. Boulders continuing to roll down slope.'
  );
  const [imageUrl, setImageUrl] = useState<string>('/reality/landslide_aerial_reality.jpg');
  const [latitude, setLatitude] = useState<number>(27.3000);
  const [longitude, setLongitude] = useState<number>(92.3000);
  const [officerName, setOfficerName] = useState<string>('Officer Tage (Field Unit 4)');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Capture device GPS
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported by device');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg('Unable to retrieve device GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Submit report to Incident Pipeline (Section 10 & 11)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/incidents/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          latitude,
          longitude,
          incidentType,
          severity,
          description,
          reportedBy: officerName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit incident evidence');
      }

      setSuccessResult(data);
      if (data.incident && onIncidentCreated) {
        onIncidentCreated(data.incident);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-neutral-850 to-neutral-800 border-b border-neutral-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FiCamera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Field Officer Real-Time Evidence
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-medium border border-amber-500/30">
                  SECTION 10
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Direct camera & GPS capture → AI pipeline → Realtime map broadcast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 overflow-y-auto space-y-4">
          {successResult ? (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FiCheckCircle className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-emerald-300">
                Incident Evidence Successfully Synchronized!
              </h4>
              <p className="text-xs text-neutral-300">
                Matched to road: <b className="text-white">{successResult.spatialImpact?.matchedRoadName}</b>.
                AI Vision Confidence: <b className="text-emerald-400">{successResult.aiDetection?.confidence}%</b>.
                Affected vehicles: <b className="text-amber-400">{successResult.spatialImpact?.affectedVehicles?.length}</b>.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => {
                    setSuccessResult(null);
                    onClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
                >
                  View on Live Map
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Officer & Photo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Field Officer ID
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Incident Type
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="LANDSLIDE">LANDSLIDE</option>
                    <option value="FLOOD">FLOOD</option>
                    <option value="ROAD_BLOCKED">ROAD BLOCKED</option>
                    <option value="ROAD_DAMAGE">ROAD DAMAGE</option>
                    <option value="BRIDGE_DAMAGE">BRIDGE DAMAGE</option>
                    <option value="TRAFFIC">TRAFFIC GRIDLOCK</option>
                  </select>
                </div>
              </div>

              {/* Severity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Severity Level (1-10)
                  </label>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    severity >= 8 ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {severity} / 10 ({severity >= 8 ? 'CRITICAL DISRUPTION' : 'SIGNIFICANT HAZARD'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* GPS Coordinates Capture */}
              <div className="p-3 bg-neutral-800/60 border border-neutral-700/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                    <FiMapPin className="w-3.5 h-3.5 text-blue-400" /> GPS Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureGPS}
                    disabled={isLocating}
                    className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                  >
                    {isLocating ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiMapPin className="w-3 h-3" />}
                    Capture Device GPS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-200">
                  <div className="bg-neutral-900 px-2.5 py-1.5 rounded border border-neutral-800">
                    LAT: {latitude.toFixed(4)}
                  </div>
                  <div className="bg-neutral-900 px-2.5 py-1.5 rounded border border-neutral-800">
                    LNG: {longitude.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Photo Evidence Selector */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                  Evidence Photo Asset
                </label>
                <select
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white mb-2"
                >
                  <option value="/reality/landslide_aerial_reality.jpg">Bomdila Landslide Aerial (Verified Field Photo)</option>
                  <option value="/reality/flooded_road_satellite_reality.jpg">Brahmaputra Highway Inundation Photo</option>
                  <option value="/reality/traffic_gridlock_reality.jpg">Highway Chokepoint Gridlock</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                  Ground Description & Observations
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-600/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <FiAlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin" /> Running AI Incident Pipeline...
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="w-4 h-4" /> Upload Evidence & Trigger AI Pipeline
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
