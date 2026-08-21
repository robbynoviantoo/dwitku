import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  Scale,
  CalendarDays,
  Percent,
} from 'lucide-react-native';

interface ReportsSummaryCardsProps {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
    savingsRate: number;
    incomeCount: number;
    expenseCount: number;
    totalTransactions: number;
    avgIncome: number;
    avgExpense: number;
    dailyAvgExpense: number;
    dailyAvgIncome: number;
    daySpan: number;
  };
  showAmount: boolean;
  formatRupiah: (val: number) => string;
}

export function ReportsSummaryCards({
  summary,
  showAmount,
  formatRupiah,
}: ReportsSummaryCardsProps) {
  const isSurplus = summary.netCashflow >= 0;

  return (
    <View style={styles.container}>
      {/* ── 1. Top Core Metric Cards (Vertical on Mobile 1:1 Screenshot) ── */}

      {/* TOTAL INCOME */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>TOTAL INCOME</Text>
          <View style={[styles.iconBadge, { backgroundColor: '#f0fdf4' }]}>
            <TrendingUp size={16} color="#004C29" />
          </View>
        </View>
        <Text style={[styles.mainValue, { color: '#004C29' }]}>
          {showAmount ? formatRupiah(summary.totalIncome) : '••••••••'}
        </Text>
        <Text style={styles.subText}>{summary.incomeCount} Inflow Transactions</Text>
      </View>

      {/* TOTAL EXPENSE */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>TOTAL EXPENSE</Text>
          <View style={[styles.iconBadge, { backgroundColor: '#fef2f2' }]}>
            <TrendingDown size={16} color="#dc2626" />
          </View>
        </View>
        <Text style={[styles.mainValue, { color: '#dc2626' }]}>
          {showAmount ? formatRupiah(summary.totalExpense) : '••••••••'}
        </Text>
        <Text style={styles.subText}>{summary.expenseCount} Outflow Transactions</Text>
      </View>

      {/* NET CASHFLOW */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>NET CASHFLOW</Text>
          <View style={[styles.iconBadge, { backgroundColor: isSurplus ? '#f0fdf4' : '#fef2f2' }]}>
            <Wallet size={16} color={isSurplus ? '#004C29' : '#dc2626'} />
          </View>
        </View>
        <Text style={[styles.mainValue, { color: isSurplus ? '#004C29' : '#dc2626' }]}>
          {showAmount
            ? `${isSurplus ? '+' : ''}${formatRupiah(summary.netCashflow)}`
            : '••••••••'}
        </Text>
        <Text style={styles.subText}>
          {isSurplus ? 'Financial Surplus' : 'Financial Deficit'}
        </Text>
      </View>

      {/* SAVINGS RATE */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>SAVINGS RATE</Text>
          <View style={[styles.iconBadge, { backgroundColor: '#ecfdf5' }]}>
            <PiggyBank size={16} color="#059669" />
          </View>
        </View>
        <Text
          style={[
            styles.mainValue,
            {
              color:
                summary.savingsRate >= 20
                  ? '#004C29'
                  : summary.savingsRate > 0
                  ? '#d97706'
                  : '#dc2626',
            },
          ]}
        >
          {summary.savingsRate}%
        </Text>
        <Text style={styles.subText}>Of total income</Text>
      </View>

      {/* ── 2. Detailed Secondary Statistics (2x2 Grid) ── */}
      <View style={styles.miniGrid}>
        {/* Daily Average */}
        <View style={styles.miniCard}>
          <View style={styles.miniCardIcon}>
            <CalendarDays size={14} color="#64748b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniCardLabel}>DAILY AVERAGE</Text>
            <Text style={styles.miniCardValue} numberOfLines={1}>
              {showAmount ? formatRupiah(summary.dailyAvgExpense) : '••••••'}
            </Text>
          </View>
        </View>

        {/* Avg Outflow */}
        <View style={styles.miniCard}>
          <View style={styles.miniCardIcon}>
            <Receipt size={14} color="#64748b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniCardLabel}>AVG OUTFLOW</Text>
            <Text style={styles.miniCardValue} numberOfLines={1}>
              {showAmount ? formatRupiah(summary.avgExpense) : '••••••'}
            </Text>
          </View>
        </View>

        {/* Avg Inflow */}
        <View style={styles.miniCard}>
          <View style={styles.miniCardIcon}>
            <Scale size={14} color="#64748b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniCardLabel}>AVG INFLOW</Text>
            <Text style={styles.miniCardValue} numberOfLines={1}>
              {showAmount ? formatRupiah(summary.avgIncome) : '••••••'}
            </Text>
          </View>
        </View>

        {/* Total Activity */}
        <View style={styles.miniCard}>
          <View style={styles.miniCardIcon}>
            <Percent size={14} color="#64748b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.miniCardLabel}>TOTAL ACTIVITY</Text>
            <Text style={styles.miniCardValue} numberOfLines={1}>
              {summary.totalTransactions} Transactions
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  subText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  miniCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  miniCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCardLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.2,
  },
  miniCardValue: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
});
