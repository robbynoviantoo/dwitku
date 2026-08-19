"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  Scale,
  CalendarDays,
  Percent,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface ReportsSummaryCardsProps {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
    savingsRate: number;
    incomeCount: number;
    expenseCount: number;
    totalTransactions: number;
    avgIncome: number;
    avgExpense: number;
    dailyAvgExpense: number;
    dailyAvgIncome: number;
    daySpan: number;
  };
  currency: string;
  showAmount: boolean;
}

export function ReportsSummaryCards({
  summary,
  currency,
  showAmount,
}: ReportsSummaryCardsProps) {
  const { t } = useLanguage();

  const isSurplus = summary.netCashflow >= 0;

  return (
    <div className="space-y-3.5 mb-6">
      {/* ── 1. Top Core Metric Cards (4 Kolom Utama) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Income */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {t("dashboard.totalIncome")}
            </span>
            <div className="w-7 h-7 rounded-xl bg-green-50 dark:bg-green-950/60 flex items-center justify-center text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-extrabold font-mono text-green-600 dark:text-green-400 tracking-tight tabular-nums">
              {showAmount ? formatCurrency(summary.totalIncome, currency) : "••••••••"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {summary.incomeCount} {t("reports.incomeTransactions")}
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {t("dashboard.totalExpense")}
            </span>
            <div className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-500 dark:text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-extrabold font-mono text-red-500 dark:text-red-400 tracking-tight tabular-nums">
              {showAmount ? formatCurrency(summary.totalExpense, currency) : "••••••••"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {summary.expenseCount} {t("reports.expenseTransactions")}
            </p>
          </div>
        </div>

        {/* Net Cashflow (Arus Kas Bersih) */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {t("reports.netCashflow")}
            </span>
            <div
              className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center",
                isSurplus
                  ? "bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400"
              )}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p
              className={cn(
                "text-xl font-extrabold font-mono tracking-tight tabular-nums",
                isSurplus
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              )}
            >
              {showAmount
                ? `${isSurplus ? "+" : ""}${formatCurrency(summary.netCashflow, currency)}`
                : "••••••••"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {isSurplus ? t("reports.surplus") : t("reports.deficit")}
            </p>
          </div>
        </div>

        {/* Savings Rate (Rasio Tabungan) */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {t("reports.savingsRate")}
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p
              className={cn(
                "text-xl font-extrabold font-mono tracking-tight tabular-nums",
                summary.savingsRate >= 20
                  ? "text-green-600 dark:text-green-400"
                  : summary.savingsRate > 0
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-500 dark:text-red-400"
              )}
            >
              {summary.savingsRate}%
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {t("reports.fromIncome")}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Detailed Secondary Statistics (4 Kolom Mini) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Rata-rata Pengeluaran Harian */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              {t("reports.dailyAvg")}
            </p>
            <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 truncate tabular-nums">
              {showAmount ? formatCurrency(summary.dailyAvgExpense, currency) : "••••••"}
            </p>
          </div>
        </div>

        {/* Rata-rata per Transaksi Keluar */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400">
            <Receipt className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              {t("reports.avgExpense")}
            </p>
            <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 truncate tabular-nums">
              {showAmount ? formatCurrency(summary.avgExpense, currency) : "••••••"}
            </p>
          </div>
        </div>

        {/* Rata-rata per Transaksi Masuk */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400">
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              {t("reports.avgIncome")}
            </p>
            <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 truncate tabular-nums">
              {showAmount ? formatCurrency(summary.avgIncome, currency) : "••••••"}
            </p>
          </div>
        </div>

        {/* Total Volume Transaksi */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400">
            <Percent className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              {t("reports.totalActivity")}
            </p>
            <p className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 truncate tabular-nums">
              {summary.totalTransactions} {t("reports.transactions")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
