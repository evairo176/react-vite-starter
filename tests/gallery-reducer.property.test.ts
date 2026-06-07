// Feature: frontend-ui-integration, Property 3: Gallery position reducer maintains contiguous ordering
// Validates: Requirements 11.8
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  galleryReducer,
  initialGalleryState,
  type GalleryAction,
  type GalleryEditorState,
} from "@/core/utils/gallery";

// Generators for each editor action. Index-bearing actions use a wide integer
// range (including out-of-range values) so the reducer's bounds handling is
// exercised too.
const addArb: fc.Arbitrary<GalleryAction> = fc
  .record({ url: fc.webUrl(), alt: fc.option(fc.string(), { nil: null }) })
  .map(({ url, alt }) => ({ type: "add", url, alt }));

const removeArb: fc.Arbitrary<GalleryAction> = fc
  .integer({ min: -5, max: 30 })
  .map((index) => ({ type: "remove", index }));

const reorderArb: fc.Arbitrary<GalleryAction> = fc
  .record({
    from: fc.integer({ min: -5, max: 30 }),
    to: fc.integer({ min: -5, max: 30 }),
  })
  .map(({ from, to }) => ({ type: "reorder", from, to }));

const actionArb: fc.Arbitrary<GalleryAction> = fc.oneof(
  addArb,
  removeArb,
  reorderArb
);

// Compute the expected item count by simulating only the count-affecting
// semantics (add => +1, valid remove => -1, reorder => unchanged).
function expectedCount(actions: GalleryAction[]): number {
  let count = 0;
  for (const action of actions) {
    if (action.type === "add") {
      count += 1;
    } else if (action.type === "remove") {
      if (action.index >= 0 && action.index < count) {
        count -= 1;
      }
    }
  }
  return count;
}

describe("Property 3: Gallery position reducer maintains contiguous ordering", () => {
  it("keeps positions contiguous 0..n-1 with no gaps/duplicates and count matches", () => {
    fc.assert(
      fc.property(
        fc.array(actionArb, { maxLength: 50 }),
        (actions) => {
          const state: GalleryEditorState = actions.reduce(
            galleryReducer,
            initialGalleryState
          );

          const positions = state.images.map((img) => img.position);

          // Count matches the operations applied.
          expect(state.images.length).toBe(expectedCount(actions));

          // Positions form a contiguous 0..n-1 sequence (sorted, no gaps,
          // no duplicates).
          const sorted = [...positions].sort((a, b) => a - b);
          for (let i = 0; i < sorted.length; i++) {
            expect(sorted[i]).toBe(i);
          }

          // Array order already reflects positions (position === index).
          positions.forEach((pos, index) => {
            expect(pos).toBe(index);
          });
        }
      ),
      { numRuns: 200 }
    );
  });
});
