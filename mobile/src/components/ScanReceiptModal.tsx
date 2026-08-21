import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScanReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: (data: ScanResultData) => void;
}

export interface ScanResultData {
  amount: number | null;
  type: 'EXPENSE' | 'INCOME';
  note: string | null;
  merchantName: string | null;
  categoryName: string | null;
  walletName: string | null;
  date: string | null;
  confidence: number;
  matchedCategoryId: string | null;
  matchedCategory: any | null;
  matchedWalletId: string | null;
  matchedWallet: any | null;
  items?: Array<{ name: string; price: number; qty?: number }>;
}

export function ScanReceiptModal({
  visible,
  onClose,
  workspaceId,
  onSuccess,
}: ScanReceiptModalProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  // Store raw base64 WITHOUT the data:... prefix — server will handle it
  const [imageBase64Raw, setImageBase64Raw] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const resetState = () => {
    setImageUri(null);
    setImageBase64Raw(null);
    setIsScanning(false);
    setScanError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Izinkan akses galeri untuk memilih gambar struk.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,   // Lebih kecil = payload lebih kecil
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      // Simpan raw base64 tanpa prefix
      setImageBase64Raw(asset.base64 || null);
      setMimeType(asset.mimeType || 'image/jpeg');
      setScanError(null);
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Izinkan akses kamera untuk memotret struk.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,   // Lebih kecil = payload lebih kecil
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      // Simpan raw base64 tanpa prefix
      setImageBase64Raw(asset.base64 || null);
      setMimeType(asset.mimeType || 'image/jpeg');
      setScanError(null);
    }
  };

  const handleScan = async () => {
    if (!imageBase64Raw) {
      Alert.alert('Pilih Gambar Dulu', 'Ambil foto atau pilih gambar struk dari galeri.');
      return;
    }
    setIsScanning(true);
    setScanError(null);
    try {
      const token = await AsyncStorage.getItem('dwitku_token');
      // Kirim langsung via fetch (bukan apiRequest) agar dapat handle payload besar
      const response = await fetch(
        `${API_BASE_URL}/scan-receipt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            // Kirim dengan prefix agar server tahu format
            imageBase64: `data:${mimeType};base64,${imageBase64Raw}`,
            mimeType,
            workspaceId,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || `Server error ${response.status}`);
      }

      onSuccess(json.data);
      handleClose();
    } catch (err: any) {
      console.error('Scan receipt error:', err);
      setScanError(err?.message || 'Terjadi kesalahan saat scan struk. Coba gambar yang lebih kecil atau jelas.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.sparkle}>✨</Text>
              <View>
                <Text style={styles.title}>Scan Struk AI</Text>
                <Text style={styles.subtitle}>Foto/screenshot → otomatis isi transaksi</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image Preview Area */}
            <View style={styles.imageArea}>
              {imageBase64Raw ? (
                <Image source={{ uri: imageUri! }} style={styles.previewImage} resizeMode="contain" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderIcon}>📸</Text>
                  <Text style={styles.placeholderText}>Belum ada gambar dipilih</Text>
                  <Text style={styles.placeholderSub}>
                    Pilih foto struk belanja, mutasi bank, atau screenshot pembayaran
                  </Text>
                </View>
              )}
            </View>

            {/* Source Buttons */}
            <View style={styles.sourceRow}>
              <TouchableOpacity style={[styles.sourceBtn, styles.sourceBtnCamera]} onPress={pickFromCamera}>
                <Text style={styles.sourceBtnIcon}>📷</Text>
                <Text style={styles.sourceBtnLabel}>Kamera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sourceBtn, styles.sourceBtnGallery]} onPress={pickFromGallery}>
                <Text style={styles.sourceBtnIcon}>🖼️</Text>
                <Text style={styles.sourceBtnLabel}>Galeri</Text>
              </TouchableOpacity>
            </View>

            {/* Tips */}
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 AI Bisa Membaca:</Text>
              {[
                'Struk belanja minimarket (Indomaret, Alfamart)',
                'Nota restoran & kafe',
                'Screenshot mutasi m-banking (BCA, Mandiri, dll)',
                'Bukti transfer e-wallet (GoPay, OVO, ShopeePay)',
              ].map((tip) => (
                <Text key={tip} style={styles.tipItem}>
                  • {tip}
                </Text>
              ))}
            </View>

            {/* Error */}
            {scanError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {scanError}</Text>
              </View>
            )}

            {/* Scan Button */}
            <TouchableOpacity
              style={[styles.scanBtn, (!imageBase64Raw || isScanning) && styles.scanBtnDisabled]}
              onPress={handleScan}
              disabled={!imageBase64Raw || isScanning}
            >
              {isScanning ? (
                <View style={styles.scanBtnContent}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.scanBtnText}>AI sedang membaca struk...</Text>
                </View>
              ) : (
                <Text style={styles.scanBtnText}>
                  {imageBase64Raw ? '✨ Scan & Isi Otomatis' : 'Pilih Gambar Dulu'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sparkle: {
    fontSize: 28,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  closeBtnText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: 'bold',
  },
  imageArea: {
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 14,
  },
  previewImage: {
    width: '100%',
    height: 220,
  },
  imagePlaceholder: {
    alignItems: 'center',
    padding: 24,
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  sourceBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  sourceBtnCamera: {
    backgroundColor: '#0f172a',
  },
  sourceBtnGallery: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sourceBtnIcon: {
    fontSize: 20,
  },
  sourceBtnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  tipBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 14,
    marginBottom: 14,
    gap: 4,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 6,
  },
  tipItem: {
    fontSize: 11.5,
    color: '#15803d',
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
  },
  scanBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  scanBtnDisabled: {
    backgroundColor: '#c4b5fd',
  },
  scanBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
