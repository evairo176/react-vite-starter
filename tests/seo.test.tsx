import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";

import SEO from "@/components/shared/SEO";

/**
 * SEO component tests.
 *
 * Validates: Requirements 9.4
 *
 * Strategy: SEO derives the document title, meta description, and Open Graph /
 * Twitter tags from its props via react-helmet-async. We render it inside a
 * HelmetProvider and assert the side effects land on `document`. Re-rendering
 * with different props (simulating a navigation to a different page) must
 * update the title and meta tags, proving they refresh on navigation.
 */

afterEach(() => {
  cleanup();
});

function metaContent(selector: string): string | null {
  return document.head.querySelector(selector)?.getAttribute("content") ?? null;
}

describe("SEO", () => {
  it("sets the document title, description, and OG/Twitter tags from props", async () => {
    render(
      <HelmetProvider>
        <SEO
          title="Projects"
          description="Browse my work"
          name="My Portfolio"
          type="website"
          image="https://example.com/cover.png"
          url="https://example.com/projects"
        />
      </HelmetProvider>,
    );

    await waitFor(() =>
      expect(document.title).toBe("Projects | My Portfolio"),
    );
    expect(metaContent('meta[name="description"]')).toBe("Browse my work");
    expect(metaContent('meta[property="og:title"]')).toBe(
      "Projects | My Portfolio",
    );
    expect(metaContent('meta[property="og:description"]')).toBe(
      "Browse my work",
    );
    expect(metaContent('meta[property="og:type"]')).toBe("website");
    expect(metaContent('meta[property="og:url"]')).toBe(
      "https://example.com/projects",
    );
    expect(metaContent('meta[property="og:image"]')).toBe(
      "https://example.com/cover.png",
    );
    // With an image the Twitter card upgrades to a large image summary.
    expect(metaContent('meta[name="twitter:card"]')).toBe(
      "summary_large_image",
    );
    expect(metaContent('meta[name="twitter:title"]')).toBe(
      "Projects | My Portfolio",
    );
  });

  it("updates the document title and meta tags when props change on navigation (Req 9.4)", async () => {
    const { rerender } = render(
      <HelmetProvider>
        <SEO title="Projects" description="Browse my work" name="My Portfolio" />
      </HelmetProvider>,
    );

    await waitFor(() =>
      expect(metaContent('meta[name="description"]')).toBe("Browse my work"),
    );
    expect(document.title).toBe("Projects | My Portfolio");

    // Navigate to a different page: same component, new props.
    rerender(
      <HelmetProvider>
        <SEO
          title="Contact"
          description="Get in touch"
          name="My Portfolio"
        />
      </HelmetProvider>,
    );

    await waitFor(() =>
      expect(metaContent('meta[name="description"]')).toBe("Get in touch"),
    );
    expect(document.title).toBe("Contact | My Portfolio");
    expect(metaContent('meta[property="og:title"]')).toBe(
      "Contact | My Portfolio",
    );
  });

  it("falls back to the default description when none is provided", async () => {
    render(
      <HelmetProvider>
        <SEO title="Home" />
      </HelmetProvider>,
    );

    await waitFor(() =>
      expect(metaContent('meta[name="description"]')).toBe(
        "Manage your portfolio with ease.",
      ),
    );
    expect(document.title).toBe("Home | Portfolio Manager");
    // Without an image the Twitter card is the plain summary variant.
    expect(metaContent('meta[name="twitter:card"]')).toBe("summary");
  });
});
