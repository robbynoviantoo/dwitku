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
} from 'react-native';
import { apiRequest } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  FolderKanban,
  ChevronDown,
  Check,
  ArrowRightLeft,
  Wallet as WalletIcon,
} from 'lucide-react-native';

interface DashboardScreenProps {
  user: any;
  onLogout: () => void;
  activeWorkspaceId?: string;
  onWorkspaceChange?: (wsId: string) => void;
}

// Helper format nominal ribuan
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
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [wsModalVisible, setWsModalVisible] = useState(false);
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [rawAmount, setRawAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedToWalletId, setSelectedToWalletId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      fetchTransactions(activeWorkspace.id);
      fetchWallets(activeWorkspace.id);
    }
  }, [activeWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const data = await apiRequest('/workspaces');
      const wsList = data.workspaces || [];
      setWorkspaces(wsList);
      if (wsList.length > 0) {
        if (activeWorkspaceId) {
          const found = wsList.find((w: any) => w.id === activeWorkspaceId);
          setActiveWorkspace(found || wsList[0]);
        } else {
          setActiveWorkspace(wsList[0]);
        }
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setLoading(false);
    }
  };

  const fetchTransactions = async (wsId: string) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/transactions?workspaceId=${wsId}`);
      setTransactions(data.transactions || []);
      setCategories(data.categories || []);
      setSummary(data.summary || { totalIncome: 0, totalExpense: 0, balance: 0 });
      if (data.categories && data.categories.length > 0) {
        setSelectedCategoryId(data.categories[0].id);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async (wsId: string) => {
    try {
      const data = await apiRequest(`/wallets?workspaceId=${wsId}`);
      const wList = data.wallets || [];
      setWallets(wList);
      if (wList.length > 0) {
        const defaultW = wList.find((w: any) => w.isDefault) || wList[0];
        setSelectedWalletId(defaultW.id);
        if (wList.length > 1) {
          const secondW = wList.find((w: any) => w.id !== defaultW.id);
          if (secondW) setSelectedToWalletId(secondW.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectWorkspace = (ws: any) => {
    setActiveWorkspace(ws);
    setWsModalVisible(false);
    if (onWorkspaceChange) {
      onWorkspaceChange(ws.id);
    }
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatThousands(text);
    setDisplayAmount(formatted);
    setRawAmount(String(parseThousands(formatted) || ''));
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
      setRawAmount('');
      setNote('');
      fetchTransactions(activeWorkspace.id);
      fetchWallets(activeWorkspace.id);
    } catch (err: any) {
      Alert.alert('Gagal Simpan', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalWalletBalance = wallets.reduce((acc, w) => acc + (w.currentBalance || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.name || 'User'} 👋</Text>
          <TouchableOpacity
            style={styles.wsSelector}
            onPress={() => setWsModalVisible(true)}
          >
            <FolderKanban size={14} color="#16a34a" />
            <Text style={styles.wsName}>{activeWorkspace?.name || 'Workspace'}</Text>
            <ChevronDown size={14} color="#71717a" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addIconBtn}
          onPress={() => {
            setDisplayAmount('');
            setRawAmount('');
            setNote('');
            setModalVisible(true);
          }}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Ringkasan Saldo Modern */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Total Saldo Bersih</Text>
          <Text style={styles.balanceAmount}>
            {formatRupiah(wallets.length > 0 ? totalWalletBalance : summary.balance)}
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.iconBadge, { backgroundColor: '#dcfce7' }]}>
                <TrendingUp size={16} color="#16a34a" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Pemasukan Bulan Ini</Text>
                <Text style={styles.summaryValueGreen}>{formatRupiah(summary.totalIncome)}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.iconBadge, { backgroundColor: '#fee2e2' }]}>
                <TrendingDown size={16} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Pengeluaran Bulan Ini</Text>
                <Text style={styles.summaryValueRed}>{formatRupiah(summary.totalExpense)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Dompet / Wallets */}
        {wallets.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Dompet & Rekening</Text>
              <Text style={styles.sectionCount}>{wallets.length} Dompet</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
              {wallets.map((w) => (
                <View key={w.id} style={styles.walletCard}>
                  <View style={styles.walletCardHeader}>
                    <View style={[styles.walletDot, { backgroundColor: w.color || '#16a34a' }]} />
                    <Text style={styles.walletName} numberOfLines={1}>
                      {w.name}
                    </Text>
                  </View>
                  <Text style={styles.walletBalance}>{formatRupiah(w.currentBalance || 0)}</Text>
                  {w.accountNumber ? (
                    <Text style={styles.walletAccNumber}>{w.accountNumber}</Text>
                  ) : (
                    <Text style={styles.walletAccNumber}>{w.type}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action Button Tambah Transaksi */}
        <TouchableOpacity
          style={styles.addTxButton}
          onPress={() => {
            setDisplayAmount('');
            setRawAmount('');
            setNote('');
            setModalVisible(true);
          }}
        >
          <Plus size={18} color="#ffffff" />
          <Text style={styles.addTxText}>Catat Transaksi Baru</Text>
        </TouchableOpacity>

        {/* Section List Transaksi */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
          <Text style={styles.sectionCount}>{transactions.length} Item</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#16a34a" style={{ marginTop: 24 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada transaksi di workspace ini</Text>
          </View>
        ) : (
          transactions.map((item) => {
            const isIncome = item.type === 'INCOME';
            const isTransfer = item.type === 'TRANSFER';
            return (
              <View key={item.id} style={styles.txCard}>
                <View
                  style={[
                    styles.txEmojiBox,
                    isTransfer
                      ? { backgroundColor: '#eff6ff' }
                      : isIncome
                      ? { backgroundColor: '#f0fdf4' }
                      : { backgroundColor: '#fef2f2' },
                  ]}
                >
                  {isTransfer ? (
                    <ArrowRightLeft size={18} color="#2563eb" />
                  ) : (
                    <Text style={styles.txEmoji}>{item.category?.emoji || '💰'}</Text>
                  )}
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txCatName}>
                    {isTransfer
                      ? `Transfer: ${item.wallet?.name || 'Dompet'} ➔ ${item.toWallet?.name || 'Tujuan'}`
                      : item.category?.name || 'Kategori'}
                  </Text>
                  <Text style={styles.txNote} numberOfLines={1}>
                    {item.note || (item.wallet?.name ? `Via ${item.wallet.name}` : 'Tanpa catatan')}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    isTransfer
                      ? { color: '#2563eb' }
                      : isIncome
                      ? { color: '#16a34a' }
                      : { color: '#dc2626' },
                  ]}
                >
                  {isTransfer ? '' : isIncome ? '+' : '-'}
                  {formatRupiah(Number(item.amount))}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal Tambah Transaksi */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Catat Transaksi Baru</Text>

            {/* Type Selector (Pengeluaran / Pemasukan / Transfer) */}
            <View style={styles.typeContainer}>
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
                  txType === 'INCOME' && { backgroundColor: '#16a34a' },
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

            {/* Input Nominal dengan Separator Ribuan */}
            <Text style={styles.inputLabel}>Nominal (Rp) *</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.rpPrefix}>Rp</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#71717a"
                keyboardType="numeric"
                value={displayAmount}
                onChangeText={handleAmountChange}
              />
            </View>

            {/* Pilihan Dompet Asal / Sumber */}
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
                      <WalletIcon size={13} color={selectedWalletId === w.id ? '#ffffff' : '#71717a'} />
                      <Text
                        style={[
                          styles.chipItemText,
                          selectedWalletId === w.id && styles.chipItemTextActive,
                        ]}
                      >
                        {w.name} ({formatRupiah(w.currentBalance)})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Pilihan Dompet Tujuan (Jika Transfer) */}
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
                        <ArrowRightLeft
                          size={13}
                          color={selectedToWalletId === w.id ? '#ffffff' : '#71717a'}
                        />
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

            {/* Pilihan Kategori (Jika Bukan Transfer) */}
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
                        <Text style={styles.chipItemEmoji}>{cat.emoji}</Text>
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

            <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Contoh: Belanja bulanan / Makan siang"
              placeholderTextColor="#71717a"
              value={note}
              onChangeText={setNote}
            />

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
                    ? { backgroundColor: '#16a34a' }
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

      {/* Modal Switch Workspace */}
      <Modal visible={wsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Workspace</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {workspaces.map((ws) => {
                const isActive = activeWorkspace?.id === ws.id;
                return (
                  <TouchableOpacity
                    key={ws.id}
                    style={[styles.wsSelectItem, isActive && styles.wsSelectItemActive]}
                    onPress={() => handleSelectWorkspace(ws)}
                  >
                    <View style={styles.wsSelectIcon}>
                      <FolderKanban size={18} color={isActive ? '#16a34a' : '#71717a'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.wsSelectName, isActive && { color: '#16a34a' }]}>
                        {ws.name}
                      </Text>
                      <Text style={styles.wsSelectDesc}>{ws.members?.length || 1} Anggota</Text>
                    </View>
                    {isActive && <Check size={18} color="#16a34a" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn, { marginTop: 16 }]}
              onPress={() => setWsModalVisible(false)}
            >
              <Text style={styles.cancelText}>Tutup</Text>
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
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  greeting: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  wsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  wsName: {
    fontSize: 13,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  addIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  balanceCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#a1a1aa',
  },
  summaryValueGreen: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#22c55e',
    marginTop: 1,
  },
  summaryValueRed: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 1,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sectionCount: {
    fontSize: 12,
    color: '#71717a',
  },
  walletScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  walletCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 14,
    width: 140,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  walletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walletName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  walletAccNumber: {
    fontSize: 10,
    color: '#71717a',
    marginTop: 2,
  },
  addTxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 22,
  },
  addTxText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#71717a',
    fontSize: 13,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  txEmojiBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txEmoji: {
    fontSize: 18,
  },
  txDetails: {
    flex: 1,
    marginRight: 8,
  },
  txCatName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  txNote: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272a',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#27272a',
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
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  rpPrefix: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a1a1aa',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalInput: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#ffffff',
  },
  chipScroll: {
    marginVertical: 4,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    gap: 6,
  },
  chipItemActive: {
    backgroundColor: '#16a34a',
  },
  chipItemActiveBlue: {
    backgroundColor: '#2563eb',
  },
  chipItemEmoji: {
    fontSize: 14,
  },
  chipItemText: {
    color: '#a1a1aa',
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
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#27272a',
  },
  cancelText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#16a34a',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  wsSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 8,
    gap: 12,
  },
  wsSelectItemActive: {
    borderColor: '#16a34a',
  },
  wsSelectIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wsSelectName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  wsSelectDesc: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
});
