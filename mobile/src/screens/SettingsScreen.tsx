import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LogOut, Shield, Info, Smartphone, Scale, FileText } from 'lucide-react-native';
import { LegalModal } from '../components/LegalModal';

interface SettingsScreenProps {
  user: any;
  onLogout: () => void;
}

export default function SettingsScreen({ user, onLogout }: SettingsScreenProps) {
  const [legalModal, setLegalModal] = useState<{ visible: boolean; type: 'terms' | 'privacy' }>({
    visible: false,
    type: 'terms',
  });

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengaturan Akun</Text>
        <Text style={styles.headerSubtitle}>Profil & Informasi Aplikasi Dwitku</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {/* Modal Popup Ketentuan Layanan & Privasi */}
        <LegalModal
          visible={legalModal.visible}
          type={legalModal.type}
          onClose={() => setLegalModal({ ...legalModal, visible: false })}
        />

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
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
    borderRadius: 12,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 13.5,
    fontWeight: 'bold',
  },
});
