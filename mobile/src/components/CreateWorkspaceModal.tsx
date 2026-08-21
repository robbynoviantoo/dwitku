import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Building2, X, Check } from 'lucide-react-native';
import { apiRequest } from '../services/api';

interface CreateWorkspaceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newWorkspace: any) => void;
}

const CURRENCIES = [
  { code: 'IDR', name: 'Rupiah Indonesia (Rp)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'SGD', name: 'Singapore Dollar (S$)' },
  { code: 'MYR', name: 'Malaysian Ringgit (RM)' },
];

export function CreateWorkspaceModal({
  visible,
  onClose,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCurrency('IDR');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama workspace wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest('/workspaces', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          currency,
          type: 'FINANCE',
        }),
      });

      if (result?.workspace) {
        resetForm();
        onSuccess(result.workspace);
      }
    } catch (err: any) {
      Alert.alert('Gagal Membuat Workspace', err.message || 'Terjadi kesalahan pada server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Building2 size={16} color="#004C29" />
              </View>
              <Text style={styles.modalTitle}>Buat Workspace Baru</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Nama Workspace */}
            <Text style={styles.label}>
              Nama Workspace <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Keuangan Rumah, Toko Berkah"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />

            {/* Deskripsi */}
            <Text style={styles.label}>Deskripsi (Opsional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Catatan keuangan operasional atau pribadi"
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />

            {/* Mata Uang */}
            <Text style={styles.label}>Mata Uang Pembukuan</Text>
            <View style={styles.currencyList}>
              {CURRENCIES.map((curr) => {
                const isSelected = currency === curr.code;
                return (
                  <TouchableOpacity
                    key={curr.code}
                    style={[styles.currencyOption, isSelected && styles.currencyOptionActive]}
                    onPress={() => setCurrency(curr.code)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.currencyCode, isSelected && styles.currencyCodeActive]}>
                        {curr.code}
                      </Text>
                      <Text style={styles.currencyName}>{curr.name}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, submitting && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Buat Workspace</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 76, 41, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  currencyList: {
    gap: 6,
    marginTop: 2,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  currencyOptionActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  currencyCode: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  currencyCodeActive: {
    color: '#004C29',
  },
  currencyName: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    backgroundColor: '#004C29',
    borderColor: '#004C29',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: '#004C29',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
