"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel, // 🆕
  type SortingState, // 🆕
  useReactTable,
} from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import {
  Dot,
  FileSpreadsheet,
  Loader,
  RefreshCcw,
  Save,
  Search,
  SquareCheckBig,
} from "lucide-react";

import * as XLSX from "xlsx";
import { LIMIT_DEFAULT, LIMIT_LIST } from "./list.constant";

import { renderToStaticMarkup } from "react-dom/server";
import useChangeUrl from "@/hooks/useChangeUrl";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- util: HTML -> teks polos
const htmlToText = (html: string) =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // buang style inline kalau ada
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const hideHeader = ["select", "actions"];
// --- ambil judul header persis seperti di UI (leaf headers)
function getExportHeaderTitles(table: any): string[] {
  // ambil baris header paling bawah (leaf level)
  const headerGroups = table.getHeaderGroups();
  const leafRow = headerGroups[headerGroups.length - 1];

  const leafHeaders = leafRow.headers.filter(
    (h: any) =>
      !h.isPlaceholder &&
      h.column.getIsVisible() &&
      !hideHeader.includes(h.column.id) // <--- BUANG kolom select
  );

  return leafHeaders.map((h: any) => {
    // 1) coba render pakai context asli header
    try {
      const node = flexRender(h.column.columnDef.header, h.getContext());
      const html = renderToStaticMarkup(node as any);
      const text = htmlToText(html);
      if (text) return text;
    } catch {
      // lanjut ke fallback
    }
    // 2) fallback yang rapi
    const metaTitle = h.column.columnDef?.meta?.title;
    if (typeof metaTitle === "string" && metaTitle.trim()) return metaTitle;

    const acc = (h.column.columnDef as any)?.accessorKey;
    return acc ?? h.column.id ?? "";
  });
}

