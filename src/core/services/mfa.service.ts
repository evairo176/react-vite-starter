import api from "../api/axios";
import type { IMfaVerifyLoginPayload, IMfaVerifyPayload } from "../types/mfa.type";

const mfaService = {
    setup: async () => api.get("/mfa/setup"),
    verify: async (payload: IMfaVerifyPayload) => api.post("/mfa/verify", payload),
    revoke: async () => api.put("/mfa/revoke"),
    verifyLogin: async (payload: IMfaVerifyLoginPayload) => api.post("/mfa/verify-login", payload),
};

export default mfaService;
