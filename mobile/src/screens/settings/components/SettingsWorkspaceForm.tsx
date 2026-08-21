import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../services/api';
import { Settings2, Save, Building2 } from 'lucide-react-native';

interface SettingsWorkspaceFormProps {
  workspace: any;
  isOwner: boolean;
}

export function SettingsWorkspaceForm({ workspace, isOwner }: SettingsWorkspaceFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [currency, setCurrency] = useState(workspace?.currency || 'IDR');

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setDescription(workspace.description || '');
      setCurrency(workspace.currency || 'IDR');
    }
  }, [workspace]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/workspaces/${workspace?.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description, currency }),
      }),
    onSuccess: () => {
      Alert.alert('Berhasil', 'Pengaturan workspace berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (err: any) => {
      Alert.alert('Gagal Menyimpan', err.message || 'Terjadi kesalahan');
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama workspace tidak boleh kosong.');
      return;
    }
    updateMutation.mutate();
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Building2 size={18} color="#004C29" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Informasi Workspace</Text>
          <Text style={styles.cardSubtitle}>
            Ubah nama, deskripsi, dan mata uang workspace
          </Text>
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>NAMA WORKSPACE</Text>
        <TextInput
          style={[styles.input, !isOwner && styles.inputDisabled]}
          value={name}
          onChangeText={setName}
          editable={isOwner && !updateMutation.isPending}
          placeholder="Contoh: Keuangan Keluarga"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>DESKRIPSI (OPSIONAL)</Text>
        <TextInput
          style={[styles.input, styles.textArea, !isOwner && styles.inputDisabled]}
          value={description}
          onChangeText={setDescription}
          editable={isOwner && !updateMutation.isPending}
          placeholder="Tulis deskripsi singkat..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>MATA UANG</Text>
        <View style={styles.currencyRow}>
          {['IDR', 'USD', 'SGD', 'MYR'].map((curr) => {
            const isSelected = currency === curr;
            return (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.currencyChip,
                  isSelected && styles.currencyChipSelected,
                  !isOwner && { opacity: 0.6 },
                ]}
                onPress={() => isOwner && setCurrency(curr)}
                disabled={!isOwner}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.currencyChipText,
                    isSelected && styles.currencyChipTextSelected,
                  ]}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isOwner ? (
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={updateMutation.isPending}
          activeOpacity={0.8}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Save size={15} color="#ffffff" />
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.viewerNotice}>
          <Text style={styles.viewerNoticeText}>
            Hanya Pemilik (Owner) yang dapat mengubah nama & mata uang workspace ini.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
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
    height: 70,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  currencyChipSelected: {
    backgroundColor: '#004C29',
    borderColor: '#004C29',
  },
  currencyChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  currencyChipTextSelected: {
    color: '#ffffff',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#004C29',
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  viewerNotice: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 6,
    alignItems: 'center',
  },
  viewerNoticeText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
});
