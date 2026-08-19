"use client";

import Link from "next/link";
import { ArrowLeftRight, ChevronRight, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";
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
  toWallet?: {
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
  const displayItems = transactions.slice(0, 6);

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between shrink-0">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t("dashboard.recentTransactions")}
            </h2>
            <p className="text-[11px] text-zinc-400">
              {t("dashboard.latestTransactions")}
            </p>
          </div>
          <Link
            href={`/transactions?workspaceId=${workspaceId}`}
            className="text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 flex items-center gap-0.5"
          >
            {t("dashboard.viewAll")}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {displayItems.length === 0 ? (
          <div className="py-6 text-center text-zinc-400">
            <ArrowLeftRight className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
            <p className="text-xs font-medium">{t("dashboard.noTransactions")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayItems.map((tx) => {
              const isTransfer = tx.type === "TRANSFER";
              const isIncome = tx.type === "INCOME";
              const amt = Number(tx.amount);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 rounded-xl transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isTransfer
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                        : isIncome
                        ? "bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400"
                    }`}
                  >
                    {isTransfer ? (
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    ) : tx.category?.emoji ? (
                      <span className="text-xs">{tx.category.emoji}</span>
                    ) : isIncome ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                      {isTransfer
                        ? tx.note || "Transfer Saldo"
                        : tx.note ||
                          tx.category?.name ||
                          (isIncome
                            ? t("dashboard.pemasukan")
                            : t("dashboard.pengeluaran"))}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5 leading-tight">
                      {isTransfer && tx.wallet && tx.toWallet ? (
                        <span className="font-semibold text-zinc-600 dark:text-zinc-300 mr-1">
                          [{tx.wallet.name} → {tx.toWallet.name}]
                        </span>
                      ) : tx.wallet ? (
                        <span className="font-semibold text-zinc-600 dark:text-zinc-300 mr-1">
                          [{tx.wallet.name}]
                        </span>
                      ) : null}
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
                      isTransfer
                        ? "text-blue-600 dark:text-blue-400"
                        : isIncome
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {isTransfer ? "" : isIncome ? "+" : "-"}
                    {showAmount ? formatCurrency(amt, currency) : "••••••"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
