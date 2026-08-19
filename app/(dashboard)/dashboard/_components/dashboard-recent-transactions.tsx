"use client";

import Link from "next/link";
import { ArrowLeftRight, ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";

interface TransactionItem {
  id: string;
  type: string;
  amount: number | string;
  date: Date | string;
  note?: string | null;
  category?: {
    name: string;
    emoji: string;
  } | null;
  wallet?: {
    name: string;
    providerCode?: string | null;
  } | null;
}

interface DashboardRecentTransactionsProps {
  transactions: TransactionItem[];
  workspaceId: string;
  currency: string;
}

export function DashboardRecentTransactions({
  transactions,
  workspaceId,
  currency,
}: DashboardRecentTransactionsProps) {
  const { showAmount } = usePrivacy();
  const { t, locale } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-[#21262d] shrink-0">
        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-1.5">
          <ArrowLeftRight className="w-4 h-4 text-green-600 dark:text-green-400" />
          {t("dashboard.recentTransactions")}
        </p>
        <Link
          href={`/transactions?workspaceId=${workspaceId}`}
          className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 hover:text-green-700 font-semibold transition-colors"
        >
          {t("dashboard.viewAll")} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-[#21262d]/80 overflow-y-auto flex-1 p-1">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-400">
            <ArrowLeftRight className="w-6 h-6 mb-1.5 opacity-20" />
            <p className="text-xs">{t("dashboard.noTransactions")}</p>
            <Link
              href={`/transactions?workspaceId=${workspaceId}`}
              className="mt-2 text-[11px] text-green-600 hover:underline font-medium"
            >
              {t("dashboard.recordFirstTransaction")} →
            </Link>
          </div>
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.type === "INCOME";
            const amt = Number(tx.amount);
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 rounded-xl transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isIncome
                      ? "bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400"
                  }`}
                >
                  {tx.category?.emoji ? (
                    <span className="text-sm">{tx.category.emoji}</span>
                  ) : isIncome ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {tx.note ||
                      tx.category?.name ||
                      (isIncome
                        ? t("dashboard.pemasukan")
                        : t("dashboard.pengeluaran"))}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {tx.wallet && (
                      <span className="font-semibold text-zinc-600 dark:text-zinc-300 mr-1.5">
                        [{tx.wallet.name}]
                      </span>
                    )}
                    {new Date(tx.date).toLocaleDateString(
                      locale === "en" ? "en-US" : "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                      }
                    )}
                  </p>
                </div>
                <p
                  className={`text-xs font-bold font-mono shrink-0 tabular-nums ${
                    isIncome
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {showAmount ? formatCurrency(amt, currency) : "••••••"}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
