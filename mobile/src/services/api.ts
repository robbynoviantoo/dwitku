import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Mendapatkan API Base URL secara otomatis & fleksibel:
 * 1. Jika ada EXPO_PUBLIC_API_URL di mobile/.env, gunakan nilai tersebut.
 * 2. Jika mode development (__DEV__):
 *    - Web: http://localhost:3000/api/mobile
 *    - HP Fisik / Emulator (Expo Go): Menggunakan IP lokal komputer host Metro (misal: http://192.168.x.x:3000/api/mobile)
 * 3. Jika Production: https://dwitku.my.id/api/mobile
 */
export function getApiBaseUrl(): string {
  // 1. Cek custom ENV jika diset di mobile/.env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Mode Development lokal
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:3000/api/mobile';
    }

    // Ambil IP komputer tempat Metro bundler berjalan untuk HP fisik / emulator
    const debuggerHost =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants.manifest?.debuggerHost;

    if (debuggerHost) {
      const hostIp = debuggerHost.split(':')[0];
      if (hostIp) {
        return `http://${hostIp}:3000/api/mobile`;
      }
    }

    // Fallback Android emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api/mobile';
    }

    return 'http://localhost:3000/api/mobile';
  }

  // 3. Default Production URL
  return 'https://dwitku.my.id/api/mobile';
}

export const API_BASE_URL = getApiBaseUrl();

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('dwitku_token');
  const baseUrl = getApiBaseUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server');
  }

  return data;
}
