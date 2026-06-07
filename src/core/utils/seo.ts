/**
 * SEO metadata resolution (Req 9.1, 9.2).
 *
 * Resolves the document title / meta description (and optional image) for a
 * project case study or a blog post. Explicit metadata fields win when present
 * and non-empty; otherwise the resolver falls back to the entity's own title
 * and short description / excerpt.
 *
 * This is a pure helper extracted into `core/utils` so it can be exhaustively
 * property-tested independent of the DOM. See Property 5 in the design.
 */

/** The minimal shape `resolveSeo` reads from a project or post entity. */
export interface SeoEntity {
  /** The entity's own display title (used as the title fallback). */
  title: string;
  /** Explicit meta title (projects: `metaTitle`; posts: meta field). */
  metaTitle?: string | null;
  /** Explicit meta description (projects: `metaDesc`; posts: meta field). */
  metaDesc?: string | null;
  /** Explicit meta image (projects: `metaImage`; posts: meta field). */
  metaImage?: string | null;
  /** Project short description (description fallback). */
  shortDesc?: string | null;
  /** Post excerpt (description fallback). */
  excerpt?: string | null;
  /** Post cover image (image fallback). */
  coverImage?: string | null;
}

/** The resolved SEO metadata consumed by the `SEO` component. */
export interface ResolvedSeo {
  title: string;
  description: string;
  image?: string;
}

/** Final safety-net defaults guaranteeing non-empty output. */
const DEFAULT_TITLE = "Portfolio";
const DEFAULT_DESCRIPTION = "Portfolio";

/** Returns the trimmed string when it has visible content, else `undefined`. */
function nonEmpty(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Resolve non-empty SEO metadata for a project or post.
 *
 * - `title`: explicit `metaTitle` when present, else the entity `title`.
 * - `description`: explicit `metaDesc` when present, else the entity
 *   `shortDesc` (projects) / `excerpt` (posts), else the entity `title`.
 * - `image` (optional): explicit `metaImage` when present, else `coverImage`.
 */
export function resolveSeo(entity: SeoEntity): ResolvedSeo {
  const ownTitle = nonEmpty(entity.title);

  const title = nonEmpty(entity.metaTitle) ?? ownTitle ?? DEFAULT_TITLE;

  const description =
    nonEmpty(entity.metaDesc) ??
    nonEmpty(entity.shortDesc) ??
    nonEmpty(entity.excerpt) ??
    ownTitle ??
    DEFAULT_DESCRIPTION;

  const image = nonEmpty(entity.metaImage) ?? nonEmpty(entity.coverImage);

  const resolved: ResolvedSeo = { title, description };
  if (image) resolved.image = image;
  return resolved;
}
