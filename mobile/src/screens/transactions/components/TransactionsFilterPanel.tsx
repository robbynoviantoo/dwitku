import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  Tag,
  CreditCard,
} from 'lucide-react-native';
import { DateRangePickerModal } from '../../../components/DateRangePickerModal';

interface TransactionsFilterPanelProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  filterType: 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER';
  onFilterTypeChange: (type: 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER') => void;
  selectedCategoryId?: string;
  onCategoryChange: (catId?: string) => void;
  selectedWalletId?: string;
  onWalletChange: (walletId?: string) => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
  categories: any[];
  wallets: any[];
  onReset: () => void;
}

export function TransactionsFilterPanel({
  searchQuery,
  onSearchChange,
  onClearSearch,
  filterType,
  onFilterTypeChange,
  selectedCategoryId,
  onCategoryChange,
  selectedWalletId,
  onWalletChange,
  dateRange,
  onDateRangeChange,
  categories = [],
  wallets = [],
  onReset,
}: TransactionsFilterPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const hasActiveFilter = Boolean(
    filterType !== 'ALL' ||
      selectedCategoryId ||
      selectedWalletId ||
      dateRange.startDate ||
      dateRange.endDate ||
      searchQuery.trim()
  );

  const selectedCat = categories.find((c) => c.id === selectedCategoryId);
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  const formatDateLabel = () => {
    if (!dateRange.startDate && !dateRange.endDate) return 'Pilih Tanggal';
    if (dateRange.startDate === dateRange.endDate) {
      const d = new Date(dateRange.startDate + 'T00:00:00');
      return `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })} ${d.getFullYear()}`;
    }
    const d1 = new Date(dateRange.startDate + 'T00:00:00');
    const d2 = new Date(dateRange.endDate + 'T00:00:00');
    return `${d1.getDate()} ${d1.toLocaleDateString('id-ID', { month: 'short' })} - ${d2.getDate()} ${d2.toLocaleDateString('id-ID', { month: 'short' })}`;
  };

  return (
    <View style={styles.cardContainer}>
      {/* ── Top Row: Search Input + Toggle Filter + Reset ── */}
      <View style={styles.topRow}>
        <View style={styles.searchBox}>
          <Search size={14} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transaction notes..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={onClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={14} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Toggle Button Filter */}
        <TouchableOpacity
          style={[styles.filterToggleBtn, (expanded || hasActiveFilter) && styles.filterToggleBtnActive]}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <SlidersHorizontal
            size={13}
            color={expanded || hasActiveFilter ? '#004C29' : '#475569'}
          />
          <Text style={[styles.filterToggleText, (expanded || hasActiveFilter) && styles.filterToggleTextActive]}>
            Filter
          </Text>
          {hasActiveFilter && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* Tombol Reset Filter */}
        {hasActiveFilter && (
          <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.7}>
            <RotateCcw size={13} color="#ef4444" />
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Expanded Advanced Filter Panel (Persis Web App) ── */}
      {expanded && (
        <View style={styles.advancedPanel}>
          {/* 1. TRANSACTION TYPE */}
          <Text style={styles.sectionLabel}>TRANSACTION TYPE</Text>
          <View style={styles.typePillRow}>
            {[
              { key: 'ALL', label: '📊 All Types' },
              { key: 'INCOME', label: '↑ Income' },
              { key: 'EXPENSE', label: '↓ Expense' },
              { key: 'TRANSFER', label: '⇄ Transfer Saldo' },
            ].map((t) => {
              const isSelected = filterType === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typePill, isSelected && styles.typePillActive]}
                  onPress={() => onFilterTypeChange(t.key as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2. CATEGORIES */}
          <Text style={styles.sectionLabel}>CATEGORIES</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setCatModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.selectBoxLeft}>
              <Tag size={13} color="#64748b" />
              <Text style={[styles.selectBoxText, selectedCat && { color: '#0f172a', fontWeight: 'bold' }]} numberOfLines={1}>
                {selectedCat ? `${selectedCat.emoji || '🏷️'} ${selectedCat.name}` : 'All Categories'}
              </Text>
            </View>
            <ChevronDown size={14} color="#64748b" />
          </TouchableOpacity>

          {/* 3. DOMPET / BANK */}
          <Text style={styles.sectionLabel}>DOMPET / BANK</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setWalletModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.selectBoxLeft}>
              <CreditCard size={13} color="#64748b" />
              <Text style={[styles.selectBoxText, selectedWallet && { color: '#0f172a', fontWeight: 'bold' }]} numberOfLines={1}>
                {selectedWallet ? selectedWallet.name : 'Semua Dompet'}
              </Text>
            </View>
            <ChevronDown size={14} color="#64748b" />
          </TouchableOpacity>

          {/* 4. DATE */}
          <Text style={styles.sectionLabel}>DATE</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setDateModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.selectBoxLeft}>
              <CalendarIcon size={13} color="#64748b" />
              <Text
                style={[
                  styles.selectBoxText,
                  (dateRange.startDate || dateRange.endDate) && { color: '#0f172a', fontWeight: 'bold' },
                ]}
                numberOfLines={1}
              >
                {formatDateLabel()}
              </Text>
            </View>
            {(dateRange.startDate || dateRange.endDate) ? (
              <TouchableOpacity
                onPress={() => onDateRangeChange({ startDate: '', endDate: '' })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={14} color="#94a3b8" />
              </TouchableOpacity>
            ) : (
              <ChevronDown size={14} color="#64748b" />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ── Modal Picker Category ── */}
      <Modal visible={catModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              <TouchableOpacity onPress={() => setCatModalVisible(false)}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.modalItem, !selectedCategoryId && styles.modalItemActive]}
                onPress={() => {
                  onCategoryChange(undefined);
                  setCatModalVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, !selectedCategoryId && styles.modalItemTextActive]}>
                  Semua Kategori
                </Text>
                {!selectedCategoryId && <Check size={16} color="#004C29" />}
              </TouchableOpacity>
              {categories.map((c) => {
                const isSelected = selectedCategoryId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      onCategoryChange(c.id);
                      setCatModalVisible(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16 }}>{c.emoji || '📦'}</Text>
                      <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                        {c.name}
                      </Text>
                    </View>
                    {isSelected && <Check size={16} color="#004C29" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Modal Picker Wallet ── */}
      <Modal visible={walletModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Dompet / Bank</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(false)}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.modalItem, !selectedWalletId && styles.modalItemActive]}
                onPress={() => {
                  onWalletChange(undefined);
                  setWalletModalVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, !selectedWalletId && styles.modalItemTextActive]}>
                  Semua Dompet
                </Text>
                {!selectedWalletId && <Check size={16} color="#004C29" />}
              </TouchableOpacity>
              {wallets.map((w) => {
                const isSelected = selectedWalletId === w.id;
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.modalItem, isSelected && styles.modalItemActive]}
                    onPress={() => {
                      onWalletChange(w.id);
                      setWalletModalVisible(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>
                      {w.name}
                    </Text>
                    {isSelected && <Check size={16} color="#004C29" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Modal Date Picker ── */}
      <DateRangePickerModal
        visible={dateModalVisible}
        value={dateRange}
        onChange={(r) => {
          onDateRangeChange(r);
          setDateModalVisible(false);
        }}
        onClose={() => setDateModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    paddingVertical: 0,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterToggleBtnActive: {
    backgroundColor: '#e6f3ec',
    borderColor: '#b2dec6',
  },
  filterToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterToggleTextActive: {
    color: '#004C29',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#004C29',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 38,
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  advancedPanel: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  typePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 2,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typePillActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  typePillTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    marginTop: 2,
  },
  selectBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  selectBoxText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  modalItemActive: {
    backgroundColor: '#e6f3ec',
    borderRadius: 10,
  },
  modalItemText: {
    fontSize: 13,
    color: '#334155',
  },
  modalItemTextActive: {
    fontWeight: 'bold',
    color: '#004C29',
  },
});
