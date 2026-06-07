import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ComponentType<LucideProps>;
  /** Optional accent applied to the icon badge (defaults to muted/primary). */
  accent?: "default" | "amber" | "emerald" | "indigo";
  /** Visually highlight the card (e.g. pending comments needing attention). */
  highlight?: boolean;
  /** Extra classes (used when the card is wrapped in a Link). */
  className?: string;
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-primary/10 text-primary",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  indigo:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
};

/**
 * A single top-of-dashboard stat tile: a label, a large formatted value and an
 * accented icon. Purely presentational — to make it a link, wrap it in a
 * TanStack `<Link>` (see the pending-comments tile on the dashboard home).
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "default",
  highlight = false,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "shadow-sm transition-shadow hover:shadow-md",
        highlight &&
          "border-amber-300 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/10",
        className,
      )}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            ACCENTS[accent],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm text-muted-foreground">
            {label}
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </span>
        </span>
      </CardContent>
    </Card>
  );
}
