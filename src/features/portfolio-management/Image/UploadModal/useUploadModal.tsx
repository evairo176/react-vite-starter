import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosProgressEvent } from "axios";

import imageService from "@/core/services/image.service";

export interface UploadResultItem {
  id?: string;
  publicId?: string;
  url?: string;
  secureUrl?: string;
  originalFilename?: string;
}

export interface UploadResultError {
  index: number;
  message: string;
}

interface UseUploadModalParams {
  onSuccess?: () => void;
}

const useUploadModal = ({ onSuccess }: UseUploadModalParams = {}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string>("");
  const [folder, setFolder] = useState<string>("portfolio");
  const [tags, setTags] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<{
    created: UploadResultItem[];
    errors: UploadResultError[];
  } | null>(null);

  const reset = () => {
    setFiles([]);
    setUrls("");
    setFolder("portfolio");
    setTags("");
    setName("");
    setProgress(0);
    setResults(null);
  };

  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) {
      toast.error("Only image files are allowed");
      return;
    }
    setFiles((prev) => {
      // dedupe by name+size
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const merged = [...prev];
      for (const f of arr) {
        const key = `${f.name}-${f.size}`;
        if (!seen.has(key)) {
          merged.push(f);
          seen.add(key);
        }
      }
      return merged;
    });
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const parsedUrls = () =>
    urls
      .split(/\r?\n|,/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

  const parsedTags = () =>
    tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

  const totalItems = files.length + parsedUrls().length;

  const mutation = useMutation({
    mutationFn: async () => {
      const urlList = parsedUrls();
      const tagList = parsedTags();

      if (files.length === 0 && urlList.length === 0) {
        throw new Error("Please add at least one file or URL");
      }

      const formData = new FormData();

      // backend multer expects fieldname "portfolio_files" (see multer.ts fileFields)
      files.forEach((file) => {
        formData.append("portfolio_files", file);
      });

      urlList.forEach((u) => {
        formData.append("imageUrls[]", u);
      });

      if (folder && folder.trim() !== "") {
        formData.append("folder", folder.trim());
      }

      tagList.forEach((t) => {
        formData.append("tags[]", t);
      });

      if (name && name.trim() !== "") {
        formData.append("name", name.trim());
      }

      const onUploadProgress = (e: AxiosProgressEvent) => {
        if (!e.total) return;
        const pct = Math.round((e.loaded * 100) / e.total);
        setProgress(pct);
      };

      const res = await imageService.create(formData, onUploadProgress);
      return res.data;
    },
    onSuccess: (data) => {
      const created = data?.data?.created ?? [];
      const errors = data?.data?.errors ?? [];
      setResults({ created, errors });

      if (created.length > 0) {
        toast.success(
          `${created.length} image${created.length > 1 ? "s" : ""} uploaded${
            errors.length > 0 ? `, ${errors.length} failed` : ""
          }`,
        );
      } else if (errors.length > 0) {
        toast.error(`Upload failed: ${errors.length} error(s)`);
      }

      onSuccess?.();
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Upload failed";
      toast.error(message);
    },
  });

  return {
    // state
    files,
    urls,
    folder,
    tags,
    name,
    progress,
    results,
    totalItems,
    isUploading: mutation.isPending,
    // setters
    setUrls,
    setFolder,
    setTags,
    setName,
    // actions
    addFiles,
    removeFile,
    reset,
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
  };
};

export default useUploadModal;
