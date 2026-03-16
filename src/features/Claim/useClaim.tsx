import claimService from "@/core/services/claim.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useClaim = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selected, setSelected] = useState<string>("");
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await claimService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataClaim,
    isLoading: isLoadingClaim,
    isRefetching: isRefetchingClaim,
    refetch: refetchClaim,
  } = useQuery({
    queryKey: ["claim", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataClaim,
    isLoadingClaim,
    isRefetchingClaim,
    refetchClaim,

    selected,
    setSelected,
  };
};

export default useClaim;
