import * as React from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/shared/ThemeToggle";

/** Scroll distance (in pixels) after which the header condenses (Req 17.3). */
const CONDENSE_THRESHOLD = 80;

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "Blogs", to: "/blogs" },
  { label: "Contact", to: "/contact" },
];

export interface StickyHeaderProps {
  /** Additional classes applied to the header element. */
  className?: string;
}

/**
 * Public site header that stays fixed to the top of the viewport. After the
 * visitor scrolls beyond 80px it condenses (reduced padding, shadow, and a
 * blurred translucent background). It hosts the primary navigation and the
 * theme toggle.
 * Requirements: 14.1, 17.3
 */
export function StickyHeader({ className }: StickyHeaderProps) {
  const [condensed, setCondensed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateCondensed = () => {
      setCondensed(window.scrollY > CONDENSE_THRESHOLD);
    };

    updateCondensed();
    window.addEventListener("scroll", updateCondensed, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateCondensed);
    };
  }, []);

  return (
    <header
      data-slot="sticky-header"
      data-condensed={condensed}
      className={cn(
        "sticky top-0 z-40 w-full border-b border-transparent transition-all duration-300",
        condensed
          ? "border-border bg-background/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-background",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between px-4 transition-all duration-300",
          condensed ? "h-12" : "h-16"
        )}
      >
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "[&.active]:text-foreground"
              )}
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}

export default StickyHeader;
