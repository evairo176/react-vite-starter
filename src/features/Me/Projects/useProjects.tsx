import publicPortfolioService from "@/core/services/publicPortfolio.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Home-page projects data. Uses the PUBLIC portfolio endpoint (published only,
 * no auth required) so the landing page works for guests, and requests
 * featured-first ordering matching the dedicated `/projects` list.
 *
 * Besides the (up to 6) preview cards, it surfaces `totalProjects` from the
 * response pagination metadata so the section can advertise the full published
 * project count even though only a preview slice is fetched.
 */
const useProjects = () => {
  const findAll = async () => {
    const res = await publicPortfolioService.getPublicList("limit=6&page=1");
    return {
      items: res?.data?.data ?? [],
      total: res?.data?.metadata?.total ?? 0,
    };
  };

  const { data, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["landingPagePortfolio"],
    queryFn: findAll,
  });

  return {
    dataPortfolio: data?.items,
    totalProjects: data?.total ?? 0,
    isLoadingPortfolio,
  };
};

export default useProjects;
