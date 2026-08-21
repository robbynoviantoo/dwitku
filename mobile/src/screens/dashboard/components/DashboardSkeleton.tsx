import React from 'react';
import { StyleSheet, View } from 'react-native';

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* 1. Hero Skeleton */}
      <View style={styles.heroSkeleton}>
        <View style={styles.badgeSkeleton} />
        <View style={styles.amountSkeleton} />
        <View style={styles.heroRow}>
          <View style={styles.heroColSkeleton} />
          <View style={styles.heroColSkeleton} />
        </View>
      </View>

      {/* 2. Calendar Skeleton */}
      <View style={styles.cardSkeleton}>
        <View style={styles.cardHeaderSkeleton}>
          <View style={styles.titleSkeleton} />
          <View style={styles.btnSkeleton} />
        </View>
        <View style={styles.gridSkeleton}>
          {Array.from({ length: 28 }).map((_, i) => (
            <View key={i} style={styles.dateCellSkeleton} />
          ))}
        </View>
      </View>

      {/* 3. Recent Transactions Skeleton */}
      <View style={styles.cardSkeleton}>
        <View style={styles.cardHeaderSkeleton}>
          <View style={styles.titleSkeleton} />
          <View style={styles.btnSkeleton} />
        </View>
        <View style={{ gap: 8, marginTop: 4 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.txRowSkeleton} />
          ))}
        </View>
      </View>

      {/* 4. Wallets Skeleton */}
      <View style={styles.cardSkeleton}>
        <View style={styles.cardHeaderSkeleton}>
          <View style={styles.titleSkeleton} />
          <View style={styles.btnSkeleton} />
        </View>
        <View style={styles.walletsRow}>
          <View style={styles.walletCardSkeleton} />
          <View style={styles.walletCardSkeleton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  heroSkeleton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 24,
    padding: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  badgeSkeleton: {
    width: 140,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#cbd5e1',
  },
  amountSkeleton: {
    width: '70%',
    height: 36,
    borderRadius: 8,
    backgroundColor: '#cbd5e1',
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroColSkeleton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#cbd5e1',
  },
  cardSkeleton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSkeleton: {
    width: 120,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  btnSkeleton: {
    width: 60,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  dateCellSkeleton: {
    width: '12.5%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  txRowSkeleton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  walletsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  walletCardSkeleton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
});
