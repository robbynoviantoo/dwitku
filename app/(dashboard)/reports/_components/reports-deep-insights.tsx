"use client";

import { WalletLogo } from "@/components/ui/wallet-logo";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Building2, ArrowUpRight, Flame } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface ReportsDeepInsightsProps {
  topTransactions: any[];
  walletDistribution: any[];
  currency: string;
  showAmount: boolean;
}

export function ReportsDeepInsights({
  topTransactions,
  walletDistribution,
  currency,
  showAmount,
}: ReportsDeepInsightsProps) {
  const { t } = useLanguage();
  const totalWalletExpense = walletDistribution.reduce((acc, w) => acc + w.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── 1. Top 5 Largest Expenses of Selected Period ── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            {t("reports.topExpenses")}
          </h2>
          <span className="text-[10px] font-bold text-zinc-400 uppercase">{t("reports.top5")}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#21262d]/80 flex-1">
          {topTransactions.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 text-xs font-semibold">
              {t("reports.noExpensesPeriod")}
            </div>
          ) : (
            topTransactions.map((tx, idx) => (
              <div
                key={tx.id}
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center text-xs font-black font-mono text-zinc-400">
                    #{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center shrink-0 text-xs">
                    {tx.category?.emoji || "💸"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {tx.note}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {tx.wallet?.name && (
                        <span className="font-semibold text-zinc-600 dark:text-zinc-400 mr-1.5">
                          [{tx.wallet.name}]
                        </span>
                      )}
                      {formatDateShort(tx.date)}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-extrabold font-mono text-red-500 dark:text-red-400 shrink-0 tabular-nums">
                  -{showAmount ? formatCurrency(tx.amount, currency) : "••••••"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── 2. Expense Breakdown by Wallet / Account ── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            {t("reports.byWallet")}
          </h2>
          <span className="text-[10px] font-bold text-zinc-400 uppercase">{t("reports.walletAccount")}</span>
        </div>

        <div className="space-y-3 flex-1">
          {walletDistribution.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 text-xs font-semibold">
              {t("reports.noWalletData")}
            </div>
          ) : (
            walletDistribution.map((w) => {
              const pct = totalWalletExpense > 0 ? Math.round((w.value / totalWalletExpense) * 100) : 0;
              return (
                <div key={w.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <WalletLogo providerCode={w.providerCode} size="sm" />
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {w.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-zinc-500 font-bold text-[11px]">
                        {showAmount ? formatCurrency(w.value, currency) : "••••••"}
                      </span>
                      <span className="text-xs font-black text-green-600 dark:text-green-400 w-9 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#004C29] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
