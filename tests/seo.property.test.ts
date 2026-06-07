// Feature: frontend-ui-integration, Property 5: SEO metadata fallback resolution
// Validates: Requirements 9.1, 9.2
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { resolveSeo, type SeoEntity } from "@/core/utils/seo";

/**
 * Generates a field value that may be absent (undefined), explicitly null,
 * blank/whitespace-only (treated as absent), or a meaningful non-empty string.
 * This exercises both the "explicit metadata present" and "fall back" branches.
 */
const optionalField = fc.oneof(
  fc.constant(undefined),
  fc.constant(null),
  fc.constant(""),
  fc.constant("   "),
  fc.string({ minLength: 1, maxLength: 40 })
);

/** A non-empty (after trim) string, used for the entity's own title. */
const nonBlankString = fc
  .string({ minLength: 1, maxLength: 40 })
  .filter((s) => s.trim().length > 0);

const entityArb: fc.Arbitrary<SeoEntity> = fc.record({
  title: nonBlankString,
  metaTitle: optionalField,
  metaDesc: optionalField,
  metaImage: optionalField,
  shortDesc: optionalField,
  excerpt: optionalField,
  coverImage: optionalField,
});

const hasContent = (v: string | null | undefined): v is string =>
  typeof v === "string" && v.trim().length > 0;

describe("Property 5: SEO metadata fallback resolution", () => {
  it("always produces a non-empty title and description, preferring explicit values then fallbacks", () => {
    fc.assert(
      fc.property(entityArb, (entity) => {
        const seo = resolveSeo(entity);

        // Title and description are always non-empty.
        expect(seo.title.trim().length).toBeGreaterThan(0);
        expect(seo.description.trim().length).toBeGreaterThan(0);

        // Title: explicit metaTitle wins, else falls back to the entity title.
        if (hasContent(entity.metaTitle)) {
          expect(seo.title).toBe(entity.metaTitle.trim());
        } else {
          expect(seo.title).toBe(entity.title.trim());
        }

        // Description: explicit metaDesc wins, else shortDesc, else excerpt,
        // else the entity title.
        if (hasContent(entity.metaDesc)) {
          expect(seo.description).toBe(entity.metaDesc.trim());
        } else if (hasContent(entity.shortDesc)) {
          expect(seo.description).toBe(entity.shortDesc.trim());
        } else if (hasContent(entity.excerpt)) {
          expect(seo.description).toBe(entity.excerpt.trim());
        } else {
          expect(seo.description).toBe(entity.title.trim());
        }

        // Image (optional): explicit metaImage wins, else coverImage, else absent.
        if (hasContent(entity.metaImage)) {
          expect(seo.image).toBe(entity.metaImage.trim());
        } else if (hasContent(entity.coverImage)) {
          expect(seo.image).toBe(entity.coverImage.trim());
        } else {
          expect(seo.image).toBeUndefined();
        }
      }),
      { numRuns: 200 }
    );
  });
});
