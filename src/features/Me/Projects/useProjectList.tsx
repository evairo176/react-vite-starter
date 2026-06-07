import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import publicPortfolioService from "@/core/services/publicPortfolio.service";
import categoryService from "@/core/services/category.service";
import techStackService from "@/core/services/techStack.service";
import { queryKeys } from "@/core/query/keys";
import { buildListQuery, type PortfolioListParams } from "@/core/utils/query";
import useDebounce from "@/hooks/useDebounce";
import type { PaginationMeta } from "@/core/types/api.type";
import type { IPCategory } from "@/core/types/category.type";
import type { IPTechStack } from "@/core/types/techStack.type";
import type { PublicProject } from "@/core/types/portfolio.type";

/** Debounce interval for the search input, per Req 1.7. */
const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_LIMIT = 9;

/** Shape of the search params backing the Portfolio_List_View. */
interface ProjectListSearch {
  category?: string;
  tech?: string; // CSV in the URL
  search?: string;
  sort?: string;
  page?: number;
}

/** Allowed sort values; anything else falls back to the default. */
export const PROJECT_SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "recently-updated", label: "Baru diperbarui" },
  { value: "featured", label: "Unggulan dulu" },
] as const;

const DEFAULT_SORT = "newest";

/** Split a CSV query value into a trimmed, non-empty string array. */
const parseCsv = (value?: string): string[] =>
  value
    ? value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    : [];

/**
 * Data orchestration for the Portfolio_List_View (Req 1).
 *
 * Reads the active filter/search/page state from the router search params,
 * debounces the free-text search at 400ms (Req 1.7), builds the backend query
 * string with the pure `buildListQuery` helper (Req 1.5, 1.6), and fetches the
 * published project list via `useQuery` keyed by the params object so any
 * filter/page/search change naturally triggers a refetch (Req 1.1, 1.9, 13.1).
 *
 * Also loads the category/tag/tech option lists that back the filter bar.
 */
const useProjectList = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as ProjectListSearch;
  const debounce = useDebounce();

  // Derived, normalized view of the URL state.
  const category = search.category ?? "";
  const selectedTech = useMemo(() => parseCsv(search.tech), [search.tech]);
  const committedSearch = search.search ?? "";
  const sort = search.sort ?? DEFAULT_SORT;
  const page = Number(search.page ?? 1) || 1;

  // Local, immediate value for the search input; committed to the URL after a
  // debounce so typing stays responsive while fetches stay throttled.
  const [searchInput, setSearchInput] = useState(committedSearch);
  const lastCommitted = useRef(committedSearch);

  // Keep the input in sync when the URL changes outside of typing (e.g. back).
  if (committedSearch !== lastCommitted.current) {
    lastCommitted.current = committedSearch;
    setSearchInput(committedSearch);
  }

  /** Merge updates into the current URL search params and navigate. */
  const pushSearch = (updates: Partial<ProjectListSearch>) => {
    navigate({
      to: ".",
      // Keep the viewport where it is; filtering/searching should not yank the
      // user back to the top of the page.
      resetScroll: false,
      search: (prev: Record<string, unknown>) => {
        const next: Record<string, unknown> = { ...prev, ...updates };
        // Drop empty/falsey values so the URL stays clean.
        Object.keys(next).forEach((key) => {
          const value = next[key];
          if (value === undefined || value === null || value === "") {
            delete next[key];
          }
        });
        return next;
      },
    } as never);
  };

  // The typed params object that drives both the query string and the cache key.
  const params: PortfolioListParams = useMemo(
    () => ({
      category: category || undefined,
      tech: selectedTech.length ? selectedTech : undefined,
      search: committedSearch || undefined,
      sort: sort !== DEFAULT_SORT ? sort : undefined,
      page,
      limit: DEFAULT_LIMIT,
    }),
    [category, selectedTech, committedSearch, sort, page]
  );

  const queryString = useMemo(() => buildListQuery(params), [params]);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.publicPortfolio.list(params),
    queryFn: async () => {
      const res = await publicPortfolioService.getPublicList(queryString);
      return res?.data;
    },
    placeholderData: keepPreviousData,
  });

  const projects: PublicProject[] = response?.data ?? [];
  const metadata: PaginationMeta | undefined = response?.metadata;

  const featuredProjects = useMemo(
    () => projects.filter((project) => project.featured),
    [projects]
  );

  // ----- Filter option lists (Req 1.5, 1.6) -------------------------------- //

  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["portfolioCategoryOptions"],
    queryFn: async () => {
      const res = await categoryService.findAll("limit=100&page=1");
      return (res?.data?.data ?? []) as IPCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: techOptions = [] } = useQuery({
    queryKey: ["portfolioTechOptions"],
    queryFn: async () => {
      const res = await techStackService.findAll("limit=100&page=1");
      return (res?.data?.data ?? []) as IPTechStack[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ----- Handlers ---------------------------------------------------------- //

  const handleChangeCategory = (next: string) => {
    pushSearch({ category: next || undefined, page: undefined });
  };

  const handleChangeTech = (next: string[]) => {
    pushSearch({ tech: next.length ? next.join(",") : undefined, page: undefined });
  };

  const handleChangeSort = (next: string) => {
    pushSearch({
      sort: next && next !== DEFAULT_SORT ? next : undefined,
      page: undefined,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debounce(() => {
      pushSearch({ search: value || undefined, page: undefined });
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleChangePage = (next: number) => {
    pushSearch({ page: next > 1 ? next : undefined });
  };

  return {
    // data
    projects,
    featuredProjects,
    metadata,
    // request state
    isLoading,
    isError,
    isFetching,
    refetch,
    // current filter/search state
    category,
    selectedTech,
    searchInput,
    sort,
    page,
    // option lists
    categoryOptions,
    techOptions,
    // handlers
    handleChangeCategory,
    handleChangeTech,
    handleChangeSort,
    handleSearchChange,
    handleChangePage,
  };
};

export default useProjectList;
