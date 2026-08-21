import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  X,
  Calendar,
  Tag,
  Wallet as WalletIcon,
  ChevronDown,
  ArrowRight,
} from 'lucide-react-native';
import { BankSvgLogo } from './BankSvgLogo';
import { apiRequest } from '../services/api';

interface TransactionFormModalProps {
  visible: boolean;
  onClose: () => void;
  workspaceId: string;
  categories: any[];
  wallets: any[];
  transaction?: any | null; // Data transaksi jika mode Edit
  onSuccess: () => void;
}

export function TransactionFormModal({
  visible,
  onClose,
  workspaceId,
  categories,
  wallets,
  transaction,
  onSuccess,
}: TransactionFormModalProps) {
  const isEditMode = !!transaction;
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [displayAmount, setDisplayAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedToWalletId, setSelectedToWalletId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dropdown Picker Modals
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [toWalletPickerOpen, setToWalletPickerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  // Inisialisasi Data jika Edit Mode atau Add Mode
  useEffect(() => {
    if (visible) {
      if (transaction) {
        setTxType(transaction.type || 'EXPENSE');
        setDisplayAmount(new Intl.NumberFormat('id-ID').format(transaction.amount || 0));
        setNote(transaction.note || '');
        setSelectedCategoryId(transaction.categoryId || '');
        setSelectedWalletId(transaction.walletId || '');
        setSelectedToWalletId(transaction.toWalletId || '');
      } else {
        setTxType('EXPENSE');
        setDisplayAmount('');
        setNote('');
        setSelectedCategoryId('');
        setSelectedToWalletId('');
        if (wallets.length > 0) {
          const defaultWallet = wallets.find((w: any) => w.isDefault) || wallets[0];
          setSelectedWalletId(defaultWallet?.id || '');
        }
      }
    }
  }, [visible, transaction, wallets]);

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/\D/g, '');
    if (!raw) {
      setDisplayAmount('');
      return;
    }
    const formatted = new Intl.NumberFormat('id-ID').format(Number(raw));
    setDisplayAmount(formatted);
  };

  const getRawAmount = () => {
    return Number(displayAmount.replace(/\./g, '')) || 0;
  };

  const selectedWallet = wallets.find((w: any) => w.id === selectedWalletId);
  const selectedToWallet = wallets.find((w: any) => w.id === selectedToWalletId);
  const filteredCategories = categories.filter((c: any) => c.type === txType);
  const selectedCategory = categories.find((c: any) => c.id === selectedCategoryId);

  const handleSubmit = async () => {
    const amount = getRawAmount();
    if (amount <= 0) {
      Alert.alert('Perhatian', 'Jumlah nominal harus lebih dari 0');
      return;
    }

    if (txType !== 'TRANSFER' && !selectedCategoryId) {
      Alert.alert('Perhatian', 'Kategori wajib dipilih');
      return;
    }

    if (txType === 'TRANSFER' && (!selectedWalletId || !selectedToWalletId)) {
      Alert.alert('Perhatian', 'Dompet asal dan tujuan transfer wajib dipilih');
      return;
    }

    if (txType === 'TRANSFER' && selectedWalletId === selectedToWalletId) {
      Alert.alert('Perhatian', 'Dompet asal dan tujuan tidak boleh sama');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        // Mode Edit (PUT)
        await apiRequest(`/transactions/${transaction.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            amount,
            note: note.trim() || undefined,
            type: txType,
            categoryId: txType === 'TRANSFER' ? null : selectedCategoryId,
            walletId: selectedWalletId || null,
            toWalletId: txType === 'TRANSFER' ? selectedToWalletId : null,
          }),
        });
      } else {
        // Mode Add (POST)
        await apiRequest('/transactions', {
          method: 'POST',
          body: JSON.stringify({
            workspaceId,
            amount,
            note: note.trim() || undefined,
            date: new Date().toISOString(),
            type: txType,
            categoryId: txType === 'TRANSFER' ? undefined : selectedCategoryId,
            walletId: selectedWalletId || undefined,
            toWalletId: txType === 'TRANSFER' ? selectedToWalletId : undefined,
          }),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(isEditMode ? 'Gagal Memperbarui' : 'Gagal Menyimpan', err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(transaction?.date ? new Date(transaction.date) : new Date());

  const getSaveBtnColor = () => {
    if (txType === 'EXPENSE') return '#ef4444';
    if (txType === 'INCOME') return '#004C29';
    return '#2563eb';
  };

  const getSaveBtnLabel = () => {
    if (isEditMode) return 'Update Transaction';
    if (txType === 'EXPENSE') return 'Save Expense';
    if (txType === 'INCOME') return 'Save Income';
    return 'Save Transfer';
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header Dialog */}
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>
              {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
            </Text>
            <TouchableOpacity style={styles.closeIconBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* 3 Tabs: Expense, Income, Transfer */}
          <View style={styles.typeTabContainer}>
            <TouchableOpacity
              style={[styles.typeTab, txType === 'EXPENSE' && styles.typeTabExpenseActive]}
              onPress={() => {
                setTxType('EXPENSE');
                setSelectedCategoryId('');
              }}
              activeOpacity={0.75}
            >
              <TrendingDown size={14} color={txType === 'EXPENSE' ? '#ef4444' : '#64748b'} />
              <Text style={[styles.typeTabText, txType === 'EXPENSE' && styles.typeTabTextExpense]}>
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeTab, txType === 'INCOME' && styles.typeTabIncomeActive]}
              onPress={() => {
                setTxType('INCOME');
                setSelectedCategoryId('');
              }}
              activeOpacity={0.75}
            >
              <TrendingUp size={14} color={txType === 'INCOME' ? '#004C29' : '#64748b'} />
              <Text style={[styles.typeTabText, txType === 'INCOME' && styles.typeTabTextIncome]}>
                Income
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeTab, txType === 'TRANSFER' && styles.typeTabTransferActive]}
              onPress={() => {
                setTxType('TRANSFER');
                setSelectedCategoryId('');
              }}
              activeOpacity={0.75}
            >
              <ArrowRightLeft size={14} color={txType === 'TRANSFER' ? '#2563eb' : '#64748b'} />
              <Text style={[styles.typeTabText, txType === 'TRANSFER' && styles.typeTabTextTransfer]}>
                Transfer
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formBody}>
            {/* 1. AMOUNT */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                AMOUNT <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={displayAmount}
                  onChangeText={handleAmountChange}
                />
              </View>
            </View>

            {/* 2. WALLET / SOURCE */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {txType === 'TRANSFER' ? 'FROM WALLET *' : 'WALLET / SOURCE'}
              </Text>
              <TouchableOpacity
                style={styles.pickerSelector}
                onPress={() => setWalletPickerOpen(true)}
                activeOpacity={0.7}
              >
                {selectedWallet ? (
                  <View style={styles.selectedWalletRow}>
                    <BankSvgLogo
                      providerCode={selectedWallet.providerCode}
                      walletName={selectedWallet.name}
                      size={22}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.selectedWalletName}>{selectedWallet.name}</Text>
                      <Text style={styles.selectedWalletMeta}>
                        {selectedWallet.holderName ? `${selectedWallet.holderName} · ` : ''}
                        Rp {new Intl.NumberFormat('id-ID').format(selectedWallet.currentBalance || 0)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.pickerPlaceholderRow}>
                    <WalletIcon size={16} color="#94a3b8" />
                    <Text style={styles.pickerPlaceholderText}>Pilih Sumber Dompet</Text>
                  </View>
                )}
                <ChevronDown size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* 3. TO WALLET (khusus TRANSFER) */}
            {txType === 'TRANSFER' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  TO WALLET <Text style={{ color: '#ef4444' }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => setToWalletPickerOpen(true)}
                  activeOpacity={0.7}
                >
                  {selectedToWallet ? (
                    <View style={styles.selectedWalletRow}>
                      <BankSvgLogo
                        providerCode={selectedToWallet.providerCode}
                        walletName={selectedToWallet.name}
                        size={22}
                      />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.selectedWalletName}>{selectedToWallet.name}</Text>
                        <Text style={styles.selectedWalletMeta}>
                          {selectedToWallet.holderName ? `${selectedToWallet.holderName} · ` : ''}
                          Rp {new Intl.NumberFormat('id-ID').format(selectedToWallet.currentBalance || 0)}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.pickerPlaceholderRow}>
                      <WalletIcon size={16} color="#94a3b8" />
                      <Text style={styles.pickerPlaceholderText}>Pilih Dompet Tujuan</Text>
                    </View>
                  )}
                  <ChevronDown size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            )}

            {/* 4. DATE */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                DATE <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
              <View style={styles.dateField}>
                <Calendar size={16} color="#94a3b8" />
                <Text style={styles.dateText}>{todayStr}</Text>
              </View>
            </View>

            {/* 5. CATEGORY (hanya jika bukan TRANSFER) */}
            {txType !== 'TRANSFER' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  CATEGORY <Text style={{ color: '#ef4444' }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => setCategoryPickerOpen(true)}
                  activeOpacity={0.7}
                >
                  {selectedCategory ? (
                    <View style={styles.selectedWalletRow}>
                      <Text style={{ fontSize: 16 }}>{selectedCategory.emoji || '🏷️'}</Text>
                      <Text style={[styles.selectedWalletName, { marginLeft: 8 }]}>
                        {selectedCategory.name}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.pickerPlaceholderRow}>
                      <Tag size={16} color="#94a3b8" />
                      <Text style={styles.pickerPlaceholderText}>Select Transaction Category</Text>
                    </View>
                  )}
                  <ChevronDown size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            )}

            {/* 6. NOTES */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                NOTES <Text style={{ color: '#94a3b8', fontWeight: 'normal' }}>(optional)</Text>
              </Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Transaction notes..."
                placeholderTextColor="#94a3b8"
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Actions: Cancel & Save/Update */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={submitting}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: getSaveBtnColor() }]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>{getSaveBtnLabel()}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ── Modal Picker: Dompet Asal ── */}
      <Modal visible={walletPickerOpen} transparent animationType="fade">
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>Pilih Dompet / Sumber</Text>
            <ScrollView style={{ maxHeight: 280, marginVertical: 10 }}>
              {wallets.map((w: any) => (
                <TouchableOpacity
                  key={w.id}
                  style={[styles.pickerItem, selectedWalletId === w.id && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedWalletId(w.id);
                    setWalletPickerOpen(false);
                  }}
                >
                  <BankSvgLogo providerCode={w.providerCode} walletName={w.name} size={26} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.pickerItemName}>{w.name}</Text>
                    <Text style={styles.pickerItemMeta}>
                      Saldo: Rp {new Intl.NumberFormat('id-ID').format(w.currentBalance || 0)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setWalletPickerOpen(false)}>
              <Text style={styles.pickerCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal Picker: Dompet Tujuan (Transfer) ── */}
      <Modal visible={toWalletPickerOpen} transparent animationType="fade">
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>Pilih Dompet Tujuan</Text>
            <ScrollView style={{ maxHeight: 280, marginVertical: 10 }}>
              {wallets
                .filter((w: any) => w.id !== selectedWalletId)
                .map((w: any) => (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.pickerItem, selectedToWalletId === w.id && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedToWalletId(w.id);
                      setToWalletPickerOpen(false);
                    }}
                  >
                    <BankSvgLogo providerCode={w.providerCode} walletName={w.name} size={26} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.pickerItemName}>{w.name}</Text>
                      <Text style={styles.pickerItemMeta}>
                        Saldo: Rp {new Intl.NumberFormat('id-ID').format(w.currentBalance || 0)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setToWalletPickerOpen(false)}>
              <Text style={styles.pickerCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal Picker: Kategori ── */}
      <Modal visible={categoryPickerOpen} transparent animationType="fade">
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>Pilih Kategori Transaksi</Text>
            <ScrollView style={{ maxHeight: 280, marginVertical: 10 }}>
              {filteredCategories.map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.pickerItem, selectedCategoryId === c.id && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedCategoryId(c.id);
                    setCategoryPickerOpen(false);
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{c.emoji || '🏷️'}</Text>
                  <Text style={[styles.pickerItemName, { marginLeft: 10 }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setCategoryPickerOpen(false)}>
              <Text style={styles.pickerCloseText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    fontSize: 16.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeIconBtn: {
    padding: 4,
  },
  typeTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    gap: 8,
    marginBottom: 14,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  typeTabExpenseActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fff1f2',
  },
  typeTabIncomeActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  typeTabTransferActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  typeTabTextExpense: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  typeTabTextIncome: {
    color: '#004C29',
    fontWeight: 'bold',
  },
  typeTabTextTransfer: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  formBody: {
    gap: 12,
    paddingBottom: 6,
  },
  formGroup: {
    gap: 5,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
  },
  currencyPrefix: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
    paddingVertical: 0,
  },
  pickerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    minHeight: 44,
  },
  selectedWalletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedWalletName: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  selectedWalletMeta: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  pickerPlaceholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerPlaceholderText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
  },
  dateText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#334155',
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 42,
    fontSize: 12.5,
    color: '#0f172a',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
  },
  pickerModalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    marginBottom: 6,
  },
  pickerItemActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  pickerItemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  pickerItemMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  pickerCloseBtn: {
    padding: 10,
    alignItems: 'center',
  },
  pickerCloseText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
  },
});
