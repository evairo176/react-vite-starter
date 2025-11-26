import api from "../api/axios";

const authService = {
  login: async (
    payload: {
      email: string;
      password: string;
      rememberMe?: boolean;
    },
    config: any
  ) => api.post(`/auth/login`, payload, config),
  logout: async () => api.post(`/auth/logout`),
};

export default authService;
