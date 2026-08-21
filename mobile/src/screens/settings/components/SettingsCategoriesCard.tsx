import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../services/api';
import { Plus, Tag, Pencil, Trash2, X, TrendingDown, TrendingUp, Check } from 'lucide-react-native';

const POPULAR_EMOJIS = [
  '🍔', '☕', '🛒', '🚗', '🏠', '👗', '💊', '🎮', '📚', '💼',
  '🎁', '📱', '✈️', '🏋️', '💰', '💹', '🏧', '🎯', '🤝', '🎬',
  '💡', '⚡', '📦', '👕', '🍱', '🥤', '🍪', '🔧', '📢', '🏷️',
];

const PRESET_COLORS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b',
  '#06b6d4', '#64748b', '#0ea5e9', '#14b8a6', '#84cc16', '#6366f1',
];

interface SettingsCategoriesCardProps {
  workspaceId: string;
  isOwner: boolean;
}

export function SettingsCategoriesCard({ workspaceId, isOwner }: SettingsCategoriesCardProps) {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  
  // Dialog State
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏷️');
  const [color, setColor] = useState('#22c55e');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Categories
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['categories', workspaceId],
    queryFn: () => apiRequest(`/categories?workspaceId=${workspaceId}`),
    enabled: !!workspaceId,
  });

  const categories: any[] = data?.categories || [];
  const canEdit = data?.canEdit ?? isOwner;

  const expenseCount = categories.filter((c) => c.type === 'EXPENSE').length;
  const incomeCount = categories.filter((c) => c.type === 'INCOME').length;

  const filteredCategories =
    filterType === 'ALL'
      ? categories
      : categories.filter((c) => c.type === filterType);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName('');
    setEmoji('🏷️');
    setColor('#22c55e');
    setType('EXPENSE');
    setDialogVisible(true);
  };

  const openEditDialog = (cat: any) => {
    if (cat.isDefault) {
      Alert.alert('Informasi', 'Kategori bawaan sistem tidak dapat diubah.');
      return;
    }
    setEditingCategory(cat);
    setName(cat.name);
    setEmoji(cat.emoji || '🏷️');
    setColor(cat.color || '#22c55e');
    setType(cat.type || 'EXPENSE');
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Nama kategori wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        // Update (PUT)
        await apiRequest(`/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: name.trim(),
            emoji,
            color,
            type,
          }),
        });
      } else {
        // Create (POST)
        await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify({
            workspaceId,
            name: name.trim(),
            emoji,
            color,
            type,
          }),
        });
      }

      queryClient.invalidateQueries({ queryKey: ['categories', workspaceId] });
      setDialogVisible(false);
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan', err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (cat: any) => {
    if (cat.isDefault) {
      Alert.alert('Informasi', 'Kategori bawaan sistem tidak dapat dihapus.');
      return;
    }

    Alert.alert(
      'Hapus Kategori',
      `Apakah Anda yakin ingin menghapus kategori "${cat.emoji} ${cat.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(`/categories/${cat.id}`, { method: 'DELETE' });
              queryClient.invalidateQueries({ queryKey: ['categories', workspaceId] });
            } catch (err: any) {
              Alert.alert('Gagal Menghapus', err.message || 'Kategori tidak dapat dihapus.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Tag size={16} color="#004C29" />
            <Text style={styles.cardTitle}>Daftar Kategori</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            {expenseCount} Pengeluaran • {incomeCount} Pemasukan
          </Text>
        </View>

        {canEdit && (
          <TouchableOpacity style={styles.addBtn} onPress={openCreateDialog} activeOpacity={0.75}>
            <Plus size={14} color="#ffffff" />
            <Text style={styles.addBtnText}>Tambah</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { key: 'ALL', label: `Semua (${categories.length})` },
          { key: 'EXPENSE', label: `Pengeluaran (${expenseCount})` },
          { key: 'INCOME', label: `Pemasukan (${incomeCount})` },
        ].map((tab) => {
          const isActive = filterType === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilterType(tab.key as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List Kategori */}
      {isLoading ? (
        <ActivityIndicator color="#004C29" style={{ marginVertical: 24 }} />
      ) : filteredCategories.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Tidak ada kategori pada filter ini.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredCategories.map((cat) => {
            const isExpense = cat.type === 'EXPENSE';
            return (
              <View key={cat.id} style={styles.categoryItem}>
                <View style={styles.catLeft}>
                  <View style={[styles.emojiBox, { backgroundColor: cat.color ? `${cat.color}20` : '#f1f5f9' }]}>
                    <Text style={styles.emojiText}>{cat.emoji || '🏷️'}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.catName} numberOfLines={1}>
                        {cat.name}
                      </Text>
                      {cat.isDefault && (
                        <View style={styles.defaultPill}>
                          <Text style={styles.defaultPillText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.catMeta}>
                      {isExpense ? 'Pengeluaran' : 'Pemasukan'} • {cat.transactionCount || 0} transaksi
                    </Text>
                  </View>
                </View>

                {canEdit && !cat.isDefault && (
                  <View style={styles.catActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => openEditDialog(cat)}
                      activeOpacity={0.7}
                    >
                      <Pencil size={14} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDelete(cat)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* ── Modal Add / Edit Category ── */}
      <Modal visible={dialogVisible} transparent animationType="fade" onRequestClose={() => setDialogVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </Text>
              <TouchableOpacity onPress={() => setDialogVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Type Switcher */}
              <Text style={styles.label}>Tipe Transaksi *</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeOption, type === 'EXPENSE' && styles.typeExpenseActive]}
                  onPress={() => setType('EXPENSE')}
                  activeOpacity={0.75}
                >
                  <TrendingDown size={14} color={type === 'EXPENSE' ? '#ef4444' : '#64748b'} />
                  <Text style={[styles.typeOptionText, type === 'EXPENSE' && { color: '#ef4444', fontWeight: 'bold' }]}>
                    Pengeluaran
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeOption, type === 'INCOME' && styles.typeIncomeActive]}
                  onPress={() => setType('INCOME')}
                  activeOpacity={0.75}
                >
                  <TrendingUp size={14} color={type === 'INCOME' ? '#004C29' : '#64748b'} />
                  <Text style={[styles.typeOptionText, type === 'INCOME' && { color: '#004C29', fontWeight: 'bold' }]}>
                    Pemasukan
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Name Input */}
              <Text style={styles.label}>Nama Kategori *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Belanja Online, Kopi, Tagihan Listrik"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />

              {/* Emoji Selector */}
              <Text style={styles.label}>Pilih Ikon Emoji</Text>
              <View style={styles.emojiGrid}>
                {POPULAR_EMOJIS.map((e) => {
                  const isSelected = emoji === e;
                  return (
                    <TouchableOpacity
                      key={e}
                      style={[styles.emojiOption, isSelected && styles.emojiOptionSelected]}
                      onPress={() => setEmoji(e)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.emojiOptionText}>{e}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Color Selector */}
              <Text style={styles.label}>Warna Label</Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map((c) => {
                  const isSelected = color === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorOption, { backgroundColor: c }]}
                      onPress={() => setColor(c)}
                      activeOpacity={0.8}
                    >
                      {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDialogVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#004C29',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  filterChipActive: {
    backgroundColor: '#004C29',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  listContainer: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  emojiBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 18,
  },
  catName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    flexShrink: 1,
  },
  defaultPill: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  defaultPillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
  },
  catMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  catActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
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
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  typeExpenseActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  typeIncomeActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12.5,
    color: '#0f172a',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiOption: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiOptionSelected: {
    backgroundColor: '#dcfce7',
    borderWidth: 1.5,
    borderColor: '#004C29',
  },
  emojiOptionText: {
    fontSize: 18,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#64748b',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#004C29',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
