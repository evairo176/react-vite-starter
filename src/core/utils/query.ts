/**
 * Pure query-string building helpers for list views.
 *
 * `buildListQuery` converts a typed list-params object into the query string the
 * backend expects:
 *  - array fields (`tags`, `tech`) are serialized as comma-separated values
 *  - keys whose value is `undefined`, an empty string, or an empty array are omitted
 *  - present scalar values (string/number/boolean) are included as-is
 *
 * Validates: Requirements 1.5, 1.6, 3.5, 3.6
 */

export interface PortfolioListParams {
  category?: string;
  tags?: string[]; // serialized as CSV: tags=a,b,c
  tech?: string[]; // serialized as CSV: tech=x,y
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface BlogListParams {
  category?: string;
  tags?: string[]; // serialized as CSV: tags=a,b,c
  search?: string;
  page?: number;
  limit?: number;
}

export type ListParams = PortfolioListParams | BlogListParams;

/**
 * Build a backend list query string from a typed params object.
 *
 * @example
 * buildListQuery({ category: "web", tags: ["react", "ts"], page: 2 })
 * // => "category=web&tags=react,ts&page=2"
 */
export function buildListQuery(params: ListParams): string {
  const search = new URLSearchParams();

  // Preserve a stable, predictable key order.
  const keys: (keyof PortfolioListParams)[] = [
    "category",
    "tags",
    "tech",
    "search",
    "featured",
    "page",
    "limit",
  ];

  for (const key of keys) {
    const value = (params as PortfolioListParams)[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      // Drop empty arrays entirely; CSV-join non-empty ones.
      if (value.length === 0) {
        continue;
      }
      search.set(key, value.join(","));
      continue;
    }

    if (typeof value === "string") {
      // Omit empty strings.
      if (value === "") {
        continue;
      }
      search.set(key, value);
      continue;
    }

    // Scalars (number, boolean) — include as their string form.
    search.set(key, String(value));
  }

  // URLSearchParams encodes commas as %2C; the backend expects literal commas
  // for CSV arrays, so decode them back for readability/compatibility.
  return search.toString().replace(/%2C/g, ",");
}
