import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  buildListQuery,
  type PortfolioListParams,
} from "@/core/utils/query";

// Feature: frontend-ui-integration, Property 1: List query string builder
// Validates: Requirements 1.5, 1.6, 3.5, 3.6

/**
 * Property 1: List query string builder
 *
 * For any list-params object (any combination of category, tags[], tech[],
 * search, featured, page, limit), buildListQuery SHALL:
 *  - serialize array fields (tags, tech) as comma-separated values,
 *  - omit keys whose value is undefined, empty string, or empty array,
 *  - include every present scalar key with its value,
 * such that parsing the result back yields exactly the non-empty inputs.
 */

// A token that contains neither "," (CSV separator) nor "&"/"=" (query
// separators), so round-tripping through the query string is unambiguous.
const tokenArb = fc
  .string({ minLength: 1, maxLength: 12 })
  .filter((s) => !/[,&=%]/.test(s) && s.trim() === s && s.length > 0);

const arrayArb = fc.array(tokenArb, { maxLength: 5 });

const paramsArb: fc.Arbitrary<PortfolioListParams> = fc.record(
  {
    category: fc.oneof(fc.constant(undefined), tokenArb, fc.constant("")),
    tags: fc.oneof(fc.constant(undefined), arrayArb),
    tech: fc.oneof(fc.constant(undefined), arrayArb),
    search: fc.oneof(fc.constant(undefined), tokenArb, fc.constant("")),
    featured: fc.oneof(fc.constant(undefined), fc.boolean()),
    page: fc.oneof(fc.constant(undefined), fc.integer({ min: 0, max: 9999 })),
    limit: fc.oneof(fc.constant(undefined), fc.integer({ min: 0, max: 9999 })),
  },
  { requiredKeys: [] }
);

function shouldOmit(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

describe("buildListQuery (Property 1: List query string builder)", () => {
  it("serializes arrays as CSV, omits empties, and preserves present scalars", () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const parsed = new URLSearchParams(buildListQuery(params));

        const arrayKeys: (keyof PortfolioListParams)[] = ["tags", "tech"];
        const scalarKeys: (keyof PortfolioListParams)[] = [
          "category",
          "search",
          "featured",
          "page",
          "limit",
        ];

        // Array fields: omitted when empty/undefined, else CSV of the input.
        for (const key of arrayKeys) {
          const value = params[key] as string[] | undefined;
          if (shouldOmit(value)) {
            expect(parsed.has(key)).toBe(false);
          } else {
            expect(parsed.get(key)).toBe((value as string[]).join(","));
          }
        }

        // Scalar fields: omitted when undefined/empty-string, else stringified.
        for (const key of scalarKeys) {
          const value = params[key];
          if (shouldOmit(value)) {
            expect(parsed.has(key)).toBe(false);
          } else {
            expect(parsed.get(key)).toBe(String(value));
          }
        }

        // No unexpected keys leaked into the query string.
        const allowed = new Set<string>([...arrayKeys, ...scalarKeys]);
        for (const key of parsed.keys()) {
          expect(allowed.has(key)).toBe(true);
        }
      }),
      { numRuns: 200 }
    );
  });

  it("matches the documented example", () => {
    expect(
      buildListQuery({ category: "web", tags: ["react", "ts"], page: 2 })
    ).toBe("category=web&tags=react,ts&page=2");
  });
});
