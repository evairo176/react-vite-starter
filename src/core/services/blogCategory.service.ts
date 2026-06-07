import api from "../api/axios";

/**
 * Blog category taxonomy data access over the shared Axios client. Provides the
 * category option list for blog filters. (Req 1.5, 3.5, 13.1)
 */
const blogCategoryService = {
  /** `GET /blog-category` — all blog categories. */
  getAll: async (params?: string) =>
    api.get(`/blog-category${params ? `?${params}` : ""}`),
};

export default blogCategoryService;
