import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";
import type {
  AnalyticsAggregations,
  AnalyticsSummary,
  TopItem,
} from "@/core/types/analytics.type";

/**
 * Component tests for the authenticated Admin_Analytics_View.
 *
 * Validates: Requirements 12.3, 12.4, 12.5, 12.6
 *
 * Strategy: mock the single data service the hook depends on
 * (`analytics.service` — `getSummary` + `getAggregations`) so the component
 * renders against deterministic responses, then assert each data-driven state:
 * success totals + aggregations (12.5), the table skeleton while queries are
 * pending (12.3), the ErrorState + working retry on failure (12.4), and the
 * per-section EmptyState when a section returns zero items (12.6). The shared
 * `renderWithProviders` helper supplies the QueryClient + Router + Helmet
 * providers the view requires. `fireEvent` is used (user-event is not
 * installed).
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
const getAggregations = vi.mocked(analyticsService.getAggregations);

// ---- Fixtures --------------------------------------------------------------
function makeTopItem(overrides: Partial<TopItem> = {}): TopItem {
  return {
    id: "item-1",
    title: "Sample Item",
    slug: "sample-item",
    count: 100,
    ...overrides,
  };
}

function summaryResponse(summary: AnalyticsSummary) {
  return { data: { data: summary } };
}

function aggregationsResponse(aggregations: AnalyticsAggregations) {
  return { data: { data: aggregations } };
}

const defaultSummary: AnalyticsSummary = {
  totalVisits: 1234,
  totalPosts: 12,
  totalProjects: 7,
};

const defaultAggregations: AnalyticsAggregations = {
  topPosts: [
    makeTopItem({ id: "p1", title: "First Post", slug: "first-post", count: 500 }),
    makeTopItem({ id: "p2", title: "Second Post", slug: "second-post", count: 250 }),
  ],
  topProjects: [
    makeTopItem({ id: "pr1", title: "Alpha Project", slug: "alpha", count: 320 }),
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
    getAggregations.mockResolvedValue(
      aggregationsResponse(defaultAggregations) as never,
    );

    renderWithProviders(<AdminAnalyticsView />);

    // Summary totals render as formatted stat cards (Req 12.1 / 12.5).
    expect(await screen.findByText("Total Visits")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    expect(screen.getByText("Total Projects")).toBeInTheDocument();

    // Top posts section renders its items.
    expect(screen.getByText("Top Posts")).toBeInTheDocument();
    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();

    // Top projects section renders its items.
    expect(screen.getByText("Top Projects")).toBeInTheDocument();
    expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    expect(screen.getByText("320")).toBeInTheDocument();
  });

  it("displays the loading skeleton while the analytics queries are in flight (Req 12.3)", async () => {
    // Never resolves -> the queries stay pending and the skeleton shows.
    getSummary.mockReturnValue(new Promise(() => {}) as never);
    getAggregations.mockReturnValue(new Promise(() => {}) as never);

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
    getAggregations.mockRejectedValue(new Error("boom"));

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
    getAggregations
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(aggregationsResponse(defaultAggregations) as never);

    renderWithProviders(<AdminAnalyticsView />);

    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(await screen.findByText("First Post")).toBeInTheDocument();
  });

  it("renders a per-section empty state when a section returns zero items (Req 12.6)", async () => {
    getSummary.mockResolvedValue(summaryResponse(defaultSummary) as never);
    getAggregations.mockResolvedValue(
      aggregationsResponse({
        topPosts: [],
        topProjects: [
          makeTopItem({ id: "pr1", title: "Alpha Project", slug: "alpha", count: 320 }),
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
    getSummary.mockResolvedValue(summaryResponse(defaultSummary) as never);
    getAggregations.mockResolvedValue(
      aggregationsResponse({ topPosts: [], topProjects: [] }) as never,
    );

    renderWithProviders(<AdminAnalyticsView />);

    expect(await screen.findByText("No post data yet")).toBeInTheDocument();
    expect(screen.getByText("No project data yet")).toBeInTheDocument();
  });
});
