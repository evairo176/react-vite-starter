import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";

/**
 * AnalyticsTracker tests.
 *
 * Validates: Requirements 8.1, 8.2, 8.3
 *
 * Strategy: the tracker reads the current location via TanStack Router's
 * `useLocation` and, on every pathname change, (a) emits a react-ga4
 * `page_view` event and (b) records a backend visit via `analyticsService`.
 * We mock `react-ga4`, the analytics service, and `useLocation` so we can drive
 * navigation deterministically by rerendering with a new pathname and assert
 * both side effects fire. A separate scenario makes `recordVisit` reject to
 * prove the failure is swallowed (no throw, UI unaffected).
 */

// Controllable location returned by the mocked useLocation hook.
let mockLocation = { pathname: "/" };

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => mockLocation,
}));

vi.mock("react-ga4", () => ({
  default: { event: vi.fn() },
}));

vi.mock("@/core/services/analytics.service", () => ({
  default: { recordVisit: vi.fn().mockResolvedValue({ data: {} }) },
}));

// Imported after the mocks are registered.
import ReactGA from "react-ga4";
import analyticsService from "@/core/services/analytics.service";
import { AnalyticsTracker } from "@/components/shared/analytics";

const mockedEvent = ReactGA.event as unknown as ReturnType<typeof vi.fn>;
const mockedRecordVisit = analyticsService.recordVisit as unknown as ReturnType<
  typeof vi.fn
>;

beforeEach(() => {
  mockLocation = { pathname: "/" };
  mockedEvent.mockClear();
  mockedRecordVisit.mockClear();
  mockedRecordVisit.mockResolvedValue({ data: {} });
});

afterEach(() => {
  cleanup();
});

describe("AnalyticsTracker", () => {
  it("fires BOTH the react-ga4 page_view event and analyticsService.recordVisit on navigation (Req 8.1, 8.3)", async () => {
    const { rerender } = render(<AnalyticsTracker />);

    // Initial mount records the first page.
    await waitFor(() => expect(mockedEvent).toHaveBeenCalledTimes(1));
    expect(mockedEvent).toHaveBeenCalledWith(
      "page_view",
      expect.objectContaining({ page_path: "/" }),
    );
    await waitFor(() => expect(mockedRecordVisit).toHaveBeenCalledTimes(1));
    expect(mockedRecordVisit).toHaveBeenCalledWith({ path: "/" });

    // Simulate a navigation to a new path and rerender.
    mockLocation = { pathname: "/projects" };
    rerender(<AnalyticsTracker />);

    await waitFor(() => expect(mockedEvent).toHaveBeenCalledTimes(2));
    expect(mockedEvent).toHaveBeenLastCalledWith(
      "page_view",
      expect.objectContaining({ page_path: "/projects" }),
    );
    await waitFor(() => expect(mockedRecordVisit).toHaveBeenCalledTimes(2));
    expect(mockedRecordVisit).toHaveBeenLastCalledWith({ path: "/projects" });
  });

  it("swallows a recordVisit rejection without throwing or affecting the UI (Req 8.2)", async () => {
    mockedRecordVisit.mockRejectedValueOnce(new Error("network down"));

    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);

    // Rendering must not throw even though recordVisit rejects.
    expect(() => render(<AnalyticsTracker />)).not.toThrow();

    // ga4 page_view still fires; recordVisit was attempted.
    await waitFor(() => expect(mockedEvent).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockedRecordVisit).toHaveBeenCalledTimes(1));

    // Give the rejected promise a chance to surface; it must be swallowed.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(unhandled).not.toHaveBeenCalled();

    process.off("unhandledRejection", unhandled);
  });
});
