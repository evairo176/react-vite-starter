import * as React from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface BackToTopProps {
  /** Accessible label describing the control's purpose. */
  label?: string;
  /** Additional classes applied to the floating button. */
  className?: string;
}

/**
 * Floating "back to top" control. It stays hidden until the user has scrolled
 * past one viewport height, then appears fixed in the lower-right corner. On
 * activation it scrolls the viewport to the top, using smooth behavior unless
 * the user prefers reduced motion. (Req 17.5, 17.6, 20.3)
 */
export default function BackToTop({
  label = "Back to top",
  className,
}: BackToTopProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Visible only after scrolling beyond one full viewport height (Req 17.5).
    const updateVisibility = () => {
      setIsVisible(window.scrollY > window.innerHeight);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  const handleClick = React.useCallback(() => {
    // Scroll to the top, smooth unless the user prefers reduced motion (Req 17.6).
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      type="button"
      size="icon"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full shadow-lg",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </Button>
  );
}
