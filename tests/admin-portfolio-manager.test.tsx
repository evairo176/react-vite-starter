import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";
import type { IPPortfolio } from "@/core/types/portfolio.type";

/**
 * Component tests for the Admin_Portfolio_Manager (task 17.4).
 *
 * Validates: Requirements 11.2, 11.3, 11.4, 11.5, 11.6, 11.8, 11.10, 11.11
 *
 * Strategy: the data layer (`portfolio.service`, `dashboard.service`) and the
 * filter-option services (`category` / `tag` / `techStack`) are mocked so the
 * real `usePortfolioManager` hook + TanStack Query/mutation flow drive the
 * component under test. `sonner` is mocked so success/error toasts can be
 * asserted directly. The view is mounted through the shared
 * `renderWithProviders` helper (QueryClient + TanStack Router + Helmet); the
 * initial URL carries `page`/`limit` so the list query is enabled immediately.
 */

// ---- Mocks (hoisted before the component imports them) --------------------- //
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/core/services/portfolio.service", () => ({
  default: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock("@/core/services/dashboard.service", () => ({
  default: {
    getAnalytics: vi.fn(),
    togglePortfolioPublish: vi.fn(),
    togglePostPublished: vi.fn(),
  },
}));

vi.mock("@/core/services/category.service", () => ({
  default: { findAll: vi.fn() },
}));
vi.mock("@/core/services/techStack.service", () => ({
  default: { findAll: vi.fn() },
}));

import { toast } from "sonner";
import portfolioService from "@/core/services/portfolio.service";
import dashboardService from "@/core/services/dashboard.service";
import categoryService from "@/core/services/category.service";
import techStackService from "@/core/services/techStack.service";
import AdminPortfolioManager from "@/features/portfolio-management/Portfolio/AdminPortfolioManager";

const findAll = vi.mocked(portfolioService.findAll);
const create = vi.mocked(portfolioService.create);
const update = vi.mocked(portfolioService.update);
const destroy = vi.mocked(portfolioService.destroy);
const togglePortfolioPublish = vi.mocked(dashboardService.togglePortfolioPublish);
const categoryFindAll = vi.mocked(categoryService.findAll);
const techFindAll = vi.mocked(techStackService.findAll);

const toastSuccess = vi.mocked(toast.success);
const toastError = vi.mocked(toast.error);

// ---- Fixtures -------------------------------------------------------------- //
function makeProject(over: Partial<IPPortfolio> = {}): IPPortfolio {
  return {
    id: "proj-1",
    title: "Alpha Project",
    slug: "alpha-project",
    description: "A full description",
    shortDesc: "short",
    categoryId: "cat-1",
    isPublished: true,
    liveUrl: "https://live.example.com",
    repoUrl: "https://github.com/example/repo",
    featured: false,
    metaTitle: null,
    metaDesc: null,
    metaImage: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    category: { id: "cat-1", name: "CatGamma" } as never,
    images: [],
    techStacks: [
      { techId: "tech-b", tech: { id: "tech-b", name: "TechBeta" } },
    ] as never,
    ...over,
  };
}

