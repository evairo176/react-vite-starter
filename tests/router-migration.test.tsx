import { describe, expect, it } from "vitest";

import router from "@/app/routes";
import { useAuthStore } from "@/core/store/authStore";

/**
 * Router migration example tests (TanStack Router).
 *
 * Validates: Requirements 18.2, 18.3, 18.4, 18.5, 18.6, 18.7
 *
 * Strategy: these assertions operate on the deterministic, import-only route
 * tree exposed via `router.routesById`. They confirm that every public and
 * protected URL path defined under the previous react-router-dom setup still
 * exists at the same path, that the protected route group carries an
 * authentication guard (`beforeLoad`) and every protected leaf is nested under
 * it, and that a not-found component is configured. This covers route
 * equivalence (18.2-18.4), guard placement + behavior (18.5/18.6), and
 * not-found handling (18.7) without a brittle full-DOM rendering harness.
 *
 * Note: `router.flatRoutes` is only populated after the router boots inside a
 * RouterProvider, so we read the statically-available `routesById` registry
 * instead. Each route entry exposes its resolved `fullPath` and `options`.
 */

type RouteEntry = {
  id: string;
  fullPath?: string;
  options?: { beforeLoad?: unknown };
};

function routeEntries(): RouteEntry[] {
  const byId = router.routesById as unknown as Record<string, RouteEntry>;
  // Return the live route instances (do not spread; `fullPath` is a getter
  // that would be lost by object spread).
  return Object.values(byId);
}

/** Set of fullPaths for all leaf routes (those carrying a concrete path). */
function leafFullPaths(): string[] {
  // Leaf routes are identified by ids that are not pathless layout routes.
  // We derive coverage from fullPath values that are not the root "/" stub
  // produced by pathless layout routes, plus the explicit "/" home route.
  return routeEntries()
    .filter((r) => r.id !== "__root__")
    .map((r) => r.fullPath)
    .filter((p): p is string => typeof p === "string");
}

/** Look up a route entry by its TanStack route id. */
function findById(id: string): RouteEntry | undefined {
  const byId = router.routesById as unknown as Record<string, RouteEntry>;
  return byId[id];
}

describe("TanStack Router migration - route tree configuration", () => {
  // The home route resolves to "/", and pathless layout routes also report
  // fullPath "/", so "/" coverage is asserted via the dedicated home id.
  const PUBLIC_PATHS = ["/login", "/projects", "/blog/$slug"];

  const PROTECTED_PATHS = [
    "/dashboard",
    "/session",
    "/portfolio-management/category",
    "/portfolio-management/tech-stack",
    "/portfolio-management/image",
    "/portfolio-management/portfolio",
    "/blog-posts",
  ];

  it.each(PUBLIC_PATHS)(
    "defines the public route '%s' at the same URL path (Req 18.2, 18.4)",
    (expectedPath) => {
      expect(leafFullPaths()).toContain(expectedPath);
    },
  );

  it("defines the public home route '/' (Req 18.2, 18.4)", () => {
    // The home (Me) route lives at id "/guest/home/" with fullPath "/".
    const home = findById("/guest/home/");
    expect(home).toBeDefined();
    expect(home?.fullPath).toBe("/");
  });

  it.each(PROTECTED_PATHS)(
    "defines the protected route '%s' at the same URL path (Req 18.3)",
    (expectedPath) => {
      expect(leafFullPaths()).toContain(expectedPath);
    },
  );

  it("configures a not-found component for unmatched URLs (Req 18.7)", () => {
    // Either the root route's notFoundComponent or the router-level default
    // satisfies the requirement; both are wired in the migration.
    const rootNotFound = router.routeTree.options.notFoundComponent;
    const defaultNotFound = router.options.defaultNotFoundComponent;
    expect(rootNotFound ?? defaultNotFound).toBeDefined();
  });

  it("guards the protected route group with a beforeLoad function (Req 18.5, 18.6)", () => {
    const protectedRoute = findById("/protected");
    expect(protectedRoute).toBeDefined();
    expect(typeof protectedRoute?.options?.beforeLoad).toBe("function");
  });

  it("nests every protected leaf under the guarded protected group (Req 18.5)", () => {
    const entries = routeEntries();
    for (const path of PROTECTED_PATHS) {
      const route = entries.find((r) => r.fullPath === path);
      expect(route, `route for ${path}`).toBeDefined();
      // Route ids are parent-prefixed; protected leaves start with "/protected".
      expect(
        route?.id.startsWith("/protected"),
        `${path} (id ${route?.id}) is nested under the protected group`,
      ).toBe(true);
    }
  });

  it("keeps public leaves outside the protected route group (Req 18.4)", () => {
    const entries = routeEntries();
    const publicLeafIds = [
      "/guest/auth/login",
      "/guest/home/",
      "/guest/home/projects",
      "/guest/home/blog/$slug",
    ];
    for (const id of publicLeafIds) {
      const route = entries.find((r) => r.id === id);
      expect(route, `route for ${id}`).toBeDefined();
      expect(route?.id.startsWith("/protected")).toBe(false);
    }
  });
});

describe("TanStack Router migration - protected guard behavior", () => {
  /**
   * Exercises the actual `beforeLoad` guard logic against the auth store to
   * confirm: unauthenticated + hydrated -> redirect to /login (Req 18.5),
   * authenticated -> no redirect (Req 18.6), not-yet-hydrated -> no premature
   * redirect (preserves hydration gating).
   */
  function runGuard(state: {
    isAuthenticated: boolean;
    user: unknown;
    hydrated: boolean;
  }): { redirected: boolean; to?: string } {
    const protectedRoute = findById("/protected");
    const beforeLoad = protectedRoute?.options?.beforeLoad as
      | ((...args: unknown[]) => unknown)
      | undefined;
    if (!beforeLoad) throw new Error("protected route beforeLoad missing");

    // The guard reads useAuthStore.getState(); set it for the scenario.
    useAuthStore.setState(state as never);

    try {
      beforeLoad({});
      return { redirected: false };
    } catch (err) {
      // TanStack `redirect()` throws a redirect object carrying `to`.
      const to = (err as { to?: string; options?: { to?: string } })?.to ??
        (err as { options?: { to?: string } })?.options?.to;
      return { redirected: true, to };
    }
  }

  it("redirects unauthenticated, hydrated requests to /login (Req 18.5)", () => {
    const result = runGuard({
      isAuthenticated: false,
      user: null,
      hydrated: true,
    });
    expect(result.redirected).toBe(true);
    expect(result.to).toBe("/login");
  });

  it("renders the protected route for authenticated users (Req 18.6)", () => {
    const result = runGuard({
      isAuthenticated: true,
      user: { id: "1", email: "admin@example.com", roleId: 1 },
      hydrated: true,
    });
    expect(result.redirected).toBe(false);
  });

  it("does not redirect before the auth store has hydrated", () => {
    const result = runGuard({
      isAuthenticated: false,
      user: null,
      hydrated: false,
    });
    expect(result.redirected).toBe(false);
  });
});
