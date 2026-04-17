"use client";

import { useState, useTransition } from "react";
import { Mail, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { resendVerificationEmail } from "@/app/actions/auth";

interface EmailVerificationBannerProps {
  userEmail: string;
}

export function EmailVerificationBanner({ userEmail }: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  const handleResend = () => {
    setError(null);
    startTransition(async () => {
      const result = await resendVerificationEmail();
      if (result?.success) {
        setSent(true);
      } else if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div
      className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 px-4 py-3 sm:py-2.5 text-sm"
      style={{
        background: "white",
        borderBottom: "1px solid var(--border-color)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
      }}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
          <Mail className="w-4 h-4 text-amber-600" />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          {sent ? (
            <span className="flex items-center gap-2 text-emerald-700 font-semibold animate-in fade-in slide-in-from-left-2 duration-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Email dikirim ke <span className="underline decoration-emerald-200 underline-offset-2">{userEmail}</span></span>
            </span>
          ) : (
            <div className="text-zinc-600 leading-tight">
              <span className="font-bold text-zinc-900 block sm:inline mr-1">Email belum diverifikasi.</span>
              <span className="text-xs sm:text-sm text-zinc-500">Verifikasi akunmu untuk akses penuh.</span>
              {error && (
                <span className="block text-red-500 text-[10px] font-medium mt-1 uppercase tracking-wider">{error}</span>
              )}
            </div>
          )}
        </div>

        {/* Dismiss (Mobile) */}
        <button
          onClick={() => setDismissed(true)}
          className="sm:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto gap-2">
        {/* Resend button */}
        {!sent && (
          <button
            onClick={handleResend}
            disabled={isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Mengirim..." : "Kirim Verifikasi"}
          </button>
        )}

        {/* Dismiss (Desktop) */}
        <button
          onClick={() => setDismissed(true)}
          className="hidden sm:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
