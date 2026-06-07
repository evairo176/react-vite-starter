"use client";

import { useEffect, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import useDebounce from "./useDebounce";
import {
  DELAY,
  LIMIT_DEFAULT,
  PAGE_DEFAULT,
} from "@/components/shared/table/list.constant";

// NOTE:
// - Pertahankan API & nama fungsi yang sama: useChangeUrl
// - Migrasi dari react-router (useSearchParams) ke TanStack Router.
//   TanStack menyimpan search params sebagai object hasil-parse pada
//   `location.search`. Kita konversi ke/ dari URLSearchParams agar logika
//   pembentukan query string yang sudah ada tetap dipertahankan, lalu
//   navigasi melalui `navigate({ to, search })`.

const useChangeUrl = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const debounce = useDebounce();

  const pathname = location.pathname;

  // search params TanStack berupa object → ubah ke URLSearchParams yang mutable
  const searchObject = (location.search ?? {}) as Record<string, unknown>;

  const getMutableParams = () => {
    const params = new URLSearchParams();
    Object.entries(searchObject).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      params.set(key, String(value));
    });
    return params;
  };

  const searchParams = getMutableParams();

  // baca "current*" dari query
  const currentLimit = searchParams.get("limit");
  const currentPage = searchParams.get("page");
  const currentSearch = searchParams.get("search");
  const currentCategory = searchParams.get("category");
  const currentIsOnline = searchParams.get("isOnline");
  const currentIsFeatured = searchParams.get("isFeatured");

  // ubah URLSearchParams → plain object untuk konsumsi TanStack navigate
  const paramsToObject = (params: URLSearchParams) => {
    const obj: Record<string, string> = {};
    params.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  };

  // helper bikin search object baru dari QS sekarang
  const buildSearch = (updates: Record<string, string | undefined>) => {
    const params = getMutableParams();
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) return;
      if (value === "") params.delete(key);
      else params.set(key, value);
    });
    return paramsToObject(params);
  };

  const pushSearch = (search: Record<string, string>, replace = false) => {
    navigate({ to: pathname, search, replace } as never);
  };

  // set default saat param hilang (pengganti router.isReady & shallow)
  useEffect(() => {
    const ExplorePathName =
      pathname === "/event"
        ? {
            category: currentCategory || "",
            isOnline: currentIsOnline || "",
            isFeatured: currentIsFeatured || "",
          }
        : {};

    const nextSearch = buildSearch({
      ...paramsToObject(getMutableParams()),
      limit: currentLimit || String(LIMIT_DEFAULT),
      page: currentPage || String(PAGE_DEFAULT),
      search: currentSearch || "",
      ...ExplorePathName,
    });

    // hindari loop: hanya replace jika berbeda
    const nextStr = new URLSearchParams(nextSearch).toString();
    const nowStr = getMutableParams().toString();
    if (nextStr !== nowStr) {
      pushSearch(nextSearch, true);
    }
    // dependensi: pathname & search string cukup untuk detect perubahan URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, getMutableParams().toString()]);

  const handleChangePage = (page: number) => {
    pushSearch(
      buildSearch({
        ...paramsToObject(getMutableParams()),
        page: String(page),
      }),
    );
  };

  const handleChangeLimit = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedLimit = e?.target?.value;
    pushSearch(
      buildSearch({
        ...paramsToObject(getMutableParams()),
        limit: selectedLimit,
        page: String(PAGE_DEFAULT),
      }),
    );
  };

  const handleChangeLimitWithValue = (e: string) => {
    const selectedLimit = e;
    pushSearch(
      buildSearch({
        ...paramsToObject(getMutableParams()),
        limit: selectedLimit,
        page: String(PAGE_DEFAULT),
      }),
    );
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      const search = e.target.value;
      pushSearch(
        buildSearch({
          ...paramsToObject(getMutableParams()),
          search,
          page: String(PAGE_DEFAULT),
        }),
      );
    }, DELAY);
  };

  const handleClearSearch = () => {
    pushSearch(
      buildSearch({
        ...paramsToObject(getMutableParams()),
        search: "",
        page: String(PAGE_DEFAULT),
      }),
    );
  };

  const handleChangeCategory = (category: string) => {
    pushSearch(
      buildSearch({
        ...paramsToObject(getMutableParams()),
        category,
        page: String(PAGE_DEFAULT),
      }),
    );
  };

  const handleChangeIsOnline = (isOnline: string) => {
    pushSearch(
      buildSearch({
        ...paramsToObject(getMutableParams()),
        isOnline,
        page: String(PAGE_DEFAULT),
      }),
    );
  };

  const handleChangeIsFeatured = (isFeatured: string) => {
    pushSearch(
      buildSearch({
        ...paramsToObject(getMutableParams()),
        isFeatured,
        page: String(PAGE_DEFAULT),
      }),
    );
  };

  const resetFilterExplore = () => {
    pushSearch({
      limit: String(LIMIT_DEFAULT),
      page: String(PAGE_DEFAULT),
    });
  };

  return {
    handleChangePage,
    handleChangeLimit,
    handleChangeLimitWithValue,
    handleSearch,
    handleClearSearch,
    handleChangeCategory,
    handleChangeIsOnline,
    handleChangeIsFeatured,
    currentLimit,
    currentPage,
    currentSearch,
    currentCategory,
    currentIsOnline,
    currentIsFeatured,
    resetFilterExplore,
  };
};

export default useChangeUrl;
