import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import portfolioService from "@/core/services/portfolio.service";
import dashboardService from "@/core/services/dashboard.service";
import categoryService from "@/core/services/category.service";
import techStackService from "@/core/services/techStack.service";
import { queryKeys } from "@/core/query/keys";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import useChangeUrl from "@/hooks/useChangeUrl";
import type {
  CreatePortfolioDTO,
  IPPortfolio,
  UpdatePortfolioDTO,
} from "@/core/types/portfolio.type";

/**
 * Data orchestration for the Admin_Portfolio_Manager (Req 11, 13.2).
 *
 * - Reads the admin project list through `queryKeys.adminPortfolio.list` driven
 *   by the URL search/pagination params (Req 11.1).
 * - Exposes create / update / delete / publish mutations. Each mutation
 *   invalidates `adminPortfolio.list` and the public portfolio caches so the
 *   table and the public site reflect the change on success (Req 11.2-11.5,
 *   13.2).
 * - The publish toggle re-reads the state returned by the API; if the API
 *   reports a state that differs from the requested target, the operation is
 *   treated as failed and an error toast is shown (Req 11.6).
 */
const usePortfolioManager = () => {
  const queryClient = useQueryClient();
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();

  const [selected, setSelected] = useState<IPPortfolio | null>(null);

  const listParams = {
    page: Number(currentPage) || 1,
    limit: Number(currentLimit) || 10,
    search: currentSearch || undefined,
  };

  const buildParamString = () => {
    let params = `limit=${listParams.limit}&page=${listParams.page}`;
    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }
    return params;
  };

  // ---- List query ----------------------------------------------------------
  const {
    data: dataPortfolio,
    isLoading: isLoadingPortfolio,
    isRefetching: isRefetchingPortfolio,
    isError: isErrorPortfolio,
    refetch: refetchPortfolio,
  } = useQuery({
    queryKey: queryKeys.adminPortfolio.list(listParams),
    queryFn: async () => {
      const res = await portfolioService.findAll(buildParamString());
      return res.data;
    },
    enabled: !!currentPage && !!currentLimit,
  });

  /**
   * Invalidate the admin list and the public portfolio caches so both the
   * dashboard table and the public site reflect a mutation. (Req 13.2)
   */
  const invalidatePortfolioCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "portfolio"] });
    queryClient.invalidateQueries({ queryKey: ["public", "portfolio"] });
  };

  // ---- Create --------------------------------------------------------------
  const { mutate: createPortfolio, isPending: isCreating } = useMutation({
    mutationFn: async (payload: CreatePortfolioDTO) =>
      portfolioService.create(payload),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidatePortfolioCaches();
    },
    onError: (error: any) => {
      const { message } = errorCallback(error);
      toast.error(message);
    },
  });

  // ---- Update --------------------------------------------------------------
  const { mutate: updatePortfolio, isPending: isUpdating } = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePortfolioDTO;
    }) => portfolioService.update(id, payload),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidatePortfolioCaches();
    },
    onError: (error: any) => {
      const { message } = errorCallback(error);
      toast.error(message);
    },
  });

  // ---- Delete --------------------------------------------------------------
  const { mutate: deletePortfolio, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => portfolioService.destroy(id),
    onSuccess: (response) => {
      toast.success(successCallback(response) || "Portfolio deleted");
      invalidatePortfolioCaches();
    },
    onError: (error: any) => {
      const { message } = errorCallback(error);
      toast.error(message);
    },
  });

  // ---- Publish toggle ------------------------------------------------------
  const { mutate: togglePublish, isPending: isTogglingPublish } = useMutation({
    mutationFn: async ({
      id,
      isPublished,
    }: {
      id: string;
      isPublished: boolean;
    }) => {
      const res = await dashboardService.togglePortfolioPublish(
        id,
        isPublished
      );
      // Re-read the state the API actually returned. If it does not reflect
      // the requested target, treat the operation as failed. (Req 11.6)
      const returned = res.data?.data;
      if (!returned || returned.isPublished !== isPublished) {
        throw new Error(
          "The publish state could not be updated. Please try again."
        );
      }
      return res;
    },
    onSuccess: (response) => {
      toast.success(successCallback(response) || "Publish state updated");
      invalidatePortfolioCaches();
    },
    onError: (error: any) => {
      // Plain `Error` (display mismatch) vs Axios error are both surfaced as a
      // toast without mutating the displayed list. (Req 11.6, 11.11)
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update publish state";
      toast.error(message);
    },
  });

  // ---- Option lists (category / tech) --------------------------------
  const { data: dataCategory } = useQuery({
    queryKey: ["Category-form"],
    queryFn: async () => {
      const res = await categoryService.findAll(`limit=1000&page=1`);
      return res.data?.data;
    },
  });

  const { data: dataTech } = useQuery({
    queryKey: ["tech-form"],
    queryFn: async () => {
      const res = await techStackService.findAll(`limit=1000&page=1`);
      return res.data?.data;
    },
  });

  return {
    // list
    dataPortfolio,
    isLoadingPortfolio,
    isRefetchingPortfolio,
    isErrorPortfolio,
    refetchPortfolio,

    // selection
    selected,
    setSelected,

    // mutations
    createPortfolio,
    isCreating,
    updatePortfolio,
    isUpdating,
    deletePortfolio,
    isDeleting,
    togglePublish,
    isTogglingPublish,

    // options
    dataCategory,
    dataTech,
  };
};

export default usePortfolioManager;
