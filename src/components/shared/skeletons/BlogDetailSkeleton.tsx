import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface BlogDetailSkeletonProps {
  /** Number of body text lines to render. Defaults to 8. */
  lines?: number;
  /** Additional classes applied to the article container. */
  className?: string;
}

/**
 * Content-shaped loading placeholder for the blog detail article. Mirrors the
 * article header (title, meta, cover image) followed by paragraph body lines.
 * (Req 16.3)
 */
export default function BlogDetailSkeleton({
  lines = 8,
  className,
}: BlogDetailSkeletonProps) {
  return (
    <article
      data-slot="blog-detail-skeleton"
      aria-hidden="true"
      className={cn("mx-auto flex w-full max-w-3xl flex-col gap-4", className)}
    >
      {/* Header */}
      <Skeleton className="h-9 w-5/6" />
      <Skeleton className="h-9 w-2/3" />
      {/* Meta row (category, author, date, reading time) */}
      <div className="flex gap-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      {/* Cover image */}
      <Skeleton className="aspect-video w-full rounded-lg" />
      {/* Body lines */}
      <div className="mt-2 flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-4 w-full", index % 4 === 3 && "w-2/3")}
          />
        ))}
      </div>
    </article>
  );
}
