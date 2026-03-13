import api from "../api/axios";
import type { CreateBookingDTO } from "../types/booking.type";

const bookingService = {
  getSlots: async (date: string) => {
    const res = await api.get(`/booking/slots?date=${date}`);
    return res.data;
  },
  createBooking: async (payload: CreateBookingDTO) =>
    api.post(`/booking`, payload),
  //   register: async (payload: any) => api.post("/auth/register", payload),
  //   verifyEmail: async (payload: { code: string }) =>
  //     api.post("/auth/verify/email", payload),
  //   forgotPassword: async (payload: { email: string }) =>
  //     api.post("/auth/password/forgot", payload),
  //   resetPassword: async (payload: any) =>
  //     api.post("/auth/password/reset", payload),
  //   refreshToken: async (payload: { refreshToken: string }) =>
  //     api.post("/auth/refresh-token", payload),
};

export default bookingService;
