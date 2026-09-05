// ============================================================
// NERIXA — Offline GPS Telemetry Storage & Synchronization
// Uses IndexedDB (via idb-keyval) with localStorage fallback
// ============================================================

import { get, set, del } from 'idb-keyval';
import { VehicleTelemetry } from '@/lib/types';

const QUEUE_STORAGE_KEY = 'nerixa_driver_gps_offline_queue_v1';
const MAX_QUEUE_SIZE = 500; // Limit to last ~500 readings to prevent memory explosion

export type SyncState = 'OFFLINE' | 'SYNCING' | 'LIVE';

/**
 * Safely reads queued points from IndexedDB / localStorage
 */
export async function getQueuedTelemetry(): Promise<VehicleTelemetry[]> {
  if (typeof window === 'undefined') return [];

  try {
    const data = await get<VehicleTelemetry[]>(QUEUE_STORAGE_KEY);
    if (Array.isArray(data)) return data;
  } catch {
    // Fallback to localStorage if IndexedDB is blocked
    try {
      const fallback = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (fallback) {
        return JSON.parse(fallback) as VehicleTelemetry[];
      }
    } catch {
      // ignore
    }
  }
  return [];
}

/**
 * Queues a GPS point when the network connection is lost
 * IMPORTANT: Sets is_queued_historical = true so the server never presents it as "LIVE"
 */
export async function enqueueOfflineTelemetry(telemetry: VehicleTelemetry): Promise<number> {
  if (typeof window === 'undefined') return 0;

  try {
    const queue = await getQueuedTelemetry();
    const historicalPoint: VehicleTelemetry = {
      ...telemetry,
      is_queued_historical: true // Flagged explicitly per Section 21
    };

    queue.push(historicalPoint);

    // Keep within reasonable capacity
    const trimmed = queue.slice(-MAX_QUEUE_SIZE);

    try {
      await set(QUEUE_STORAGE_KEY, trimmed);
    } catch {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(trimmed));
    }

    return trimmed.length;
  } catch (err) {
    console.error('[NERIXA OfflineQueue] Failed to enqueue point:', err);
    return 0;
  }
}

/**
 * Clears the offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await del(QUEUE_STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Flushes the queued telemetry to backend
 */
export async function flushOfflineQueue(
  sendFn: (item: VehicleTelemetry) => Promise<boolean>
): Promise<{ syncedCount: number; remainingCount: number }> {
  const queue = await getQueuedTelemetry();
  if (queue.length === 0) return { syncedCount: 0, remainingCount: 0 };

  const failedItems: VehicleTelemetry[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      const success = await sendFn(item);
      if (success) {
        syncedCount++;
      } else {
        failedItems.push(item);
      }
    } catch {
      failedItems.push(item);
    }
  }

  // Update storage with any remaining unsynced items
  try {
    if (failedItems.length > 0) {
      await set(QUEUE_STORAGE_KEY, failedItems);
    } else {
      await clearOfflineQueue();
    }
  } catch {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(failedItems));
  }

  return { syncedCount, remainingCount: failedItems.length };
}
