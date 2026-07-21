import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { User, LogOut, Shield, Info, Smartphone } from 'lucide-react-native';

interface SettingsScreenProps {
  user: any;
  onLogout: () => void;
}

export default function SettingsScreen({ user, onLogout }: SettingsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengaturan App</Text>
        <Text style={styles.headerSubtitle}>Profil & Informasi Aplikasi Dwitku</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <Smartphone size={20} color="#22c55e" />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Versi Aplikasi Mobile</Text>
              <Text style={styles.itemSubtitle}>v1.0.0 (Expo React Native Build)</Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Shield size={20} color="#3b82f6" />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Keamanan Server & Database</Text>
              <Text style={styles.itemSubtitle}>Neon Serverless Postgres + Session Token</Text>
            </View>
          </View>

          <View style={styles.itemRow}>
            <Info size={20} color="#eab308" />
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Platform Compatibility</Text>
              <Text style={styles.itemSubtitle}>Android APK, iOS, & Web Dashboard</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <LogOut size={20} color="#ef4444" />
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
  profileCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#166534_40',
    borderWidth: 2,
    borderColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarTextLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 24,
    gap: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#991b1b_30',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
