import api from "../api/axios";
import type { IDashboardAnalytics } from "../types/dashboard.type";
import type { IPPortfolio } from "../types/portfolio.type";

const BASE_URL = "/dashboard";

const getAnalytics = async () => {
    return await api.get<{ status: string; data: IDashboardAnalytics }>(`${BASE_URL}/analytics`);
};

/** Shape returned by `GET /blog-posts/comments/count` (admin, JWT). */
export interface ICommentCounts {
    pending: number;
    approved: number;
    total: number;
}

/**
 * Fetch pending/approved/total comment counts for the dashboard moderation
 * widget via `GET /blog-posts/comments/count` (requires JWT). Lets the admin
 * surface how many comments await moderation at a glance.
 */
const getCommentCounts = async () => {
    return await api.get<{ status: string; data: ICommentCounts }>(
        `/blog-posts/comments/count`
    );
};

/**
 * Toggle a portfolio project's published state via the admin dashboard
 * endpoint `PATCH /dashboard/projects/:id/publish`. The response echoes the
 * updated project so callers can verify the displayed state matches the API
 * result. (Req 11.5, 11.6)
 */
const togglePortfolioPublish = async (id: string, isPublished: boolean) => {
    return await api.patch<{ status: string; data: IPPortfolio }>(
        `${BASE_URL}/projects/${id}/publish`,
        { isPublished }
    );
};

/**
 * Toggle (or explicitly set) a blog post's published state via the dashboard
 * endpoint `PATCH /dashboard/posts/:id/publish`. When `isPublished` is omitted
 * the backend flips the current state. (Req 10.5)
 */
const togglePostPublished = async (id: string, isPublished?: boolean) => {
    return await api.patch(
        `${BASE_URL}/posts/${id}/publish`,
        typeof isPublished === "boolean" ? { isPublished } : {},
    );
};

const dashboardService = {
    getAnalytics,
    getCommentCounts,
    togglePortfolioPublish,
    togglePostPublished,
};

export default dashboardService;
