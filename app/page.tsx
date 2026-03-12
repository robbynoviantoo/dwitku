import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans p-8">
      <main className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 md:text-6xl lg:text-7xl">
          <span className="text-indigo-600 block mb-2">Dwitku</span>
          Kelola uangmu
          <br className="hidden sm:block" /> tanpa ribet.
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-zinc-600 md:text-xl leading-relaxed">
          Catat penghasilan, pantau pengeluaran, kelola berbagai dompet/workspace dan ajak pacar atau temenmu untuk mencatat patungan bareng-bareng!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
          >
            Mulai Sekarang <ArrowRight size={20} />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white border-2 border-zinc-200 px-8 py-3.5 text-base font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50"
          >
            Masuk
          </Link>
        </div>
      </main>
    </div>
  );
}
