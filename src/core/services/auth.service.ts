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
  register: async (payload: any) => api.post("/auth/register", payload),
  verifyEmail: async (payload: { code: string }) => api.post("/auth/verify/email", payload),
  forgotPassword: async (payload: { email: string }) => api.post("/auth/password/forgot", payload),
  resetPassword: async (payload: any) => api.post("/auth/password/reset", payload),
  refreshToken: async (payload: { refreshToken: string }) => api.post("/auth/refresh-token", payload),
};

export default authService;
