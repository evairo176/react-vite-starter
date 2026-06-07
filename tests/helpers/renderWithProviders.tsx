import { type ReactElement, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";

/**
 * Shared test render helper for the frontend-ui-integration feature.
 *
 * Wraps an arbitrary UI in the three providers every feature view depends on:
 *   - QueryClientProvider (a fresh QueryClient per call so tests stay isolated)
 *   - TanStack RouterProvider backed by an in-memory history (no real browser
 *     navigation required)
 *   - HelmetProvider (so `SEO`/react-helmet-async consumers can render)
 *
 * Two entry points are provided:
 *   - `renderWithProviders(ui)` mounts a single component at a synthetic route,
 *     which is the common case for component tests.
 *   - `renderRouteWithProviders({ routes })` mounts an arbitrary route tree, for
 *     tests that need real route matching / params / search params.
 */

/** Create a QueryClient configured like the app's, but test-friendly. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  /** Initial URL the memory router boots at. Defaults to "/". */
  initialEntry?: string;
  /** Reuse an existing QueryClient instead of creating a fresh one. */
  queryClient?: QueryClient;
}

export interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient;
}

/**
 * Render an arbitrary component wrapped in all app providers.
 *
 * The component is mounted at a catch-all route so it renders regardless of the
 * initial path, making this suitable for presentational/component tests that do
 * not care about route matching.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  const { initialEntry = "/", queryClient = createTestQueryClient(), ...renderOptions } =
    options;

  const rootRoute = createRootRoute({ component: Outlet });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => ui,
  });
  // Catch-all so the UI also renders for non-root initial entries.
  const splatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => ui,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, splatRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  const result = render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <RouterProvider router={router as any} />
      </QueryClientProvider>
    </HelmetProvider>,
    renderOptions,
  );

  return { ...result, queryClient };
}

/**
 * Lightweight provider wrapper without a router, for code that does not depend
 * on routing context. Useful as a `wrapper` option for renderHook.
 */
export function makeProviderWrapper(queryClient: QueryClient = createTestQueryClient()) {
  return function ProviderWrapper({ children }: { children: ReactNode }) {
    return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </HelmetProvider>
    );
  };
}

export interface RenderRouteOptions extends Omit<RenderOptions, "wrapper"> {
  /** A configured TanStack router instance to render. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router: any;
  queryClient?: QueryClient;
}

/**
 * Render a pre-built TanStack router instance wrapped in all app providers, for
 * tests that need a real route tree (params, search params, nested layouts).
 */
export function renderRouteWithProviders(
  options: RenderRouteOptions,
): RenderWithProvidersResult {
  const { router, queryClient = createTestQueryClient(), ...renderOptions } = options;

  const result = render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </HelmetProvider>,
    renderOptions,
  );

  return { ...result, queryClient };
}
