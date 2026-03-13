import ticketService from "@/core/services/ticket.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useDashboardTicket = () => {
  const getTicketSummay = async () => {
    const res = await ticketService.getTicketSummary();

    const { data } = res;

    return data;
  };

  const {
    data: dataDashboardTicket,
    isLoading: isLoadingDashboardTicket,
    isRefetching: isRefetchingDashboardTicket,
    refetch: refetchDashboardTicket,
  } = useQuery({
    queryKey: ["DashboardTicket"],
    queryFn: getTicketSummay,
  });
  return {
    dataDashboardTicket,
    isLoadingDashboardTicket,
    isRefetchingDashboardTicket,
    refetchDashboardTicket,
  };
};

export default useDashboardTicket;
