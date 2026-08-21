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
import { apiRequest } from '../../services/api';

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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const resetState = () => {
    setImageUri(null);
    setImageBase64(null);
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
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
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
      quality: 0.85,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
      setMimeType(asset.mimeType || 'image/jpeg');
      setScanError(null);
    }
  };

  const handleScan = async () => {
    if (!imageBase64) {
      Alert.alert('Pilih Gambar Dulu', 'Ambil foto atau pilih gambar struk dari galeri.');
      return;
    }
    setIsScanning(true);
    setScanError(null);
    try {
      const result = await apiRequest('/scan-receipt', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64,
          mimeType,
          workspaceId,
        }),
      });

      if (!result.success) {
        throw new Error(result.error || 'Gagal memproses struk');
      }

      onSuccess(result.data);
      handleClose();
    } catch (err: any) {
      setScanError(err?.message || 'Terjadi kesalahan saat scan struk');
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
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
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
              style={[styles.scanBtn, (!imageBase64 || isScanning) && styles.scanBtnDisabled]}
              onPress={handleScan}
              disabled={!imageBase64 || isScanning}
            >
              {isScanning ? (
                <View style={styles.scanBtnContent}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.scanBtnText}>AI sedang membaca struk...</Text>
                </View>
              ) : (
                <Text style={styles.scanBtnText}>
                  {imageBase64 ? '✨ Scan & Isi Otomatis' : 'Pilih Gambar Dulu'}
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
