import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";
import type { AdminBlogPost } from "@/core/types/blogPost.type";

/**
 * Component tests for the Admin_Blog_Manager (task 16.3).
 *
 * Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.7, 10.8
 *
 * Strategy: the blog-post service, the taxonomy option services, the dashboard
 * publish service, and the sonner toast module are all mocked so the real
 * `useBlogManager` hook + TanStack Query mutation/invalidate flow drive the
 * component under test. The component is mounted through the shared
 * `renderWithProviders` helper (QueryClient + in-memory TanStack Router +
 * Helmet) with `page`/`limit` search params so the list query is enabled.
 * `fireEvent` is used throughout (user-event is not installed).
 */

// ---- Service + toast mocks (hoisted before the component imports them) ----- //

vi.mock("@/core/services/blogPost.service", () => ({
  default: {
    findAllAdmin: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock("@/core/services/blogCategory.service", () => ({
  default: { getAll: vi.fn() },
}));

vi.mock("@/core/services/blogTag.service", () => ({
  default: { getAll: vi.fn() },
}));

vi.mock("@/core/services/dashboard.service", () => ({
  default: { togglePostPublished: vi.fn() },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import blogPostService from "@/core/services/blogPost.service";
import blogCategoryService from "@/core/services/blogCategory.service";
import blogTagService from "@/core/services/blogTag.service";
import dashboardService from "@/core/services/dashboard.service";
import { toast } from "sonner";
import AdminBlogManager from "@/features/blog-post/BlogPost";

const findAllAdmin = vi.mocked(blogPostService.findAllAdmin);
const createPost = vi.mocked(blogPostService.create);
const updatePost = vi.mocked(blogPostService.update);
const destroyPost = vi.mocked(blogPostService.destroy);
const categoryGetAll = vi.mocked(blogCategoryService.getAll);
const tagGetAll = vi.mocked(blogTagService.getAll);
const togglePostPublished = vi.mocked(dashboardService.togglePostPublished);
const toastSuccess = vi.mocked(toast.success);
const toastError = vi.mocked(toast.error);

// ---- Fixtures -------------------------------------------------------------- //

/** Build a minimal AdminBlogPost row. */
function makePost(overrides: Partial<AdminBlogPost> = {}): AdminBlogPost {
  return {
    id: "post-1",
    title: "Existing Post",
    slug: "existing-post",
    excerpt: "An excerpt.",
    content: "<p>Body</p>",
    coverImage: null,
    isPublished: false,
    totalViews: 12,
    totalLikes: 3,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    categoryId: null,
    category: null,
    tags: [],
    ...overrides,
  };
}

/** Wrap admin list rows in the axios-style response (`res.data` is the body). */
function listResponse(posts: AdminBlogPost[]) {
  return {
    data: {
      data: posts,
      metadata: { total: posts.length, page: 1, limit: 10, totalPages: 1 },
    },
  };
}

/** Taxonomy services return `res.data.data` arrays. */
function taxonomyResponse(items: Array<{ id: string; name: string }>) {
  return { data: { data: items } };
}

/** An axios-shaped rejection so `errorCallback` can read `response.data`. */
function axiosError(message: string) {
  return { response: { data: { message, error: [] } } };
}

/** A successful mutation response so `successCallback` reads `data.message`. */
function mutationOk(message: string) {
  return { data: { message } };
}

function renderManager() {
  return renderWithProviders(<AdminBlogManager />, {
    initialEntry: "/?page=1&limit=10",
  });
}

/** Open the row "actions" dropdown and return the rendered menu. */
async function openRowMenu() {
  const trigger = screen.getByRole("button", { name: /open menu/i });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
  fireEvent.click(trigger);
  return screen.findByRole("menu");
}

// ---- jsdom shims for Radix pointer/scroll interactions --------------------- //

beforeAll(() => {
  // Radix primitives (DropdownMenu) rely on pointer capture + scrollIntoView,
  // which jsdom does not implement.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  // Default: taxonomy lists resolve empty unless a test overrides them.
  categoryGetAll.mockResolvedValue(taxonomyResponse([]) as never);
  tagGetAll.mockResolvedValue(taxonomyResponse([]) as never);
});

afterEach(() => {
  vi.useRealTimers();
});

// ---- List rendering -------------------------------------------------------- //

describe("AdminBlogManager - list rendering (Req 10.2, 16.5)", () => {
  it("shows the TableSkeleton while the list request is in flight", async () => {
    // Never resolves -> the query stays pending and the skeleton shows.
    findAllAdmin.mockReturnValue(new Promise(() => {}) as never);

    renderManager();

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="table-skeleton"]'),
      ).toBeInTheDocument();
    });
  });

  it("renders the returned posts once the list request resolves", async () => {
    findAllAdmin.mockResolvedValue(
      listResponse([makePost({ title: "Hello Admin Post" })]) as never,
    );

    renderManager();

    expect(await screen.findByText("Hello Admin Post")).toBeInTheDocument();
    // Skeleton is replaced by the table once data resolves.
    expect(
      document.querySelector('[data-slot="table-skeleton"]'),
    ).not.toBeInTheDocument();
  });
});

// ---- Create flow ----------------------------------------------------------- //

describe("AdminBlogManager - create flow (Req 10.2)", () => {
  it("submits a create request, refreshes the list, and toasts on success", async () => {
    findAllAdmin.mockResolvedValue(listResponse([]) as never);
    createPost.mockResolvedValue(mutationOk("Post created") as never);

    renderManager();

    // Wait for the initial list load to settle.
    await waitFor(() => expect(findAllAdmin).toHaveBeenCalled());
    const callsBeforeCreate = findAllAdmin.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: /add post/i }));

    const dialog = await screen.findByRole("dialog");
    // Filling the title auto-derives the slug (both required, min 2).
    fireEvent.change(within(dialog).getByPlaceholderText("e.g. My first post"), {
      target: { value: "Brand New Post" },
    });

    fireEvent.click(within(dialog).getByRole("button", { name: /save post/i }));

    await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));
    expect(createPost.mock.calls[0][0]).toMatchObject({
      title: "Brand New Post",
      slug: "brand-new-post",
    });

    // Success toast fired and the admin list query was invalidated (refetched).
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Post created"));
    await waitFor(() =>
      expect(findAllAdmin.mock.calls.length).toBeGreaterThan(callsBeforeCreate),
    );
    // Dialog closes on success.
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

// ---- Edit flow ------------------------------------------------------------- //

describe("AdminBlogManager - edit flow (Req 10.3)", () => {
  it("submits an update request, refreshes the list, and toasts on success", async () => {
    findAllAdmin.mockResolvedValue(
      listResponse([makePost({ id: "p-9", title: "Editable Post" })]) as never,
    );
    updatePost.mockResolvedValue(mutationOk("Post updated") as never);

    renderManager();

    await screen.findByText("Editable Post");
    const callsBeforeUpdate = findAllAdmin.mock.calls.length;

    const menu = await openRowMenu();
    fireEvent.click(within(menu).getByRole("menuitem", { name: /edit/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Edit Post")).toBeInTheDocument();

    // Change the title and submit the edit.
    fireEvent.change(within(dialog).getByPlaceholderText("e.g. My first post"), {
      target: { value: "Edited Title" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /update post/i }));

    await waitFor(() => expect(updatePost).toHaveBeenCalledTimes(1));
    expect(updatePost.mock.calls[0][0]).toBe("p-9");
    expect(updatePost.mock.calls[0][1]).toMatchObject({ title: "Edited Title" });

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Post updated"));
    await waitFor(() =>
      expect(findAllAdmin.mock.calls.length).toBeGreaterThan(callsBeforeUpdate),
    );
  });
});

// ---- Delete flow ----------------------------------------------------------- //

describe("AdminBlogManager - delete flow (Req 10.4)", () => {
  it("submits a delete request, refreshes the list, and toasts on success", async () => {
    findAllAdmin.mockResolvedValue(
      listResponse([makePost({ id: "p-del", title: "Deletable Post" })]) as never,
    );
    destroyPost.mockResolvedValue(mutationOk("Post deleted") as never);

    renderManager();

    await screen.findByText("Deletable Post");
    const callsBeforeDelete = findAllAdmin.mock.calls.length;

    const menu = await openRowMenu();
    fireEvent.click(within(menu).getByRole("menuitem", { name: /delete/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Delete post")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(destroyPost).toHaveBeenCalledWith("p-del"));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Post deleted"));
    await waitFor(() =>
      expect(findAllAdmin.mock.calls.length).toBeGreaterThan(callsBeforeDelete),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

// ---- Publish toggle -------------------------------------------------------- //

describe("AdminBlogManager - publish toggle (Req 10.5)", () => {
  it("submits the publish-state change and toasts on success", async () => {
    findAllAdmin.mockResolvedValue(
      listResponse([makePost({ id: "p-pub", isPublished: false })]) as never,
    );
    togglePostPublished.mockResolvedValue(mutationOk("Publish state updated") as never);

    renderManager();

    const toggle = await screen.findByRole("switch", { name: /publish post/i });
    fireEvent.click(toggle);

    await waitFor(() =>
      expect(togglePostPublished).toHaveBeenCalledWith("p-pub", true),
    );
    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Publish state updated"),
    );
  });
});

// ---- Validation blocks submit ---------------------------------------------- //

describe("AdminBlogManager - field validation (Req 10.7)", () => {
  it("blocks submit and shows field messages when required fields are missing", async () => {
    findAllAdmin.mockResolvedValue(listResponse([]) as never);

    renderManager();

    await waitFor(() => expect(findAllAdmin).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /add post/i }));

    const dialog = await screen.findByRole("dialog");
    // Submit with empty title/slug (both required, min 2).
    fireEvent.click(within(dialog).getByRole("button", { name: /save post/i }));

    // Field-level validation messages render and the request is not sent.
    await waitFor(() => {
      expect(
        within(dialog).queryAllByText(/at least 2|too small|required|invalid/i)
          .length,
      ).toBeGreaterThan(0);
    });
    expect(createPost).not.toHaveBeenCalled();
    // The dialog stays open because submission was blocked.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

// ---- Error preserves the view state ---------------------------------------- //

describe("AdminBlogManager - error handling preserves view (Req 10.8)", () => {
  it("keeps the create dialog open with values and toasts on create failure", async () => {
    findAllAdmin.mockResolvedValue(listResponse([]) as never);
    createPost.mockRejectedValue(axiosError("Create failed"));

    renderManager();

    await waitFor(() => expect(findAllAdmin).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /add post/i }));

    const dialog = await screen.findByRole("dialog");
    const titleInput = within(dialog).getByPlaceholderText("e.g. My first post");
    fireEvent.change(titleInput, { target: { value: "Doomed Post" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /save post/i }));

    await waitFor(() => expect(createPost).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Create failed"));

    // The dialog remains open and the entered values are preserved.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      (within(screen.getByRole("dialog")).getByPlaceholderText(
        "e.g. My first post",
      ) as HTMLInputElement).value,
    ).toBe("Doomed Post");
  });

  it("toasts on publish-toggle failure without crashing the view (Req 10.8)", async () => {
    findAllAdmin.mockResolvedValue(
      listResponse([makePost({ id: "p-pub", isPublished: false })]) as never,
    );
    togglePostPublished.mockRejectedValue(axiosError("Publish failed"));

    renderManager();

    const toggle = await screen.findByRole("switch", { name: /publish post/i });
    fireEvent.click(toggle);

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Publish failed"));
    // The list row is still present (view state preserved).
    expect(screen.getByText("Existing Post")).toBeInTheDocument();
  });
});
