import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LogOut, Shield, Info, Smartphone } from 'lucide-react-native';

interface SettingsScreenProps {
  user: any;
  onLogout: () => void;
}

export default function SettingsScreen({ user, onLogout }: SettingsScreenProps) {
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
            <View style={[styles.iconCircle, { backgroundColor: '#16a34a20' }]}>
              <Smartphone size={18} color="#16a34a" />
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
        </View>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1.5,
    borderColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarTextLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 3,
  },
  section: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
    gap: 14,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 13,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
