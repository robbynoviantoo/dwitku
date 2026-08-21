import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  ChevronRight,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from 'lucide-react-native';

interface RecentTransactionsProps {
  transactions: any[];
  loading: boolean;
  formatRupiah: (val: number) => string;
}

export function RecentTransactions({
  transactions,
  loading,
  formatRupiah,
}: RecentTransactionsProps) {
  const [viewAllVisible, setViewAllVisible] = useState(false);
  const displayItems = transactions.slice(0, 6);

  const renderTransactionItem = (tx: any) => {
    const isIncome = tx.type === 'INCOME';
    const isTransfer = tx.type === 'TRANSFER';
    const amt = Number(tx.amount);

    return (
      <View key={tx.id} style={styles.txRow}>
        <View
          style={[
            styles.txIconBox,
            isTransfer
              ? { backgroundColor: '#eff6ff' }
              : isIncome
              ? { backgroundColor: '#f0fdf4' }
              : { backgroundColor: '#fef2f2' },
          ]}
        >
          {isTransfer ? (
            <ArrowRightLeft size={16} color="#2563eb" />
          ) : tx.category?.emoji ? (
            <Text style={styles.txEmoji}>{tx.category.emoji}</Text>
          ) : isIncome ? (
            <ArrowDownLeft size={16} color="#004C29" />
          ) : (
            <ArrowUpRight size={16} color="#dc2626" />
          )}
        </View>

        <View style={styles.txInfo}>
          <Text style={styles.txTitle} numberOfLines={1}>
            {isTransfer
              ? tx.note || `Transfer: ${tx.wallet?.name || 'Dompet'} ➔ ${tx.toWallet?.name || 'Tujuan'}`
              : tx.note || tx.category?.name || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
          </Text>
          <Text style={styles.txSubtitle} numberOfLines={1}>
            {isTransfer && tx.wallet && tx.toWallet
              ? `[${tx.wallet.name} → ${tx.toWallet.name}] `
              : tx.wallet
              ? `[${tx.wallet.name}] `
              : ''}
            <Text style={styles.dateText}>
              {new Date(tx.date).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </Text>
        </View>

        <Text
          style={[
            styles.txAmountText,
            isTransfer
              ? { color: '#2563eb' }
              : isIncome
              ? { color: '#004C29' }
              : { color: '#dc2626' },
          ]}
        >
          {isTransfer ? '' : isIncome ? '+' : '-'}
          {formatRupiah(amt)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recent Transactions</Text>
          <Text style={styles.subtitle}>Recently recorded transactions</Text>
        </View>

        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => setViewAllVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <ChevronRight size={13} color="#004C29" />
        </TouchableOpacity>
      </View>

      {/* Body List */}
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator color="#004C29" style={{ marginVertical: 20 }} />
        ) : displayItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions recorded</Text>
          </View>
        ) : (
          displayItems.map((tx) => renderTransactionItem(tx))
        )}
      </View>

      {/* Modal View All Transactions */}
      <Modal visible={viewAllVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>All Transactions</Text>
              <Text style={styles.modalSubtitle}>{transactions.length} Total records</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setViewAllVisible(false)}
              activeOpacity={0.7}
            >
              <X size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {transactions.map((tx) => renderTransactionItem(tx))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  viewAllText: {
    fontSize: 12,
    color: '#004C29',
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  txEmoji: {
    fontSize: 17,
  },
  txInfo: {
    flex: 1,
    marginRight: 8,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  txSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 10.5,
  },
  txAmountText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
