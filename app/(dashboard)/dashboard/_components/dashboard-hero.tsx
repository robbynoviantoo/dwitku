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
    <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-6 md:p-8 shadow-xl border border-zinc-800 shrink-0">
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

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Net Balance (Extra Large) - Diambil dari Total Saldo Wallet */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            <Sparkles className="w-4 h-4 text-green-300" />
            <span className="text-xs md:text-sm text-green-100 font-semibold tracking-wide">
              {t("dashboard.netBalance")}
            </span>
          </div>
          <p className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white drop-shadow-sm">
            {showAmount ? (
              formatCurrency(totalWalletBalance, currency)
            ) : (
              <span className="tracking-widest text-3xl md:text-5xl">••••••••</span>
            )}
          </p>
        </div>

        {/* Total In & Out (Grand container) */}
        <div className="flex items-center gap-6 sm:gap-12 bg-black/25 backdrop-blur-md px-6 py-4 md:py-5 rounded-2xl border border-white/20 shadow-2xl">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-green-300" />
              </div>
              <p className="text-xs text-green-200 font-semibold">{t("dashboard.totalIncome")}</p>
            </div>
            <p className="text-lg md:text-2xl font-extrabold text-white font-mono leading-tight">
              {showAmount ? formatCurrency(income, currency) : "••••••"}
            </p>
          </div>

          <div className="w-[1px] h-12 bg-white/20" />

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-red-300" />
              </div>
              <p className="text-xs text-red-200 font-semibold">{t("dashboard.totalExpense")}</p>
            </div>
            <p className="text-lg md:text-2xl font-extrabold text-white font-mono leading-tight">
              {showAmount ? formatCurrency(expense, currency) : "••••••"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
