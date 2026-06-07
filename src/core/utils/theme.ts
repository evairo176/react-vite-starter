export type ThemePreference = "dark" | "light" | "system";

/**
 * Resolves the effective theme ("dark" | "light") from a persisted preference
 * and the `prefers-color-scheme` result.
 *
 * - When `stored` is an explicit "dark" or "light", that value wins.
 * - Otherwise (stored "system", null, or undefined), the theme indicated by
 *   `prefersDark` is used.
 *
 * Requirements: 14.4, 14.5
 */
export const resolveTheme = (
  stored: ThemePreference | null | undefined,
  prefersDark: boolean
): "dark" | "light" => {
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  return prefersDark ? "dark" : "light";
};
