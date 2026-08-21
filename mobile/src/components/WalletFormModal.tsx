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
  X,
  Building2,
  Wallet as WalletIcon,
  Banknote,
  Check,
  ChevronDown,
} from 'lucide-react-native';
import { BankSvgLogo } from './BankSvgLogo';
import { apiRequest } from '../services/api';

interface WalletFormModalProps {
  visible: boolean;
  onClose: () => void;
  workspaceId: string;
  wallet?: any | null; // Jika ada data, mode edit
  onSuccess: () => void;
}

const PROVIDERS = [
  { code: 'bca', name: 'Bank Central Asia (BCA)', type: 'BANK', color: '#00569c' },
  { code: 'mandiri', name: 'Bank Mandiri', type: 'BANK', color: '#003d79' },
  { code: 'bri', name: 'Bank Rakyat Indonesia (BRI)', type: 'BANK', color: '#00529c' },
  { code: 'bni', name: 'Bank Negara Indonesia (BNI)', type: 'BANK', color: '#e65300' },
  { code: 'bsi', name: 'Bank Syariah Indonesia (BSI)', type: 'BANK', color: '#00a39d' },
  { code: 'jago', name: 'Bank Jago', type: 'BANK', color: '#5c2494' },
  { code: 'cimb', name: 'CIMB Niaga', type: 'BANK', color: '#7e1616' },
  { code: 'permata', name: 'Permata Bank', type: 'BANK', color: '#008542' },
  { code: 'jenius', name: 'Jenius (BTPN)', type: 'BANK', color: '#009fe3' },
  { code: 'btn', name: 'Bank Tabungan Negara (BTN)', type: 'BANK', color: '#18458b' },
  { code: 'danamon', name: 'Bank Danamon', type: 'BANK', color: '#ff7f00' },
  { code: 'panin', name: 'Panin Bank', type: 'BANK', color: '#008037' },
  { code: 'ocbc', name: 'OCBC NISP', type: 'BANK', color: '#e20613' },
  { code: 'gopay', name: 'GoPay', type: 'EWALLET', color: '#00aed6' },
  { code: 'ovo', name: 'OVO', type: 'EWALLET', color: '#4c2a86' },
  { code: 'dana', name: 'DANA', type: 'EWALLET', color: '#118eea' },
  { code: 'shopeepay', name: 'ShopeePay', type: 'EWALLET', color: '#ee4d2d' },
  { code: 'linkaja', name: 'LinkAja', type: 'EWALLET', color: '#ed1c24' },
  { code: 'cash', name: 'Uang Tunai (Cash)', type: 'CASH', color: '#16a34a' },
];

