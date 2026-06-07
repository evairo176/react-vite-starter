import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import achievementService from "@/core/services/achievement.service";
import { queryKeys } from "@/core/query/keys";
import { errorCallback, successCallback } from "@/core/utils/tanstack-callback";
import useChangeUrl from "@/hooks/useChangeUrl";
import type {
  CreateAchievementDTO,
  UpdateAchievementDTO,
} from "@/core/types/achievement.type";

/**
 * Data orchestration for the Admin_Achievement_Manager.
 *
 * Owns the admin achievement list query keyed by
 * `queryKeys.achievements.adminList` and the create / update / delete
 * mutations. Every successful mutation invalidates the admin list (so the
 * table refreshes) plus the public achievements query (so the public site
 * reflects published changes), and surfaces the outcome through sonner toasts.
 * Errors toast the message and leave the current view state untouched — the
 * caller controls dialog state.
 */
const useAchievementManager = () => {
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
    const res = await achievementService.findAllAdmin(params);
    return res.data;
  };

  const {
    data: dataAchievement,
    isLoading: isLoadingAchievement,
    isRefetching: isRefetchingAchievement,
    refetch: refetchAchievement,
  } = useQuery({
    queryKey: queryKeys.achievements.adminList(listParams),
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });

  /**
   * Invalidate every cache affected by an achievement mutation: the admin list
   * (so the table re-reads) and the public achievements query (so a
   * create/edit/delete is reflected on the public site).
   */
  const invalidateAchievementCaches = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin", "achievements", "list"],
    });
    queryClient.invalidateQueries({ queryKey: ["public", "achievements"] });
  };

  // ---- Create --------------------------------------------------------------
  const { mutate: createAchievement, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateAchievementDTO) =>
      achievementService.create(payload),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateAchievementCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  // ---- Update --------------------------------------------------------------
  const { mutate: updateAchievement, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAchievementDTO;
    }) => achievementService.update(id, payload),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateAchievementCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  // ---- Delete --------------------------------------------------------------
  const { mutate: deleteAchievement, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => achievementService.destroy(id),
    onSuccess: (response) => {
      toast.success(successCallback(response));
      invalidateAchievementCaches();
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  return {
    // list
    dataAchievement,
    isLoadingAchievement,
    isRefetchingAchievement,
    refetchAchievement,
    // mutations
    createAchievement,
    isCreating,
    updateAchievement,
    isUpdating,
    deleteAchievement,
    isDeleting,
  };
};

export default useAchievementManager;
