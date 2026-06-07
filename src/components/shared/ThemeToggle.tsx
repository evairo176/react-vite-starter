import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/core/providers/theme-provider";

export interface ThemeToggleProps {
  /** Additional classes applied to the toggle button. */
  className?: string;
}

/**
 * Visible dark/light theme toggle. It reads the effective resolved theme from
 * the ThemeProvider and switches to the opposite mode on activation, applying
 * and persisting the choice within the same tick (handled by the provider).
 *
 * The control exposes an accessible label naming the action it performs
 * (e.g. "Switch to dark theme") and shows a sun icon in dark mode / moon icon
 * in light mode to reflect the action's destination.
 * Requirements: 14.1, 14.7, 20.3
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();

  const isDark = mode === "dark";
  const nextMode: "light" | "dark" = isDark ? "light" : "dark";
  const label = `Switch to ${nextMode} theme`;

  const handleClick = React.useCallback(() => {
    setMode(nextMode);
  }, [setMode, nextMode]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={cn(className)}
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </Button>
  );
}

export default ThemeToggle;
