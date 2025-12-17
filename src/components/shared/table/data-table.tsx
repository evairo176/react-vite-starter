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
  getSortedRowModel,
  type SortingState,
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
  Inbox
} from "lucide-react";

import * as XLSX from "xlsx";
import { LIMIT_DEFAULT, LIMIT_LIST } from "./list.constant";

import { renderToStaticMarkup } from "react-dom/server";
import useChangeUrl from "@/hooks/useChangeUrl";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [sorting, setSorting] = useState<SortingState>([]);
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
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4">
        <div className="flex w-full max-w-sm items-center relative gap-2">
          <Input
            onChange={handleSearch}
            type="text"
            placeholder="Search records..."
            className="pr-10 h-10 shadow-sm bg-background border-muted-foreground/20 focus-visible:ring-primary/20"
            defaultValue={currentSearch || ""}
          />
          <Search className="w-4 h-4 absolute text-muted-foreground right-3" />
        </div>

        {data?.length > 0 && (
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
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
                    className="cursor-pointer shadow-sm border-muted-foreground/20"
                    size="sm"
                  >
                    Action ({table.getFilteredSelectedRowModel().rows.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
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
                      <SquareCheckBig className="w-4 h-4 mr-2" />
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
                      className="cursor-pointer"
                    >
                      <Tooltip>
                        <TooltipTrigger className="flex items-center cursor-pointer w-full">
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
              className="cursor-pointer shadow-sm"
              size="sm"
            >
              {isExporting && <Dot className="h-8 w-8 animate-bounce" />}
              {!isExporting && <FileSpreadsheet className="h-4 w-4 mr-2" />}
              <span>Export</span>
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing || isLoading}
              className="cursor-pointer shadow-sm border-muted-foreground/20"
              size="sm"
            >
              <RefreshCcw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              <span>Refresh</span>
            </Button>
            {addNewButtonTitle && (
              <Button disabled={isLoading} size="sm" className="shadow-sm">{addNewButtonTitle}</Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap h-11 text-xs font-semibold uppercase tracking-wider ">
                    {header.isPlaceholder ? null : (
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
              // Skeleton Loading
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className="h-16">
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                      <Skeleton className="h-5 w-full rounded-md bg-muted/50" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const original = row.original as any;
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn("transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", {
                      "bg-indigo-500/10 hover:bg-indigo-500/20":
                        rowColored === "plot" &&
                        original.verifyStatus === "MANUAL",
                      "bg-amber-500/10 hover:bg-amber-500/20":
                        rowColored === "plot" &&
                        original.verifyStatus === "MANUAL" &&
                        original.complianceStatus === "NON_COMPLIANT",
                    })}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
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
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <div className="bg-muted/30 p-4 rounded-full">
                      <Inbox className="h-8 w-8 opacity-50" />
                    </div>
                    <span className="font-medium">No results found</span>
                    <span className="text-xs text-muted-foreground/70 max-w-xs">
                      Try adjusting your search or filter to find what you're looking for.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="hidden sm:block flex-1 text-sm text-muted-foreground">
            {totalData > 0 ? (
              <span className="bg-muted/30 px-2 py-1 rounded-md text-xs">
                Showing <span className="font-medium text-foreground">{table.getRowModel().rows.length}</span> of <span className="font-medium text-foreground">{totalData}</span>
              </span>
            ) : (
              ""
            )}
          </div>

          {/* Pagination hanya tampil kalau data lebih banyak dari satu halaman */}
          <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground hidden sm:inline-block">Rows per page</span>
              <Select
                value={`${paginationState.pageSize}`}
                defaultValue={`${LIMIT_DEFAULT}`}
                onValueChange={(value) => {
                  handleChangeLimitWithValue(value);
                }}
              >
                <SelectTrigger className="h-8 w-[70px] bg-background border-muted-foreground/20">
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

            {totalData > limit && (
              <Pagination className="justify-end w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      size="sm"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) handleChangePage(page - 1);
                      }}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Angka + Ellipsis - Hidden on small screens if too many */}
                  <div className="hidden sm:flex items-center">
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
                  </div>

                  {/* Mobile simplified page indicator */}
                  <div className="sm:hidden flex items-center px-2 text-sm">
                    Page {page}
                  </div>

                  <PaginationItem>
                    <PaginationNext
                      size="sm"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) handleChangePage(page + 1);
                      }}
                      className={
                        page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
