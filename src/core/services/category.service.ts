import api from "../api/axios";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../types/category.type";

const categoryService = {
  findAll: async (params?: string) => api.get(`/portfolio-category?${params}`),
  findOne: async (id: string) => api.get(`/portfolio-category/${id}`),
  create: async (payload: CreateCategoryDTO) => api.post("/portfolio-category", payload),
  update: async (id: string, payload: UpdateCategoryDTO) => api.put(`/portfolio-category/${id}`, payload),
  destroy: async (id: string) => api.delete(`/portfolio-category/${id}`),
};

export default categoryService;
