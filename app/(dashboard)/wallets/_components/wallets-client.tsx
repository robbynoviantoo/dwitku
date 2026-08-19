"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWallets, deleteWallet, getWalletsTotalSummary, WalletWithBalance } from "@/app/actions/wallet";
import { WalletLogo } from "@/components/ui/wallet-logo";
import { WalletFormDialog } from "./wallet-form-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";
import {
  Plus,
  CreditCard,
  Building2,
  Wallet as WalletIcon,
  Banknote,
  Pencil,
  Trash2,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  User,
  Hash,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";

interface Props {
  workspaceId: string;
  currency: string;
  canEdit: boolean;
  isEmailVerified?: boolean;
}

export function WalletsClient({ workspaceId, currency, canEdit, isEmailVerified }: Props) {
  const queryClient = useQueryClient();
  const { showAmount } = usePrivacy();
  const { t } = useLanguage();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletWithBalance | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: (walletId: string) => deleteWallet(walletId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["wallets-summary", workspaceId] });
      Swal.fire({
        title: "Berhasil",
        text: "Dompet berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
      });
    },
  });

  const handleDelete = (wallet: WalletWithBalance) => {
    Swal.fire({
      title: t("wallets.deleteConfirmTitle"),
      text: `${t("wallets.deleteConfirmText")} ("${wallet.name}")`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
    }).then((res) => {
      if (res.isConfirmed) {
        deleteMutation.mutate(wallet.id);
      }
    });
  };

  const handleOpenAdd = () => {
    if (isEmailVerified === false) {
      Swal.fire({
        title: "Perhatian",
        text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa menambah dompet.",
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

  const totalBalance = summary?.totalBalance ?? 0;

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Top Header ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
              {t("wallets.title")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t("wallets.subtitle")}
            </p>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-2xl shadow-md transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              {t("wallets.addNew")}
            </button>
          )}
        </div>

        {/* ── Total Net Wealth Hero Banner ───────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-6 md:p-8 shadow-xl border border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-800 to-zinc-950 opacity-90" />
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[120%] bg-emerald-400/20 blur-[80px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[90%] bg-green-500/20 blur-[80px] rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-green-300" />
                <span className="text-xs text-green-100 font-semibold tracking-wide">
                  {t("wallets.totalNetWealth")}
                </span>
              </div>
              <p className="text-3xl md:text-5xl font-black tracking-tight text-white font-mono">
                {showAmount ? formatCurrency(totalBalance, currency) : "••••••••••••"}
              </p>
              <p className="text-xs text-green-200/80 mt-1">
                Akumulasi dari {wallets.length} dompet/rekening aktif
              </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 bg-black/25 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 shadow-inner">
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

        {/* ── Wallets Grid ───────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 rounded-3xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
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
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
              >
                + {t("wallets.addNew")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {wallets.map((w) => {
              return (
                <div
                  key={w.id}
                  className="relative group rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between p-5"
                >
                  {/* Subtle top brand accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: w.color || "#16a34a" }}
                  />

                  {/* Top Card Info */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <WalletLogo providerCode={w.providerCode} size="lg" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">
                              {w.name}
                            </h3>
                            {w.isDefault && (
                              <span className="px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-[10px] font-bold">
                                {t("wallets.default")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 capitalize">
                            {w.type.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {canEdit && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(w)}
                            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                            title="Edit Dompet"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(w)}
                            className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-600 transition-colors"
                            title="Hapus Dompet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Holder & Account Details */}
                    <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 mb-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {t("wallets.accountHolder")}
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
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
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    <p className="text-[11px] font-medium text-zinc-400 mb-0.5">
                      {t("wallets.currentBalance")}
                    </p>
                    <div className="flex items-baseline justify-between">
                      <p
                        className={cn(
                          "text-xl font-extrabold font-mono tracking-tight",
                          w.currentBalance >= 0
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-red-500 dark:text-red-400"
                        )}
                      >
                        {showAmount ? formatCurrency(w.currentBalance, currency) : "••••••••"}
                      </p>
                      <span className="text-[10px] text-zinc-400">
                        {w.transactionsCount} Transaksi
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
