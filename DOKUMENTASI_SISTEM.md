# 📘 DOKUMENTASI LENGKAP SISTEM & PANDUAN DEPLOYMENT VPS — DWITKU

> **Dwitku** adalah aplikasi SaaS manajemen keuangan kolaboratif, pencatatan penjualan & HPP produk (*Cost of Goods Sold*), multi-workspace dengan pembagian peran (*Owner, Editor, Viewer*), terintegrasi gateway pembayaran Midtrans, notifikasi Web Push, email transaksional Resend, serta sistem backup/export database PostgreSQL.

---

## 📑 DAFTAR ISI
1. [Tech Stack & Library](#1-tech-stack--library)
2. [Fitur Utama Sistem](#2-fitur-utama-sistem)
3. [Arsitektur & Struktur Folder](#3-arsitektur--struktur-folder)
4. [Skema Database & Relasi](#4-skema-database--relasi)
5. [Konfigurasi Environment Variables](#5-konfigurasi-environment-variables)
6. [Panduan Lengkap Deployment di VPS Linux (Ubuntu)](#6-panduan-lengkap-deployment-di-vps-linux-ubuntu)
   - [Langkah 1: Persiapan Server VPS & Keamanan](#langkah-1-persiapan-server-vps--keamanan)
   - [Langkah 2: Instalasi Node.js LTS, Git & Build Tools](#langkah-2-instalasi-nodejs-lts-git--build-tools)
   - [Langkah 3: Konfigurasi Database (Neon vs PostgreSQL Lokal)](#langkah-3-konfigurasi-database-neon-vs-postgresql-lokal)
   - [Langkah 4: Clone Repository & Setup Environment](#langkah-4-clone-repository--setup-environment)
   - [Langkah 5: Generate Prisma, Migrasi & Seed Data](#langkah-5-generate-prisma-migrasi--seed-data)
   - [Langkah 6: Build & Menjalankan Aplikasi dengan PM2](#langkah-6-build--menjalankan-aplikasi-dengan-pm2)
   - [Langkah 7: Konfigurasi Reverse Proxy Nginx](#langkah-7-konfigurasi-reverse-proxy-nginx)
   - [Langkah 8: Pasang SSL Gratis (Let's Encrypt / Certbot)](#langkah-8-pasang-ssl-gratis-lets-encrypt--certbot)
7. [Pemeliharaan, Monitoring & Auto Backup](#7-pemeliharaan-monitoring--auto-backup)
8. [Panduan Update Aplikasi (CI/CD / Manual Pull)](#8-panduan-update-aplikasi-cicd--manual-pull)
9. [Troubleshooting Masalah Umum](#9-troubleshooting-masalah-umum)

---

## 1. TECH STACK & LIBRARY

### 🚀 Core Framework & Runtime
- **Runtime**: Node.js v20.x / v22.x LTS
- **Framework**: **Next.js 16.1.6** (App Router Architecture, React Server Components & Server Actions, Turbopack)
- **UI Engine**: **React 19.2.3** & **TypeScript 5.x**

### 🗄️ Database & ORM
- **Database**: **PostgreSQL** (Didesain untuk **Neon Serverless Postgres** dengan fitur *Connection Pooling PgBouncer*, *Branching*, dan *Instant Restore*, serta kompatibel dengan PostgreSQL versi 14/15/16 lokal).
- **ORM**: **Prisma ORM 7.5.0** (`@prisma/client`, `@prisma/adapter-pg`, `@prisma/adapter-neon`).
- **Connection Driver**: `pg` (Node Postgres) dengan adapter pooling.

### 🎨 Styling & UI System
- **CSS Engine**: **Tailwind CSS v4** (Modern utility engine)
- **Accessible Primitives**: **Radix UI** (Dialog, Dropdown Menu, Popover, Select, Tabs, Switch, Alert Dialog, Scroll Area, Tooltip)
- **Icons**: `lucide-react`
- **Animations & Effects**: GSAP, Lenis (Smooth Scroll), SweetAlert2
- **Data Visualization & Charts**: Recharts
- **Theme Support**: `next-themes` (Dark Mode & Light Mode)

### 🔐 Autentikasi & Otorisasi
- **Auth Library**: **Auth.js / NextAuth.js v5 Beta** (`@auth/prisma-adapter`, JWT session strategy)
- **Password Hashing**: `bcryptjs`
- **Role-Based Access**: Workspace Roles (`OWNER`, `EDITOR`, `VIEWER`) & Platform Admin (`isAdmin: true`).

### ⚡ State Management & Data Fetching
- **Client Fetching & Cache**: **TanStack React Query v5** (`@tanstack/react-query`)
- **Table Engine**: **TanStack Table v8** (`@tanstack/react-table`)
- **Form & Validation**: `react-hook-form`, `@hookform/resolvers`, **Zod 4**

### 💳 Integrasi Pihak Ketiga & Komunikasi
- **Telegram Bot API**: Integrasi bot Telegram interaktif untuk pencatatan transaksi cepat (*quick natural language recording*), pilihan kategori dinamis (*inline keyboard*), cek saldo dompet, dan ringkasan kas bulanan.
- **Payment Gateway**: **Midtrans Snap API** (`midtrans-client`) untuk langganan paket Pro & Basic.
- **Email Service**: **Resend API** (`resend`) untuk verifikasi email, reset password, dan undangan workspace.
- **Push Notification**: **Web Push Protocol** (`web-push`, Service Worker) untuk notifikasi real-time ke perangkat user.
- **Excel Export**: SheetJS (`xlsx`) untuk ekspor laporan keuangan dan transaksi.

---

## 2. FITUR UTAMA SISTEM

1. **Multi-Workspace & Role Management**:
   - Satu akun pengguna dapat membuat atau bergabung ke banyak workspace (Personal vs Tim).
   - Tipe workspace: **Keuangan (FINANCE)** & **Penjualan (SALES)**.
   - Hak akses berjenjang: *Owner* (kontrol penuh), *Editor* (tambah/ubah transaksi), *Viewer* (hanya melihat).
   - Sistem undangan member via email berbatas waktu dengan token unik.

2. **Pencatatan Keuangan (Dompet & Transaksi)**:
   - Manajemen multi-dompet: Rekening Bank (BCA, Mandiri, BRI, BNI, BSI, Jago, SeaBank), E-Wallet (GoPay, OVO, DANA, ShopeePay), Cash, dll.
   - Fitur **Drag & Drop Reordering**: Mengatur urutan prioritas dompet secara visual.
   - Perekaman transaksi: Pemasukan (*Income*), Pengeluaran (*Expense*), dan Pindah Saldo (*Transfer Antar Dompet*).
   - Kustomisasi kategori transaksi dengan ikon emoji dan warna.

3. **Integrasi Telegram Bot Interaktif**:
   - Pencatatan transaksi kilat via chat Telegram (cth: `lapor pengeluaran 15000 beli kopi` atau `keluar 50k`).
   - Bot otomatis membalas dengan **Inline Keyboard Kategori**, dan setelah tombol dipilih, transaksi langsung tercatat ke database dengan saldo terbaru.
   - Perintah cepat: `/saldo` (rincian saldo semua dompet) dan `/laporan` (rekap kas bulan berjalan).
   - Panel Super Admin (`/admin/telegram`) untuk manajemen token, status online bot, dan 1-klik pendaftaran Webhook.

4. **Modul Penjualan & Perhitungan HPP (Sales & Cost of Goods Sold)**:
   - Pencatatan master produk, konfigurasi paket kuantiti, dan harga modal (HPP).
   - Transaksi penjualan harian, rekap laba kotor (*Gross Profit*), beban operasional (*Sale Expense*), hingga laba bersih (*Net Profit*).

5. **Laporan & Analitik Keuangan**:
   - Ringkasan statistik bulanan/tahunan dengan visualisasi grafik interaktif.
   - Ekspor transaksi dan laporan ke file format Microsoft Excel (`.xlsx`).

6. **Sistem Langganan SaaS (Subscription & Midtrans)**:
   - Skema paket: **Free**, **Basic**, dan **Pro** (pembatasan kuota workspace, transaksi/bulan, dan fitur ekspor).
   - Pembayaran otomatis melalui Midtrans Snap Popup & Webhook IPN (Instant Payment Notification).

7. **Super Admin Console**:
   - Dashboard analitik MRR (*Monthly Recurring Revenue*), total pengguna, dan status langganan.
   - Manajemen paket harga dan hak akses pengguna.
   - **Fitur Ekspor & Cadangkan Database**: Unduh instan snapshot seluruh data database dalam format **JSON** atau **SQL Dump (`.sql`)**.
   - **Manajemen Telegram Bot**: Pengaturan token, webhook register/delete, dan monitoring user terhubung.

---

## 3. ARSITEKTUR & STRUKTUR FOLDER

```
dwitku/
├── app/
│   ├── (auth)/                 # Rute Autentikasi (Login, Register, Forgot Password, Reset)
│   ├── (dashboard)/            # Rute Aplikasi Dashboard
│   │   ├── dashboard/          # Ringkasan Hero, Kalender & Transaksi Terkini
│   │   ├── transactions/       # Manajemen & Tabel Transaksi Lengkap
│   │   ├── wallets/            # Manajemen Dompet & Rekening
│   │   ├── categories/         # Kategori Pemasukan/Pengeluaran
│   │   ├── sales/              # Modul Penjualan & Produk HPP
│   │   ├── reports/            # Laporan Keuangan & Grafik
│   │   ├── billing/            # Halaman Langganan & Riwayat Pembayaran
│   │   └── settings/           # Pengaturan Workspace & Anggota Tim
│   ├── admin/                  # Super Admin Console (Users, Plans, Database Backup)
│   ├── api/                    # Route Handlers API (Auth, Webhook Midtrans, Web Push, Export DB)
│   └── actions/                # Server Actions (Mutasi Data Terproteksi)
├── components/                 # Komponen Reusable UI (Modals, Buttons, Inputs, Tables)
├── generated/prisma/           # Output Hasil Generate Prisma Client
├── lib/                        # Helper, Validasi Zod, Service Resend, Midtrans, Prisma Client
├── prisma/
│   ├── schema.prisma           # Definisi Database Schema PostgreSQL
│   └── seed.ts                 # Seeder Paket Langganan & Data Awal
├── public/                     # Asset Statis, PWA Manifest, Service Worker
├── .env.example                # Contoh Konfigurasi Environment Variables
├── ecosystem.config.js         # Konfigurasi Production Process Manager (PM2)
├── next.config.ts              # Konfigurasi Next.js
└── package.json                # Dependensi Project
```

---

## 4. SKEMA DATABASE & RELASI

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ Session : has
    User ||--o{ WorkspaceMember : belongs_to
    User ||--o{ Transaction : creates
    User ||--o{ Wallet : creates
    User ||--o{ Sale : creates
    User ||--o| Subscription : subscribes
    
    Workspace ||--o{ WorkspaceMember : contains
    Workspace ||--o{ Wallet : has
    Workspace ||--o{ Category : has
    Workspace ||--o{ Transaction : contains
    Workspace ||--o{ Product : has
    Workspace ||--o{ Sale : records
    Workspace ||--o{ SaleExpense : records
    Workspace ||--o{ Invite : issues

    Plan ||--o{ Subscription : defines
    Subscription ||--o{ Payment : generates
```

---

## 5. KONFIGURASI ENVIRONMENT VARIABLES

Buat file `.env` di direktori root aplikasi:

```env
# ── 1. KONEKSI DATABASE POSTGRESQL ──────────────────────────────────────────
# Jika menggunakan Neon Postgres (Gunakan sslmode=verify-full):
DATABASE_URL="postgresql://username:password@ep-pooler.ap-southeast-1.aws.neon.tech/dwitku?sslmode=verify-full"
DIRECT_URL="postgresql://username:password@ep.ap-southeast-1.aws.neon.tech/dwitku?sslmode=verify-full"

# Jika menggunakan PostgreSQL Lokal pada VPS:
# DATABASE_URL="postgresql://dwitku_user:StrongPassword123@localhost:5432/dwitku_db?schema=public"

# ── 2. AUTENTIKASI (NextAuth v5) ─────────────────────────────────────────────
# Buat secret acak dengan perintah: openssl rand -base64 33
AUTH_SECRET="f38a9d82e1c94b21b71239840192830192830129"
AUTH_TRUST_HOST="true"
NEXTAUTH_URL="https://dwitku.com"
NEXT_PUBLIC_APP_URL="https://dwitku.com"

# ── 3. EMAIL SERVICE (Resend API) ────────────────────────────────────────────
RESEND_API_KEY="re_123456789abcdef"
EMAIL_FROM="Dwitku <no-reply@dwitku.com>"

# ── 4. PAYMENT GATEWAY (Midtrans Snap) ───────────────────────────────────────
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxxxxxx"
MIDTRANS_SERVER_KEY="Mid-server-xxxxxxxxxxxx"
MIDTRANS_IS_PRODUCTION="true" # Set false jika masih testing di Sandbox

# ── 5. NOTIFIKASI WEB PUSH (VAPID Keys) ──────────────────────────────────────
# Generate dengan perintah: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BKxxxxx..."
VAPID_PRIVATE_KEY="xxxxxx..."
VAPID_SUBJECT="mailto:support@dwitku.com"
```

---

## 6. PANDUAN LENGKAP DEPLOYMENT DI VPS LINUX (UBUNTU)

Panduan ini ditujukan untuk VPS bersistem operasi **Ubuntu 22.04 LTS / 24.04 LTS**.

### Langkah 1: Persiapan Server VPS & Keamanan
1. **Login ke VPS melalui SSH**:
   ```bash
   ssh root@IP_SERVER_ANDA
   ```
2. **Update Paket Sistem**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl git ufw build-essential
   ```
3. **Konfigurasi Swap Memory (Sangat Dianjurkan untuk VPS RAM 1GB - 2GB)**:
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```
4. **Aktifkan Firewall UFW**:
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

---

### Langkah 2: Instalasi Node.js LTS, Git & Build Tools
Gunakan **NodeSource** untuk menginstal Node.js versi 20 LTS:

```bash
# Tambahkan repo NodeSource Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js & NPM
sudo apt install -y nodejs

# Verifikasi versi (Pastikan Node >= v20.x.x)
node -v
npm -v

# Install PM2 Process Manager secara global
sudo npm install -g pm2
```

---

### Langkah 3: Konfigurasi Database (Neon vs PostgreSQL Lokal)

#### **Pilihan A: Menggunakan Neon Serverless Postgres (Direkomendasikan)**
- Anda **tidak perlu menginstal PostgreSQL di server VPS**, sehingga RAM VPS tetap hemat dan performa database auto-scaling.
- Salin string koneksi dari [Neon Console](https://console.neon.tech) ke variabel `DATABASE_URL` pada file `.env`.

#### **Pilihan B: Menggunakan PostgreSQL Lokal di VPS (Jika tidak pakai Neon)**
```bash
# Install PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Buat Database dan User
sudo -u postgres psql
```
Di dalam prompt PostgreSQL:
```sql
CREATE DATABASE dwitku_db;
CREATE USER dwitku_user WITH ENCRYPTED PASSWORD 'PasswordKuatAnda123';
GRANT ALL PRIVILEGES ON DATABASE dwitku_db TO dwitku_user;
ALTER DATABASE dwitku_db OWNER TO dwitku_user;
\q
```

---

### Langkah 4: Clone Repository & Setup Environment

1. **Siapkan Direktori Aplikasi**:
   ```bash
   mkdir -p /var/www
   cd /var/www
   git clone https://github.com/robbynoviantoo/dwitku.git
   cd dwitku
   ```

2. **Install Dependensi Project**:
   ```bash
   npm install
   ```

3. **Buat & Konfigurasi File `.env`**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Isi seluruh variabel sesuai data domain, database, Midtrans, Resend, dan Auth Secret Anda. Tekan `Ctrl + O` -> `Enter` -> `Ctrl + X` untuk menyimpan.*

---

### Langkah 5: Generate Prisma, Migrasi & Seed Data

Jalankan perintah generate dan migrasi schema database ke PostgreSQL:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Deploy schema ke database produksi
npx prisma migrate deploy
# atau jika fresh install: npx prisma db push

# 3. Seed data paket (Free, Basic, Pro) & konfigurasi awal
npm run db:seed
```

---

### Langkah 6: Build & Menjalankan Aplikasi dengan PM2

1. **Jalankan Proses Production Build**:
   ```bash
   npm run build
   ```

2. **Start Aplikasi Menggunakan PM2**:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Simpan Konfigurasi PM2 agar Otomatis Berjalan saat Server Restart**:
   ```bash
   pm2 save
   pm2 startup
   ```
   *(Jalankan perintah output yang diberikan oleh `pm2 startup` di terminal)*.

4. **Periksa Status Proses**:
   ```bash
   pm2 status
   pm2 logs dwitku-app
   ```

---

### Langkah 7: Konfigurasi Reverse Proxy Nginx

1. **Install Nginx**:
   ```bash
   sudo apt install -y nginx
   ```

2. **Buat File Konfigurasi Virtual Host Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/dwitku.conf
   ```

3. **Paste Konfigurasi Berikut** *(Ganti `dwitku.com` dengan domain Anda)*:
   ```nginx
   server {
       listen 80;
       server_name dwitku.com www.dwitku.com;

       # Mengatur batas upload maksimum (untuk ekspor/impor file)
       client_max_body_size 50M;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           proxy_read_timeout 300s;
           proxy_connect_timeout 75s;
       }
   }
   ```

4. **Aktifkan Konfigurasi & Uji Syntax Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/dwitku.conf /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

### Langkah 8: Pasang SSL Gratis (Let's Encrypt / Certbot)

Pastikan DNS domain Anda (A Record) sudah mengarah ke IP VPS Anda, kemudian jalankan:

```bash
# Install Certbot dan plugin Nginx
sudo apt install -y certbot python3-certbot-nginx

# Dapatkan sertifikat SSL otomatis
sudo certbot --nginx -d dwitku.com -d www.dwitku.com
```
*Pilih opsi redirect HTTP ke HTTPS secara otomatis.*

Sertifikat SSL akan diperbarui secara otomatis setiap 90 hari oleh service `certbot.timer`.

---

## 7. PEMELIHARAAN, MONITORING & AUTO BACKUP

### Memantau Log Aplikasi Secara Realtime:
```bash
pm2 logs dwitku-app --lines 100
```

### Memantau Penggunaan CPU & RAM:
```bash
pm2 monit
```

### Ekspor & Backup Database Berkala:
1. **Lewat Admin Panel**: Akses menu `/admin` pada browser, lalu klik **"Export Database"** untuk mengunduh snapshot data JSON / SQL kapan saja.
2. **Lewat Cron Job Otomatis (Jika Menggunakan DB Lokal)**:
   ```bash
   crontab -e
   ```
   Tambahkan baris berikut untuk backup harian setiap jam 02:00 pagi:
   ```cron
   0 2 * * * pg_dump -U dwitku_user dwitku_db > /var/backups/dwitku_$(date +\%F).sql
   ```

---

## 8. PANDUAN UPDATE APLIKASI (CI/CD / MANUAL PULL)

Ketika Anda melakukan update code dan `git push` ke GitHub:

```bash
cd /var/www/dwitku

# 1. Ambil update code terbaru
git pull origin main

# 2. Install dependensi baru (jika ada)
npm install

# 3. Jalankan migrasi Prisma (jika ada perubahan skema)
npx prisma migrate deploy
npm run db:generate

# 4. Build ulang Next.js
npm run build

# 5. Reload aplikasi tanpa downtime (Zero-Downtime Reload)
pm2 reload dwitku-app
```

---

## 9. TROUBLESHOOTING MASALAH UMUM

| Gejala Masalah | Penyebab Umum | Solusi |
| :--- | :--- | :--- |
| **502 Bad Gateway Nginx** | Aplikasi Next.js belum running di port 3000 / crash saat build. | Cek status dengan `pm2 status` dan periksa error di `pm2 logs dwitku-app`. Jalankan ulang dengan `pm2 restart dwitku-app`. |
| **P2025 / Prisma Connection Error** | String koneksi `DATABASE_URL` salah atau firewall database menutup port 5432. | Pastikan `DATABASE_URL` di file `.env` sudah benar dan jika pakai Neon sertakan `sslmode=verify-full`. |
| **Midtrans Webhook Gagal / Pending** | Domain webhook belum diatur di dashboard Midtrans. | Buka Dashboard Midtrans -> Settings -> Configuration -> Masukkan `https://domainanda.com/api/payment/webhook` sebagai Payment Notification URL. |
| **Build Gagal Karena Kehabisan Memori (OOM)** | RAM VPS kurang saat kompilasi Next.js. | Pastikan Swap Memory 2GB sudah aktif (lihat Langkah 1 point 3) sebelum menjalankan `npm run build`. |
| **Email Verifikasi Tidak Terkirim** | API Key Resend salah atau domain belum terverifikasi di Resend. | Verifikasi DNS domain Anda di Dashboard [Resend.com](https://resend.com/domains) dan periksa `RESEND_API_KEY` di `.env`. |

---

*Dokumentasi ini dibuat untuk mempermudah pemeliharaan jangka panjang, onboarding developer, dan instalasi mandiri di berbagai lingkungan server Linux.*
