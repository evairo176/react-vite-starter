import { describe, expect, it } from "vitest";

import {
  SITE_NAME,
  resolvePageTitle,
  resolvePageTitleSegment,
} from "@/core/seo/page-titles";

/**
 * Unit tests for the reusable document-title resolver that powers the app-wide
 * <RouteTitle>. Validates static, dynamic, trailing-slash, and fallback paths.
 */
describe("resolvePageTitleSegment", () => {
  it("maps known static routes to their titles", () => {
    expect(resolvePageTitleSegment("/")).toBe("Beranda");
    expect(resolvePageTitleSegment("/projects")).toBe("Proyek");
    expect(resolvePageTitleSegment("/blogs")).toBe("Blog");
    expect(resolvePageTitleSegment("/contact")).toBe("Kontak");
    expect(resolvePageTitleSegment("/dashboard")).toBe("Dashboard");
    expect(resolvePageTitleSegment("/dashboard/comments")).toBe(
      "Moderasi Komentar",
    );
  });

  it("matches dynamic detail routes by pattern", () => {
    expect(resolvePageTitleSegment("/projects/my-project")).toBe(
      "Detail Proyek",
    );
    expect(resolvePageTitleSegment("/blog/some-article")).toBe("Artikel");
  });

  it("ignores a trailing slash", () => {
    expect(resolvePageTitleSegment("/projects/")).toBe("Proyek");
  });

  it("falls back for unknown routes", () => {
    expect(resolvePageTitleSegment("/totally-unknown")).toBe("Portfolio");
  });
});

describe("resolvePageTitle", () => {
  it("appends the site name", () => {
    expect(resolvePageTitle("/")).toBe(`Beranda | ${SITE_NAME}`);
    expect(resolvePageTitle("/projects/x")).toBe(
      `Detail Proyek | ${SITE_NAME}`,
    );
  });
});