export function WalletFormModal({
  visible,
  onClose,
  workspaceId,
  wallet,
  onSuccess,
}: WalletFormModalProps) {
  const isEdit = !!wallet;
  const [walletType, setWalletType] = useState<'BANK' | 'EWALLET' | 'CASH' | 'OTHER'>('BANK');
  const [providerCode, setProviderCode] = useState('bca');
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [displayBalance, setDisplayBalance] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Provider Picker Modal
  const [providerPickerOpen, setProviderPickerOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      if (wallet) {
        setWalletType(wallet.type || 'BANK');
        setProviderCode(wallet.providerCode || 'bca');
        setName(wallet.name || '');
        setAccountNumber(wallet.accountNumber || '');
        setHolderName(wallet.holderName || '');
        setDisplayBalance(
          wallet.initialBalance ? new Intl.NumberFormat('id-ID').format(wallet.initialBalance) : '0'
        );
        setIsDefault(!!wallet.isDefault);
      } else {
        setWalletType('BANK');
        setProviderCode('bca');
        setName('Bank Central Asia (BCA)');
        setAccountNumber('');
        setHolderName('');
        setDisplayBalance('');
        setIsDefault(false);
      }
    }
  }, [visible, wallet]);

  const handleBalanceChange = (text: string) => {
    const raw = text.replace(/\D/g, '');
    if (!raw) {
      setDisplayBalance('');
      return;
    }
    setDisplayBalance(new Intl.NumberFormat('id-ID').format(Number(raw)));
  };

  const getRawBalance = () => {
    return Number(displayBalance.replace(/\./g, '')) || 0;
  };

  const filteredProviders = PROVIDERS.filter((p) => {
    if (walletType === 'BANK') return p.type === 'BANK';
    if (walletType === 'EWALLET') return p.type === 'EWALLET';
    if (walletType === 'CASH') return p.type === 'CASH';
    return true;
  });

  const selectedProviderObj = PROVIDERS.find((p) => p.code === providerCode);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama dompet wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await apiRequest(`/wallets/${wallet.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: name.trim(),
            type: walletType,
            providerCode,
            accountNumber: accountNumber.trim() || undefined,
            holderName: holderName.trim() || undefined,
            color: selectedProviderObj?.color || '#004C29',
            initialBalance: getRawBalance(),
            isDefault,
          }),
        });
      } else {
        await apiRequest('/wallets', {
          method: 'POST',
          body: JSON.stringify({
            workspaceId,
            name: name.trim(),
            type: walletType,
            providerCode,
            accountNumber: accountNumber.trim() || undefined,
            holderName: holderName.trim() || undefined,
            color: selectedProviderObj?.color || '#004C29',
            initialBalance: getRawBalance(),
            isDefault,
          }),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(isEdit ? 'Gagal Memperbarui' : 'Gagal Menyimpan', err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header Dialog */}
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>
              {isEdit ? 'Edit Wallet' : 'Add New Wallet'}
            </Text>
            <TouchableOpacity style={styles.closeIconBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Type Segmented Tabs: BANK / EWALLET / CASH */}
          <View style={styles.typeTabContainer}>
            <TouchableOpacity
              style={[styles.typeTab, walletType === 'BANK' && styles.typeTabActive]}
              onPress={() => {
                setWalletType('BANK');
                setProviderCode('bca');
                if (!isEdit) setName('Bank Central Asia (BCA)');
              }}
              activeOpacity={0.75}
            >
              <Building2 size={14} color={walletType === 'BANK' ? '#004C29' : '#64748b'} />
              <Text style={[styles.typeTabText, walletType === 'BANK' && styles.typeTabTextActive]}>
                Bank
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeTab, walletType === 'EWALLET' && styles.typeTabActive]}
              onPress={() => {
                setWalletType('EWALLET');
                setProviderCode('gopay');
                if (!isEdit) setName('GoPay');
              }}
              activeOpacity={0.75}
            >
              <WalletIcon size={14} color={walletType === 'EWALLET' ? '#004C29' : '#64748b'} />
              <Text style={[styles.typeTabText, walletType === 'EWALLET' && styles.typeTabTextActive]}>
                E-Wallet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeTab, walletType === 'CASH' && styles.typeTabActive]}
              onPress={() => {
                setWalletType('CASH');
                setProviderCode('cash');
                if (!isEdit) setName('Uang Tunai (Cash)');
              }}
              activeOpacity={0.75}
            >
              <Banknote size={14} color={walletType === 'CASH' ? '#004C29' : '#64748b'} />
              <Text style={[styles.typeTabText, walletType === 'CASH' && styles.typeTabTextActive]}>
                Cash
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formBody}>
            {/* 1. PROVIDER SELECTOR */}
            {walletType !== 'CASH' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PROVIDER</Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => setProviderPickerOpen(true)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <BankSvgLogo providerCode={providerCode} size={24} />
                    <Text style={[styles.selectedName, { marginLeft: 8 }]}>
                      {selectedProviderObj?.name || providerCode}
                    </Text>
                  </View>
                  <ChevronDown size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            )}

            {/* 2. WALLET NAME */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                WALLET NAME <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. BCA Tabungan Utama"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* 3. ACCOUNT NUMBER */}
            {walletType !== 'CASH' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ACCOUNT / PHONE NUMBER</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1234567890"
                  placeholderTextColor="#94a3b8"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* 4. ACCOUNT HOLDER */}
            {walletType !== 'CASH' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ACCOUNT HOLDER NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Robby Noviantoo"
                  placeholderTextColor="#94a3b8"
                  value={holderName}
                  onChangeText={setHolderName}
                />
              </View>
            )}

            {/* 5. INITIAL BALANCE */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>INITIAL BALANCE</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencyPrefix}>Rp</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={displayBalance}
                  onChangeText={handleBalanceChange}
                />
              </View>
            </View>

            {/* 6. SET AS DEFAULT CHECKBOX */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsDefault(!isDefault)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxBox, isDefault && styles.checkboxBoxActive]}>
                {isDefault && <Check size={12} color="#ffffff" strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxLabel}>Set as Primary / Default Wallet</Text>
            </TouchableOpacity>

            {/* Actions: Cancel & Save */}
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
                style={styles.saveBtn}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {isEdit ? 'Update Wallet' : 'Save Wallet'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ── Modal Picker: Pilih Bank / E-Wallet Provider ── */}
      <Modal visible={providerPickerOpen} transparent animationType="fade">
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalCard}>
            <Text style={styles.pickerModalTitle}>Pilih Penyedia Layanan</Text>
            <ScrollView style={{ maxHeight: 300, marginVertical: 10 }}>
              {filteredProviders.map((p) => (
                <TouchableOpacity
                  key={p.code}
                  style={[styles.pickerItem, providerCode === p.code && styles.pickerItemActive]}
                  onPress={() => {
                    setProviderCode(p.code);
                    if (!isEdit) setName(p.name);
                    setProviderPickerOpen(false);
                  }}
                >
                  <BankSvgLogo providerCode={p.code} size={28} />
                  <Text style={[styles.pickerItemName, { marginLeft: 10 }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCloseBtn} onPress={() => setProviderPickerOpen(false)}>
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
  typeTabActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  typeTabTextActive: {
    color: '#004C29',
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
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 12.5,
    color: '#0f172a',
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
  selectedName: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#004C29',
    borderColor: '#004C29',
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
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
    backgroundColor: '#004C29',
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
