import tagService from "@/core/services/tag.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useTag = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selected, setSelected] = useState<string>("");
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await tagService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataTag,
    isLoading: isLoadingTag,
    isRefetching: isRefetchingTag,
    refetch: refetchTag,
  } = useQuery({
    queryKey: ["Tag", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataTag,
    isLoadingTag,
    isRefetchingTag,
    refetchTag,

    selected,
    setSelected,
  };
};

export default useTag;
