import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { renderRouteWithProviders } from "./helpers/renderWithProviders";
import type { PublicProject } from "@/core/types/portfolio.type";

/**
 * Component tests for the Project_Case_Study_View (task 9.3).
 *
 * Covers: gallery ordering by position (Req 2.6), lightbox open/close
 * (Req 18.5-18.6), external live/repo link target+rel (Req 2.7, 2.8), the
 * 404 not-found branch vs. the generic error branch (Req 2.3, 2.4), and the
 * SEO tag values resolved via `resolveSeo` (Req 9.1).
 *
 * The public portfolio service is mocked so the `useProjectDetail` query is
 * driven entirely from the test, and the view is mounted on a real
 * `/projects/$slug` route so the `useParams` slug resolves correctly.
 */

// Mock the service module the hook calls. (Req 2.1)
vi.mock("@/core/services/publicPortfolio.service", () => ({
  default: {
    getPublicList: vi.fn(),
    getPublicBySlug: vi.fn(),
  },
}));

import publicPortfolioService from "@/core/services/publicPortfolio.service";

const getPublicBySlug = publicPortfolioService.getPublicBySlug as Mock;

// Lazy import so the vi.mock above is applied before the component's imports.
import ProjectDetail from "@/features/Me/Projects/Detail/ProjectDetail";

/** Build a minimal valid PublicProject, overridable per test. */
function makeProject(overrides: Partial<PublicProject> = {}): PublicProject {
  return {
    id: "p1",
    title: "Realtime Analytics Dashboard",
    slug: "realtime-analytics",
    description: "A full case study",
    shortDesc: "Short summary of the project",
    categoryId: "c1",
    isPublished: true,
    liveUrl: "https://live.example.com",
    repoUrl: "https://github.com/example/repo",
    featured: false,
    metaTitle: null,
    metaDesc: null,
    metaImage: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    category: { id: "c1", name: "Web App" } as PublicProject["category"],
    images: [],
    tags: [] as unknown as PublicProject["tags"],
    techStacks: [] as unknown as PublicProject["techStacks"],
    problem: "The problem statement",
    solution: "The solution narrative",
    results: "The measurable results",
    ...overrides,
  };
}

/** A success Axios-shaped response: hook reads `res.data.data`. */
function successResponse(project: PublicProject) {
  return { data: { data: project } };
}

/** An Axios-shaped error with a given HTTP status (passes `isAxiosError`). */
function axiosError(status: number) {
  return { isAxiosError: true, response: { status } };
}

/** Mount ProjectDetail on a real `/projects/$slug` route. */
function renderProjectDetail(slug = "realtime-analytics") {
  const rootRoute = createRootRoute({ component: Outlet });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects/$slug",
    component: ProjectDetail,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([detailRoute]),
    history: createMemoryHistory({ initialEntries: [`/projects/${slug}`] }),
  });
  return renderRouteWithProviders({ router });
}

beforeEach(() => {
  getPublicBySlug.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("ProjectDetail - gallery ordering (Req 2.6)", () => {
  it("renders gallery images ordered by ascending position", async () => {
    const project = makeProject({
      images: [
        { id: "img-c", portfolioId: "p1", url: "https://img/c.jpg", alt: "C", position: 2 },
        { id: "img-a", portfolioId: "p1", url: "https://img/a.jpg", alt: "A", position: 0 },
        { id: "img-b", portfolioId: "p1", url: "https://img/b.jpg", alt: "B", position: 1 },
      ] as PublicProject["images"],
    });
    getPublicBySlug.mockResolvedValue(successResponse(project));

    renderProjectDetail();

    const gallery = await screen.findByRole("region", { name: /project gallery/i });
    const imgs = within(gallery).getAllByRole("img");
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual([
      "https://img/a.jpg",
      "https://img/b.jpg",
      "https://img/c.jpg",
    ]);
  });
});

describe("ProjectDetail - lightbox open/close (Req 18.5, 18.6)", () => {
  it("opens the lightbox when a gallery image is activated and closes it", async () => {
    const project = makeProject({
      images: [
        { id: "img-a", portfolioId: "p1", url: "https://img/a.jpg", alt: "A", position: 0 },
        { id: "img-b", portfolioId: "p1", url: "https://img/b.jpg", alt: "B", position: 1 },
      ] as PublicProject["images"],
    });
    getPublicBySlug.mockResolvedValue(successResponse(project));

    renderProjectDetail();

    const openButton = await screen.findByRole("button", {
      name: /open image 1 in viewer/i,
    });

    // No dialog before activation.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(openButton);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /close image viewer/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("ProjectDetail - external links (Req 2.7, 2.8)", () => {
  it("opens live and repo links in a new tab with rel=noopener noreferrer", async () => {
    const project = makeProject({
      liveUrl: "https://live.example.com",
      repoUrl: "https://github.com/example/repo",
    });
    getPublicBySlug.mockResolvedValue(successResponse(project));

    renderProjectDetail();

    const liveLink = await screen.findByRole("link", { name: /view live/i });
    expect(liveLink).toHaveAttribute("href", "https://live.example.com");
    expect(liveLink).toHaveAttribute("target", "_blank");
    expect(liveLink).toHaveAttribute("rel", "noopener noreferrer");

    const repoLink = screen.getByRole("link", { name: /view repository/i });
    expect(repoLink).toHaveAttribute("href", "https://github.com/example/repo");
    expect(repoLink).toHaveAttribute("target", "_blank");
    expect(repoLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("ProjectDetail - not-found vs error branch (Req 2.3, 2.4)", () => {
  it("shows the not-found message and back link on a 404 response", async () => {
    getPublicBySlug.mockRejectedValue(axiosError(404));

    renderProjectDetail("missing-slug");

    expect(await screen.findByText(/project not found/i)).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: /back to projects/i });
    expect(backLink).toHaveAttribute("href", "/projects");
  });

  it("shows the ErrorState with a retry control on a non-404 error", async () => {
    getPublicBySlug.mockRejectedValue(axiosError(500));

    renderProjectDetail("boom");

    expect(
      await screen.findByText(/couldn't load this project/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    // Not the not-found branch.
    expect(screen.queryByText(/project not found/i)).not.toBeInTheDocument();
  });
});

describe("ProjectDetail - SEO tag values via resolveSeo (Req 9.1)", () => {
  it("uses explicit meta fields when present", async () => {
    const project = makeProject({
      title: "Realtime Analytics Dashboard",
      metaTitle: "Custom SEO Title",
      metaDesc: "Custom SEO description for search engines",
    });
    getPublicBySlug.mockResolvedValue(successResponse(project));

    renderProjectDetail();

    await screen.findByRole("heading", { name: /realtime analytics dashboard/i });

    await waitFor(() => {
      expect(document.title).toContain("Custom SEO Title");
    });
    const description = document.querySelector('meta[name="description"]');
    expect(description).toHaveAttribute(
      "content",
      "Custom SEO description for search engines"
    );
  });

  it("falls back to title and shortDesc when meta fields are absent", async () => {
    const project = makeProject({
      title: "Fallback Project",
      shortDesc: "Fallback short description",
      metaTitle: null,
      metaDesc: null,
    });
    getPublicBySlug.mockResolvedValue(successResponse(project));

    renderProjectDetail();

    await screen.findByRole("heading", { name: /fallback project/i });

    await waitFor(() => {
      expect(document.title).toContain("Fallback Project");
    });
    const description = document.querySelector('meta[name="description"]');
    expect(description).toHaveAttribute("content", "Fallback short description");
  });
});