/** A list response: `res.data` is the ApiResponse with `data` + `metadata`. */
function listResponse(rows: IPPortfolio[]) {
  return {
    data: {
      status: "success",
      message: "ok",
      data: rows,
      metadata: {
        total: rows.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
  };
}

/** Taxonomy response: `res.data.data` is the option list. */
function taxonomyResponse(items: Array<{ id: string; name: string }>) {
  return { data: { data: items } };
}

function renderManager() {
  return renderWithProviders(<AdminPortfolioManager />, {
    initialEntry: "/dashboard/portfolio?page=1&limit=10",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  findAll.mockResolvedValue(listResponse([makeProject()]) as never);
  categoryFindAll.mockResolvedValue(
    taxonomyResponse([{ id: "cat-1", name: "CatGamma" }]) as never,
  );
  techFindAll.mockResolvedValue(
    taxonomyResponse([{ id: "tech-b", name: "TechBeta" }]) as never,
  );
});

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Open the create dialog and select one tech via the multi-select (required by
 * the zod schema). Title/slug are filled by the caller.
 */
async function openCreateAndSelectTaxonomy() {
  fireEvent.click(screen.getByRole("button", { name: /add portfolio/i }));

  // Dialog opened -> the title field is present.
  await screen.findByPlaceholderText("Project Title");

  // Select one tech (required by the zod schema).
  fireEvent.click(screen.getByText("Select tech...").closest("button")!);
  fireEvent.click(await screen.findByText("TechBeta"));
}

describe("AdminPortfolioManager - list", () => {
  it("requests the project list and renders the rows (Req 11.1)", async () => {
    renderManager();

    expect(await screen.findByText("Alpha Project")).toBeInTheDocument();
    await waitFor(() => expect(findAll).toHaveBeenCalled());
  });
});

describe("AdminPortfolioManager - create flow", () => {
  it("submits a create request and shows a success toast on success (Req 11.2)", async () => {
    create.mockResolvedValue({
      data: { message: "Portfolio created" },
    } as never);

    renderManager();
    await screen.findByText("Alpha Project");

    await openCreateAndSelectTaxonomy();
    fireEvent.change(screen.getByPlaceholderText("Project Title"), {
      target: { value: "Brand New Project" },
    });
    fireEvent.change(screen.getByPlaceholderText("project-url-slug"), {
      target: { value: "brand-new-project" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save project/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const payload = create.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.title).toBe("Brand New Project");
    expect(payload.techIds).toEqual(["tech-b"]);

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
  });
});

describe("AdminPortfolioManager - edit flow", () => {
  it("submits an update request and shows a success toast on success (Req 11.3)", async () => {
    update.mockResolvedValue({ data: { message: "Portfolio updated" } } as never);

    renderManager();
    await screen.findByText("Alpha Project");

    // Open the row action menu (Radix opens on pointerdown), then "Edit".
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.pointerDown(
      menuButton,
      new MouseEvent("pointerdown", { bubbles: true, button: 0 }),
    );
    fireEvent.click(await screen.findByText(/edit portfolio/i));

    // Dialog hydrates from the selected row (valid title/slug/tags/tech).
    await screen.findByPlaceholderText("Project Title");
    fireEvent.change(screen.getByPlaceholderText("Project Title"), {
      target: { value: "Alpha Project Edited" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update project/i }));

    await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
    const [id, payload] = update.mock.calls[0] as [string, Record<string, unknown>];
    expect(id).toBe("proj-1");
    expect(payload.title).toBe("Alpha Project Edited");

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
  });
});

describe("AdminPortfolioManager - delete flow", () => {
  it("submits a delete request and shows a success toast on confirm (Req 11.4)", async () => {
    destroy.mockResolvedValue({ data: { message: "Portfolio deleted" } } as never);

    renderManager();
    await screen.findByText("Alpha Project");

    const menuButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.pointerDown(
      menuButton,
      new MouseEvent("pointerdown", { bubbles: true, button: 0 }),
    );
    fireEvent.click(await screen.findByText(/delete portfolio/i));

    // Confirmation dialog -> click the destructive "Delete" button.
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(destroy).toHaveBeenCalledWith("proj-1"));
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
  });
});

describe("AdminPortfolioManager - publish toggle", () => {
  it("renders the updated state and shows success when the API echoes the target (Req 11.5)", async () => {
    togglePortfolioPublish.mockResolvedValue({
      data: { data: makeProject({ isPublished: false }) },
    } as never);

    renderManager();
    await screen.findByText("Alpha Project");

    // The row starts published -> toggling requests isPublished=false.
    fireEvent.click(screen.getByRole("switch", { name: /unpublish project/i }));

    await waitFor(() =>
      expect(togglePortfolioPublish).toHaveBeenCalledWith("proj-1", false),
    );
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    expect(toastError).not.toHaveBeenCalled();
  });

  it("treats a display mismatch as failure and shows an error toast (Req 11.6)", async () => {
    // API succeeds but returns a state that does NOT match the requested target.
    togglePortfolioPublish.mockResolvedValue({
      data: { data: makeProject({ isPublished: true }) },
    } as never);

    renderManager();
    await screen.findByText("Alpha Project");

    fireEvent.click(screen.getByRole("switch", { name: /unpublish project/i }));

    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});

describe("AdminPortfolioManager - gallery editor (Req 11.8)", () => {
  it("adds, reorders, and removes images keeping contiguous positions", async () => {
    create.mockResolvedValue({ data: { message: "Portfolio created" } } as never);

    renderManager();
    await screen.findByText("Alpha Project");

    await openCreateAndSelectTaxonomy();
    fireEvent.change(screen.getByPlaceholderText("Project Title"), {
      target: { value: "Gallery Project" },
    });
    fireEvent.change(screen.getByPlaceholderText("project-url-slug"), {
      target: { value: "gallery-project" },
    });

    // The gallery URL field shares the "https://..." placeholder with the
    // liveUrl field; the gallery one renders first (left column).
    const urlInput = screen.getAllByPlaceholderText("https://...")[0];
    const addButton = screen.getByRole("button", { name: /^add$/i });

    // Add first image at position 0.
    fireEvent.change(urlInput, { target: { value: "https://img/one.png" } });
    fireEvent.click(addButton);
    expect(await screen.findByText("https://img/one.png")).toBeInTheDocument();

    // Add second image at position 1.
    fireEvent.change(urlInput, { target: { value: "https://img/two.png" } });
    fireEvent.click(addButton);
    expect(await screen.findByText("https://img/two.png")).toBeInTheDocument();

    // Reorder: move the second image up.
    fireEvent.click(screen.getAllByRole("button", { name: /move image up/i })[1]);

    // Remove the (now second) image.
    const removeButtons = screen.getAllByRole("button", { name: /remove image/i });
    fireEvent.click(removeButtons[removeButtons.length - 1]);

    fireEvent.click(screen.getByRole("button", { name: /save project/i }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    const payload = create.mock.calls[0][0] as {
      images: Array<{ url: string; position: number }>;
    };
    expect(payload.images).toHaveLength(1);
    // After reorder, "two" moved to position 0; removing the last leaves "two".
    expect(payload.images[0].url).toBe("https://img/two.png");
    // Positions stay contiguous starting at 0.
    expect(payload.images.map((i) => i.position)).toEqual([0]);
  });
});

describe("AdminPortfolioManager - validation (Req 11.10)", () => {
  it("blocks submit and shows field errors when required fields are missing", async () => {
    renderManager();
    await screen.findByText("Alpha Project");

    // Open create and submit immediately without filling anything.
    fireEvent.click(screen.getByRole("button", { name: /add portfolio/i }));
    await screen.findByPlaceholderText("Project Title");

    fireEvent.click(screen.getByRole("button", { name: /save project/i }));

    // At least one validation message surfaces and no request is sent.
    expect(await screen.findByText(/minimal 1 tech/i)).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });
});

describe("AdminPortfolioManager - error preserves view state (Req 11.11)", () => {
  it("shows an error toast and keeps the create dialog open on failure", async () => {
    // Axios-shaped error so the hook's errorCallback can read `response.data`.
    create.mockRejectedValue({
      response: { data: { message: "Create failed", error: [] } },
    });

    renderManager();
    await screen.findByText("Alpha Project");

    await openCreateAndSelectTaxonomy();
    fireEvent.change(screen.getByPlaceholderText("Project Title"), {
      target: { value: "Doomed Project" },
    });
    fireEvent.change(screen.getByPlaceholderText("project-url-slug"), {
      target: { value: "doomed-project" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save project/i }));

    await waitFor(() => expect(toastError).toHaveBeenCalled());
    // View state preserved: the dialog (and its fields) remain mounted.
    expect(screen.getByPlaceholderText("Project Title")).toBeInTheDocument();
  });
});
