import * as React from "react";
import { ImageIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shared, theme-aware content card primitives used by both the public blog and
 * project views so their cards stay visually consistent.
 *
 * The card shell, cover media, and padded body are extracted here while each
 * consumer keeps its own interactive root element (a router `Link` for
 * projects/home blog, a `button` for the blog list). Apply
 * `contentCardClassName` to that root element to get the standardized radius,
 * surface tokens, hover lift, and focus-visible ring.
 */

/** Standardized class string for the interactive card root (Link or button). */
export const contentCardClassName =
  "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-left text-card-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50";

export interface ContentCardMediaProps {
  /** Cover image URL; when empty a placeholder icon is shown instead. */
  src?: string | null;
  /** Accessible alt text for the cover image. */
  alt?: string;
  /** Icon rendered inside the placeholder when no cover image is available. */
  fallbackIcon?: LucideIcon;
  className?: string;
}

/**
 * Renders a 16:9 cover image (or a muted placeholder with an icon) for a
 * content card. The image scales slightly on group hover to match the card
 * lift interaction.
 */
export function ContentCardMedia({
  src,
  alt,
  fallbackIcon: FallbackIcon = ImageIcon,
  className,
}: ContentCardMediaProps) {
  if (src) {
    return (
      <div className={cn("aspect-video w-full overflow-hidden bg-muted", className)}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground",
        className
      )}
    >
      <FallbackIcon className="size-8" aria-hidden="true" />
    </div>
  );
}

export interface ContentCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

/** Padded, flex-column body region for a content card. */
export function ContentCardBody({ children, className }: ContentCardBodyProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-2 p-4", className)}>{children}</div>
  );
}

export default ContentCardMedia;
