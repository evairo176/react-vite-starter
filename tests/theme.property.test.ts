// Feature: frontend-ui-integration, Property 6: Theme preference resolution
// Validates: Requirements 14.4, 14.5
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { resolveTheme, type ThemePreference } from "@/core/utils/theme";

describe("Property 6: Theme preference resolution", () => {
  const storedArb = fc.constantFrom<ThemePreference | null | undefined>(
    "dark",
    "light",
    "system",
    null,
    undefined
  );

  it("returns the explicit stored value for dark/light, otherwise the prefersDark result", () => {
    fc.assert(
      fc.property(storedArb, fc.boolean(), (stored, prefersDark) => {
        const result = resolveTheme(stored, prefersDark);

        if (stored === "dark" || stored === "light") {
          // Explicit stored preference wins regardless of prefersDark
          expect(result).toBe(stored);
        } else {
          // "system", null, or undefined falls back to prefers-color-scheme
          expect(result).toBe(prefersDark ? "dark" : "light");
        }
      }),
      { numRuns: 200 }
    );
  });
});
