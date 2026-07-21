import React, { useState, useEffect } from 'react';
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
import { Users, ShieldCheck, Mail, UserCheck } from 'lucide-react-native';

interface MembersScreenProps {
  activeWorkspaceId: string;
}

export default function MembersScreen({ activeWorkspaceId }: MembersScreenProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchMembers();
    }
  }, [activeWorkspaceId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/workspaces');
      const ws = data.workspaces?.find((w: any) => w.id === activeWorkspaceId);
      setMembers(ws?.members || []);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return '#eab308';
      case 'EDITOR':
        return '#22c55e';
      default:
        return '#a1a1aa';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anggota Kolaborasi</Text>
        <Text style={styles.headerSubtitle}>Anggota yang memiliki akses ke buku ini</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color="#22c55e" style={{ marginTop: 40 }} />
        ) : members.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={48} color="#3f3f46" />
            <Text style={styles.emptyText}>Belum ada anggota di workspace ini</Text>
          </View>
        ) : (
          members.map((item) => (
            <View key={item.id} style={styles.memberCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.user?.name || 'Tanpa Nama'}</Text>
                <View style={styles.emailRow}>
                  <Mail size={12} color="#a1a1aa" />
                  <Text style={styles.memberEmail}>{item.user?.email}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.roleBadge,
                  { borderColor: getRoleBadgeColor(item.role) },
                ]}
              >
                <ShieldCheck size={12} color={getRoleBadgeColor(item.role)} />
                <Text style={[styles.roleText, { color: getRoleBadgeColor(item.role) }]}>
                  {item.role}
                </Text>
              </View>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#71717a',
    marginTop: 12,
    fontSize: 14,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#09090b',
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
