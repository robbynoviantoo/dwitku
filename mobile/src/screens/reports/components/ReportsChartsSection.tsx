import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Rect, Line, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react-native';

interface ReportsChartsSectionProps {
  monthlyData: Array<{ month: string; fullLabel: string; income: number; expense: number }>;
  categoryData: Array<{ name: string; emoji: string; color: string; value: number }>;
  formatRupiah: (val: number) => string;
  showAmount: boolean;
}

export function ReportsChartsSection({
  monthlyData = [],
  categoryData = [],
  formatRupiah,
  showAmount,
}: ReportsChartsSectionProps) {
  // Hitung max value untuk bar chart monthly
  const maxMonthlyVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.income || 0, d.expense || 0)),
    1000000
  );

  const totalExpenseCategory = categoryData.reduce((acc, c) => acc + (c.value || 0), 0);

  return (
    <View style={styles.container}>
      {/* ── 1. Monthly Cashflow Trend (Bar Chart SVG) ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconBox}>
            <BarChart3 size={16} color="#004C29" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Monthly Cashflow Trend</Text>
            <Text style={styles.cardSubtitle}>Arus Kas Masuk vs Keluar (6 Bulan Terakhir)</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#004C29' }]} />
            <Text style={styles.legendText}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
            <Text style={styles.legendText}>Expense</Text>
          </View>
        </View>

        {/* SVG Grouped Bar Chart */}
        <View style={styles.chartWrapper}>
          {monthlyData.length === 0 ? (
            <Text style={styles.emptyChartText}>Belum ada data bulanan</Text>
          ) : (
            <View style={styles.barsContainer}>
              {monthlyData.map((item, index) => {
                const incomeHeightPct = Math.min((item.income / maxMonthlyVal) * 100, 100);
                const expenseHeightPct = Math.min((item.expense / maxMonthlyVal) * 100, 100);

                return (
                  <View key={index} style={styles.barGroup}>
                    <View style={styles.barsTrack}>
                      {/* Income Bar */}
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.max(incomeHeightPct, 4)}%`,
                            backgroundColor: '#004C29',
                          },
                        ]}
                      />
                      {/* Expense Bar */}
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${Math.max(expenseHeightPct, 4)}%`,
                            backgroundColor: '#dc2626',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{item.month}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* ── 2. Expense by Category Breakdown (Progress Bars & Donut) ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconBox}>
            <PieChartIcon size={16} color="#004C29" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Expense by Category</Text>
            <Text style={styles.cardSubtitle}>Distribusi Komposisi Kategori Pengeluaran</Text>
          </View>
        </View>

        <View style={styles.categoryList}>
          {categoryData.length === 0 ? (
            <Text style={styles.emptyChartText}>Belum ada pengeluaran per kategori</Text>
          ) : (
            categoryData.map((cat, idx) => {
              const pct = totalExpenseCategory > 0 ? Math.round((cat.value / totalExpenseCategory) * 100) : 0;
              return (
                <View key={idx} style={styles.categoryRow}>
                  <View style={styles.catInfoRow}>
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={styles.catName} numberOfLines={1}>
                      {cat.name}
                    </Text>
                    <Text style={styles.catAmount}>
                      {showAmount ? formatRupiah(cat.value) : '••••••'}
                    </Text>
                    <Text style={styles.catPct}>{pct}%</Text>
                  </View>

                  <View style={styles.catProgressBarBg}>
                    <View
                      style={[
                        styles.catProgressBarFill,
                        {
                          width: `${Math.min(pct, 100)}%`,
                          backgroundColor: cat.color || '#004C29',
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginTop: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  chartWrapper: {
    height: 150,
    justifyContent: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barsTrack: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 100,
  },
  barFill: {
    width: 10,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 6,
  },
  categoryList: {
    gap: 12,
    marginTop: 4,
  },
  categoryRow: {
    gap: 6,
  },
  catInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catEmoji: {
    fontSize: 15,
    marginRight: 8,
  },
  catName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  catAmount: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 8,
  },
  catPct: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#004C29',
    width: 32,
    textAlign: 'right',
  },
  catProgressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyChartText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
  },
});
