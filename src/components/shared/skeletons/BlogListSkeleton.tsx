import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface BlogListSkeletonProps {
  /** Number of placeholder rows/cards to render. Defaults to 5. */
  count?: number;
  /** Additional classes applied to the list container. */
  className?: string;
}

/**
 * Content-shaped loading placeholder for the blog post list. Each item mirrors
 * a post row: a thumbnail, the title, an excerpt, and meta (category + date).
 * (Req 16.2)
 */
export default function BlogListSkeleton({
  count = 5,
  className,
}: BlogListSkeletonProps) {
  return (
    <div
      data-slot="blog-list-skeleton"
      aria-hidden="true"
      className={cn("flex flex-col gap-4", className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-start"
        >
          {/* Thumbnail */}
          <Skeleton className="h-32 w-full shrink-0 rounded-md sm:h-24 sm:w-40" />
          <div className="flex flex-1 flex-col gap-2">
            {/* Title */}
            <Skeleton className="h-5 w-3/4" />
            {/* Excerpt lines */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            {/* Meta row */}
            <div className="mt-1 flex gap-2">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
