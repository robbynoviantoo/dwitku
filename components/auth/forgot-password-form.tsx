"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ForgotPasswordSchema } from "@/lib/validations/auth";
import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            requestPasswordReset(values)
                .then((data) => {
                    if (data?.error) setError(data.error);
                    if (data?.success) setSuccess(data.success);
                });
        });
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900">Lupa Password?</h1>
                <p className="text-sm text-zinc-500 mt-2">
                    Jangan khawatir! Masukkan email Anda dan kami akan mengirimkan instruksi reset.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                    <input
                        {...form.register("email")}
                        disabled={isPending}
                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                        placeholder="johndoe@example.com"
                        type="email"
                    />
                    {form.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                <button
                    disabled={isPending}
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Instruksi"}
                </button>
            </form>

            <div className="mt-8 text-center">
                <Link 
                    href="/login" 
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-800 flex items-center justify-center gap-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Login
                </Link>
            </div>
        </div>
    );
}
