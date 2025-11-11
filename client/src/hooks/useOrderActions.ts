import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { OrderFile, OrderFilesResponse } from './useOrderFiles';

export interface UseOrderActionsOptions {
  orderId: string;
}

export interface UseOrderActionsResult {
  markFiles: ReturnType<typeof useMutation<void, Error, { ids: string[]; marked: boolean }>>;
  deleteFiles: ReturnType<typeof useMutation<void, Error, string[]>>;
  restoreFiles: ReturnType<typeof useMutation<void, Error, string[]>>;
  submitEdits: ReturnType<typeof useMutation<void, Error, { files: string[]; express?: boolean; order_notes?: string }>>;
  approveFile: ReturnType<typeof useMutation<void, Error, string>>;
  revisionFile: ReturnType<typeof useMutation<void, Error, { id: string; note: string }>>;
}

export function useOrderActions(options: UseOrderActionsOptions): UseOrderActionsResult {
  const { orderId } = options;
  const queryClient = useQueryClient();

  const filesQueryKeyPrefix = ['orders', orderId, 'files'];

  // Optimistic update helper - updates ALL matching cache entries (different pagination states)
  const updateFilesCache = (
    updater: (old: OrderFilesResponse | undefined) => OrderFilesResponse | undefined
  ) => {
    // Update all matching queries (with different cursors/filters)
    queryClient.setQueriesData<OrderFilesResponse>(
      { queryKey: filesQueryKeyPrefix },
      updater
    );
  };

  // Mark Files (optimistic)
  const markFiles = useMutation({
    mutationFn: async ({ ids, marked }: { ids: string[]; marked: boolean }) => {
      await apiRequest('POST', '/api/files/bulk-mark', { ids, marked });
    },
    onMutate: async ({ ids, marked }) => {
      // Cancel outgoing refetches (all matching queries)
      await queryClient.cancelQueries({ queryKey: filesQueryKeyPrefix });

      // Snapshot all previous values
      const previousQueries = queryClient.getQueriesData<OrderFilesResponse>({
        queryKey: filesQueryKeyPrefix,
      });

      // Optimistically update all matching cache entries
      updateFilesCache((old) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.map((file) =>
            ids.includes(file.id) ? { ...file, marked } : file
          ),
        };
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error - restore all snapshots
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: filesQueryKeyPrefix });
    },
  });

  // Delete Files (optimistic soft-delete)
  const deleteFiles = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiRequest('DELETE', '/api/files/bulk', { ids });
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: filesQueryKeyPrefix });

      const previousQueries = queryClient.getQueriesData<OrderFilesResponse>({
        queryKey: filesQueryKeyPrefix,
      });

      // Optimistically remove files from all cache entries
      updateFilesCache((old) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.filter((file) => !ids.includes(file.id)),
        };
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKeyPrefix });
      // Also invalidate trash query
      queryClient.invalidateQueries({ queryKey: ['/api/trash'] });
    },
  });

  // Restore Files (optimistic reinsertion)
  const restoreFiles = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiRequest('POST', '/api/trash/restore', { ids });
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: filesQueryKeyPrefix });
      await queryClient.cancelQueries({ queryKey: ['/api/trash'] });
      
      const previousQueries = queryClient.getQueriesData<OrderFilesResponse>({
        queryKey: filesQueryKeyPrefix,
      });
      
      // Get trash data to find files to restore
      const trashData = queryClient.getQueryData<{ files: OrderFile[] }>(['/api/trash']);
      const filesToRestore = trashData?.files.filter(file => ids.includes(file.id)) || [];
      
      // Optimistically reinsert files into files cache
      if (filesToRestore.length > 0) {
        updateFilesCache((old) => {
          if (!old) return old;
          return {
            ...old,
            files: [...filesToRestore, ...old.files],
          };
        });
      }
      
      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKeyPrefix });
      queryClient.invalidateQueries({ queryKey: ['/api/trash'] });
    },
  });

  // Submit Edits (no optimistic)
  const submitEdits = useMutation({
    mutationFn: async (data: { files: string[]; express?: boolean; order_notes?: string }) => {
      await apiRequest('POST', `/api/orders/${orderId}/submit-edits`, data);
    },
    onSuccess: () => {
      // Invalidate order status to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/orders', orderId, 'status'] });
      queryClient.invalidateQueries({ queryKey: filesQueryKeyPrefix });
    },
  });

  // Approve File (no optimistic)
  const approveFile = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest('POST', `/api/files/${fileId}/approve`, {});
    },
    onSuccess: (_data, fileId) => {
      // Update file status in cache
      updateFilesCache((old) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.map((file) =>
            file.id === fileId ? { ...file, status: 'approved' } : file
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: filesQueryKeyPrefix });
    },
  });

  // Revision File (no optimistic)
  const revisionFile = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiRequest('POST', `/api/files/${id}/revision`, { note });
    },
    onSuccess: (_data, { id }) => {
      // Update file status to queued
      updateFilesCache((old) => {
        if (!old) return old;
        return {
          ...old,
          files: old.files.map((file) =>
            file.id === id ? { ...file, status: 'queued' } : file
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: filesQueryKeyPrefix });
    },
  });

  return {
    markFiles,
    deleteFiles,
    restoreFiles,
    submitEdits,
    approveFile,
    revisionFile,
  };
}
