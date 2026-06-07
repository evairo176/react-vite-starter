import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";

/**
 * The home-page Projects section advertises the TOTAL number of published
 * projects (from the list response pagination metadata) so a recruiter notices
 * the volume immediately, even though only a 6-item preview is fetched.
 */

vi.mock("@/core/services/publicPortfolio.service", () => ({
  default: {
    getPublicList: vi.fn(),
    getPublicBySlug: vi.fn(),
  },
}));

import publicPortfolioService from "@/core/services/publicPortfolio.service";
import Projects from "@/features/Me/Projects/Projects";

const getPublicList = vi.mocked(publicPortfolioService.getPublicList);

function listResponse(items: unknown[], total: number) {
  return { data: { data: items, metadata: { total } } };
}

const sampleItems = [
  { id: "1", title: "Project A", slug: "a", featured: true, images: [] },
  { id: "2", title: "Project B", slug: "b", featured: false, images: [] },
];

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Home Projects total", () => {
  it("shows the total project count from metadata, not just the preview length", async () => {
    // 14 published total, but only 2 preview cards returned.
    getPublicList.mockResolvedValue(listResponse(sampleItems, 14) as never);

    renderWithProviders(<Projects />);

    // The total badge surfaces the count even though only 2 cards are shown.
    expect(
      await screen.findByText(
        /14 proyek profesional yang telah saya kerjakan/i,
      ),
    ).toBeInTheDocument();
    // Both the badge and the subheading reference the total.
    expect(screen.getAllByText(/14 proyek/i).length).toBeGreaterThanOrEqual(2);
  });

  it("omits the count badge when there are no projects", async () => {
    getPublicList.mockResolvedValue(listResponse([], 0) as never);

    renderWithProviders(<Projects />);

    expect(
      await screen.findByText(/belum ada proyek yang dipublikasikan/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/proyek$/i)).not.toBeInTheDocument();
  });
});
