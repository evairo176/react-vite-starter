"use client";

import { useEffect, type ChangeEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useDebounce from "./useDebounce";
import {
  DELAY,
  LIMIT_DEFAULT,
  PAGE_DEFAULT,
} from "@/shared/table/list.constant";

// NOTE:
// - Pertahankan API & nama fungsi yang sama: useChangeUrl
// - Asumsikan konstanta berikut sudah didefinisikan di tempat lain:
//   LIMIT_DEFAULT, PAGE_DEFAULT, DELAY

const useChangeUrl = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rrdSearchParams] = useSearchParams();
  const debounce = useDebounce();

  // util: buat instance URLSearchParams baru yang bisa dimodifikasi
  const getMutableParams = () =>
    new URLSearchParams(rrdSearchParams.toString());

  const pathname = location.pathname;
  const searchParams = getMutableParams();

  // baca "current*" dari query
  const currentLimit = searchParams.get("limit");
  const currentPage = searchParams.get("page");
  const currentSearch = searchParams.get("search");
  const currentCategory = searchParams.get("category");
  const currentIsOnline = searchParams.get("isOnline");
  const currentIsFeatured = searchParams.get("isFeatured");

  // helper bikin QS baru dari QS sekarang
  const createQueryString = (updates: Record<string, string | undefined>) => {
    const params = getMutableParams();
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) return;
      if (value === "") params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
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

    const nextUrl = createQueryString({
      ...Object.fromEntries(getMutableParams()),
      limit: currentLimit || String(LIMIT_DEFAULT),
      page: currentPage || String(PAGE_DEFAULT),
      search: currentSearch || "",
      ...ExplorePathName,
    });

    // hindari loop: hanya replace jika berbeda
    const now = `${pathname}${location.search || ""}`;
    if (nextUrl !== now) {
      navigate(nextUrl, { replace: true });
    }
    // dependensi: pathname & location.search cukup untuk detect perubahan URL
  }, [pathname, location.search]);

  const handleChangePage = (page: number) => {
    const url = createQueryString({
      ...Object.fromEntries(getMutableParams()),
      page: String(page),
    });
    navigate(url);
  };

  const handleChangeLimit = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedLimit = e?.target?.value;
    const url = createQueryString({
      ...Object.fromEntries(getMutableParams()),
      limit: selectedLimit,
      page: String(PAGE_DEFAULT),
    });
    navigate(url);
  };

  const handleChangeLimitWithValue = (e: string) => {
    const selectedLimit = e;
    const url = createQueryString({
      ...Object.fromEntries(getMutableParams()),
      limit: selectedLimit,
      page: String(PAGE_DEFAULT),
    });
    navigate(url);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      const search = e.target.value;
      const url = createQueryString({
        ...Object.fromEntries(getMutableParams()),
        search,
        page: String(PAGE_DEFAULT),
      });
      navigate(url);
    }, DELAY);
  };

  const handleClearSearch = () => {
    const url = createQueryString({
      ...Object.fromEntries(getMutableParams()),
      search: "",
      page: String(PAGE_DEFAULT),
    });
    navigate(url);
  };

  const handleChangeCategory = (category: string) => {
    const url = createQueryString({
      ...Object.fromEntries(getMutableParams()),
      category,
      page: String(PAGE_DEFAULT),
    });
    navigate(url);
  };

  const handleChangeIsOnline = (isOnline: string) => {
    const url = createQueryString({
      ...Object.fromEntries(getMutableParams()),
      isOnline,
      page: String(PAGE_DEFAULT),
    });
    navigate(url);
  };

  const handleChangeIsFeatured = (isFeatured: string) => {
    const url = createQueryString({
      ...Object.fromEntries(getMutableParams()),
      isFeatured,
      page: String(PAGE_DEFAULT),
    });
    navigate(url);
  };

  const resetFilterExplore = () => {
    const params = new URLSearchParams();
    params.set("limit", String(LIMIT_DEFAULT));
    params.set("page", String(PAGE_DEFAULT));
    const url = `${pathname}?${params.toString()}`;
    navigate(url);
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
