import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../services/api';
import { AppHeader } from '../components/AppHeader';

// Modular Subcomponents
import { TransactionsHeader } from './transactions/components/TransactionsHeader';
import { TransactionsSummaryBar } from './transactions/components/TransactionsSummaryBar';
import { TransactionsFilterPanel } from './transactions/components/TransactionsFilterPanel';
import { TransactionCardItem } from './transactions/components/TransactionCardItem';
import { TransactionsPagination } from './transactions/components/TransactionsPagination';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { ScanReceiptModal, ScanResultData } from '../components/ScanReceiptModal';

interface TransactionsScreenProps {
  user?: any;
  activeWorkspaceId: string;
  activeWorkspace?: any;
  onOpenWorkspaceModal?: () => void;
  openAddTrigger?: number;
}

export default function TransactionsScreen({
  user,
  activeWorkspaceId,
  activeWorkspace,
  onOpenWorkspaceModal,
  openAddTrigger,
}: TransactionsScreenProps) {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'>('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAmount, setShowAmount] = useState(true);
  const [page, setPage] = useState(1);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedEditTx, setSelectedEditTx] = useState<any | null>(null);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanPrefill, setScanPrefill] = useState<ScanResultData | null>(null);
  const limit = 10;

  // Auto-open Add Transaction Modal when triggered externally
  useEffect(() => {
    if (openAddTrigger && openAddTrigger > 0) {
      setSelectedEditTx(null);
      setScanPrefill(null);
      setAddModalVisible(true);
    }
  }, [openAddTrigger]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filterType, selectedCategoryId, selectedWalletId, dateRange.startDate, dateRange.endDate, debouncedSearch]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setFilterType('ALL');
    setSelectedCategoryId(undefined);
    setSelectedWalletId(undefined);
    setDateRange({ startDate: '', endDate: '' });
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(1);
  };

  // Server-side TanStack query with all active filters
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: [
      'transactions',
      activeWorkspaceId,
      filterType,
      selectedCategoryId,
      selectedWalletId,
      dateRange.startDate,
      dateRange.endDate,
      debouncedSearch,
      page,
    ],
    queryFn: () => {
      const typeParam = filterType !== 'ALL' ? `&type=${filterType}` : '';
      const catParam = selectedCategoryId ? `&categoryId=${selectedCategoryId}` : '';
      const walletParam = selectedWalletId ? `&walletId=${selectedWalletId}` : '';
      const dateFromParam = dateRange.startDate ? `&dateFrom=${dateRange.startDate}` : '';
      const dateToParam = dateRange.endDate ? `&dateTo=${dateRange.endDate}` : '';
      const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const offset = (page - 1) * limit;

      return apiRequest(
        `/transactions?workspaceId=${activeWorkspaceId}&limit=${limit}&offset=${offset}${typeParam}${catParam}${walletParam}${dateFromParam}${dateToParam}${searchParam}`
      );
    },
    enabled: !!activeWorkspaceId,
  });

  // Query Wallets for form & filter selection
  const { data: walletsData } = useQuery({
    queryKey: ['wallets', activeWorkspaceId],
    queryFn: () => apiRequest(`/wallets?workspaceId=${activeWorkspaceId}`),
    enabled: !!activeWorkspaceId,
  });

  const rawTransactions = data?.transactions || [];
  const totalCount = data?.totalCount !== undefined ? data.totalCount : rawTransactions.length;
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
      {/* ── 1. FIXED TOP HEADER (FREEZE / STICKY DI ATAS) ── */}
      <View style={styles.frozenHeader}>
        <AppHeader
          user={user}
          activeWorkspace={activeWorkspace}
          onOpenWorkspaceModal={onOpenWorkspaceModal}
          showAmount={showAmount}
          onToggleShowAmount={() => setShowAmount(!showAmount)}
        />

        <View style={styles.frozenHeaderContent}>
          {/* Header Title & Actions (+ Add + Scan) */}
          <TransactionsHeader
            totalCount={totalCount}
            onAddPress={() => setAddModalVisible(true)}
            onScanPress={() => setScanModalVisible(true)}
            onExportPress={() => {}}
          />

          {/* Summary 3 Cards (Income, Expense, Selisih) */}
          <TransactionsSummaryBar summary={summary} showAmount={showAmount} />

          {/* Full-featured Filter Panel (Search + Type, Cat, Wallet, Date) */}
          <TransactionsFilterPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            selectedWalletId={selectedWalletId}
            onWalletChange={setSelectedWalletId}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            categories={categories}
            wallets={wallets}
            onReset={handleResetFilters}
          />
        </View>
      </View>

      {/* ── 2. SCROLLABLE TRANSACTION LIST (Hanya List yang Bergerak Saat Di-scroll) ── */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#004C29']}
          />
        }
        ListEmptyComponent={
          isLoading && !data ? (
            <ActivityIndicator color="#004C29" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada transaksi ditemukan</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TransactionCardItem
            tx={item}
            showAmount={showAmount}
            onEdit={(itemEdit) => setSelectedEditTx(itemEdit)}
            onDelete={handleDelete}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* ── 3. FIXED BOTTOM FLOATING PAGINATION BAR ── */}
      <TransactionsPagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* ── Modal Add / Edit Transaction ── */}
      <TransactionFormModal
        visible={addModalVisible || !!selectedEditTx}
        transaction={selectedEditTx}
        prefillData={scanPrefill}
        onClose={() => {
          setAddModalVisible(false);
          setSelectedEditTx(null);
          setScanPrefill(null);
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

      {/* ── Modal Scan Struk AI ── */}
      <ScanReceiptModal
        visible={scanModalVisible}
        workspaceId={activeWorkspaceId}
        onClose={() => setScanModalVisible(false)}
        onSuccess={(dataScanned) => {
          setScanPrefill(dataScanned);
          setScanModalVisible(false);
          setAddModalVisible(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  frozenHeader: {
    backgroundColor: '#f8fafc',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  frozenHeaderContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 140, // Ruang aman di atas floating bottom bar & pagination
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 12.5,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
