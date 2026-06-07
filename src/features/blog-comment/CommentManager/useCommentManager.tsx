import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import blogCommentService from "@/core/services/blogComment.service";
import { queryKeys } from "@/core/query/keys";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import useChangeUrl from "@/hooks/useChangeUrl";
import type {
  AdminComment,
  AdminCommentCounts,
} from "@/core/types/blogPost.type";

/** Approval-status filter backing the moderation tabs. */
export type CommentStatusFilter = "all" | "pending" | "approved";

/**
 * Data orchestration for the Admin_Comment_Manager (fixes the "comments not
 * showing" bug: comments are created with `isApproved=false` and need an admin
 * to approve them).
 *
 * Reads pagination/search from the shared `useChangeUrl` (URL-driven, like the
 * Admin_Blog_Manager) and owns a local `status` filter. The list query is keyed
 * by `queryKeys.adminComments.list({page,limit,status})` and a counts query by
 * `queryKeys.adminComments.counts()`. Approve/delete mutations toast the
 * outcome and, on success, invalidate the admin comment list + counts AND the
 * public blog cache so an approved comment appears on the public site
 * immediately. (Req 4.7, 13.2)
 */
const useCommentManager = () => {
  const queryClient = useQueryClient();
  const { currentLimit, currentPage } = useChangeUrl();

  const [status, setStatus] = useState<CommentStatusFilter>("all");

  const listParams = {
    page: Number(currentPage) || 1,
    limit: Number(currentLimit) || 10,
    status,
  };

  // ---- List query ----------------------------------------------------------
  const findAll = async () => {
    const params = `page=${listParams.page}&limit=${listParams.limit}&status=${status}`;
    const res = await blogCommentService.listAdmin(params);
    return res.data;
  };

  const {
    data: dataComments,
    isLoading: isLoadingComments,
    isRefetching: isRefetchingComments,
    refetch: refetchComments,
  } = useQuery({
    queryKey: queryKeys.adminComments.list(listParams),
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });

  // ---- Counts query --------------------------------------------------------
  const { data: dataCounts } = useQuery({
    queryKey: queryKeys.adminComments.counts(),
    queryFn: async () => {
      const res = await blogCommentService.getCounts();
      return res.data;
    },
  });

  const counts: AdminCommentCounts = dataCounts?.data ?? {
    pending: 0,
    approved: 0,
    total: 0,
  };

  /**
   * Invalidate every cache affected by a comment mutation: the admin comment
   * list + counts (so the table and badges re-read) and the public blog cache
   * (so an approved comment appears on the public site). (Req 13.2)
   */
  const invalidateCommentCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
    queryClient.invalidateQueries({ queryKey: ["public", "blog"] });
  };

  // ---- Approve -------------------------------------------------------------
  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: (id: string) => blogCommentService.approve(id),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateCommentCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  // ---- Delete --------------------------------------------------------------
  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => blogCommentService.destroy(id),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateCommentCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  return {
    // list
    comments: (dataComments?.data as AdminComment[]) ?? [],
    metadata: dataComments?.metadata,
    isLoadingComments,
    isRefetchingComments,
    refetchComments,
    // filter
    status,
    setStatus,
    // counts
    counts,
    // mutations
    approve,
    isApproving,
    remove,
    isDeleting,
  };
};

export default useCommentManager;
