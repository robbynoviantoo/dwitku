import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../services/api';
import {
  Send,
  Unlink,
  CheckCircle2,
  ExternalLink,
  Users,
  Shield,
  Bot,
  Sparkles,
} from 'lucide-react-native';

interface SettingsTelegramCardProps {
  workspaceId: string;
}

export function SettingsTelegramCard({ workspaceId }: SettingsTelegramCardProps) {
  const queryClient = useQueryClient();

  const { data: status, isLoading, refetch } = useQuery({
    queryKey: ['telegram-status', workspaceId],
    queryFn: () => apiRequest(`/telegram?workspaceId=${workspaceId}`),
    enabled: !!workspaceId,
  });

  const [isLinking, setIsLinking] = useState(false);

  const linkMutation = useMutation({
    mutationFn: () => apiRequest('/telegram', { method: 'POST', body: JSON.stringify({ action: 'generateToken' }) }),
    onSuccess: (res) => {
      if (res.linkUrl) {
        Linking.openURL(res.linkUrl).catch(() => {
          Alert.alert('Gagal Membuka Telegram', 'Pastikan aplikasi Telegram telah terpasang di perangkat Anda.');
        });
        Alert.alert(
          'Membuka Telegram...',
          'Silakan tekan tombol START atau Mulai di bot Telegram untuk menyelesaikan penghubungan.',
          [{ text: 'Selesai', onPress: () => refetch() }]
        );
      }
    },
    onError: (err: any) => {
      Alert.alert('Gagal Menghubungkan', err.message || 'Terjadi kesalahan');
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: () => apiRequest('/telegram', { method: 'POST', body: JSON.stringify({ action: 'unlink' }) }),
    onSuccess: () => {
      Alert.alert('Berhasil', 'Akun Telegram berhasil diputuskan.');
      queryClient.invalidateQueries({ queryKey: ['telegram-status'] });
    },
    onError: (err: any) => {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan');
    },
  });

  const handleUnlink = () => {
    Alert.alert(
      'Putuskan Sambungan Telegram?',
      'Setelah diputuskan, Anda tidak dapat mencatat transaksi lewat bot Telegram sampai menghubungkannya kembali.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Putuskan', style: 'destructive', onPress: () => unlinkMutation.mutate() },
      ]
    );
  };

  if (isLoading && !status) {
    return (
      <View style={[styles.card, { padding: 20 }]}>
        <ActivityIndicator color="#004C29" />
      </View>
    );
  }

  const isLinked = status?.isLinked;
  const members = status?.members || [];
  const linkedMembersCount = members.filter((m: any) => m.isLinked).length;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.botIconCircle}>
          <Bot size={18} color="#0284c7" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Integrasi Bot Telegram</Text>
          <Text style={styles.cardSubtitle}>
            Catat transaksi kilat via chat Telegram bot
          </Text>
        </View>
      </View>

      {/* Connection Status Box */}
      {isLinked ? (
        <View style={styles.connectedBox}>
          <View style={styles.connectedTop}>
            <CheckCircle2 size={18} color="#16a34a" />
            <View style={{ flex: 1 }}>
              <Text style={styles.connectedTitle}>Akun Telegram Terhubung</Text>
              <Text style={styles.connectedUser}>
                @{status?.telegramUsername || 'Telegram User'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.unlinkBtn}
              onPress={handleUnlink}
              disabled={unlinkMutation.isPending}
              activeOpacity={0.7}
            >
              <Unlink size={14} color="#dc2626" />
              <Text style={styles.unlinkText}>Putuskan</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.unlinkedBox}>
          <Text style={styles.unlinkedDesc}>
            Hubungkan akun Telegram Anda untuk mencatat pengeluaran & pemasukan instan melalui bot pintar Dwitku.
          </Text>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => linkMutation.mutate()}
            disabled={linkMutation.isPending}
            activeOpacity={0.8}
          >
            {linkMutation.isPending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Send size={15} color="#ffffff" />
                <Text style={styles.connectBtnText}>Hubungkan ke Telegram</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Member Telegram Status List */}
      <View style={styles.membersSection}>
        <View style={styles.membersHeader}>
          <Users size={14} color="#64748b" />
          <Text style={styles.membersTitle}>
            Status Anggota ({linkedMembersCount}/{members.length} Terhubung)
          </Text>
        </View>

        <View style={styles.membersList}>
          {members.map((m: any) => (
            <View key={m.id} style={styles.memberItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {m.name || m.email}
                </Text>
                <Text style={styles.memberEmail} numberOfLines={1}>
                  {m.email} • <Text style={{ textTransform: 'capitalize' }}>{m.role.toLowerCase()}</Text>
                </Text>
              </View>

              {m.isLinked ? (
                <View style={styles.badgeLinked}>
                  <Text style={styles.badgeLinkedText}>
                    @{m.telegramUsername || 'Connected'}
                  </Text>
                </View>
              ) : (
                <View style={styles.badgeUnlinked}>
                  <Text style={styles.badgeUnlinkedText}>Belum Konek</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
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
  botIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
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
  connectedBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 12,
    marginBottom: 14,
  },
  connectedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  connectedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
  },
  connectedUser: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
    marginTop: 1,
  },
  unlinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unlinkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  unlinkedBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 14,
  },
  unlinkedDesc: {
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 10,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 9,
  },
  connectBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  membersSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  membersTitle: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#64748b',
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  memberName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  memberEmail: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginTop: 1,
  },
  badgeLinked: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  badgeLinkedText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  badgeUnlinked: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeUnlinkedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
});
