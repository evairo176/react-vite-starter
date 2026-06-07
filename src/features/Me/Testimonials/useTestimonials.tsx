import { useQuery } from "@tanstack/react-query";

import testimonialService from "@/core/services/testimonial.service";
import { queryKeys } from "@/core/query/keys";
import type { Testimonial } from "@/core/types/testimonial.type";

/**
 * Data orchestration for the Testimonials_View. Fetches published testimonials
 * via `GET /testimonial/public` and exposes the query state for the component
 * to render Loading / Error / Empty / content states. (Req 7.1-7.5)
 */
const useTestimonials = () => {
  const fetchTestimonials = async (): Promise<Testimonial[]> => {
    const res = await testimonialService.getPublic();
    const { data } = res;
    return data?.data ?? [];
  };

  const {
    data: testimonials,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.testimonials(),
    queryFn: fetchTestimonials,
  });

  return {
    testimonials,
    isLoading,
    isError,
    refetch,
  };
};

export default useTestimonials;
