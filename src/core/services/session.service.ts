import api from "../api/axios";

const sessionService = {
  getSessionByUser: async (params?: string) =>
    api.get(`/session/me/all?${params}`),
  revokeSession: async (id: string) => api.post(`/session/revoke/${id}`),
};

export default sessionService;
