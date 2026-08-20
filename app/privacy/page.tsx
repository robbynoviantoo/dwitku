"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Globe,
  Mail,
  UserCheck,
  AlertTriangle,
  Languages,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export default function PrivacyPage() {
  const { locale, setLocale } = useLanguage();
  const isEn = locale === "en";

  const lastUpdated = isEn ? "August 20, 2026" : "20 Agustus 2026";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-zinc-800 dark:text-zinc-200 font-sans selection:bg-green-100 selection:text-green-900">
      {/* ── Top Header ────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#21262d] py-3.5 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEn ? "Back to Home" : "Kembali ke Beranda"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#004C29] flex items-center justify-center font-black text-white text-xs">
              D
            </div>
            <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
              Dwitku<span className="text-green-600">.</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLocale(locale === "id" ? "en" : "id")}
              className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg border border-slate-200 dark:border-[#21262d] bg-slate-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={locale === "id" ? "Ganti ke Bahasa Inggris" : "Switch to Indonesian"}
            >
              {locale.toUpperCase()}
            </button>

            <Link
              href="/terms"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors hidden sm:inline-block"
            >
              {isEn ? "Terms of Service" : "Syarat & Ketentuan"}
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              {isEn ? "Sign In" : "Masuk"}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ────────────────────────── */}
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-8">
        {/* Title & Badge */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-200 dark:border-[#21262d] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 text-xs font-bold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>
              {isEn
                ? "Data Privacy Compliance (Indonesia Personal Data Protection Law No. 27/2022)"
                : "Kepatuhan UU Perlindungan Data Pribadi (UU PDP No. 27/2022)"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {isEn ? "Privacy Policy" : "Kebijakan Privasi"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {isEn ? "Last updated: " : "Terakhir diperbarui: "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{lastUpdated}</span>
          </p>
        </div>

        {/* Quick Highlights Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] shadow-xs">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {isEn ? "Encryption & Security" : "Enkripsi & Keamanan"}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {isEn
                ? "Data transmitted via HTTPS/TLS and stored in isolated cloud databases."
                : "Data ditransmisikan via HTTPS/TLS dan tersimpan di basis data cloud terisolasi."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {isEn ? "No Banking Credentials" : "Tanpa Kredensial Bank"}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {isEn
                ? "Dwitku NEVER asks for your bank PIN, m-Banking passwords, OTPs, or CVV codes."
                : "Dwitku TIDAK PERNAH meminta PIN, Password m-Banking, OTP, atau nomor CVV kartu Anda."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] shadow-xs">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {isEn ? "You Own Your Data" : "Hak Milik Anda"}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {isEn
                ? "Full rights to export data to Excel/PDF and delete your account anytime."
                : "Anda berhak penuh mengunduh (ekspor Excel/PDF) dan menghapus data kapan saja."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] shadow-xs">
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {isEn ? "Never Sold to Third Parties" : "Tanpa Penjualan Data"}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {isEn
                ? "We never monetize or sell your financial data to advertisers or third parties."
                : "Kami tidak pernah menjual data keuangan atau profil Anda kepada pihak ketiga."}
            </p>
          </div>
        </div>

        {/* Legal Text Sections */}
        <div className="space-y-10 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-600 text-white flex items-center justify-center text-xs font-black">1</span>
              <span>{isEn ? "Introduction & Privacy Commitment" : "Pendahuluan & Komitmen Privasi"}</span>
            </h2>
            {isEn ? (
              <>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Welcome to <b>Dwitku</b> (&quot;Service&quot;, &quot;Platform&quot;, &quot;We&quot;, &quot;Us&quot;). This Privacy Policy represents our commitment to respecting and protecting the privacy rights of our users (&quot;User&quot;, &quot;You&quot;) in accordance with applicable laws in the Republic of Indonesia, specifically <b>Law No. 27 of 2022 on Personal Data Protection (UU PDP)</b>.
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  By registering, accessing, or using Dwitku, you declare that you have read, understood, and consented to the collection, storage, processing, and use of your data as outlined in this Privacy Policy.
                </p>
              </>
            ) : (
              <>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Selamat datang di <b>Dwitku</b> (&quot;Layanan&quot;, &quot;Platform&quot;, &quot;Kami&quot;). Kebijakan Privasi ini dirancang sebagai bentuk komitmen kami dalam menghormati dan melindungi hak-hak privasi pengguna (&quot;Pengguna&quot;, &quot;Anda&quot;) sesuai dengan peraturan perundang-undangan yang berlaku di Republik Indonesia, khususnya <b>Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP)</b>.
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Dengan mendaftar, mengakses, atau menggunakan platform Dwitku, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui pengumpulan, penyimpanan, pemrosesan, dan penggunaan data Anda sebagaimana diatur dalam Kebijakan Privasi ini.
                </p>
              </>
            )}
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-600 text-white flex items-center justify-center text-xs font-black">2</span>
              <span>{isEn ? "Information We Collect" : "Data yang Kami Kumpulkan"}</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isEn
                ? "We only collect data that is reasonably necessary to provide and operate Dwitku financial recording features:"
                : "Kami hanya mengumpulkan data yang secara wajar diperlukan untuk mengoperasikan fungsi platform pencatatan keuangan Dwitku:"}
            </p>

            <div className="space-y-3 pl-2">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                  {isEn ? "A. Identity & Account Data" : "A. Data Identitas & Akun"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {isEn
                    ? "Full name, email address, profile photo (via Google OAuth or avatar), and securely hashed passwords (bcrypt/argon2)."
                    : "Nama lengkap, alamat email, foto profil (dari Google OAuth atau avatar), dan kata sandi yang telah di-hash secara aman menggunakan algoritma enkripsi satu arah."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                  {isEn ? "B. Financial Records (Manually Inputted by Users)" : "B. Data Pembukuan Keuangan (Diinput Manual)"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {isEn
                    ? "Transaction records of income, expenses, wallet transfers, wallet labels (e.g. 'Main Bank', 'Petty Cash'), specified account holder names, category names, budgets, and text notes."
                    : "Catatan transaksi pemasukan, pengeluaran, transfer saldo antar dompet, nama label dompet (cth: 'BCA Utama', 'Kas Kecil'), nama pemilik rekening yang dicantumkan, nama kategori, anggaran, dan catatan teks."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                  {isEn ? "C. Telegram Bot Integration Data" : "C. Data Integrasi Bot Telegram"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {isEn
                    ? "Telegram Chat ID and Telegram username when connecting your account for bot command authentication (/saldo, reporting expenses)."
                    : "ID Obrolan Telegram (Telegram Chat ID) dan username Telegram Anda saat menghubungkan akun untuk otentikasi perintah bot (seperti /saldo atau lapor pengeluaran)."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                  {isEn ? "D. Subscription & Payment Data" : "D. Data Pembayaran & Langganan"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {isEn
                    ? "Subscription payments are handled directly by a licensed payment gateway (Midtrans) complying with PCI-DSS standards. Dwitku never stores credit card numbers or CVV codes on our servers."
                    : "Transaksi langganan diproses langsung oleh Payment Gateway pihak ketiga berizin (Midtrans) bersertifikasi PCI-DSS. Dwitku tidak pernah menyimpan nomor kartu kredit atau kode CVV pengguna di server kami."}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Zero-Access Guarantee */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-600 text-white flex items-center justify-center text-xs font-black">3</span>
              <span>
                {isEn
                  ? "Absolute Confidentiality: Zero-Access by Platform Operators & Admins"
                  : "Jaminan Kerahasiaan Mutlak: Larangan Akses Admin & Pemilik Platform terhadap Transaksi Pengguna"}
              </span>
            </h2>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-100 text-sm">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {isEn
                    ? "OUR ZERO-SURVEILLANCE PLEDGE:"
                    : "KOMITMEN PERLINDUNGAN PRIVASI FINANSIAL ANDA:"}
                </span>
              </p>
              {isEn ? (
                <>
                  <p>
                    We understand that your financial figures, expenses, and wallet balances are highly sensitive and confidential. Therefore, we establish the following strict principles:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <b>No Snooping / Zero Human Inspection:</b> The owners, operators, and administrators of Dwitku <b>WILL NEVER</b> inspect, read, monitor, or analyze your personal transaction details, wallet balances, or bookkeeping entries.
                    </li>
                    <li>
                      <b>Architectural Separation:</b> The administrative tools in Dwitku are strictly limited to managing system uptime, user account status, and subscription billing. <b>There is no administrative dashboard or feature that displays user transaction sheets to platform operators.</b>
                    </li>
                    <li>
                      <b>Automated System Processing Only:</b> All calculations, balance updates, and report generations are performed programmatically by automated database algorithms without human intervention.
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p>
                    Kami sangat memahami bahwa nominal uang, catatan pengeluaran, dan saldo dompet Anda adalah informasi yang sangat rahasia. Oleh karena itu, kami menetapkan prinsip perlindungan ketat berikut:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <b>Larangan Mengintip (Zero Human Inspection):</b> Pemilik platform, pengembang, maupun staf admin Dwitku <b>TIDAK AKAN PERNAH</b> membaca, memeriksa, memantau, atau menganalisis rincian transaksi, saldo dompet, maupun nama-nama pengeluaran pribadi Anda.
                    </li>
                    <li>
                      <b>Pemisahan Akses Arsitektural:</b> Panel admin Dwitku hanya berfungsi untuk memantau performa server, status langganan, dan pemeliharaan akun. <b>Tidak ada menu atau antarmuka di panel admin yang menampilkan daftar catatan transaksi pengguna.</b>
                    </li>
                    <li>
                      <b>Pemrosesan Otomatis Murni:</b> Seluruh kalkulasi saldo, pembuatan grafik arus kas, dan pengelompokan kategori diproses secara murni oleh sistem algoritma mesin tanpa campur tangan manusia.
                    </li>
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* Section 4 - No Banking Credentials */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-600 text-white flex items-center justify-center text-xs font-black">4</span>
              <span>{isEn ? "Strict Policy: No Banking Credentials Collected" : "Larangan Pengumpulan Kredensial Bank"}</span>
            </h2>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs leading-relaxed space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4" />
                <span>{isEn ? "CRITICAL FOR YOUR SECURITY:" : "PENTING UNTUK KEAMANAN ANDA:"}</span>
              </p>
              <p>
                {isEn
                  ? "Dwitku is a manual bookkeeping platform. We NEVER and WILL NEVER request or store:"
                  : "Dwitku adalah perangkat lunak pembukuan mandiri. Kami TIDAK PERNAH dan TIDAK AKAN PERNAH meminta atau menyimpan:"}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{isEn ? "ATM PINs or Mobile/Internet Banking Passwords." : "PIN ATM atau Password Mobile Banking / Internet Banking."}</li>
                <li>{isEn ? "One-Time Passwords (OTP) from any bank or e-wallet." : "Kode OTP (One-Time Password) dari bank atau e-wallet mana pun."}</li>
                <li>{isEn ? "CVV/CVC security codes on your debit/credit cards." : "Nomor CVV/CVC pada kartu debit/kredit Anda."}</li>
              </ul>
            </div>
          </section>

          {/* Section 5 - Collaborative Workspaces */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-600 text-white flex items-center justify-center text-xs font-black">5</span>
              <span>{isEn ? "Collaborative Workspaces & Team Visibility" : "Workspace Kolaboratif & Pembagian Data Tim"}</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isEn
                ? "Dwitku provides collaborative workspaces where multiple team members can share access (Owner, Editor, Viewer):"
                : "Dwitku menyediakan fitur kolaboratif di mana satu Workspace dapat diakses oleh beberapa pengguna sekaligus (Pemilik/Owner, Editor, Viewer):"}
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-600 dark:text-zinc-400 text-xs">
              <li>
                <b>{isEn ? "Team Data Visibility: " : "Visibilitas Data Tim: "}</b>
                {isEn
                  ? "When joining a shared workspace, transaction records, wallet balances, and reports within that workspace can be viewed or edited by other workspace members according to their assigned roles."
                  : "Jika Anda bergabung ke Workspace bersama, data transaksi, saldo dompet, dan laporan dalam workspace tersebut dapat dilihat dan/atau diedit oleh anggota lain sesuai peran (role) mereka."}
              </li>
              <li>
                <b>{isEn ? "Workspace Owner Responsibility: " : "Tanggung Jawab Pemilik Workspace: "}</b>
                {isEn
                  ? "The Workspace Owner is solely responsible for inviting members, assigning permissions, and removing inactive members."
                  : "Pemilik Workspace bertanggung jawab penuh atas penambahan, pengaturan hak akses, serta penghapusan anggota dari workspace mereka."}
              </li>
            </ul>
          </section>

          {/* Section 6 - User Rights */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-600 text-white flex items-center justify-center text-xs font-black">6</span>
              <span>{isEn ? "User Rights (Personal Data Protection Act)" : "Hak Pengguna atas Data Pribadi (UU PDP)"}</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isEn
                ? "In accordance with the Personal Data Protection Act, you have the following rights:"
                : "Sesuai ketentuan UU PDP Republik Indonesia, Anda memiliki hak-hak berikut:"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-xs">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  {isEn ? "📥 Data Portability (Export)" : "📥 Hak Portabilitas (Ekspor Data)"}
                </span>
                {isEn
                  ? "You can download your entire transaction history anytime in Excel (.xlsx) or PDF format via the Reports menu."
                  : "Anda dapat mengunduh seluruh riwayat transaksi Anda kapan saja dalam format Excel (.xlsx) atau PDF melalui menu Laporan."}
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-xs">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  {isEn ? "✏️ Right to Rectification" : "✏️ Hak Koreksi & Pembaruan"}
                </span>
                {isEn
                  ? "You can edit, update, or correct your profile information and transactions directly inside the app."
                  : "Anda dapat mengubah, mengoreksi, atau memperbarui informasi profil dan catatan transaksi Anda secara langsung di aplikasi."}
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-xs">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  {isEn ? "🗑️ Right to Erasure (Deletion)" : "🗑️ Hak Penghapusan (Right to Erasure)"}
                </span>
                {isEn
                  ? "You can request permanent account deletion along with all associated workspace data via Account Settings or support."
                  : "Anda dapat meminta penghapusan akun beserta seluruh catatan transaksi dan workspace terkait melalui menu Pengaturan atau email dukungan kami."}
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-xs">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                  {isEn ? "🔌 Unlink Integrations" : "🔌 Hak Pemutusan Integrasi"}
                </span>
                {isEn
                  ? "You can disconnect the Telegram bot integration with 1-click in Account Settings anytime."
                  : "Anda dapat memutuskan sambungan bot Telegram kapan saja hanya dengan 1-klik di menu Pengaturan Akun."}
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-green-600 text-white flex items-center justify-center text-xs font-black">6</span>
              <span>{isEn ? "Contact & Data Protection Inquiries" : "Kontak & Saluran Pengaduan Privasi"}</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isEn
                ? "If you have questions, data access requests, or privacy inquiries, please reach out to our team at:"
                : "Jika Anda memiliki pertanyaan, permintaan akses data, atau keluhan terkait privasi, silakan hubungi tim kami melalui:"}
            </p>
            <div className="p-4 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-xs space-y-1.5 font-mono">
              <p>📧 <b>Email:</b> <a href="mailto:support@dwitku.my.id" className="text-green-600 hover:underline">support@dwitku.my.id</a></p>
              <p>🌐 <b>Website:</b> <a href="https://dwitku.my.id" className="text-green-600 hover:underline">https://dwitku.my.id</a></p>
              <p>📍 <b>{isEn ? "Jurisdiction:" : "Wilayah Yurisdiksi:"}</b> Republik Indonesia</p>
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-[#21262d] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} Dwitku. {isEn ? "All Rights Reserved." : "Seluruh Hak Cipta Dilindungi."}</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-green-600 dark:hover:text-green-400 transition-colors font-semibold">
              {isEn ? "Terms of Service" : "Syarat & Ketentuan Layanan"}
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
              {isEn ? "Home" : "Halaman Utama"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
