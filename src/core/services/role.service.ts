import api from "../api/axios";

const roleService = {
  findAll: async (params?: string) => api.get(`/roles?${params}`),
};

export default roleService;
