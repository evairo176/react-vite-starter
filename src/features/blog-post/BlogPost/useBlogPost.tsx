import blogPostService from "@/core/services/blogPost.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";

const useBlogPost = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();

  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await blogPostService.findAllAdmin(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataBlogPost,
    isLoading: isLoadingBlogPost,
    isRefetching: isRefetchingBlogPost,
    refetch: refetchBlogPost,
  } = useQuery({
    queryKey: ["blog-post", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });

  return {
    dataBlogPost,
    isLoadingBlogPost,
    isRefetchingBlogPost,
    refetchBlogPost,
  };
};

export default useBlogPost;
