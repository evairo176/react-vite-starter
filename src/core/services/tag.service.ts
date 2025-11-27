import api from "../api/axios";

const tagService = {
  findAll: async (params?: string) => api.get(`/portfolio-Tag?${params}`),
};

export default tagService;
