import { useQuery } from "@tanstack/react-query";

import dashboardService from "@/core/services/dashboard.service";
import analyticsService from "@/core/services/analytics.service";
import type { IDashboardAnalytics } from "@/core/types/dashboard.type";
import type { ICommentCounts } from "@/core/services/dashboard.service";

/** Most-viewed blog post entry from `/analytics/summary`. */
export interface SummaryTopPost {
  id: string;
  title: string;
  slug: string;
  totalViews: number;
}

/** Most-viewed project entry from `/analytics/summary` (title/slug may be null). */
export interface SummaryTopProject {
  id: string;
  title: string | null;
  slug: string | null;
  views: number;
}

/** Totals + most-viewed lists returned by `/analytics/summary`. */
export interface DashboardSummary {
  totalVisits: number;
  last30DaysVisits: number;
  topPosts: SummaryTopPost[];
  topProjects: SummaryTopProject[];
}

/**
 * Data orchestration for the dashboard home. Runs three independent queries so
 * a single failing source never blanks the whole page:
 *  - `/dashboard/analytics` — content distribution (categories/tech/tags)
 *  - `/analytics/summary` — visit totals + most-viewed posts/projects
 *  - `/blog-posts/comments/count` — pending/approved/total comment counts
 *
 * Each query's data + error flags are exposed so the view can render what it
 * has and quietly hide (or message) any section whose query failed.
 */
const useDashboardHome = () => {
  const analyticsQuery = useQuery({
    queryKey: ["dashboard", "analytics"],
    queryFn: async (): Promise<IDashboardAnalytics> => {
      const res = await dashboardService.getAnalytics();
      return res.data.data;
    },
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: async (): Promise<DashboardSummary> => {
      const res = await analyticsService.getSummary();
      return res.data?.data;
    },
  });

  const commentCountsQuery = useQuery({
    queryKey: ["dashboard", "comment-counts"],
    queryFn: async (): Promise<ICommentCounts> => {
      const res = await dashboardService.getCommentCounts();
      return res.data.data;
    },
  });

  // Only block the page on the first paint of the two primary sources; the
  // comment-count widget degrades gracefully on its own.
  const isLoading = analyticsQuery.isLoading || summaryQuery.isLoading;

  return {
    analytics: analyticsQuery.data,
    analyticsError: analyticsQuery.isError,
    summary: summaryQuery.data,
    summaryError: summaryQuery.isError,
    commentCounts: commentCountsQuery.data,
    commentCountsError: commentCountsQuery.isError,
    isLoading,
  };
};

export default useDashboardHome;
