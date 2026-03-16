import api from "../api/axios";
import type { createClaimDTO } from "../types/claim.type";

const claimService = {
  findAll: async (params?: string) => api.get(`/claims?${params}`),
  create: async (payload: createClaimDTO) => api.post("/claims", payload),
  submit: async (id: string) => api.patch(`/claims/${id}/submit`),
  review: async (id: string) => api.patch(`/claims/${id}/review`),
  approve: async (id: string) => api.patch(`/claims/${id}/approve`),
  reject: async (id: string, note: string) =>
    api.patch(`/claims/${id}/reject`, { note }),
};

export default claimService;
