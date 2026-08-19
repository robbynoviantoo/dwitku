"use client";

import { useState } from "react";
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
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
} from "lucide-react";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";

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
  const { t } = useLanguage();
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / Math.abs(previous)) * 100);
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
      }`}
    >
      {up ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {Math.abs(pct)}% {t("reports.vsLastMonth")}
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
  const { t } = useLanguage();
  const [dateFilter, setDateFilter] = useState<string>("");

  // Queries
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["transaction-summary", workspaceId, dateFilter],
    queryFn: () => getTransactionSummary(workspaceId, dateFilter, dateFilter),
  });

  const { data: monthlyData = [], isLoading: isLoadingMonthly } = useQuery({
    queryKey: ["report-monthly", workspaceId],
    queryFn: () => getMonthlyChart(workspaceId),
  });

  const { data: categoryData = [], isLoading: isLoadingCategory } = useQuery({
    queryKey: ["report-category", workspaceId, dateFilter],
    queryFn: () => getCategoryChart(workspaceId, dateFilter, dateFilter),
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 tracking-tight">
            <BarChart2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            {t("reports.financialReport")}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
            {isPersonal ? t("reports.personalFinance") : `Workspace "${workspaceName}"`}
          </p>
        </div>
        <div className="w-full sm:w-64 shrink-0">
          <CalendarPicker
            value={dateFilter}
            onChange={setDateFilter}
            placeholder={t("reports.selectDate")}
            allowClear
            align="right"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: t("dashboard.totalIncome"),
            value: currentSummary.income,
            current: comparison?.current.income ?? 0,
            previous: comparison?.previous.income ?? 0,
            icon: TrendingUp,
            color: "text-green-600 dark:text-green-400",
            iconBg: "bg-green-50 dark:bg-green-950/60",
            valueBg: "text-green-600 dark:text-green-400",
          },
          {
            label: t("dashboard.totalExpense"),
            value: currentSummary.expense,
            current: comparison?.current.expense ?? 0,
            previous: comparison?.previous.expense ?? 0,
            icon: TrendingDown,
            color: "text-red-500 dark:text-red-400",
            iconBg: "bg-red-50 dark:bg-red-950/60",
            valueBg: "text-red-500 dark:text-red-400",
          },
          {
            label: t("dashboard.netBalance"),
            value: currentSummary.net,
            current: comparison?.current.net ?? 0,
            previous: comparison?.previous.net ?? 0,
            icon: Wallet,
            color: currentSummary.net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400",
            iconBg: currentSummary.net >= 0 ? "bg-blue-50 dark:bg-blue-950/60" : "bg-red-50 dark:bg-red-950/60",
            valueBg: currentSummary.net >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {card.label}
                  </span>
                </div>
                <ChangeIndicator
                  current={card.current}
                  previous={card.previous}
                />
              </div>
              <p className={`text-2xl font-bold font-mono ${card.valueBg}`}>
                {showAmount ? formatCurrency(card.value, currency) : "••••••••"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t("reports.monthlyTrend")}
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {t("reports.last6Months")}
            </p>
          </div>
          <MonthlyBarChart
            data={monthlyData}
            currency={currency}
            showAmount={showAmount}
          />
        </div>

        {/* Category Donut Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {t("reports.expenseByCategory")}
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {dateFilter ? dateFilter : t("reports.allTime")}
            </p>
          </div>
          <CategoryDonutChart
            data={categoryData}
            currency={currency}
            showAmount={showAmount}
          />
        </div>
      </div>
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
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <h1 className="text-2xl font-bold text-zinc-900">{t("reports.financialReport")}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isPersonal ? t("reports.personalFinance") : `Workspace "${workspaceName}"`}
          </p>
        </div>
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-36 mt-2" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
