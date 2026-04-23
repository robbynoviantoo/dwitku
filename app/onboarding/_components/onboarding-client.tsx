"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateWorkspaceSchema } from "@/lib/validations/workspace";
import { createWorkspace } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
    Building2, ArrowRight, Loader2, Wallet, ShoppingBag, CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";

type WorkspaceType = "FINANCE" | "SALES";

interface OnboardingClientProps {
    isEmailVerified: boolean;
}

const TYPES: { type: WorkspaceType; icon: React.ReactNode; title: string; description: string; color: string; }[] = [
    {
        type: "FINANCE",
        icon: <Wallet className="w-8 h-8" />,
        title: "Keuangan",
        description: "Catat pemasukan & pengeluaran. Cocok untuk keuangan pribadi, keluarga, atau tim.",
        color: "green",
    },
    {
        type: "SALES",
        icon: <ShoppingBag className="w-8 h-8" />,
        title: "Penjualan",
        description: "Catat penjualan produk dengan HPP. Hitung omzet, laba kotor & laba bersih otomatis.",
        color: "blue",
    },
];

export function OnboardingClient({ isEmailVerified }: OnboardingClientProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedType, setSelectedType] = useState<WorkspaceType>("FINANCE");

    const form = useForm<z.infer<typeof CreateWorkspaceSchema>>({
        resolver: zodResolver(CreateWorkspaceSchema) as any,
        defaultValues: { name: "", description: "", currency: "IDR", type: "FINANCE" },
    });

    const onSubmit = (values: z.infer<typeof CreateWorkspaceSchema>) => {
        if (!isEmailVerified) {
            Swal.fire({
                title: "Perhatian",
                text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa membuat workspace baru.",
                icon: "warning",
                confirmButtonColor: "#f59e0b",
                confirmButtonText: "Mengerti",
                customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" }
            });
            return;
        }

        setError(undefined);
        startTransition(async () => {
            const result = await createWorkspace({ ...values, type: selectedType });
            if (result.error) {
                setError(result.error);
            } else {
                queryClient.invalidateQueries({ queryKey: ["workspaces"] });
                router.push("/workspaces");
                router.refresh();
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon-192.png" alt="Logo" className="w-12 h-12 rounded-2xl shadow-lg shadow-green-100 mb-6" />
                    <div className="text-center">
                        <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-1">
                            {step === 1 ? "Langkah 1 dari 2" : "Langkah 2 dari 2"}
                        </p>
                        <h1 className="text-3xl font-bold text-zinc-900">
                            {step === 1 ? "Pilih Tipe Workspace" : "Detail Workspace"}
                        </h1>
                        <p className="text-zinc-500 mt-2 text-sm max-w-sm mx-auto">
                            {step === 1
                                ? "Pilih sesuai kebutuhanmu. Tipe tidak bisa diubah setelah workspace dibuat."
                                : "Isi informasi dasar workspace kamu."}
                        </p>
                    </div>
                </div>

                {/* Step 1: Type Selector */}
                {step === 1 && (
                    <div className="space-y-4">
                        {TYPES.map(({ type, icon, title, description, color }) => {
                            const isSelected = selectedType === type;
                            const colorMap = {
                                green: {
                                    border: isSelected ? "border-green-500 bg-green-50" : "border-zinc-200 bg-white hover:border-green-300",
                                    icon: "text-green-600 bg-green-100",
                                    check: "text-green-600",
                                },
                                blue: {
                                    border: isSelected ? "border-blue-500 bg-blue-50" : "border-zinc-200 bg-white hover:border-blue-300",
                                    icon: "text-blue-600 bg-blue-100",
                                    check: "text-blue-600",
                                },
                            }[color]!;

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedType(type)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${colorMap.border}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-xl shrink-0 ${colorMap.icon}`}>
                                            {icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-zinc-900 text-base">{title}</p>
                                            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{description}</p>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${colorMap.check}`} />
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-green-100 mt-2"
                        >
                            Lanjut
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Step 2: Details Form */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
                        {/* Type badge */}
                        <div className={`inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-xl text-sm font-medium ${selectedType === "SALES" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                            {selectedType === "SALES" ? <ShoppingBag className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                            Workspace {selectedType === "SALES" ? "Penjualan" : "Keuangan"}
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Nama Workspace <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...form.register("name")}
                                    disabled={isPending}
                                    placeholder={selectedType === "SALES" ? "Contoh: Toko Maju, Warung Sari..." : "Contoh: Keuangan Keluarga, Kas RT..."}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors text-zinc-900 placeholder-zinc-400"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Deskripsi <span className="text-zinc-400 font-normal">(opsional)</span>
                                </label>
                                <textarea
                                    {...form.register("description")}
                                    disabled={isPending}
                                    rows={2}
                                    placeholder="Catatan singkat tentang workspace ini..."
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors text-zinc-900 placeholder-zinc-400 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Mata Uang</label>
                                <select
                                    {...form.register("currency")}
                                    disabled={isPending}
                                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors text-zinc-900 appearance-none"
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

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    disabled={isPending}
                                    className="flex-1 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-green-100"
                                >
                                    {isPending ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Membuat...</>
                                    ) : (
                                        <><Building2 className="w-4 h-4" /> Buat Workspace</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
