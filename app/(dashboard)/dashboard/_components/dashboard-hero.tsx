"use client";

import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";

interface DashboardHeroProps {
  totalWalletBalance: number;
  income: number;
  expense: number;
  currency: string;
}

export function DashboardHero({
  totalWalletBalance,
  income,
  expense,
  currency,
}: DashboardHeroProps) {
  const { showAmount } = usePrivacy();
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-900 text-white p-4 sm:p-5 md:p-6 shadow-xl border border-zinc-800 shrink-0">
      {/* Modern Premium Decoration: Mesh Glow & Subtle Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#004C29] via-[#00381e] to-zinc-950 opacity-95" />
      <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[140%] bg-emerald-400/20 blur-[80px] rounded-full animate-pulse" />
      <div className="absolute -bottom-[30%] -left-[10%] w-[50%] h-[120%] bg-emerald-600/20 blur-[80px] rounded-full" />

      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
        }}
      />

      <div className="relative z-10 flex flex-col min-[1366px]:flex-row min-[1366px]:items-center justify-between gap-4 min-[1366px]:gap-6">
        {/* Net Balance (Diambil dari Total Saldo Wallet) */}
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 w-fit whitespace-nowrap shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-green-300 shrink-0" />
            <span className="text-[11px] sm:text-xs text-green-100 font-semibold tracking-wide whitespace-nowrap">
              {t("dashboard.netBalance")}
            </span>
          </div>
          <p className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-black tracking-tight leading-none text-white drop-shadow-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            {showAmount ? (
              formatCurrency(totalWalletBalance, currency)
            ) : (
              <span className="tracking-widest text-[clamp(1.25rem,2.5vw,2rem)]">••••••••</span>
            )}
          </p>
        </div>

        {/* Total In & Out (Responsive 2-column Grid) */}
        <div className="grid grid-cols-2 divide-x divide-white/20 bg-black/30 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/15 shadow-inner w-full min-[1366px]:w-auto min-[1366px]:min-w-[340px] shrink-0">
          {/* Income */}
          <div className="pr-3 sm:pr-4 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-green-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-300" />
              </div>
              <p className="text-[11px] sm:text-xs text-green-200/90 font-medium truncate">
                {t("dashboard.totalIncome")}
              </p>
            </div>
            <p className="text-sm sm:text-base md:text-lg font-bold text-white font-mono tracking-tight leading-snug truncate">
              {showAmount ? formatCurrency(income, currency) : "••••••"}
            </p>
          </div>

          {/* Expense */}
          <div className="pl-3 sm:pl-4 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-red-500/20 flex items-center justify-center shrink-0">
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-300" />
              </div>
              <p className="text-[11px] sm:text-xs text-red-200/90 font-medium truncate">
                {t("dashboard.totalExpense")}
              </p>
            </div>
            <p className="text-sm sm:text-base md:text-lg font-bold text-white font-mono tracking-tight leading-snug truncate">
              {showAmount ? formatCurrency(expense, currency) : "••••••"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
