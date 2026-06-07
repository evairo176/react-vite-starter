import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ProjectGridSkeletonProps {
  /** Number of placeholder cards to render. Defaults to 6. */
  count?: number;
  /** Additional classes applied to the grid container. */
  className?: string;
}

/**
 * Content-shaped loading placeholder for the project card grid. Mirrors the
 * cover-image + title + meta + badge layout of a project card so the loading
 * state matches the rendered content. (Req 16.1)
 */
export default function ProjectGridSkeleton({
  count = 6,
  className,
}: ProjectGridSkeletonProps) {
  return (
    <div
      data-slot="project-grid-skeleton"
      aria-hidden="true"
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-lg border border-border p-4"
        >
          {/* Cover image */}
          <Skeleton className="aspect-video w-full rounded-md" />
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />
          {/* Description lines */}
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          {/* Badges / tech chips */}
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
