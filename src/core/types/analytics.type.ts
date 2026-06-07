/**
 * Analytics domain types for visit tracking and the Admin_Analytics_View.
 */

/** Payload sent by the Analytics_Tracker via `POST /analytics/visit`. (Req 8.1) */
export interface VisitPayload {
  path: string;
}

/** Totals returned by `/analytics/summary`, rendered as summary cards. (Req 12.1) */
export interface AnalyticsSummary {
  totalVisits: number;
  [k: string]: number;
}

/** Aggregations returned by `/analytics/aggregations`. (Req 12.2, 12.5) */
export interface AnalyticsAggregations {
  topPosts: TopItem[];
  topProjects: TopItem[];
}

/** A single ranked item within an analytics aggregation. (Req 12.5) */
export interface TopItem {
  id: string;
  title: string;
  slug: string;
  count: number;
}
