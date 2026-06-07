import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useParams,
} from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";

import { createTestQueryClient, renderWithProviders } from "./helpers/renderWithProviders";
import type { ApiResponse, PaginationMeta } from "@/core/types/api.type";
import type { IBlogPost } from "@/core/types/blogPost.type";

/**
 * Component tests for the public Blog_List_View.
 *
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 *
 * Strategy: mock the three data services the hook depends on
 * (`blogPost`, `blogCategory`, `blogTag`) so the component renders against
 * deterministic responses, then assert each data-driven state and the
 * URL-driven fetch wiring (search debounce, filter, pagination) plus the
 * navigation target. The shared `renderWithProviders` helper supplies the
 * QueryClient + TanStack Router + Helmet providers the view requires.
 */

// ---- Service mocks (hoisted before the component imports them) -------------
vi.mock("@/core/services/blogPost.service", () => ({
  default: { findAllPublic: vi.fn() },
}));
vi.mock("@/core/services/blogCategory.service", () => ({
  default: { getAll: vi.fn() },
}));
vi.mock("@/core/services/blogTag.service", () => ({
  default: { getAll: vi.fn() },
}));

import blogPostService from "@/core/services/blogPost.service";
import blogCategoryService from "@/core/services/blogCategory.service";
import blogTagService from "@/core/services/blogTag.service";
import BlogList from "@/features/Me/Blogs/BlogList";

const findAllPublic = vi.mocked(blogPostService.findAllPublic);
const categoryGetAll = vi.mocked(blogCategoryService.getAll);
const tagGetAll = vi.mocked(blogTagService.getAll);

// ---- Fixtures --------------------------------------------------------------
function makePost(overrides: Partial<IBlogPost> = {}): IBlogPost {
  return {
    id: "post-1",
    title: "Test Post Title",
    slug: "test-post-title",
    excerpt: "An excerpt for the test post.",
    content: null,
    coverImage: null,
    isPublished: true,
    totalViews: 42,
    totalLikes: 7,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function listResponse(
  posts: IBlogPost[],
  meta?: Partial<PaginationMeta>,
): { data: ApiResponse<IBlogPost[]> } {
  return {
    data: {
      status: "success",
      message: "ok",
      data: posts,
      metadata: meta
        ? {
            total: posts.length,
            page: 1,
            limit: 9,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
            ...meta,
          }
        : undefined,
    },
  };
}

/** A category/tag taxonomy response: `res.data.data` is the option list. */
function taxonomyResponse(items: Array<{ id: string; name: string; slug: string }>) {
  return { data: { data: items } };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: taxonomy lists empty unless a test overrides them.
  categoryGetAll.mockResolvedValue(taxonomyResponse([]) as never);
  tagGetAll.mockResolvedValue(taxonomyResponse([]) as never);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("BlogList - data-driven states", () => {
  it("renders the loading skeleton while the post request is in flight (Req 3.2)", async () => {
    // Never resolves -> the query stays pending and the skeleton shows.
    findAllPublic.mockReturnValue(new Promise(() => {}) as never);

    renderWithProviders(<BlogList />);

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="blog-list-skeleton"]'),
      ).toBeInTheDocument();
    });
  });

  it("renders an error state with a working retry control on failure (Req 3.3)", async () => {
    findAllPublic.mockRejectedValue(new Error("boom"));

    renderWithProviders(<BlogList />);

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Gagal memuat blog")).toBeInTheDocument();

    const callsBeforeRetry = findAllPublic.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(findAllPublic.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
    });
  });

  it("renders an empty state when the request returns zero posts (Req 3.4)", async () => {
    findAllPublic.mockResolvedValue(listResponse([]) as never);

    renderWithProviders(<BlogList />);

    expect(await screen.findByText("Belum ada tulisan")).toBeInTheDocument();
  });

  it("renders the returned posts when the request succeeds (Req 3.1)", async () => {
    findAllPublic.mockResolvedValue(
      listResponse([makePost({ title: "Hello World Post" })]) as never,
    );

    renderWithProviders(<BlogList />);

    expect(await screen.findByText("Hello World Post")).toBeInTheDocument();
  });
});

