import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Globe, Mail } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi — Dwitku",
  description: "Pelajari bagaimana Dwitku melindungi data dan privasi keuangan Anda.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Navbar area */}
      <nav className="bg-white border-b border-zinc-100 py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center font-bold text-white text-xs">D</div>
            <span className="font-bold text-lg text-zinc-900 tracking-tight">Dwitku</span>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-8 text-zinc-700 leading-relaxed">
        <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-zinc-900 mb-4">Kebijakan Privasi</h1>
            <p className="text-zinc-500">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" /> Komitmen Kami
            </h2>
            <p>
              Di Dwitku, kami sangat menghargai privasi Anda. Dwitku dirancang untuk menjadi cara yang aman 
              dan transparan untuk mengelola keuangan Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, 
              menggunakan, dan melindungi informasi Anda.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" /> Informasi yang Kami Kumpulkan
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Informasi Akun:</strong> Nama, alamat email, dan foto profil saat Anda mendaftar via Email atau Google.</li>
              <li><strong>Informasi Keuangan:</strong> Data transaksi, kategori, dan deskripsi yang Anda masukkan secara sukarela ke dalam platform.</li>
              <li><strong>Data Penggunaan:</strong> Informasi tentang bagaimana Anda berinteraksi dengan aplikasi (misalnya fitur yang paling sering digunakan) untuk membantu kami meningkatkan kualitas layanan.</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 my-8">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Keamanan Data adalah Prioritas
            </h3>
            <p className="text-sm text-green-800">
                Data keuangan Anda dienkripsi dan disimpan di server aman. Kami tidak akan pernah menjual data pribadi 
                atau data keuangan Anda kepada pihak ketiga mana pun. Akses ke data transaksi Anda dibatasi 
                hanya untuk Anda (dan anggota workspace yang Anda izinkan secara eksplisit).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" /> Penyimpanan Data
            </h2>
            <p>
              Kami menggunakan infrastruktur cloud tingkat industri untuk memastikan ketersediaan data 24/7. 
              Pencatatan keuangan Anda dibackup secara berkala untuk mencegah kehilangan data akibat kegagalan teknis.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" /> Hubungi Kami
            </h2>
            <p>
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin meminta penghapusan 
              seluruh data akun Anda, silakan hubungi kami melalui email di:
              <br />
              <a href="mailto:support@dwitku.id" className="font-bold text-green-600 hover:underline">support@dwitku.id</a>
            </p>
          </div>
        </section>

        <div className="mt-16 pt-8 border-t border-zinc-200 text-center">
            <p className="text-sm text-zinc-400">© {new Date().getFullYear()} Dwitku. Hak Cipta Dilindungi.</p>
        </div>
      </main>
    </div>
  );
}
