"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Database,
  Download,
  FileJson,
  FileCode2,
  X,
  CheckCircle2,
  Loader2,
  Server,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DatabaseExportModalProps {
  buttonClassName?: string;
  variant?: "nav" | "button" | "card";
}

export function DatabaseExportModal({
  buttonClassName,
  variant = "nav",
}: DatabaseExportModalProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"json" | "sql">("json");
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/export-database?format=${format}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal mengekspor database.");
      }

      // Get filename from content-disposition header if available
      const disposition = response.headers.get("content-disposition");
      let filename = `dwitku-backup-${new Date().toISOString().slice(0, 10)}.${format}`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // Create a blob and trigger browser download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`Berhasil mengunduh ${filename}`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat mengekspor database.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {variant === "nav" ? (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition-all cursor-pointer",
              buttonClassName
            )}
            title="Backup & Export Database"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Database</span>
          </button>
        ) : variant === "card" ? (
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] hover:border-green-500/50 dark:hover:border-green-500/50 transition-all text-left cursor-pointer group shadow-xs",
              buttonClassName
            )}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Backup / Export Database</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase">
                    Neon Postgres
                  </span>
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Unduh seluruh data tabel aplikasi dalam format JSON atau SQL
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-y-0.5 transition-all" />
          </button>
        ) : (
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm",
              buttonClassName
            )}
          >
            <Database className="w-4 h-4" />
            <span>Export Database</span>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white dark:bg-[#161b22] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 focus:outline-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Export Database Backup</span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Ekspor snapshot seluruh tabel database Neon Postgres Dwitku.
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Format Options */}
          <div className="py-4 space-y-3">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Pilih Format File Backup:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* JSON Option */}
              <div
                onClick={() => setFormat("json")}
                className={cn(
                  "p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2",
                  format === "json"
                    ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileJson className="w-4 h-4" />
                  </div>
                  {format === "json" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>JSON Snapshot</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Rekomendasi
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                    Data terstruktur lengkap beserta metadata, tanggal, dan relasi tabel.
                  </p>
                </div>
              </div>

              {/* SQL Option */}
              <div
                onClick={() => setFormat("sql")}
                className={cn(
                  "p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2",
                  format === "sql"
                    ? "border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileCode2 className="w-4 h-4" />
                  </div>
                  {format === "sql" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    SQL Dump (.sql)
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                    Kumpulan kueri SQL INSERT yang siap dieksekusi di database PostgreSQL.
                  </p>
                </div>
              </div>
            </div>

            {/* Scope info */}
            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 text-xs space-y-2">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Cakupan Data yang Diekspor:</span>
              </div>
              <ul className="grid grid-cols-2 gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                <li>Users & Auth Accounts</li>
                <li>Workspaces & Members</li>
                <li>Wallets & Categories</li>
                <li>Transactions & Transfers</li>
                <li>Sales, HPP & Expenses</li>
                <li>Plans & Subscriptions</li>
              </ul>
            </div>

            {/* Neon Serverless Notice */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Neon Postgres Instant Restore:</span>
                <span className="text-emerald-700/90 dark:text-emerald-300/80 ml-1">
                  Selain unduh file manual, Anda juga dapat menggunakan fitur Branching & Time-Travel Restore langsung di konsol Neon.
                </span>
                <a
                  href="https://console.neon.tech"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 hover:underline mt-1 block"
                >
                  Buka Neon Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Status Feedback */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center justify-between animate-in fade-in">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="font-bold underline ml-2 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </Dialog.Close>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-60 transition-all cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengekspor {format.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh File {format.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
