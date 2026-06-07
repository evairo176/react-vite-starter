import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import FadeIn from "@/components/shared/motion/FadeIn";
import MotionSection from "@/components/shared/motion/MotionSection";
import BackToTop from "@/components/shared/BackToTop";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { ThemeProvider } from "@/core/providers/theme-provider";
import { renderWithProviders } from "./helpers/renderWithProviders";

/**
 * Component tests for visual-enhancement behaviors.
 *
 * Validates: Requirements 15.4, 17.4, 17.6, 20.1
 *
 * Focus of this file (kept distinct from shared-primitives.test.tsx, which
 * already covers BackToTop visibility/scroll):
 *   - Reduced-motion: the motion wrappers (FadeIn, MotionSection) render their
 *     content immediately with no entrance animation when the visitor requests
 *     `prefers-reduced-motion: reduce` (Req 15.4).
 *   - Back-to-top: scrolling past one viewport reveals the control and
 *     activating it jumps to the top with non-smooth behavior under reduced
 *     motion (Req 17.4, 17.6).
 *   - Focus-ring: representative interactive controls carry focus-visible ring
 *     utility classes so keyboard focus is clearly indicated (Req 20.1).
 */

/**
 * Build a matchMedia stub where the reduced-motion query reports `matches`.
 * The shared `tests/setup.ts` installs a global stub that always reports
 * matches=false, so reduced-motion tests must override it explicitly.
 */
function stubReducedMotion(prefersReduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? prefersReduced : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Motion wrappers honor reduced motion (Req 15.4)", () => {
  it("FadeIn renders content immediately with no hidden entrance state when reduced motion is requested", () => {
    stubReducedMotion(true);

    render(
      <FadeIn data-testid="fade">
        <span>fade content</span>
      </FadeIn>,
    );

    const wrapper = screen.getByTestId("fade");
    // Content is present and the wrapper carries no entrance (opacity/transform)
    // inline style, i.e. it is not started from a hidden state.
    expect(screen.getByText("fade content")).toBeInTheDocument();
    expect(wrapper.style.opacity).toBe("");
    expect(wrapper.style.transform).toBe("");
  });

  it("FadeIn starts from a hidden (opacity 0) entrance state when motion is allowed", () => {
    stubReducedMotion(false);

    render(
      <FadeIn data-testid="fade">
        <span>fade content</span>
      </FadeIn>,
    );

    const wrapper = screen.getByTestId("fade");
    // With motion enabled framer-motion applies the `hidden` initial variant,
    // which sets opacity to 0 before animating in.
    expect(wrapper.style.opacity).toBe("0");
  });

  it("MotionSection renders content immediately with no hidden entrance state when reduced motion is requested", () => {
    stubReducedMotion(true);

    render(
      <MotionSection data-testid="section">
        <p>section content</p>
      </MotionSection>,
    );

    const section = screen.getByTestId("section");
    expect(screen.getByText("section content")).toBeInTheDocument();
    expect(section.style.opacity).toBe("");
    expect(section.style.transform).toBe("");
  });
});

describe("BackToTop scroll-to-top under reduced motion (Req 17.4, 17.6)", () => {
  let scrollToSpy: ReturnType<typeof vi.fn>;

  function setScrollY(value: number) {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value,
    });
    fireEvent.scroll(window);
  }

  beforeEach(() => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 800,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });
    scrollToSpy = vi.fn();
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: scrollToSpy,
    });
  });

  it("appears past one viewport and jumps to top with non-smooth behavior under reduced motion", async () => {
    stubReducedMotion(true);

    render(<BackToTop />);

    setScrollY(1200); // beyond one viewport height (800)

    const button = await screen.findByRole("button", { name: /back to top/i });
    fireEvent.click(button);

    expect(scrollToSpy).toHaveBeenCalledTimes(1);
    // Reduced motion downgrades the smooth scroll to an instant jump (Req 17.6).
    expect(scrollToSpy).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, behavior: "auto" }),
    );
  });
});

describe("Focus-ring presence on interactive controls (Req 20.1)", () => {
  it("BackToTop button carries focus-visible ring utility classes", async () => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 800,
    });
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    render(<BackToTop />);

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 1200,
    });
    fireEvent.scroll(window);

    const button = await screen.findByRole("button", { name: /back to top/i });
    expect(button.className).toMatch(/focus-visible:ring/);
  });

  it("ThemeToggle button carries focus-visible ring utility classes", async () => {
    renderWithProviders(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggle = await screen.findByRole("button", { name: /switch to/i });
    await waitFor(() => {
      expect(toggle.className).toMatch(/focus-visible:ring/);
    });
  });
});
