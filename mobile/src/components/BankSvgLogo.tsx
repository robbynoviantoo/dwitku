import React from 'react';
import { StyleSheet, View, Image, ImageSourcePropType } from 'react-native';
import { Banknote, Wallet as WalletIcon, Building2 } from 'lucide-react-native';

// Map lengkap seluruh file PNG di folder assets/banks/
const BANK_PNG_MAP: Record<string, ImageSourcePropType> = {
  // ── Bank ──
  bca: require('../../assets/banks/bca.png'),
  bri: require('../../assets/banks/bri.png'),
  mandiri: require('../../assets/banks/mandiri.png'),
  bni: require('../../assets/banks/bni.png'),
  bsi: require('../../assets/banks/bank syariah indonesia.png'),
  'bank syariah indonesia': require('../../assets/banks/bank syariah indonesia.png'),
  jago: require('../../assets/banks/jago.png'),
  cimb: require('../../assets/banks/cimb.png'),
  permata: require('../../assets/banks/permata.png'),
  jenius: require('../../assets/banks/jenius.png'),
  btn: require('../../assets/banks/btn.png'),
  danamon: require('../../assets/banks/danamon.png'),
  panin: require('../../assets/banks/panin.png'),
  ocbc: require('../../assets/banks/ocbc.png'),
  anz: require('../../assets/banks/anz.png'),
  bi: require('../../assets/banks/bi.png'),
  bjb: require('../../assets/banks/bjb.png'),
  bukopin: require('../../assets/banks/bukopin.png'),
  'bukopin-1': require('../../assets/banks/bukopin-1.png'),
  citi: require('../../assets/banks/citi.png'),
  digibank: require('../../assets/banks/digibank.png'),
  hsbc: require('../../assets/banks/hsbc.png'),
  maybank: require('../../assets/banks/maybank.png'),
  mega: require('../../assets/banks/mega.png'),
  'standard chartered': require('../../assets/banks/standard chartered.png'),
  uob: require('../../assets/banks/uob.png'),

  // ── E-Wallet Baru Ditambahkan ──
  dana: require('../../assets/banks/dana.png'),
  gopay: require('../../assets/banks/gopay.png'),
  'go-pay': require('../../assets/banks/gopay.png'),
  gojek: require('../../assets/banks/gopay.png'),
  ovo: require('../../assets/banks/ovo.png'),
  shopeepay: require('../../assets/banks/shopeepay.png'),
  shopee: require('../../assets/banks/shopeepay.png'),
  linkaja: require('../../assets/banks/linkaja.png'),
  link: require('../../assets/banks/linkaja.png'),
};

interface BankSvgLogoProps {
  providerCode?: string | null;
  walletName?: string | null;
  walletType?: string | null;
  size?: number;
}

export function BankSvgLogo({
  providerCode,
  walletName,
  walletType,
  size = 38,
}: BankSvgLogoProps) {
  const code = (providerCode || walletName || '').toLowerCase().trim();
  const type = (walletType || '').toUpperCase().trim();

  // Cari key gambar PNG yang cocok
  let matchedKey: string | null = null;
  for (const key of Object.keys(BANK_PNG_MAP)) {
    if (code.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  // Jika ada file PNG di assets/banks, render langsung dengan Image
  if (matchedKey && BANK_PNG_MAP[matchedKey]) {
    return (
      <View style={[styles.box, { width: size, height: size }]}>
        <Image
          source={BANK_PNG_MAP[matchedKey]}
          style={{ width: size, height: size * 0.72 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Uang Tunai / Cash
  if (
    code.includes('cash') ||
    code.includes('tunai') ||
    code.includes('uang') ||
    type === 'CASH'
  ) {
    return (
      <View style={[styles.box, { width: size, height: size, backgroundColor: '#004C29', borderRadius: 8 }]}>
        <Banknote size={size * 0.55} color="#ffffff" />
      </View>
    );
  }

  // E-Wallet Fallback
  if (type === 'EWALLET') {
    return (
      <View style={[styles.box, { width: size, height: size, backgroundColor: '#0284c7', borderRadius: 8 }]}>
        <WalletIcon size={size * 0.52} color="#ffffff" />
      </View>
    );
  }

  // Bank Fallback
  if (type === 'BANK') {
    return (
      <View style={[styles.box, { width: size, height: size, backgroundColor: '#00529c', borderRadius: 8 }]}>
        <Building2 size={size * 0.52} color="#ffffff" />
      </View>
    );
  }

  // Default Fallback
  return (
    <View style={[styles.box, { width: size, height: size, backgroundColor: '#004C29', borderRadius: 8 }]}>
      <WalletIcon size={size * 0.52} color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
