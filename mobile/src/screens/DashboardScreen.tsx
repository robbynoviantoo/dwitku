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
  LogOut,
  FolderKanban,
} from 'lucide-react-native';

interface DashboardScreenProps {
  user: any;
  onLogout: () => void;
}

export default function DashboardScreen({ user, onLogout }: DashboardScreenProps) {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      fetchTransactions(activeWorkspace.id);
    }
  }, [activeWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const data = await apiRequest('/workspaces');
      setWorkspaces(data.workspaces || []);
      if (data.workspaces && data.workspaces.length > 0) {
        setActiveWorkspace(data.workspaces[0]);
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

  const handleCreateTransaction = async () => {
    if (!amount || !selectedCategoryId || !activeWorkspace) {
      Alert.alert('Perhatian', 'Jumlah dan Kategori wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          note,
          type: txType,
          workspaceId: activeWorkspace.id,
          categoryId: selectedCategoryId,
        }),
      });

      setModalVisible(false);
      setAmount('');
      setNote('');
      fetchTransactions(activeWorkspace.id);
    } catch (err: any) {
      Alert.alert('Gagal Simpan', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.name || 'User'}</Text>
          <TouchableOpacity style={styles.wsSelector}>
            <FolderKanban size={16} color="#22c55e" />
            <Text style={styles.wsName}>{activeWorkspace?.name || 'Workspace'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card Ringkasan Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Saldo Bersih</Text>
          <Text style={styles.balanceAmount}>{formatRupiah(summary.balance)}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.iconBadge, { backgroundColor: '#166534_40' }]}>
                <TrendingUp size={16} color="#22c55e" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Pemasukan</Text>
                <Text style={styles.summaryValue}>{formatRupiah(summary.totalIncome)}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <View style={[styles.iconBadge, { backgroundColor: '#991b1b_40' }]}>
                <TrendingDown size={16} color="#ef4444" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Pengeluaran</Text>
                <Text style={styles.summaryValue}>{formatRupiah(summary.totalExpense)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.addTxButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addTxText}>Tambah Transaksi Baru</Text>
        </TouchableOpacity>

        {/* Section List Transaksi */}
        <View style={styles.txSectionHeader}>
          <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#22c55e" style={{ marginTop: 24 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada transaksi di workspace ini</Text>
          </View>
        ) : (
          transactions.map((item) => (
            <View key={item.id} style={styles.txCard}>
              <View style={styles.txEmojiBox}>
                <Text style={styles.txEmoji}>{item.category?.emoji || '💰'}</Text>
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txCatName}>{item.category?.name || 'Kategori'}</Text>
                <Text style={styles.txNote}>{item.note || 'Tidak ada catatan'}</Text>
              </View>
              <Text
                style={[
                  styles.txAmount,
                  { color: item.type === 'INCOME' ? '#22c55e' : '#ef4444' },
                ]}
              >
                {item.type === 'INCOME' ? '+' : '-'}{formatRupiah(Number(item.amount))}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Tambah Transaksi */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Transaksi Baru</Text>

            {/* Type Selector */}
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  txType === 'EXPENSE' && { backgroundColor: '#ef4444' },
                ]}
                onPress={() => setTxType('EXPENSE')}
              >
                <Text style={styles.typeBtnText}>Pengeluaran</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  txType === 'INCOME' && { backgroundColor: '#16a34a' },
                ]}
                onPress={() => setTxType('INCOME')}
              >
                <Text style={styles.typeBtnText}>Pemasukan</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Jumlah (Rp)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0"
              placeholderTextColor="#71717a"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.inputLabel}>Pilih Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories
                .filter((c) => c.type === txType)
                .map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      selectedCategoryId === cat.id && styles.catChipActive,
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text style={styles.catChipText}>{cat.emoji} {cat.name}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Misal: Makan siang / Gaji bulanan"
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
                style={[styles.actionBtn, styles.saveBtn]}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  greeting: {
    fontSize: 18,
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
    fontSize: 14,
    color: '#a1a1aa',
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#27272a',
    borderRadius: 10,
  },
  scrollContent: {
    padding: 20,
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
    fontSize: 13,
    color: '#a1a1aa',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addTxButton: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  addTxText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  txSectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  txEmojiBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txEmoji: {
    fontSize: 20,
  },
  txDetails: {
    flex: 1,
  },
  txCatName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  txNote: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#09090b',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  inputLabel: {
    color: '#a1a1aa',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
  },
  catScroll: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  catChip: {
    backgroundColor: '#27272a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  catChipActive: {
    backgroundColor: '#15803d',
    borderColor: '#22c55e',
  },
  catChipText: {
    color: '#ffffff',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#27272a',
  },
  cancelText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#16a34a',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
