import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../services/api';
import { AppHeader } from '../components/AppHeader';

// Modular Subcomponents
import { TransactionsHeader } from './transactions/components/TransactionsHeader';
import { TransactionsSummaryBar } from './transactions/components/TransactionsSummaryBar';
import { TransactionsFilterBar } from './transactions/components/TransactionsFilterBar';
import { TransactionCardItem } from './transactions/components/TransactionCardItem';
import { TransactionsPagination } from './transactions/components/TransactionsPagination';
import { TransactionFormModal } from '../components/TransactionFormModal';

interface TransactionsScreenProps {
  user?: any;
  activeWorkspaceId: string;
  activeWorkspace?: any;
  onOpenWorkspaceModal?: () => void;
}

export default function TransactionsScreen({
  user,
  activeWorkspaceId,
  activeWorkspace,
  onOpenWorkspaceModal,
}: TransactionsScreenProps) {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAmount, setShowAmount] = useState(true);
  const [page, setPage] = useState(1);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedEditTx, setSelectedEditTx] = useState<any | null>(null);
  const limit = 10;

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filterType, debouncedSearch]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Server-side TanStack query with explicit 10 items limit & offset
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['transactions', activeWorkspaceId, filterType, debouncedSearch, page],
    queryFn: () => {
      const typeParam = filterType !== 'ALL' ? `&type=${filterType}` : '';
      const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const offset = (page - 1) * limit;
      return apiRequest(
        `/transactions?workspaceId=${activeWorkspaceId}&limit=${limit}&offset=${offset}${typeParam}${searchParam}`
      );
    },
    enabled: !!activeWorkspaceId,
  });

  // Query Wallets for form selection
  const { data: walletsData } = useQuery({
    queryKey: ['wallets', activeWorkspaceId],
    queryFn: () => apiRequest(`/wallets?workspaceId=${activeWorkspaceId}`),
    enabled: !!activeWorkspaceId,
  });

  const rawTransactions = data?.transactions || [];
  const totalCount = data?.totalCount !== undefined ? data.totalCount : rawTransactions.length;
  // Pastikan hanya 10 data yang dirender di layar
  const transactions = rawTransactions.length > limit ? rawTransactions.slice((page - 1) * limit, page * limit) : rawTransactions;
  const totalPages = data?.totalPages || Math.ceil(totalCount / limit) || 1;
  const summary = data?.summary || { totalIncome: 0, totalExpense: 0, balance: 0 };
  const categories = data?.categories || [];
  const wallets = walletsData?.wallets || [];

  const handleDelete = (tx: any) => {
    Alert.alert('Hapus Transaksi', 'Apakah Anda yakin ingin menghapus catatan transaksi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/transactions/${tx.id}`, { method: 'DELETE' });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['reports'] });
          } catch (e: any) {
            Alert.alert('Gagal Hapus', e.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Top Header Konsisten ── */}
      <AppHeader
        user={user}
        activeWorkspace={activeWorkspace}
        onOpenWorkspaceModal={onOpenWorkspaceModal}
        showAmount={showAmount}
        onToggleShowAmount={() => setShowAmount(!showAmount)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#004C29']} />}
      >
        {/* 1. Header Title & Actions (+ Add) */}
        <TransactionsHeader
          totalCount={totalCount}
          onAddPress={() => setAddModalVisible(true)}
          onExportPress={() => {}}
        />

        {/* 2. Summary 3 Cards (Income, Expense, Selisih) */}
        <TransactionsSummaryBar summary={summary} showAmount={showAmount} />

        {/* 3. Search & Filter Bar */}
        <TransactionsFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          filterType={filterType}
          onOpenFilterModal={() => setFilterModalVisible(true)}
        />

        {/* 4. List 10 Transactions */}
        {isLoading && !data ? (
          <ActivityIndicator color="#004C29" style={{ marginTop: 40 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada transaksi ditemukan</Text>
          </View>
        ) : (
          <View style={styles.txListContainer}>
            {transactions.map((tx: any) => (
              <TransactionCardItem
                key={tx.id}
                tx={tx}
                showAmount={showAmount}
                onEdit={(item) => setSelectedEditTx(item)}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 5. Fixed Center Floating Pagination Bar (Melayang di atas Floating Tab) */}
      <TransactionsPagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* ── Modal Add / Edit Transaction (Persis Screenshot) ── */}
      <TransactionFormModal
        visible={addModalVisible || !!selectedEditTx}
        transaction={selectedEditTx}
        onClose={() => {
          setAddModalVisible(false);
          setSelectedEditTx(null);
        }}
        workspaceId={activeWorkspaceId}
        categories={categories}
        wallets={wallets}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['wallets'] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });
        }}
      />

      {/* ── Modal Filter Tipe Transaksi ── */}
      <Modal visible={filterModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Filter Transaksi</Text>
            <View style={{ gap: 8, marginVertical: 14 }}>
              {[
                { key: 'ALL', label: 'Semua Tipe' },
                { key: 'EXPENSE', label: 'Pengeluaran (Expense)' },
                { key: 'INCOME', label: 'Pemasukan (Income)' },
                { key: 'TRANSFER', label: 'Pindah Saldo (Transfer)' },
              ].map((f) => {
                const isSelected = filterType === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.filterOptBtn, isSelected && styles.filterOptBtnActive]}
                    onPress={() => {
                      setFilterType(f.key as any);
                      setFilterModalVisible(false);
                    }}
                  >
                    <Text style={[styles.filterOptText, isSelected && styles.filterOptTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.modalCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 130, // Spasi lega agar tidak terhalang floating bottom tab
    gap: 12,
  },
  txListContainer: {
    gap: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 12.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  filterOptBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterOptBtnActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#004C29',
  },
  filterOptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterOptTextActive: {
    color: '#004C29',
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    padding: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
});
