import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "./helpers/renderWithProviders";
import type { BackupValidation } from "@/core/services/backup.service";

/**
 * Component tests for the admin Backup & Restore view.
 *
 * Strategy: mock `backup.service` so the view renders against deterministic
 * responses. Assert the safety-critical behaviors:
 *  - Restore is disabled until a file is validated AND the dump is valid.
 *  - The restore confirm dialog requires typing the exact phrase.
 *  - Validation report reflects schema/has-data results.
 *  - Backup-now triggers the service.
 *
 * The view mounts under TanStack Router (via renderWithProviders), which paints
 * asynchronously, so every test awaits the first element before interacting.
 */

vi.mock("@/core/services/backup.service", () => ({
  default: {
    validateDump: vi.fn(),
    importDump: vi.fn(),
    runNow: vi.fn(),
  },
}));

import backupService from "@/core/services/backup.service";
import BackupManager from "@/features/dashboard/Backup";

const validateDump = vi.mocked(backupService.validateDump);
const importDump = vi.mocked(backupService.importDump);
const runNow = vi.mocked(backupService.runNow);

const validReport: BackupValidation = {
  ok: true,
  missingTables: [],
  foundTables: ["User", "Portfolio", "BlogPost"],
  hasData: true,
  errors: [],
};

const invalidReport: BackupValidation = {
  ok: false,
  missingTables: ["Portfolio"],
  foundTables: ["User"],
  hasData: false,
  errors: [
    "Dump is missing expected tables: Portfolio.",
    "Dump contains no row data.",
  ],
};

async function selectFile(name = "backup.sql.gz") {
  const input = (await screen.findByLabelText(
    /file backup/i,
  )) as HTMLInputElement;
  const file = new File(["x"], name, { type: "application/gzip" });
  fireEvent.change(input, { target: { files: [file] } });
  return file;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("BackupManager", () => {
  it("disables Restore until a valid dump is validated", async () => {
    renderWithProviders(<BackupManager />);

    const restoreBtn = await screen.findByRole("button", {
      name: /restore database/i,
    });
    expect(restoreBtn).toBeDisabled();

    await selectFile();
    // Still disabled before validation.
    expect(restoreBtn).toBeDisabled();

    validateDump.mockResolvedValue({ data: { data: validReport } } as never);
    fireEvent.click(screen.getByRole("button", { name: /validasi/i }));

    await waitFor(() => expect(restoreBtn).not.toBeDisabled());
    expect(screen.getByText(/siap di-restore/i)).toBeInTheDocument();
  });

  it("keeps Restore disabled when the dump is invalid and shows the report", async () => {
    renderWithProviders(<BackupManager />);
    await selectFile();

    validateDump.mockResolvedValue({ data: { data: invalidReport } } as never);
    fireEvent.click(screen.getByRole("button", { name: /validasi/i }));

    await waitFor(() =>
      expect(screen.getByText(/backup tidak valid/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/Tabel hilang: Portfolio/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /restore database/i }),
    ).toBeDisabled();
  });

  it("requires typing the confirm phrase before restoring", async () => {
    renderWithProviders(<BackupManager />);
    const file = await selectFile();

    validateDump.mockResolvedValue({ data: { data: validReport } } as never);
    fireEvent.click(screen.getByRole("button", { name: /validasi/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /restore database/i }),
      ).not.toBeDisabled(),
    );

    // Open the confirm dialog.
    fireEvent.click(screen.getByRole("button", { name: /restore database/i }));

    const confirmBtn = await screen.findByRole("button", {
      name: /ya, restore sekarang/i,
    });
    expect(confirmBtn).toBeDisabled();

    // Wrong phrase -> still disabled.
    const phraseInput = screen.getByLabelText(/ketik/i);
    fireEvent.change(phraseInput, { target: { value: "restore" } });
    expect(confirmBtn).toBeDisabled();

    // Exact phrase -> enabled, then triggers import.
    fireEvent.change(phraseInput, { target: { value: "RESTORE" } });
    expect(confirmBtn).not.toBeDisabled();

    importDump.mockResolvedValue({
      data: { data: { fileName: file.name, validation: validReport } },
    } as never);
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(importDump).toHaveBeenCalledTimes(1));
    expect(importDump).toHaveBeenCalledWith(file);
  });

  it("triggers an on-demand backup", async () => {
    renderWithProviders(<BackupManager />);
    runNow.mockResolvedValue({
      data: { data: { fileName: "backup-now.sql.gz" } },
    } as never);

    const btn = await screen.findByRole("button", {
      name: /backup & kirim ke telegram/i,
    });
    fireEvent.click(btn);

    await waitFor(() => expect(runNow).toHaveBeenCalledTimes(1));
  });
});
