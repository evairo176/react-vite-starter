import api from "../api/axios";
import type { CreateTechStackDTO, UpdateTechStackDTO } from "../types/techStack.type";

const techStackService = {
  findAll: async (params?: string) => api.get(`/tech-stack?${params}`),
  findOne: async (id: string) => api.get(`/tech-stack/${id}`),
  create: async (payload: CreateTechStackDTO) => api.post("/tech-stack", payload),
  update: async (id: string, payload: UpdateTechStackDTO) => api.put(`/tech-stack/${id}`, payload),
  destroy: async (id: string) => api.delete(`/tech-stack/${id}`),
};

export default techStackService;
