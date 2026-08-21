import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react-native';

interface TransactionsSummaryBarProps {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  showAmount: boolean;
}

export function TransactionsSummaryBar({ summary, showAmount }: TransactionsSummaryBarProps) {
  const formatRupiah = (val: number) => {
    if (!showAmount) return '••••••••';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
      {/* 1. Total Income */}
      <View style={styles.summaryCard}>
        <View style={[styles.summaryBadge, { backgroundColor: '#f0fdf4' }]}>
          <TrendingUp size={14} color="#004C29" />
        </View>
        <View>
          <Text style={styles.summaryLabel}>TOTAL INCOME</Text>
          <Text style={[styles.summaryVal, { color: '#004C29' }]}>
            +{formatRupiah(summary.totalIncome)}
          </Text>
        </View>
      </View>

      {/* 2. Total Expense */}
      <View style={styles.summaryCard}>
        <View style={[styles.summaryBadge, { backgroundColor: '#fef2f2' }]}>
          <TrendingDown size={14} color="#dc2626" />
        </View>
        <View>
          <Text style={styles.summaryLabel}>TOTAL EXPENSE</Text>
          <Text style={[styles.summaryVal, { color: '#dc2626' }]}>
            -{formatRupiah(summary.totalExpense)}
          </Text>
        </View>
      </View>

      {/* 3. Selisih / Balance */}
      <View style={styles.summaryCard}>
        <View style={[styles.summaryBadge, { backgroundColor: '#f0fdf4' }]}>
          <Scale size={14} color="#004C29" />
        </View>
        <View>
          <Text style={styles.summaryLabel}>SELISIH</Text>
          <Text style={[styles.summaryVal, { color: '#004C29' }]}>
            {summary.balance >= 0 ? '+' : ''}
            {formatRupiah(summary.balance)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    gap: 8,
    paddingVertical: 2,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.2,
  },
  summaryVal: {
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 1,
  },
});
