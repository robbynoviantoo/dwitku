"use client";

import { TrendingUp, TrendingDown, Wallet, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface TransactionsSummaryBarProps {
  income: number;
  expense: number;
  net: number;
  currency: string;
  showAmount: boolean;
  isLoading: boolean;
}

export function TransactionsSummaryBar({
  income,
  expense,
  net,
  currency,
  showAmount,
  isLoading,
}: TransactionsSummaryBarProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3.5 shrink-0">
      {/* Total Masuk */}
      <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
        <div className="w-7 h-7 sm:w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/60 flex items-center justify-center shrink-0">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t("dashboard.totalIncome")}
          </p>
          <p className="text-[11px] sm:text-sm font-extrabold font-mono text-green-600 dark:text-green-400 truncate tabular-nums leading-tight">
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin mt-0.5" />
            ) : showAmount ? (
              formatCurrency(income, currency)
            ) : (
              "••••••"
            )}
          </p>
        </div>
      </div>

      {/* Total Keluar */}
      <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
        <div className="w-7 h-7 sm:w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center shrink-0">
          <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            {t("dashboard.totalExpense")}
          </p>
          <p className="text-[11px] sm:text-sm font-extrabold font-mono text-red-500 dark:text-red-400 truncate tabular-nums leading-tight">
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin mt-0.5" />
            ) : showAmount ? (
              formatCurrency(expense, currency)
            ) : (
              "••••••"
            )}
          </p>
        </div>
      </div>

      {/* Selisih Bersih (Net Diff) */}
      <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
        <div
          className={`w-7 h-7 sm:w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            net >= 0
              ? "bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400"
              : "bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400"
          }`}
        >
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
            Selisih
          </p>
          <p
            className={`text-[11px] sm:text-sm font-extrabold font-mono truncate tabular-nums leading-tight ${
              net >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin mt-0.5" />
            ) : showAmount ? (
              `${net >= 0 ? "+" : ""}${formatCurrency(net, currency)}`
            ) : (
              "••••••"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
