import api from "../api/axios";

const imageService = {
  findAll: async (params?: string) => api.get(`/image?${params}`),
};

export default imageService;
