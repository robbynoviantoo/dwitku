"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionSummary } from "@/app/actions/transaction";
import {
  getMonthlyChart,
  getCategoryChart,
  getMonthComparison,
} from "@/app/actions/report";
import {
  MonthlyBarChart,
  CategoryDonutChart,
} from "@/components/reports/charts";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart2,
  FileDown,
} from "lucide-react";
import { usePrivacy } from "@/components/providers/privacy-provider";

interface ReportsClientProps {
  workspaceId: string;
  workspaceName: string;
  isPersonal: boolean;
  currency: string;
}

function ChangeIndicator({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / Math.abs(previous)) * 100);
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        up ? "text-green-600" : "text-red-500"
      }`}
    >
      {up ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {Math.abs(pct)}% vs bln lalu
    </span>
  );
}

export function ReportsClient({
  workspaceId,
  workspaceName,
  isPersonal,
  currency,
}: ReportsClientProps) {
  const { showAmount } = usePrivacy();

  // Queries
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["transaction-summary", workspaceId],
    queryFn: () => getTransactionSummary(workspaceId),
  });

  const { data: monthlyData = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ["report-monthly", workspaceId],
    queryFn: () => getMonthlyChart(workspaceId),
  });

  const { data: categoryData = [], isLoading: isLoadingCategory } = useQuery({
    queryKey: ["report-category", workspaceId],
    queryFn: () => getCategoryChart(workspaceId),
  });

  const { data: comparison, isLoading: isLoadingComparison } = useQuery({
    queryKey: ["report-comparison", workspaceId],
    queryFn: () => getMonthComparison(workspaceId),
  });

  const isLoading =
    isLoadingSummary ||
    isLoadingMonthly ||
    isLoadingCategory ||
    isLoadingComparison;

  if (isLoading && !summary) {
    return (
      <ReportsSkeleton workspaceName={workspaceName} isPersonal={isPersonal} />
    );
  }

  const currentSummary = summary ?? { income: 0, expense: 0, net: 0 };

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">Analitik</p>
          <h1 className="text-2xl font-bold text-zinc-900">Laporan Keuangan</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isPersonal ? "Keuangan pribadi" : `Workspace "${workspaceName}"`}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Pemasukan",
            value: currentSummary.income,
            current: comparison?.current.income ?? 0,
            previous: comparison?.previous.income ?? 0,
            icon: TrendingUp,
            color: "text-green-600",
            iconBg: "bg-green-50",
            valueBg: "text-green-600",
          },
          {
            label: "Total Pengeluaran",
            value: currentSummary.expense,
            current: comparison?.current.expense ?? 0,
            previous: comparison?.previous.expense ?? 0,
            icon: TrendingDown,
            color: "text-red-500",
            iconBg: "bg-red-50",
            valueBg: "text-red-500",
          },
          {
            label: "Saldo Bersih",
            value: currentSummary.net,
            current: comparison?.current.net ?? 0,
            previous: comparison?.previous.net ?? 0,
            icon: Wallet,
            color: currentSummary.net >= 0 ? "text-blue-600" : "text-red-500",
            iconBg: currentSummary.net >= 0 ? "bg-blue-50" : "bg-red-50",
            valueBg: currentSummary.net >= 0 ? "text-blue-600" : "text-red-500",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className="text-xs font-medium text-zinc-500">{card.label}</p>
                </div>
                <ChangeIndicator current={card.current} previous={card.previous} />
              </div>
              <p className={`text-2xl font-extrabold mb-1 ${card.valueBg}`}>
                {showAmount ? formatCurrency(card.value, currency) : "••••••"}
              </p>
              <p className="text-xs text-zinc-400">
                Bulan ini: {showAmount ? formatCurrency(card.current, currency) : "••••••"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-zinc-900 text-sm">Pemasukan vs Pengeluaran</h2>
              <p className="text-xs text-zinc-400 mt-0.5">6 bulan terakhir</p>
            </div>
          </div>
          <MonthlyBarChart data={monthlyData} currency={currency} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-zinc-900 text-sm">Pengeluaran per Kategori</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Bulan ini</p>
          </div>
          <CategoryDonutChart data={categoryData} currency={currency} />
        </div>
      </div>

      {/* Comparison Table */}
      {comparison && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-900 text-sm mb-5">Perbandingan Bulan Ini vs Bulan Lalu</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left py-2 text-xs text-zinc-500 font-medium w-40">
                    Metrik
                  </th>
                  <th className="text-right py-2 text-xs text-zinc-500 font-medium">
                    Bulan Ini
                  </th>
                  <th className="text-right py-2 text-xs text-zinc-500 font-medium">
                    Bulan Lalu
                  </th>
                  <th className="text-right py-2 text-xs text-zinc-500 font-medium">
                    Perubahan
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Pemasukan",
                    cur: comparison.current.income,
                    prev: comparison.previous.income,
                    colorClass: "text-green-600",
                  },
                  {
                    label: "Pengeluaran",
                    cur: comparison.current.expense,
                    prev: comparison.previous.expense,
                    colorClass: "text-red-500",
                  },
                  {
                    label: "Saldo Bersih",
                    cur: comparison.current.net,
                    prev: comparison.previous.net,
                    colorClass:
                      comparison.current.net >= 0
                        ? "text-indigo-600"
                        : "text-red-500",
                  },
                ].map((row) => {
                  const diff = row.cur - row.prev;
                  const pct =
                    row.prev !== 0
                      ? Math.round((diff / Math.abs(row.prev)) * 100)
                      : null;
                  return (
                    <tr
                      key={row.label}
                      className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors"
                    >
                      <td className="py-3 font-medium text-zinc-700">
                        {row.label}
                      </td>
                      <td
                        className={`py-3 text-right font-semibold ${row.colorClass}`}
                      >
                        {showAmount
                          ? formatCurrency(row.cur, currency)
                          : "******"}
                      </td>
                      <td className="py-3 text-right text-zinc-400">
                        {showAmount
                          ? formatCurrency(row.prev, currency)
                          : "******"}
                      </td>
                      <td className="py-3 text-right">
                        {pct !== null ? (
                          <span
                            className={`inline-flex items-center gap-0.5 text-xs font-medium ${diff >= 0 ? "text-green-600" : "text-red-500"}`}
                          >
                            {diff >= 0 ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {Math.abs(pct)}%
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-300 flex items-center justify-end gap-0.5">
                            <Minus className="w-3 h-3" /> —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsSkeleton({
  workspaceName,
  isPersonal,
}: {
  workspaceName: string;
  isPersonal: boolean;
}) {
  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <div className="mb-8">
        <Skeleton className="h-3 w-16 mb-2" />
        <h1 className="text-2xl font-bold text-zinc-900">Laporan Keuangan</h1>
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <Skeleton className="lg:col-span-3 h-[300px] rounded-2xl" />
        <Skeleton className="lg:col-span-2 h-[300px] rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
