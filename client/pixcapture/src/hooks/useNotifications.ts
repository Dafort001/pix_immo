import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/queryClient";

/**
 * useNotifications Hook
 * GET /api/notifications with polling (10-15s)
 * Pauses when tab is hidden (Visibility API)
 */

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: {
    orderId?: string;
    fileId?: string;
  };
  read: boolean;
  createdAt: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
}

export function useNotifications(limit: number = 10, unreadOnly: boolean = false) {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return useQuery<NotificationsResponse>({
    queryKey: ["/api/notifications", { limit, unreadOnly }],
    refetchInterval: isVisible ? 12000 : false, // 12s when visible, pause when hidden
    staleTime: 5000, // 5s
  });
}

/**
 * useMarkNotificationRead Mutation
 * POST /api/notifications/:id/read (if backend supports)
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiRequest(
        "POST",
        `/api/notifications/${notificationId}/read`,
        {}
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
}
