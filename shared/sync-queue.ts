/**
 * Offline-Sync-Queue für Mobile PWA
 * Speichert Jobs/Assets/Events lokal und synchronisiert bei Netzverbindung
 */

export type QueueItemType = 'job' | 'asset' | 'event' | 'deviceRegistration';

export type QueueItemStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  localId: string;           // ULID für lokale Identifikation
  type: QueueItemType;       // job, asset, event
  payload: Record<string, any>; // Daten für Server-Request
  status: QueueItemStatus;   // pending, syncing, synced, failed
  retryCount: number;        // Anzahl Wiederholungsversuche
  lastError: string | null;  // Letzte Fehlermeldung
  createdAt: number;         // Timestamp
  lastAttemptAt: number | null; // Timestamp letzter Versuch
  nextRetryAt: number | null;   // Timestamp nächster Versuch
  serverId: string | null;   // server_job_id oder server_asset_id nach Erfolg
  synced: boolean;           // true nach erfolgreichem Sync
}

/**
 * Berechnet nächsten Retry-Zeitpunkt mit Exponential Backoff
 * 2s → 4s → 8s → 16s → 32s → 64s → 120s (max)
 */
export function calculateNextRetry(retryCount: number): number {
  const baseDelay = 2000; // 2 Sekunden
  const maxDelay = 120000; // 2 Minuten
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  return Date.now() + delay;
}

/**
 * Prüft ob Item für Retry bereit ist
 */
export function isReadyForRetry(item: SyncQueueItem): boolean {
  if (item.status === 'synced' || item.status === 'syncing') {
    return false;
  }
  if (item.nextRetryAt === null) {
    return true; // Noch nie versucht
  }
  return Date.now() >= item.nextRetryAt;
}

/**
 * Bestimmt ob HTTP-Fehler wiederholt werden soll
 */
export function shouldRetryError(statusCode: number): boolean {
  // 4xx = Client-Fehler → nicht wiederholen
  if (statusCode >= 400 && statusCode < 500) {
    return false;
  }
  // 5xx = Server-Fehler → wiederholen
  // Netzfehler (kein statusCode) → wiederholen
  return true;
}
