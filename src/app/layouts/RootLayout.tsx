// src/router/RootLayout.tsx
import { Outlet } from "@tanstack/react-router";
import { AnalyticsTracker } from "@/components/shared/analytics";
import { Toaster } from "@/components/ui/sonner";
import RouteTitle from "@/components/shared/RouteTitle";

export default function RootLayout() {
  return (
    <>
      {/* App-wide document title derived from the current route. Page-level
          <SEO> components (e.g. on detail pages) override this with a more
          specific title since they mount deeper in the tree. */}
      <RouteTitle />
      <AnalyticsTracker />
      {/* Single app-wide toaster (Req 21.1, 21.4): consistent position, duration,
          and theme-aware styling driven by ThemeProvider. */}
      <Toaster />
      <Outlet />
    </>
  );
}
