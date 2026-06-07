import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface TestimonialSkeletonProps {
  /** Number of testimonial cards to render. Defaults to 3. */
  count?: number;
  /** Additional classes applied to the grid container. */
  className?: string;
}

/**
 * Content-shaped loading placeholder for testimonial cards. Each card mirrors a
 * quote (message lines) plus the author block (avatar + name + role).
 * (Req 16.4)
 */
export default function TestimonialSkeleton({
  count = 3,
  className,
}: TestimonialSkeletonProps) {
  return (
    <div
      data-slot="testimonial-skeleton"
      aria-hidden="true"
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-lg border border-border p-6"
        >
          {/* Quote / message lines */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          {/* Author block */}
          <div className="mt-2 flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
