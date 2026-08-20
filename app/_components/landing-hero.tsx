"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import gsap from "gsap";

export function LandingHero() {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Headline Animation (Blur to Clear + Staggered Slide Up)
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current.children,
          {
            y: 35,
            opacity: 0,
            filter: "blur(8px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.1,
          }
        );
      }

      // 2. Subtitle Animation
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          {
            y: 20,
            opacity: 0,
            filter: "blur(6px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.85,
            ease: "power2.out",
            delay: 0.32,
          }
        );
      }

      // 3. Buttons Animation (Subtle Spring Pop)
      if (buttonsRef.current) {
        gsap.fromTo(
          buttonsRef.current.children,
          {
            y: 18,
            opacity: 0,
            scale: 0.96,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: "back.out(1.2)",
            delay: 0.45,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [locale]);

  return (
    <section
      ref={containerRef}
      className="relative pt-24 sm:pt-28 md:pt-32 pb-4 px-4 overflow-hidden shrink-0"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* ── Main Headline ─────────────────────────────────────────── */}
        <h1
          ref={headlineRef}
          className="text-3xl sm:text-5xl md:text-[62px] font-medium tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1] mb-4 font-sans will-change-transform"
        >
          <span className="inline-block">
            {isEn ? "Your Next Level" : "Kelola Finansial"}
          </span>
          <br />
          <span className="inline-block font-extrabold text-[#004C29] dark:text-emerald-400">
            {isEn ? "Financial Manage Engine" : "Next-Level Bersama Tim"}
          </span>
        </h1>

        {/* ── Subtitle ──────────────────────────────────────────────── */}
        <p
          ref={subtitleRef}
          className="text-xs sm:text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed font-normal will-change-transform"
        >
          {isEn
            ? "Gain complete and confident control over each of your valuable assets with ease."
            : "Pegang kendali penuh dan percaya diri atas seluruh aset, rekening bank, dan pembukuan Anda dengan mudah."}
        </p>

        {/* ── Pill Buttons ──────────────────────────────────────────── */}
        <div
          ref={buttonsRef}
          className="flex items-center justify-center gap-3 max-w-md mx-auto will-change-transform"
        >
          <Link
            href="/register"
            className="px-6 sm:px-7 py-3 sm:py-3.5 bg-[#004C29] hover:bg-[#00381e] text-white text-xs sm:text-sm font-bold rounded-full transition-all shadow-lg shadow-[#004C29]/25 active:scale-95 cursor-pointer border border-emerald-500/20"
          >
            <span>{isEn ? "Get started" : "Mulai sekarang"}</span>
          </Link>

          <Link
            href="/guide"
            className="px-5 sm:px-6 py-3 sm:py-3.5 bg-white/90 dark:bg-zinc-800/90 hover:bg-white text-zinc-800 dark:text-zinc-200 border border-slate-200/90 dark:border-zinc-700 text-xs sm:text-sm font-semibold rounded-full transition-all shadow-xs cursor-pointer"
          >
            <span>{isEn ? "Request Demo" : "Buku Panduan"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
