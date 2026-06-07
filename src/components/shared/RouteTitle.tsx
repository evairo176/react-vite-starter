import { Helmet } from "react-helmet-async";
import { useLocation } from "@tanstack/react-router";

import { resolvePageTitle } from "@/core/seo/page-titles";

/**
 * App-wide document-title manager. Mounted once near the root, it derives the
 * document title from the current pathname on every navigation so every page
 * gets a sensible `<title>` without per-page wiring.
 *
 * Detail pages that need a data-driven title (e.g. the specific post/project
 * name) render their own <SEO>/<Helmet> with a concrete title; because those
 * mount deeper in the tree, react-helmet-async applies them last and they win.
 */
export default function RouteTitle() {
  const location = useLocation();
  const title = resolvePageTitle(location.pathname);

  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}
