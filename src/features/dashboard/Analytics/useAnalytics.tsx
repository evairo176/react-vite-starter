import { useQuery } from "@tanstack/react-query";

import analyticsService from "@/core/services/analytics.service";
import { queryKeys } from "@/core/query/keys";
import type {
  AnalyticsAggregations,
  AnalyticsSummary,
} from "@/core/types/analytics.type";

/**
 * Data orchestration for the Admin_Analytics_View. Runs two independent
 * queries — `/analytics/summary` for totals (Req 12.1) and
 * `/analytics/aggregations` for top posts/projects (Req 12.2) — and exposes
 * their combined state so the component can render Loading / Error / Empty /
 * content. (Req 12.1-12.6)
 */
const useAnalytics = () => {
  const summaryQuery = useQuery({
    queryKey: queryKeys.analytics.summary(),
    queryFn: async (): Promise<AnalyticsSummary> => {
      const res = await analyticsService.getSummary();
      return res.data?.data;
    },
  });

  const aggregationsQuery = useQuery({
    queryKey: queryKeys.analytics.aggregations(),
    queryFn: async (): Promise<AnalyticsAggregations> => {
      const res = await analyticsService.getAggregations();
      return res.data?.data;
    },
  });

  const isLoading = summaryQuery.isLoading || aggregationsQuery.isLoading;
  const isError = summaryQuery.isError || aggregationsQuery.isError;

  /** Retry both queries (drives the Error_State retry control). (Req 12.4) */
  const refetch = () => {
    void summaryQuery.refetch();
    void aggregationsQuery.refetch();
  };

  return {
    summary: summaryQuery.data,
    aggregations: aggregationsQuery.data,
    isLoading,
    isError,
    refetch,
  };
};

export default useAnalytics;
