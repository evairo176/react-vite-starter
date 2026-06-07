import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";
import type { AdminComment } from "@/core/types/blogPost.type";

/**
 * Component tests for the Admin_Comment_Manager.
 *
 * Strategy: the blog-comment service and the sonner toast module are mocked so
 * the real `useCommentManager` hook + TanStack Query mutation/invalidate flow
 * drive the component under test. The component is mounted through the shared
 * `renderWithProviders` helper (QueryClient + in-memory TanStack Router +
 * Helmet) with `page`/`limit` search params so the list query is enabled.
 * `fireEvent` is used throughout (user-event is not installed).
 */

// ---- Service + toast mocks (hoisted before the component imports them) ----- //

vi.mock("@/core/services/blogComment.service", () => ({
  default: {
    listAdmin: vi.fn(),
    getCounts: vi.fn(),
    approve: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import blogCommentService from "@/core/services/blogComment.service";
import { toast } from "sonner";
import AdminCommentManager from "@/features/blog-comment/CommentManager";

const listAdmin = vi.mocked(blogCommentService.listAdmin);
const getCounts = vi.mocked(blogCommentService.getCounts);
const approve = vi.mocked(blogCommentService.approve);
const destroy = vi.mocked(blogCommentService.destroy);
const toastSuccess = vi.mocked(toast.success);

// ---- Fixtures -------------------------------------------------------------- //

/** Build a minimal AdminComment row. */
function makeComment(overrides: Partial<AdminComment> = {}): AdminComment {
  return {
    id: "comment-1",
    name: "Jane Visitor",
    email: "jane@example.com",
    body: "Great post, thanks for sharing!",
    isApproved: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    post: { id: "post-1", title: "Hello World", slug: "hello-world" },
    ...overrides,
  };
}

/** Wrap admin list rows in the axios-style response (`res.data` is the body). */
function listResponse(comments: AdminComment[]) {
  return {
    data: {
      data: comments,
      metadata: {
        total: comments.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  };
}

/** Counts endpoint response (`res.data.data` is the counts object). */
function countsResponse(
  counts: { pending: number; approved: number; total: number } = {
    pending: 1,
    approved: 2,
    total: 3,
  },
) {
  return { data: { data: counts } };
}

/** A successful mutation response so `successCallback` reads `data.message`. */
function mutationOk(message: string) {
  return { data: { message } };
}

function renderManager() {
  return renderWithProviders(<AdminCommentManager />, {
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
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  // Default: counts resolve unless a test overrides them.
  getCounts.mockResolvedValue(countsResponse() as never);
});

afterEach(() => {
  vi.useRealTimers();
});

// ---- List rendering -------------------------------------------------------- //

describe("AdminCommentManager - list rendering", () => {
  it("shows the TableSkeleton while the list request is in flight", async () => {
    // Never resolves -> the query stays pending and the skeleton shows.
    listAdmin.mockReturnValue(new Promise(() => {}) as never);

    renderManager();

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="table-skeleton"]'),
      ).toBeInTheDocument();
    });
  });

  it("renders the returned comments once the list request resolves", async () => {
    listAdmin.mockResolvedValue(
      listResponse([
        makeComment({ body: "A wonderful comment body" }),
      ]) as never,
    );

    renderManager();

    expect(
      await screen.findByText("A wonderful comment body"),
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Visitor")).toBeInTheDocument();
    // Skeleton is replaced by the table once data resolves.
    expect(
      document.querySelector('[data-slot="table-skeleton"]'),
    ).not.toBeInTheDocument();
  });
});

// ---- Approve flow ---------------------------------------------------------- //

describe("AdminCommentManager - approve flow", () => {
  it("approves a pending comment, refreshes the list, and toasts on success", async () => {
    listAdmin.mockResolvedValue(
      listResponse([makeComment({ id: "c-pending", isApproved: false })]) as never,
    );
    approve.mockResolvedValue(mutationOk("Comment approved") as never);

    renderManager();

    await screen.findByText("Jane Visitor");
    const callsBeforeApprove = listAdmin.mock.calls.length;

    const menu = await openRowMenu();
    fireEvent.click(within(menu).getByRole("menuitem", { name: /approve/i }));

    await waitFor(() => expect(approve).toHaveBeenCalledWith("c-pending"));
    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Comment approved"),
    );
    await waitFor(() =>
      expect(listAdmin.mock.calls.length).toBeGreaterThan(callsBeforeApprove),
    );
  });
});

// ---- Delete flow ----------------------------------------------------------- //

describe("AdminCommentManager - delete flow", () => {
  it("deletes a comment (with confirm), refreshes the list, and toasts on success", async () => {
    listAdmin.mockResolvedValue(
      listResponse([makeComment({ id: "c-del", isApproved: true })]) as never,
    );
    destroy.mockResolvedValue(mutationOk("Comment deleted") as never);

    renderManager();

    await screen.findByText("Jane Visitor");
    const callsBeforeDelete = listAdmin.mock.calls.length;

    const menu = await openRowMenu();
    fireEvent.click(within(menu).getByRole("menuitem", { name: /delete/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Delete comment")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(destroy).toHaveBeenCalledWith("c-del"));
    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Comment deleted"),
    );
    await waitFor(() =>
      expect(listAdmin.mock.calls.length).toBeGreaterThan(callsBeforeDelete),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

// ---- Status filter --------------------------------------------------------- //

describe("AdminCommentManager - status filter", () => {
  it("changes the status param sent to listAdmin when a filter tab is selected", async () => {
    listAdmin.mockResolvedValue(listResponse([makeComment()]) as never);

    renderManager();

    // Initial load uses the default "all" status.
    await waitFor(() => expect(listAdmin).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        listAdmin.mock.calls.some(([params]) =>
          String(params).includes("status=all"),
        ),
      ).toBe(true),
    );

    // Select the "Pending" filter tab (Radix activates on pointer/mouse down).
    const pendingTab = screen.getByRole("tab", { name: /pending/i });
    fireEvent.pointerDown(pendingTab, { button: 0, ctrlKey: false });
    fireEvent.mouseDown(pendingTab, { button: 0 });
    fireEvent.click(pendingTab);

    await waitFor(() =>
      expect(
        listAdmin.mock.calls.some(([params]) =>
          String(params).includes("status=pending"),
        ),
      ).toBe(true),
    );
  });
});
