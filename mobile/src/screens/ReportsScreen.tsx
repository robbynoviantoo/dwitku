import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { apiRequest } from '../services/api';
import { PieChart, TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';

interface ReportsScreenProps {
  activeWorkspaceId: string;
}

export default function ReportsScreen({ activeWorkspaceId }: ReportsScreenProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/reports?workspaceId=${activeWorkspaceId}`);
      setData(res);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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
        {loading ? (
          <ActivityIndicator color="#16a34a" style={{ marginTop: 40 }} />
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
                <Wallet size={16} color="#16a34a" />
                <Text style={styles.summaryTitle}>Saldo Net Keseluruhan</Text>
              </View>
              <Text style={styles.summaryValue}>{formatRupiah(data.summary?.netBalance || 0)}</Text>
              <View style={styles.statGrid}>
                <View style={styles.statBox}>
                  <View style={styles.statBadgeRow}>
                    <TrendingUp size={14} color="#16a34a" />
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
                            { color: isIncome ? '#16a34a' : '#dc2626' },
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
                            backgroundColor: isIncome ? '#16a34a' : '#dc2626',
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
    backgroundColor: '#09090b',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#71717a',
    marginTop: 10,
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryTitle: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 8,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
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
    color: '#a1a1aa',
  },
  statValGreen: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 2,
  },
  statValRed: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  catReportCard: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  catEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  catType: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  catAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  catPercent: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 2,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
