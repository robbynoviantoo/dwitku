import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface TransactionsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function TransactionsPagination({
  page,
  totalPages,
  onPageChange,
}: TransactionsPaginationProps) {
  const displayTotal = Math.max(1, totalPages);

  return (
    <View style={styles.floatingPagingWrapper} pointerEvents="box-none">
      <View style={styles.floatingPagingPill}>
        <TouchableOpacity
          style={[styles.pagingChevronBtn, page <= 1 && styles.pagingChevronDisabled]}
          disabled={page <= 1}
          onPress={() => onPageChange(Math.max(1, page - 1))}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color={page <= 1 ? '#cbd5e1' : '#334155'} />
        </TouchableOpacity>

        <Text style={styles.pagingText}>
          {page} <Text style={{ color: '#94a3b8', fontWeight: 'normal' }}>/</Text> {displayTotal}
        </Text>

        <TouchableOpacity
          style={[styles.pagingChevronBtn, page >= displayTotal && styles.pagingChevronDisabled]}
          disabled={page >= displayTotal}
          onPress={() => onPageChange(Math.min(displayTotal, page + 1))}
          activeOpacity={0.7}
        >
          <ChevronRight size={16} color={page >= displayTotal ? '#cbd5e1' : '#334155'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingPagingWrapper: {
    position: 'absolute',
    bottom: 84, // Tepat di atas floating tab navigator (bottom: 12 + height: 62 + margin)
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  floatingPagingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pagingChevronBtn: {
    padding: 3,
  },
  pagingChevronDisabled: {
    opacity: 0.3,
  },
  pagingText: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0f172a',
  },
});
