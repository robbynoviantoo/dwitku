# 🏦 Dwitku — Rencana Implementasi

> Aplikasi pencatatan keuangan kolaboratif. Dibuat dengan Next.js 15, Neon Postgres, Prisma, NextAuth.js v5, Radix UI, Lucide, TanStack Query/Table.

---

## 🧱 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | Neon Serverless Postgres |
| ORM | Prisma 5 |
| Auth | NextAuth.js v5 (Auth.js) |
| UI Components | Radix UI Primitives |
| Icons | Lucide React |
| Data Fetching | TanStack Query v5 |
| Tabel | TanStack Table |
| Styling | Tailwind CSS v4 |
| Form & Validasi | React Hook Form + Zod |
| Email (Invite) | Resend |
| Util | date-fns, clsx, tailwind-merge, class-variance-authority |

---

## 🗺️ Fase Pengerjaan

### ✅ FASE 1 — Setup & Fondasi
- [x] Install semua dependencies
- [ ] Setup file `.env` (isi dengan credentials Neon + Google OAuth)
- [x] Setup Prisma schema (`prisma/schema.prisma`)
- [ ] Koneksi ke Neon database (isi DATABASE_URL di .env)
- [ ] `prisma migrate dev` (butuh DATABASE_URL terisi)
- [ ] Seed data kategori default
- [x] Setup `lib/prisma.ts` (singleton client)
- [x] Setup TanStack Query provider (`components/providers/query-provider.tsx`)
- [x] Setup `lib/utils.ts` (cn, formatCurrency, formatDate, dll.)

### ✅ FASE 2 — Auth System
- [x] Setup `auth.ts` (NextAuth config)
- [x] Google OAuth provider
- [x] Email + Password credentials
- [x] Server actions untuk Login/Register (`app/actions/auth.ts`)
- [x] Halaman `/login` dan `/register`
- [x] `middleware.ts` (proteksi route)
- [ ] Onboarding: buat workspace pertama setelah register (ini masuk ke irisan Fase 3)

### ✅ FASE 3 — Workspace & Invite
- [x] Tabel Workspace (CRUD) — `app/actions/workspace.ts`
- [x] Tabel WorkspaceMember + role (OWNER/EDITOR/VIEWER)
- [x] Onboarding: buat workspace pertama setelah register → `app/onboarding/page.tsx`
- [x] Dashboard layout dengan Sidebar + WorkspaceSwitcher → `app/(dashboard)/layout.tsx`
- [x] Dashboard utama (kartu workspace) → `app/(dashboard)/dashboard/page.tsx`
- [x] API/Action `sendInvite` — kirim invite via server actions → `app/actions/invite.ts`
- [x] Halaman `/invite/[token]` — terima/tolak undangan → `app/invite/[token]/page.tsx`
- [x] Action `acceptInvite` / `declineInvite`
- [x] Halaman Settings → Umum (`app/(dashboard)/settings/page.tsx`)
- [x] Halaman Settings → Members (`app/(dashboard)/settings/members/page.tsx`)

### ✅ FASE 4 — Kategori
- [x] CRUD kategori per workspace → `app/actions/category.ts`
- [x] Emoji picker menggunakan `@emoji-mart/react` → `components/ui/emoji-picker.tsx`
- [x] Warna kategori (preset 12 warna + custom color picker)
- [x] Seed kategori default otomatis saat workspace baru dibuat (auto-dipanggil dari `createWorkspace`)
- [x] Filter All / Pemasukan / Pengeluaran di halaman kategori
- [x] Halaman `/categories` → `app/(dashboard)/categories/page.tsx`

### ✅ FASE 5 — Transaksi
- [x] Form tambah transaksi (INCOME/EXPENSE) → `components/transactions/transaction-form-dialog.tsx`
- [x] List transaksi dengan TanStack Table → `components/transactions/transactions-client.tsx`
- [x] Filter: tipe, kategori, tanggal range, search catatan
- [x] Pagination (server-side, 20 per halaman)
- [x] Edit & hapus transaksi
- [x] Siapa yang menambahkan (createdBy) tampil di tabel
- [x] Summary cards (total pemasukan / pengeluaran / saldo bersih)
- [x] Halaman `/transactions` → `app/(dashboard)/transactions/page.tsx`

