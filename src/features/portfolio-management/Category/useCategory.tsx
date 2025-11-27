import categoryService from "@/core/services/category.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useCategory = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selected, setSelected] = useState<string>("");
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await categoryService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataCategory,
    isLoading: isLoadingCategory,
    isRefetching: isRefetchingCategory,
    refetch: refetchCategory,
  } = useQuery({
    queryKey: ["category", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataCategory,
    isLoadingCategory,
    isRefetchingCategory,
    refetchCategory,

    selected,
    setSelected,
  };
};

export default useCategory;
