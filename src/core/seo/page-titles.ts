/**
 * Centralized page-title configuration.
 *
 * `resolvePageTitle` maps the current pathname to a human-friendly document
 * title. Static routes are matched exactly; dynamic routes (e.g. `/blog/:slug`)
 * are matched by pattern. Detail pages that need a data-driven title (the post
 * or project name) still render their own <SEO> with a specific title, which
 * takes precedence because it mounts deeper in the tree.
 */

/** Brand/site name appended to every document title. */
export const SITE_NAME = "Dicki Prasetya";

/** Exact-path → page title (without the site-name suffix). */
const STATIC_TITLES: Record<string, string> = {
  "/": "Beranda",
  "/projects": "Proyek",
  "/blogs": "Blog",
  "/contact": "Kontak",
  "/login": "Masuk",

  // Dashboard / admin.
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/comments": "Moderasi Komentar",
  "/dashboard/blog": "Kelola Blog",
  "/dashboard/portfolio": "Kelola Portfolio",
  "/dashboard/achievements": "Kelola Pencapaian",
  "/session": "Sesi",
  "/blog-posts": "Kelola Blog",
  "/portfolio-management/category": "Kategori",
  "/portfolio-management/tech-stack": "Tech Stack",
  "/portfolio-management/image": "Sumber Gambar",
  "/portfolio-management/portfolio": "Kelola Portfolio",
};

/** Pattern (regex) → fallback title for dynamic routes. */
const DYNAMIC_TITLES: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/projects\/[^/]+$/, title: "Detail Proyek" },
  { pattern: /^\/blog\/[^/]+$/, title: "Artikel" },
];

/** Title used when no route matches (also covers 404s). */
const FALLBACK_TITLE = "Portfolio";

/** Resolve the page-specific title segment for a pathname. */
export function resolvePageTitleSegment(pathname: string): string {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (STATIC_TITLES[normalized]) return STATIC_TITLES[normalized];

  for (const { pattern, title } of DYNAMIC_TITLES) {
    if (pattern.test(normalized)) return title;
  }

  return FALLBACK_TITLE;
}

/** Build the full document title (`<segment> | <site>`) for a pathname. */
export function resolvePageTitle(pathname: string): string {
  const segment = resolvePageTitleSegment(pathname);
  return `${segment} | ${SITE_NAME}`;
}
