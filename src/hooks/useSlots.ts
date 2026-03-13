import bookingService from "@/core/services/booking.service";
import { useQuery } from "@tanstack/react-query";

export const useSlots = (date?: string) => {
  return useQuery({
    queryKey: ["slots", date],
    queryFn: () => bookingService.getSlots(date!),
    enabled: !!date,
  });
};
