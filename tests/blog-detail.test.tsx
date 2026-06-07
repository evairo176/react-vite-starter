import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

import { renderRouteWithProviders } from "./helpers/renderWithProviders";
import type { PublicBlogPost } from "@/core/types/blogPost.type";

/**
 * Component tests for the Blog_Detail_View (task 11.5).
 *
 * Covers: metadata rendering (title/content/category/tags/reading time/view
 * count, Req 4.4), the optimistic reaction success increment + failure
 * rollback with error toast (Req 4.5, 4.6), Comment_Form validation blocking
 * submit + moderation message on success (Req 4.9, 4.10), related-posts links
 * pointing to the correct slugs (Req 4.11), the 404 not-found branch (Req 4.3),
 * and the SEO tag values resolved via `resolveSeo` (Req 9.2).
 *
 * The blog-post service is mocked so the `useBlogDetail` queries/mutations are
 * driven entirely from the test, sonner is mocked to assert the rollback error
 * toast and the moderation success message, and the view is mounted on a real
 * `/blog/$slug` route so `useParams` + related-post `<Link>` hrefs resolve.
 */

// ---- sonner mock (assert toast feedback) -----------------------------------
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ---- service mock (hoisted before the component imports it) ----------------
vi.mock("@/core/services/blogPost.service", () => ({
  default: {
    getPublicBySlug: vi.fn(),
    getPublicComments: vi.fn(),
    createComment: vi.fn(),
    createReaction: vi.fn(),
    incrementView: vi.fn(),
  },
}));

import { toast } from "sonner";
import blogPostService from "@/core/services/blogPost.service";
import BlogDetail from "@/features/blog/BlogDetail/BlogDetail";

const getPublicBySlug = blogPostService.getPublicBySlug as Mock;
const getPublicComments = blogPostService.getPublicComments as Mock;
const createComment = blogPostService.createComment as Mock;
const createReaction = blogPostService.createReaction as Mock;
const incrementView = blogPostService.incrementView as Mock;

const toastSuccess = toast.success as unknown as Mock;
const toastError = toast.error as unknown as Mock;

// ---- fixtures --------------------------------------------------------------
function makePost(overrides: Partial<PublicBlogPost> = {}): PublicBlogPost {
  return {
    id: "post-1",
    title: "Understanding React Suspense",
    slug: "understanding-react-suspense",
    excerpt: "A deep dive into Suspense and data fetching.",
    content: "<p>The blog body content goes here.</p>",
    coverImage: null,
    isPublished: true,
    totalViews: 123,
    totalLikes: 9,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    category: { id: "c1", name: "Engineering", slug: "engineering" },
    tags: [
      { id: "t1", name: "React", slug: "react" },
      { id: "t2", name: "Frontend", slug: "frontend" },
    ],
    reactionCount: 5,
    readingTime: 7,
    relatedPosts: [],
    ...overrides,
  };
}

/** A success Axios-shaped response: hooks read `res.data.data`. */
function successResponse<T>(data: T) {
  return { data: { data } };
}

/** An Axios-shaped error with a given HTTP status (passes `isAxiosError`). */
function axiosError(status: number) {
  return {
    isAxiosError: true,
    response: { status, data: { message: "boom" } },
  };
}

/** Mount BlogDetail on a real `/blog/$slug` route. */
function renderBlogDetail(slug = "understanding-react-suspense") {
  const rootRoute = createRootRoute({ component: Outlet });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/blog/$slug",
    component: BlogDetail,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([detailRoute]),
    history: createMemoryHistory({ initialEntries: [`/blog/${slug}`] }),
  });
  return renderRouteWithProviders({ router });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Reaction/view guards persist in localStorage; reset between tests so a
  // prior reaction doesn't block a later one.
  localStorage.clear();
  // Sensible defaults; individual tests override the detail response.
  getPublicComments.mockResolvedValue(successResponse([]));
  createReaction.mockResolvedValue(successResponse({}));
  createComment.mockResolvedValue(successResponse({ isApproved: true }));
  incrementView.mockResolvedValue(successResponse({}));
});

afterEach(() => {
  cleanup();
});

describe("BlogDetail - metadata rendering (Req 4.4)", () => {
  it("renders title, content, category, tags, reading time, and view count", async () => {
    getPublicBySlug.mockResolvedValue(successResponse(makePost()));

    renderBlogDetail();

    expect(
      await screen.findByRole("heading", {
        name: /understanding react suspense/i,
        level: 1,
      }),
    ).toBeInTheDocument();

    // Content is injected into the article body.
    expect(
      await screen.findByText(/the blog body content goes here/i),
    ).toBeInTheDocument();

    // Category + tags.
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();

    // Reading time + view count.
    expect(screen.getByText(/7 min read/i)).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });
});

