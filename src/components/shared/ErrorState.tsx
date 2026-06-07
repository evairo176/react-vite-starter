import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  /** Primary heading describing the error. Defaults to a generic message. */
  title?: string;
  /** Optional supporting text giving more context. */
  description?: string;
  /** Optional retry handler; when provided a retry button is rendered. */
  onRetry?: () => void;
  /** Additional classes applied to the root container. */
  className?: string;
}

/**
 * Theme-aware error-state primitive: an icon, text, and an optional retry
 * control. Used across data-driven views to render the error state with a
 * consistent structure. (Req 1.3, 19.2, 19.3, 19.4, 13.5)
 */
export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
