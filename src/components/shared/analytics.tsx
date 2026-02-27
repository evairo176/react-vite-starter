import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.event("page_view", {
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname]);

  return null;
}