describe("BlogDetail - optimistic reaction (Req 4.5, 4.6)", () => {
  it("increments the reaction count when the submission succeeds", async () => {
    getPublicBySlug.mockResolvedValue(
      successResponse(makePost({ reactionCount: 5 })),
    );
    // The API returns the authoritative count in `data.count`.
    createReaction.mockResolvedValue(successResponse({ count: 6 }));

    renderBlogDetail();

    const reactButton = await screen.findByRole("button", {
      name: /react to this post \(5 reactions\)/i,
    });

    fireEvent.click(reactButton);

    // The count converges on the server value reported after the mutation.
    expect(
      await screen.findByRole("button", {
        name: /you reacted to this post \(6 reactions\)/i,
      }),
    ).toBeInTheDocument();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("rolls back to the previous count and shows an error toast on failure", async () => {
    getPublicBySlug.mockResolvedValue(successResponse(makePost({ reactionCount: 5 })));
    createReaction.mockRejectedValue(axiosError(500));

    renderBlogDetail();

    const reactButton = await screen.findByRole("button", {
      name: /react to this post \(5 reactions\)/i,
    });

    fireEvent.click(reactButton);

    // Error toast surfaces and the displayed count is restored to 5.
    await waitFor(() => {
      expect(toastError).toHaveBeenCalled();
    });
    expect(
      await screen.findByRole("button", {
        name: /react to this post \(5 reactions\)/i,
      }),
    ).toBeInTheDocument();
  });

  it("prevents a second reaction from the same browser", async () => {
    getPublicBySlug.mockResolvedValue(
      successResponse(makePost({ reactionCount: 5 })),
    );
    createReaction.mockResolvedValue(successResponse({ count: 6 }));

    renderBlogDetail();

    const reactButton = await screen.findByRole("button", {
      name: /react to this post \(5 reactions\)/i,
    });
    fireEvent.click(reactButton);

    // After reacting, the control becomes disabled and reflects the reacted
    // state, so a further click cannot send another request.
    const reacted = await screen.findByRole("button", {
      name: /you reacted to this post \(6 reactions\)/i,
    });
    expect(reacted).toBeDisabled();

    fireEvent.click(reacted);
    expect(createReaction).toHaveBeenCalledTimes(1);
  });
});

describe("BlogDetail - comment form (Req 4.9, 4.10)", () => {
  it("blocks submission and shows field validation messages on invalid input", async () => {
    getPublicBySlug.mockResolvedValue(successResponse(makePost()));

    renderBlogDetail();

    const submit = await screen.findByRole("button", { name: /post comment/i });
    fireEvent.click(submit);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/comment is required/i)).toBeInTheDocument();

    // No request is sent while the form is invalid. (Req 4.10)
    expect(createComment).not.toHaveBeenCalled();
  });

  it("submits and shows a moderation message when the comment awaits approval (Req 4.9)", async () => {
    getPublicBySlug.mockResolvedValue(successResponse(makePost()));
    createComment.mockResolvedValue(successResponse({ isApproved: false }));

    renderBlogDetail();

    await screen.findByRole("button", { name: /post comment/i });

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/comment/i), {
      target: { value: "Great article, thanks for sharing!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /post comment/i }));

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/after it's approved/i),
      );
    });
  });
});

describe("BlogDetail - related posts (Req 4.11)", () => {
  it("renders related-post links pointing to the correct slugs", async () => {
    getPublicBySlug.mockResolvedValue(
      successResponse(
        makePost({
          relatedPosts: [
            { id: "r1", title: "Related Post One", slug: "related-post-one" },
            { id: "r2", title: "Related Post Two", slug: "related-post-two" },
          ],
        }),
      ),
    );

    renderBlogDetail();

    const linkOne = await screen.findByRole("link", {
      name: /related post one/i,
    });
    expect(linkOne).toHaveAttribute("href", "/blog/related-post-one");

    const linkTwo = screen.getByRole("link", { name: /related post two/i });
    expect(linkTwo).toHaveAttribute("href", "/blog/related-post-two");
  });
});

describe("BlogDetail - not-found branch (Req 4.3)", () => {
  it("shows the not-found message and a back link on a 404 response", async () => {
    getPublicBySlug.mockRejectedValue(axiosError(404));

    renderBlogDetail("missing-slug");

    expect(await screen.findByText(/post not found/i)).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: /back to blog/i });
    expect(backLink).toHaveAttribute("href", "/blogs");
  });
});

describe("BlogDetail - SEO tag values via resolveSeo (Req 9.2)", () => {
  it("sets the document title and meta description, falling back to title + excerpt", async () => {
    getPublicBySlug.mockResolvedValue(
      successResponse(
        makePost({
          title: "Fallback Blog Title",
          excerpt: "Fallback excerpt for search engines",
        }),
      ),
    );

    renderBlogDetail();

    await screen.findByRole("heading", { name: /fallback blog title/i, level: 1 });

    await waitFor(() => {
      expect(document.title).toContain("Fallback Blog Title");
    });

    const description = document.querySelector('meta[name="description"]');
    expect(description).toHaveAttribute(
      "content",
      "Fallback excerpt for search engines",
    );
  });
});
