"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { newVerification } from "@/app/actions/auth";
import Link from "next/link";

import { Suspense } from "react";

function NewVerificationContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError("Token tidak ditemukan!");
            return;
        }

        newVerification(token)
            .then((data) => {
                setSuccess(data.success);
                setError(data.error);
            })
            .catch(() => {
                setError("Terjadi kesalahan sistem!");
            });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="w-full max-w-md bg-white dark:bg-[#161b22] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-[#21262d] text-center">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Verifikasi Email</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Sedang memproses verifikasi email Anda...</p>
            </div>

            <div className="flex items-center justify-center w-full min-h-[120px]">
                {!success && !error && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                        <span className="text-xs text-zinc-400">Mohon tunggu sebentar...</span>
                    </div>
                )}
                
                {success && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-950/60 rounded-2xl flex items-center justify-center border border-green-200 dark:border-green-900/50">
                            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 px-4 py-2 rounded-xl border border-green-200 dark:border-green-900/50">
                            {success}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/60 rounded-2xl flex items-center justify-center border border-red-200 dark:border-red-900/50">
                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50">
                            {error}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
                <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-xs"
                >
                    {success ? "Masuk ke Akun Sekarang →" : "Kembali ke Login"}
                </Link>
            </div>
        </div>
    );
}

export default function NewVerificationPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 text-center">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">Verifikasi Email</h1>
                    <p className="text-sm text-zinc-500 mt-2">Memuat halaman verifikasi...</p>
                </div>
                <div className="flex items-center justify-center w-full min-h-[100px]">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                </div>
            </div>
        }>
            <NewVerificationContent />
        </Suspense>
    );
}
