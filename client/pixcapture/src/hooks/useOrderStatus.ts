import { useQuery } from "@tanstack/react-query";

/**
 * useOrderStatus Hook
 * GET /api/orders/:id/status
 */

export interface OrderStatusResponse {
  queued: number;
  in_progress: number;
  done: number;
  total: number;
}

export function useOrderStatus(orderId: string, enabled: boolean = true) {
  return useQuery<OrderStatusResponse>({
    queryKey: ["/api/orders", orderId, "status"],
    enabled: !!orderId && enabled,
    refetchInterval: 15000, // Poll every 15s
    staleTime: 10000, // 10s
  });
}
