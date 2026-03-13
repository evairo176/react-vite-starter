import ticketService from "@/core/services/ticket.service";
import { useQuery } from "@tanstack/react-query";

const usePicIT = () => {
  const query = useQuery({
    queryKey: ["pic-it"],
    queryFn: ticketService.getPic,
  });

  return query;
};

export default usePicIT;
