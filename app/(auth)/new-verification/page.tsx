"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { newVerification } from "@/app/actions/auth";
import Link from "next/link";

export default function NewVerificationPage() {
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
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 text-center">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900">Verifikasi Email</h1>
                <p className="text-sm text-zinc-500 mt-2">Sedang memverifikasi email Anda...</p>
            </div>

            <div className="flex items-center justify-center w-full min-h-[100px]">
                {!success && !error && (
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                )}
                
                {success && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                            {success}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <p className="text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                            {error}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-50">
                <Link 
                    href="/login" 
                    className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                    Kembali ke Login
                </Link>
            </div>
        </div>
    );
}
