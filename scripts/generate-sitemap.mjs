// Auto-generate public/sitemap.xml
//
// Configurable via env variables:
//   SITE_URL   - production base URL (default https://react-vite-starter-beta.vercel.app)
//   API_URL    - backend API base URL (default http://localhost:8000/api/v1)
//
// Usage:
//   node scripts/generate-sitemap.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = (
  process.env.SITE_URL || "https://react-vite-starter-beta.vercel.app"
).replace(/\/$/, "");
const API_URL = (
  process.env.API_URL || "http://localhost:8000/api/v1"
).replace(/\/$/, "");

const today = new Date().toISOString().split("T")[0];

// Static routes — extend as needed.
const staticRoutes = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  // { path: "/projects", changefreq: "weekly", priority: 0.8 },
];

async function fetchBlogSlugs() {
  try {
    const res = await fetch(`${API_URL}/blog-posts/public?limit=1000&page=1`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json?.data ?? [];
    return list
      .filter((p) => p?.slug)
      .map((p) => ({
        slug: p.slug,
        updatedAt: p.updatedAt
          ? new Date(p.updatedAt).toISOString().split("T")[0]
          : today,
      }));
  } catch (err) {
    console.warn(`[sitemap] Failed to fetch blog posts: ${err.message}`);
    return [];
  }
}

function buildXml(entries) {
  const items = entries
    .map(
      (e) => `  <url>
    <loc>${SITE_URL}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>
`;
}

async function main() {
  const blogs = await fetchBlogSlugs();

  const entries = [
    ...staticRoutes.map((r) => ({
      path: r.path,
      lastmod: today,
      changefreq: r.changefreq,
      priority: r.priority,
    })),
    ...blogs.map((b) => ({
      path: `/blog/${b.slug}`,
      lastmod: b.updatedAt,
      changefreq: "weekly",
      priority: 0.7,
    })),
  ];

  const xml = buildXml(entries);
  const outPath = resolve(__dirname, "..", "public", "sitemap.xml");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, xml, "utf8");

  console.log(
    `[sitemap] Wrote ${entries.length} URLs to ${outPath} (blogs: ${blogs.length})`,
  );
}

main().catch((err) => {
  console.error("[sitemap] Failed:", err);
  process.exit(1);
});
