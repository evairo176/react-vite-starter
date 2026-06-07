import publicPortfolioService from "@/core/services/publicPortfolio.service";
import { useQuery } from "@tanstack/react-query";

/**
 * Home-page projects data. Uses the PUBLIC portfolio endpoint (published only,
 * no auth required) so the landing page works for guests, and requests
 * featured-first ordering matching the dedicated `/projects` list.
 */
const useProjects = () => {
  const findAll = async () => {
    const res = await publicPortfolioService.getPublicList("limit=6&page=1");
    return res?.data?.data;
  };

  const { data: dataPortfolio, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["landingPagePortfolio"],
    queryFn: findAll,
  });
  return {
    dataPortfolio,
    isLoadingPortfolio,
  };
};

export default useProjects;
