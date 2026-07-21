import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import MembersScreen from '../screens/MembersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { apiRequest } from '../services/api';
import { LayoutDashboard, Tag, Users, Settings } from 'lucide-react-native';

interface MainTabNavigatorProps {
  user: any;
  onLogout: () => void;
}

export default function MainTabNavigator({ user, onLogout }: MainTabNavigatorProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'members' | 'settings'>('dashboard');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');

  useEffect(() => {
    fetchActiveWorkspace();
  }, []);

  const fetchActiveWorkspace = async () => {
    try {
      const data = await apiRequest('/workspaces');
      if (data.workspaces && data.workspaces.length > 0) {
        setActiveWorkspaceId(data.workspaces[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen user={user} onLogout={onLogout} />;
      case 'categories':
        return <CategoriesScreen activeWorkspaceId={activeWorkspaceId} />;
      case 'members':
        return <MembersScreen activeWorkspaceId={activeWorkspaceId} />;
      case 'settings':
        return <SettingsScreen user={user} onLogout={onLogout} />;
      default:
        return <DashboardScreen user={user} onLogout={onLogout} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard
            size={22}
            color={activeTab === 'dashboard' ? '#22c55e' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'dashboard' ? '#22c55e' : '#71717a' },
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('categories')}
        >
          <Tag
            size={22}
            color={activeTab === 'categories' ? '#22c55e' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'categories' ? '#22c55e' : '#71717a' },
            ]}
          >
            Kategori
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('members')}
        >
          <Users
            size={22}
            color={activeTab === 'members' ? '#22c55e' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'members' ? '#22c55e' : '#71717a' },
            ]}
          >
            Anggota
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('settings')}
        >
          <Settings
            size={22}
            color={activeTab === 'settings' ? '#22c55e' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'settings' ? '#22c55e' : '#71717a' },
            ]}
          >
            Pengaturan
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  screenContainer: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingBottom: 6,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
