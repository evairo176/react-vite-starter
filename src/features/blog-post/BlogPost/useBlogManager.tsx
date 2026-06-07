import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import blogPostService from "@/core/services/blogPost.service";
import blogCategoryService from "@/core/services/blogCategory.service";
import blogTagService from "@/core/services/blogTag.service";
import dashboardService from "@/core/services/dashboard.service";
import { queryKeys } from "@/core/query/keys";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import useChangeUrl from "@/hooks/useChangeUrl";
import type {
  CreateBlogPostDTO,
  UpdateBlogPostDTO,
} from "@/core/types/blogPost.type";

/**
 * Data orchestration for the Admin_Blog_Manager (Req 10.1-10.5, 13.2).
 *
 * Owns the admin post list query keyed by `queryKeys.adminBlog.list` and the
 * create / update / delete / publish-toggle mutations. Every successful
 * mutation invalidates the admin list (so the table refreshes) plus the public
 * blog query keys (so the public site reflects published changes), and surfaces
 * the outcome through sonner toasts. Errors toast the message and leave the
 * current view state untouched (Req 10.8) — the caller controls dialog state.
 */
const useBlogManager = () => {
  const queryClient = useQueryClient();
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();

  const listParams = {
    page: Number(currentPage) || 1,
    limit: Number(currentLimit) || 10,
    search: currentSearch || undefined,
  };

  // ---- List query ----------------------------------------------------------
  const findAll = async () => {
    let params = `limit=${listParams.limit}&page=${listParams.page}`;
    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }
    const res = await blogPostService.findAllAdmin(params);
    return res.data;
  };

  const {
    data: dataBlogPost,
    isLoading: isLoadingBlogPost,
    isRefetching: isRefetchingBlogPost,
    refetch: refetchBlogPost,
  } = useQuery({
    queryKey: queryKeys.adminBlog.list(listParams),
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });

  // ---- Taxonomy option lists (category single-select + tag multi-select) ---
  const { data: dataCategories } = useQuery({
    queryKey: queryKeys.blogTaxonomy.categories(),
    queryFn: async () => {
      const res = await blogCategoryService.getAll("limit=100&page=1");
      return res.data;
    },
  });

  const { data: dataTags } = useQuery({
    queryKey: queryKeys.blogTaxonomy.tags(),
    queryFn: async () => {
      const res = await blogTagService.getAll("limit=100&page=1");
      return res.data;
    },
  });

  const categoryOptions: { label: string; value: string }[] = (
    dataCategories?.data ?? []
  ).map((c: { id: string; name: string }) => ({
    label: c.name,
    value: c.id,
  }));

  const tagOptions: { label: string; value: string }[] = (
    dataTags?.data ?? []
  ).map((t: { id: string; name: string }) => ({
    label: t.name,
    value: t.id,
  }));

  /**
   * Invalidate every cache affected by a blog mutation: the admin list (so the
   * table re-reads) and the public blog list/detail (so a publish/edit/delete
   * is reflected on the public site). (Req 13.2)
   */
  const invalidateBlogCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "blog", "list"] });
    queryClient.invalidateQueries({ queryKey: ["public", "blog"] });
  };

  // ---- Create --------------------------------------------------------------
  const { mutate: createPost, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateBlogPostDTO) => blogPostService.create(payload),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateBlogCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  // ---- Update --------------------------------------------------------------
  const { mutate: updatePost, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBlogPostDTO }) =>
      blogPostService.update(id, payload),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateBlogCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  // ---- Delete --------------------------------------------------------------
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => blogPostService.destroy(id),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateBlogCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  // ---- Publish toggle ------------------------------------------------------
  const { mutate: togglePublish, isPending: isTogglingPublish } = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      dashboardService.togglePostPublished(id, isPublished),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateBlogCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  return {
    // list
    dataBlogPost,
    isLoadingBlogPost,
    isRefetchingBlogPost,
    refetchBlogPost,
    // taxonomy options
    categoryOptions,
    tagOptions,
    // mutations
    createPost,
    isCreating,
    updatePost,
    isUpdating,
    deletePost,
    isDeleting,
    togglePublish,
    isTogglingPublish,
  };
};

export default useBlogManager;
