import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';

interface TransactionsFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  filterType: string;
  onOpenFilterModal: () => void;
}

export function TransactionsFilterBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  filterType,
  onOpenFilterModal,
}: TransactionsFilterBarProps) {
  return (
    <View style={styles.searchFilterRow}>
      <View style={styles.searchBox}>
        <Search size={15} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transaction notes..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={onClearSearch}>
            <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.filterBtn, filterType !== 'ALL' && styles.filterBtnActive]}
        onPress={onOpenFilterModal}
        activeOpacity={0.7}
      >
        <SlidersHorizontal size={14} color={filterType !== 'ALL' ? '#ffffff' : '#475569'} />
        <Text style={[styles.filterBtnText, filterType !== 'ALL' && styles.filterBtnTextActive]}>
          Filter
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0f172a',
    paddingVertical: 0,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBtnActive: {
    backgroundColor: '#004C29',
    borderColor: '#004C29',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterBtnTextActive: {
    color: '#ffffff',
  },
});
