"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransactionSummary, getTransactions } from "@/app/actions/transaction";
import { getMonthComparison, getMonthlyChart } from "@/app/actions/report";
import { getWallets, getWalletsTotalSummary } from "@/app/actions/wallet";
import { WalletLogo } from "@/components/ui/wallet-logo";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Building2,
  LayoutGrid,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  ChevronRight,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { DashboardCalendar } from "./dashboard-calendar";
import Swal from "sweetalert2";

interface DashboardClientProps {
  initialUser:
    | {
        name?: string | null;
      }
    | undefined;
  isEmailVerified?: boolean;
}

export function DashboardClient({ initialUser, isEmailVerified }: DashboardClientProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const { data: allWorkspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getUserWorkspaces(),
  });

  const activeWs = allWorkspaces.find((w) => w.id === workspaceId);
  const currency = activeWs?.currency ?? "IDR";
  const { showAmount } = usePrivacy();
  const { t, locale } = useLanguage();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["transaction-summary", workspaceId],
    queryFn: () =>
      workspaceId
        ? getTransactionSummary(workspaceId)
        : Promise.resolve({ income: 0, expense: 0, net: 0 }),
    enabled: !!workspaceId,
  });

  const { data: walletSummary } = useQuery({
    queryKey: ["wallets-summary", workspaceId],
    queryFn: () => (workspaceId ? getWalletsTotalSummary(workspaceId) : null),
    enabled: !!workspaceId,
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ["wallets", workspaceId],
    queryFn: () => (workspaceId ? getWallets(workspaceId) : []),
    enabled: !!workspaceId,
  });

  const { data: recentTxResult } = useQuery({
    queryKey: ["transactions", workspaceId, "recent"],
    queryFn: () =>
      workspaceId
        ? getTransactions(workspaceId, { limit: 5 })
        : Promise.resolve({ items: [], total: 0, totalPages: 0 }),
    enabled: !!workspaceId,
  });

  const { data: monthComparison } = useQuery({
    queryKey: ["report-comparison", workspaceId],
    queryFn: () => (workspaceId ? getMonthComparison(workspaceId) : null),
    enabled: !!workspaceId,
  });

  const { data: monthlyChart = [] } = useQuery({
    queryKey: ["report-monthly", workspaceId],
    queryFn: () => (workspaceId ? getMonthlyChart(workspaceId) : []),
    enabled: !!workspaceId,
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("greeting.morning") : hour < 15 ? t("greeting.afternoon") : hour < 18 ? t("greeting.evening") : t("greeting.night");

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId, "recent"] }),
      queryClient.invalidateQueries({ queryKey: ["report-comparison", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["report-monthly", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["calendar-transactions", workspaceId] }),
    ]);
  };

  // No workspace selected
  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-zinc-700 mb-1">{t("dashboard.selectWorkspace")}</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-xs">
          {t("dashboard.selectWorkspaceDesc")}
        </p>
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
          {t("dashboard.viewWorkspace")}
        </Link>
      </div>
    );
  }

  if (isLoading && !summary) {
    return <DashboardSkeleton greeting={greeting} name={initialUser?.name} />;
  }

  const currentSummary = summary ?? { income: 0, expense: 0, net: 0 };
  const totalWalletBalance = walletSummary?.totalBalance ?? currentSummary.net;
  const recentTx = recentTxResult?.items ?? [];
  const comparison = monthComparison;

  // % change income bulan ini vs lalu
  const incomeChange = comparison
    ? comparison.previous.income === 0
      ? null
      : ((comparison.current.income - comparison.previous.income) / comparison.previous.income) * 100
    : null;
  const expenseChange = comparison
    ? comparison.previous.expense === 0
      ? null
      : ((comparison.current.expense - comparison.previous.expense) / comparison.previous.expense) * 100
    : null;

  // Mini bar chart helpers
  const maxIncome = Math.max(...monthlyChart.map((m) => m.income), 1);
  const maxExpense = Math.max(...monthlyChart.map((m) => m.expense), 1);
  const maxVal = Math.max(maxIncome, maxExpense);

  const handleCreateTx = (e: React.MouseEvent) => {
    if (isEmailVerified === false) {
      e.preventDefault();
      Swal.fire({
        title: "Perhatian",
        text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa mencatat transaksi baru. Silakan cek inbox emailmu atau klik Kirim Ulang pada banner di atas.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Mengerti",
        customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" }
      });
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="p-3 md:p-5 max-w-7xl lg:max-w-full mx-auto space-y-3.5 h-[calc(100vh-2rem)] md:h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">

        {/* ── Top Header (Consistent with Wallets & Transactions) ─────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span>{greeting}, {initialUser?.name?.split(" ")[0] ?? t("greeting.friend")}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                {activeWs?.name ?? "..."}
              </span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <Link
            href={`/transactions?workspaceId=${workspaceId}`}
            onClick={handleCreateTx}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Catat Transaksi
          </Link>
        </div>

        {/* ── Hero Balance Card (Extra Grand & Luxurious) ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-6 md:p-8 shadow-xl border border-zinc-800 shrink-0">
          {/* Modern Premium Decoration: Mesh Glow & Subtle Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#004C29] via-[#00381e] to-zinc-950 opacity-95" />
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[140%] bg-emerald-400/20 blur-[80px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[50%] h-[120%] bg-emerald-600/20 blur-[80px] rounded-full" />
          
          <div 
            className="absolute inset-0 opacity-[0.09]" 
            style={{ 
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
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
                {showAmount
                  ? formatCurrency(totalWalletBalance, currency)
                  : <span className="tracking-widest text-3xl md:text-5xl">••••••••</span>}
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
                  {showAmount ? formatCurrency(currentSummary.income, currency) : "••••••"}
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
                  {showAmount ? formatCurrency(currentSummary.expense, currency) : "••••••"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Section: Calendar & Recent Transactions Side-by-Side (Fit 100vh) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0">

          {/* Kalender Keuangan (7/12) */}
          <div className="lg:col-span-7 h-full overflow-y-auto">
            <DashboardCalendar workspaceId={workspaceId} currency={currency} />
          </div>

          {/* Kolom Kanan: Transaksi Terbaru + Quick Wallets (5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 h-full min-h-0 overflow-hidden">
            
            {/* ── 1. Transaksi Terbaru (Atas) ──────────────── */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
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

              <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60 overflow-y-auto flex-1 p-1">
                {recentTx.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-6 text-zinc-400">
                    <ArrowLeftRight className="w-5 h-5 mb-1 opacity-20" />
                    <p className="text-xs">{t("dashboard.noTransactions")}</p>
                    <Link
                      href={`/transactions?workspaceId=${workspaceId}`}
                      className="mt-1.5 text-[11px] text-green-600 hover:underline font-medium"
                    >
                      {t("dashboard.recordFirstTransaction")} →
                    </Link>
                  </div>
                ) : (
                  recentTx.slice(0, 4).map((tx) => {
                    const isIncome = tx.type === "INCOME";
                    return (
                      <div key={tx.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 rounded-xl transition-colors">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? "bg-green-50 dark:bg-green-950/60" : "bg-red-50 dark:bg-red-950/60"}`}>
                          {tx.category?.emoji ? (
                            <span className="text-xs">{tx.category.emoji}</span>
                          ) : isIncome ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {tx.note || tx.category?.name || (isIncome ? t("dashboard.pemasukan") : t("dashboard.pengeluaran"))}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {tx.wallet && <span className="font-semibold text-zinc-600 dark:text-zinc-300 mr-1">[{tx.wallet.name}]</span>}
                            {new Date(tx.date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <p className={`text-xs font-bold font-mono shrink-0 tabular-nums ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                          {isIncome ? "+" : "-"}{showAmount ? formatCurrency(tx.amount, currency) : "••••••"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── 2. Quick Wallets (Bawah) ──────────────────── */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col shrink-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Dompet Saya
                </p>
                <Link
                  href={`/wallets?workspaceId=${workspaceId}`}
                  className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 hover:text-green-700 font-semibold transition-colors"
                >
                  Kelola <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-3">
                {wallets.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-zinc-400">Belum ada dompet/rekening terdaftar.</p>
                    <Link
                      href={`/wallets?workspaceId=${workspaceId}`}
                      className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-green-600 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Dompet
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {wallets.slice(0, 4).map((w) => (
                      <Link
                        key={w.id}
                        href={`/wallets?workspaceId=${workspaceId}`}
                        className="group flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-green-300 dark:hover:border-green-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all"
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

          </div>
        </div>

      </div>
    </PullToRefreshWrapper>
  );
}

function DashboardSkeleton({ greeting, name }: { greeting: string; name?: string | null }) {
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <h1 className="text-2xl font-bold text-zinc-900">{greeting}, {name?.split(" ")[0] ?? t("greeting.friend")} 👋</h1>
        <Skeleton className="h-3 w-48 mt-2" />
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-3 h-72 rounded-2xl" />
        <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
      </div>
    </div>
  );
}