### ⬜ FASE 6 — Dashboard & Laporan
- [ ] Ringkasan saldo (total in / out / net)
- [ ] Grafik pengeluaran per kategori
- [ ] Grafik tren bulanan
- [ ] Filter per periode
- [ ] Export ke CSV

---

## 🗄️ Model Database (Prisma)

```
User              → data pengguna + auth
Account           → OAuth accounts (NextAuth)
Session           → sessions (NextAuth)
VerificationToken → email verification (NextAuth)
Workspace         → "buku keuangan" yang bisa dishare
WorkspaceMember   → relasi User ↔ Workspace + role
Invite            → token undangan (PENDING/ACCEPTED/DECLINED/EXPIRED)
Category          → kategori berEmoji (per workspace)
Transaction       → transaksi INCOME/EXPENSE
```

### Enum
```
WorkspaceRole  : OWNER | EDITOR | VIEWER
InviteStatus   : PENDING | ACCEPTED | DECLINED | EXPIRED
TransactionType: INCOME | EXPENSE
```

---

## 📁 Struktur Folder Target

```
dwitku/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← Sidebar + header
│   │   ├── page.tsx                ← Dashboard utama
│   │   ├── transactions/page.tsx
│   │   ├── categories/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── members/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── workspaces/route.ts
│   │   ├── transactions/route.ts
│   │   ├── categories/route.ts
│   │   └── invites/
│   │       ├── route.ts
│   │       └── [token]/route.ts
│   ├── invite/[token]/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                         ← Radix UI wrappers
│   ├── transactions/
│   ├── categories/
│   ├── workspace/
│   └── layout/
├── lib/
│   ├── prisma.ts                   ← Prisma singleton
│   ├── auth.ts                     ← NextAuth config
│   ├── validations/                ← Zod schemas
│   └── utils.ts
├── hooks/                          ← TanStack Query hooks
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── PLANNING.md                     ← File ini
└── .env
```

---

## 🎨 Kategori Default (di-seed otomatis)

### Pengeluaran
| Emoji | Nama |
|-------|------|
| 🍔 | Makanan & Minuman |
| 🚗 | Transportasi |
| 🏠 | Rumah & Utilitas |
| 👗 | Belanja & Pakaian |
| 💊 | Kesehatan |
| 🎮 | Hiburan |
| 📚 | Pendidikan |
| 💼 | Bisnis |
| 🎁 | Hadiah |
| 📱 | Teknologi |
| ✈️ | Perjalanan |
| 🏋️ | Olahraga & Fitness |

### Pemasukan
| Emoji | Nama |
|-------|------|
| 💰 | Gaji |
| 💹 | Investasi |
| 🏧 | Transfer Masuk |
| 🎯 | Bonus |
| 🤝 | Freelance |

---

## 🔐 Alur Auth

```
Buka app → Middleware cek session
  → Tidak ada session → /login
  → Ada session → /dashboard
    → Punya workspace? → tampilkan data
    → Belum? → Onboarding buat workspace
```

## 🤝 Alur Invite

```
Owner → Settings/Members → masukkan email + role
  → API buat Invite record + token unik
  → Kirim email dengan link /invite/[token]
  → Penerima klik → login jika belum
  → API accept → buat WorkspaceMember
  → Redirect ke workspace
```

---

## ⚙️ Environment Variables (.env)

```env
DATABASE_URL=""        # Neon pooled connection string
DIRECT_URL=""          # Neon direct connection (untuk migrate)
NEXTAUTH_SECRET=""     # Random string panjang
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
RESEND_API_KEY=""      # Opsional, untuk email invite
```

---

## 📝 Catatan

- Gunakan **pooled connection** (`DATABASE_URL`) untuk query di aplikasi
- Gunakan **direct connection** (`DIRECT_URL`) hanya untuk `prisma migrate`
- NextAuth v5 masih beta, gunakan `next-auth@beta`
- Prisma adapter untuk NextAuth: `@auth/prisma-adapter`
- TanStack Query disetup di root layout sebagai provider
