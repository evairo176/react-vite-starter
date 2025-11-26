import sessionService from "@/core/services/session.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useSession = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selectedId, setSelectedId] = useState<string>("");
  const getSessionByUser = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await sessionService.getSessionByUser(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataSession,
    isLoading: isLoadingSession,
    isRefetching: isRefetchingSession,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ["getSessionByUser", currentPage, currentLimit, currentSearch],
    queryFn: getSessionByUser,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataSession,
    isLoadingSession,
    isRefetchingSession,
    refetchSession,

    selectedId,
    setSelectedId,
  };
};

export default useSession;
