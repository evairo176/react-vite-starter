import portfolioService from "@/core/services/portfolio.service";
import { useQuery } from "@tanstack/react-query";

const useProjects = () => {
  const findAll = async () => {
    let params = `limit=${100}&page=${1}`;

    const res = await portfolioService.findAll(`${params}`);

    const { data } = res;

    return data?.data;
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
