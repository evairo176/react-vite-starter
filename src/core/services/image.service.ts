import api from "../api/axios";

const imageService = {
  findAll: async (params?: string) => api.get(`/image?${params}`),
  create: async (payload: FormData) =>
    api.post("/image", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default imageService;
