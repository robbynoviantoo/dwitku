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
      className="w-full flex items-center gap-3 px-4 py-3 text-sm"
      style={{
        background: "linear-gradient(90deg, #fffbeb 0%, #fef9c3 100%)",
        borderBottom: "1px solid #fde68a",
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
        <Mail className="w-3.5 h-3.5 text-amber-600" />
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        {sent ? (
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            Email verifikasi dikirim ke <strong>{userEmail}</strong>. Cek inbox kamu!
          </span>
        ) : (
          <span className="text-amber-800">
            Email kamu belum diverifikasi.{" "}
            <span className="font-medium">Beberapa fitur mungkin terbatas sebelum kamu verifikasi.</span>
            {error && (
              <span className="block text-red-600 text-xs mt-0.5">{error}</span>
            )}
          </span>
        )}
      </div>

      {/* Resend button */}
      {!sent && (
        <button
          onClick={handleResend}
          disabled={isPending}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium text-xs transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Mengirim..." : "Kirim Ulang"}
        </button>
      )}

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded-md text-amber-500 hover:text-amber-800 hover:bg-amber-100 transition-colors"
        title="Tutup"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
