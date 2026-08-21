import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { CreditCard, ChevronRight, X } from 'lucide-react-native';
import { BankSvgLogo } from '../../../components/BankSvgLogo';

interface QuickWalletsProps {
  wallets: any[];
  formatRupiah: (val: number) => string;
}

export function QuickWallets({ wallets, formatRupiah }: QuickWalletsProps) {
  const [manageVisible, setManageVisible] = useState(false);

  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CreditCard size={17} color="#047857" />
          <Text style={styles.title}>My Wallets</Text>
        </View>

        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => setManageVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.manageText}>Manage</Text>
          <ChevronRight size={13} color="#047857" />
        </TouchableOpacity>
      </View>

      {/* Body Section (2-Column Grid Matching Screenshot) */}
      <View style={styles.body}>
        {wallets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No wallets created yet</Text>
          </View>
        ) : (
          <View style={styles.walletGrid}>
            {wallets.map((w) => {
              const providerCode = (w.providerCode || w.name || '').toLowerCase();

              return (
                <View key={w.id} style={styles.walletItemCard}>
                  {/* Visual Bank / Wallet Logo SVG */}
                  <BankSvgLogo providerCode={w.providerCode} walletName={w.name} walletType={w.type} />

                  <View style={styles.walletItemInfo}>
                    <Text style={styles.walletItemName} numberOfLines={1}>
                      {w.name}
                    </Text>
                    <Text style={styles.walletItemBalance} numberOfLines={1}>
                      {formatRupiah(w.currentBalance || 0)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Modal Manage Wallets */}
      <Modal visible={manageVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Manage Wallets</Text>
              <Text style={styles.modalSubtitle}>{wallets.length} Active Accounts</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setManageVisible(false)}
              activeOpacity={0.7}
            >
              <X size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {wallets.map((w) => (
              <View key={w.id} style={styles.modalWalletRow}>
                <BankSvgLogo providerCode={w.providerCode} walletName={w.name} walletType={w.type} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.modalWalletName}>{w.name}</Text>
                  <Text style={styles.modalWalletAcc}>{w.accountNumber || w.type}</Text>
                </View>
                <Text style={styles.modalWalletBal}>{formatRupiah(w.currentBalance || 0)}</Text>
              </View>
            ))}
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
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  manageText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  walletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  walletItemCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletItemInfo: {
    flex: 1,
  },
  walletItemName: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  walletItemBalance: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
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
    paddingVertical: 12,
  },
  modalWalletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalWalletName: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalWalletAcc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  modalWalletBal: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#004C29',
  },
});
