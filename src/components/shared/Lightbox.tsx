import * as React from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  /** Source URL of the gallery image. */
  url: string;
  /** Optional alternative text describing the image. */
  alt?: string | null;
}

export interface LightboxProps {
  /** Ordered collection of gallery images. */
  images: LightboxImage[];
  /** Index of the currently displayed image within `images`. */
  index: number;
  /** Whether the lightbox overlay is open. */
  open: boolean;
  /** Called when the open state changes (close control, Escape, overlay). */
  onOpenChange: (open: boolean) => void;
  /** Called when the active image index changes via prev/next or arrow keys. */
  onIndexChange?: (index: number) => void;
}

/**
 * Gallery image overlay. Displays the enlarged current image with controls to
 * zoom and to navigate to adjacent images. Built on the Radix-based ui/dialog,
 * which provides Escape-to-close, a focus trap while open, and focus restore to
 * the trigger on close. Left/Right arrow keys navigate between images.
 *
 * Requirements: 18.5, 18.6, 20.3, 20.4, 20.5
 */
export default function Lightbox({
  images,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: LightboxProps) {
  const [zoomed, setZoomed] = React.useState(false);

  const total = images.length;
  const hasMultiple = total > 1;
  // Clamp the incoming index so out-of-range values never break rendering.
  const safeIndex =
    total > 0 ? Math.min(Math.max(index, 0), total - 1) : 0;
  const current = images[safeIndex];

  // Reset the zoom state whenever the lightbox opens or the image changes so a
  // newly shown image always starts at its natural scale.
  React.useEffect(() => {
    setZoomed(false);
  }, [open, safeIndex]);

  const goTo = React.useCallback(
    (next: number) => {
      if (total === 0) {
        return;
      }
      // Wrap around so navigation is continuous across the gallery.
      const wrapped = ((next % total) + total) % total;
      onIndexChange?.(wrapped);
    },
    [total, onIndexChange]
  );

  const goPrev = React.useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);
  const goNext = React.useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);

  const toggleZoom = React.useCallback(() => {
    setZoomed((prev) => !prev);
  }, []);

  // Arrow-key navigation while the lightbox is open (Req 20.4). Escape is
  // handled by the underlying Radix Dialog.
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!hasMultiple) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    },
    [hasMultiple, goPrev, goNext]
  );

  if (total === 0 || !current) {
    return null;
  }

  const altText = current.alt ?? `Image ${safeIndex + 1} of ${total}`;
  const positionLabel = `Image ${safeIndex + 1} of ${total}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={handleKeyDown}
        aria-label="Image gallery viewer"
        className={cn(
          "flex max-h-[90vh] w-full max-w-[95vw] items-center justify-center border-0 bg-transparent p-0 shadow-none sm:max-w-[90vw]"
        )}
      >
        {/* Accessible title for screen readers; visually hidden. */}
        <DialogTitle className="sr-only">{positionLabel}</DialogTitle>

        {/* Close control (Req 18.6, 20.3) */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close image viewer"
          className="absolute right-2 top-2 z-50 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        {/* Zoom control (Req 18.5, 20.3) */}
        <button
          type="button"
          onClick={toggleZoom}
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
          aria-pressed={zoomed}
          className="absolute left-2 top-2 z-50 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {zoomed ? (
            <ZoomOut className="size-5" aria-hidden="true" />
          ) : (
            <ZoomIn className="size-5" aria-hidden="true" />
          )}
        </button>

        {/* Previous control (Req 18.5, 20.3) */}
        {hasMultiple && (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
        )}

        {/* Enlarged current image (Req 18.5) */}
        <div className="flex max-h-[90vh] w-full items-center justify-center overflow-auto">
          <img
            src={current.url}
            alt={altText}
            className={cn(
              "max-h-[90vh] w-auto max-w-full select-none object-contain transition-transform duration-200",
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            )}
            onClick={toggleZoom}
            draggable={false}
          />
        </div>

        {/* Next control (Req 18.5, 20.3) */}
        {hasMultiple && (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        )}

        {/* Position indicator */}
        {hasMultiple && (
          <div className="absolute bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {positionLabel}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
