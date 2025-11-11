import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

/**
 * useOrderFiles Hook
 * GET /api/orders/:id/files with cursor pagination and filters
 */

export interface OrderFile {
  id: string;
  orderId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  roomType?: string;
  index: number;
  ver: number;
  status: 
    | "waiting"
    | "uploading"
    | "uploaded"
    | "registered"
    | "submitted"
    | "in_progress"
    | "processing"
    | "done"
    | "awaiting_approval"
    | "approved"
    | "revision"
    | "locked"
    | "deleted"
    | "completed";
  marked: boolean;
  trashed: boolean;
  warnings?: string[];
  thumbnailUrl?: string;
  createdAt: number;
  stackId?: string;
}

export interface OrderFilesResponse {
  files: OrderFile[];
  nextCursor?: string;
  total: number;
}

export interface OrderFilesFilter {
  roomType?: string;
  marked?: boolean;
  status?: string;
  warnings?: boolean;
  search?: string;
  trashed?: boolean;
}

export function useOrderFiles(
  orderId: string,
  filter?: OrderFilesFilter,
  cursor?: string,
  limit: number = 50
) {
  const queryKey = [
    "/api/orders",
    orderId,
    "files",
    { cursor, limit, ...filter },
  ];

  return useQuery<OrderFilesResponse>({
    queryKey,
    enabled: !!orderId,
    staleTime: 30000, // 30s
  });
}

/**
 * useBulkMarkFiles Mutation
 * POST /api/files/bulk-mark
 */
export function useBulkMarkFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      marked,
    }: {
      ids: string[];
      marked: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/files/bulk-mark", {
        ids,
        marked,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all order files queries
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

/**
 * useBulkDeleteFiles Mutation
 * DELETE /api/files/bulk (soft-delete)
 */
export function useBulkDeleteFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest("DELETE", "/api/files/bulk", { ids });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

/**
 * useTrashFiles Hook
 * GET /api/trash?order_id=...
 */
export function useTrashFiles(orderId: string) {
  return useQuery<{ files: OrderFile[] }>({
    queryKey: ["/api/trash", { order_id: orderId }],
    enabled: !!orderId,
  });
}

/**
 * useRestoreFiles Mutation
 * POST /api/trash/restore
 */
export function useRestoreFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest("POST", "/api/trash/restore", { ids });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trash"] });
    },
  });
}

/**
 * useMarkedFiles Hook
 * GET /api/orders/:id/files?marked=true
 */
export function useMarkedFiles(orderId: string) {
  return useOrderFiles(orderId, { marked: true });
}

/**
 * useSubmitForEditing Mutation
 * POST /api/orders/:orderId/submit-edits
 */
export function useSubmitForEditing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      files,
      orderNotes,
    }: {
      orderId: string;
      files: string[];
      orderNotes?: string;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/orders/${orderId}/submit-edits`,
        { files, orderNotes }
      );
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/orders", variables.orderId, "files"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/orders", variables.orderId],
      });
    },
  });
}
