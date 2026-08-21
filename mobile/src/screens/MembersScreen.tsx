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
  Modal,
  TextInput,
} from 'react-native';
import { apiRequest } from '../services/api';
import { Users, ShieldCheck, Mail, UserPlus } from 'lucide-react-native';

interface MembersScreenProps {
  activeWorkspaceId: string;
}

export default function MembersScreen({ activeWorkspaceId }: MembersScreenProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Invite
  const [modalVisible, setModalVisible] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!activeWorkspaceId) return;
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
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInviteMember = async () => {
    if (!emailInput) {
      Alert.alert('Perhatian', 'Email wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/members', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: activeWorkspaceId,
          email: emailInput,
          role: roleInput,
        }),
      });

      Alert.alert('Sukses', `Anggota (${emailInput}) berhasil ditambahkan!`);
      setModalVisible(false);
      setEmailInput('');
      fetchMembers();
    } catch (err: any) {
      Alert.alert('Gagal Tambah Anggota', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return '#eab308';
      case 'EDITOR':
        return '#16a34a';
      default:
        return '#71717a';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Anggota Kolaborasi</Text>
          <Text style={styles.headerSubtitle}>Anggota yang memiliki akses ke buku ini</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <UserPlus size={16} color="#ffffff" />
          <Text style={styles.addBtnText}>Undang</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#16a34a" style={{ marginTop: 40 }} />
        ) : members.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={44} color="#3f3f46" />
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
                  <Mail size={12} color="#71717a" />
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

      {/* Modal Tambah / Undang Anggota */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Anggota Baru</Text>
            <Text style={styles.inputLabel}>Email Anggota</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="email@anggota.com"
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailInput}
              onChangeText={setEmailInput}
            />

            <Text style={styles.inputLabel}>Pilih Hak Akses</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  roleInput === 'EDITOR' && { backgroundColor: '#16a34a' },
                ]}
                onPress={() => setRoleInput('EDITOR')}
              >
                <Text
                  style={[
                    styles.roleBtnText,
                    roleInput === 'EDITOR' && { color: '#ffffff', fontWeight: 'bold' },
                  ]}
                >
                  EDITOR (Bisa Tambah / Edit)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  roleInput === 'VIEWER' && { backgroundColor: '#27272a' },
                ]}
                onPress={() => setRoleInput('VIEWER')}
              >
                <Text
                  style={[
                    styles.roleBtnText,
                    roleInput === 'VIEWER' && { color: '#ffffff', fontWeight: 'bold' },
                  ]}
                >
                  VIEWER (Hanya Melihat)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.saveBtn]}
                onPress={handleInviteMember}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveText}>Tambahkan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#71717a',
    marginTop: 10,
    fontSize: 13,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
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
    fontSize: 11,
    color: '#71717a',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#09090b',
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 14,
  },
  inputLabel: {
    color: '#a1a1aa',
    fontSize: 12,
    marginBottom: 6,
    marginTop: 8,
    fontWeight: '500',
  },
  modalInput: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#ffffff',
  },
  roleContainer: {
    gap: 6,
    marginVertical: 6,
  },
  roleBtn: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  roleBtnText: {
    color: '#a1a1aa',
    fontWeight: '500',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#27272a',
  },
  cancelText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#16a34a',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
