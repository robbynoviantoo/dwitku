# Dwitku — Collaborative Finance & Sales Tracking SaaS

Dwitku adalah aplikasi SaaS manajemen keuangan kolaboratif dan pencatatan penjualan/HPP produk (*Cost of Goods Sold*), multi-workspace dengan pembagian peran, terintegrasi gateway pembayaran Midtrans, email Resend, notifikasi Web Push, dan pencadangan database PostgreSQL.

---

## 📚 Dokumentasi Lengkap

Dokumentasi arsitektur sistem, tech stack lengkap, skema database, dan panduan langkah demi langkah deployment ke VPS Linux (Ubuntu, Nginx, SSL, PM2) dapat dibaca di:
👉 **[DOKUMENTASI_SISTEM.md](./DOKUMENTASI_SISTEM.md)**

---

## 🛠️ Quick Start (Development Lokal)

### 1. Prasyarat
- Node.js >= 20.x
- PostgreSQL / Neon Serverless Postgres

### 2. Instalasi
```bash
# Clone repository
git clone https://github.com/robbynoviantoo/dwitku.git
cd dwitku

# Install dependencies
npm install

# Setup Environment
cp .env.example .env
# Edit .env sesuai konfigurasi lokal/database Anda
```

### 3. Database Migration & Seed
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🚀 Perintah Berguna
- `npm run dev` — Menjalankan development server Next.js.
- `npm run build` — Kompilasi build produksi.
- `npm run start` — Menjalankan server hasil build produksi.
- `npm run lint` — Pengecekan ESLint code quality.
- `npm run db:migrate` — Menjalankan migrasi skema Prisma.
- `npm run db:seed` — Seeding data paket dan data awal.
- `npm run db:studio` — Membuka GUI Prisma Studio.
