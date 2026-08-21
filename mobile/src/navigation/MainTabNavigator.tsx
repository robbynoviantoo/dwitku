import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import WalletsScreen from '../screens/WalletsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { apiRequest } from '../services/api';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Wallet,
  PieChart,
  Settings,
  FolderKanban,
  Check,
  X,
  Sparkles,
  Plus,
} from 'lucide-react-native';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';

const LAST_WORKSPACE_KEY = 'dwitku_last_workspace_id';

interface MainTabNavigatorProps {
  user: any;
  onLogout: () => void;
}

export default function MainTabNavigator({ user, onLogout }: MainTabNavigatorProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'wallets' | 'reports' | 'settings'>('dashboard');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [wsModalVisible, setWsModalVisible] = useState(false);
  const [createWsModalVisible, setCreateWsModalVisible] = useState(false);

  const { data: wsData } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiRequest('/workspaces'),
  });

  // 1. Muat workspace terakhir yang tersimpan saat buka aplikasi
  useEffect(() => {
    (async () => {
      try {
        const savedWsId = await AsyncStorage.getItem(LAST_WORKSPACE_KEY);
        if (savedWsId) {
          setSelectedWorkspaceId(savedWsId);
        }
      } catch (e) {
        console.error('Failed to load last workspace:', e);
      }
    })();
  }, []);

  // 2. Fallback ke workspace pertama jika belum ada yang dipilih
  useEffect(() => {
    if (!selectedWorkspaceId && wsData?.workspaces && wsData.workspaces.length > 0) {
      setSelectedWorkspaceId(wsData.workspaces[0].id);
    }
  }, [wsData, selectedWorkspaceId]);

  // 3. Simpan setiap pergantian workspace ke AsyncStorage & invalidate queries
  const handleWorkspaceChange = async (wsId: string) => {
    setSelectedWorkspaceId(wsId);
    setWsModalVisible(false);
    try {
      await AsyncStorage.setItem(LAST_WORKSPACE_KEY, wsId);
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (e) {
      console.error('Failed to save last workspace:', e);
    }
  };

  const [openTransactionAddTrigger, setOpenTransactionAddTrigger] = useState(0);

  const handleNavigateToTransactions = (openAddModal?: boolean) => {
    setActiveTab('transactions');
    if (openAddModal) {
      setOpenTransactionAddTrigger((prev) => prev + 1);
    }
  };

  const activeWorkspaceId =
    selectedWorkspaceId || wsData?.workspaces?.[0]?.id || '';

  const activeWorkspace =
    wsData?.workspaces?.find((w: any) => w.id === activeWorkspaceId) || wsData?.workspaces?.[0] || null;

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        <View style={[styles.screenTab, activeTab === 'dashboard' ? styles.screenActive : styles.screenHidden]}>
          <DashboardScreen
            user={user}
            onLogout={onLogout}
            activeWorkspaceId={activeWorkspaceId}
            activeWorkspace={activeWorkspace}
            onWorkspaceChange={handleWorkspaceChange}
            onOpenWorkspaceModal={() => setWsModalVisible(true)}
            onNavigateToTransactions={handleNavigateToTransactions}
          />
        </View>

        <View style={[styles.screenTab, activeTab === 'transactions' ? styles.screenActive : styles.screenHidden]}>
          <TransactionsScreen
            user={user}
            activeWorkspaceId={activeWorkspaceId}
            activeWorkspace={activeWorkspace}
            onOpenWorkspaceModal={() => setWsModalVisible(true)}
            openAddTrigger={openTransactionAddTrigger}
          />
        </View>

        <View style={[styles.screenTab, activeTab === 'wallets' ? styles.screenActive : styles.screenHidden]}>
          <WalletsScreen
            user={user}
            activeWorkspaceId={activeWorkspaceId}
            activeWorkspace={activeWorkspace}
            onOpenWorkspaceModal={() => setWsModalVisible(true)}
          />
        </View>

        <View style={[styles.screenTab, activeTab === 'reports' ? styles.screenActive : styles.screenHidden]}>
          <ReportsScreen
            user={user}
            activeWorkspaceId={activeWorkspaceId}
            activeWorkspace={activeWorkspace}
            onOpenWorkspaceModal={() => setWsModalVisible(true)}
          />
        </View>

        <View style={[styles.screenTab, activeTab === 'settings' ? styles.screenActive : styles.screenHidden]}>
          <SettingsScreen
            user={user}
            activeWorkspaceId={activeWorkspaceId}
            activeWorkspace={activeWorkspace}
            onOpenWorkspaceModal={() => setWsModalVisible(true)}
            onLogout={onLogout}
          />
        </View>
      </View>

      {/* ── Modal Global Switch Workspace ── */}
      <Modal visible={wsModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={styles.modalIconBox}>
                  <FolderKanban size={18} color="#004C29" />
                </View>
                <Text style={styles.modalTitle}>Pilih Workspace</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setWsModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320, marginVertical: 8 }} showsVerticalScrollIndicator={false}>
              {wsData?.workspaces?.map((ws: any) => {
                const isActive = ws.id === activeWorkspaceId;
                return (
                  <TouchableOpacity
                    key={ws.id}
                    style={[styles.wsCard, isActive && styles.wsCardActive]}
                    onPress={() => handleWorkspaceChange(ws.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.wsCardName, isActive && styles.wsCardNameActive]}>
                          {ws.name}
                        </Text>
                        {isActive && (
                          <View style={styles.activePill}>
                            <Text style={styles.activePillText}>Aktif</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.wsCardDesc}>
                        {ws.members?.length || 1} Anggota • {ws.currency || 'IDR'}
                      </Text>
                    </View>

                    <View style={[styles.wsRadio, isActive && styles.wsRadioActive]}>
                      {isActive && <Check size={12} color="#ffffff" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Tombol Tambah Workspace Baru */}
            <TouchableOpacity
              style={styles.addWsBtn}
              onPress={() => {
                setWsModalVisible(false);
                setCreateWsModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#004C29" />
              <Text style={styles.addWsBtnText}>Buat Workspace Baru</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Form Buat Workspace Baru */}
      <CreateWorkspaceModal
        visible={createWsModalVisible}
        onClose={() => setCreateWsModalVisible(false)}
        onSuccess={(newWs) => {
          setCreateWsModalVisible(false);
          queryClient.invalidateQueries({ queryKey: ['workspaces'] });
          if (newWs?.id) {
            handleWorkspaceChange(newWs.id);
          }
        }}
      />

      {/* Floating Modern Bottom Navigation Bar */}
      <View style={styles.floatingNavWrapper}>
        <View style={styles.floatingNavBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('dashboard')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, activeTab === 'dashboard' && styles.iconWrapperActive]}>
              <LayoutDashboard
                size={18}
                color={activeTab === 'dashboard' ? '#004C29' : '#64748b'}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'dashboard' ? '#004C29' : '#64748b' },
                activeTab === 'dashboard' && styles.tabLabelActive,
              ]}
            >
              Beranda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('transactions')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, activeTab === 'transactions' && styles.iconWrapperActive]}>
              <ArrowRightLeft
                size={18}
                color={activeTab === 'transactions' ? '#004C29' : '#64748b'}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'transactions' ? '#004C29' : '#64748b' },
                activeTab === 'transactions' && styles.tabLabelActive,
              ]}
            >
              Transaksi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('wallets')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, activeTab === 'wallets' && styles.iconWrapperActive]}>
              <Wallet
                size={18}
                color={activeTab === 'wallets' ? '#004C29' : '#64748b'}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'wallets' ? '#004C29' : '#64748b' },
                activeTab === 'wallets' && styles.tabLabelActive,
              ]}
            >
              Dompet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('reports')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, activeTab === 'reports' && styles.iconWrapperActive]}>
              <PieChart
                size={18}
                color={activeTab === 'reports' ? '#004C29' : '#64748b'}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'reports' ? '#004C29' : '#64748b' },
                activeTab === 'reports' && styles.tabLabelActive,
              ]}
            >
              Laporan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, activeTab === 'settings' && styles.iconWrapperActive]}>
              <Settings
                size={18}
                color={activeTab === 'settings' ? '#004C29' : '#64748b'}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === 'settings' ? '#004C29' : '#64748b' },
                activeTab === 'settings' && styles.tabLabelActive,
              ]}
            >
              Akun
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenContainer: {
    flex: 1,
  },
  screenTab: {
    flex: 1,
  },
  screenActive: {
    display: 'flex',
  },
  screenHidden: {
    display: 'none',
  },
  floatingNavWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    alignItems: 'center',
  },
  floatingNavBar: {
    flexDirection: 'row',
    width: '100%',
    height: 62,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 32,
    height: 28,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#f0fdf4',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  wsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  wsCardActive: {
    borderColor: '#004C29',
    backgroundColor: '#f0fdf4',
  },
  wsCardName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  wsCardNameActive: {
    color: '#004C29',
  },
  activePill: {
    backgroundColor: '#004C29',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  wsCardDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  wsRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wsRadioActive: {
    backgroundColor: '#004C29',
    borderColor: '#004C29',
  },
  addWsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e6f3ec',
    borderWidth: 1.5,
    borderColor: '#b2dec6',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  addWsBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#004C29',
  },
});
