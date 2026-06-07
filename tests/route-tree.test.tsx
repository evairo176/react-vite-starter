import { describe, expect, it } from "vitest";

import router from "@/app/routes";

/**
 * Route tree configuration tests for the new public + admin routes.
 *
 * Validates: Requirements 13.8
 *
 * Strategy: assert against the deterministic, import-only route registry
 * (`router.routesById`). Each entry exposes a resolved `fullPath`, so we can
 * confirm that the new public routes (`/projects`, `/projects/$slug`,
 * `/blogs`, `/blog/$slug`, `/contact`) and admin routes (`/dashboard/blog`,
 * `/dashboard/portfolio`, `/dashboard/analytics`) are registered without
 * booting a RouterProvider (which would trip the protected `beforeLoad` guard
 * and require full navigation). The admin routes are additionally asserted to
 * be nested under the guarded `/protected` group.
 */

type RouteEntry = {
  id: string;
  fullPath?: string;
};

function routeEntries(): RouteEntry[] {
  const byId = router.routesById as unknown as Record<string, RouteEntry>;
  // Use the live instances; `fullPath` is a getter that a spread would drop.
  return Object.values(byId);
}

function leafFullPaths(): string[] {
  return routeEntries()
    .filter((r) => r.id !== "__root__")
    .map((r) => r.fullPath)
    .filter((p): p is string => typeof p === "string");
}

describe("Route tree - new public routes (Req 13.8)", () => {
  const PUBLIC_PATHS = [
    "/projects",
    "/projects/$slug",
    "/blogs",
    "/blog/$slug",
    "/contact",
  ];

  it.each(PUBLIC_PATHS)(
    "registers the public route '%s'",
    (expectedPath) => {
      expect(leafFullPaths()).toContain(expectedPath);
    },
  );

  it("keeps the public routes outside the protected route group", () => {
    const entries = routeEntries();
    for (const path of PUBLIC_PATHS) {
      const route = entries.find((r) => r.fullPath === path);
      expect(route, `route for ${path}`).toBeDefined();
      expect(
        route?.id.startsWith("/protected"),
        `${path} (id ${route?.id}) should not be protected`,
      ).toBe(false);
    }
  });
});

describe("Route tree - new admin routes (Req 13.8)", () => {
  const ADMIN_PATHS = [
    "/dashboard/blog",
    "/dashboard/portfolio",
    "/dashboard/analytics",
  ];

  it.each(ADMIN_PATHS)(
    "registers the admin route '%s'",
    (expectedPath) => {
      expect(leafFullPaths()).toContain(expectedPath);
    },
  );

  it("nests every admin route under the guarded protected group", () => {
    const entries = routeEntries();
    for (const path of ADMIN_PATHS) {
      const route = entries.find((r) => r.fullPath === path);
      expect(route, `route for ${path}`).toBeDefined();
      expect(
        route?.id.startsWith("/protected"),
        `${path} (id ${route?.id}) should be nested under /protected`,
      ).toBe(true);
    }
  });
});
