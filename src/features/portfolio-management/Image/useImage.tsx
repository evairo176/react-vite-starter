import imageService from "@/core/services/image.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useImage = () => {
  const { currentLimit, currentPage, handleChangePage, handleChangeLimit } =
    useChangeUrl();
  const [selected, setSelected] = useState<string>("");
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    const res = await imageService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataImage,
    isLoading: isLoadingImage,
    isRefetching: isRefetchingImage,
    refetch: refetchImage,
  } = useQuery({
    queryKey: ["Image", currentPage, currentLimit],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });
  return {
    dataImage,
    isLoadingImage,
    isRefetchingImage,
    refetchImage,

    selected,
    setSelected,

    currentPage,
    currentLimit,
    handleChangePage,
    handleChangeLimit,
  };
};

export default useImage;
