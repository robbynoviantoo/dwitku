import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MembersScreen from '../screens/MembersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { apiRequest } from '../services/api';
import { LayoutDashboard, PieChart, Tag, Users, Settings } from 'lucide-react-native';

interface MainTabNavigatorProps {
  user: any;
  onLogout: () => void;
}

export default function MainTabNavigator({ user, onLogout }: MainTabNavigatorProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'categories' | 'members' | 'settings'>('dashboard');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');

  const fetchActiveWorkspace = useCallback(async () => {
    try {
      const data = await apiRequest('/workspaces');
      if (data.workspaces && data.workspaces.length > 0) {
        setActiveWorkspaceId(data.workspaces[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchActiveWorkspace();
  }, [fetchActiveWorkspace]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            onLogout={onLogout}
            activeWorkspaceId={activeWorkspaceId}
            onWorkspaceChange={(wsId) => setActiveWorkspaceId(wsId)}
          />
        );
      case 'reports':
        return <ReportsScreen activeWorkspaceId={activeWorkspaceId} />;
      case 'categories':
        return <CategoriesScreen activeWorkspaceId={activeWorkspaceId} />;
      case 'members':
        return <MembersScreen activeWorkspaceId={activeWorkspaceId} />;
      case 'settings':
        return <SettingsScreen user={user} onLogout={onLogout} />;
      default:
        return (
          <DashboardScreen
            user={user}
            onLogout={onLogout}
            activeWorkspaceId={activeWorkspaceId}
            onWorkspaceChange={(wsId) => setActiveWorkspaceId(wsId)}
          />
        );
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
            size={20}
            color={activeTab === 'dashboard' ? '#16a34a' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'dashboard' ? '#16a34a' : '#71717a' },
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('reports')}
        >
          <PieChart
            size={20}
            color={activeTab === 'reports' ? '#16a34a' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'reports' ? '#16a34a' : '#71717a' },
            ]}
          >
            Laporan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('categories')}
        >
          <Tag
            size={20}
            color={activeTab === 'categories' ? '#16a34a' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'categories' ? '#16a34a' : '#71717a' },
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
            size={20}
            color={activeTab === 'members' ? '#16a34a' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'members' ? '#16a34a' : '#71717a' },
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
            size={20}
            color={activeTab === 'settings' ? '#16a34a' : '#71717a'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'settings' ? '#16a34a' : '#71717a' },
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
    height: 60,
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
});
