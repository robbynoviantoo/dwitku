"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransactionSummary, getTransactions } from "@/app/actions/transaction";
import { getMonthComparison, getMonthlyChart } from "@/app/actions/report";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  LayoutGrid,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  ChevronRight,
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

        {/* ── Compact Header ─────────────────────────── */}
        <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-zinc-900 leading-tight">
              {greeting}, {initialUser?.name?.split(" ")[0] ?? t("greeting.friend")} 👋
              <span className="text-xs font-normal text-zinc-500 ml-2">
                • <span className="font-medium text-green-600">"{activeWs?.name ?? "..."}"</span>
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">{t("dashboard.subtitle")}</p>
          </div>
          <Link
            href={`/transactions?workspaceId=${workspaceId}`}
            onClick={handleCreateTx}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Catat Transaksi
          </Link>
        </div>

        {/* ── Hero Balance Card (Extra Grand & Luxurious) ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-200 text-white p-6 md:p-8 shadow-xl border border-white/10 shrink-0">
          {/* Modern Premium Decoration: Mesh Glow & Subtle Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-950 opacity-95" />
          <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[140%] bg-emerald-400/30 blur-[80px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[50%] h-[120%] bg-green-500/30 blur-[80px] rounded-full" />
          
          <div 
            className="absolute inset-0 opacity-[0.09]" 
            style={{ 
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
            }} 
          />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Net Balance (Extra Large) */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                <Sparkles className="w-4 h-4 text-green-300" />
                <span className="text-xs md:text-sm text-green-100 font-semibold tracking-wide">
                  {t("dashboard.netBalance")}
                </span>
              </div>
              <p className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white drop-shadow-sm">
                {showAmount
                  ? formatCurrency(currentSummary.net, currency)
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

          {/* Transaksi Terbaru (5/12) */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                {t("dashboard.recentTransactions")}
              </p>
              <Link
                href={`/transactions?workspaceId=${workspaceId}`}
                className="flex items-center gap-1 text-[11px] sm:text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                {t("dashboard.viewAll")} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60 overflow-y-auto flex-1 p-1">
              {recentTx.length === 0 ? (
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
                recentTx.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  return (
                    <div key={tx.id} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 rounded-xl transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? "bg-green-50 dark:bg-green-950/60" : "bg-red-50 dark:bg-red-950/60"}`}>
                        {tx.category?.emoji ? (
                          <span className="text-sm">{tx.category.emoji}</span>
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
                        <p className="text-[10px] text-zinc-400">
                          {tx.category?.name && (
                            <span className="mr-1">{tx.category.name} ·</span>
                          )}
                          {new Date(tx.date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <p className={`text-xs font-bold font-mono shrink-0 ${isIncome ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                        {isIncome ? "+" : "-"}{showAmount ? formatCurrency(tx.amount, currency) : "••••••"}
                      </p>
                    </div>
                  );
                })
              )}
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
