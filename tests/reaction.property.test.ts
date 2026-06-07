// Feature: frontend-ui-integration, Property 4: Optimistic reaction rollback restores the original count
// Validates: Requirements 4.6
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { applyOptimistic, rollback } from "@/core/utils/reaction";

/**
 * Property 4: Optimistic reaction rollback restores the original count.
 *
 * For any starting reaction count, applying the optimistic increment and then
 * applying the failure rollback restores exactly the original count. This
 * mirrors the reaction mutation flow: `onMutate` snapshots the previous count
 * and applies `applyOptimistic`, while `onError` calls `rollback` with the
 * snapshot to discard the optimistic change.
 */
describe("optimistic reaction rollback (Property 4)", () => {
  it("restores the original count after optimistic increment then rollback", () => {
    fc.assert(
      fc.property(fc.integer(), (count) => {
        const original = count;
        const optimistic = applyOptimistic(count);
        const restored = rollback(optimistic, original);
        expect(restored).toBe(original);
      }),
      { numRuns: 200 }
    );
  });
});
