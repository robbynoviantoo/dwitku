import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../services/api';
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  Crown,
  Edit3,
  Eye,
  Check,
} from 'lucide-react-native';

interface SettingsMembersCardProps {
  workspaceId: string;
  isOwner: boolean;
  currentUserId: string;
}

export function SettingsMembersCard({
  workspaceId,
  isOwner,
  currentUserId,
}: SettingsMembersCardProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [showInviteBox, setShowInviteBox] = useState(false);

  // Fetch members
  const { data, isLoading } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => apiRequest(`/members?workspaceId=${workspaceId}`),
    enabled: !!workspaceId,
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: () =>
      apiRequest('/members', {
        method: 'POST',
        body: JSON.stringify({ workspaceId, email, role }),
      }),
    onSuccess: () => {
      Alert.alert('Berhasil', `Anggota dengan email ${email} berhasil ditambahkan!`);
      setEmail('');
      setShowInviteBox(false);
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
    },
    onError: (err: any) => {
      Alert.alert('Gagal Menambah Anggota', err.message || 'Terjadi kesalahan');
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/members?workspaceId=${workspaceId}&userId=${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      Alert.alert('Berhasil', 'Anggota telah dikeluarkan dari workspace.');
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
    },
    onError: (err: any) => {
      Alert.alert('Gagal Menghapus', err.message || 'Terjadi kesalahan');
    },
  });

  const handleRemove = (member: any) => {
    Alert.alert(
      'Keluarkan Anggota?',
      `Yakin ingin mengeluarkan ${member.user?.name || member.user?.email} dari workspace ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluarkan',
          style: 'destructive',
          onPress: () => removeMutation.mutate(member.userId || member.user?.id),
        },
      ]
    );
  };

  const members = data?.members || [];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Users size={18} color="#004C29" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Anggota Workspace</Text>
          <Text style={styles.cardSubtitle}>
            Kelola tim kolaborasi & hak akses workspace
          </Text>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowInviteBox(!showInviteBox)}
            activeOpacity={0.7}
          >
            <UserPlus size={14} color="#004C29" />
            <Text style={styles.addBtnText}>Undang</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Invite Form Accordion */}
      {showInviteBox && isOwner && (
        <View style={styles.inviteBox}>
          <Text style={styles.inviteBoxTitle}>Undang Anggota Baru</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Masukkan email pengguna..."
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.rolePickerRow}>
            <TouchableOpacity
              style={[styles.roleChip, role === 'EDITOR' && styles.roleChipActive]}
              onPress={() => setRole('EDITOR')}
              activeOpacity={0.7}
            >
              <Edit3 size={13} color={role === 'EDITOR' ? '#ffffff' : '#64748b'} />
              <Text style={[styles.roleText, role === 'EDITOR' && styles.roleTextActive]}>
                Editor (Bisa Catat)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleChip, role === 'VIEWER' && styles.roleChipActive]}
              onPress={() => setRole('VIEWER')}
              activeOpacity={0.7}
            >
              <Eye size={13} color={role === 'VIEWER' ? '#ffffff' : '#64748b'} />
              <Text style={[styles.roleText, role === 'VIEWER' && styles.roleTextActive]}>
                Viewer (Lihat Saja)
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitInviteBtn}
            onPress={() => inviteMutation.mutate()}
            disabled={inviteMutation.isPending || !email.trim()}
            activeOpacity={0.8}
          >
            {inviteMutation.isPending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitInviteText}>Tambahkan ke Workspace</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Members List */}
      {isLoading ? (
        <ActivityIndicator color="#004C29" style={{ marginVertical: 10 }} />
      ) : (
        <View style={styles.list}>
          {members.map((m: any) => {
            const isMe = (m.userId || m.user?.id) === currentUserId;
            const isMemberOwner = m.role === 'OWNER';

            return (
              <View key={m.id || m.userId} style={styles.memberRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(m.user?.name || m.user?.email || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {m.user?.name || 'Pengguna Dwitku'}
                    </Text>
                    {isMe && <Text style={styles.meBadge}>(Anda)</Text>}
                  </View>
                  <Text style={styles.memberEmail} numberOfLines={1}>
                    {m.user?.email}
                  </Text>
                </View>

                {/* Role Badge */}
                <View
                  style={[
                    styles.roleBadge,
                    isMemberOwner && { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
                  ]}
                >
                  {isMemberOwner && <Crown size={11} color="#d97706" />}
                  <Text
                    style={[
                      styles.roleBadgeText,
                      isMemberOwner && { color: '#b45309', fontWeight: 'bold' },
                    ]}
                  >
                    {m.role}
                  </Text>
                </View>

                {/* Remove Button for Owner */}
                {isOwner && !isMemberOwner && !isMe && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRemove(m)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={15} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#004C29',
  },
  inviteBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 14,
  },
  inviteBoxTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12.5,
    color: '#0f172a',
    marginBottom: 10,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 7,
    borderRadius: 8,
  },
  roleChipActive: {
    backgroundColor: '#004C29',
    borderColor: '#004C29',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  roleTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  submitInviteBtn: {
    backgroundColor: '#004C29',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  submitInviteText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  list: {
    gap: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  memberName: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  meBadge: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  deleteBtn: {
    padding: 6,
  },
});
