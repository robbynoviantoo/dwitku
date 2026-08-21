import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  User,
  Hash,
} from 'lucide-react-native';
import { BankSvgLogo } from '../../../components/BankSvgLogo';

interface WalletCardItemProps {
  wallet: any;
  index: number;
  totalCount: number;
  isReordering: boolean;
  showAmount: boolean;
  formatRupiah: (val: number) => string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WalletCardItem({
  wallet,
  index,
  totalCount,
  isReordering,
  showAmount,
  formatRupiah,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: WalletCardItemProps) {
  return (
    <View style={styles.card}>
      {/* Top Header: Drag handle / Reorder icon + Logo + Name & Type + Action buttons */}
      <View style={styles.topRow}>
        <View style={styles.leftInfoRow}>
          {/* Reorder Grip / Position indicator */}
          <View style={styles.gripBox}>
            <GripVertical size={16} color={isReordering ? '#004C29' : '#cbd5e1'} />
          </View>

          {/* Logo Provider */}
          <BankSvgLogo
            providerCode={wallet.providerCode}
            walletName={wallet.name}
            walletType={wallet.type}
            size={36}
          />

          {/* Name & Type */}
          <View style={styles.nameContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.walletName} numberOfLines={1}>
                {wallet.name}
              </Text>
              {wallet.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Utama</Text>
                </View>
              )}
            </View>
            <Text style={styles.walletType}>{wallet.type}</Text>
          </View>
        </View>

        {/* Right Actions: Reorder Arrows (‹ › / ▴ ▾) & Edit & Delete */}
        <View style={styles.actionsRow}>
          {/* Reorder Up/Down arrows */}
          <View style={styles.reorderArrowsContainer}>
            <TouchableOpacity
              style={[styles.arrowBtn, index === 0 && styles.arrowBtnDisabled]}
              onPress={onMoveUp}
              disabled={index === 0}
              activeOpacity={0.7}
            >
              <ChevronUp size={13} color={index === 0 ? '#cbd5e1' : '#475569'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowBtn, index === totalCount - 1 && styles.arrowBtnDisabled]}
              onPress={onMoveDown}
              disabled={index === totalCount - 1}
              activeOpacity={0.7}
            >
              <ChevronDown size={13} color={index === totalCount - 1 ? '#cbd5e1' : '#475569'} />
            </TouchableOpacity>
          </View>

          {/* Edit Icon */}
          <TouchableOpacity style={styles.iconActionBtn} onPress={onEdit} activeOpacity={0.7}>
            <Pencil size={15} color="#64748b" />
          </TouchableOpacity>

          {/* Delete Icon */}
          <TouchableOpacity style={styles.iconActionBtn} onPress={onDelete} activeOpacity={0.7}>
            <Trash2 size={15} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Middle Box: Account Holder & Number */}
      {(wallet.holderName || wallet.accountNumber) && (
        <View style={styles.metaBox}>
          {wallet.holderName ? (
            <View style={styles.metaRow}>
              <View style={styles.metaLabelRow}>
                <User size={13} color="#94a3b8" />
                <Text style={styles.metaLabel}>Account Holder</Text>
              </View>
              <Text style={styles.metaValue} numberOfLines={1}>
                {wallet.holderName}
              </Text>
            </View>
          ) : null}

          {wallet.accountNumber ? (
            <View style={[styles.metaRow, wallet.holderName && { marginTop: 6 }]}>
              <View style={styles.metaLabelRow}>
                <Hash size={13} color="#94a3b8" />
                <Text style={styles.metaLabel}>Account / Phone Number</Text>
              </View>
              <Text style={styles.metaValue} numberOfLines={1}>
                {wallet.accountNumber}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Bottom Row: Current Balance & Transactions count */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
          <Text style={styles.balanceAmount}>
            {showAmount ? formatRupiah(wallet.currentBalance || 0) : '••••••••'}
          </Text>
        </View>

        <Text style={styles.txCountText}>
          {wallet.transactionsCount || 0} Transactions
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  gripBox: {
    paddingRight: 6,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10,
  },
  walletName: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#0f172a',
    flexShrink: 1,
  },
  defaultBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803d',
  },
  walletType: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reorderArrowsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 2,
    gap: 2,
  },
  arrowBtn: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  arrowBtnDisabled: {
    backgroundColor: 'transparent',
  },
  iconActionBtn: {
    padding: 5,
  },
  metaBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  metaValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  txCountText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
