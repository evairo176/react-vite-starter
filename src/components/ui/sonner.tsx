import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/core/providers/theme-provider";

/**
 * Single, app-wide toaster.
 *
 * Wraps sonner's `<Toaster>` with a consistent position, duration, and
 * theme-aware styling driven by the app's `ThemeProvider`. The `preference`
 * exposed by `useTheme` is a tri-state value (`light` | `dark` | `system`) that
 * maps directly onto sonner's `theme` prop, so the toaster follows the visitor's
 * selected theme (including live OS changes when "system" is selected).
 *
 * Mount this exactly once near the app root (see `RootLayout`). All
 * `toast(...)` call sites across the app are driven by this single instance.
 */
export function Toaster() {
  const { preference } = useTheme();

  return (
    <SonnerToaster
      theme={preference}
      position="top-right"
      richColors
      closeButton
      duration={4000}
    />
  );
}

export default Toaster;
