"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, Crown, Zap, X, ChevronRight, Loader2 } from "lucide-react";
import { claimFreeTrial } from "@/app/actions/subscription";
import Swal from "sweetalert2";
import gsap from "gsap";

interface FloatingTrialButtonProps {
  canClaimTrial: boolean;
  trialDays?: number;
}

export function FloatingTrialButton({ canClaimTrial, trialDays = 7 }: FloatingTrialButtonProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const floatTimelineRef = useRef<gsap.core.Tween | null>(null);

  // Jangan tampilkan jika user tidak eligible atau di halaman billing
  const shouldRender = canClaimTrial && isVisible && pathname !== "/billing";

  // GSAP Entrance & Floating Animation
  useEffect(() => {
    if (!shouldRender || isMinimized || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Entrance animation (smooth spring)
      gsap.fromTo(
        containerRef.current,
        { y: 50, opacity: 0, scale: 0.88 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.4,
          onComplete: () => {
            // 2. Subtle organic floating / breathing effect
            if (containerRef.current) {
              floatTimelineRef.current = gsap.to(containerRef.current, {
                y: "-=5",
                duration: 2.2,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
              });
            }
          },
        }
      );

      // 3. Periodic Crown Sparkle Rotation
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          rotate: 15,
          scale: 1.15,
          duration: 0.35,
          ease: "power2.out",
          repeat: -1,
          yoyo: true,
          repeatDelay: 3.5,
        });
      }

      // 4. Subtle Shimmer on "GRATIS" Badge
      if (badgeRef.current) {
        gsap.to(badgeRef.current, {
          scale: 1.08,
          duration: 0.25,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          repeatDelay: 3.5,
        });
      }
    });

    return () => ctx.revert();
  }, [shouldRender, isMinimized]);

  if (!shouldRender) {
    return null;
  }

  const handleClaim = async () => {
    // Pause float animation during modal
    floatTimelineRef.current?.pause();

    const confirm = await Swal.fire({
      title: `Mulai Trial Pro ${trialDays} Hari? 🎉`,
      html: `
        <div class="text-left text-xs text-zinc-600 space-y-2 mt-2">
          <p>Aktifkan akses penuh ke seluruh fitur unggulan <strong>Dwitku Pro</strong>:</p>
          <ul class="space-y-1.5 pl-4 list-disc text-zinc-700 font-medium">
            <li>Unlimited Workspace & Dompet Keuangan</li>
            <li>Unlimited Transaksi per bulan</li>
            <li>Ekspor Laporan Lengkap ke Excel & CSV (XLSX)</li>
            <li>Deep Insights & Proyeksi Arus Kas</li>
            <li>Kolaborasi Tim & Multi-User tanpa batas</li>
          </ul>
          <p class="pt-2 text-zinc-400 text-[11px]">✨ 100% Gratis selama ${trialDays} hari tanpa perlu kartu kredit.</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#004C29",
      cancelButtonColor: "#71717a",
      confirmButtonText: `Aktifkan ${trialDays} Hari Gratis 🚀`,
      cancelButtonText: "Nanti Saja",
      customClass: {
        popup: "!rounded-3xl !p-6",
        confirmButton: "!rounded-xl !px-5 !py-2.5 !font-bold !text-xs",
        cancelButton: "!rounded-xl !px-4 !py-2.5 !font-semibold !text-xs",
      },
    });

    if (!confirm.isConfirmed) {
      floatTimelineRef.current?.resume();
      return;
    }

    setLoading(true);
    const res = await claimFreeTrial("pro");
    setLoading(false);

    if (res?.success) {
      await Swal.fire({
        title: "Selamat! Trial Pro Aktif 🎉",
        text: `Masa uji coba Pro ${trialDays} hari kamu telah aktif. Nikmati kemudahan mengelola keuangan tanpa batas!`,
        icon: "success",
        confirmButtonColor: "#004C29",
        confirmButtonText: "Mulai Sekarang",
        customClass: { popup: "!rounded-3xl" },
      });
      window.location.reload();
    } else {
      Swal.fire({
        title: "Gagal Mengaktifkan",
        text: res?.error || "Terjadi kesalahan saat memproses trial.",
        icon: "error",
        confirmButtonColor: "#dc2626",
        customClass: { popup: "!rounded-3xl" },
      });
      floatTimelineRef.current?.resume();
    }
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) {
      setIsMinimized(true);
      return;
    }

    // GSAP Exit animation
    gsap.to(containerRef.current, {
      scale: 0.7,
      opacity: 0,
      y: 20,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => setIsMinimized(true),
    });
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        title={`Buka Penawaran Trial Pro ${trialDays} Hari`}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-linear-to-br from-[#004C29] to-[#002615] text-amber-300 shadow-2xl shadow-green-950/40 border border-amber-400/30 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
      >
        <div className="relative">
          <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </div>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 will-change-transform"
    >
      <div
        onClick={handleClaim}
        className="bg-linear-to-r from-[#004C29] via-[#00381e] to-[#002213] text-white p-3 pl-3.5 pr-2.5 rounded-2xl shadow-2xl shadow-green-950/40 border border-green-500/30 flex items-center gap-3 backdrop-blur-md max-w-sm group ring-1 ring-white/10 hover:border-amber-400/50 hover:shadow-green-900/50 transition-colors cursor-pointer select-none"
      >
        {/* Crown Icon Box */}
        <div
          ref={iconRef}
          className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 relative"
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
        </div>

        {/* Text / CTA Description */}
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              ref={badgeRef}
              className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-400 text-zinc-950 tracking-wider shadow-xs"
            >
              GRATIS
            </span>
            <span className="font-extrabold text-xs text-white tracking-tight group-hover:text-amber-300 transition-colors">
              Trial Pro {trialDays} Hari
            </span>
          </div>
          <p className="text-[11px] text-emerald-100/70 truncate">
            Coba semua fitur premium tanpa kartu kredit
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClaim();
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-[11px] flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-sm group-hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Klaim</span>
              <ChevronRight className="w-3.5 h-3.5 -mr-0.5 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {/* Minimize / Close Button */}
        <button
          type="button"
          onClick={handleMinimize}
          title="Sembunyikan"
          className="p-1 rounded-lg text-emerald-300/50 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
