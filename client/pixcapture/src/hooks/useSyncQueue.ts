/**
 * Hook für Sync-Queue Management
 * Startet Auto-Sync und stellt Queue-Statistiken bereit
 */

import { useState, useEffect } from 'react';
import { startAutoSync, stopAutoSync, getQueueStats, loadQueue } from '@/lib/sync-queue';
import type { SyncQueueItem } from '@shared/sync-queue';

export function useSyncQueue() {
  const [stats, setStats] = useState(getQueueStats());
  const [items, setItems] = useState<SyncQueueItem[]>([]);

  useEffect(() => {
    // Start auto-sync on mount
    startAutoSync();

    // Poll queue for updates
    const interval = setInterval(() => {
      setStats(getQueueStats());
      setItems(loadQueue());
    }, 1000);

    return () => {
      clearInterval(interval);
      // Note: We don't stop auto-sync on unmount to keep it running
    };
  }, []);

  return {
    stats,
    items,
    hasPending: stats.pending > 0,
    hasFailed: stats.failed > 0,
    isActive: stats.syncing > 0,
  };
}
