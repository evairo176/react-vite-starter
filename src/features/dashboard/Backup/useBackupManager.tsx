import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import backupService, {
  type BackupValidation,
} from "@/core/services/backup.service";
import { errorCallback } from "@/core/utils/tanstack-callback";

/**
 * Data orchestration for the Admin Backup & Restore view.
 *
 * Holds the currently selected dump file and its validation report, and owns
 * three mutations:
 *   - validate: preview a dump (schema match + has-data) without touching the DB
 *   - restore: validate then overwrite the DB from the dump (destructive)
 *   - backupNow: trigger an on-demand backup delivered to Telegram
 *
 * Selecting a new file clears any prior validation so the UI can never restore
 * a file that hasn't been validated in its current selection.
 */
const useBackupManager = () => {
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<BackupValidation | null>(null);

  const selectFile = (next: File | null) => {
    setFile(next);
    setValidation(null);
  };

  // ---- Validate (safe, no DB changes) -------------------------------------
  const { mutate: validate, isPending: isValidating } = useMutation({
    mutationFn: (f: File) => backupService.validateDump(f),
    onSuccess: (response) => {
      const data = response.data?.data;
      setValidation(data ?? null);
      if (data?.ok) {
        toast.success("Backup valid — siap di-restore");
      } else {
        toast.error("Backup tidak valid. Cek detail di bawah.");
      }
    },
    onError: (error: unknown) => {
      setValidation(null);
      toast.error(errorCallback(error).message);
    },
  });

  // ---- Restore (DESTRUCTIVE) ----------------------------------------------
  const { mutate: restore, isPending: isRestoring } = useMutation({
    mutationFn: (f: File) => backupService.importDump(f),
    onSuccess: (response) => {
      const data = response.data?.data;
      toast.success(
        `Database berhasil di-restore dari ${data?.fileName ?? "backup"}`,
      );
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  // ---- Backup now -> Telegram ---------------------------------------------
  const { mutate: backupNow, isPending: isBackingUp } = useMutation({
    mutationFn: () => backupService.runNow(),
    onSuccess: (response) => {
      const data = response.data?.data;
      toast.success(
        `Backup dibuat & dikirim ke Telegram (${data?.fileName ?? "ok"})`,
      );
    },
    onError: (error: unknown) => {
      toast.error(errorCallback(error).message);
    },
  });

  return {
    file,
    selectFile,
    validation,
    validate,
    isValidating,
    restore,
    isRestoring,
    backupNow,
    isBackingUp,
  };
};

export default useBackupManager;
