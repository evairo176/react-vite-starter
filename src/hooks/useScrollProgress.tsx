import { useEffect, useState, type RefObject } from "react";
import { readingProgress } from "@/core/utils/readingProgress";

/**
 * Tracks how far the visitor has scrolled through a target element (or the
 * whole document when no target is provided) and returns the progress as a
 * percentage in the inclusive range [0, 100].
 *
 * The progress math is delegated to the pure `readingProgress` helper. The hook
 * recomputes on `scroll` and `resize`, and cleans up its listeners on unmount.
 *
 * @param targetRef Optional ref to the element whose content is being read. When
 *   omitted (or its `current` is null), progress is measured over the document.
 *
 * Requirements: 18.7
 */
export function useScrollProgress(
  targetRef?: RefObject<HTMLElement | null>
): number {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const compute = () => {
      const viewportHeight = window.innerHeight;
      const target = targetRef?.current;

      if (target) {
        // Progress relative to the target element's box: how far the bottom of
        // the element has scrolled up past the bottom of the viewport.
        const rect = target.getBoundingClientRect();
        const contentHeight = rect.height;
        const scrolledIntoView = viewportHeight - rect.top;

        setProgress(
          readingProgress(scrolledIntoView, contentHeight, viewportHeight)
        );
        return;
      }

      const contentHeight =
        document.documentElement.scrollHeight ?? document.body.scrollHeight;
      const scrollY = window.scrollY ?? window.pageYOffset ?? 0;

      setProgress(readingProgress(scrollY, contentHeight, viewportHeight));
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);

    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [targetRef]);

  return progress;
}

export default useScrollProgress;
