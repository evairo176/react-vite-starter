import api from "../api/axios";
import type { CreatePortfolioDTO, UpdatePortfolioDTO } from "../types/portfolio.type";

const portfolioService = {
  findAll: async (params?: string) => api.get(`/portfolio?${params}`),
  findOne: async (id: string) => api.get(`/portfolio/${id}`),
  create: async (payload: CreatePortfolioDTO) => api.post(`/portfolio`, payload),
  update: async (id: string, payload: UpdatePortfolioDTO) => api.put(`/portfolio/${id}`, payload),
  destroy: async (id: string) => api.delete(`/portfolio/${id}`),
};

export default portfolioService;
