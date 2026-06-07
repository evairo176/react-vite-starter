import * as React from "react";
import { Code2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TechChipProps extends React.ComponentProps<"span"> {
  /** Display name of the tech-stack item. */
  name: string;
  /** Either a URL to an icon image or an icon name. May be null/absent. */
  icon?: string | null;
}

/** Returns true when the provided icon string looks like an image URL/path. */
function isIconUrl(icon: string): boolean {
  return (
    /^(https?:)?\/\//i.test(icon) ||
    /^(data:|blob:)/i.test(icon) ||
    icon.startsWith("/") ||
    /\.(svg|png|jpe?g|gif|webp|avif)$/i.test(icon)
  );
}

/**
 * Compact chip showing a tech-stack item's icon + name.
 * The icon may be a URL (rendered as <img>) or an icon name; when absent or
 * when only a name is provided, a neutral fallback icon is shown.
 * Requirements: 2.9, 18.4
 */
export function TechChip({ name, icon, className, ...props }: TechChipProps) {
  const trimmedIcon = icon?.trim();
  const hasUrlIcon = !!trimmedIcon && isIconUrl(trimmedIcon);

  return (
    <span
      data-slot="tech-chip"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground transition-colors",
        className
      )}
      {...props}
    >
      {hasUrlIcon ? (
        <img
          src={trimmedIcon}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="size-3.5 shrink-0 object-contain"
        />
      ) : (
        <Code2 aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}

export default TechChip;
