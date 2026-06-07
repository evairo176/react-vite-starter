import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";

/**
 * Component tests for the authenticated Admin_Analytics_View.
 *
 * Validates: Requirements 12.3, 12.4, 12.5, 12.6
 *
 * Strategy: mock `analytics.service.getSummary` (the single endpoint the hook
 * depends on — top posts/projects live on `/analytics/summary`, not
 * `/analytics/aggregations`) so the component renders against deterministic
 * responses, then assert each data-driven state: success totals + aggregations
 * (12.5), the table skeleton while the query is pending (12.3), the ErrorState +
 * working retry on failure (12.4), and the per-section EmptyState when a
 * section returns zero items (12.6). The shared `renderWithProviders` helper
 * supplies the QueryClient + Router + Helmet providers the view requires.
 * `fireEvent` is used (user-event is not installed).
 */

// ---- Service mock (hoisted before the component imports it) ----------------
vi.mock("@/core/services/analytics.service", () => ({
  default: {
    getSummary: vi.fn(),
    getAggregations: vi.fn(),
  },
}));

import analyticsService from "@/core/services/analytics.service";
import AdminAnalyticsView from "@/features/dashboard/Analytics";

const getSummary = vi.mocked(analyticsService.getSummary);

// ---- Fixtures --------------------------------------------------------------
// The backend `/analytics/summary` payload: numeric totals plus top
// posts (carrying `totalViews`) and top projects (carrying `views`).
interface RawSummaryFixture {
  totalVisits: number;
  last30DaysVisits: number;
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    totalViews: number;
  }>;
  topProjects: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
  }>;
}

function summaryResponse(summary: RawSummaryFixture) {
  return { data: { data: summary } };
}

const defaultSummary: RawSummaryFixture = {
  totalVisits: 1234,
  last30DaysVisits: 56,
  topPosts: [
    { id: "p1", title: "First Post", slug: "first-post", totalViews: 500 },
    { id: "p2", title: "Second Post", slug: "second-post", totalViews: 250 },
  ],
  topProjects: [
    { id: "pr1", title: "Alpha Project", slug: "alpha", views: 320 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AdminAnalyticsView - data-driven states", () => {
  it("renders summary totals and the top posts/projects sections on success (Req 12.5)", async () => {
    getSummary.mockResolvedValue(summaryResponse(defaultSummary) as never);

    renderWithProviders(<AdminAnalyticsView />);

    // Summary totals render as formatted stat cards (Req 12.1 / 12.5).
    expect(await screen.findByText("Total Visits")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();

    // Top posts section renders its items (normalized from `totalViews`).
    expect(screen.getByText("Top Posts")).toBeInTheDocument();
    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();

    // Top projects section renders its items (normalized from `views`).
    expect(screen.getByText("Top Projects")).toBeInTheDocument();
    expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    expect(screen.getByText("320")).toBeInTheDocument();
  });

  it("displays the loading skeleton while the analytics query is in flight (Req 12.3)", async () => {
    // Never resolves -> the query stays pending and the skeleton shows.
    getSummary.mockReturnValue(new Promise(() => {}) as never);

    renderWithProviders(<AdminAnalyticsView />);

    await waitFor(() => {
      expect(
        document.querySelectorAll('[data-slot="table-skeleton"]').length,
      ).toBeGreaterThan(0);
    });

    // Content should not be present while loading.
    expect(screen.queryByText("Top Posts")).not.toBeInTheDocument();
  });

  it("renders an error state with a working retry control on failure (Req 12.4)", async () => {
    getSummary.mockRejectedValue(new Error("boom"));

    renderWithProviders(<AdminAnalyticsView />);

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Couldn't load analytics")).toBeInTheDocument();

    const callsBeforeRetry = getSummary.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(getSummary.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
    });
  });

  it("recovers and renders content when a retry succeeds (Req 12.4)", async () => {
    getSummary
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(summaryResponse(defaultSummary) as never);

    renderWithProviders(<AdminAnalyticsView />);

    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByText("First Post")).toBeInTheDocument();
  });

  it("renders a per-section empty state when a section returns zero items (Req 12.6)", async () => {
    getSummary.mockResolvedValue(
      summaryResponse({
        ...defaultSummary,
        topPosts: [],
        topProjects: [
          { id: "pr1", title: "Alpha Project", slug: "alpha", views: 320 },
        ],
      }) as never,
    );

    renderWithProviders(<AdminAnalyticsView />);

    // The empty posts section shows its EmptyState...
    expect(await screen.findByText("No post data yet")).toBeInTheDocument();
    // ...while the non-empty projects section still renders its item.
    expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    expect(screen.queryByText("No project data yet")).not.toBeInTheDocument();
  });

  it("scopes empty/populated rendering to the correct section (Req 12.6)", async () => {
    getSummary.mockResolvedValue(
      summaryResponse({
        ...defaultSummary,
        topPosts: [],
        topProjects: [],
      }) as never,
    );

    renderWithProviders(<AdminAnalyticsView />);

    expect(await screen.findByText("No post data yet")).toBeInTheDocument();
    expect(screen.getByText("No project data yet")).toBeInTheDocument();
  });
});
