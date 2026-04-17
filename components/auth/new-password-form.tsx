"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { NewPasswordSchema } from "@/lib/validations/auth";
import { useState, useTransition } from "react";
import { resetPassword } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";

export function NewPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            resetPassword(values, token)
                .then((data) => {
                    if (data?.error) setError(data.error);
                    if (data?.success) setSuccess(data.success);
                });
        });
    };

    if (success) {
        return (
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 text-center mb-2">Password Diperbarui!</h1>
                <p className="text-sm text-zinc-500 mb-8">
                    Password Anda telah berhasil diubah. Silakan masuk kembali dengan password baru Anda.
                </p>
                <Link 
                    href="/login" 
                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors text-center"
                >
                    Kembali ke Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-zinc-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900">Atur Ulang Password</h1>
                <p className="text-sm text-zinc-500 mt-2">
                    Masukkan password baru Anda di bawah ini.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Password Baru</label>
                    <input
                        {...form.register("password")}
                        disabled={isPending}
                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                        placeholder="••••••••"
                        type="password"
                    />
                    {form.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <button
                    disabled={isPending || !token}
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Password"}
                </button>
            </form>

            {!token && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                    ⚠️ Token tidak ditemukan. Link reset password mungkin tidak valid atau sudah kadaluarsa.
                </div>
            )}
        </div>
    );
}
