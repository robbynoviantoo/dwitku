# 📱 Panduan Build Dwitku Mobile (Android APK & iOS)

Aplikasi mobile **Dwitku Mobile** dibuat menggunakan **Expo (React Native)** sehingga dapat langsung dibangun menjadi file **APK/AAB (Android)** dan **IPA/App (iOS)**.

---

## 🚀 1. Persiapan Awal

1. Masuk ke folder `mobile`:
   ```bash
   cd mobile
   ```

2. Install dependencies aplikasi mobile:
   ```bash
   npm install
   ```

3. Ganti IP API di `mobile/src/services/api.ts`:
   - Ganti `http://192.168.1.100:3000/api/mobile` dengan IP laptop/lokal atau domain server backend Dwitku Anda.

---

## 🤖 2. Cara Build Android APK (Stand-alone File APK)

### Cara A: Build APK via Expo EAS Cloud (Paling Mudah, Gratis & Tanpa Perlu Android Studio)

1. Install EAS CLI (sekali saja):
   ```bash
   npm install -g eas-cli
   ```
2. Login ke akun Expo Anda (buat gratis di expo.dev jika belum punya):
   ```bash
   eas login
   ```
3. Jalankan perintah build APK:
   ```bash
   npm run build:android
   ```
4. Setelah selesai, terminal akan memberikan **link download file `.apk`** yang siap dipasang langsung di HP Android Anda atau di-share ke pengguna!

---

## 🍏 3. Cara Build iOS (iPhone / iPad)

### Cara A: Build file `.ipa` via Expo EAS Cloud

1. Jalankan perintah build iOS:
   ```bash
   npm run build:ios
   ```
2. Hasil build `.ipa` / `.app` siap didistribusikan via TestFlight atau Apple App Store.

---

## 📱 4. Menjalankan di Mode Development / Testing Langsung di HP

1. Jalankan server lokal Expo:
   ```bash
   npm start
   ```
2. Download aplikasi **Expo Go** di Play Store (Android) atau App Store (iOS).
3. Scan QR Code yang muncul di terminal menggunakan kamera HP atau app Expo Go.
