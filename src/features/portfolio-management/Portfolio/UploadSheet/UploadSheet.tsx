import React, { useCallback, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  ImagePlus,
  Link as LinkIcon,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import useUploadModal from "@/features/portfolio-management/Image/UploadModal/useUploadModal";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploaded?: () => void;
  /** default cloudinary folder, defaults to "portfolio" */
  defaultFolder?: string;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const UploadSheet: React.FC<Props> = ({
  open,
  onOpenChange,
  onUploaded,
  defaultFolder = "portfolio",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    files,
    urls,
    folder,
    tags,
    name,
    progress,
    results,
    totalItems,
    isUploading,
    setUrls,
    setFolder,
    setTags,
    setName,
    addFiles,
    removeFile,
    reset,
    submit,
  } = useUploadModal({
    onSuccess: () => onUploaded?.(),
  });

  // ensure initial folder reflects the prop
  React.useEffect(() => {
    if (open) {
      setFolder(defaultFolder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = (v: boolean) => {
    if (isUploading) return;
    if (!v) reset();
    onOpenChange(v);
  };

  const onPickFiles = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Bulk Upload Portfolio Images
          </SheetTitle>
          <SheetDescription>
            Drop multiple images or paste image URLs. All items are uploaded to
            Cloudinary and saved to the gallery.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Drop zone */}
          <div
            onClick={onPickFiles}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`group relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={onFileChange}
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <ImagePlus className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-sm font-medium">
                Click or drag &amp; drop images here
              </div>
              <div className="text-xs text-muted-foreground">
                PNG, JPG, WEBP, GIF — multiple files supported
              </div>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">
                Selected files{" "}
                <span className="text-muted-foreground">({files.length})</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {files.map((f, idx) => {
                  const preview = URL.createObjectURL(f);
                  return (
                    <div
                      key={`${f.name}-${idx}`}
                      className="relative rounded-md border overflow-hidden bg-muted/40"
                    >
                      <img
                        src={preview}
                        alt={f.name}
                        className="w-full h-24 object-cover"
                        onLoad={() => URL.revokeObjectURL(preview)}
                      />
                      <div className="px-2 py-1.5">
                        <div className="text-xs truncate" title={f.name}>
                          {f.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatBytes(f.size)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        disabled={isUploading}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* URL input */}
          <div className="space-y-2">
            <Label
              htmlFor="portfolio-image-urls"
              className="text-sm flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" /> Or paste image URLs (one per
              line)
            </Label>
            <Textarea
              id="portfolio-image-urls"
              placeholder="https://example.com/image-1.jpg&#10;https://example.com/image-2.png"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              disabled={isUploading}
              rows={3}
            />
          </div>

          {/* Meta fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="portfolio-folder" className="text-sm">
                Folder
              </Label>
              <Input
                id="portfolio-folder"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="portfolio"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="portfolio-name" className="text-sm">
                Name (optional)
              </Label>
              <Input
                id="portfolio-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hero image"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="portfolio-tags" className="text-sm">
                Tags (comma)
              </Label>
              <Input
                id="portfolio-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="hero, banner, dark"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Progress */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading {totalItems} item(s)…</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Result summary */}
          {results && (
            <div className="rounded-md border p-3 space-y-2 bg-muted/30">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {results.created.length} success
                    {results.created.length !== 1 ? "es" : ""}
                  </span>
                </div>
                {results.errors.length > 0 && (
                  <div className="flex items-center gap-1.5 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span>{results.errors.length} failed</span>
                  </div>
                )}
              </div>

              {results.errors.length > 0 && (
                <div className="text-xs text-red-600 space-y-1 max-h-24 overflow-y-auto">
                  {results.errors.map((er, i) => (
                    <div key={i}>
                      <Badge variant="destructive" className="mr-1">
                        #{er.index + 1}
                      </Badge>
                      {er.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t flex-row gap-2 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isUploading}
          >
            {results ? "Close" : "Cancel"}
          </Button>
          {!results && (
            <Button
              type="button"
              onClick={() => submit()}
              disabled={isUploading || totalItems === 0}
              className="min-w-32"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {totalItems > 0 ? `(${totalItems})` : ""}
                </>
              )}
            </Button>
          )}
          {results && (
            <Button type="button" onClick={() => reset()}>
              Upload more
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UploadSheet;
