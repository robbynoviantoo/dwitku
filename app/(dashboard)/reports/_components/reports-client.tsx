"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMonthlyChart,
  getCategoryChart,
  getDetailedReportSummary,
} from "@/app/actions/report";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2 } from "lucide-react";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";
import { DateRange } from "@/components/ui/date-range-picker";

import { ReportsHeader } from "./reports-header";
import { ReportsSummaryCards } from "./reports-summary-cards";
import { ReportsChartsSection } from "./reports-charts-section";
import { ReportsDeepInsights } from "./reports-deep-insights";

interface ReportsClientProps {
  workspaceId: string;
  workspaceName: string;
  isPersonal: boolean;
  currency: string;
}

export function ReportsClient({
  workspaceId,
  workspaceName,
  isPersonal,
  currency,
}: ReportsClientProps) {
  const { showAmount } = usePrivacy();
  const { t } = useLanguage();

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });

  // Queries
  const {
    data: summary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["report-detailed-summary", workspaceId, dateRange],
    queryFn: () =>
      getDetailedReportSummary(
        workspaceId,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      ),
    enabled: !!workspaceId,
  });

  const {
    data: monthlyData = [],
    isLoading: isLoadingMonthly,
    refetch: refetchMonthly,
  } = useQuery({
    queryKey: ["report-monthly", workspaceId],
    queryFn: () => getMonthlyChart(workspaceId),
    enabled: !!workspaceId,
  });

  const {
    data: categoryData = [],
    isLoading: isLoadingCategory,
    refetch: refetchCategory,
  } = useQuery({
    queryKey: ["report-category", workspaceId, dateRange],
    queryFn: () =>
      getCategoryChart(
        workspaceId,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      ),
    enabled: !!workspaceId,
  });

  const {
    data: topTransactions = [],
    isLoading: isLoadingTopTx,
    refetch: refetchTopTx,
  } = useQuery({
    queryKey: ["report-top-transactions", workspaceId, dateRange],
    queryFn: async () => {
      const { getTopTransactions } = await import("@/app/actions/report");
      return getTopTransactions(
        workspaceId,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
    },
    enabled: !!workspaceId,
  });

  const {
    data: walletDistribution = [],
    isLoading: isLoadingWallets,
    refetch: refetchWallets,
  } = useQuery({
    queryKey: ["report-wallet-distribution", workspaceId, dateRange],
    queryFn: async () => {
      const { getWalletDistribution } = await import("@/app/actions/report");
      return getWalletDistribution(
        workspaceId,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined
      );
    },
    enabled: !!workspaceId,
  });

  const isLoading =
    isLoadingSummary ||
    isLoadingMonthly ||
    isLoadingCategory ||
    isLoadingTopTx ||
    isLoadingWallets;

  const handleRefresh = async () => {
    await Promise.all([
      refetchSummary(),
      refetchMonthly(),
      refetchCategory(),
      refetchTopTx(),
      refetchWallets(),
    ]);
  };

  if (isLoading && !summary) {
    return (
      <ReportsSkeleton
        workspaceName={workspaceName}
        isPersonal={isPersonal}
      />
    );
  }

  const fallbackSummary = {
    totalIncome: 0,
    totalExpense: 0,
    netCashflow: 0,
    savingsRate: 0,
    incomeCount: 0,
    expenseCount: 0,
    totalTransactions: 0,
    avgIncome: 0,
    avgExpense: 0,
    dailyAvgExpense: 0,
    dailyAvgIncome: 0,
    daySpan: 30,
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-4">
        {/* ── 1. Header with Range Picker ─────────────────── */}
        <ReportsHeader
          workspaceName={workspaceName}
          isPersonal={isPersonal}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* ── 2. Comprehensive Metric Summary Cards ────────── */}
        <ReportsSummaryCards
          summary={summary || fallbackSummary}
          currency={currency}
          showAmount={showAmount}
        />

        {/* ── 3. Interactive Analytics & Visual Charts ─────── */}
        <ReportsChartsSection
          monthlyData={monthlyData}
          categoryData={categoryData}
          currency={currency}
          showAmount={showAmount}
          dateRange={dateRange}
        />

        {/* ── 4. Deep Insights: Top Expenses & Wallet Share ── */}
        <ReportsDeepInsights
          topTransactions={topTransactions}
          walletDistribution={walletDistribution}
          currency={currency}
          showAmount={showAmount}
        />
      </div>
    </PullToRefreshWrapper>
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
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-green-600" />
            {t("reports.financialReport")}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isPersonal ? t("reports.personalFinance") : `Workspace "${workspaceName}"`}
          </p>
        </div>
        <Skeleton className="h-10 w-64 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className="h-28 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className="h-16 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
