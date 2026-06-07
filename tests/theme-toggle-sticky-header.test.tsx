import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import ThemeToggle from "@/components/shared/ThemeToggle";
import StickyHeader from "@/components/shared/StickyHeader";
import { ThemeProvider } from "@/core/providers/theme-provider";
import { renderWithProviders } from "./helpers/renderWithProviders";

/**
 * Component tests for the dark/light Theme_Toggle and the condensing Sticky_Header.
 *
 * Validates: Requirements 14.2, 14.3, 17.3
 *
 * Strategy:
 *  - ThemeToggle is wrapped in the real ThemeProvider so we exercise the genuine
 *    persistence + apply path (no mocked provider). We assert that activating the
 *    toggle flips the theme (Req 14.2) and writes the new preference to
 *    localStorage under the `app-mode` key (Req 14.3).
 *  - StickyHeader is rendered through the shared providers helper (it depends on
 *    TanStack Router for its nav <Link>s and on the ThemeProvider for the nested
 *    ThemeToggle). We drive window.scrollY past the 80px threshold and dispatch a
 *    scroll event, asserting the header switches to its condensed form (Req 17.3).
 *
 * The shared helper mounts UI through a TanStack RouterProvider, which resolves
 * its route content asynchronously, so initial queries use `findBy*`/`waitFor`.
 *
 * jsdom does not implement window.matchMedia, so we provide a controllable stub.
 */

const STORAGE_KEY = "app-mode";

/** Install a matchMedia stub. `prefersDark` controls prefers-color-scheme: dark. */
function stubMatchMedia(prefersDark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("dark") ? prefersDark : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

/** Set window.scrollY (read-only by default in jsdom) for scroll-based tests. */
function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    value,
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  setScrollY(0);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
  it("switches the theme and persists the new preference to localStorage (Req 14.2, 14.3)", async () => {
    // Start with no stored preference and a light OS preference so the provider
    // resolves to "light"; the toggle should advertise switching to dark.
    stubMatchMedia(false);

    renderWithProviders(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggle = await screen.findByRole("button", {
      name: /switch to dark theme/i,
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    fireEvent.click(toggle);

    // Theme switched to dark: preference persisted and the dark class applied.
    expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // The label now reflects the opposite action (switch back to light).
    const toggleBack = await screen.findByRole("button", {
      name: /switch to light theme/i,
    });
    fireEvent.click(toggleBack);

    expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("applies the persisted preference on load (Req 14.3 round-trip)", async () => {
    stubMatchMedia(false);
    localStorage.setItem(STORAGE_KEY, "dark");

    renderWithProviders(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    // With a stored dark preference the toggle should offer switching to light.
    expect(
      await screen.findByRole("button", { name: /switch to light theme/i }),
    ).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("StickyHeader", () => {
  async function renderHeader(): Promise<HTMLElement> {
    renderWithProviders(
      <ThemeProvider>
        <StickyHeader />
      </ThemeProvider>,
    );
    return waitFor(() => {
      const header = document.querySelector(
        '[data-slot="sticky-header"]',
      ) as HTMLElement | null;
      expect(header).not.toBeNull();
      return header as HTMLElement;
    });
  }

  it("condenses after the visitor scrolls past 80px (Req 17.3)", async () => {
    stubMatchMedia(false);

    const header = await renderHeader();

    // At the top of the page the header is in its expanded (non-condensed) form.
    expect(header).toHaveAttribute("data-condensed", "false");

    // Scroll beyond the 80px threshold and notify listeners.
    act(() => {
      setScrollY(120);
      fireEvent.scroll(window);
    });

    expect(header).toHaveAttribute("data-condensed", "true");
  });

  it("stays expanded when scrolled at or below the 80px threshold (Req 17.3)", async () => {
    stubMatchMedia(false);

    const header = await renderHeader();

    act(() => {
      setScrollY(80);
      fireEvent.scroll(window);
    });

    // Exactly 80px is not "beyond" the threshold, so it remains expanded.
    expect(header).toHaveAttribute("data-condensed", "false");
  });
});
