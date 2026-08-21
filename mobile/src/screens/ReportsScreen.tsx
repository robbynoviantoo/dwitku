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
} from 'lucide-react-native';
import { ReportsSummaryCards } from './reports/components/ReportsSummaryCards';
import { ReportsChartsSection } from './reports/components/ReportsChartsSection';
import { ReportsDeepInsights } from './reports/components/ReportsDeepInsights';

interface ReportsScreenProps {
  user?: any;
  activeWorkspaceId: string;
  activeWorkspace?: any;
  onOpenWorkspaceModal?: () => void;
}

const DATE_PERIODS = [
  { id: 'ALL', label: 'All Time', days: null },
  { id: 'THIS_MONTH', label: 'This Month', days: 30 },
  { id: 'LAST_30_DAYS', label: 'Last 30 Days', days: 30 },
  { id: 'LAST_3_MONTHS', label: 'Last 3 Months', days: 90 },
  { id: 'THIS_YEAR', label: 'This Year', days: 365 },
];

export default function ReportsScreen({
  user,
  activeWorkspaceId,
  activeWorkspace,
  onOpenWorkspaceModal,
}: ReportsScreenProps) {
  const [showAmount, setShowAmount] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(DATE_PERIODS[0]);
  const [periodPickerOpen, setPeriodPickerOpen] = useState(false);

  // Hitung rentang tanggal berdasarkan period yang dipilih
  const getDateRangeParams = () => {
    if (!selectedPeriod.days) return '';
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - selectedPeriod.days);
    const startStr = start.toISOString().split('T')[0];
    const endStr = now.toISOString().split('T')[0];
    return `&dateFrom=${startStr}&dateTo=${endStr}`;
  };

  // TanStack Query Reports
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['reports', activeWorkspaceId, selectedPeriod.id],
    queryFn: () =>
      apiRequest(`/reports?workspaceId=${activeWorkspaceId}${getDateRangeParams()}`),
    enabled: !!activeWorkspaceId,
  });

  const formatRupiah = (val: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);
  };

  const summary = data?.summary || {
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

          {/* Date Period Filter Selector (All Time / This Month / etc) */}
          <TouchableOpacity
            style={styles.periodSelector}
            onPress={() => setPeriodPickerOpen(true)}
            activeOpacity={0.7}
          >
            <Calendar size={15} color="#64748b" />
            <Text style={styles.periodSelectorText}>{selectedPeriod.label}</Text>
            <ChevronDown size={15} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {isLoading && !data ? (
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
              monthlyData={data?.monthlyTrend || []}
              categoryData={data?.categoryBreakdown || []}
              showAmount={showAmount}
              formatRupiah={formatRupiah}
            />

            {/* 5. Deep Insights: Top 5 Largest Expenses & Expense by Wallet */}
            <ReportsDeepInsights
              topTransactions={data?.topTransactions || []}
              walletDistribution={data?.walletDistribution || []}
              showAmount={showAmount}
              formatRupiah={formatRupiah}
            />
          </View>
        )}
      </ScrollView>

      {/* ── Modal Filter Rentang Waktu (Period Picker) ── */}
      <Modal visible={periodPickerOpen} transparent animationType="fade">
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>Pilih Rentang Waktu</Text>
            <View style={{ marginVertical: 10 }}>
              {DATE_PERIODS.map((period) => {
                const isActive = selectedPeriod.id === period.id;
                return (
                  <TouchableOpacity
                    key={period.id}
                    style={[styles.periodItem, isActive && styles.periodItemActive]}
                    onPress={() => {
                      setSelectedPeriod(period);
                      setPeriodPickerOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.periodItemText, isActive && styles.periodItemTextActive]}>
                      {period.label}
                    </Text>
                    {isActive && <Check size={16} color="#004C29" strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.pickerCloseBtn}
              onPress={() => setPeriodPickerOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerCloseText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  periodSelectorText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  reportContent: {
    paddingHorizontal: 16,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
  },
  pickerModalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  periodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  periodItemActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  periodItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  periodItemTextActive: {
    color: '#004C29',
    fontWeight: 'bold',
  },
  pickerCloseBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  pickerCloseText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
  },
});
