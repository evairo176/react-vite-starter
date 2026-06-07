import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import {
  act,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";

import { renderRouteWithProviders } from "./helpers/renderWithProviders";
import ProjectList from "@/features/Me/Projects/ProjectList";
import publicPortfolioService from "@/core/services/publicPortfolio.service";
import categoryService from "@/core/services/category.service";
import techStackService from "@/core/services/techStack.service";
import type { PublicProject } from "@/core/types/portfolio.type";

/**
 * Component tests for the Portfolio_List_View (task 8.3).
 *
 * Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 1.9, 1.10
 *
 * Strategy: the public portfolio service and the filter-option services are
 * mocked so the real `useProjectList` hook + TanStack Query data flow exercise
 * the component under test. The component is mounted inside a real (in-memory)
 * TanStack Router route tree that also declares `/projects/$slug` so the card
 * `Link`s resolve and the navigation target can be asserted from the rendered
 * anchor href.
 */

// ---- Service mocks --------------------------------------------------------- //

vi.mock("@/core/services/publicPortfolio.service", () => ({
  default: {
    getPublicList: vi.fn(),
    getPublicBySlug: vi.fn(),
  },
}));

vi.mock("@/core/services/category.service", () => ({
  default: { findAll: vi.fn() },
}));

vi.mock("@/core/services/techStack.service", () => ({
  default: { findAll: vi.fn() },
}));

const mockGetPublicList = vi.mocked(publicPortfolioService.getPublicList);
const mockCategoryFindAll = vi.mocked(categoryService.findAll);
const mockTechFindAll = vi.mocked(techStackService.findAll);

// ---- Fixtures -------------------------------------------------------------- //

/** Build a minimal PublicProject usable by the card renderer. */
function makeProject(over: Partial<PublicProject> = {}): PublicProject {
  return {
    id: over.id ?? "p1",
    title: over.title ?? "Alpha Project",
    slug: over.slug ?? "alpha",
    shortDesc: over.shortDesc ?? "A short description.",
    featured: over.featured ?? false,
    images: over.images ?? [],
    category: over.category ?? null,
    ...over,
  } as unknown as PublicProject;
}

/** Wrap a list body in an axios-style response (`res.data` is the API body). */
function listResponse(
  projects: PublicProject[],
  metadata?: Record<string, unknown>,
) {
  return { data: { data: projects, metadata } };
}

/** Option-list services return `res.data.data` arrays. */
function optionResponse(items: unknown[]) {
  return { data: { data: items } };
}

// ---- Router harness -------------------------------------------------------- //

function buildRouter(initialEntry = "/projects") {
  const rootRoute = createRootRoute({ component: Outlet });
  const projectsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects",
    component: ProjectList,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/projects/$slug",
    component: () => <div data-testid="project-detail">detail</div>,
  });

  return createRouter({
    routeTree: rootRoute.addChildren([projectsRoute, detailRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
}

function renderList(initialEntry = "/projects") {
  return renderRouteWithProviders({ router: buildRouter(initialEntry) as never });
}

// ---- Setup ----------------------------------------------------------------- //

beforeEach(() => {
  // Default: option lists resolve empty so the filter bar renders cleanly.
  mockCategoryFindAll.mockResolvedValue(optionResponse([]) as never);
  mockTechFindAll.mockResolvedValue(optionResponse([]) as never);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

// ---- Tests ----------------------------------------------------------------- //

describe("Portfolio List - data states", () => {
  it("renders the content-shaped skeleton while the request is in flight (Req 1.2, 16.1)", async () => {
    // A never-resolving promise keeps the query pending.
    mockGetPublicList.mockReturnValue(new Promise(() => {}) as never);

    renderList();

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="project-grid-skeleton"]'),
      ).toBeInTheDocument();
    });
    // No generic error/empty state while loading.
    expect(screen.queryByText("Tidak ada proyek")).not.toBeInTheDocument();
  });

  it("renders an error state with a working retry control on failure (Req 1.3)", async () => {
    mockGetPublicList.mockRejectedValue(new Error("network down"));

    renderList();

    const retry = await screen.findByRole("button", { name: /try again/i });
    expect(screen.getByText("Gagal memuat proyek")).toBeInTheDocument();

    const callsBeforeRetry = mockGetPublicList.mock.calls.length;
    fireEvent.click(retry);

    await waitFor(() => {
      expect(mockGetPublicList.mock.calls.length).toBeGreaterThan(
        callsBeforeRetry,
      );
    });
  });

  it("renders an empty state when zero projects are returned (Req 1.4)", async () => {
    mockGetPublicList.mockResolvedValue(listResponse([]) as never);

    renderList();

    expect(await screen.findByText("Tidak ada proyek")).toBeInTheDocument();
  });

  it("renders returned projects and keeps the featured section structurally present (Req 1.8)", async () => {
    mockGetPublicList.mockResolvedValue(
      listResponse([
        makeProject({ id: "p1", title: "Alpha Project", slug: "alpha", featured: true }),
        makeProject({ id: "p2", title: "Beta Project", slug: "beta" }),
      ]) as never,
    );

    renderList();

    // Both project titles render.
    expect(await screen.findByText("Beta Project")).toBeInTheDocument();
    // The featured section heading is always present.
    expect(
      screen.getByRole("heading", { name: /proyek unggulan/i }),
    ).toBeInTheDocument();
    // The featured project (featured: true) appears (its title shows in both
    // the featured grid and the main grid).
    expect(screen.getAllByText("Alpha Project").length).toBeGreaterThanOrEqual(1);
  });

  it("keeps the featured section present even when there are no featured projects (Req 1.8)", async () => {
    mockGetPublicList.mockResolvedValue(
      listResponse([makeProject({ id: "p2", title: "Beta Project", slug: "beta" })]) as never,
    );

    renderList();

    expect(await screen.findByText("Beta Project")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /proyek unggulan/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Belum ada proyek unggulan untuk ditampilkan."),
    ).toBeInTheDocument();
  });
});

describe("Portfolio List - navigation target (Req 1.10)", () => {
  it("links each project card to the /projects/$slug route", async () => {
    mockGetPublicList.mockResolvedValue(
      listResponse([
        makeProject({ id: "p1", title: "Alpha Project", slug: "alpha" }),
      ]) as never,
    );

    renderList();

    const link = await screen.findByRole("link", {
      name: /lihat studi kasus alpha project/i,
    });
    expect(link).toHaveAttribute("href", "/projects/alpha");
  });
});

describe("Portfolio List - pagination (Req 1.9)", () => {
  it("renders pagination controls and refetches the selected page", async () => {
    mockGetPublicList.mockResolvedValue(
      listResponse(
        [makeProject({ id: "p1", title: "Alpha Project", slug: "alpha" })],
        { total: 30, page: 1, limit: 9, totalPages: 3, hasNext: true, hasPrev: false },
      ) as never,
    );

    renderList();

    // Pagination nav appears once data + metadata resolve.
    const nav = await screen.findByRole("navigation", { name: /pagination/i });
    expect(nav).toBeInTheDocument();

    // Activating page 2 issues a fetch with page=2.
    fireEvent.click(screen.getByText("2"));

    await waitFor(() => {
      expect(mockGetPublicList).toHaveBeenCalledWith(
        expect.stringContaining("page=2"),
      );
    });
  });
});

describe("Portfolio List - filtering (Req 1.5)", () => {
  it("issues a fetch with the selected tech as a query parameter", async () => {
    mockGetPublicList.mockResolvedValue(
      listResponse([makeProject({ id: "p1", title: "Alpha Project", slug: "alpha" })]) as never,
    );
    mockTechFindAll.mockResolvedValue(
      optionResponse([{ id: "t1", name: "React", slug: "react" }]) as never,
    );

    renderList();

    // Wait for the initial render and tech options to load.
    await screen.findByText("Alpha Project");

    // Open the tech multi-select and pick "React".
    fireEvent.click(screen.getByText("Semua tech"));
    const option = await screen.findByText("React");
    fireEvent.click(option);

    await waitFor(() => {
      expect(mockGetPublicList).toHaveBeenCalledWith(
        expect.stringContaining("tech=React"),
      );
    });
  });
});

describe("Portfolio List - debounced search (Req 1.7)", () => {
  it("waits for the 400ms debounce before fetching with the search term", async () => {
    mockGetPublicList.mockResolvedValue(
      listResponse([makeProject({ id: "p1", title: "Alpha Project", slug: "alpha" })]) as never,
    );

    vi.useFakeTimers();
    renderList();

    // Flush the initial query + option-list queries.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    mockGetPublicList.mockClear();

    const input = screen.getByLabelText("Cari proyek");
    // Multiple rapid keystrokes should collapse into a single debounced fetch.
    fireEvent.change(input, { target: { value: "r" } });
    fireEvent.change(input, { target: { value: "re" } });
    fireEvent.change(input, { target: { value: "react" } });

    // Before the debounce window elapses, no new fetch is issued.
    expect(mockGetPublicList).not.toHaveBeenCalled();

    // Advance past the debounce; the committed search triggers one fetch.
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    vi.useRealTimers();

    await waitFor(() => {
      expect(mockGetPublicList).toHaveBeenCalledWith(
        expect.stringContaining("search=react"),
      );
    });
    expect(mockGetPublicList).toHaveBeenCalledTimes(1);
  });
});
