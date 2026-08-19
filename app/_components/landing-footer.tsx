"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

export function LandingFooter() {
  const { locale } = useLanguage();

  return (
    <footer className="bg-slate-50 dark:bg-[#0d1117] border-t border-slate-200 dark:border-[#21262d] py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#004C29] flex items-center justify-center font-black text-white text-xs">
            D
          </div>
          <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
            Dwitku<span className="text-green-600">.</span>
          </span>
          <span className="text-xs text-zinc-400 ml-2">
            © {new Date().getFullYear()} Dwitku. {locale === "en" ? "All rights reserved." : "Hak cipta dilindungi."}
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            {locale === "en" ? "Sign In" : "Masuk"}
          </Link>
          <Link href="/register" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            {locale === "en" ? "Register" : "Daftar"}
          </Link>
          <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            {locale === "en" ? "Features" : "Fitur"}
          </a>
          <a href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            {locale === "en" ? "Pricing" : "Harga"}
          </a>
        </div>
      </div>
    </footer>
  );
}
