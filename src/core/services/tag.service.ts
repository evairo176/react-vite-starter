import api from "../api/axios";
import type { CreateTagDTO, UpdateTagDTO } from "../types/tag.type";

const tagService = {
  findAll: async (params?: string) => api.get(`/portfolio-tag?${params}`),
  findOne: async (id: string) => api.get(`/portfolio-tag/${id}`),
  create: async (payload: CreateTagDTO) => api.post("/portfolio-tag", payload),
  update: async (id: string, payload: UpdateTagDTO) => api.put(`/portfolio-tag/${id}`, payload),
  destroy: async (id: string) => api.delete(`/portfolio-tag/${id}`),
};

export default tagService;
