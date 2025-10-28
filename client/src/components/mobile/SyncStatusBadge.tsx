/**
 * Sync-Status Badge für Offline-Queue
 * Zeigt pending/syncing/failed Items kompakt an
 */

import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSyncQueue } from '@/hooks/useSyncQueue';

export function SyncStatusBadge() {
  const { stats, hasPending, hasFailed, isActive } = useSyncQueue();

  // Don't show if nothing to sync
  if (stats.total === 0) {
    return null;
  }

  // Failed items
  if (hasFailed) {
    return (
      <Badge 
        variant="destructive" 
        className="gap-1.5"
        data-testid="badge-sync-failed"
      >
        <AlertCircle className="h-3 w-3" />
        <span>{stats.failed} fehlgeschlagen</span>
      </Badge>
    );
  }

  // Syncing
  if (isActive) {
    return (
      <Badge 
        variant="default" 
        className="gap-1.5 bg-blue-500 hover:bg-blue-600"
        data-testid="badge-sync-active"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>{stats.syncing} synchronisiert...</span>
      </Badge>
    );
  }

  // Pending (waiting for retry or network)
  if (hasPending) {
    return (
      <Badge 
        variant="secondary" 
        className="gap-1.5"
        data-testid="badge-sync-pending"
      >
        <WifiOff className="h-3 w-3" />
        <span>{stats.pending} ausstehend</span>
      </Badge>
    );
  }

  // All synced
  return (
    <Badge 
      variant="outline" 
      className="gap-1.5 text-green-600 border-green-600"
      data-testid="badge-sync-complete"
    >
      <Wifi className="h-3 w-3" />
      <span>Synchronisiert</span>
    </Badge>
  );
}
