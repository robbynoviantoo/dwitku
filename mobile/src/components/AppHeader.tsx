import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Sparkles, FolderKanban, ChevronDown, Eye, EyeOff, Plus } from 'lucide-react-native';

interface AppHeaderProps {
  user?: any;
  activeWorkspace?: any;
  onOpenWorkspaceModal?: () => void;
  showAmount?: boolean;
  onToggleShowAmount?: () => void;
  onOpenAddModal?: () => void;
  title?: string;
  subtitle?: string;
}

export function AppHeader({
  user,
  activeWorkspace,
  onOpenWorkspaceModal,
  showAmount,
  onToggleShowAmount,
  onOpenAddModal,
  title,
  subtitle,
}: AppHeaderProps) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Sobat';

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 11) return 'Selamat Pagi';
    if (hours >= 11 && hours < 15) return 'Selamat Siang';
    if (hours >= 15 && hours < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const isCustomTitle = !!title;

  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {isCustomTitle ? (
          <>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </>
        ) : (
          <View style={styles.greetingRow}>
            <Image
              source={require('../../assets/favicon favicon.png')}
              style={{ width: 22, height: 22, borderRadius: 6 }}
              resizeMode="contain"
            />
            <Text style={styles.greetingText}>
              {getGreeting()}, {firstName}
            </Text>
          </View>
        )}

        {activeWorkspace && onOpenWorkspaceModal ? (
          <TouchableOpacity
            style={styles.wsSelector}
            onPress={onOpenWorkspaceModal}
            activeOpacity={0.7}
          >
            <FolderKanban size={13} color="#004C29" />
            <Text style={styles.wsName}>{activeWorkspace?.name || 'Workspace'}</Text>
            <ChevronDown size={13} color="#71717a" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {onToggleShowAmount !== undefined ? (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={onToggleShowAmount}
            activeOpacity={0.7}
          >
            {showAmount ? <Eye size={18} color="#52525b" /> : <EyeOff size={18} color="#52525b" />}
          </TouchableOpacity>
        ) : null}

        {onOpenAddModal ? (
          <TouchableOpacity
            style={styles.addIconBtn}
            onPress={onOpenAddModal}
            activeOpacity={0.7}
          >
            <Plus size={18} color="#ffffff" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  wsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  wsName: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#004C29',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
