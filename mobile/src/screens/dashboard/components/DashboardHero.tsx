import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react-native';

interface DashboardHeroProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  formatRupiah: (val: number) => string;
}

export function DashboardHero({
  totalBalance,
  totalIncome,
  totalExpense,
  formatRupiah,
}: DashboardHeroProps) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroCardContent}>
        {/* Badge Saldo Bersih */}
        <View style={styles.heroBadge}>
          <Sparkles size={12} color="#86efac" />
          <Text style={styles.heroBadgeText}>Saldo Bersih (Net Balance)</Text>
        </View>

        {/* Nominal Besar Saldo Bersih */}
        <Text style={styles.heroAmount}>{formatRupiah(totalBalance)}</Text>

        {/* In / Out 2-Column Grid Bar */}
        <View style={styles.inOutContainer}>
          <View style={styles.inOutCol}>
            <View style={styles.inOutLabelRow}>
              <View style={[styles.inOutIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <TrendingUp size={13} color="#86efac" />
              </View>
              <Text style={styles.inOutLabel}>Total Pemasukan</Text>
            </View>
            <Text style={styles.inOutValGreen}>{formatRupiah(totalIncome)}</Text>
          </View>

          <View style={styles.inOutDivider} />

          <View style={styles.inOutCol}>
            <View style={styles.inOutLabelRow}>
              <View style={[styles.inOutIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <TrendingDown size={13} color="#fca5a5" />
              </View>
              <Text style={styles.inOutLabel}>Total Pengeluaran</Text>
            </View>
            <Text style={styles.inOutValRed}>{formatRupiah(totalExpense)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#004C29',
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#00381e',
  },
  heroCardContent: {
    padding: 20,
    backgroundColor: '#004C29',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dcfce7',
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  inOutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inOutCol: {
    flex: 1,
  },
  inOutDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 10,
  },
  inOutLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  inOutIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inOutLabel: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  inOutValGreen: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#4ade80',
    marginTop: 2,
  },
  inOutValRed: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#f87171',
    marginTop: 2,
  },
});
