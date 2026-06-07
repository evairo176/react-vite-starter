import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";
import type { Achievement } from "@/core/types/achievement.type";

/**
 * Component tests for the public Achievements section.
 *
 * Strategy: mock `achievement.service` (the only data dependency of the hook)
 * so the component renders against deterministic responses, then assert each
 * data-driven state:
 *   - Loading -> AchievementSkeleton
 *   - Error   -> ErrorState with a working retry control
 *   - Empty   -> EmptyState, surrounding section still rendered
 *   - Success -> each achievement's title + external credential link
 */

// ---- Service mock (hoisted before the component imports it) ----------------
vi.mock("@/core/services/achievement.service", () => ({
  default: { getPublic: vi.fn() },
}));

import achievementService from "@/core/services/achievement.service";
import Achievements from "@/features/Me/Achievements";

const getPublic = vi.mocked(achievementService.getPublic);

// ---- Fixtures --------------------------------------------------------------
function makeAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: "a-1",
    title: "AWS Certified Developer",
    issuer: "Amazon Web Services",
    description: "Validated cloud development expertise.",
    date: "2023-06-15T00:00:00.000Z",
    url: null,
    icon: null,
    category: "certification",
    position: 0,
    isPublished: true,
    createdAt: "2023-06-15T00:00:00.000Z",
    updatedAt: "2023-06-15T00:00:00.000Z",
    ...overrides,
  };
}

/** An achievement list response: `res.data.data` is the achievement array. */
function listResponse(items: Achievement[]) {
  return {
    data: {
      status: "success",
      message: "ok",
      data: items,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Achievements - data-driven states", () => {
  it("renders the loading skeleton while the request is in flight", async () => {
    // Never resolves -> the query stays pending and the skeleton shows.
    getPublic.mockReturnValue(new Promise(() => {}) as never);

    renderWithProviders(<Achievements />);

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="achievement-skeleton"]'),
      ).toBeInTheDocument();
    });
  });

  it("renders an error state with a working retry control on failure", async () => {
    getPublic.mockRejectedValue(new Error("boom"));

    renderWithProviders(<Achievements />);

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();

    const callsBeforeRetry = getPublic.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(getPublic.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
    });
  });

  it("renders an empty state without breaking the surrounding layout when zero achievements are returned", async () => {
    getPublic.mockResolvedValue(listResponse([]) as never);

    renderWithProviders(<Achievements />);

    expect(await screen.findByText("Belum ada pencapaian")).toBeInTheDocument();

    // The surrounding section layout is preserved (heading + section).
    expect(screen.getByText("Pencapaian")).toBeInTheDocument();
    expect(document.querySelector("#achievements")).toBeInTheDocument();
  });

  it("renders each achievement's title and an external credential link when present", async () => {
    getPublic.mockResolvedValue(
      listResponse([
        makeAchievement({
          id: "a-1",
          title: "Hackathon Winner",
          category: "award",
          url: "https://example.com/credential",
        }),
        makeAchievement({
          id: "a-2",
          title: "Open Source Milestone",
          category: "milestone",
          url: null,
        }),
      ]) as never,
    );

    renderWithProviders(<Achievements />);

    expect(await screen.findByText("Hackathon Winner")).toBeInTheDocument();
    expect(screen.getByText("Open Source Milestone")).toBeInTheDocument();

    // The achievement with a url renders an external credential link.
    const link = screen.getByRole("link", { name: /lihat kredensial/i });
    expect(link).toHaveAttribute("href", "https://example.com/credential");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
