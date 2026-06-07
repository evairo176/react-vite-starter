import { useQuery } from "@tanstack/react-query";

import analyticsService from "@/core/services/analytics.service";
import { queryKeys } from "@/core/query/keys";
import type {
  AnalyticsAggregations,
  AnalyticsSummary,
  TopItem,
} from "@/core/types/analytics.type";

/**
 * Raw shape returned by `GET /analytics/summary` on the backend. Top
 * posts/projects live here (not on `/analytics/aggregations`, which returns
 * category/tag/tech distributions used elsewhere). Posts carry `totalViews`
 * and projects carry `views`; both are normalized to `TopItem.count` for the
 * Admin_Analytics_View.
 */
interface RawSummary {
  totalVisits?: number;
  last30DaysVisits?: number;
  topPosts?: Array<{
    id: string;
    title: string | null;
    slug: string | null;
    totalViews?: number;
  }>;
  topProjects?: Array<{
    id: string;
    title: string | null;
    slug: string | null;
    views?: number;
  }>;
}

/** Normalize a raw top-post/project row into the view's `TopItem` shape. */
const toTopItem = (
  row: {
    id: string;
    title: string | null;
    slug: string | null;
    totalViews?: number;
    views?: number;
  },
): TopItem => ({
  id: row.id,
  title: row.title ?? "Untitled",
  slug: row.slug ?? "",
  count: row.totalViews ?? row.views ?? 0,
});

/**
 * Data orchestration for the Admin_Analytics_View. A single
 * `/analytics/summary` request supplies both the numeric totals (Req 12.1) and
 * the top posts/projects aggregations (Req 12.2); the latter are normalized
 * from the backend's `totalViews`/`views` fields into the `TopItem` shape the
 * UI renders. Exposes combined Loading / Error / Empty / content state.
 * (Req 12.1-12.6)
 */
const useAnalytics = () => {
  const summaryQuery = useQuery({
    queryKey: queryKeys.analytics.summary(),
    queryFn: async (): Promise<RawSummary> => {
      const res = await analyticsService.getSummary();
      return res.data?.data ?? {};
    },
  });

  const raw = summaryQuery.data;

  // Summary cards consume only numeric fields, so expose the plain totals.
  const summary: AnalyticsSummary | undefined = raw
    ? {
        totalVisits: raw.totalVisits ?? 0,
        last30Days: raw.last30DaysVisits ?? 0,
      }
    : undefined;

  const aggregations: AnalyticsAggregations | undefined = raw
    ? {
        topPosts: (raw.topPosts ?? []).map(toTopItem),
        topProjects: (raw.topProjects ?? []).map(toTopItem),
      }
    : undefined;

  return {
    summary,
    aggregations,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError,
    /** Retry the summary query (drives the Error_State retry control). (Req 12.4) */
    refetch: () => {
      void summaryQuery.refetch();
    },
  };
};

export default useAnalytics;
