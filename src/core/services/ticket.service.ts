import api from "../api/axios";

const ticketService = {
  assign: async (ticketId: string, picId: string) =>
    api.post(`/tickets/${ticketId}/assign`, {
      picId,
    }),
  finish: async (ticketId: string) => api.post(`/tickets/${ticketId}/finish`),
  getPic: async () => {
    const res = await api.get(`/tickets/users/pic`);
    return res.data;
  },
  getTicketSummary: async () => {
    const res = await api.get(`/dashboard/tickets-summary`);
    return res.data;
  },
  findAll: async (params?: string) => api.get(`/tickets?${params}`),
};

export default ticketService;
