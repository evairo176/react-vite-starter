import ticketService from "@/core/services/ticket.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useTicket = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selected, setSelected] = useState<string>("");
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await ticketService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataTicket,
    isLoading: isLoadingTicket,
    isRefetching: isRefetchingTicket,
    refetch: refetchTicket,
  } = useQuery({
    queryKey: ["Ticket", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataTicket,
    isLoadingTicket,
    isRefetchingTicket,
    refetchTicket,

    selected,
    setSelected,
  };
};

export default useTicket;
