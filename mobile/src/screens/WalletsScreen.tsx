import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../services/api';
import { AppHeader } from '../components/AppHeader';
import {
  CreditCard,
  Plus,
  ArrowUpDown,
  Wallet as WalletIcon,
} from 'lucide-react-native';
import { WalletsHeroCard } from './wallets/components/WalletsHeroCard';
import { WalletCardItem } from './wallets/components/WalletCardItem';
import { WalletFormModal } from '../components/WalletFormModal';

interface WalletsScreenProps {
  user?: any;
  activeWorkspaceId: string;
  activeWorkspace?: any;
  onOpenWorkspaceModal?: () => void;
}

export default function WalletsScreen({
  user,
  activeWorkspaceId,
  activeWorkspace,
  onOpenWorkspaceModal,
}: WalletsScreenProps) {
  const queryClient = useQueryClient();
  const [showAmount, setShowAmount] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // TanStack Query Wallets
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['wallets', activeWorkspaceId],
    queryFn: () => apiRequest(`/wallets?workspaceId=${activeWorkspaceId}`),
    enabled: !!activeWorkspaceId,
  });

  const wallets = data?.wallets || [];
  
  // Hitung langsung dari data wallets agar 100% konsisten dan independen dari cache server
  const calculatedTotalBalance = wallets.reduce((acc: number, w: any) => acc + (w.currentBalance || 0), 0);
  const totalIncome = wallets.reduce((acc: number, w: any) => acc + (w.totalIncome || 0), 0);
  const totalExpense = wallets.reduce((acc: number, w: any) => acc + (w.totalExpense || 0), 0);

  const formatRupiah = (val: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.round(val || 0));
  };

  // Reorder Handler (Move item up / down and persist to API)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= wallets.length) return;

    const newWallets = [...wallets];
    const [moved] = newWallets.splice(index, 1);
    newWallets.splice(targetIndex, 0, moved);

    // Optimistically update cache
    queryClient.setQueryData(['wallets', activeWorkspaceId], {
      ...data,
      wallets: newWallets,
    });

    try {
      const orders = newWallets.map((w, idx) => ({ id: w.id, order: idx }));
      await apiRequest('/wallets/reorder', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: activeWorkspaceId,
          orders,
        }),
      });
    } catch (err: any) {
      refetch();
    }
  };

  // Delete Wallet Handler
  const handleDelete = (walletItem: any) => {
    Alert.alert(
      'Hapus Dompet',
      `Apakah Anda yakin ingin menghapus dompet "${walletItem.name}"? Seluruh transaksi yang terhubung akan disesuaikan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(`/wallets/${walletItem.id}`, { method: 'DELETE' });
              queryClient.invalidateQueries({ queryKey: ['wallets'] });
              queryClient.invalidateQueries({ queryKey: ['transactions'] });
              queryClient.invalidateQueries({ queryKey: ['reports'] });
            } catch (e: any) {
              Alert.alert('Gagal Menghapus', e.message || 'Terjadi kesalahan');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Top Greeting & Workspace Selector */}
      <AppHeader
        user={user}
        activeWorkspace={activeWorkspace}
        onOpenWorkspaceModal={onOpenWorkspaceModal}
        showAmount={showAmount}
        onToggleShowAmount={() => setShowAmount(!showAmount)}
        onOpenAddModal={() => {
          setSelectedWallet(null);
          setFormOpen(true);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#004C29']}
          />
        }
      >
        {/* 2. Page Title Header: "Wallets & Accounts" & Action Buttons (+ Add Wallet, Reorder) */}
        <View style={styles.pageHeader}>
          <View style={styles.pageTitleRow}>
            <CreditCard size={18} color="#004C29" />
            <Text style={styles.pageTitle}>Wallets & Accounts</Text>
          </View>
          <Text style={styles.pageSubtitle}>
            Manage bank accounts, e-wallets, and cash in one place.
          </Text>

          {/* Action Button Row: Reorder & + Add Wallet */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.reorderBtn, isReordering && styles.reorderBtnActive]}
              onPress={() => setIsReordering(!isReordering)}
              activeOpacity={0.7}
            >
              <ArrowUpDown size={14} color={isReordering ? '#004C29' : '#475569'} />
              <Text style={[styles.reorderBtnText, isReordering && styles.reorderBtnTextActive]}>
                {isReordering ? 'Done' : 'Reorder'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addWalletBtn}
              onPress={() => {
                setSelectedWallet(null);
                setFormOpen(true);
              }}
              activeOpacity={0.8}
            >
              <Plus size={15} color="#ffffff" />
              <Text style={styles.addWalletBtnText}>Add Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Hero Green Card: Total Wallet Balance, Income, Expense, Grid */}
        <WalletsHeroCard
          totalWalletBalance={calculatedTotalBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          walletsCount={wallets.length}
          showAmount={showAmount}
          formatRupiah={formatRupiah}
        />

        {/* 4. List Wallets Matching 1:1 Screenshot */}
        {isLoading && !data ? (
          <ActivityIndicator color="#004C29" style={{ marginTop: 40 }} />
        ) : wallets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <WalletIcon size={44} color="#94a3b8" />
            <Text style={styles.emptyText}>Belum ada dompet terdaftar</Text>
          </View>
        ) : (
          <View style={styles.walletsList}>
            {wallets.map((w: any, index: number) => (
              <WalletCardItem
                key={w.id}
                wallet={w}
                index={index}
                totalCount={wallets.length}
                isReordering={isReordering}
                showAmount={showAmount}
                formatRupiah={formatRupiah}
                onMoveUp={() => handleMove(index, 'up')}
                onMoveDown={() => handleMove(index, 'down')}
                onEdit={() => {
                  setSelectedWallet(w);
                  setFormOpen(true);
                }}
                onDelete={() => handleDelete(w)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 5. Modal Dialog Add / Edit Wallet (Persis Web wallet-form-dialog) */}
      <WalletFormModal
        visible={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedWallet(null);
        }}
        workspaceId={activeWorkspaceId}
        wallet={selectedWallet}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['wallets'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 110, // Ruang aman di atas floating bar
  },
  pageHeader: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  reorderBtnActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  reorderBtnText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#334155',
  },
  reorderBtnTextActive: {
    color: '#004C29',
  },
  addWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#004C29',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addWalletBtnText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  walletsList: {
    paddingHorizontal: 16,
  },
});
