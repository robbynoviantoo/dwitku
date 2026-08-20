"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Scale,
  AlertOctagon,
  Languages,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export default function TermsPage() {
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
            <Image
              src="/icon-512.png"
              alt="Dwitku Logo"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg object-contain"
            />
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
              href="/privacy"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors hidden sm:inline-block"
            >
              {isEn ? "Privacy Policy" : "Kebijakan Privasi"}
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              {isEn ? "Register" : "Daftar Akun"}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ────────────────────────── */}
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-8">
        {/* Title & Badge */}
        <div className="mb-10 text-center sm:text-left border-b border-slate-200 dark:border-[#21262d] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-xs font-bold mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>{isEn ? "Legally Binding Agreement" : "Perjanjian Hukum yang Mengikat"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {isEn ? "Terms of Service" : "Syarat & Ketentuan Layanan"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {isEn ? "Last updated: " : "Terakhir diperbarui: "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{lastUpdated}</span>
          </p>
        </div>

        {/* Essential Legal Callout Box */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-3 mb-12 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <span>
              {isEn
                ? "CRITICAL LEGAL SUMMARY & NON-FINANCIAL DISCLAIMER:"
                : "RINGKASAN PENTING & SANGGAHAN HUKUM (DISCLAIMER):"}
            </span>
          </div>
          <p>
            {isEn ? (
              <>
                Dwitku is a <b>manual administrative bookkeeping software (Software-as-a-Service)</b>. Dwitku is <b>NOT</b> a bank, licensed financial institution, payment system operator (PJP), licensed financial advisor, or asset manager.
              </>
            ) : (
              <>
                Dwitku adalah <b>perangkat lunak alat bantu pencatatan administrasi pembukuan mandiri (bookkeeping software)</b>, <b>BUKAN</b> bank, lembaga keuangan berizin, penyedia jasa pembayaran (PJP), penasihat keuangan (financial advisor), atau pengelola investasi.
              </>
            )}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-amber-900/90 dark:text-amber-300/90">
            {isEn ? (
              <>
                <li>Dwitku <b>DOES NOT HOLD</b>, store, or physically transfer real fiat money. All wallet balances in the app are purely mathematical records entered voluntarily by users.</li>
                <li>All financial, tax, business, or investment decisions you make based on Dwitku reports are solely at your own risk and responsibility.</li>
                <li>The service provider is fully indemnified and released from any financial losses, user input discrepancies, internal team disputes, or technical server downtime.</li>
              </>
            ) : (
              <>
                <li>Dwitku <b>TIDAK MENYIMPAN</b>, memegang, atau memindahkan uang fisik/dana riil nasabah. Seluruh saldo di aplikasi adalah angka kalkulasi pembukuan yang diinput oleh pengguna.</li>
                <li>Segala keputusan finansial, perpajakan, audit, atau investasi yang Anda ambil sepenuhnya adalah risiko dan tanggung jawab Anda sendiri.</li>
                <li>Penyedia layanan dibebaskan dari segala tuntutan hukum atau gugatan ganti rugi terkait selisih pencatatan, sengketa antar anggota tim, maupun kegagalan teknis di luar kendali wajar kami.</li>
              </>
            )}
          </ul>
        </div>

        {/* Legal Text Articles */}
        <div className="space-y-10 text-sm leading-relaxed">
          {/* Article 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">1</span>
              <span>{isEn ? "Acceptance of Terms" : "Penerimaan & Keberlakuan Syarat Ketentuan"}</span>
            </h2>
            {isEn ? (
              <>
                <p className="text-zinc-600 dark:text-zinc-400">
                  By creating an account, accessing, or using the Dwitku web application or Telegram bot integration (&quot;Service&quot;), you declare that you are at least 18 years old (or legally competent under applicable laws), and have read, understood, and agreed to be legally bound by all of these Terms of Service.
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  If you do not agree to any part of these Terms, you must immediately cease using the Service and delete your account.
                </p>
              </>
            ) : (
              <>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Dengan membuat akun, mengakses, atau menggunakan aplikasi web maupun integrasi bot Telegram Dwitku (&quot;Layanan&quot;), Anda menyatakan bahwa Anda telah berusia minimal 18 tahun (atau cakap hukum menurut undang-undang yang berlaku), telah membaca, memahami, dan menyetujui untuk terikat secara hukum oleh seluruh Syarat dan Ketentuan ini.
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Jika Anda tidak menyetujui salah satu bagian dari Ketentuan ini, Anda diwajibkan untuk segera menghentikan penggunaan Layanan dan menghapus akun Anda.
                </p>
              </>
            )}
          </section>

          {/* Article 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">2</span>
              <span>{isEn ? "Non-Financial Institution Status Disclaimer" : "Sanggahan Utama: Status Non-Lembaga Keuangan"}</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isEn ? "Users explicitly understand and acknowledge that:" : "Pengguna secara tegas memahami dan mengakui bahwa:"}
            </p>
            <div className="space-y-2.5 pl-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {isEn ? "A. Administrative Tool Only" : "A. Fungsi Perangkat Lunak Administrasi"}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  {isEn
                    ? "Dwitku is strictly a Software-as-a-Service tool to record income/expenses, calculate balances, and visualize cash flows based on numbers inputted voluntarily by users."
                    : "Dwitku hanyalah antarmuka perangkat lunak untuk membantu mencatat arus kas, mengelompokkan kategori, dan menyajikan rekap laporan dari angka-angka yang dimasukkan secara sukarela oleh pengguna."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {isEn ? "B. Not a Banking / Payment Institution" : "B. Bukan Lembaga Perbankan / Bukan PJP"}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  {isEn
                    ? "Dwitku is not a bank, not an e-money issuer, and not a fund transfer operator."
                    : "Dwitku bukan bank, bukan penerbit uang elektronik, dan bukan penyelenggara transfer dana riil."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
                <p className="font-bold text-zinc-900 dark:text-zinc-100">
                  {isEn ? "C. No Financial or Investment Advice" : "C. Bukan Nasihat Keuangan Profesional"}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  {isEn
                    ? "Outputs generated by Dwitku must not be considered professional financial, tax, or legal advice."
                    : "Informasi atau kalkulasi yang dihasilkan oleh Dwitku tidak boleh dianggap sebagai nasihat perpajakan, audit resmi, atau rekomendasi investasi profesional."}
                </p>
              </div>
            </div>
          </section>

          {/* Article 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">3</span>
              <span>{isEn ? "User Responsibility & Platform Zero-Access Guarantee" : "Tanggung Jawab Pengguna & Jaminan Larangan Akses Operator"}</span>
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400 text-xs">
              <li>
                <b>{isEn ? "Zero-Access by Platform Admins: " : "Larangan Akses oleh Admin/Operator: "}</b>
                {isEn
                  ? "Dwitku administrators and developers DO NOT inspect, view, or monitor your private financial transactions, wallet amounts, or budget sheets. System administration is strictly restricted to platform health, user status, and billing management."
                  : "Pengembang dan staf admin Dwitku TIDAK MEMPUNYAI HAK dan TIDAK AKAN PERNAH melihat, membaca, atau memantau transaksi keuangan pribadi, saldo dompet, atau nominal pengeluaran Anda. Fungsi admin murni dibatasi untuk pemeliharaan server dan status langganan akun."}
              </li>
              <li>
                <b>{isEn ? "Data Integrity: " : "Integritas Input Data: "}</b>
                {isEn
                  ? "Report accuracy relies 100% on the accuracy of data entered by you or your team members. We do not verify the physical validity of transactions."
                  : "Keakuratan laporan keuangan di Dwitku 100% bergantung pada kebenaran data nominal, tanggal, dompet, dan kategori yang dimasukkan oleh Anda atau anggota workspace Anda."}
              </li>
              <li>
                <b>{isEn ? "Independent Decisions: " : "Kemandirian Keputusan: "}</b>
                {isEn
                  ? "You are solely responsible for any spending, tax filings, loans, business decisions, or investments made based on Dwitku records."
                  : "Pengguna bertanggung jawab penuh atas segala tindakan, pengeluaran, pembayaran pajak, pinjaman, investasi, atau keputusan bisnis apa pun yang diambil berdasarkan data yang tercatat di Dwitku."}
              </li>
            </ul>
          </section>

          {/* Article 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">4</span>
              <span>{isEn ? "Limitation of Liability & AS-IS Disclaimer" : "Batasan Tanggung Jawab & Klausul 'SEBAGAIMANA ADANYA'"}</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs leading-relaxed space-y-2 text-zinc-700 dark:text-zinc-300">
              <p className="font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                {isEn ? "INDEMNIFICATION & LIABILITY RELEASE:" : "KLAUSUL PEMBEBASAN TANGGUNG JAWAB:"}
              </p>
              <p>
                {isEn
                  ? "Dwitku is provided on an 'AS-IS' and 'AS-AVAILABLE' basis without warranties of any kind, whether express or implied."
                  : "Layanan Dwitku disediakan atas dasar prinsip 'SEBAGAIMANA ADANYA' ('AS-IS') dan 'SEBAGAIMANA TERSEDIA' ('AS-AVAILABLE') tanpa jaminan apa pun."}
              </p>
              <p>
                {isEn
                  ? "To the maximum extent permitted by applicable law, Dwitku developers and affiliates SHALL NOT BE LIABLE for:"
                  : "Sepanjang diizinkan oleh hukum yang berlaku, Pengembang dan Afiliasi Dwitku TIDAK BERTANGGUNG JAWAB atas:"}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{isEn ? "Direct, indirect, incidental, or consequential financial losses, lost profits, tax penalties, or business disruptions." : "Kerugian finansial langsung maupun tidak langsung, kehilangan keuntungan, denda pajak, atau kerugian data."}</li>
                <li>{isEn ? "Errors arising from incorrect inputs, Telegram bot misinterpretations, or wrong wallet selections by users." : "Kesalahan hitung akibat salah input atau kesalahan parsing pesan bot Telegram."}</li>
                <li>{isEn ? "Server outages, maintenance downtime, or cyber-attacks beyond our reasonable control." : "Gangguan teknis, pemadaman server (server downtime), atau serangan siber (force majeure)."}</li>
              </ul>
              <p className="pt-1">
                {isEn
                  ? "In any event, our total aggregate liability for any legal claim shall not exceed the amount you paid to Dwitku in the 1 (one) month preceding the event giving rise to liability."
                  : "Dalam keadaan apa pun, batas total liabilitas maksimum kami kepada Anda untuk setiap klaim hukum tidak akan melebihi jumlah total biaya langganan yang Anda bayarkan kepada Dwitku dalam 1 (satu) bulan terakhir."}
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">5</span>
              <span>{isEn ? "Applicable Law & Dispute Resolution" : "Hukum yang Berlaku & Penyelesaian Sengketa"}</span>
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
              {isEn
                ? "These Terms shall be governed by and construed in accordance with the Laws of the Republic of Indonesia. Any dispute arising out of or in connection with these Terms shall first be settled amicably through mutual discussions within thirty (30) calendar days, failing which the dispute shall be referred to the exclusive jurisdiction of the District Court in the provider's domicile."
                : "Syarat dan Ketentuan ini diatur dan ditafsirkan semata-mata berdasarkan Hukum Negara Republik Indonesia. Segala perselisihan wajib diselesaikan terlebih dahulu melalui musyawarah mufakat dalam jangka waktu 30 hari kalender sebelum dilanjutkan ke Pengadilan Negeri yang berwenang."}
            </p>
          </section>

          {/* Article 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">6</span>
              <span>{isEn ? "Official Contact" : "Kontak Resmi"}</span>
            </h2>
            <div className="p-4 rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-xs space-y-1.5 font-mono">
              <p>📧 <b>Email:</b> <a href="mailto:support@dwitku.my.id" className="text-green-600 hover:underline">support@dwitku.my.id</a></p>
              <p>🌐 <b>Website:</b> <a href="https://dwitku.my.id" className="text-green-600 hover:underline">https://dwitku.my.id</a></p>
              <p>📍 <b>{isEn ? "Country:" : "Negara:"}</b> Republik Indonesia</p>
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-[#21262d] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} Dwitku. {isEn ? "All Rights Reserved." : "Seluruh Hak Cipta Dilindungi."}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-green-600 dark:hover:text-green-400 transition-colors font-semibold">
              {isEn ? "Privacy Policy" : "Kebijakan Privasi"}
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
