import api from "../api/axios";

const categoryService = {
  findAll: async (params?: string) => api.get(`/portfolio-category?${params}`),
};

export default categoryService;
