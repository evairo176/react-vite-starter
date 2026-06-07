import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import blogPostService from "@/core/services/blogPost.service";
import blogCategoryService from "@/core/services/blogCategory.service";
import blogTagService from "@/core/services/blogTag.service";
import { buildListQuery, type BlogListParams } from "@/core/utils/query";
import { queryKeys } from "@/core/query/keys";
import useDebounce from "@/hooks/useDebounce";
import type { ApiResponse, PaginationMeta } from "@/core/types/api.type";
import type {
  BlogCategory,
  BlogTag,
  IBlogPost,
} from "@/core/types/blogPost.type";

const DEFAULT_LIMIT = 9;
const SEARCH_DEBOUNCE_MS = 400;

/** Normalize a router search value (may be string | number | undefined). */
function asString(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

/**
 * Router-search-driven data hook for the Blog_List_View.
 *
 * Reads the category slug, tag slug, search term, and page from the TanStack
 * Router search params, debounces the search input at 400ms before it reaches
 * the URL/query, builds the backend query string with `buildListQuery`, and
 * fetches the published post list via
 * `useQuery(queryKeys.publicBlog.list(params))`. It also loads the category and
 * tag option lists that back the filter bar.
 *
 * Requirements: 3.1, 3.5, 3.6, 3.7, 3.8, 13.1
 */
const useBlogList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const debounce = useDebounce();

  const searchObject = (location.search ?? {}) as Record<string, unknown>;

  // URL-driven filter/pagination state (the source of truth for the query).
  const category = asString(searchObject.category);
  const tag = asString(searchObject.tag);
  const search = asString(searchObject.search);
  const page = Math.max(1, Number(searchObject.page) || 1);

  // Local, immediately-responsive value for the search input. The debounced
  // commit pushes it into the URL search params (and therefore the query key).
  const [searchInput, setSearchInput] = useState<string>(search);
  const lastSyncedSearch = useRef<string>(search);

  // Keep the controlled input in sync when the URL changes externally
  // (e.g. back/forward navigation) without clobbering active typing.
  if (search !== lastSyncedSearch.current) {
    lastSyncedSearch.current = search;
    if (search !== searchInput) {
      setSearchInput(search);
    }
  }

  /** Push an updated search-param object onto the current route. */
  const pushSearch = (updates: Record<string, string | undefined>) => {
    const next: Record<string, string> = {};
    Object.entries(searchObject).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      next[key] = String(value);
    });
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        delete next[key];
      } else {
        next[key] = value;
      }
    });
    navigate({ to: location.pathname, search: next, resetScroll: false } as never);
  };

  // Debounced search: typing updates the input immediately and commits to the
  // URL (resetting to page 1) after 400ms of inactivity. (Req 3.7)
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debounce(() => {
      pushSearch({ search: value, page: undefined });
    }, SEARCH_DEBOUNCE_MS);
  };

  // Filter changes reset pagination to the first page. (Req 3.5, 3.6, 3.8)
  const handleCategoryChange = (slug: string) => {
    pushSearch({ category: slug || undefined, page: undefined });
  };

  const handleTagChange = (slug: string) => {
    pushSearch({ tag: slug || undefined, page: undefined });
  };

  const handlePageChange = (nextPage: number) => {
    pushSearch({ page: nextPage > 1 ? String(nextPage) : undefined });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    navigate({ to: location.pathname, search: {}, resetScroll: false } as never);
  };

  // Build the typed params object → backend query string. (Req 3.5, 3.6)
  const params: BlogListParams = useMemo(
    () => ({
      category: category || undefined,
      tags: tag ? [tag] : undefined,
      search: search || undefined,
      page,
      limit: DEFAULT_LIMIT,
    }),
    [category, tag, search, page]
  );

  const queryString = useMemo(() => buildListQuery(params), [params]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.publicBlog.list(params),
    queryFn: async () => {
      const res = await blogPostService.findAllPublic(queryString);
      return res.data as ApiResponse<IBlogPost[]>;
    },
    placeholderData: keepPreviousData,
  });

  // Filter option lists backing the filter bar. (Req 3.5, 3.6)
  const { data: categories } = useQuery({
    queryKey: queryKeys.blogTaxonomy.categories(),
    queryFn: async () => {
      const res = await blogCategoryService.getAll();
      return (res.data?.data ?? []) as BlogCategory[];
    },
  });

  const { data: tags } = useQuery({
    queryKey: queryKeys.blogTaxonomy.tags(),
    queryFn: async () => {
      const res = await blogTagService.getAll();
      return (res.data?.data ?? []) as BlogTag[];
    },
  });

  const posts = (data?.data ?? []) as IBlogPost[];
  const meta = data?.metadata as PaginationMeta | undefined;
  const isEmpty = !isLoading && !isError && posts.length === 0;

  return {
    // data
    posts,
    meta,
    categories: categories ?? [],
    tags: tags ?? [],

    // query state
    isLoading,
    isError,
    isFetching,
    isEmpty,
    refetch,

    // filter/pagination state
    category,
    tag,
    searchInput,
    page,

    // handlers
    handleSearchChange,
    handleCategoryChange,
    handleTagChange,
    handlePageChange,
    handleClearFilters,
  };
};

export default useBlogList;
