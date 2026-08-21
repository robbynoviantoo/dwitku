import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../services/api';
import { PieChart, TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';

interface ReportsScreenProps {
  activeWorkspaceId: string;
}

export default function ReportsScreen({ activeWorkspaceId }: ReportsScreenProps) {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['reports', activeWorkspaceId],
    queryFn: () => apiRequest(`/reports?workspaceId=${activeWorkspaceId}`),
    enabled: !!activeWorkspaceId,
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Keuangan</Text>
        <Text style={styles.headerSubtitle}>Ringkasan & rincian per kategori transaksi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && !data ? (
          <ActivityIndicator color="#004C29" style={{ marginTop: 40 }} />
        ) : !data ? (
          <View style={styles.emptyContainer}>
            <PieChart size={44} color="#3f3f46" />
            <Text style={styles.emptyText}>Tidak ada data laporan</Text>
          </View>
        ) : (
          <>
            {/* Net Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Wallet size={16} color="#004C29" />
                <Text style={styles.summaryTitle}>Saldo Net Keseluruhan</Text>
              </View>
              <Text style={styles.summaryValue}>{formatRupiah(data.summary?.netBalance || 0)}</Text>
              <View style={styles.statGrid}>
                <View style={styles.statBox}>
                  <View style={styles.statBadgeRow}>
                    <TrendingUp size={14} color="#004C29" />
                    <Text style={styles.statLabel}>Pemasukan</Text>
                  </View>
                  <Text style={styles.statValGreen}>{formatRupiah(data.summary?.totalIncome || 0)}</Text>
                </View>
                <View style={styles.statBox}>
                  <View style={styles.statBadgeRow}>
                    <TrendingDown size={14} color="#dc2626" />
                    <Text style={styles.statLabel}>Pengeluaran</Text>
                  </View>
                  <Text style={styles.statValRed}>{formatRupiah(data.summary?.totalExpense || 0)}</Text>
                </View>
              </View>
            </View>

            {/* Category Breakdown */}
            <Text style={styles.sectionTitle}>Rincian Per Kategori</Text>
            {data.categoryReport?.length === 0 ? (
              <Text style={styles.emptyText}>Belum ada transaksi recorded</Text>
            ) : (
              data.categoryReport?.map((cat: any, idx: number) => {
                const total = cat.type === 'INCOME' ? data.summary.totalIncome : data.summary.totalExpense;
                const percentage = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
                const isIncome = cat.type === 'INCOME';
                return (
                  <View key={idx} style={styles.catReportCard}>
                    <View style={styles.catHeader}>
                      <Text style={styles.catEmoji}>{cat.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.catName}>{cat.name}</Text>
                        <Text style={styles.catType}>{isIncome ? 'Pemasukan' : 'Pengeluaran'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={[
                            styles.catAmount,
                            { color: isIncome ? '#004C29' : '#dc2626' },
                          ]}
                        >
                          {formatRupiah(cat.amount)}
                        </Text>
                        <Text style={styles.catPercent}>{percentage}% dari total</Text>
                      </View>
                    </View>
                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isIncome ? '#004C29' : '#dc2626',
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
    marginVertical: 6,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statBox: {
    flex: 1,
  },
  statBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  statValGreen: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#004C29',
    marginTop: 2,
  },
  statValRed: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  catReportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  catEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  catName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  catType: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  catAmount: {
    fontSize: 13.5,
    fontWeight: 'bold',
  },
  catPercent: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
