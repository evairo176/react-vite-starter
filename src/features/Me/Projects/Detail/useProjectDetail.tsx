import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { isAxiosError } from "axios";

import publicPortfolioService from "@/core/services/publicPortfolio.service";
import { queryKeys } from "@/core/query/keys";
import type { PublicProject } from "@/core/types/portfolio.type";

/**
 * Data hook for the Project_Case_Study_View.
 *
 * Reads the `$slug` route param and fetches the public case study via
 * `publicPortfolioService.getPublicBySlug` (`GET /portfolio/public/:slug`,
 * Req 2.1). While the request is in flight `isLoading` is true (Req 2.2).
 * A not-found (404) response is surfaced as `isNotFound` so the view can show a
 * not-found message + back link (Req 2.3); any other failure is surfaced via
 * `isError` for a generic Error_State + retry (Req 2.4).
 */
const useProjectDetail = () => {
  const { slug = "" } = useParams({ strict: false }) as { slug?: string };

  const query = useQuery({
    queryKey: queryKeys.publicPortfolio.detail(slug),
    queryFn: async () => {
      const res = await publicPortfolioService.getPublicBySlug(slug);
      return res?.data?.data as PublicProject;
    },
    enabled: !!slug,
    retry: false,
  });

  // A 404 from the API maps to the dedicated not-found branch; every other
  // error maps to the generic error branch. (Req 2.3, 2.4)
  const isNotFound =
    query.isError && isAxiosError(query.error)
      ? query.error.response?.status === 404
      : false;

  return {
    slug,
    project: query.data,
    isLoading: query.isLoading,
    isError: query.isError && !isNotFound,
    isNotFound,
    refetch: query.refetch,
  };
};

export default useProjectDetail;
