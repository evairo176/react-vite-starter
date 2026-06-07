import api from "../api/axios";

/**
 * Blog tag taxonomy data access over the shared Axios client. Provides the tag
 * option list for blog filters. (Req 3.6, 13.1)
 */
const blogTagService = {
  /** `GET /blog-tag` — all blog tags. */
  getAll: async (params?: string) =>
    api.get(`/blog-tag${params ? `?${params}` : ""}`),
};

export default blogTagService;
