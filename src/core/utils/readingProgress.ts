/**
 * Calculates how far the visitor has scrolled through a block of content,
 * expressed as a percentage clamped to the inclusive range [0, 100].
 *
 * The scrollable distance is `contentHeight - viewportHeight`. Progress is the
 * proportion of that distance covered by `scrollY`.
 *
 * Degenerate cases:
 * - When `contentHeight <= viewportHeight` the content fits entirely within the
 *   viewport, so there is nothing left to scroll past; the content is fully
 *   visible and progress is reported as 100. This also avoids divide-by-zero.
 * - Non-finite inputs (NaN/Infinity) are treated as 0 progress.
 * - Values outside [0, 100] are clamped.
 *
 * For a fixed `contentHeight`/`viewportHeight`, the result is non-decreasing as
 * `scrollY` increases.
 *
 * Requirements: 18.7
 */
export const readingProgress = (
  scrollY: number,
  contentHeight: number,
  viewportHeight: number
): number => {
  if (
    !Number.isFinite(scrollY) ||
    !Number.isFinite(contentHeight) ||
    !Number.isFinite(viewportHeight)
  ) {
    return 0;
  }

  const scrollable = contentHeight - viewportHeight;

  // All content fits within the viewport: nothing to scroll past.
  if (scrollable <= 0) {
    return 100;
  }

  const percent = (scrollY / scrollable) * 100;

  return Math.min(100, Math.max(0, percent));
};