describe("BlogList - URL-driven fetch wiring", () => {
  it("re-requests with the search term after a 400ms debounce (Req 3.7)", async () => {
    findAllPublic.mockResolvedValue(listResponse([makePost()]) as never);

    renderWithProviders(<BlogList />);

    // Wait for the initial successful load.
    await screen.findByText("Test Post Title");
    expect(findAllPublic).toHaveBeenCalledWith("page=1&limit=9");

    vi.useFakeTimers();
    const input = screen.getByLabelText("Cari blog");
    fireEvent.change(input, { target: { value: "hello" } });

    // Before the debounce elapses, no new request is sent.
    expect(
      findAllPublic.mock.calls.some(([q]) => String(q).includes("search=hello")),
    ).toBe(false);

    act(() => {
      vi.advanceTimersByTime(400);
    });
    vi.useRealTimers();

    await waitFor(() => {
      expect(
        findAllPublic.mock.calls.some(([q]) =>
          String(q).includes("search=hello"),
        ),
      ).toBe(true);
    });
  });

  it("re-requests with the category slug when a category filter is selected (Req 3.5)", async () => {
    findAllPublic.mockResolvedValue(listResponse([makePost()]) as never);
    categoryGetAll.mockResolvedValue(
      taxonomyResponse([{ id: "c1", name: "Web", slug: "web" }]) as never,
    );

    renderWithProviders(<BlogList />);

    const webBadge = await screen.findByRole("button", { name: "Web" });
    fireEvent.click(webBadge);

    await waitFor(() => {
      expect(
        findAllPublic.mock.calls.some(([q]) =>
          String(q).includes("category=web"),
        ),
      ).toBe(true);
    });
  });

  it("re-requests with the tag slug when a tag filter is selected (Req 3.6)", async () => {
    findAllPublic.mockResolvedValue(listResponse([makePost()]) as never);
    tagGetAll.mockResolvedValue(
      taxonomyResponse([{ id: "t1", name: "react", slug: "react" }]) as never,
    );

    renderWithProviders(<BlogList />);

    const tagBadge = await screen.findByRole("button", { name: "#react" });
    fireEvent.click(tagBadge);

    await waitFor(() => {
      expect(
        findAllPublic.mock.calls.some(([q]) => String(q).includes("tags=react")),
      ).toBe(true);
    });
  });

  it("requests the next page when pagination is activated (Req 3.8)", async () => {
    findAllPublic.mockResolvedValue(
      listResponse([makePost()], {
        page: 1,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
        total: 12,
      }) as never,
    );

    renderWithProviders(<BlogList />);

    await screen.findByText("Test Post Title");

    const nav = screen.getByRole("navigation", { name: "pagination" });
    fireEvent.click(within(nav).getByLabelText("Go to next page"));

    await waitFor(() => {
      expect(
        findAllPublic.mock.calls.some(([q]) => String(q).includes("page=2")),
      ).toBe(true);
    });
  });
});

describe("BlogList - navigation target", () => {
  it("navigates to /blog/$slug when a post card is activated (Req 3.9)", async () => {
    findAllPublic.mockResolvedValue(
      listResponse([makePost({ title: "Clickable Post", slug: "clickable-post" })]) as never,
    );

    const rootRoute = createRootRoute({ component: Outlet });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: () => <BlogList />,
    });
    const detailRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/blog/$slug",
      component: function DetailMarker() {
        const { slug } = useParams({ from: "/blog/$slug" });
        return <div data-testid="blog-detail">slug:{slug}</div>;
      },
    });

    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute, detailRoute]),
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    render(
      <HelmetProvider>
        <QueryClientProvider client={createTestQueryClient()}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <RouterProvider router={router as any} />
        </QueryClientProvider>
      </HelmetProvider>,
    );

    const card = await screen.findByRole("button", { name: /Clickable Post/ });
    fireEvent.click(card);

    const detail = await screen.findByTestId("blog-detail");
    expect(detail).toHaveTextContent("slug:clickable-post");
  });
});
