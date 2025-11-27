import techStackService from "@/core/services/techStack.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useTechStack = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selected, setSelected] = useState<string>("");
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await techStackService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataTechStack,
    isLoading: isLoadingTechStack,
    isRefetching: isRefetchingTechStack,
    refetch: refetchTechStack,
  } = useQuery({
    queryKey: ["TechStack", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataTechStack,
    isLoadingTechStack,
    isRefetchingTechStack,
    refetchTechStack,

    selected,
    setSelected,
  };
};

export default useTechStack;
