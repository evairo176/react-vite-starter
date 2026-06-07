import api from "../api/axios";

/**
 * Public portfolio data access over the shared Axios client.
 *
 * Thin wrappers returning the raw Axios response, mirroring the existing
 * service style (e.g. `blogPost.service`). The list query string is built by
 * the pure `buildListQuery` helper (`core/utils/query.ts`) by the caller.
 * (Req 1.1, 2.1, 13.1)
 */
const publicPortfolioService = {
  /** `GET /portfolio/public?<params>` — paginated/filtered public list. (Req 1.1) */
  getPublicList: async (params: string) =>
    api.get(`/portfolio/public${params ? `?${params}` : ""}`),

  /** `GET /portfolio/public/:slug` — public case-study detail. (Req 2.1) */
  getPublicBySlug: async (slug: string) =>
    api.get(`/portfolio/public/${slug}`),
};

export default publicPortfolioService;
