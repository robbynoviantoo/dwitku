import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../services/api';
import {
  Plus,
  FolderKanban,
  ChevronDown,
  Check,
  ArrowRightLeft,
  Wallet as WalletIcon,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react-native';

import { DashboardHero } from './dashboard/components/DashboardHero';
import { FinancialCalendar } from './dashboard/components/FinancialCalendar';
import { RecentTransactions } from './dashboard/components/RecentTransactions';
import { QuickWallets } from './dashboard/components/QuickWallets';
import { DashboardSkeleton } from './dashboard/components/DashboardSkeleton';
import { AppHeader } from '../components/AppHeader';

interface DashboardScreenProps {
  user: any;
  onLogout: () => void;
  activeWorkspaceId?: string;
  onWorkspaceChange?: (wsId: string) => void;
}

function formatThousands(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseThousands(formatted: string): number {
  return Number(formatted.replace(/\./g, ''));
}

export default function DashboardScreen({
  user,
  activeWorkspaceId,
  onWorkspaceChange,
}: DashboardScreenProps) {
  const queryClient = useQueryClient();
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [showAmount, setShowAmount] = useState(true);

  // 1. Query Workspaces
  const { data: workspacesData, isLoading: loadingWs } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiRequest('/workspaces'),
  });

  const workspaces = workspacesData?.workspaces || [];
  const activeWorkspace =
    selectedWorkspace ||
    workspaces.find((w: any) => w.id === activeWorkspaceId) ||
    workspaces[0] ||
    null;

  const currentWsId = activeWorkspace?.id;

  // 2. Query Transactions
  const {
    data: txData,
    isLoading: loadingTx,
    isRefetching: refreshingTx,
    refetch: refetchTx,
  } = useQuery({
    queryKey: ['transactions', currentWsId],
    queryFn: () => apiRequest(`/transactions?workspaceId=${currentWsId}`),
    enabled: !!currentWsId,
  });

  // 3. Query Wallets
  const {
    data: walletsData,
    isLoading: loadingWallets,
    refetch: refetchWallets,
  } = useQuery({
    queryKey: ['wallets', currentWsId],
    queryFn: () => apiRequest(`/wallets?workspaceId=${currentWsId}`),
    enabled: !!currentWsId,
  });

  const transactions = txData?.transactions || [];
  const categories = txData?.categories || [];
  const summary = txData?.summary || { totalIncome: 0, totalExpense: 0, balance: 0 };
  const wallets = walletsData?.wallets || [];
  const loading = !txData && (loadingWs || loadingTx);

  // Modal State Tambah Transaksi
  const [modalVisible, setModalVisible] = useState(false);
  const [wsModalVisible, setWsModalVisible] = useState(false);
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [displayAmount, setDisplayAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedToWalletId, setSelectedToWalletId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const defaultW = wallets.find((w: any) => w.isDefault) || wallets[0];
      setSelectedWalletId(defaultW.id);
      if (wallets.length > 1 && !selectedToWalletId) {
        const secondW = wallets.find((w: any) => w.id !== defaultW.id);
        if (secondW) setSelectedToWalletId(secondW.id);
      }
    }
  }, [wallets, selectedWalletId, selectedToWalletId]);

  const onRefresh = async () => {
    await Promise.all([refetchTx(), refetchWallets()]);
  };

  const handleSelectWorkspace = (ws: any) => {
    setSelectedWorkspace(ws);
    setWsModalVisible(false);
    if (onWorkspaceChange) {
      onWorkspaceChange(ws.id);
    }
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatThousands(text);
    setDisplayAmount(formatted);
  };

  const handleCreateTransaction = async () => {
    const parsedAmt = parseThousands(displayAmount);
    if (!parsedAmt || parsedAmt <= 0) {
      Alert.alert('Perhatian', 'Nominal harus lebih dari 0');
      return;
    }

    if (txType !== 'TRANSFER' && !selectedCategoryId) {
      Alert.alert('Perhatian', 'Kategori wajib dipilih');
      return;
    }

    if (txType === 'TRANSFER' && (!selectedWalletId || !selectedToWalletId)) {
      Alert.alert('Perhatian', 'Dompet asal dan tujuan wajib dipilih');
      return;
    }

    if (txType === 'TRANSFER' && selectedWalletId === selectedToWalletId) {
      Alert.alert('Perhatian', 'Dompet asal dan tujuan tidak boleh sama');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: parsedAmt,
          note,
          type: txType,
          workspaceId: activeWorkspace.id,
          categoryId: txType === 'TRANSFER' ? null : selectedCategoryId,
          walletId: selectedWalletId || null,
          toWalletId: txType === 'TRANSFER' ? selectedToWalletId : null,
        }),
      });

      setModalVisible(false);
      setDisplayAmount('');
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['transactions', activeWorkspace.id] });
      queryClient.invalidateQueries({ queryKey: ['wallets', activeWorkspace.id] });
      queryClient.invalidateQueries({ queryKey: ['reports', activeWorkspace.id] });
    } catch (err: any) {
      Alert.alert('Gagal Simpan', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    if (!showAmount) return '••••••••';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalWalletBalance = wallets.reduce((acc, w) => acc + (w.currentBalance || 0), 0);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Sobat';

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 11) return 'Selamat Pagi';
    if (hours >= 11 && hours < 15) return 'Selamat Siang';
    if (hours >= 15 && hours < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Reusable Unified Top Header ── */}
      <AppHeader
        user={user}
        activeWorkspace={activeWorkspace}
        onOpenWorkspaceModal={() => setWsModalVisible(true)}
        showAmount={showAmount}
        onToggleShowAmount={() => setShowAmount(!showAmount)}
        onOpenAddModal={() => {
          setDisplayAmount('');
          setNote('');
          setModalVisible(true);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshingTx} onRefresh={onRefresh} colors={['#004C29']} />}
      >
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* ── 1. Hero Card (Saldo Bersih & Total Masuk/Keluar) ── */}
            <DashboardHero
              totalBalance={wallets.length > 0 ? totalWalletBalance : summary.balance}
              totalIncome={summary.totalIncome}
              totalExpense={summary.totalExpense}
              formatRupiah={formatRupiah}
            />

            {/* ── 2. Kalender Keuangan (Financial Calendar) ── */}
            <FinancialCalendar
              transactions={transactions}
              showAmount={showAmount}
              formatRupiah={formatRupiah}
            />

            {/* ── 3. Transaksi Terkini (Recent Transactions) ── */}
            <RecentTransactions
              transactions={transactions}
              loading={loading}
              formatRupiah={formatRupiah}
            />

            {/* ── 4. Dompet & Rekening Berada di Paling Bawah (Quick Wallets) ── */}
            <QuickWallets
              wallets={wallets}
              formatRupiah={formatRupiah}
            />
          </>
        )}
      </ScrollView>

      {/* ── Modal Catat Transaksi Baru ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Catat Transaksi Baru</Text>

            {/* Tab Tipe Transaksi */}
            <View style={styles.typeSelectorContainer}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  txType === 'EXPENSE' && { backgroundColor: '#dc2626' },
                ]}
                onPress={() => setTxType('EXPENSE')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    txType === 'EXPENSE' && { color: '#ffffff', fontWeight: 'bold' },
                  ]}
                >
                  Pengeluaran
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  txType === 'INCOME' && { backgroundColor: '#004C29' },
                ]}
                onPress={() => setTxType('INCOME')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    txType === 'INCOME' && { color: '#ffffff', fontWeight: 'bold' },
                  ]}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  txType === 'TRANSFER' && { backgroundColor: '#2563eb' },
                ]}
                onPress={() => setTxType('TRANSFER')}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    txType === 'TRANSFER' && { color: '#ffffff', fontWeight: 'bold' },
                  ]}
                >
                  Transfer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input Nominal */}
            <Text style={styles.inputLabel}>Nominal (Rp) *</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.rpPrefix}>Rp</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={displayAmount}
                onChangeText={handleAmountChange}
              />
            </View>

            {/* Dompet Asal */}
            {wallets.length > 0 && (
              <>
                <Text style={styles.inputLabel}>
                  {txType === 'TRANSFER' ? 'Dari Dompet Asal *' : 'Gunakan Dompet (Opsional)'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {wallets.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={[
                        styles.chipItem,
                        selectedWalletId === w.id && styles.chipItemActive,
                      ]}
                      onPress={() => setSelectedWalletId(w.id)}
                    >
                      <WalletIcon size={12} color={selectedWalletId === w.id ? '#ffffff' : '#64748b'} />
                      <Text
                        style={[
                          styles.chipItemText,
                          selectedWalletId === w.id && styles.chipItemTextActive,
                        ]}
                      >
                        {w.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Dompet Tujuan (Jika Transfer) */}
            {txType === 'TRANSFER' && wallets.length > 1 && (
              <>
                <Text style={styles.inputLabel}>Ke Dompet Tujuan *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {wallets
                    .filter((w) => w.id !== selectedWalletId)
                    .map((w) => (
                      <TouchableOpacity
                        key={w.id}
                        style={[
                          styles.chipItem,
                          selectedToWalletId === w.id && styles.chipItemActiveBlue,
                        ]}
                        onPress={() => setSelectedToWalletId(w.id)}
                      >
                        <ArrowRightLeft size={12} color={selectedToWalletId === w.id ? '#ffffff' : '#64748b'} />
                        <Text
                          style={[
                            styles.chipItemText,
                            selectedToWalletId === w.id && styles.chipItemTextActive,
                          ]}
                        >
                          {w.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}

            {/* Kategori (Jika bukan Transfer) */}
            {txType !== 'TRANSFER' && (
              <>
                <Text style={styles.inputLabel}>Pilih Kategori *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {categories
                    .filter((c) => c.type === txType)
                    .map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.chipItem,
                          selectedCategoryId === cat.id && styles.chipItemActive,
                        ]}
                        onPress={() => setSelectedCategoryId(cat.id)}
                      >
                        <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                        <Text
                          style={[
                            styles.chipItemText,
                            selectedCategoryId === cat.id && styles.chipItemTextActive,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}

            {/* Catatan */}
            <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contoh: Belanja bulanan / Makan siang"
              placeholderTextColor="#94a3b8"
              value={note}
              onChangeText={setNote}
            />

            {/* Tombol Aksi */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  txType === 'TRANSFER'
                    ? { backgroundColor: '#2563eb' }
                    : txType === 'INCOME'
                    ? { backgroundColor: '#004C29' }
                    : { backgroundColor: '#dc2626' },
                ]}
                onPress={handleCreateTransaction}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal Switch Workspace (Dribbble Grade Bottom Sheet) ── */}
      <Modal
        visible={wsModalVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setWsModalVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          {/* Backdrop Tap to Close */}
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setWsModalVisible(false)}
          />

          <View style={styles.sheetContent}>
            {/* Grabber indicator */}
            <View style={styles.sheetGrabber} />

            {/* Header Section */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Pilih Ruang Kerja</Text>
                <Text style={styles.sheetSubtitle}>Kelola atau beralih akun pembukuan</Text>
              </View>
              <TouchableOpacity
                style={styles.sheetCloseBtn}
                onPress={() => setWsModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.sheetCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>

            {/* List Ruang Kerja */}
            <ScrollView
              style={{ maxHeight: 340 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
            >
              {workspaces.map((ws: any) => {
                const isActive = activeWorkspace?.id === ws.id;
                return (
                  <TouchableOpacity
                    key={ws.id}
                    style={[styles.wsCard, isActive && styles.wsCardActive]}
                    onPress={() => handleSelectWorkspace(ws)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.wsCardIconBox, isActive && styles.wsCardIconBoxActive]}>
                      <FolderKanban size={20} color={isActive ? '#ffffff' : '#475569'} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.wsCardName, isActive && styles.wsCardNameActive]}>
                          {ws.name}
                        </Text>
                        {isActive && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>Aktif</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.wsCardDesc}>
                        {ws.members?.length || 1} Anggota • {ws.currency || 'IDR'}
                      </Text>
                    </View>

                    <View style={[styles.wsRadio, isActive && styles.wsRadioActive]}>
                      {isActive && <View style={styles.wsRadioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  wsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  wsName: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#004C29',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 14,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  typeBtnText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 6,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  rpPrefix: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748b',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  chipScroll: {
    marginVertical: 4,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
    gap: 6,
  },
  chipItemActive: {
    backgroundColor: '#004C29',
  },
  chipItemActiveBlue: {
    backgroundColor: '#2563eb',
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipItemText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
  },
  chipItemTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
  },
  cancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#004C29',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  sheetGrabber: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sheetCloseBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sheetCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  wsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  wsCardActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  wsCardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wsCardIconBoxActive: {
    backgroundColor: '#004C29',
  },
  wsCardName: {
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  wsCardNameActive: {
    color: '#004C29',
  },
  wsCardDesc: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 3,
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#004C29',
  },
  wsRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wsRadioActive: {
    borderColor: '#004C29',
  },
  wsRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#004C29',
  },
});
