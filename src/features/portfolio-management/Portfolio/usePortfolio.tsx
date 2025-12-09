import portfolioService from "@/core/services/portfolio.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const usePortfolio = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selected, setSelected] = useState(null);
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await portfolioService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataPortfolio,
    isLoading: isLoadingPortfolio,
    isRefetching: isRefetchingPortfolio,
    refetch: refetchPortfolio,
  } = useQuery({
    queryKey: ["portfolio", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataPortfolio,
    isLoadingPortfolio,
    isRefetchingPortfolio,
    refetchPortfolio,

    selected,
    setSelected,
  };
};

export default usePortfolio;
