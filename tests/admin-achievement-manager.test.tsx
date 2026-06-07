import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";
import type { Achievement } from "@/core/types/achievement.type";

/**
 * Component tests for the Admin_Achievement_Manager.
 *
 * Strategy: the achievement service and the sonner toast module are mocked so
 * the real `useAchievementManager` hook + TanStack Query mutation/invalidate
 * flow drive the component under test. The component is mounted through the
 * shared `renderWithProviders` helper (QueryClient + in-memory TanStack Router +
 * Helmet) with `page`/`limit` search params so the list query is enabled.
 * `fireEvent` is used throughout (user-event is not installed).
 */

// ---- Service + toast mocks (hoisted before the component imports them) ----- //

vi.mock("@/core/services/achievement.service", () => ({
  default: {
    findAllAdmin: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import achievementService from "@/core/services/achievement.service";
import { toast } from "sonner";
import AchievementManager from "@/features/achievement/AchievementManager";

const findAllAdmin = vi.mocked(achievementService.findAllAdmin);
const createAchievement = vi.mocked(achievementService.create);
const updateAchievement = vi.mocked(achievementService.update);
const destroyAchievement = vi.mocked(achievementService.destroy);
const toastSuccess = vi.mocked(toast.success);
const toastError = vi.mocked(toast.error);

// ---- Fixtures -------------------------------------------------------------- //

function makeAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: "ach-1",
    title: "Existing Achievement",
    issuer: "Some Org",
    description: "A description.",
    date: "2024-01-01T00:00:00.000Z",
    url: null,
    icon: null,
    category: "award",
    position: 0,
    isPublished: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    ...overrides,
  };
}

/** Wrap admin list rows in the axios-style response (`res.data` is the body). */
function listResponse(items: Achievement[]) {
  return {
    data: {
      data: items,
      metadata: { total: items.length, page: 1, limit: 10, totalPages: 1 },
    },
  };
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
  return renderWithProviders(<AchievementManager />, {
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
});

afterEach(() => {
  vi.useRealTimers();
});

// ---- List rendering -------------------------------------------------------- //

describe("AchievementManager - list rendering", () => {
  it("shows the TableSkeleton while the list request is in flight", async () => {
    findAllAdmin.mockReturnValue(new Promise(() => {}) as never);

    renderManager();

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="table-skeleton"]'),
      ).toBeInTheDocument();
    });
  });

  it("renders the returned achievements once the list request resolves", async () => {
    findAllAdmin.mockResolvedValue(
      listResponse([makeAchievement({ title: "Hello Achievement" })]) as never,
    );

    renderManager();

    expect(await screen.findByText("Hello Achievement")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="table-skeleton"]'),
    ).not.toBeInTheDocument();
  });
});

// ---- Create flow ----------------------------------------------------------- //

