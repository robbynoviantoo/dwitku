import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Flame, Building2 } from 'lucide-react-native';
import { BankSvgLogo } from '../../../components/BankSvgLogo';

interface ReportsDeepInsightsProps {
  topTransactions: Array<{
    id: string;
    note: string;
    amount: number;
    date: string;
    category?: { name: string; emoji: string; color: string } | null;
    wallet?: { name: string; providerCode: string | null } | null;
  }>;
  walletDistribution: Array<{
    name: string;
    providerCode: string | null;
    color: string;
    value: number;
  }>;
  showAmount: boolean;
  formatRupiah: (val: number) => string;
}

export function ReportsDeepInsights({
  topTransactions = [],
  walletDistribution = [],
  showAmount,
  formatRupiah,
}: ReportsDeepInsightsProps) {
  const totalWalletExpense = walletDistribution.reduce((acc, w) => acc + (w.value || 0), 0);

  const formatDate = (dStr: string) => {
    const d = new Date(dStr);
    return `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })}`;
  };

  return (
    <View style={styles.container}>
      {/* ── 1. Top 5 Largest Expenses ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconBox, { backgroundColor: '#fff7ed' }]}>
              <Flame size={16} color="#f97316" />
            </View>
            <Text style={styles.cardTitle}>Top 5 Largest Expenses</Text>
          </View>
          <Text style={styles.topBadge}>TOP 5</Text>
        </View>

        <View style={styles.listDivide}>
          {topTransactions.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada pengeluaran periode ini</Text>
          ) : (
            topTransactions.map((tx, idx) => (
              <View key={tx.id} style={styles.txRow}>
                <Text style={styles.rankNum}>#{idx + 1}</Text>
                <View style={styles.emojiBox}>
                  <Text style={{ fontSize: 14 }}>{tx.category?.emoji || '💸'}</Text>
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.txName} numberOfLines={1}>
                    {tx.note}
                  </Text>
                  <Text style={styles.txSub} numberOfLines={1}>
                    {tx.wallet?.name ? `[${tx.wallet.name}] ` : ''}
                    {formatDate(tx.date)}
                  </Text>
                </View>
                <Text style={styles.txAmount}>
                  -{showAmount ? formatRupiah(tx.amount) : '••••••'}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* ── 2. Expense Breakdown by Wallet ── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconBox}>
              <Building2 size={16} color="#004C29" />
            </View>
            <Text style={styles.cardTitle}>Expense by Wallet</Text>
          </View>
          <Text style={styles.topBadge}>DOMPET</Text>
        </View>

        <View style={styles.walletList}>
          {walletDistribution.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada pengeluaran dari dompet</Text>
          ) : (
            walletDistribution.map((w, idx) => {
              const pct = totalWalletExpense > 0 ? Math.round((w.value / totalWalletExpense) * 100) : 0;
              return (
                <View key={idx} style={styles.walletRow}>
                  <View style={styles.walletInfoRow}>
                    <BankSvgLogo providerCode={w.providerCode} walletName={w.name} size={22} />
                    <Text style={styles.walletName} numberOfLines={1}>
                      {w.name}
                    </Text>
                    <Text style={styles.walletVal}>
                      {showAmount ? formatRupiah(w.value) : '••••••'}
                    </Text>
                    <Text style={styles.walletPct}>{pct}%</Text>
                  </View>

                  <View style={styles.walletProgressBarBg}>
                    <View
                      style={[
                        styles.walletProgressBarFill,
                        { width: `${Math.min(pct, 100)}%`, backgroundColor: '#004C29' },
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  topBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  listDivide: {
    gap: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  rankNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    width: 24,
  },
  emojiBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  txName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  txSub: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginTop: 1,
  },
  txAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#dc2626',
  },
  walletList: {
    gap: 12,
  },
  walletRow: {
    gap: 6,
  },
  walletInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginLeft: 8,
  },
  walletVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 8,
  },
  walletPct: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#004C29',
    width: 32,
    textAlign: 'right',
  },
  walletProgressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  walletProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    paddingVertical: 14,
  },
});
