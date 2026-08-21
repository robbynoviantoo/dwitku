import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../services/api';
import { Eye, EyeOff } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { LegalModal } from '../components/LegalModal';

interface AuthScreenProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState<{ visible: boolean; type: 'terms' | 'privacy' }>({
    visible: false,
    type: 'terms',
  });

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      await AsyncStorage.setItem('dwitku_token', data.token);
      await AsyncStorage.setItem('dwitku_user', JSON.stringify(data.user));

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Login',
      'Untuk melakukan login dengan Google di HP Android/iOS, silakan buka versi Web Dwitku (dwitku.my.id) atau gunakan akun email & password terdaftar.',
      [{ text: 'Mengerti' }]
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Lupa Password',
      'Silakan kunjungi https://dwitku.my.id/forgot-password melalui browser untuk mereset password akun Anda.',
      [{ text: 'Tutup' }]
    );
  };

  const handleRegister = () => {
    Alert.alert(
      'Daftar Akun',
      'Pendaftaran akun baru saat ini dapat dilakukan dengan mudah melalui browser di https://dwitku.my.id/register',
      [{ text: 'Mengerti' }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Form Putih Bersih sesuai Login Web */}
        <View style={styles.card}>
          {/* Header Title & Subtitle with Official Brand Logo */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../../assets/favicon favicon.png')}
                style={{ width: 44, height: 44, borderRadius: 12 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Selamat Kembali</Text>
            <Text style={styles.subtitle}>Masuk untuk melihat catatan keuanganmu.</Text>
          </View>

          {/* Form Input Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="johndoe@example.com"
              placeholderTextColor="#a1a1aa"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Form Input Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#a1a1aa"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#71717a" />
                ) : (
                  <Eye size={18} color="#71717a" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me Checkbox */}
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Selalu ingat saya</Text>
          </TouchableOpacity>

          {/* Error Message Box */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Tombol Masuk (Green CTA) */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>Masuk</Text>
            )}
          </TouchableOpacity>

          {/* Divider "Atau masuk dengan" */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Atau masuk dengan</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Tombol Google OAuth */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <Path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <Path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <Path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </Svg>
            <Text style={styles.googleBtnText}>Google</Text>
          </TouchableOpacity>

          {/* Footer Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Belum punya akun? </Text>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Daftar sekarang</Text>
            </TouchableOpacity>
          </View>

          {/* Terms & Privacy Note with Clickable Modals */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsNote}>Dengan melanjutkan, Anda menyetujui </Text>
            <TouchableOpacity onPress={() => setLegalModal({ visible: true, type: 'terms' })}>
              <Text style={styles.termsLink}>Ketentuan Layanan</Text>
            </TouchableOpacity>
            <Text style={styles.termsNote}> dan </Text>
            <TouchableOpacity onPress={() => setLegalModal({ visible: true, type: 'privacy' })}>
              <Text style={styles.termsLink}>Kebijakan Privasi</Text>
            </TouchableOpacity>
            <Text style={styles.termsNote}> Dwitku.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal Popup Ketentuan Layanan & Privasi */}
      <LegalModal
        visible={legalModal.visible}
        type={legalModal.type}
        onClose={() => setLegalModal({ ...legalModal, visible: false })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5', // zinc-50 background persis seperti auth layout web
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoBadge: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#71717a', // text-zinc-500
    marginTop: 6,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3f3f46', // text-zinc-700
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc', // bg-zinc-50
    borderWidth: 1,
    borderColor: '#e2e8f0', // border-zinc-200
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004C29', // text-green-600
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 42,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxActive: {
    backgroundColor: '#004C29',
    borderColor: '#004C29',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  rememberText: {
    fontSize: 13,
    color: '#52525b', // text-zinc-600
  },
  errorBox: {
    backgroundColor: '#fef2f2', // bg-red-50
    borderWidth: 1,
    borderColor: '#fecaca', // border-red-200
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#dc2626', // text-red-600
    fontSize: 12,
    fontWeight: '500',
  },
  loginBtn: {
    backgroundColor: '#004C29', // bg-green-600
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0', // border-zinc-200
  },
  dividerText: {
    color: '#71717a',
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1', // border-zinc-300
    borderRadius: 10,
    paddingVertical: 11,
  },
  googleBtnText: {
    color: '#334155', // text-zinc-700
    fontSize: 14,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  registerPrompt: {
    fontSize: 13,
    color: '#52525b',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#004C29',
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  termsNote: {
    fontSize: 10,
    color: '#a1a1aa',
    lineHeight: 14,
  },
  termsLink: {
    fontSize: 10,
    color: '#004C29',
    fontWeight: '600',
    textDecorationLine: 'underline',
    lineHeight: 14,
  },
});
