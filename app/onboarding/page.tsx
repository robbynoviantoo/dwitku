"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateWorkspaceSchema } from "@/lib/validations/workspace";
import { createWorkspace } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();

    const form = useForm<{
        name: string;
        currency: string;
        description?: string;
    }>({
        resolver: zodResolver(CreateWorkspaceSchema) as any,
        defaultValues: { name: "", description: "", currency: "IDR" },
    });

    const onSubmit = (values: z.infer<typeof CreateWorkspaceSchema>) => {
        setError(undefined);
        startTransition(async () => {
            const result = await createWorkspace(values);
            if (result.error) {
                setError(result.error);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        });
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900">Buat Workspace Bersama</h1>
                    <p className="text-zinc-500 mt-2 text-sm">
                        Workspace adalah &quot;buku kas bersama&quot; — cocok untuk mencatat keuangan bareng
                        keluarga, komunitas, atau tim.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                Nama Workspace <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...form.register("name")}
                                disabled={isPending}
                                placeholder="Contoh: Keuangan Keluarga, Kas RT, Kas Komunitas..."
                                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-zinc-900 placeholder-zinc-400"
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                Deskripsi{" "}
                                <span className="text-zinc-400 font-normal">(opsional)</span>
                            </label>
                            <textarea
                                {...form.register("description")}
                                disabled={isPending}
                                rows={3}
                                placeholder="Catatan singkat tentang workspace ini..."
                                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-zinc-900 placeholder-zinc-400 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                Mata Uang
                            </label>
                            <select
                                {...form.register("currency")}
                                disabled={isPending}
                                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-zinc-900 appearance-none"
                            >
                                <option value="IDR">IDR — Rupiah Indonesia</option>
                                <option value="USD">USD — US Dollar</option>
                                <option value="SGD">SGD — Singapore Dollar</option>
                                <option value="MYR">MYR — Malaysian Ringgit</option>
                            </select>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Membuat workspace...
                                </>
                            ) : (
                                <>
                                    Buat Workspace
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-400 mt-4">
                    Workspace baru akan memiliki 17 kategori default yang bisa kamu kustomisasi.
                </p>
            </div>
        </div>
    );
}
