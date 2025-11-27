import api from "../api/axios";

const techStackService = {
  findAll: async (params?: string) => api.get(`/tech-stack?${params}`),
};

export default techStackService;
