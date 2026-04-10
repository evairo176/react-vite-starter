import productService from "@/core/services/product.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useProduct = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selected, setSelected] = useState<string>("");
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await productService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataProduct,
    isLoading: isLoadingProduct,
    isRefetching: isRefetchingProduct,
    refetch: refetchProduct,
  } = useQuery({
    queryKey: ["product", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataProduct,
    isLoadingProduct,
    isRefetchingProduct,
    refetchProduct,

    selected,
    setSelected,
  };
};

export default useProduct;
