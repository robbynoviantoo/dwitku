"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Search,
  LayoutGrid,
  CreditCard,
  Tag,
  ArrowLeftRight,
  Bot,
  Users,
  BarChart2,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Lightbulb,
  ExternalLink,
  Copy,
  Check,
  ZoomIn,
  X,
  Smartphone,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface TutorialStep {
  id: string;
  stepNumber: number;
  title: { id: string; en: string };
  description: { id: string; en: string };
  tips?: { id: string; en: string };
  imageSrc?: string;
  imageAlt: { id: string; en: string };
  imageCaption?: { id: string; en: string };
  codeSnippets?: string[];
  actionLink?: { href: string; label: { id: string; en: string } };
}

interface GuideCategory {
  id: string;
  name: { id: string; en: string };
  desc: { id: string; en: string };
  icon: any;
  badge?: { id: string; en: string };
  steps: TutorialStep[];
}

export function GuideClient({ userName }: { userName: string }) {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const [activeCategory, setActiveCategory] = useState<string>("workspace");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<{ src: string; caption: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // ── Guide Content Database ────────────────────────────────────────────────
  const categories: GuideCategory[] = useMemo(
    () => [
      {
        id: "workspace",
        name: { id: "1. Workspace & Memulai", en: "1. Workspaces & Getting Started" },
        desc: {
          id: "Membuat dan mengatur ruang kerja pencatatan keuangan pribadi maupun bisnis.",
          en: "Create and configure personal or business financial record workspaces.",
        },
        icon: LayoutGrid,
        badge: { id: "Dasar", en: "Essential" },
        steps: [
          {
            id: "ws-create",
            stepNumber: 1,
            title: { id: "Membuat Workspace Baru", en: "Creating a New Workspace" },
            description: {
              id: "Workspace adalah wadah mandiri untuk memisahkan pembukuan pribadi, keluarga, atau bisnis. Klik tombol '+ Tambah Workspace' pada bilah sidebar atau halaman daftar workspace. Beri nama workspace dan tentukan mata uang default (IDR, USD, EUR, SGD, dll).",
              en: "Workspaces are independent containers to separate personal, family, or business books. Click '+ Add Workspace' on the sidebar or workspaces dashboard. Name your workspace and select its default currency (IDR, USD, EUR, SGD, etc.).",
            },
            tips: {
              id: "Setiap workspace memiliki data dompet dan transaksi yang terisolasi secara mandiri.",
              en: "Each workspace maintains strictly isolated wallets and transaction records.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Tampilan pembuatan workspace", en: "Workspace creation interface" },
            imageCaption: {
              id: "Dialog pembuatan workspace dengan pilihan mata uang dan tipe pembukuan.",
              en: "Workspace creation dialog with currency and bookkeeping type selection.",
            },
            actionLink: {
              href: "/workspaces",
              label: { id: "Buka Menu Workspace", en: "Go to Workspaces" },
            },
          },
          {
            id: "ws-switch",
            stepNumber: 2,
            title: { id: "Beralih Antar Workspace", en: "Switching Between Workspaces" },
            description: {
              id: "Untuk berpindah pembukuan, klik nama workspace yang sedang aktif di sidebar sebelah kiri, lalu pilih workspace lain yang ingin Anda kelola. Seluruh ringkasan transaksi dan dompet akan otomatis berubah mengikuti workspace terpilih.",
              en: "To switch books, click the active workspace name on the left sidebar, then select any workspace you want to view. All transactions and wallet balances will immediately switch.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Menu navigasi workspace", en: "Workspace dropdown navigation" },
            imageCaption: {
              id: "Dropdown pemilihan workspace pada sidebar aplikasi.",
              en: "Workspace selector dropdown located on the application sidebar.",
            },
          },
        ],
      },

      {
        id: "wallets",
        name: { id: "2. Dompet & Rekening", en: "2. Wallets & Accounts" },
        desc: {
          id: "Menambahkan rekening bank, e-wallet, kartu kredit, dan kas tunai fisik.",
          en: "Adding bank accounts, e-wallets, credit cards, and physical cash wallets.",
        },
        icon: CreditCard,
        steps: [
          {
            id: "wallet-add",
            stepNumber: 1,
            title: { id: "Menambahkan Dompet / Rekening Bank", en: "Adding a Wallet / Bank Account" },
            description: {
              id: "Buka menu 'Dompet' pada sidebar, lalu klik tombol '+ Tambah Dompet'. Masukkan nama dompet (cth: 'BCA Utama', 'GoPay Usaha', 'Kas Kecil'), pilih jenis/logo bank, masukkan nama pemilik rekening (holder name), dan isi saldo awal jika ada.",
              en: "Go to 'Wallets' in the sidebar and click '+ Add Wallet'. Enter the wallet name (e.g. 'Main BCA', 'Business GoPay', 'Petty Cash'), pick the bank logo, enter the account holder name, and input the starting balance.",
            },
            tips: {
              id: "Mencantumkan 'Nama Pemilik' sangat membantu ketika berkolaborasi dengan banyak anggota tim agar dompet tidak tertukar.",
              en: "Adding the 'Account Holder Name' is very useful when collaborating in a team so members don't mix up accounts.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Form penambahan dompet", en: "Wallet creation form" },
            imageCaption: {
              id: "Formulir pendaftaran dompet bank / e-wallet beserta saldo awal.",
              en: "Registration form for bank accounts / e-wallets with initial balance.",
            },
            actionLink: {
              href: "/wallets",
              label: { id: "Buka Menu Dompet", en: "Go to Wallets" },
            },
          },
          {
            id: "wallet-default",
            stepNumber: 2,
            title: { id: "Menjadikan Dompet Utama (Default)", en: "Setting a Primary Wallet (Default)" },
            description: {
              id: "Dompet utama akan otomatis terpilih secara default setiap kali Anda membuat transaksi baru atau mengirim pencatatan via Bot Telegram. Anda bisa mengaktifkan opsi 'Jadikan Dompet Utama' saat mengedit dompet.",
              en: "The primary wallet will be automatically selected when creating transactions or logging via the Telegram bot. You can enable 'Set as Primary' in the wallet settings.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Pengaturan dompet utama", en: "Default wallet configuration" },
          },
        ],
      },

      {
        id: "categories",
        name: { id: "3. Kategori & Anggaran", en: "3. Categories & Budget" },
        desc: {
          id: "Mengelompokkan pengeluaran/pemasukan dan membatasi anggaran bulanan.",
          en: "Categorizing expenses/income and setting monthly spending budget limits.",
        },
        icon: Tag,
        steps: [
          {
            id: "cat-setup",
            stepNumber: 1,
            title: { id: "Membuat Kategori Kustom", en: "Creating Custom Categories" },
            description: {
              id: "Buka menu 'Kategori' di sidebar. Dwitku telah menyediakan kategori bawaan (Makanan, Transportasi, Gaji, dll). Anda dapat menambahkan kategori baru, memilih warna tema, memilih ikon visual, dan menentukan tipe (Pemasukan atau Pengeluaran).",
              en: "Open 'Categories' from the sidebar. Dwitku comes with standard categories (Food, Transportation, Salary, etc.). You can add custom categories, choose theme colors, visual icons, and set the type (Income or Expense).",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Daftar kategori dan anggaran", en: "Category and budget list" },
            imageCaption: {
              id: "Manajemen kategori pengeluaran dan alokasi anggaran bulanan.",
              en: "Expense category management and monthly budget allocation.",
            },
            actionLink: {
              href: "/categories",
              label: { id: "Buka Menu Kategori", en: "Go to Categories" },
            },
          },
          {
            id: "cat-budget",
            stepNumber: 2,
            title: { id: "Menetapkan Batas Anggaran (Budget Limit)", en: "Setting a Budget Limit" },
            description: {
              id: "Pada masing-masing kategori pengeluaran, Anda dapat mengisikan nominal target anggaran bulanan (misal: Anggaran Makan Rp 2.000.000 / bulan). Sistem akan menampilkan progress bar berwarna dan memberi peringatan saat pengeluaran mendekati 100%.",
              en: "For each expense category, you can set a monthly target limit (e.g. Food Budget Rp 2,000,000 / month). The system displays a progress bar and alerts you as spending approaches 100%.",
            },
            tips: {
              id: "Fitur ini sangat efektif untuk mencegah boncos dan memantau pengeluaran operasional bisnis secara disiplin.",
              en: "This feature helps maintain financial discipline and prevent budget overruns in business operations.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Progress bar anggaran", en: "Budget limit progress bar" },
          },
        ],
      },

      {
        id: "transactions",
        name: { id: "4. Pencatatan Transaksi & Transfer", en: "4. Transactions & Transfers" },
        desc: {
          id: "Mencatat arus kas masuk, pengeluaran harian, dan transfer saldo antar dompet.",
          en: "Recording income, daily expenses, and inter-wallet balance transfers.",
        },
        icon: ArrowLeftRight,
        steps: [
          {
            id: "tx-record",
            stepNumber: 1,
            title: { id: "Mencatat Pemasukan & Pengeluaran", en: "Recording Income & Expenses" },
            description: {
              id: "Buka menu 'Transaksi' dan klik tombol '+ Tambah Transaksi'. Pilih tipe (Pemasukan / Pengeluaran), masukkan nominal, tanggal transaksi, pilih dompet sumber, pilih kategori, dan tambahkan catatan detail jika diperlukan.",
              en: "Go to 'Transactions' and click '+ Add Transaction'. Choose type (Income / Expense), enter amount, transaction date, select wallet, category, and add notes if needed.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Form input transaksi", en: "Transaction modal form" },
            imageCaption: {
              id: "Formulir pencatatan transaksi cepat dengan filter tanggal dan dompet.",
              en: "Quick transaction recording form with date and wallet filters.",
            },
            actionLink: {
              href: "/transactions",
              label: { id: "Buka Menu Transaksi", en: "Go to Transactions" },
            },
          },
          {
            id: "tx-transfer",
            stepNumber: 2,
            title: { id: "Melakukan Transfer / Tarik Saldo Antar Dompet", en: "Inter-Wallet Fund Transfers" },
            description: {
              id: "Untuk memindahkan dana (seperti tarik tunai dari ATM ke Kas Fisik, atau top-up dari BCA ke GoPay), pilih tab 'Transfer'. Tentukan 'Dompet Asal' (saldo akan berkurang) dan 'Dompet Tujuan' (saldo akan bertambah) tanpa mempengaruhi total omzet/pengeluaran riil.",
              en: "To move funds (e.g. ATM cash withdrawal to Petty Cash, or top-up from BCA to GoPay), choose the 'Transfer' tab. Select 'Source Wallet' and 'Destination Wallet' without affecting income/expense calculations.",
            },
            tips: {
              id: "Transaksi transfer bersifat netral terhadap laporan laba/rugi karena hanya berpindah saldo internal.",
              en: "Transfer transactions are neutral towards profit/loss reports as they represent internal balance movements.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Modal transfer saldo", en: "Fund transfer interface" },
          },
        ],
      },

      {
        id: "telegram",
        name: { id: "5. Integrasi Bot Telegram ⚡", en: "5. Telegram Bot Fast Logging ⚡" },
        desc: {
          id: "Catat transaksi dalam 3 detik hanya dengan mengetik pesan biasa di Telegram.",
          en: "Log transactions in 3 seconds by sending natural chat messages to Telegram.",
        },
        icon: Bot,
        badge: { id: "Super Cepat", en: "Fastest" },
        steps: [
          {
            id: "tg-connect",
            stepNumber: 1,
            title: { id: "Menghubungkan Akun ke Telegram Bot", en: "Linking Your Account to Telegram Bot" },
            description: {
              id: "Buka menu 'Pengaturan (Settings)' > cari kartu 'Integrasi Bot Telegram' > klik tombol 'Hubungkan dengan Telegram'. Anda akan diarahkan ke aplikasi Telegram. Cukup klik tombol 'START' di bot untuk menyelesaikan proses pairing otomatis dalam 1 detik.",
              en: "Open 'Settings' > locate the 'Telegram Bot Integration' card > click 'Connect with Telegram'. You will be redirected to Telegram. Simply press 'START' on the bot to pair your account instantly.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Kartu pairing telegram", en: "Telegram pairing card" },
            imageCaption: {
              id: "Kartu integrasi Telegram pada menu Pengaturan akun Dwitku.",
              en: "Telegram integration card inside Dwitku Account Settings.",
            },
            actionLink: {
              href: "/settings",
              label: { id: "Buka Pengaturan Telegram", en: "Open Telegram Settings" },
            },
          },
          {
            id: "tg-messages",
            stepNumber: 2,
            title: { id: "Format Pesan Pencatatan Natural", en: "Natural Message Formats" },
            description: {
              id: "Setelah terhubung, Anda dapat mencatat transaksi kapan saja hanya dengan mengirim pesan chat seperti contoh di bawah. Bot akan otomatis membalas dengan tombol pilihan Kategori & Dompet secara interaktif!",
              en: "Once connected, log expenses anytime by texting the bot like the examples below. The bot replies with interactive Category & Wallet buttons instantly!",
            },
            codeSnippets: [
              "keluar 50k makan siang nasi padang",
              "lapor pengeluaran 25000 kopi susu",
              "masuk 2.5jt pembayaran invoice freelance",
              "lapor pemasukan 500rb penjualan barang",
              "tarik 50000 (Pindah dana / Tarik tunai)",
              "transfer 100k ke gopay",
            ],
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Chat interaktif bot telegram", en: "Interactive Telegram bot chat" },
            imageCaption: {
              id: "Contoh balasan interaktif bot dengan tombol kategori dan dompet.",
              en: "Example of interactive bot replies with Category & Wallet buttons.",
            },
          },
          {
            id: "tg-commands",
            stepNumber: 3,
            title: { id: "Perintah Cepat Telegram (/saldo, /workspace)", en: "Quick Telegram Commands" },
            description: {
              id: "Gunakan perintah bot untuk memantau keuangan tanpa harus membuka website:",
              en: "Use bot slash commands to check finances on the go without opening the browser:",
            },
            codeSnippets: [
              "/saldo - Cek rincian saldo semua dompet & total kekayaan",
              "/laporan - Cek rekap pemasukan, pengeluaran, dan net cashflow bulan ini",
              "/workspace - Ganti workspace aktif yang sedang dikelola",
              "/bantuan - Panduan lengkap format penulisan pesan",
            ],
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Output perintah saldo telegram", en: "Telegram /saldo command output" },
          },
        ],
      },

      {
        id: "members",
        name: { id: "6. Kolaborasi Tim & Anggota", en: "6. Team Collaboration & Roles" },
        desc: {
          id: "Mengundang rekan bisnis, staf kasir, atau anggota keluarga ke workspace.",
          en: "Invite business partners, cashier staff, or family members to workspace.",
        },
        icon: Users,
        steps: [
          {
            id: "member-invite",
            stepNumber: 1,
            title: { id: "Mengundang Anggota via Email / Tautan", en: "Inviting Members via Email / Link" },
            description: {
              id: "Buka menu 'Anggota' di sidebar > klik '+ Undang Anggota'. Masukkan alamat email anggota yang ingin diundang dan tentukan hak akses peran (*Role*). Anda juga dapat menyalin tautan undangan (*Invite Link*) untuk dibagikan ke WhatsApp / Telegram.",
              en: "Go to 'Members' in the sidebar > click '+ Invite Member'. Enter their email address and assign their role. You can also copy the invite link to share via WhatsApp / Telegram.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Dialog undang anggota tim", en: "Invite member dialog" },
            imageCaption: {
              id: "Formulir undangan anggota tim dengan pengaturan peran dan hak akses.",
              en: "Team invitation form with role and permission settings.",
            },
            actionLink: {
              href: "/settings/members",
              label: { id: "Buka Menu Anggota", en: "Go to Members" },
            },
          },
          {
            id: "member-roles",
            stepNumber: 2,
            title: { id: "Tingkatan Peran (Owner, Editor, Viewer)", en: "Role Permissions (Owner, Editor, Viewer)" },
            description: {
              id: "Dwitku menyediakan 3 tingkatan peran untuk menjaga keamanan pembukuan Anda: 1. Owner: Hak penuh mengelola anggota, tagihan, dan menghapus workspace. 2. Editor: Dapat mencatat, mengedit, dan menghapus transaksi serta dompet. 3. Viewer: Hanya dapat melihat laporan dan grafik tanpa izin mengubah data.",
              en: "Dwitku provides 3 role tiers: 1. Owner: Full access to manage members, billing, and delete workspace. 2. Editor: Can create, edit, and delete transactions and wallets. 3. Viewer: Read-only access to view charts and reports.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Tabel peran anggota tim", en: "Team role table" },
          },
        ],
      },

      {
        id: "reports",
        name: { id: "7. Laporan & Ekspor Data", en: "7. Reports & Data Exports" },
        desc: {
          id: "Analisis grafik arus kas, Deep Insights kecerdasan finansial, dan unduh Excel/PDF.",
          en: "Cash flow charts, Deep Insights analytics, and Excel/PDF data downloads.",
        },
        icon: BarChart2,
        steps: [
          {
            id: "report-view",
            stepNumber: 1,
            title: { id: "Membaca Grafik Arus Kas & Analisis Bulanan", en: "Reading Cash Flow Charts & Analytics" },
            description: {
              id: "Buka menu 'Laporan' di sidebar untuk melihat ringkasan visual: Grafik Pemasukan vs Pengeluaran, Komposisi Kategori Terbesar (Pie Chart), Tren Saldo Bersih, dan Skor Kesehatan Keuangan (*Financial Health Score*).",
              en: "Open 'Reports' in the sidebar to review interactive charts: Income vs Expenses trend, Top Category Breakdown (Pie Chart), Net Cash Flow trend, and Financial Health Score.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Tampilan grafik laporan keuangan", en: "Financial reports and charts" },
            imageCaption: {
              id: "Visualisasi analitik arus kas dan perbandingan tren bulanan.",
              en: "Cash flow analytics visualization and monthly comparative trends.",
            },
            actionLink: {
              href: "/reports",
              label: { id: "Buka Menu Laporan", en: "Go to Reports" },
            },
          },
          {
            id: "report-export",
            stepNumber: 2,
            title: { id: "Mengekspor Laporan ke Excel (.XLSX) & PDF", en: "Exporting Reports to Excel & PDF" },
            description: {
              id: "Klik tombol 'Ekspor Data' di bagian atas halaman Laporan. Anda dapat memilih rentang tanggal khusus, memilih format file (.xlsx untuk Excel akuntansi atau PDF untuk cetak), dan mengunduh seluruh arsip pembukuan dalam hitungan detik.",
              en: "Click 'Export Data' at the top of the Reports page. Choose custom date ranges, select file format (.xlsx for spreadsheet accounting or PDF for printing), and download reports in seconds.",
            },
            tips: {
              id: "Data yang diekspor dapat langsung digunakan untuk keperluan pembukuan akuntan, laporan pajak, atau audit usaha.",
              en: "Exported files are formatted ready for accountant review, tax reporting, or business audits.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Pilihan ekspor file excel pdf", en: "Excel and PDF export dialog" },
          },
        ],
      },

      {
        id: "privacy-mode",
        name: { id: "8. Privasi & Keamanan Saldo 🔒", en: "8. Privacy & Balance Security 🔒" },
        desc: {
          id: "Menyamarkan angka nominal di tempat umum dan proteksi data UU PDP.",
          en: "Obfuscating nominals in public and UU PDP personal data protection.",
        },
        icon: ShieldCheck,
        steps: [
          {
            id: "privacy-toggle",
            stepNumber: 1,
            title: { id: "Mode Sembunyikan Saldo (Privacy Mode)", en: "Hide Balance Mode (Privacy Mode)" },
            description: {
              id: "Jika Anda sedang bekerja di kafe, kantor, atau tempat umum, klik tombol 'Sembunyikan Saldo' di sidebar bawah (atau ikon mata). Seluruh angka nominal rupiah di dashboard, dompet, dan transaksi akan otomatis tersamarkan menjadi '••••••'.",
              en: "When working in cafes, offices, or public spaces, click 'Hide Balance' at the bottom of the sidebar. All nominal amounts on dashboards, wallets, and transactions will blur to '••••••'.",
            },
            imageSrc: "/icon-512.png",
            imageAlt: { id: "Mode sembunyikan saldo aktif", en: "Privacy mode active preview" },
            imageCaption: {
              id: "Tampilan dashboard saat Mode Privasi diaktifkan.",
              en: "Dashboard interface with Privacy Mode enabled.",
            },
          },
        ],
      },
    ],
    [isEn]
  );

  // Filtered categories & steps based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories
      .map((cat) => {
        const catName = (cat.name[locale] || cat.name.id).toLowerCase();
        const catDesc = (cat.desc[locale] || cat.desc.id).toLowerCase();

        const matchingSteps = cat.steps.filter((step) => {
          const title = (step.title[locale] || step.title.id).toLowerCase();
          const desc = (step.description[locale] || step.description.id).toLowerCase();
          const tips = (step.tips?.[locale] || step.tips?.id || "").toLowerCase();
          const code = (step.codeSnippets || []).join(" ").toLowerCase();
          return (
            title.includes(query) ||
            desc.includes(query) ||
            tips.includes(query) ||
            code.includes(query)
          );
        });

        if (catName.includes(query) || catDesc.includes(query) || matchingSteps.length > 0) {
          return {
            ...cat,
            steps: matchingSteps.length > 0 ? matchingSteps : cat.steps,
          };
        }
        return null;
      })
      .filter(Boolean) as GuideCategory[];
  }, [categories, searchQuery, locale]);

  // Current selected category
  const selectedCategory = useMemo(() => {
    return (
      filteredCategories.find((c) => c.id === activeCategory) ||
      filteredCategories[0] ||
      categories[0]
    );
  }, [filteredCategories, activeCategory, categories]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 mx-auto space-y-8 pb-16">
      {/* ── Top Header Hero ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#004C29] via-[#00361d] to-[#012213] text-white p-6 sm:p-10 shadow-lg border border-emerald-800/30">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/15 text-xs font-bold mb-4 backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isEn ? "Dwitku Knowledge Base & User Manual" : "Pusat Panduan & Dokumentasi Resmi Dwitku"}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {isEn ? "User Guide & Tutorial Manual" : "Buku Panduan Penggunaan Sistem"}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-2.5 leading-relaxed max-w-2xl">
            {isEn
              ? `Hello ${userName}, explore step-by-step illustrated guides to master multi-wallet tracking, Telegram bot instant logging, team collaboration, and financial analytics in Dwitku.`
              : `Halo ${userName}, pelajari langkah demi langkah penggunaan fitur Dwitku: mulai dari multi-dompet, integrasi bot Telegram super cepat, kolaborasi tim, hingga ekspor laporan akuntansi.`}
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-xl">
            <Search className="w-4 h-4 text-emerald-300 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isEn
                  ? "Search guides (e.g. 'Telegram bot', 'transfer', 'export excel', 'budget')..."
                  : "Cari panduan (cth: 'bot telegram', 'tarik saldo', 'ekspor excel', 'anggaran')..."
              }
              className="w-full pl-11 pr-10 py-3 bg-white/10 dark:bg-black/30 border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder:text-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative Background Icon */}
        <div className="absolute -right-6 -bottom-10 opacity-10 pointer-events-none text-white">
          <BookOpen className="w-80 h-80" />
        </div>
      </div>

      {/* ── Main Layout: Sidebar & Content Grid ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Navigation: Topics Sidebar (Sticky) */}
        <aside
          style={{ position: "sticky", top: "1.5rem" }}
          className="lg:col-span-4 space-y-2 self-start z-20"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 mb-2">
            {isEn ? "Documentation Modules" : "Daftar Modul Panduan"} ({filteredCategories.length})
          </p>

          <div className="space-y-1.5 bg-white dark:bg-[#161b22] p-2.5 rounded-2xl border border-slate-200 dark:border-[#21262d] shadow-sm max-h-[calc(100vh-5rem)] overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400">
                {isEn ? "No tutorials match your search." : "Tidak ada panduan yang cocok dengan pencarian."}
              </div>
            ) : (
              filteredCategories.map((category) => {
                const IconComponent = category.icon;
                const isSelected = selectedCategory.id === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      window.scrollTo({ top: 320, behavior: "smooth" });
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                      isSelected
                        ? "bg-[#004C29] text-white shadow-sm font-bold"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-green-600"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs truncate">
                          {category.name[locale] || category.name.id}
                        </p>
                        <p
                          className={`text-[10px] truncate ${
                            isSelected ? "text-emerald-100/70" : "text-zinc-400"
                          }`}
                        >
                          {category.steps.length} {isEn ? "steps" : "langkah"}
                        </p>
                      </div>
                    </div>

                    {category.badge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                        }`}
                      >
                        {category.badge[locale] || category.badge.id}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Content: Selected Module Steps & Images */}
        <div className="lg:col-span-8 space-y-6">
          {/* Module Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400">
                  <selectedCategory.icon className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedCategory.name[locale] || selectedCategory.name.id}
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                {selectedCategory.desc[locale] || selectedCategory.desc.id}
              </p>
            </div>

            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0 self-start sm:self-auto">
              {selectedCategory.steps.length} {isEn ? "Tutorial Steps" : "Langkah Tutorial"}
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-6">
            {selectedCategory.steps.map((step, idx) => (
              <div
                key={step.id}
                id={step.id}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] shadow-xs space-y-5 transition-all hover:border-green-500/40"
              >
                {/* Step Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#004C29] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
                      {step.stepNumber}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {step.title[locale] || step.title.id}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        {step.description[locale] || step.description.id}
                      </p>
                    </div>
                  </div>

                  {step.actionLink && (
                    <Link
                      href={step.actionLink.href}
                      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-green-600 hover:text-white text-zinc-700 dark:text-zinc-200 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>{step.actionLink.label[locale] || step.actionLink.label.id}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Code / Command Snippets Box (e.g. Telegram / Shortcuts) */}
                {step.codeSnippets && step.codeSnippets.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 dark:bg-black/50 border border-slate-800 text-xs space-y-2 font-mono">
                    <p className="text-[11px] font-sans font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      <span>{isEn ? "Example Messages / Commands:" : "Contoh Format Pesan / Perintah:"}</span>
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {step.codeSnippets.map((snippet, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
                        >
                          <span className="text-xs select-all text-emerald-300">{snippet}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(snippet.split(" - ")[0].split(" (")[0])}
                            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
                            title="Salin Perintah"
                          >
                            {copiedText === snippet.split(" - ")[0].split(" (")[0] ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips Box */}
                {step.tips && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">{isEn ? "Helpful Tip:" : "Tips Penting:"}</span>
                      <span>{step.tips[locale] || step.tips.id}</span>
                    </div>
                  </div>
                )}

                {/* ── Tutorial Image Box Container ────────────── */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/60 group">
                  <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full flex items-center justify-center p-6 bg-gradient-to-b from-transparent to-slate-200/50 dark:to-black/30">
                    <Image
                      src={step.imageSrc || "/icon-512.png"}
                      alt={step.imageAlt[locale] || step.imageAlt.id}
                      width={480}
                      height={240}
                      className="max-h-48 sm:max-h-56 w-auto object-contain drop-shadow-md group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Zoom Click Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage({
                          src: step.imageSrc || "/icon-512.png",
                          caption:
                            step.imageCaption?.[locale] ||
                            step.imageCaption?.id ||
                            step.title[locale] ||
                            step.title.id,
                        })
                      }
                      className="absolute right-3 top-3 p-2 rounded-xl bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 shadow-md hover:bg-green-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title={isEn ? "Click to view full image" : "Klik untuk memperbesar gambar"}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Caption */}
                  {step.imageCaption && (
                    <div className="p-3 bg-white/80 dark:bg-[#161b22]/80 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between gap-2">
                      <span className="truncate">
                        📸 {step.imageCaption[locale] || step.imageCaption.id}
                      </span>
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-bold shrink-0">
                        {isEn ? "Tutorial Screenshot" : "Gambar Tutorial"}
                      </span>
                    </div>
                  )}
                </div>

                {step.actionLink && (
                  <div className="pt-2 sm:hidden">
                    <Link
                      href={step.actionLink.href}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-green-600 hover:text-white text-zinc-700 dark:text-zinc-200 transition-all shadow-xs"
                    >
                      <span>{step.actionLink.label[locale] || step.actionLink.label.id}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Image Lightbox Modal ──────────────────────────── */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white dark:bg-[#161b22] rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 cursor-default space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {previewImage.caption}
              </p>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[16/9] w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-900 rounded-2xl overflow-hidden p-4">
              <Image
                src={previewImage.src}
                alt="Zoomed Tutorial Preview"
                width={800}
                height={450}
                className="max-h-[65vh] w-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
