import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Pencil, Trash2, ArrowRight } from 'lucide-react-native';
import { BankSvgLogo } from '../../../components/BankSvgLogo';

interface TransactionCardItemProps {
  tx: any;
  showAmount: boolean;
  onEdit?: (tx: any) => void;
  onDelete?: (tx: any) => void;
}

export function TransactionCardItem({
  tx,
  showAmount,
  onEdit,
  onDelete,
}: TransactionCardItemProps) {
  const isTransfer = tx.type === 'TRANSFER';
  const isIncome = tx.type === 'INCOME';
  const isExpense = tx.type === 'EXPENSE';

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  return (
    <View style={styles.txCard}>
      {/* Top Row: Category icon, Note, Date & Amount */}
      <View style={styles.txTopRow}>
        <View style={styles.txLeftCol}>
          <View style={styles.txEmojiBox}>
            <Text style={{ fontSize: 16 }}>{tx.category?.emoji || (isTransfer ? '🔄' : '🏷️')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.txNote} numberOfLines={1}>
              {isTransfer ? (tx.note || 'Pindah Saldo') : (tx.note || tx.category?.name || 'Transaksi')}
            </Text>
            <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.txAmount,
            isExpense && styles.txAmountExp,
            isIncome && styles.txAmountInc,
            isTransfer && styles.txAmountTrf,
          ]}
        >
          {isExpense ? '-Rp ' : isIncome ? '+Rp ' : 'Rp '}
          {showAmount ? new Intl.NumberFormat('id-ID').format(tx.amount) : '••••••'}
        </Text>
      </View>

      {/* Bottom Row: Wallet Badge, User Name & Action Icons */}
      <View style={styles.txBottomRow}>
        <View style={styles.txWalletInfo}>
          {isTransfer ? (
            <View style={styles.transferWalletRow}>
              <View style={styles.walletPill}>
                <BankSvgLogo providerCode={tx.wallet?.providerCode} walletName={tx.wallet?.name} size={18} />
                <Text style={styles.walletPillText} numberOfLines={1}>
                  {tx.wallet?.name ?? '-'}
                </Text>
              </View>
              <ArrowRight size={11} color="#94a3b8" />
              <View style={styles.walletPill}>
                <BankSvgLogo providerCode={tx.toWallet?.providerCode} walletName={tx.toWallet?.name} size={18} />
                <Text style={styles.walletPillText} numberOfLines={1}>
                  {tx.toWallet?.name ?? '-'}
                </Text>
              </View>
            </View>
          ) : tx.wallet ? (
            <View style={styles.walletPill}>
              <BankSvgLogo providerCode={tx.wallet.providerCode} walletName={tx.wallet.name} size={18} />
              <Text style={styles.walletPillText} numberOfLines={1}>
                {tx.wallet.name}
              </Text>
            </View>
          ) : null}

          {tx.createdBy?.name ? (
            <Text style={styles.userNameText} numberOfLines={1}>
              {tx.createdBy.name}
            </Text>
          ) : null}
        </View>

        {/* Action buttons */}
        <View style={styles.txActions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionIconBtn} onPress={() => onEdit(tx)} activeOpacity={0.6}>
              <Pencil size={13} color="#94a3b8" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionIconBtn} onPress={() => onDelete(tx)} activeOpacity={0.6}>
              <Trash2 size={13} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  txCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  txEmojiBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  txNote: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  txDate: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  txAmountExp: {
    color: '#dc2626',
  },
  txAmountInc: {
    color: '#004C29',
  },
  txAmountTrf: {
    color: '#2563eb',
  },
  txBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  txWalletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  transferWalletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: 130,
  },
  walletPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
  },
  userNameText: {
    fontSize: 10.5,
    color: '#94a3b8',
    maxWidth: 110,
  },
  txActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionIconBtn: {
    padding: 4,
  },
});
