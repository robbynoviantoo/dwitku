import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react-native';

interface WalletsHeroCardProps {
  totalWalletBalance: number;
  totalIncome: number;
  totalExpense: number;
  walletsCount: number;
  showAmount: boolean;
  formatRupiah: (val: number) => string;
}

export function WalletsHeroCard({
  totalWalletBalance,
  totalIncome,
  totalExpense,
  walletsCount,
  showAmount,
  formatRupiah,
}: WalletsHeroCardProps) {
  return (
    <View style={styles.cardContainer}>
      {/* Background Grid Accent Pattern */}
      <View style={styles.gridOverlay} />

      {/* Header Pill */}
      <View style={styles.badgePill}>
        <Sparkles size={13} color="#86efac" />
        <Text style={styles.badgeText}>Total Wallet Balance</Text>
      </View>

      {/* Main Balance Big Number */}
      <View style={styles.mainBalanceRow}>
        <Text style={styles.currencyPrefix}>Rp</Text>
        <Text style={styles.mainBalanceText}>
          {showAmount ? formatRupiah(totalWalletBalance).replace('Rp', '').trim() : '••••••••'}
        </Text>
      </View>

      <Text style={styles.accumulatedSubtitle}>
        Accumulated from {walletsCount} active wallets/accounts
      </Text>

      {/* Bottom 2 mini cards (Total Income & Total Expense) */}
      <View style={styles.miniCardsRow}>
        <View style={styles.miniCard}>
          <View style={styles.miniCardHeader}>
            <TrendingUp size={14} color="#86efac" />
            <Text style={styles.miniCardLabel}>Total Income</Text>
          </View>
          <Text style={styles.miniCardValue} numberOfLines={1}>
            {showAmount ? formatRupiah(totalIncome) : '••••••'}
          </Text>
        </View>

        <View style={styles.miniCard}>
          <View style={styles.miniCardHeader}>
            <TrendingDown size={14} color="#fca5a5" />
            <Text style={styles.miniCardLabel}>Total Expense</Text>
          </View>
          <Text style={styles.miniCardValue} numberOfLines={1}>
            {showAmount ? formatRupiah(totalExpense) : '••••••'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#004C29',
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#004C29',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    gap: 5,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  mainBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  mainBalanceText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  accumulatedSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
    marginBottom: 16,
  },
  miniCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  miniCardLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  miniCardValue: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
