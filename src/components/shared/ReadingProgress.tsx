import * as React from "react";

import { useScrollProgress } from "@/hooks/useScrollProgress";
import { cn } from "@/lib/utils";

export interface ReadingProgressProps {
  /**
   * Optional ref to the article element whose reading progress should be
   * measured. When omitted, progress is measured over the whole document.
   */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Additional classes applied to the fixed track container. */
  className?: string;
}

/**
 * Fixed-position horizontal progress bar pinned to the top of the viewport.
 * Its width reflects the scroll proportion reported by `useScrollProgress`,
 * measured over an optional target element (defaults to the document).
 * Theme-aware via the `bg-primary` token. (Req 18.7)
 */
export default function ReadingProgress({
  targetRef,
  className,
}: ReadingProgressProps) {
  const progress = useScrollProgress(targetRef);

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-1 bg-transparent",
        className
      )}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
