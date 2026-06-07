import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  DownloadCloud,
  FileArchive,
  Loader2,
  ShieldAlert,
  UploadCloud,
  XCircle,
} from "lucide-react";

import SEO from "@/components/shared/SEO";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import useBackupManager from "./useBackupManager";

const CONFIRM_PHRASE = "RESTORE";

/**
 * Admin Backup & Restore view.
 *
 * Three capabilities, all behind the authenticated dashboard:
 *  - Backup now: dump the DB and deliver it to Telegram on demand.
 *  - Validate: upload a `.sql`/`.sql.gz` dump and preview whether it matches
 *    the current schema and actually carries data (no DB changes).
 *  - Restore: after a successful validation, overwrite the live database from
 *    the dump. Gated behind a type-to-confirm dialog because it is destructive.
 */
export default function BackupManager() {
  const {
    file,
    selectFile,
    validation,
    validate,
    isValidating,
    restore,
    isRestoring,
    backupNow,
    isBackingUp,
  } = useBackupManager();

  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const canRestore = Boolean(file && validation?.ok && !isRestoring);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0] ?? null);
  };

  const openConfirm = () => {
    setConfirmText("");
    setConfirmOpen(true);
  };

  const confirmRestore = () => {
    if (!file) return;
    restore(file, { onSettled: () => setConfirmOpen(false) });
  };

  return (
    <div className="space-y-6">
      <SEO
        title="Backup & Restore"
        description="Back up and restore the portfolio database."
      />

      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Database className="h-7 w-7 text-primary" />
          Backup &amp; Restore
        </h1>
        <p className="text-muted-foreground">
          Create an on-demand backup or restore the database from a dump file.
        </p>
      </div>

      {/* ---- Backup now -------------------------------------------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <DownloadCloud className="h-5 w-5 text-emerald-500" />
            Backup sekarang
          </CardTitle>
          <CardDescription>
            Buat dump database saat ini dan kirim ke Telegram (sama seperti cron
            harian 00:00).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => backupNow()} disabled={isBackingUp}>
            {isBackingUp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Membuat backup...
              </>
            ) : (
              <>
                <DownloadCloud className="h-4 w-4" />
                Backup &amp; kirim ke Telegram
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ---- Restore ----------------------------------------------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <UploadCloud className="h-5 w-5 text-indigo-500" />
            Restore dari file
          </CardTitle>
          <CardDescription>
            Upload file <code>.sql</code> atau <code>.sql.gz</code>. File akan
            divalidasi dulu (cocok dengan schema &amp; ada isinya) sebelum bisa
            di-restore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-file">File backup</Label>
            <Input
              id="backup-file"
              ref={inputRef}
              type="file"
              accept=".sql,.gz,.sql.gz,application/gzip,application/sql"
              onChange={handleFileChange}
            />
            {file && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileArchive className="h-4 w-4" />
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => file && validate(file)}
              disabled={!file || isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memvalidasi...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Validasi
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              onClick={openConfirm}
              disabled={!canRestore}
            >
              <ShieldAlert className="h-4 w-4" />
              Restore database
            </Button>
          </div>

          {/* Validation report */}
          {validation && (
            <ValidationReport validation={validation} />
          )}
        </CardContent>
      </Card>

      {/* ---- Confirm dialog --------------------------------------------- */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Konfirmasi restore
            </DialogTitle>
            <DialogDescription>
              Tindakan ini menimpa SELURUH database saat ini dengan isi dari{" "}
              <span className="font-medium">{file?.name}</span>. Data lama akan
              di-drop dan diganti. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="confirm-phrase">
              Ketik <span className="font-mono font-semibold">{CONFIRM_PHRASE}</span> untuk
              melanjutkan
            </Label>
            <Input
              id="confirm-phrase"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRestore}
              disabled={confirmText !== CONFIRM_PHRASE || isRestoring}
            >
              {isRestoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Ya, restore sekarang"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Renders the schema/has-data validation report with pass/fail styling. */
function ValidationReport({
  validation,
}: {
  validation: NonNullable<ReturnType<typeof useBackupManager>["validation"]>;
}) {
  const schemaOk = validation.missingTables.length === 0;
  return (
    <div
      className={`rounded-lg border p-4 text-sm ${
        validation.ok
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-destructive/40 bg-destructive/5"
      }`}
    >
      <div className="flex items-center gap-2 font-medium">
        {validation.ok ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
        {validation.ok
          ? "Backup valid — siap di-restore"
          : "Backup tidak valid"}
      </div>

      <ul className="mt-3 space-y-1.5">
        <li className="flex items-center gap-2">
          {schemaOk ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          Schema cocok ({validation.foundTables.length} tabel inti terdeteksi)
        </li>
        <li className="flex items-center gap-2">
          {validation.hasData ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
          Ada isi data
        </li>
      </ul>

      {validation.missingTables.length > 0 && (
        <p className="mt-3 text-destructive">
          Tabel hilang: {validation.missingTables.join(", ")}
        </p>
      )}

      {validation.errors.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-muted-foreground">
          {validation.errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
