import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CategoryBadgeProps {
  /** Text label for the category/tag. */
  label: string;
  /** Optional click handler; when provided the badge becomes interactive. */
  onClick?: () => void;
  /** Whether this category/tag is currently active/selected. */
  active?: boolean;
  className?: string;
}

/**
 * Labeled badge for a category or tag, built on the ui/badge primitive.
 * When `onClick` is provided it renders as an accessible button-like control
 * and reflects its `active` state via theme-aware Tailwind classes.
 * Requirements: 18.1
 */
export function CategoryBadge({
  label,
  onClick,
  active = false,
  className,
}: CategoryBadgeProps) {
  const isInteractive = typeof onClick === "function";

  return (
    <Badge
      variant={active ? "default" : "outline"}
      aria-pressed={isInteractive ? active : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        isInteractive &&
          "cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        active && isInteractive && "hover:bg-primary/90 hover:text-primary-foreground",
        className
      )}
    >
      {label}
    </Badge>
  );
}

export default CategoryBadge;
