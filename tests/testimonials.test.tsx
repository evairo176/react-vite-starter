import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";
import type { Testimonial } from "@/core/types/testimonial.type";

/**
 * Component tests for the public Testimonials_View.
 *
 * Validates: Requirements 7.2, 7.3, 7.4, 7.5
 *
 * Strategy: mock `testimonial.service` (the only data dependency of the hook)
 * so the component renders against deterministic responses, then assert each
 * data-driven state:
 *   - Loading -> TestimonialSkeleton (Req 7.2)
 *   - Error   -> ErrorState (Req 7.3)
 *   - Empty   -> EmptyState, surrounding section still rendered (Req 7.4)
 *   - Success -> each testimonial's author + message (Req 7.5)
 *
 * The shared `renderWithProviders` helper supplies the QueryClient + TanStack
 * Router + Helmet providers the view requires, and `tests/setup.ts` stubs
 * IntersectionObserver + matchMedia for the MotionSection wrapper.
 */

// ---- Service mock (hoisted before the component imports it) ----------------
vi.mock("@/core/services/testimonial.service", () => ({
  default: { getPublic: vi.fn() },
}));

import testimonialService from "@/core/services/testimonial.service";
import Testimonials from "@/features/Me/Testimonials";

const getPublic = vi.mocked(testimonialService.getPublic);

// ---- Fixtures --------------------------------------------------------------
function makeTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    id: "t-1",
    author: "Jane Doe",
    message: "Working with them was a fantastic experience.",
    role: "Product Manager",
    avatar: null,
    ...overrides,
  };
}

/** A testimonial list response: `res.data.data` is the testimonial array. */
function listResponse(items: Testimonial[]) {
  return {
    data: {
      status: "success",
      message: "ok",
      data: items,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Testimonials - data-driven states", () => {
  it("renders the loading skeleton while the testimonial request is in flight (Req 7.2)", async () => {
    // Never resolves -> the query stays pending and the skeleton shows.
    getPublic.mockReturnValue(new Promise(() => {}) as never);

    renderWithProviders(<Testimonials />);

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="testimonial-skeleton"]'),
      ).toBeInTheDocument();
    });
  });

  it("renders an error state with a working retry control on failure (Req 7.3)", async () => {
    getPublic.mockRejectedValue(new Error("boom"));

    renderWithProviders(<Testimonials />);

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();

    const callsBeforeRetry = getPublic.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(getPublic.mock.calls.length).toBeGreaterThan(callsBeforeRetry);
    });
  });

  it("renders an empty state without breaking the surrounding layout when zero testimonials are returned (Req 7.4)", async () => {
    getPublic.mockResolvedValue(listResponse([]) as never);

    renderWithProviders(<Testimonials />);

    // The empty-state message renders...
    expect(await screen.findByText("Belum ada testimoni")).toBeInTheDocument();

    // ...and the surrounding section layout is preserved (heading + section).
    expect(screen.getByText("Testimoni")).toBeInTheDocument();
    expect(document.querySelector("#testimonials")).toBeInTheDocument();
  });

  it("renders each testimonial's author and message when the request succeeds (Req 7.5)", async () => {
    getPublic.mockResolvedValue(
      listResponse([
        makeTestimonial({
          id: "t-1",
          author: "Alice Smith",
          message: "Delivered exactly what we needed, ahead of schedule.",
        }),
        makeTestimonial({
          id: "t-2",
          author: "Bob Jones",
          message: "Great communication throughout the project.",
          role: null,
        }),
      ]) as never,
    );

    renderWithProviders(<Testimonials />);

    expect(await screen.findByText("Alice Smith")).toBeInTheDocument();
    expect(
      screen.getByText("Delivered exactly what we needed, ahead of schedule."),
    ).toBeInTheDocument();

    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(
      screen.getByText("Great communication throughout the project."),
    ).toBeInTheDocument();
  });
});
