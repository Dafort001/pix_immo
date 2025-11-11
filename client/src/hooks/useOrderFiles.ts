import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface OrderFile {
  id: string;
  filename: string;
  mime_type: string;
  bytes: number;
  room_type?: string;
  index?: number;
  ver?: number;
  status: 'uploaded' | 'queued' | 'in_progress' | 'done' | 'approved' | 'rejected';
  marked?: boolean;
  thumbnail_url?: string;
  preview_url?: string;
  warnings?: string[];
  stack_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderFilesFilter {
  room_type?: string;
  status?: string;
  marked?: boolean;
  has_warnings?: boolean;
  search?: string;
}

export interface OrderFilesResponse {
  files: OrderFile[];
  next_cursor?: string;
  total?: number;
}

export interface UseOrderFilesOptions {
  orderId: string;
  cursor?: string;
  limit?: number;
  filter?: OrderFilesFilter;
  enabled?: boolean;
}

export function useOrderFiles(options: UseOrderFilesOptions): UseQueryResult<OrderFilesResponse> {
  const { orderId, cursor, limit = 50, filter, enabled = true } = options;

  const queryKey = ['orders', orderId, 'files', { cursor, limit, filter }];

  return useQuery({
    queryKey,
    enabled: enabled && !!orderId,
    staleTime: 10_000, // 10 seconds
    retry: 2,
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (cursor) params.set('cursor', cursor);
      if (limit) params.set('limit', String(limit));
      
      // Add filters
      if (filter) {
        if (filter.room_type) params.set('room_type', filter.room_type);
        if (filter.status) params.set('status', filter.status);
        if (filter.marked !== undefined) params.set('marked', String(filter.marked));
        if (filter.has_warnings !== undefined) params.set('has_warnings', String(filter.has_warnings));
        if (filter.search) params.set('search', filter.search);
      }

      const url = `/api/orders/${orderId}/files?${params.toString()}`;
      const response = await fetch(url, { 
        signal,
        credentials: 'include',
      });

      // Use centralized error handling (401/403 → redirect)
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.href = '/login';
          throw new Error('Session expired');
        }
        const text = (await response.text()) || response.statusText;
        throw new Error(`${response.status}: ${text}`);
      }

      return response.json();
    },
  });
}
