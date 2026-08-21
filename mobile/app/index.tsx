import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthScreen from '../src/screens/AuthScreen';
import MainTabNavigator from '../src/navigation/MainTabNavigator';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('dwitku_token');
      const storedUser = await AsyncStorage.getItem('dwitku_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData: any, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
  };

  const handleLogout = async () => {
    queryClient.clear();
    await AsyncStorage.removeItem('dwitku_token');
    await AsyncStorage.removeItem('dwitku_user');
    setUser(null);
    setToken(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004C29" />
      </View>
    );
  }

  const isLoggedIn = !!(token && user);

  return (
    <QueryClientProvider client={queryClient}>
      <View style={[styles.container, { backgroundColor: '#f8fafc' }]}>
        <StatusBar
          style="dark"
          backgroundColor="#ffffff"
        />
        {isLoggedIn ? (
          <MainTabNavigator user={user} onLogout={handleLogout} />
        ) : (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
