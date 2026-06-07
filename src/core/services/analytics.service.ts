import api from "../api/axios";
import type { VisitPayload } from "../types/analytics.type";

/**
 * Analytics data access over the shared Axios client: visit tracking plus the
 * Admin_Analytics_View summary/aggregations. (Req 8.1, 12.1, 12.2, 13.1)
 */
const analyticsService = {
  /** `POST /analytics/visit` — record a page visit. (Req 8.1) */
  recordVisit: async (payload: VisitPayload) =>
    api.post("/analytics/visit", payload),

  /** `GET /analytics/summary` — totals for the analytics view. (Req 12.1) */
  getSummary: async () => api.get("/analytics/summary"),

  /** `GET /analytics/aggregations` — top posts/projects. (Req 12.2) */
  getAggregations: async () => api.get("/analytics/aggregations"),
};

export default analyticsService;
