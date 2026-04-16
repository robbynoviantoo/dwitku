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
import { getUserWorkspaces } from "@/app/actions/workspace";

interface DashboardClientProps {
  initialUser:
    | {
        name?: string | null;
      }
    | undefined;
}

export function DashboardClient({ initialUser }: DashboardClientProps) {
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

  const { data: summary, isLoading } = useQuery({
    queryKey: ["transaction-summary", workspaceId],
    queryFn: () =>
      workspaceId
        ? getTransactionSummary(workspaceId)
        : Promise.resolve({ income: 0, expense: 0, net: 0 }),
    enabled: !!workspaceId,
  });

  const { data: recentTxResult } = useQuery({
    queryKey: ["recent-transactions", workspaceId],
    queryFn: () =>
      workspaceId
        ? getTransactions(workspaceId, { limit: 5 })
        : Promise.resolve({ items: [], total: 0, totalPages: 0 }),
    enabled: !!workspaceId,
  });

  const { data: monthComparison } = useQuery({
    queryKey: ["month-comparison", workspaceId],
    queryFn: () => (workspaceId ? getMonthComparison(workspaceId) : null),
    enabled: !!workspaceId,
  });

  const { data: monthlyChart = [] } = useQuery({
    queryKey: ["monthly-chart", workspaceId],
    queryFn: () => (workspaceId ? getMonthlyChart(workspaceId) : []),
    enabled: !!workspaceId,
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["recent-transactions", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["month-comparison", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["monthly-chart", workspaceId] }),
    ]);
  };

  // No workspace selected
  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-zinc-700 mb-1">Pilih workspace terlebih dahulu</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-xs">
          Buka daftar workspace dan pilih salah satu untuk melihat ringkasan keuangan.
        </p>
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
          Lihat Workspace
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

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-zinc-500 mb-0.5">
              <span className="font-medium text-green-600">"{activeWs?.name ?? "..."}"</span>
            </p>
            <h1 className="text-2xl font-bold text-zinc-900">
              {greeting}, {initialUser?.name?.split(" ")[0] ?? "teman"} 👋
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">Berikut adalah ringkasan keuanganmu hari ini.</p>
          </div>
          <Link
            href={`/transactions?workspaceId=${workspaceId}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Catat Transaksi
          </Link>
        </div>

        {/* ── Hero Balance Card ─────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white p-6 shadow-lg">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -right-4 w-60 h-60 bg-white/5 rounded-full" />
          <div className="absolute top-2 right-24 w-12 h-12 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-green-200" />
              <p className="text-sm text-green-100 font-medium">Saldo Bersih (All-time)</p>
            </div>
            <p className="text-4xl font-extrabold tracking-tight mb-4">
              {showAmount
                ? formatCurrency(currentSummary.net, currency)
                : <span className="tracking-widest text-3xl">••••••••</span>}
            </p>
            <div className="flex gap-6 flex-wrap">
              <div>
                <p className="text-xs text-green-200 mb-0.5">Total Pemasukan</p>
                <p className="text-lg font-bold">
                  {showAmount ? formatCurrency(currentSummary.income, currency) : "••••••"}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-200 mb-0.5">Total Pengeluaran</p>
                <p className="text-lg font-bold">
                  {showAmount ? formatCurrency(currentSummary.expense, currency) : "••••••"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Monthly Summary Cards ─────────────────── */}
        {comparison && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pemasukan Bulan Ini */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-zinc-500">Pemasukan Bulan Ini</span>
                </div>
                {incomeChange !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${incomeChange >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {incomeChange >= 0 ? "+" : ""}{incomeChange.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-xl font-extrabold text-zinc-900">
                {showAmount ? formatCurrency(comparison.current.income, currency) : "••••••"}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Bulan lalu: {showAmount ? formatCurrency(comparison.previous.income, currency) : "••••••"}
              </p>
            </div>

            {/* Pengeluaran Bulan Ini */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-xs font-medium text-zinc-500">Pengeluaran Bulan Ini</span>
                </div>
                {expenseChange !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${expenseChange <= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {expenseChange >= 0 ? "+" : ""}{expenseChange.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-xl font-extrabold text-zinc-900">
                {showAmount ? formatCurrency(comparison.current.expense, currency) : "••••••"}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Bulan lalu: {showAmount ? formatCurrency(comparison.previous.expense, currency) : "••••••"}
              </p>
            </div>

            {/* Saldo Bersih Bulan Ini */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-zinc-500">Saldo Bersih Bulan Ini</span>
              </div>
              <p className={`text-xl font-extrabold ${comparison.current.net >= 0 ? "text-green-600" : "text-red-500"}`}>
                {showAmount ? formatCurrency(comparison.current.net, currency) : "••••••"}
              </p>
              <div className="mt-2 w-full bg-zinc-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-green-500 transition-all"
                  style={{
                    width: comparison.current.income > 0
                      ? `${Math.min(100, (comparison.current.net / comparison.current.income) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {comparison.current.income > 0
                  ? `${((comparison.current.net / comparison.current.income) * 100).toFixed(0)}% dari pemasukan tersisa`
                  : "Belum ada pemasukan bulan ini"}
              </p>
            </div>
          </div>
        )}

        {/* ── Bottom Section: Recent Tx + Mini Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Transaksi Terbaru (3/5) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
              <p className="font-semibold text-zinc-900 text-sm">Transaksi Terbaru</p>
              <Link
                href={`/transactions?workspaceId=${workspaceId}`}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Lihat semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-50">
              {recentTx.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                  <ArrowLeftRight className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Belum ada transaksi</p>
                  <Link
                    href={`/transactions?workspaceId=${workspaceId}`}
                    className="mt-3 text-xs text-green-600 hover:underline font-medium"
                  >
                    Catat transaksi pertama →
                  </Link>
                </div>
              ) : (
                recentTx.map((tx) => {
                  const isIncome = tx.type === "INCOME";
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/80 transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? "bg-green-50" : "bg-red-50"}`}>
                        {tx.category?.emoji ? (
                          <span className="text-base">{tx.category.emoji}</span>
                        ) : isIncome ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate">
                          {tx.note || tx.category?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {tx.category?.name && (
                            <span className="mr-1">{tx.category.name} ·</span>
                          )}
                          {new Date(tx.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <p className={`text-sm font-bold shrink-0 ${isIncome ? "text-green-600" : "text-red-500"}`}>
                        {isIncome ? "+" : "-"}{showAmount ? formatCurrency(tx.amount, currency) : "••••••"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Mini Bar Chart 6 Bulan (2/5) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
              <p className="font-semibold text-zinc-900 text-sm">6 Bulan Terakhir</p>
              <Link
                href={`/reports?workspaceId=${workspaceId}`}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <BarChart2 className="w-3.5 h-3.5" /> Laporan
              </Link>
            </div>

            <div className="p-5">
              {monthlyChart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-zinc-300">
                  <BarChart2 className="w-8 h-8 mb-2" />
                  <p className="text-xs">Belum ada data</p>
                </div>
              ) : (
                <>
                  {/* Legend */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                      <span className="text-[10px] text-zinc-500 font-medium">Pemasukan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                      <span className="text-[10px] text-zinc-500 font-medium">Pengeluaran</span>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="flex items-end gap-2 h-40">
                    {monthlyChart.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5 items-end h-32">
                          {/* Income bar */}
                          <div
                            className="flex-1 bg-green-500 rounded-t-sm min-h-[2px] transition-all duration-500"
                            style={{ height: `${(m.income / maxVal) * 100}%` }}
                            title={`Pemasukan: ${formatCurrency(m.income, currency)}`}
                          />
                          {/* Expense bar */}
                          <div
                            className="flex-1 bg-red-400 rounded-t-sm min-h-[2px] transition-all duration-500"
                            style={{ height: `${(m.expense / maxVal) * 100}%` }}
                            title={`Pengeluaran: ${formatCurrency(m.expense, currency)}`}
                          />
                        </div>
                        <span className="text-[9px] text-zinc-400 text-center leading-tight">
                          {m.month.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Quick links */}
            <div className="border-t border-zinc-50 grid grid-cols-2">
              <Link
                href={`/categories?workspaceId=${workspaceId}`}
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors border-r border-zinc-50"
              >
                Kategori
              </Link>
              <Link
                href={`/reports?workspaceId=${workspaceId}`}
                className="flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Laporan
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PullToRefreshWrapper>
  );
}

function DashboardSkeleton({ greeting, name }: { greeting: string; name?: string | null }) {
  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <h1 className="text-2xl font-bold text-zinc-900">{greeting}, {name?.split(" ")[0] ?? "teman"} 👋</h1>
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
