import * as React from "react";
import { Inbox, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Icon component (e.g. from lucide-react). Defaults to an inbox icon. */
  icon?: LucideIcon;
  /** Primary heading describing the empty condition. */
  title: string;
  /** Optional supporting text giving more context. */
  description?: string;
  /** Additional classes applied to the root container. */
  className?: string;
}

/**
 * Theme-aware empty-state primitive: an icon/illustration, a title, and an
 * optional description. Used across data-driven views to render the "zero
 * results" state with a consistent structure. (Req 19.1, 19.3, 19.4, 13.5)
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-8" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
