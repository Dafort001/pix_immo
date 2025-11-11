import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: 'upload_received' | 'edit_started' | 'edit_done' | 'revision_required' | 'order_completed';
  created_at: string;
  order_id?: string;
  file_id?: string;
  message: string;
  read?: boolean;
}

export interface NotificationsResponse {
  items: Notification[];
}

export interface UseNotificationsOptions {
  pollInterval?: number; // Default: 12000 (12 seconds)
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseQueryResult<NotificationsResponse> {
  const { pollInterval = 12_000, enabled = true } = options;
  const [isVisible, setIsVisible] = useState(!document.hidden);

  // Visibility API - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const queryKey = ['/api/notifications'];

  return useQuery({
    queryKey,
    enabled: enabled && isVisible,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: false,
    staleTime: pollInterval / 2,
    retry: 1,
  });
}
