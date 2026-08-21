import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import {
  BarChart2,
  Calendar,
  ChevronDown,
  Check,
  X,
} from 'lucide-react-native';
import { DateRangePickerModal, DateRange } from '../components/DateRangePickerModal';
import { ReportsSummaryCards } from './reports/components/ReportsSummaryCards';
import { ReportsChartsSection } from './reports/components/ReportsChartsSection';
import { ReportsDeepInsights } from './reports/components/ReportsDeepInsights';

interface ReportsScreenProps {
  user?: any;
  activeWorkspaceId: string;
  activeWorkspace?: any;
  onOpenWorkspaceModal?: () => void;
}

export default function ReportsScreen({
  user,
  activeWorkspaceId,
  activeWorkspace,
  onOpenWorkspaceModal,
}: ReportsScreenProps) {
  const [showAmount, setShowAmount] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  // Format parameter filter
  const getDateRangeParams = () => {
    if (!dateRange.startDate && !dateRange.endDate) return '';
    return `&dateFrom=${dateRange.startDate || ''}&dateTo=${dateRange.endDate || ''}`;
  };

  // Format label trigger button (1:1 persis web)
  const getDisplayLabel = () => {
    if (!dateRange.startDate && !dateRange.endDate) return 'All Time';
    if (dateRange.startDate && !dateRange.endDate) return dateRange.startDate;
    if (dateRange.startDate === dateRange.endDate) {
      const d = new Date(dateRange.startDate + 'T00:00:00');
      return `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })} ${d.getFullYear()}`;
    }
    const d1 = new Date(dateRange.startDate + 'T00:00:00');
    const d2 = new Date(dateRange.endDate + 'T00:00:00');
    return `${d1.getDate()} ${d1.toLocaleDateString('id-ID', { month: 'short' })} - ${d2.getDate()} ${d2.toLocaleDateString('id-ID', { month: 'short' })} ${d2.getFullYear()}`;
  };

  // TanStack Query Reports
  const { data, isLoading: isLoadingReports, isRefetching, refetch } = useQuery({
    queryKey: ['reports', activeWorkspaceId, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      apiRequest(`/reports?workspaceId=${activeWorkspaceId}${getDateRangeParams()}`),
    enabled: !!activeWorkspaceId,
  });

  // Fallback: ambil data transactions workspace jika API reports di production belum terupdate
  const { data: txData } = useQuery({
    queryKey: ['transactions', activeWorkspaceId],
    queryFn: () => apiRequest(`/transactions?workspaceId=${activeWorkspaceId}`),
    enabled: !!activeWorkspaceId,
  });

  const formatRupiah = (val: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.round(val || 0));
  };

  // Fallback calculations directly from transactions
  const txList = txData?.transactions || [];
  const rawIncome = txList
    .filter((t: any) => t.type === 'INCOME')
    .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
  const rawExpense = txList
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
  const rawIncomeCount = txList.filter((t: any) => t.type === 'INCOME').length;
  const rawExpenseCount = txList.filter((t: any) => t.type === 'EXPENSE').length;
  const rawNet = rawIncome - rawExpense;
  const rawSavingsRate = rawIncome > 0 ? Math.round((rawNet / rawIncome) * 100) : 0;

  // Check if server report data exists and has summary
  const hasServerSummary = !!data?.summary;

  const summary = {
    totalIncome: hasServerSummary ? data.summary.totalIncome : rawIncome,
    totalExpense: hasServerSummary ? data.summary.totalExpense : rawExpense,
    netCashflow: hasServerSummary ? data.summary.netCashflow : rawNet,
    savingsRate: hasServerSummary ? data.summary.savingsRate : rawSavingsRate,
    incomeCount: hasServerSummary ? data.summary.incomeCount : rawIncomeCount,
    expenseCount: hasServerSummary ? data.summary.expenseCount : rawExpenseCount,
    totalTransactions: hasServerSummary ? data.summary.totalTransactions : txList.length,
    avgIncome: hasServerSummary ? data.summary.avgIncome : (rawIncomeCount > 0 ? rawIncome / rawIncomeCount : 0),
    avgExpense: hasServerSummary ? data.summary.avgExpense : (rawExpenseCount > 0 ? rawExpense / rawExpenseCount : 0),
    dailyAvgExpense: hasServerSummary ? data.summary.dailyAvgExpense : (rawExpense / 30),
    dailyAvgIncome: hasServerSummary ? data.summary.dailyAvgIncome : (rawIncome / 30),
    daySpan: hasServerSummary ? data.summary.daySpan : 30,
  };

  // Fallback Monthly Trend Chart (6 bulan terakhir dari txList)
  const now = new Date();
  const fallbackMonthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const mMonth = d.getMonth();
    const mYear = d.getFullYear();
    const mLabel = d.toLocaleDateString('id-ID', { month: 'short' });

    let income = 0;
    let expense = 0;
    for (const t of txList) {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === mMonth && tDate.getFullYear() === mYear) {
        if (t.type === 'INCOME') income += Number(t.amount || 0);
        if (t.type === 'EXPENSE') expense += Number(t.amount || 0);
      }
    }
    return { month: mLabel, fullLabel: mLabel, income, expense };
  });

  // Fallback Category Breakdown dari txList
  const catAgg: Record<string, { name: string; emoji: string; color: string; value: number }> = {};
  for (const t of txList) {
    if (t.type === 'EXPENSE' && t.category) {
      const catId = t.categoryId || t.category.id || t.category.name;
      if (!catAgg[catId]) {
        catAgg[catId] = {
          name: t.category.name,
          emoji: t.category.emoji || '📦',
          color: t.category.color || '#004C29',
          value: 0,
        };
      }
      catAgg[catId].value += Number(t.amount || 0);
    }
  }
  const fallbackCategories = Object.values(catAgg).sort((a, b) => b.value - a.value).slice(0, 6);

  // Fallback Top 5 Expenses
  const fallbackTopTx = txList
    .filter((t: any) => t.type === 'EXPENSE')
    .sort((a: any, b: any) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 5)
    .map((t: any) => ({
      id: t.id,
      note: t.note || t.category?.name || 'Pengeluaran',
      category: t.category,
      wallet: t.wallet,
      date: t.date,
      amount: Number(t.amount || 0),
    }));

  const monthlyTrend = data?.monthlyTrend?.length ? data.monthlyTrend : fallbackMonthly;
  const categoryBreakdown = data?.categoryBreakdown?.length ? data.categoryBreakdown : fallbackCategories;
  const topTransactions = data?.topTransactions?.length ? data.topTransactions : fallbackTopTx;
  const walletDistribution = data?.walletDistribution || [];

  const isFiltered = !!(dateRange.startDate || dateRange.endDate);

  return (
    <View style={styles.container}>
      {/* 1. Reusable Unified App Header */}
      <AppHeader
        user={user}
        activeWorkspace={activeWorkspace}
        onOpenWorkspaceModal={onOpenWorkspaceModal}
        showAmount={showAmount}
        onToggleShowAmount={() => setShowAmount(!showAmount)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#004C29']}
          />
        }
      >
        {/* 2. Page Title Header: "Financial Reports" & Subtitle Workspace */}
        <View style={styles.pageHeader}>
          <View style={styles.pageTitleRow}>
            <BarChart2 size={20} color="#004C29" />
            <Text style={styles.pageTitle}>Financial Reports</Text>
          </View>
          <Text style={styles.pageSubtitle}>
            Workspace "{activeWorkspace?.name || 'Utama'}"
          </Text>

          {/* Date Range Picker Trigger (1:1 with Web UI screenshot) */}
          <TouchableOpacity
            style={[styles.periodSelector, isFiltered && styles.periodSelectorActive]}
            onPress={() => setPickerOpen(true)}
            activeOpacity={0.7}
          >
            <Calendar size={15} color={isFiltered ? '#004C29' : '#64748b'} />
            <Text
              style={[styles.periodSelectorText, isFiltered && styles.periodSelectorTextActive]}
              numberOfLines={1}
            >
              {getDisplayLabel()}
            </Text>
            {isFiltered ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setDateRange({ startDate: '', endDate: '' });
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={15} color="#64748b" />
              </TouchableOpacity>
            ) : (
              <ChevronDown size={15} color="#94a3b8" />
            )}
          </TouchableOpacity>
        </View>

        {isLoadingReports && !data && !txData ? (
          <ActivityIndicator color="#004C29" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.reportContent}>
            {/* 3. Summary Cards: Total Income, Total Expense, Net Cashflow, Savings Rate & 4 Minis */}
            <ReportsSummaryCards
              summary={summary}
              showAmount={showAmount}
              formatRupiah={formatRupiah}
            />

            {/* 4. Charts: Monthly Cashflow Trend & Category Breakdown Progress */}
            <ReportsChartsSection
              monthlyData={monthlyTrend}
              categoryData={categoryBreakdown}
              showAmount={showAmount}
              formatRupiah={formatRupiah}
            />

            {/* 5. Deep Insights: Top 5 Largest Expenses & Expense by Wallet */}
            <ReportsDeepInsights
              topTransactions={topTransactions}
              walletDistribution={walletDistribution}
              showAmount={showAmount}
              formatRupiah={formatRupiah}
            />
          </View>
        )}
      </ScrollView>

      {/* ── Modal Calendar Date Range Picker 1:1 Persis Web ── */}
      <DateRangePickerModal
        visible={pickerOpen}
        value={dateRange}
        onChange={(newRange) => setDateRange(newRange)}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  pageHeader: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    alignSelf: 'stretch',
  },
  periodSelectorActive: {
    borderColor: 'rgba(0, 76, 41, 0.4)',
    backgroundColor: '#f0fdf4',
  },
  periodSelectorText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  periodSelectorTextActive: {
    color: '#004C29',
    fontWeight: 'bold',
  },
  reportContent: {
    paddingHorizontal: 16,
  },
});
