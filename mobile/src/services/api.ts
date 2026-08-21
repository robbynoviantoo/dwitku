import AsyncStorage from '@react-native-async-storage/async-storage';

// API Production URL
export const API_BASE_URL = 'https://dwitku.my.id/api/mobile';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('dwitku_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server');
  }

  return data;
}