describe("AchievementManager - create flow", () => {
  it("submits a create request, refreshes the list, and toasts on success", async () => {
    findAllAdmin.mockResolvedValue(listResponse([]) as never);
    createAchievement.mockResolvedValue(mutationOk("Achievement created") as never);

    renderManager();

    await waitFor(() => expect(findAllAdmin).toHaveBeenCalled());
    const callsBeforeCreate = findAllAdmin.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: /add achievement/i }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(
      within(dialog).getByPlaceholderText("e.g. AWS Certified Developer"),
      { target: { value: "Brand New Achievement" } },
    );
    fireEvent.change(within(dialog).getByLabelText("Date"), {
      target: { value: "2024-05-01" },
    });

    fireEvent.click(
      within(dialog).getByRole("button", { name: /save achievement/i }),
    );

    await waitFor(() => expect(createAchievement).toHaveBeenCalledTimes(1));
    expect(createAchievement.mock.calls[0][0]).toMatchObject({
      title: "Brand New Achievement",
      date: "2024-05-01",
    });

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Achievement created"),
    );
    await waitFor(() =>
      expect(findAllAdmin.mock.calls.length).toBeGreaterThan(callsBeforeCreate),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

// ---- Edit flow ------------------------------------------------------------- //

describe("AchievementManager - edit flow", () => {
  it("submits an update request, refreshes the list, and toasts on success", async () => {
    findAllAdmin.mockResolvedValue(
      listResponse([
        makeAchievement({ id: "a-9", title: "Editable Achievement" }),
      ]) as never,
    );
    updateAchievement.mockResolvedValue(mutationOk("Achievement updated") as never);

    renderManager();

    await screen.findByText("Editable Achievement");
    const callsBeforeUpdate = findAllAdmin.mock.calls.length;

    const menu = await openRowMenu();
    fireEvent.click(within(menu).getByRole("menuitem", { name: /edit/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Edit Achievement")).toBeInTheDocument();

    fireEvent.change(
      within(dialog).getByPlaceholderText("e.g. AWS Certified Developer"),
      { target: { value: "Edited Title" } },
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: /update achievement/i }),
    );

    await waitFor(() => expect(updateAchievement).toHaveBeenCalledTimes(1));
    expect(updateAchievement.mock.calls[0][0]).toBe("a-9");
    expect(updateAchievement.mock.calls[0][1]).toMatchObject({
      title: "Edited Title",
    });

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Achievement updated"),
    );
    await waitFor(() =>
      expect(findAllAdmin.mock.calls.length).toBeGreaterThan(callsBeforeUpdate),
    );
  });
});

// ---- Delete flow ----------------------------------------------------------- //

describe("AchievementManager - delete flow", () => {
  it("submits a delete request, refreshes the list, and toasts on success", async () => {
    findAllAdmin.mockResolvedValue(
      listResponse([
        makeAchievement({ id: "a-del", title: "Deletable Achievement" }),
      ]) as never,
    );
    destroyAchievement.mockResolvedValue(mutationOk("Achievement deleted") as never);

    renderManager();

    await screen.findByText("Deletable Achievement");
    const callsBeforeDelete = findAllAdmin.mock.calls.length;

    const menu = await openRowMenu();
    fireEvent.click(within(menu).getByRole("menuitem", { name: /delete/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Delete achievement")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(destroyAchievement).toHaveBeenCalledWith("a-del"));
    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Achievement deleted"),
    );
    await waitFor(() =>
      expect(findAllAdmin.mock.calls.length).toBeGreaterThan(callsBeforeDelete),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

// ---- Validation blocks submit ---------------------------------------------- //

describe("AchievementManager - field validation", () => {
  it("blocks submit and shows field messages when required fields are missing", async () => {
    findAllAdmin.mockResolvedValue(listResponse([]) as never);

    renderManager();

    await waitFor(() => expect(findAllAdmin).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /add achievement/i }));

    const dialog = await screen.findByRole("dialog");
    // Submit with empty title + date (both required).
    fireEvent.click(
      within(dialog).getByRole("button", { name: /save achievement/i }),
    );

    await waitFor(() => {
      expect(
        within(dialog).queryAllByText(/required|too small|invalid/i).length,
      ).toBeGreaterThan(0);
    });
    expect(createAchievement).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

// ---- Error preserves the view state ---------------------------------------- //

describe("AchievementManager - error handling preserves view", () => {
  it("keeps the create dialog open with values and toasts on create failure", async () => {
    findAllAdmin.mockResolvedValue(listResponse([]) as never);
    createAchievement.mockRejectedValue(axiosError("Create failed"));

    renderManager();

    await waitFor(() => expect(findAllAdmin).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /add achievement/i }));

    const dialog = await screen.findByRole("dialog");
    const titleInput = within(dialog).getByPlaceholderText(
      "e.g. AWS Certified Developer",
    );
    fireEvent.change(titleInput, { target: { value: "Doomed Achievement" } });
    fireEvent.change(within(dialog).getByLabelText("Date"), {
      target: { value: "2024-05-01" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /save achievement/i }),
    );

    await waitFor(() => expect(createAchievement).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Create failed"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      (within(screen.getByRole("dialog")).getByPlaceholderText(
        "e.g. AWS Certified Developer",
      ) as HTMLInputElement).value,
    ).toBe("Doomed Achievement");
  });
});
