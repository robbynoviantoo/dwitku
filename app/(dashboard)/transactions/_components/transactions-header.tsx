"use client";

import { ArrowLeftRight, Plus, FileSpreadsheet, Lock, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useLanguage } from "@/components/providers/language-provider";

interface TransactionsHeaderProps {
  total: number;
  canExport?: boolean;
  canEdit: boolean;
  isExporting: boolean;
  onExport: () => void;
  onOpenAdd: () => void;
}

export function TransactionsHeader({
  total,
  canExport,
  canEdit,
  isExporting,
  onExport,
  onOpenAdd,
}: TransactionsHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 tracking-tight">
          <ArrowLeftRight className="w-6 h-6 text-green-600 dark:text-green-400" />
          {t("transactions.transactionsHeader")}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
          {total.toLocaleString("id-ID")} {t("transactions.found")}
        </p>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-2">
        {canExport ? (
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex cursor-pointer items-center gap-2 px-3 py-2.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? t("transactions.exporting") : "Export Excel"}
            </span>
          </button>
        ) : (
          <button
            onClick={() =>
              Swal.fire({
                title: "🔒 Fitur Premium",
                html: `<p class="text-zinc-500 text-sm">Export Excel tersedia mulai paket <b>Basic</b>.</p><p class="text-zinc-400 text-xs mt-1">Upgrade sekarang mulai <b>Rp 25.000/bln</b>.</p>`,
                icon: "info",
                confirmButtonText: "Lihat Paket",
                showCancelButton: true,
                cancelButtonText: "Nanti",
                confirmButtonColor: "#004C29",
                customClass: {
                  popup: "!rounded-2xl",
                  confirmButton: "!rounded-xl",
                  cancelButton: "!rounded-xl",
                },
              }).then((r) => {
                if (r.isConfirmed) window.location.href = "/billing";
              })
            }
            className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-zinc-400 hover:text-green-600 dark:hover:text-green-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        )}

        {canEdit && (
          <button
            onClick={onOpenAdd}
            className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t("transactions.add")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
