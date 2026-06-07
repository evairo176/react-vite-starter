import { useQuery } from "@tanstack/react-query";

import achievementService from "@/core/services/achievement.service";
import { queryKeys } from "@/core/query/keys";
import type { Achievement } from "@/core/types/achievement.type";

/**
 * Data orchestration for the public Achievements section. Fetches published
 * achievements via `GET /achievements/public` and exposes the query state for
 * the component to render Loading / Error / Empty / content states.
 */
const useAchievements = () => {
  const fetchAchievements = async (): Promise<Achievement[]> => {
    const res = await achievementService.getPublic();
    const { data } = res;
    return data?.data ?? [];
  };

  const {
    data: achievements,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.achievements.public(),
    queryFn: fetchAchievements,
  });

  return {
    achievements,
    isLoading,
    isError,
    refetch,
  };
};

export default useAchievements;
