/**
 * Sync-Queue Manager für Offline-Persistenz
 * Verwaltet lokale Queue in localStorage mit Auto-Sync
 */

import { SyncQueueItem, QueueItemType, calculateNextRetry, isReadyForRetry, shouldRetryError } from '@shared/sync-queue';
import { ulid } from 'ulid';

const QUEUE_STORAGE_KEY = 'pix_sync_queue';
const SYNC_INTERVAL = 5000; // 5 Sekunden
const MAX_RETRY_COUNT = 10; // Max Versuche bevor final failed

/**
 * Lädt Queue aus localStorage
 */
export function loadQueue(): SyncQueueItem[] {
  try {
    const data = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('[SyncQueue] Load error:', error);
    return [];
  }
}

/**
 * Speichert Queue in localStorage
 */
export function saveQueue(items: SyncQueueItem[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[SyncQueue] Save error:', error);
  }
}

/**
 * Fügt Item zur Queue hinzu
 */
export function enqueue(type: QueueItemType, payload: Record<string, any>): SyncQueueItem {
  const item: SyncQueueItem = {
    localId: ulid(),
    type,
    payload,
    status: 'pending',
    retryCount: 0,
    lastError: null,
    createdAt: Date.now(),
    lastAttemptAt: null,
    nextRetryAt: null,
    serverId: null,
    synced: false,
  };

  const queue = loadQueue();
  queue.push(item);
  saveQueue(queue);

  console.log(`[SyncQueue] Enqueued ${type}:`, item.localId);
  return item;
}

/**
 * Markiert Item als erfolgreich synchronisiert
 */
export function markSynced(localId: string, serverId: string): void {
  const queue = loadQueue();
  const item = queue.find(i => i.localId === localId);
  
  if (item) {
    item.status = 'synced';
    item.synced = true;
    item.serverId = serverId;
    item.lastError = null;
    saveQueue(queue);
    console.log(`[SyncQueue] Synced ${item.type}:`, localId, '→', serverId);
  }
}

/**
 * Markiert Item als fehlgeschlagen
 */
export function markFailed(localId: string, error: string, shouldRetry: boolean): void {
  const queue = loadQueue();
  const item = queue.find(i => i.localId === localId);
  
  if (!item) return;

  item.lastError = error;
  item.lastAttemptAt = Date.now();
  item.retryCount += 1;

  if (shouldRetry && item.retryCount < MAX_RETRY_COUNT) {
    item.status = 'pending';
    item.nextRetryAt = calculateNextRetry(item.retryCount);
    console.log(`[SyncQueue] Retry scheduled for ${item.type}:`, localId, 'in', Math.round((item.nextRetryAt - Date.now()) / 1000), 's');
  } else {
    item.status = 'failed';
    item.nextRetryAt = null;
    console.error(`[SyncQueue] Failed ${item.type}:`, localId, error);
  }

  saveQueue(queue);
}

/**
 * Entfernt synchronisierte Items aus Queue
 */
export function cleanupSynced(): void {
  const queue = loadQueue();
  const filtered = queue.filter(item => !item.synced);
  
  if (filtered.length !== queue.length) {
    saveQueue(filtered);
    console.log(`[SyncQueue] Cleaned up ${queue.length - filtered.length} synced items`);
  }
}

/**
 * Holt nächstes Item für Sync (FIFO)
 */
export function getNextItem(): SyncQueueItem | null {
  const queue = loadQueue();
  
  for (const item of queue) {
    if (item.status === 'pending' && isReadyForRetry(item)) {
      return item;
    }
  }
  
  return null;
}

/**
 * Markiert Item als in Bearbeitung
 */
export function markSyncing(localId: string): void {
  const queue = loadQueue();
  const item = queue.find(i => i.localId === localId);
  
  if (item) {
    item.status = 'syncing';
    saveQueue(queue);
  }
}

/**
 * Holt Statistiken über Queue
 */
export function getQueueStats() {
  const queue = loadQueue();
  return {
    total: queue.length,
    pending: queue.filter(i => i.status === 'pending').length,
    syncing: queue.filter(i => i.status === 'syncing').length,
    synced: queue.filter(i => i.status === 'synced').length,
    failed: queue.filter(i => i.status === 'failed').length,
  };
}

/**
 * Auto-Sync Worker mit Exponential Backoff
 */
let syncIntervalId: number | null = null;

export function startAutoSync() {
  if (syncIntervalId !== null) {
    return; // Bereits gestartet
  }

  console.log('[SyncQueue] Auto-sync started');

  syncIntervalId = window.setInterval(async () => {
    const item = getNextItem();
    if (!item) return;

    markSyncing(item.localId);

    try {
      // Sync basierend auf Type
      if (item.type === 'job') {
        await syncJob(item);
      } else if (item.type === 'asset') {
        await syncAsset(item);
      } else if (item.type === 'event') {
        await syncEvent(item);
      }
    } catch (error) {
      console.error('[SyncQueue] Sync error:', error);
    }
  }, SYNC_INTERVAL);
}

export function stopAutoSync() {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('[SyncQueue] Auto-sync stopped');
  }
}

/**
 * Synchronisiert Job mit Server
 */
async function syncJob(item: SyncQueueItem): Promise<void> {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload),
    });

    if (!response.ok) {
      const error = await response.text();
      const retry = shouldRetryError(response.status);
      markFailed(item.localId, `HTTP ${response.status}: ${error}`, retry);
      return;
    }

    const result = await response.json();
    markSynced(item.localId, result.id);
  } catch (error) {
    // Netzfehler → wiederholen
    markFailed(item.localId, String(error), true);
  }
}

/**
 * Synchronisiert Asset mit Server
 */
async function syncAsset(item: SyncQueueItem): Promise<void> {
  try {
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload),
    });

    if (!response.ok) {
      const error = await response.text();
      const retry = shouldRetryError(response.status);
      markFailed(item.localId, `HTTP ${response.status}: ${error}`, retry);
      return;
    }

    const result = await response.json();
    markSynced(item.localId, result.id);
  } catch (error) {
    markFailed(item.localId, String(error), true);
  }
}

/**
 * Synchronisiert Event mit Server
 */
async function syncEvent(item: SyncQueueItem): Promise<void> {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.payload),
    });

    if (!response.ok) {
      const error = await response.text();
      const retry = shouldRetryError(response.status);
      markFailed(item.localId, `HTTP ${response.status}: ${error}`, retry);
      return;
    }

    const result = await response.json();
    markSynced(item.localId, result.id);
  } catch (error) {
    markFailed(item.localId, String(error), true);
  }
}
