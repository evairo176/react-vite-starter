import api from "../api/axios";
import type { CreatePortfolioDTO } from "../types/portfolio.type";

const portfolioService = {
  findAll: async (params?: string) => api.get(`/portfolio?${params}`),
  findOne: async (id: string) => api.get(`/portfolio/${id}`),
  create: async (payload: CreatePortfolioDTO) =>
    api.post(`/portfolio`, payload),
};

export default portfolioService;
