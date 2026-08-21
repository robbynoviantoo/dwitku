import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { apiRequest } from '../services/api';
import { Tag } from 'lucide-react-native';

interface CategoriesScreenProps {
  activeWorkspaceId: string;
}

export default function CategoriesScreen({ activeWorkspaceId }: CategoriesScreenProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const fetchCategories = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    try {
      const data = await apiRequest(`/transactions?workspaceId=${activeWorkspaceId}`);
      setCategories(data.categories || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((c) => c.type === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kategori Keuangan</Text>
        <Text style={styles.headerSubtitle}>Daftar kategori pengeluaran & pemasukan</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'EXPENSE' && styles.tabActiveExpense]}
          onPress={() => setActiveTab('EXPENSE')}
        >
          <Text style={[styles.tabText, activeTab === 'EXPENSE' && styles.tabTextActive]}>
            Pengeluaran
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'INCOME' && styles.tabActiveIncome]}
          onPress={() => setActiveTab('INCOME')}
        >
          <Text style={[styles.tabText, activeTab === 'INCOME' && styles.tabTextActive]}>
            Pemasukan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#16a34a" style={{ marginTop: 40 }} />
        ) : filteredCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Tag size={44} color="#3f3f46" />
            <Text style={styles.emptyText}>Belum ada kategori untuk tipe ini</Text>
          </View>
        ) : (
          filteredCategories.map((item) => (
            <View key={item.id} style={styles.categoryCard}>
              <View style={[styles.emojiContainer, { backgroundColor: item.color ? `${item.color}25` : '#27272a' }]}>
                <Text style={styles.emoji}>{item.emoji || '📁'}</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryType}>
                  {item.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                </Text>
              </View>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Bawaan</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActiveExpense: {
    backgroundColor: '#dc2626',
  },
  tabActiveIncome: {
    backgroundColor: '#16a34a',
  },
  tabText: {
    color: '#a1a1aa',
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#71717a',
    marginTop: 12,
    fontSize: 13,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryType: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  defaultBadge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultText: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '500',
  },
});
