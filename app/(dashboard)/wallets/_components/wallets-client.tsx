"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWallets, getWalletsTotalSummary, deleteWallet, WalletWithBalance } from "@/app/actions/wallet";
import { WalletLogo } from "@/components/ui/wallet-logo";
import { WalletFormDialog } from "./wallet-form-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  User,
  Hash,
} from "lucide-react";
import Swal from "sweetalert2";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";

interface WalletsClientProps {
  workspaceId: string;
  currency: string;
  canEdit: boolean;
  isEmailVerified?: boolean;
}

export function WalletsClient({
  workspaceId,
  currency,
  canEdit,
  isEmailVerified,
}: WalletsClientProps) {
  const { showAmount } = usePrivacy();
  const { t } = useLanguage();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletWithBalance | null>(null);

  // Queries
  const { data: wallets = [], isLoading, refetch } = useQuery({
    queryKey: ["wallets", workspaceId],
    queryFn: () => getWallets(workspaceId),
    enabled: !!workspaceId,
  });

  const { data: summary } = useQuery({
    queryKey: ["wallets-summary", workspaceId],
    queryFn: () => getWalletsTotalSummary(workspaceId),
    enabled: !!workspaceId,
  });

  const handleOpenAdd = () => {
    if (isEmailVerified === false) {
      Swal.fire({
        title: "Perhatian",
        text: "Kamu harus memverifikasi emailmu terlebih dahulu sebelum menambahkan dompet.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Mengerti",
        customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
      });
      return;
    }
    setSelectedWallet(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (wallet: WalletWithBalance) => {
    setSelectedWallet(wallet);
    setFormOpen(true);
  };

  const handleDelete = async (wallet: WalletWithBalance) => {
    const result = await Swal.fire({
      title: t("wallets.deleteConfirmTitle"),
      text: `${t("wallets.deleteConfirmText")} (${wallet.name})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("transactions.yesDelete"),
      cancelButtonText: t("transactions.cancel"),
      reverseButtons: true,
      customClass: {
        popup: "!rounded-2xl !font-[Inter,sans-serif]",
        title: "!text-zinc-900 !text-lg !font-bold",
        htmlContainer: "!text-zinc-500 !text-sm",
        confirmButton: "!rounded-xl !text-sm !font-semibold !px-5 !py-2.5",
        cancelButton: "!rounded-xl !text-sm !font-medium !px-5 !py-2.5",
      },
    });

    if (result.isConfirmed) {
      const res = await deleteWallet(wallet.id, workspaceId);
      if (res.error) {
        Swal.fire("Error", res.error, "error");
      } else {
        refetch();
      }
    }
  };

  const totalBalance = summary?.totalBalance ?? 0;

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
      <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
        {/* ── Top Header ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 tracking-tight">
              <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
              {t("wallets.title")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
              {t("wallets.subtitle")}
            </p>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              {t("wallets.addNew")}
            </button>
          )}
        </div>

        {/* ── Total Net Wealth Hero Banner ───────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-6 md:p-8 border border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-br from-[#004C29] via-[#00381e] to-zinc-950 opacity-95" />
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[120%] bg-emerald-400/15 blur-[80px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[90%] bg-emerald-600/20 blur-[80px] rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-3">
                <Sparkles className="w-4 h-4 text-green-300" />
                <span className="text-xs font-semibold text-green-100 tracking-wide">
                  {t("wallets.totalNetWealth")}
                </span>
              </div>
              <p className="text-3xl md:text-5xl font-black tracking-tight text-white font-mono">
                {showAmount ? formatCurrency(totalBalance, currency) : "••••••••••••"}
              </p>
              <p className="text-xs text-green-200/80 mt-1">
                {t("wallets.accumulated")} {wallets.length} {t("wallets.activeWallets")}
              </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 bg-black/25 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15">
              <div>
                <p className="text-[11px] text-green-200 font-medium">{t("dashboard.totalIncome")}</p>
                <p className="text-sm md:text-base font-bold text-white font-mono">
                  {showAmount ? formatCurrency(summary?.totalIncome ?? 0, currency) : "••••••"}
                </p>
              </div>
              <div className="w-[1px] h-8 bg-white/20" />
              <div>
                <p className="text-[11px] text-red-200 font-medium">{t("dashboard.totalExpense")}</p>
                <p className="text-sm md:text-base font-bold text-white font-mono">
                  {showAmount ? formatCurrency(summary?.totalExpense ?? 0, currency) : "••••••"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Wallets Grid (4 Kolom per Baris & Desain Modern Bersih) ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {t("wallets.noWallets")}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mb-5">
              {t("wallets.createFirst")}
            </p>
            {canEdit && (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                + {t("wallets.addNew")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wallets.map((w) => {
              return (
                <div
                  key={w.id}
                  className="group rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] hover:border-green-600/50 dark:hover:border-green-600/50 transition-all duration-200 flex flex-col justify-between p-4"
                >
                  {/* Top Card Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2.5 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <WalletLogo providerCode={w.providerCode} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {w.name}
                            </h3>
                            {w.isDefault && (
                              <span className="px-1.5 py-0.5 rounded-md bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-[9px] font-bold shrink-0">
                                {t("wallets.default")}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 capitalize">
                            {w.type.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {canEdit && (
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => handleOpenEdit(w)}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                            title={t("wallets.editWallet")}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(w)}
                            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                            title={t("wallets.deleteWallet")}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Holder & Account Details */}
                    <div className="space-y-1 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-[#21262d] mb-3 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {t("wallets.accountHolder")}
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[110px]">
                          {w.holderName || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {t("wallets.accountNumber")}
                        </span>
                        <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                          {showAmount ? (w.accountNumber || "-") : "••••••••"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Section */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-[#21262d]">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                      {t("wallets.currentBalance")}
                    </p>
                    <div className="flex items-baseline justify-between">
                      <p
                        className={cn(
                          "text-base font-extrabold font-mono tracking-tight tabular-nums",
                          w.currentBalance >= 0
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-red-500 dark:text-red-400"
                        )}
                      >
                        {showAmount ? formatCurrency(w.currentBalance, currency) : "••••••••"}
                      </p>
                      <span className="text-[10px] text-zinc-400">
                        {w.transactionsCount} {t("wallets.transactions")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Wallet Modal */}
      {formOpen && (
        <WalletFormDialog
          workspaceId={workspaceId}
          wallet={selectedWallet}
          onClose={() => {
            setFormOpen(false);
            setSelectedWallet(null);
          }}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </PullToRefreshWrapper>
  );
}
