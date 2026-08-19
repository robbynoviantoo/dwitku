"use client";

import { ChevronLeft, ChevronRight, Pencil, Trash2, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, ArrowRight } from "lucide-react";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { WalletLogo } from "@/components/ui/wallet-logo";

interface TransactionsMobileListProps {
  items: any[];
  total: number;
  page: number;
  totalPages: number;
  currency: string;
  canEdit: boolean;
  isPlaceholderData: boolean;
  isPendingDelete: boolean;
  onPageChange: (newPage: number) => void;
  onEdit: (tx: any) => void;
  onDelete: (tx: any) => void;
}

export function TransactionsMobileList({
  items,
  total,
  page,
  totalPages,
  currency,
  canEdit,
  isPlaceholderData,
  isPendingDelete,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionsMobileListProps) {
  const { showAmount } = usePrivacy();

  return (
    <div
      className={cn(
        "md:hidden flex flex-col flex-1 min-h-0 overflow-y-auto space-y-2.5 pb-16",
        (isPlaceholderData || isPendingDelete) &&
          "opacity-50 pointer-events-none transition-opacity"
      )}
    >
      {items.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6">
          <p className="text-xs font-medium">Tidak ada transaksi ditemukan.</p>
        </div>
      ) : (
        items.map((tx) => {
          const isTransfer = tx.type === "TRANSFER";
          const isIncome = tx.type === "INCOME";
          return (
            <div
              key={tx.id}
              className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-3.5 space-y-2.5"
            >
              {/* Top row: Category info & Amount */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                      isTransfer
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                        : isIncome
                        ? "bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400"
                    }`}
                  >
                    {isTransfer ? (
                      <ArrowRightLeft className="w-4 h-4" />
                    ) : tx.category?.emoji ? (
                      <span>{tx.category.emoji}</span>
                    ) : isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {isTransfer ? (tx.note || "Pindah Saldo") : (tx.note || tx.category?.name || "Transaksi")}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {formatDateShort(tx.date)}
                    </p>
                  </div>
                </div>

                <p
                  className={`text-xs font-extrabold font-mono shrink-0 tabular-nums ${
                    isTransfer
                      ? "text-blue-600 dark:text-blue-400"
                      : isIncome
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {isTransfer ? "" : isIncome ? "+" : "-"}
                  {showAmount ? formatCurrency(tx.amount, currency) : "••••••"}
                </p>
              </div>

              {/* Bottom row: Wallet badge, user avatar, action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#21262d]/80">
                <div className="flex items-center gap-1.5 min-w-0">
                  {isTransfer ? (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                        <WalletLogo providerCode={tx.wallet?.providerCode} size="sm" />
                        <span className="truncate max-w-[65px]">{tx.wallet?.name ?? "-"}</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                        <WalletLogo providerCode={tx.toWallet?.providerCode} size="sm" />
                        <span className="truncate max-w-[65px]">{tx.toWallet?.name ?? "-"}</span>
                      </span>
                    </div>
                  ) : tx.wallet ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                      <WalletLogo providerCode={tx.wallet.providerCode} size="sm" />
                      <span className="truncate max-w-[100px]">{tx.wallet.name}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">-</span>
                  )}
                  <span className="text-[10px] text-zinc-400 truncate">
                    {tx.createdBy?.name}
                  </span>
                </div>

                {canEdit && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tx)}
                      className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Sticky Bottom-Center Mobile Pagination */}
      {totalPages > 1 && (
        <div className="sticky bottom-3 left-0 right-0 z-20 flex items-center justify-center pt-2 pb-1">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border border-slate-200 dark:border-[#21262d] shadow-lg">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isPlaceholderData}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#21262d] text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tabular-nums px-1">
              {page} <span className="text-zinc-400 font-normal">/</span> {totalPages}
            </span>

            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isPlaceholderData}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#21262d] text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
