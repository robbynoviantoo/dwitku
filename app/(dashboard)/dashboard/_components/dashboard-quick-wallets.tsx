"use client";

import Link from "next/link";
import { CreditCard, ChevronRight, Plus } from "lucide-react";
import { WalletLogo } from "@/components/ui/wallet-logo";
import { formatCurrency } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { WalletWithBalance } from "@/app/actions/wallet";

interface DashboardQuickWalletsProps {
  wallets: WalletWithBalance[];
  workspaceId: string;
  currency: string;
}

export function DashboardQuickWallets({
  wallets,
  workspaceId,
  currency,
}: DashboardQuickWalletsProps) {
  const { showAmount } = usePrivacy();
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-[#21262d] shrink-0">
        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
          {t("dashboard.myWallets")}
        </p>
        <Link
          href={`/wallets?workspaceId=${workspaceId}`}
          className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 hover:text-green-700 font-semibold transition-colors"
        >
          {t("dashboard.manage")} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-3">
        {wallets.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-zinc-400">{t("wallets.noWallets")}</p>
            <Link
              href={`/wallets?workspaceId=${workspaceId}`}
              className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-green-600 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> {t("wallets.addNew")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {wallets.slice(0, 4).map((w) => (
              <Link
                key={w.id}
                href={`/wallets?workspaceId=${workspaceId}`}
                className="group flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-[#21262d] hover:border-green-300 dark:hover:border-green-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-all"
              >
                <WalletLogo providerCode={w.providerCode} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {w.name}
                  </p>
                  <p className="text-[11px] font-extrabold font-mono text-zinc-900 dark:text-zinc-100 truncate tabular-nums">
                    {showAmount ? formatCurrency(w.currentBalance, currency) : "••••••"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
