import api from "../api/axios";
import type { IDashboardAnalytics } from "../types/dashboard.type";

const BASE_URL = "/dashboard";

const getAnalytics = async () => {
    return await api.get<{ status: string; data: IDashboardAnalytics }>(`${BASE_URL}/analytics`);
};

const dashboardService = {
    getAnalytics,
};

export default dashboardService;
