import { useQuery, UseQueryResult } from '@tanstack/react-query';

export interface OrderStatus {
  queued: number;
  in_progress: number;
  done: number;
  total: number;
  submitted?: boolean;
  express?: boolean;
}

export interface UseOrderStatusOptions {
  orderId: string;
  enabled?: boolean;
}

export function useOrderStatus(options: UseOrderStatusOptions): UseQueryResult<OrderStatus> {
  const { orderId, enabled = true } = options;

  const queryKey = ['/api/orders', orderId, 'status'];

  return useQuery({
    queryKey,
    enabled: enabled && !!orderId,
    staleTime: 5_000, // 5 seconds
    retry: 2,
  });
}
