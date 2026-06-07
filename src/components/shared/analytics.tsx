import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import ReactGA from "react-ga4";
import analyticsService from "@/core/services/analytics.service";

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Existing react-ga4 page_view event. (Req 8.3)
    ReactGA.event("page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });

    // Backend visit tracking. Analytics failures must never break the UI,
    // so any rejection is swallowed silently. (Req 8.1, 8.2)
    void (async () => {
      try {
        await analyticsService.recordVisit({ path });
      } catch {
        // Intentionally ignored: visit tracking is best-effort.
      }
    })();
  }, [location.pathname]);

  return null;
}
