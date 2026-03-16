import menuService from "@/core/services/menu.service";
import roleService from "@/core/services/role.service";
import useChangeUrl from "@/hooks/useChangeUrl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const useRole = () => {
  const { currentLimit, currentPage, currentSearch } = useChangeUrl();
  const [selected, setSelected] = useState<string>("");
  const findAll = async () => {
    let params = `limit=${currentLimit}&page=${currentPage}`;

    if (currentSearch) {
      params += `&search=${currentSearch}`;
    }

    const res = await roleService.findAll(`${params}`);

    const { data } = res;

    return data;
  };

  const {
    data: dataRole,
    isLoading: isLoadingRole,
    isRefetching: isRefetchingRole,
    refetch: refetchRole,
  } = useQuery({
    queryKey: ["Role", currentPage, currentLimit, currentSearch],
    queryFn: findAll,
    enabled: !!currentPage && !!currentLimit,
  });

  const {
    data: dataMenu,
    isLoading: isLoadingMenu,
    isRefetching: isRefetchingMenu,
    refetch: refetchMenu,
  } = useQuery({
    queryKey: ["Menus-Role"],
    queryFn: menuService.getMenu,
  });

  return {
    dataRole,
    isLoadingRole,
    isRefetchingRole,
    refetchRole,

    dataMenu,
    isLoadingMenu,
    isRefetchingMenu,
    refetchMenu,

    selected,
    setSelected,
  };
};

export default useRole;
