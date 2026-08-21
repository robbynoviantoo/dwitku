import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react-native';

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
  // Hitung max value untuk skala grafik garis
  const maxMonthlyVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.income || 0, d.expense || 0)),
    1000000
  );

  const totalExpenseCategory = categoryData.reduce((acc, c) => acc + (c.value || 0), 0);

  // Dimensi SVG Line Chart
  const svgWidth = 320;
  const svgHeight = 150;
  const padLeft = 24;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 32;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const getX = (index: number) => {
    if (monthlyData.length <= 1) return svgWidth / 2;
    return padLeft + (index / (monthlyData.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const ratio = Math.max(0, Math.min(val / maxMonthlyVal, 1));
    return padTop + plotHeight * (1 - ratio);
  };

  // Buat koordinat titik
  const incomePoints = monthlyData.map((d, i) => ({ x: getX(i), y: getY(d.income || 0) }));
  const expensePoints = monthlyData.map((d, i) => ({ x: getX(i), y: getY(d.expense || 0) }));

  // Path SVG untuk Income (Garis & Area Fill)
  const incomePath = incomePoints.length
    ? incomePoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')
    : '';

  const incomeAreaPath = incomePoints.length
    ? `${incomePath} L ${incomePoints[incomePoints.length - 1].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${incomePoints[0].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`
    : '';

  // Path SVG untuk Expense (Garis & Area Fill)
  const expensePath = expensePoints.length
    ? expensePoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')
    : '';

  const expenseAreaPath = expensePoints.length
    ? `${expensePath} L ${expensePoints[expensePoints.length - 1].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${expensePoints[0].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`
    : '';

  return (
    <View style={styles.container}>
      {/* ── 1. Monthly Cashflow Trend (Line Chart SVG) ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIconBox}>
            <TrendingUp size={16} color="#004C29" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Monthly Cashflow Trend</Text>
            <Text style={styles.cardSubtitle}>Grafik Garis Arus Kas Masuk vs Keluar (6 Bulan)</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#004C29' }]} />
            <Text style={styles.legendText}>Income (Pemasukan)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: '#dc2626' }]} />
            <Text style={styles.legendText}>Expense (Pengeluaran)</Text>
          </View>
        </View>

        {/* SVG Multi-Line Chart */}
        <View style={styles.chartWrapper}>
          {monthlyData.length === 0 ? (
            <Text style={styles.emptyChartText}>Belum ada data bulanan</Text>
          ) : (
            <Svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight}>
              <Defs>
                {/* Gradien Area Income */}
                <LinearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#004C29" stopOpacity="0.25" />
                  <Stop offset="100%" stopColor="#004C29" stopOpacity="0.0" />
                </LinearGradient>

                {/* Gradien Area Expense */}
                <LinearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
                  <Stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              {/* Grid Lines Horizontal */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const y = padTop + plotHeight * ratio;
                return (
                  <Line
                    key={idx}
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray={idx === 1 ? '4,4' : undefined}
                  />
                );
              })}

              {/* Area Fill Income */}
              {incomeAreaPath ? <Path d={incomeAreaPath} fill="url(#incomeAreaGrad)" /> : null}

              {/* Area Fill Expense */}
              {expenseAreaPath ? <Path d={expenseAreaPath} fill="url(#expenseAreaGrad)" /> : null}

              {/* Line Expense (Merah) */}
              {expensePath ? (
                <Path
                  d={expensePath}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Line Income (Hijau Emerald) */}
              {incomePath ? (
                <Path
                  d={incomePath}
                  fill="none"
                  stroke="#004C29"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Data Points Expense */}
              {expensePoints.map((pt, i) => (
                <Circle
                  key={`exp-pt-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {/* Data Points Income */}
              {incomePoints.map((pt, i) => (
                <Circle
                  key={`inc-pt-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#004C29"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}

              {/* X Axis Month Labels */}
              {monthlyData.map((d, i) => (
                <SvgText
                  key={`label-${i}`}
                  x={getX(i)}
                  y={svgHeight - 10}
                  fontSize="10"
                  fontWeight="600"
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  {d.month}
                </SvgText>
              ))}
            </Svg>
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
    backgroundColor: '#e6f3ec',
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
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  chartWrapper: {
    height: 155,
    justifyContent: 'center',
    alignItems: 'center',
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
