import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

/**
 * useApproveRevision Mutation
 * POST /api/orders/:orderId/revisions/:revisionId/approve
 */
export function useApproveRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      revisionId,
    }: {
      orderId: string;
      revisionId: string;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/orders/${orderId}/revisions/${revisionId}/approve`,
        {}
      );
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/orders", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/orders", variables.orderId, "files"],
      });
    },
  });
}

/**
 * useRequestRevision Mutation
 * POST /api/orders/:orderId/revisions/:revisionId/request
 */
export function useRequestRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      revisionId,
      note,
    }: {
      orderId: string;
      revisionId: string;
      note: string;
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/orders/${orderId}/revisions/${revisionId}/request`,
        { note }
      );
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/orders", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/orders", variables.orderId, "files"],
      });
    },
  });
}
