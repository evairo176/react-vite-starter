// Feature: frontend-ui-integration, Property 2: Gallery images render ordered by position
// Validates: Requirements 2.6
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { orderGallery } from "@/core/utils/gallery";

interface TestImage {
  id: number;
  position: number;
}

// Generate a gallery of images with arbitrary positions (including duplicates,
// negatives) and arbitrary input order. Each image carries a unique `id` so we
// can verify the result is a permutation of the input.
const galleryArb = fc
  .array(fc.integer({ min: -1000, max: 1000 }), { maxLength: 30 })
  .map((positions) =>
    positions.map((position, id): TestImage => ({ id, position }))
  );

describe("Property 2: Gallery images render ordered by position", () => {
  it("returns a list sorted ascending by position", () => {
    fc.assert(
      fc.property(galleryArb, (images) => {
        const ordered = orderGallery(images);
        for (let i = 1; i < ordered.length; i++) {
          expect(ordered[i].position).toBeGreaterThanOrEqual(
            ordered[i - 1].position
          );
        }
      }),
      { numRuns: 200 }
    );
  });

  it("is a permutation of the input (same items, none added or dropped)", () => {
    fc.assert(
      fc.property(galleryArb, (images) => {
        const ordered = orderGallery(images);
        // Same count.
        expect(ordered.length).toBe(images.length);
        // Same multiset of ids.
        const inputIds = [...images.map((i) => i.id)].sort((a, b) => a - b);
        const outputIds = [...ordered.map((i) => i.id)].sort((a, b) => a - b);
        expect(outputIds).toEqual(inputIds);
      }),
      { numRuns: 200 }
    );
  });
});
