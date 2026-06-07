/**
 * Centralized query-key registry — the single source of truth for TanStack
 * Query keys across the app. Readers and the mutations that invalidate them
 * share these factories so cache keys never drift. (Req 13.1, 13.2)
 */

import type {
  BlogListParams,
  PortfolioListParams,
} from "../utils/query";

/** Params object backing the admin list tables (search/filter/pagination). */
export interface AdminListParams {
  search?: string;
  page?: number;
  limit?: number;
  [k: string]: unknown;
}

export const queryKeys = {
  publicPortfolio: {
    list: (params: PortfolioListParams) =>
      ["public", "portfolio", "list", params] as const,
    detail: (slug: string) => ["public", "portfolio", "detail", slug] as const,
  },
  publicBlog: {
    list: (params: BlogListParams) =>
      ["public", "blog", "list", params] as const,
    detail: (slug: string) => ["public", "blog", "detail", slug] as const,
    comments: (slug: string) => ["public", "blog", "comments", slug] as const,
  },
  testimonials: () => ["public", "testimonials"] as const,
  achievements: {
    public: () => ["public", "achievements"] as const,
    adminList: (params: AdminListParams) =>
      ["admin", "achievements", "list", params] as const,
  },
  blogTaxonomy: {
    categories: () => ["blog", "categories"] as const,
    tags: () => ["blog", "tags"] as const,
  },
  adminBlog: {
    list: (params: AdminListParams) =>
      ["admin", "blog", "list", params] as const,
  },
  adminPortfolio: {
    list: (params: AdminListParams) =>
      ["admin", "portfolio", "list", params] as const,
  },
  adminComments: {
    list: (params: AdminListParams) =>
      ["admin", "comments", "list", params] as const,
    counts: () => ["admin", "comments", "counts"] as const,
  },
  analytics: {
    summary: () => ["admin", "analytics", "summary"] as const,
    aggregations: () => ["admin", "analytics", "aggregations"] as const,
  },
};
