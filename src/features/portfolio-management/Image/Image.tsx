// src/components/image/Image.tsx
import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  DownloadCloud,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { IPImage } from "@/core/types/image.type";
import useImage from "./useImage";

type Props = {
  className?: string;
};

const LIMIT_OPTIONS = [4, 8, 16, 32, 64, 100] as const;

const Image: React.FC<Props> = ({ className = "" }) => {
  // useImage now exposes currentPage, currentLimit, and handlers
  const {
    dataImage,
    isLoadingImage,
    isRefetchingImage,
    refetchImage,
    currentPage,
    currentLimit,
    handleChangePage,
    handleChangeLimit,
  } = useImage();

  const images: IPImage[] = dataImage?.data ?? [];
  const metadata = dataImage?.metadata;

  const total = metadata?.total ?? 0;
  const totalPages = metadata?.totalPages ?? 1;

  // use current values from hook (fallback to metadata if hook doesn't provide)
  const page =
    typeof currentPage === "number" ? currentPage : metadata?.page ?? 1;
  const limit =
    typeof currentLimit === "number"
      ? currentLimit
      : metadata?.limit ?? LIMIT_OPTIONS[0];

  // Local dialog state
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<IPImage | null>(null);

  const onOpen = (img: IPImage) => {
    setActive(img);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setTimeout(() => setActive(null), 200);
  };

  const onDownload = (img?: IPImage) => {
    if (!img) return;
    window.open(img.url, "_blank");
  };

  // pagination actions using handlers from hook
  const onPrev = () => {
    if (page > 1) {
      handleChangePage(page - 1);
      refetchImage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const onNext = () => {
    if (page < totalPages) {
      handleChangePage(page + 1);
      refetchImage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const onFirst = () => {
    if (page > 1) {
      handleChangePage(1);
      refetchImage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const onLast = () => {
    if (page < totalPages) {
      handleChangePage(totalPages);
      refetchImage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const onChangeLimit = (v: string | "all") => {
    if (v === "all") {
      // set limit to total to represent "all"
      handleChangeLimit(total || 999999);
    } else {
      handleChangeLimit(v as any);
    }
    // reset to page 1 after limit change
    handleChangePage(1);
    refetchImage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // nicer grid sizes depending on limit (optional)
  const colsClass = useMemo(() => {
    if (limit <= 4)
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4";
    if (limit <= 8)
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
  }, [limit]);

  return (
    <div className={`p-4 md:p-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Image Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Elegant previews of your uploaded images — click any image to view
            details.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Show</label>
            <select
              value={currentLimit as string}
              defaultValue={currentLimit as string}
              onChange={handleChangeLimit}
              className="px-3 py-1 border rounded-md bg-transparent text-sm"
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value={total}>All</option>
            </select>
          </div>

          <Button
            variant="ghost"
            onClick={() => refetchImage()}
            disabled={isRefetchingImage || isLoadingImage}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-4 ${colsClass}`}>
        {images.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                No images yet — try uploading some via the upload form.
              </p>
            </CardContent>
          </Card>
        ) : (
          images.map((img) => (
            <Card
              key={img.id}
              className="relative overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full h-48 bg-muted rounded-t-md overflow-hidden">
                <img
                  src={img.url}
                  alt={img.name ?? img.originalFilename ?? img.publicId}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform"
                  loading="lazy"
                  onClick={() => onOpen(img)}
                  style={{ cursor: "zoom-in" }}
                />
              </div>

              <CardContent className="p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-clamp-2">
                    {img.name ?? img.originalFilename ?? "Untitled"}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {img.folder ?? "—"}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {img.tags && img.tags.length > 0 ? (
                      img.tags.slice(0, 2).map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No tags
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => onOpen(img)}>
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(img)}
                  >
                    <DownloadCloud className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <strong>
            {images.length === 0 ? 0 : limit >= total ? total : images.length}
          </strong>{" "}
          of <strong>{total}</strong>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onFirst}
              disabled={page <= 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onPrev}
              disabled={page <= 1}
            >
              Prev
            </Button>
          </div>

          <div className="px-3 text-sm">
            Page <strong>{page}</strong> / <strong>{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onNext}
              disabled={page >= totalPages}
            >
              Next
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onLast}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>
              {active?.name ?? active?.originalFilename ?? "Preview"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 px-2">
            {active ? (
              <div className="w-full flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center justify-center bg-black/5 rounded-md overflow-hidden">
                  <img
                    src={active.url}
                    alt={active.name ?? active?.originalFilename}
                    className="max-h-[70vh] object-contain"
                  />
                </div>

                <aside className="w-full md:w-64">
                  <div className="text-sm">
                    <div className="mb-2">
                      <strong>Folder:</strong> {active.folder ?? "-"}
                    </div>
                    <div className="mb-2">
                      <strong>Format:</strong> {active.format ?? "-"}
                    </div>
                    <div className="mb-2">
                      <strong>Size:</strong>{" "}
                      {active.bytes
                        ? `${Math.round(active.bytes / 1024)} KB`
                        : "-"}
                    </div>

                    <div className="mt-4">
                      <strong>Tags:</strong>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {active.tags && active.tags.length > 0 ? (
                          active.tags.map((t) => <Badge key={t}>{t}</Badge>)
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            No tags
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No image selected
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {active
                ? `Uploaded at: ${
                    active.uploadedAt
                      ? new Date(active.uploadedAt).toLocaleString()
                      : "-"
                  }`
                : ""}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => active && onDownload(active)}
              >
                <DownloadCloud className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Image;
