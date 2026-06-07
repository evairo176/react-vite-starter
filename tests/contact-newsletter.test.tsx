import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";

/**
 * Component tests for the public Contact_Form and Newsletter_Form.
 *
 * Validates: Requirements 5.2, 5.4, 5.5, 5.6, 6.2, 6.4, 6.5
 *
 * Strategy: mock the two write services (`contact`, `newsletter`) so the
 * mutation resolves/rejects deterministically, and mock `sonner` so toast
 * feedback can be asserted without a real toaster. The shared
 * `renderWithProviders` helper supplies the QueryClient + TanStack Router +
 * Helmet providers the views require. Because the router mounts the component
 * asynchronously, each test awaits the first field/button before interacting.
 * user-event is not installed, so DOM interaction uses `fireEvent`.
 */

// ---- Service + toast mocks (hoisted before the components import them) -----
vi.mock("@/core/services/contact.service", () => ({
  default: { submit: vi.fn() },
}));
vi.mock("@/core/services/newsletter.service", () => ({
  default: { subscribe: vi.fn(), unsubscribe: vi.fn() },
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import contactService from "@/core/services/contact.service";
import newsletterService from "@/core/services/newsletter.service";
import { toast } from "sonner";
import Contact from "@/features/Me/Contact";
import NewsletterForm from "@/features/Me/Newsletter";

const submit = vi.mocked(contactService.submit);
const subscribe = vi.mocked(newsletterService.subscribe);
const toastSuccess = vi.mocked(toast.success);
const toastError = vi.mocked(toast.error);

/** A successful Axios-shaped response the success callback can read. */
function okResponse(message = "ok") {
  return { data: { message } };
}

/** An Axios-shaped rejection the error callback can read. */
function errResponse(message = "boom") {
  return { response: { data: { message, error: [] } } };
}

/** Fill the four Contact fields with valid values. */
function fillContact() {
  fireEvent.change(screen.getByLabelText("Nama"), {
    target: { value: "Jane Doe" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "jane@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Subjek"), {
    target: { value: "Hello" },
  });
  fireEvent.change(screen.getByLabelText("Pesan"), {
    target: { value: "A message body." },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Contact_Form", () => {
  it("blocks submission and shows validation messages on invalid input (Req 5.2)", async () => {
    renderWithProviders(<Contact />);

    // Submit the empty form: zod validation should block the request.
    const button = await screen.findByRole("button", { name: "Kirim Pesan" });
    fireEvent.click(button);

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Subject is required")).toBeInTheDocument();
    expect(screen.getByText("Message is required")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("blocks submission when the email is invalid (Req 5.2)", async () => {
    renderWithProviders(<Contact />);

    fireEvent.change(await screen.findByLabelText("Nama"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Subjek"), {
      target: { value: "Hi" },
    });
    fireEvent.change(screen.getByLabelText("Pesan"), {
      target: { value: "Body" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Kirim Pesan" }));

    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("submits the payload, shows a success toast, and fully resets the form (Req 5.5)", async () => {
    submit.mockResolvedValue(okResponse("Pesan terkirim") as never);

    renderWithProviders(<Contact />);
    await screen.findByLabelText("Nama");
    fillContact();

    fireEvent.click(screen.getByRole("button", { name: "Kirim Pesan" }));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        subject: "Hello",
        body: "A message body.",
      });
    });

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith("Pesan terkirim");
    });

    // Full reset: every field is cleared. (Req 5.5)
    await waitFor(() => {
      expect(screen.getByLabelText("Nama")).toHaveValue("");
    });
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Subjek")).toHaveValue("");
    expect(screen.getByLabelText("Pesan")).toHaveValue("");
    expect(toastError).not.toHaveBeenCalled();
  });

  it("shows an error toast and preserves entered values on failure (Req 5.6)", async () => {
    submit.mockRejectedValue(errResponse("Gagal mengirim") as never);

    renderWithProviders(<Contact />);
    await screen.findByLabelText("Nama");
    fillContact();

    fireEvent.click(screen.getByRole("button", { name: "Kirim Pesan" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Gagal mengirim");
    });

    // Entered values are preserved (no reset on error). (Req 5.6)
    expect(screen.getByLabelText("Nama")).toHaveValue("Jane Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
    expect(screen.getByLabelText("Subjek")).toHaveValue("Hello");
    expect(screen.getByLabelText("Pesan")).toHaveValue("A message body.");
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("disables the submit control and shows a loading state while in flight (Req 5.4)", async () => {
    // A deferred promise keeps the mutation pending so the loading state holds.
    let resolveSubmit: (value: unknown) => void = () => {};
    submit.mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      }) as never,
    );

    renderWithProviders(<Contact />);
    await screen.findByLabelText("Nama");
    fillContact();

    fireEvent.click(screen.getByRole("button", { name: "Kirim Pesan" }));

    // While the request is in flight the button is disabled and shows the
    // loading label. (Req 5.4)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Mengirim/i })).toBeDisabled();
    });

    // Let the request settle so the test exits cleanly.
    resolveSubmit(okResponse());
    await waitFor(() => {
      expect(submit).toHaveBeenCalled();
    });
  });
});

describe("Newsletter_Form", () => {
  it("blocks submission and shows a validation message on an invalid email (Req 6.2)", async () => {
    renderWithProviders(<NewsletterForm />);

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Berlangganan" }));

    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(subscribe).not.toHaveBeenCalled();
  });

  it("subscribes the email, shows a success toast, and clears the input (Req 6.4)", async () => {
    subscribe.mockResolvedValue(okResponse("Berhasil berlangganan") as never);

    renderWithProviders(<NewsletterForm />);

    const input = await screen.findByLabelText("Email");
    fireEvent.change(input, { target: { value: "jane@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Berlangganan" }));

    await waitFor(() => {
      expect(subscribe).toHaveBeenCalledWith({ email: "jane@example.com" });
    });

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith("Berhasil berlangganan");
    });

    // The email input is cleared on success. (Req 6.4)
    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toHaveValue("");
    });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("shows an error toast when the subscription fails (Req 6.5)", async () => {
    subscribe.mockRejectedValue(errResponse("Gagal berlangganan") as never);

    renderWithProviders(<NewsletterForm />);

    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Berlangganan" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Gagal berlangganan");
    });
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