// --- kolom leaf terlihat dalam urutan render, untuk nilai sel
function getVisibleLeafColumns(table: any) {
  const headerGroups = table.getHeaderGroups();
  const leafRow = headerGroups[headerGroups.length - 1];

  return leafRow.headers
    .filter(
      (h: any) =>
        !h.isPlaceholder &&
        h.column.getIsVisible() &&
        !hideHeader.includes(h.column.id) // <<< remove column select
    )
    .map((h: any) => h.column);
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalData: number;
  totalPages: number;
  isLoading: boolean;
  refetch: () => void;
  selectAction?: () => void;
  saveToDatabase?: (value: string[]) => void;
  setDataSelected?: (value: string[]) => void;
  addNewButtonTitle?: string;
  verifyData?: boolean;
  rowColored?: string;
  excelName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalData,
  totalPages,
  isLoading,
  refetch,
  addNewButtonTitle = "",
  selectAction,
  saveToDatabase,
  setDataSelected,
  verifyData = false,
  rowColored,
  excelName = "no-title",
}: DataTableProps<TData, TValue>) {
  const {
    currentPage,
    currentLimit,
    handleChangePage,
    handleChangeLimitWithValue,
    handleSearch,
    handleClearSearch,
    currentSearch,
  } = useChangeUrl();
  const [sorting, setSorting] = useState<SortingState>([]); // 🆕
  const page = Math.max(1, Number(currentPage));
  const limit = Math.max(1, Number(currentLimit));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const paginationState = {
    pageIndex: page - 1,
    pageSize: limit,
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination: paginationState,
      sorting, // 🆕
      rowSelection,
    },
    onSortingChange: setSorting, // 🆕
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(), // 🆕
    manualPagination: true, // (tetap server-side paginate)
    onRowSelectionChange: setRowSelection,
  });

  const range = getPaginationRange(page, totalPages, 1, 1);

  // helper buat range angka + ellipsis
  function getPaginationRange(
    current: number,
    total: number,
    siblingCount = 1,
    boundaryCount = 1
  ): Array<number | "…"> {
    const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3;
    if (total <= totalPageNumbers) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const leftSibling = Math.max(current - siblingCount, boundaryCount + 2);
    const rightSibling = Math.min(
      current + siblingCount,
      total - boundaryCount - 1
    );
    const showLeftEllipsis = leftSibling > boundaryCount + 2;
    const showRightEllipsis = rightSibling < total - boundaryCount - 1;

    const pages: Array<number | "…"> = [];
    for (let i = 1; i <= boundaryCount; i++) pages.push(i);
    if (showLeftEllipsis) pages.push("…");
    else for (let i = boundaryCount + 1; i < leftSibling; i++) pages.push(i);
    for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
    if (showRightEllipsis) pages.push("…");
    else
      for (let i = rightSibling + 1; i <= total - boundaryCount; i++)
        pages.push(i);
    for (let i = total - boundaryCount + 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // Export to Excel function
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      // 1) header titles sesuai tampilan tabel
      const headerTitles = getExportHeaderTitles(table);

      // 2) leaf columns terlihat (urutan sama seperti headerTitles)
      const visibleLeafCols = getVisibleLeafColumns(table);

      // 3) baris header Excel: tambahkan "No" di paling kiri (opsional)
      const headerRow = ["No", ...headerTitles];

      // 4) data rows
      const dataRows = table.getRowModel().rows.map((row: any, idx: number) => {
        const no = idx + 1 + (page - 1) * limit;

        const cells = visibleLeafCols.map((col: any) => {
          return row.getValue(col.id) ?? "";
        });
        return [no, ...cells];
      });

      // 5) buat worksheet dari AOA agar header custom dipakai
      const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
      (ws as any)["!cols"] = Array.from({ length: headerRow.length }, () => ({
        wch: 20,
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Export");

      const filename = `${excelName}-export-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.xlsx`;

      setTimeout(() => {
        XLSX.writeFile(wb, filename);
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error("Export failed:", error);
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      refetch();
      handleChangePage(1);
      handleChangeLimitWithValue(LIMIT_DEFAULT);
      handleClearSearch();
      setRowSelection({});
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <div className="flex w-full max-w-xs items-center relative gap-2">
          <Input
            onChange={handleSearch}
            type="text"
            placeholder="Search records..."
            className="pr-[30px]"
            defaultValue={currentSearch || ""}
          />
          <Search className="w-4 h-4 absolute text-muted-foreground right-3" />
        </div>
        {data?.length > 0 && (
          <div className="flex items-center space-x-2">
            {selectAction && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={
                      isLoading
                        ? isLoading
                        : table.getFilteredSelectedRowModel().rows.length > 0
                        ? false
                        : true
                    }
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Action ({table.getFilteredSelectedRowModel().rows.length}{" "}
                    selected)
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  {verifyData && (
                    <DropdownMenuItem
                      onClick={() => {
                        const selectedPlotIds = table
                          .getSelectedRowModel()
                          .rows.map((r: any) => r.original.plotId);
                        if (setDataSelected) setDataSelected(selectedPlotIds);
                        if (selectAction) {
                          selectAction();
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <SquareCheckBig className="w-4 h-4" />
                      <span>
                        Verify Data (
                        {table.getFilteredSelectedRowModel().rows.length} Plot)
                      </span>
                    </DropdownMenuItem>
                  )}

                  {saveToDatabase && (
                    <DropdownMenuItem
                      onClick={() => {
                        const selectedPlotIds = table
                          .getSelectedRowModel()
                          .rows.map((r: any) => r.original.plotId);
                        saveToDatabase!(selectedPlotIds);
                      }}
                    >
                      <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-pointer">
                          <Save className="w-4 h-4 mr-2" />
                          <span>Save to database</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs ">
                            Perhatikan jika anda klik save to database data akan
                            terinsert atau terupdate paling terbaru, <br /> jadi
                            pastikan data sudah valid
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant={"greenOutline"}
              onClick={handleExportExcel}
              disabled={isExporting || isLoading}
              className="cursor-pointer"
            >
              {isExporting && <Dot className="h-8 w-8 animate-bounce" />}
              {!isExporting && <FileSpreadsheet className="h-4 w-4" />}
              <span>Export XLSX</span>
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing || isLoading}
              className="cursor-pointer"
            >
              <RefreshCcw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
              <span>Refresh</span>
            </Button>
            {addNewButtonTitle && (
              <Button disabled={isLoading}>{addNewButtonTitle}</Button>
            )}
          </div>
        )}
      </div>
      <div className="">
        {/* <ScrollArea className="w-full"> */}
        <Table className="relative border border-border ">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {isLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : header.isPlaceholder ? null : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 justify-center">
                      <Loader className="h-7 w-7 animate-spin" />
                      <span>Load data...</span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const original = row.original as any;
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn({
                      "bg-indigo-500 text-white":
                        rowColored === "plot" &&
                        original.verifyStatus === "MANUAL",
                      "bg-amber-500 text-white":
                        rowColored === "plot" &&
                        original.verifyStatus === "MANUAL" &&
                        original.complianceStatus === "NON_COMPLIANT",
                      "hover:bg-indigo-300":
                        rowColored === "plot" &&
                        original.verifyStatus === "MANUAL",
                      "hover:bg-amber-300":
                        rowColored === "plot" &&
                        original.verifyStatus === "MANUAL" &&
                        original.complianceStatus === "NON_COMPLIANT",
                    })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* <ScrollBar orientation="horizontal" />
      </ScrollArea> */}
      </div>

      <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-2 sm:flex-row">
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalData > 0 ? (
              <>
                Showing {table.getRowModel().rows.length} of {totalData} entries
              </>
            ) : (
              "No entries found"
            )}
          </div>
          {/* Pagination hanya tampil kalau data lebih banyak dari satu halaman */}

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              {/* <p className='whitespace-nowrap text-sm font-medium'>
                Rows per page
              </p> */}
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
              )}

              <Select
                value={`${paginationState.pageSize}`}
                defaultValue={`${LIMIT_DEFAULT}`}
                onValueChange={(value) => {
                  handleChangeLimitWithValue(value);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={paginationState.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {LIMIT_LIST.map((limit) => (
                    <SelectItem key={limit.value} value={`${limit.value}`}>
                      {limit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {totalData > limit && (
          <div className="block md:flex w-full items-center justify-center md:justify-between ">
            <div className="flex-1 text-sm text-muted-foreground text-nowrap">
              {totalData > 0 ? (
                <>
                  Page {paginationState.pageIndex + 1} of {table.getPageCount()}
                </>
              ) : (
                "No pages"
              )}
            </div>

            <Pagination className="justify-end">
              <PaginationContent>
                {/* Prev */}
                <PaginationItem>
                  <PaginationPrevious
                    size="sm"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) handleChangePage(page - 1);
                    }}
                    className={
                      page <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Angka + Ellipsis */}
                {range.map((it, idx) =>
                  it === "…" ? (
                    <PaginationItem key={`dots-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={it}>
                      <PaginationLink
                        size="sm"
                        href="#"
                        isActive={it === page}
                        onClick={(e) => {
                          e.preventDefault();
                          if (it !== page) handleChangePage(it);
                        }}
                      >
                        {it}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    size="sm"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) handleChangePage(page + 1);
                    }}
                    className={
                      page >= totalPages ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}
