// ============================================================
// NERIXA — Offline-First Storage & Synchronization Service
// Local device queue for remote field officers in zero-connectivity areas
// ============================================================

import type { FieldOfficerReport } from '@/lib/types/imageIntelligence';

const STORAGE_KEY = 'nerixa_offline_field_reports_v1';
const OFFLINE_SIM_KEY = 'nerixa_simulated_offline_mode';

/**
 * Check if the browser environment has localStorage
 */
function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Retrieve all pending field officer reports saved in local device storage
 */
export function getOfflineReportsQueue(): FieldOfficerReport[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FieldOfficerReport[];
  } catch (err) {
    console.error('[OfflineStorage] Failed to read queue:', err);
    return [];
  }
}

/**
 * Save a new field officer image report to local device storage when offline
 */
export function saveOfflineReport(report: FieldOfficerReport): FieldOfficerReport[] {
  if (!isStorageAvailable()) return [report];
  try {
    const current = getOfflineReportsQueue();
    const updated = [report, ...current.filter(r => r.id !== report.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('[OfflineStorage] Failed to save offline report:', err);
    return [];
  }
}

/**
 * Remove a specific synchronized report from local device storage
 */
export function removeOfflineReport(reportId: string): FieldOfficerReport[] {
  if (!isStorageAvailable()) return [];
  try {
    const current = getOfflineReportsQueue();
    const filtered = current.filter(r => r.id !== reportId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('[OfflineStorage] Failed to remove synced report:', err);
    return [];
  }
}

/**
 * Clear all synchronized reports
 */
export function clearOfflineQueue(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[OfflineStorage] Failed to clear queue:', err);
  }
}

/**
 * Check or toggle simulated offline mode for field testing
 */
export function getSimulatedOfflineState(): boolean {
  if (!isStorageAvailable()) return false;
  return localStorage.getItem(OFFLINE_SIM_KEY) === 'true';
}

export function setSimulatedOfflineState(offline: boolean): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(OFFLINE_SIM_KEY, offline ? 'true' : 'false');
}

// ── GPS Fleet Telemetry Queue ──
const TELEMETRY_QUEUE_KEY = 'nerixa_offline_telemetry_queue_v1';

export async function enqueueOfflineTelemetry(telemetry: any): Promise<void> {
  if (!isStorageAvailable()) return;
  try {
    const current = await getOfflineTelemetryQueue();
    const updated = [...current, { ...telemetry, is_queued_historical: true }];
    localStorage.setItem(TELEMETRY_QUEUE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[OfflineStorage] Failed to enqueue telemetry:', err);
  }
}

export async function getOfflineTelemetryQueue(): Promise<any[]> {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(TELEMETRY_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('[OfflineStorage] Failed to read telemetry queue:', err);
    return [];
  }
}

export async function clearOfflineTelemetryQueue(): Promise<void> {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(TELEMETRY_QUEUE_KEY);
  } catch (err) {
    console.error('[OfflineStorage] Failed to clear telemetry queue:', err);
  }
}

