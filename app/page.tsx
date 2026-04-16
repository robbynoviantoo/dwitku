import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Users,
  BarChart2,
  Smartphone,
  Zap,
  Star,
  Clock,
  Download,
  Lock,
  Building2,
} from "lucide-react";

const FEATURES = [
  {
    icon: BarChart2,
    title: "Laporan Visual",
    desc: "Lihat pola keuanganmu lewat grafik bulanan dan perbandingan otomatis.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Users,
    title: "Workspace Bersama",
    desc: "Catat keuangan bareng pasangan, keluarga, atau tim. Satu workspace, semua bisa pantau.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "Data Aman",
    desc: "Diencrypt dan dibackup otomatis. Data keuanganmu tidak akan hilang.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Smartphone,
    title: "Mobile-Friendly + PWA",
    desc: "Install di HP seperti aplikasi native. Pull-to-refresh, offline-ready.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Download,
    title: "Export ke Excel",
    desc: "Unduh seluruh data transaksimu ke Excel kapanpun dibutuhkan.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: Zap,
    title: "Cepat & Ringan",
    desc: "Antarmuka yang responsif. Input transaksi dalam hitungan detik.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const PLANS = [
  {
    key: "free",
    name: "Gratis",
    price: "Rp 0",
    period: "selamanya",
    tagline: "Cukup buat coba & kebiasaan awal",
    color: "border-zinc-200",
    badge: null,
    cta: "Mulai Gratis",
    ctaHref: "/register",
    ctaStyle: "bg-white border-2 border-green-600 text-green-700 hover:bg-green-50",
    features: [
      "Maksimal 2 workspace",
      "Maksimal 200 transaksi",
      "1 kategori custom",
      "Kategori default (makan, transport, dll)",
      "Ringkasan keuangan sederhana",
    ],
    locked: ["Export Excel / CSV", "Laporan grafik lanjutan", "Unlimited workspace"],
  },
  {
    key: "basic",
    name: "Basic",
    price: "Rp 25.000",
    period: "/ bulan",
    tagline: "Untuk pengguna yang sudah rutin mencatat",
    color: "border-green-500 shadow-xl shadow-green-100",
    badge: "PALING POPULER",
    cta: "Coba 7 Hari Gratis",
    ctaHref: "/register?plan=basic",
    ctaStyle: "bg-green-600 hover:bg-green-700 text-white",
    features: [
      "Unlimited transaksi",
      "Unlimited kategori",
      "Maksimal 5 workspace",
      "Laporan bulanan (grafik)",
      "Export ke Excel & CSV",
      "Backup cloud otomatis",
      "Reminder pengeluaran",
      "Tag transaksi",
    ],
    locked: ["Multi-device sync real-time", "Budgeting & anggaran", "Attach foto bukti transaksi"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "Rp 49.000",
    period: "/ bulan",
    tagline: "Untuk power user yang niat banget",
    color: "border-green-700 shadow-xl shadow-green-100",
    badge: null,
    cta: "Coba 7 Hari Gratis",
    ctaHref: "/register?plan=pro",
    ctaStyle: "bg-green-800 hover:bg-green-900 text-white",
    features: [
      "Semua fitur Basic",
      "Unlimited workspace",
      "Multi-device sync real-time",
      "Analisis & grafik tren keuangan",
      "Budgeting dengan notifikasi over-budget",
      "Attach foto bukti transaksi",
      "Multi akun (keluarga / pasangan)",
      "Tema premium & customization UI",
    ],
    locked: [],
  },
];

const TESTIMONIALS = [
  {
    name: "Andi Pratama",
    role: "Freelancer",
    avatar: "A",
    color: "bg-green-500",
    text: "Dwitku bikin aku akhirnya konsisten nyatet keuangan. Sebelumnya pakai Excel ribet banget, sekarang 30 detik langsung tercatat.",
    rating: 5,
  },
  {
    name: "Sari & Reza",
    role: "Pasangan Menikah",
    avatar: "S",
    color: "bg-blue-500",
    text: "Fitur workspace bersama sangat membantu kami manage keuangan rumah tangga. Suami & istri bisa lihat semua transaksi real-time.",
    rating: 5,
  },
  {
    name: "Komunitas UKM Batik",
    role: "Pengelola Kas",
    avatar: "K",
    color: "bg-green-800",
    text: "Kami pakai Dwitku untuk kas komunitas. Export Excel-nya membantu banget saat laporan bulanan ke anggota.",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center font-bold text-white text-sm">D</div>
            <span className="font-bold text-lg text-zinc-900 tracking-tight">Dwitku</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Fitur</a>
            <a href="#pricing" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Harga</a>
            <a href="#testimonials" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Testimoni</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Masuk</Link>
            <Link href="/register" className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-6">
            <Zap className="w-3 h-3" />
            Baru: Export Excel & Workspace Bersama
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
            Kelola uangmu{" "}
            <span className="relative">
              <span className="text-green-600">tanpa ribet</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8.5C50 2.5 150 2.5 298 8.5" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Catat pemasukan & pengeluaran, kelola lebih dari satu dompet, dan ajak pasangan atau anggota tim untuk mencatat bersama — semuanya dalam satu platform yang cepat dan ringan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:-translate-y-0.5 text-base">
              Mulai Gratis Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-zinc-200 text-zinc-700 font-semibold rounded-2xl hover:border-zinc-300 hover:bg-zinc-50 transition-all text-base">
              Sudah punya akun? Masuk
            </Link>
          </div>

          <p className="text-sm text-zinc-400 mt-5">
            ✓ Gratis selamanya &nbsp;&nbsp; ✓ Tidak butuh kartu kredit &nbsp;&nbsp; ✓ Bisa upgrade kapanpun
          </p>
        </div>

        {/* App preview mockup */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-white rounded-3xl shadow-2xl shadow-zinc-200 border border-zinc-100 overflow-hidden">
            <div className="h-10 bg-zinc-50 border-b border-zinc-100 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 text-center text-[11px] text-zinc-400">app.dwitku.id</div>
            </div>
            <div className="grid grid-cols-4 min-h-[280px]">
              {/* Sidebar mock */}
              <div className="bg-white border-r border-zinc-100 p-4 col-span-1 hidden sm:block">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-md bg-green-600" />
                  <span className="font-bold text-xs text-zinc-900">DWITKU</span>
                </div>
                {["Ringkasan", "Transaksi", "Kategori", "Laporan"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 py-2 px-2 rounded-lg mb-1 text-xs ${i === 0 ? "bg-green-600 text-white font-medium" : "text-zinc-500"}`}>
                    <div className={`w-3 h-3 rounded ${i === 0 ? "bg-white/30" : "bg-zinc-200"}`} />
                    {item}
                  </div>
                ))}
              </div>
              {/* Content mock */}
              <div className="col-span-4 sm:col-span-3 p-6 bg-zinc-50/50">
                <div className="mb-4">
                  <div className="h-5 w-32 bg-zinc-900 rounded font-bold text-xs flex items-center px-2 text-white">Ringkasan Bulan Ini</div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Pemasukan", val: "Rp 8.500.000", color: "text-green-600" },
                    { label: "Trial", status: "text-emerald-600 bg-emerald-50", val: "Rp 3.200.000", color: "text-red-500" },
                    { label: "Saldo", val: "+ Rp 5.300.000", color: "text-emerald-600" },
                  ].map((c) => (
                    <div key={c.label} className="bg-white rounded-xl p-3 shadow-sm border border-zinc-100">
                      <p className="text-[9px] text-zinc-400 mb-1">{c.label}</p>
                      <p className={`text-xs font-bold ${c.color}`}>{c.val}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-zinc-100">
                  <p className="text-[9px] text-zinc-400 mb-2">Transaksi Terbaru</p>
                  {[
                    { cat: "🍜 Makan Siang", date: "Hari ini", amount: "- Rp 35.000", type: "expense" },
                    { cat: "💼 Gaji Freelance", date: "Kemarin", amount: "+ Rp 2.500.000", type: "income" },
                    { cat: "🚗 Bensin", date: "Kemarin", amount: "- Rp 100.000", type: "expense" },
                  ].map((tx) => (
                    <div key={tx.cat} className="flex items-center justify-between py-1.5 border-b border-zinc-50 last:border-0">
                      <div>
                        <p className="text-[10px] font-medium text-zinc-800">{tx.cat}</p>
                        <p className="text-[9px] text-zinc-400">{tx.date}</p>
                      </div>
                      <span className={`text-[10px] font-bold ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}>{tx.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fitur ── */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-600 font-semibold text-sm mb-2">APA YANG BISA DWITKU LAKUKAN</p>
            <h2 className="text-4xl font-extrabold text-zinc-900 mb-4">Semua yang kamu butuhkan,<br className="hidden sm:block" /> dalam satu aplikasi</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Tidak perlu spreadsheet rumit. Cukup Dwitku.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white border border-zinc-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-4 bg-zinc-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-600 font-semibold text-sm mb-2">HARGA TRANSPARAN</p>
            <h2 className="text-4xl font-extrabold text-zinc-900 mb-4">Mulai gratis, upgrade kapanpun</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">Semua paket berbayar tersedia trial 7 hari gratis. Tidak perlu kartu kredit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div key={plan.key} className={`bg-white rounded-3xl border-2 p-8 flex flex-col relative ${plan.color}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-zinc-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-zinc-500 mb-4">{plan.tagline}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-zinc-900">{plan.price}</span>
                    <span className="text-sm text-zinc-400">{plan.period}</span>
                  </div>
                </div>

                <Link href={plan.ctaHref} className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>

                <div className="space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-600">{f}</span>
                    </div>
                  ))}
                  {plan.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2 opacity-40">
                      <Lock className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-400 line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-600 font-semibold text-sm mb-2">CERITA PENGGUNA</p>
            <h2 className="text-4xl font-extrabold text-zinc-900 mb-4">Dipercaya ribuan pengguna</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold`}>{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm text-zinc-900">{t.name}</p>
                    <p className="text-xs text-zinc-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] -z-10" />
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">Mulai catat keuanganmu hari ini</h2>
          <p className="text-green-100 mb-8 text-lg">Gratis, tanpa kartu kredit. Upgrade kapanpun kamu siap.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-white text-green-700 font-bold rounded-2xl hover:bg-green-50 transition-all shadow-xl text-base">
              Daftar Gratis Sekarang
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 transition-all border border-white/30 text-base">
              Sudah punya akun
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-green-100 text-sm">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Gratis selamanya</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Trial 7 hari</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Data aman</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-zinc-900 text-zinc-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center font-bold text-white text-xs">D</div>
                <span className="font-bold text-white text-lg">Dwitku</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">Aplikasi pencatatan keuangan personal dan tim yang ringan, cepat, dan mudah dipakai.</p>
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-3">Produk</p>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block hover:text-white transition-colors">Fitur</a>
                <a href="#pricing" className="block hover:text-white transition-colors">Harga</a>
                <Link href="/register" className="block hover:text-white transition-colors">Daftar</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-3">Perusahaan</p>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-white transition-colors">Tentang</a>
                <a href="#" className="block hover:text-white transition-colors">Kontak</a>
                <a href="#" className="block hover:text-white transition-colors">Kebijakan Privasi</a>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Dwitku. Hak cipta dilindungi.</p>
            <p className="text-xs text-zinc-600">Dibuat dengan ❤️ di Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
