import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface TableSkeletonProps {
  /** Number of body rows to render. Defaults to 5. */
  rows?: number;
  /** Number of columns per row. Defaults to 4. */
  columns?: number;
  /** Whether to render a header row of placeholders. Defaults to true. */
  showHeader?: boolean;
  /** Additional classes applied to the table container. */
  className?: string;
}

/**
 * Content-shaped loading placeholder for dashboard tables. Renders an optional
 * header row and a configurable grid of row/column cells matching the table
 * layout. Used by the admin blog, portfolio, and analytics views. (Req 16.5)
 */
export default function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  const gridTemplate = `repeat(${Math.max(columns, 1)}, minmax(0, 1fr))`;

  return (
    <div
      data-slot="table-skeleton"
      aria-hidden="true"
      className={cn(
        "w-full overflow-hidden rounded-lg border border-border",
        className
      )}
    >
      {showHeader ? (
        <div
          className="grid gap-4 border-b border-border bg-muted/50 px-4 py-3"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-2/3" />
          ))}
        </div>
      ) : null}
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 border-b border-border px-4 py-4 last:border-b-0"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn("h-4", colIndex === 0 ? "w-3/4" : "w-1/2")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
