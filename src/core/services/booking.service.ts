import api from "../api/axios";
import type { CreateBookingDTO } from "../types/booking.type";

const bookingService = {
  getSlots: async (date: string) => {
    const res = await api.get(`/booking/slots?date=${date}`);
    return res.data;
  },
  createBooking: async (payload: CreateBookingDTO) =>
    api.post(`/booking`, payload),
};

export default bookingService;
