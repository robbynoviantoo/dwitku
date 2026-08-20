"use client";

import { useState, useTransition } from "react";
import { saveGuideImages } from "@/app/actions/guide";
import {
  BookOpen,
  Save,
  Check,
  ExternalLink,
  Search,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  LayoutGrid,
  CreditCard,
  Tag,
  ArrowLeftRight,
  Bot,
  Users,
  BarChart2,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";

interface StepConfig {
  id: string;
  moduleName: string;
  moduleIcon: any;
  stepNumber: number;
  title: string;
  defaultSrc: string;
  caption: string;
}

const GUIDE_STEPS: StepConfig[] = [
  // 1. Workspace
  {
    id: "ws-create",
    moduleName: "1. Workspace & Memulai",
    moduleIcon: LayoutGrid,
    stepNumber: 1,
    title: "Membuat Workspace Baru",
    defaultSrc: "https://ik.imagekit.io/veezqt/1.png",
    caption: "Dialog pembuatan workspace dengan pilihan mata uang dan tipe pembukuan.",
  },
  {
    id: "ws-switch",
    moduleName: "1. Workspace & Memulai",
    moduleIcon: LayoutGrid,
    stepNumber: 2,
    title: "Beralih Antar Workspace",
    defaultSrc: "https://ik.imagekit.io/veezqt/2.png",
    caption: "Dropdown pemilihan workspace pada sidebar aplikasi.",
  },

  // 2. Wallets
  {
    id: "wallet-add",
    moduleName: "2. Dompet & Rekening",
    moduleIcon: CreditCard,
    stepNumber: 1,
    title: "Menambahkan Dompet / Rekening Bank",
    defaultSrc: "/icon-512.png",
    caption: "Formulir pendaftaran dompet bank / e-wallet beserta saldo awal.",
  },
  {
    id: "wallet-default",
    moduleName: "2. Dompet & Rekening",
    moduleIcon: CreditCard,
    stepNumber: 2,
    title: "Menjadikan Dompet Utama (Default)",
    defaultSrc: "/icon-512.png",
    caption: "Pengaturan dompet utama untuk transaksi standar.",
  },

  // 3. Categories
  {
    id: "cat-setup",
    moduleName: "3. Kategori & Anggaran",
    moduleIcon: Tag,
    stepNumber: 1,
    title: "Membuat Kategori Kustom",
    defaultSrc: "/icon-512.png",
    caption: "Manajemen kategori pengeluaran dan alokasi anggaran bulanan.",
  },
  {
    id: "cat-budget",
    moduleName: "3. Kategori & Anggaran",
    moduleIcon: Tag,
    stepNumber: 2,
    title: "Menetapkan Batas Anggaran (Budget Limit)",
    defaultSrc: "/icon-512.png",
    caption: "Progress bar anggaran dan peringatan overbudget.",
  },

  // 4. Transactions
  {
    id: "tx-record",
    moduleName: "4. Pencatatan Transaksi & Transfer",
    moduleIcon: ArrowLeftRight,
    stepNumber: 1,
    title: "Mencatat Pemasukan & Pengeluaran",
    defaultSrc: "/icon-512.png",
    caption: "Formulir pencatatan transaksi cepat dengan filter tanggal dan dompet.",
  },
  {
    id: "tx-transfer",
    moduleName: "4. Pencatatan Transaksi & Transfer",
    moduleIcon: ArrowLeftRight,
    stepNumber: 2,
    title: "Melakukan Transfer / Tarik Saldo Antar Dompet",
    defaultSrc: "/icon-512.png",
    caption: "Modal pemindahan dana antar dompet internal.",
  },

  // 5. Telegram
  {
    id: "tg-connect",
    moduleName: "5. Integrasi Bot Telegram ⚡",
    moduleIcon: Bot,
    stepNumber: 1,
    title: "Menghubungkan Akun ke Telegram Bot",
    defaultSrc: "/icon-512.png",
    caption: "Kartu integrasi Telegram pada menu Pengaturan akun Dwitku.",
  },
  {
    id: "tg-messages",
    moduleName: "5. Integrasi Bot Telegram ⚡",
    moduleIcon: Bot,
    stepNumber: 2,
    title: "Format Pesan Pencatatan Natural",
    defaultSrc: "/icon-512.png",
    caption: "Contoh balasan interaktif bot dengan tombol kategori dan dompet.",
  },
  {
    id: "tg-commands",
    moduleName: "5. Integrasi Bot Telegram ⚡",
    moduleIcon: Bot,
    stepNumber: 3,
    title: "Perintah Cepat Telegram (/saldo, /workspace)",
    defaultSrc: "/icon-512.png",
    caption: "Output perintah cek saldo semua dompet di Telegram.",
  },

  // 6. Members
  {
    id: "member-invite",
    moduleName: "6. Kolaborasi Tim & Anggota",
    moduleIcon: Users,
    stepNumber: 1,
    title: "Mengundang Anggota via Email / Tautan",
    defaultSrc: "/icon-512.png",
    caption: "Formulir undangan anggota tim dengan pengaturan peran dan hak akses.",
  },
  {
    id: "member-roles",
    moduleName: "6. Kolaborasi Tim & Anggota",
    moduleIcon: Users,
    stepNumber: 2,
    title: "Tingkatan Peran (Owner, Editor, Viewer)",
    defaultSrc: "/icon-512.png",
    caption: "Tabel peran hak akses anggota tim.",
  },

  // 7. Reports
  {
    id: "report-view",
    moduleName: "7. Laporan & Ekspor Data",
    moduleIcon: BarChart2,
    stepNumber: 1,
    title: "Membaca Grafik Arus Kas & Analisis Bulanan",
    defaultSrc: "/icon-512.png",
    caption: "Visualisasi analitik arus kas dan perbandingan tren bulanan.",
  },
  {
    id: "report-export",
    moduleName: "7. Laporan & Ekspor Data",
    moduleIcon: BarChart2,
    stepNumber: 2,
    title: "Mengekspor Laporan ke Excel (.XLSX) & PDF",
    defaultSrc: "/icon-512.png",
    caption: "Pilihan ekspor file spreadsheet akuntansi dan PDF.",
  },

  // 8. Privacy
  {
    id: "privacy-toggle",
    moduleName: "8. Privasi & Keamanan Saldo 🔒",
    moduleIcon: ShieldCheck,
    stepNumber: 1,
    title: "Mode Sembunyikan Saldo (Privacy Mode)",
    defaultSrc: "/icon-512.png",
    caption: "Tampilan dashboard saat Mode Privasi diaktifkan.",
  },
];

export function GuideAdminClient({
  initialImages,
}: {
  initialImages: Record<string, string>;
}) {
  const [images, setImages] = useState<Record<string, string>>(() => {
    const merged: Record<string, string> = {};
    GUIDE_STEPS.forEach((step) => {
      merged[step.id] = initialImages[step.id] || step.defaultSrc;
    });
    return merged;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  const handleUrlChange = (stepId: string, url: string) => {
    setImages((prev) => ({
      ...prev,
      [stepId]: url.trim(),
    }));
  };

  const handleSaveAll = () => {
    startTransition(async () => {
      const res = await saveGuideImages(images);
      if (res.error) {
        Swal.fire("Gagal", res.error, "error");
      } else {
        Swal.fire({
          icon: "success",
          title: "Berhasil Disimpan!",
          text: "Semua tautan gambar panduan telah diperbarui dan langsung aktif di halaman Buku Panduan (/guide).",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filter steps
  const filteredSteps = GUIDE_STEPS.filter((step) => {
    const matchesSearch =
      step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule =
      selectedModule === "ALL" || step.moduleName === selectedModule;

    return matchesSearch && matchesModule;
  });

  const uniqueModules = Array.from(new Set(GUIDE_STEPS.map((s) => s.moduleName)));

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161b22] p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Manajemen Konten Publik</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Kelola Gambar Buku Panduan
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Atur dan perbarui URL gambar screenshot setiap tutorial secara instan dari ImageKit, Cloudinary, atau Cloud Storage lainnya tanpa perlu mengubah kodingan atau mendeploy ulang website.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Filters & Search ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Module Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedModule("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedModule === "ALL"
                ? "bg-[#004C29] text-white shadow-xs"
                : "bg-white dark:bg-[#161b22] text-zinc-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            Semua Modul ({GUIDE_STEPS.length})
          </button>
          {uniqueModules.map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedModule === mod
                  ? "bg-[#004C29] text-white shadow-xs"
                  : "bg-white dark:bg-[#161b22] text-zinc-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              {mod.split(". ")[1] || mod}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari langkah tutorial..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* ── Steps List Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSteps.map((step) => {
          const Icon = step.moduleIcon;
          const currentUrl = images[step.id] || "";

          return (
            <div
              key={step.id}
              className="bg-white dark:bg-[#161b22] p-5 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-green-500/40"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-2 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block truncate">
                        {step.moduleName} • Langkah {step.stepNumber}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                    ID: {step.id}
                  </span>
                </div>

                {/* Input Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    URL Gambar Screenshot:
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={currentUrl}
                      onChange={(e) => handleUrlChange(step.id, e.target.value)}
                      placeholder="https://ik.imagekit.io/... atau /guide/..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    />
                    {currentUrl && (
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-green-600 p-1"
                        title="Buka link di tab baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Thumbnail Live Preview */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center p-2">
                {currentUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUrl}
                    alt={step.title}
                    className="max-h-full w-auto object-contain drop-shadow-sm rounded-lg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/icon-512.png";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 text-xs gap-1">
                    <ImageIcon className="w-6 h-6" />
                    <span>Belum ada gambar diset</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
