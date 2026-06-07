import api from "../api/axios";

/**
 * Result of validating a database dump on the backend. `ok` is true only when
 * the dump both matches the current schema (no missing core tables) and
 * carries row data.
 */
export interface BackupValidation {
  ok: boolean;
  missingTables: string[];
  foundTables: string[];
  hasData: boolean;
  errors: string[];
}

/** Payload returned by a successful restore. */
export interface BackupImportResult {
  fileName: string;
  validation: BackupValidation;
}

/**
 * Admin backup/restore data access (all endpoints require JWT). Restore is
 * destructive on the server, so the UI validates first and requires an explicit
 * confirmation before calling `importDump`.
 */
const backupService = {
  /** `POST /backup/validate` — validate an uploaded dump without applying it. */
  validateDump: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<{ status: string; data: BackupValidation }>(
      "/backup/validate",
      form,
    );
  },

  /** `POST /backup/import` — validate then restore the dump (destructive). */
  importDump: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("confirm", "true");
    return api.post<{ status: string; data: BackupImportResult }>(
      "/backup/import",
      form,
    );
  },

  /** `POST /backup/now` — trigger an on-demand backup delivered to Telegram. */
  runNow: async () =>
    api.post<{ status: string; data: { fileName: string } }>("/backup/now"),
};

export default backupService;
