// Feature: frontend-ui-integration, Property 7: Reading-progress percentage is clamped and monotonic
// Validates: Requirements 18.7

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { readingProgress } from "@/core/utils/readingProgress";

describe("readingProgress (Property 7)", () => {
  it("always returns a value within the inclusive range [0, 100] for any inputs", () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        (scrollY, contentHeight, viewportHeight) => {
          const result = readingProgress(scrollY, contentHeight, viewportHeight);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("is non-decreasing as scrollY increases for a fixed content/viewport", () => {
    fc.assert(
      fc.property(
        // Fixed content/viewport per run.
        fc.double({ min: 0, max: 100000, noNaN: true }),
        fc.double({ min: 0, max: 100000, noNaN: true }),
        // An arbitrary, then sorted, list of scroll positions.
        fc.array(fc.double({ min: 0, max: 100000, noNaN: true }), {
          minLength: 2,
          maxLength: 50,
        }),
        (contentHeight, viewportHeight, scrolls) => {
          const ordered = [...scrolls].sort((a, b) => a - b);
          let previous = -Infinity;
          for (const scrollY of ordered) {
            const current = readingProgress(scrollY, contentHeight, viewportHeight);
            expect(current).toBeGreaterThanOrEqual(previous);
            previous = current;
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
