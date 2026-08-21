import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  LogOut,
  Shield,
  Info,
  Smartphone,
  Scale,
  FileText,
  Building2,
  Users,
  Bot,
  User,
  FolderKanban,
  Tag,
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { LegalModal } from '../components/LegalModal';
import { SettingsWorkspaceForm } from './settings/components/SettingsWorkspaceForm';
import { SettingsCategoriesCard } from './settings/components/SettingsCategoriesCard';
import { SettingsMembersCard } from './settings/components/SettingsMembersCard';
import { SettingsTelegramCard } from './settings/components/SettingsTelegramCard';

interface SettingsScreenProps {
  user: any;
  activeWorkspaceId?: string;
  activeWorkspace?: any;
  onOpenWorkspaceModal?: () => void;
  onLogout: () => void;
}

type SettingsTab = 'workspace' | 'categories' | 'members' | 'telegram' | 'profile';

export default function SettingsScreen({
  user,
  activeWorkspaceId,
  activeWorkspace,
  onOpenWorkspaceModal,
  onLogout,
}: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('workspace');
  const [legalModal, setLegalModal] = useState<{ visible: boolean; type: 'terms' | 'privacy' }>({
    visible: false,
    type: 'terms',
  });

  const isOwner = activeWorkspace?.role === 'OWNER' || activeWorkspace?.ownerId === user?.id;

  const confirmLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun Dwitku ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Keluar',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. App Header */}
      <AppHeader
        user={user}
        activeWorkspace={activeWorkspace}
        onOpenWorkspaceModal={onOpenWorkspaceModal}
        showAmount={true}
        onToggleShowAmount={() => {}}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Pengaturan</Text>
          <Text style={styles.pageSubtitle}>
            Workspace "{activeWorkspace?.name || 'Utama'}" & Akun Anda
          </Text>
        </View>

        {/* 3. Settings Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'workspace' && styles.tabItemActive]}
            onPress={() => setActiveTab('workspace')}
            activeOpacity={0.7}
          >
            <Building2
              size={14}
              color={activeTab === 'workspace' ? '#004C29' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'workspace' && styles.tabTextActive,
              ]}
              numberOfLines={1}
            >
              Workspace
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'categories' && styles.tabItemActive]}
            onPress={() => setActiveTab('categories')}
            activeOpacity={0.7}
          >
            <Tag
              size={14}
              color={activeTab === 'categories' ? '#004C29' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'categories' && styles.tabTextActive,
              ]}
              numberOfLines={1}
            >
              Kategori
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'members' && styles.tabItemActive]}
            onPress={() => setActiveTab('members')}
            activeOpacity={0.7}
          >
            <Users
              size={14}
              color={activeTab === 'members' ? '#004C29' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'members' && styles.tabTextActive,
              ]}
              numberOfLines={1}
            >
              Anggota
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'telegram' && styles.tabItemActive]}
            onPress={() => setActiveTab('telegram')}
            activeOpacity={0.7}
          >
            <Bot
              size={15}
              color={activeTab === 'telegram' ? '#004C29' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'telegram' && styles.tabTextActive,
              ]}
            >
              Telegram
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
            onPress={() => setActiveTab('profile')}
            activeOpacity={0.7}
          >
            <User
              size={15}
              color={activeTab === 'profile' ? '#004C29' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'profile' && styles.tabTextActive,
              ]}
            >
              Profil
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Tab Content */}
        {activeTab === 'workspace' && (
          <SettingsWorkspaceForm
            workspace={activeWorkspace}
            isOwner={isOwner}
          />
        )}

        {activeTab === 'categories' && (
          <SettingsCategoriesCard
            workspaceId={activeWorkspaceId || ''}
            isOwner={isOwner}
          />
        )}

        {activeTab === 'members' && (
          <SettingsMembersCard
            workspaceId={activeWorkspaceId || ''}
            isOwner={isOwner}
            currentUserId={user?.id}
          />
        )}

        {activeTab === 'telegram' && (
          <SettingsTelegramCard
            workspaceId={activeWorkspaceId || ''}
          />
        )}

        {activeTab === 'profile' && (
          <View>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarTextLarge}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <Text style={styles.userName}>{user?.name || 'User Dwitku'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            {/* Info Items */}
            <View style={styles.section}>
              <View style={styles.itemRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#004C2920' }]}>
                  <Smartphone size={18} color="#004C29" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Versi Aplikasi Mobile</Text>
                  <Text style={styles.itemSubtitle}>v1.1.0 (Expo React Native Build)</Text>
                </View>
              </View>

              <View style={styles.itemRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#2563eb20' }]}>
                  <Shield size={18} color="#2563eb" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Keamanan Server & Database</Text>
                  <Text style={styles.itemSubtitle}>Neon Serverless Postgres + Session Token</Text>
                </View>
              </View>

              <View style={styles.itemRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#eab30820' }]}>
                  <Info size={18} color="#eab308" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Kompatibilitas Platform</Text>
                  <Text style={styles.itemSubtitle}>Android APK, iOS, & Web Dashboard</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => setLegalModal({ visible: true, type: 'terms' })}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#004C2920' }]}>
                  <Scale size={18} color="#004C29" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Ketentuan Layanan</Text>
                  <Text style={styles.itemSubtitle}>Hak & ketentuan penggunaan Dwitku</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => setLegalModal({ visible: true, type: 'privacy' })}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#3b82f620' }]}>
                  <FileText size={18} color="#3b82f6" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Kebijakan Privasi</Text>
                  <Text style={styles.itemSubtitle}>Perlindungan & keamanan data keuangan Anda</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
              <LogOut size={18} color="#ef4444" />
              <Text style={styles.logoutText}>Keluar dari Akun</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal Popup Ketentuan Layanan & Privasi */}
      <LegalModal
        visible={legalModal.visible}
        type={legalModal.type}
        onClose={() => setLegalModal({ ...legalModal, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },
  pageHeader: {
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 7,
    paddingHorizontal: 2,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#004C29',
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarTextLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004C29',
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 13.5,
    fontWeight: 'bold',
  },
});
