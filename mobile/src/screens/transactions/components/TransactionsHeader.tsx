import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ArrowRightLeft, FileSpreadsheet, Plus } from 'lucide-react-native';

interface TransactionsHeaderProps {
  totalCount: number;
  onAddPress?: () => void;
  onExportPress?: () => void;
}

export function TransactionsHeader({
  totalCount,
  onAddPress,
  onExportPress,
}: TransactionsHeaderProps) {
  return (
    <View style={styles.titleSection}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <ArrowRightLeft size={20} color="#004C29" />
          <Text style={styles.titleText}>Transactions</Text>
        </View>
        <Text style={styles.countText}>{totalCount} transactions found</Text>
      </View>

      <View style={styles.headerRightActions}>
        <TouchableOpacity style={styles.exportBtn} onPress={onExportPress} activeOpacity={0.7}>
          <FileSpreadsheet size={16} color="#004C29" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addBtn} onPress={onAddPress} activeOpacity={0.7}>
          <Plus size={15} color="#ffffff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  countText: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#004C29',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
});
