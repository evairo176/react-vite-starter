import blogPostService from "@/core/services/blogPost.service";
import { useQuery } from "@tanstack/react-query";

const useBlogs = () => {
  const findAll = async () => {
    const params = `limit=3&page=1&sortBy=updatedAt&sortDir=desc`;
    const res = await blogPostService.findAllPublic(params);
    const { data } = res;
    return data?.data ?? [];
  };

  const { data: dataBlogs, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ["landingPageBlogs"],
    queryFn: findAll,
  });

  return {
    dataBlogs,
    isLoadingBlogs,
  };
};

export default useBlogs;
