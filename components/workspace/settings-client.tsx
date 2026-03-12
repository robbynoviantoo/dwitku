"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UpdateWorkspaceSchema, WorkspaceRole, WorkspaceRoleType } from "@/lib/validations/workspace";
import { updateWorkspace, deleteWorkspace, leaveWorkspace } from "@/app/actions/workspace";
import { Loader2, Trash2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Workspace = {
    id: string;
    name: string;
    description: string | null;
    currency: string;
    role: WorkspaceRoleType;
};

export function SettingsClient({ workspace }: { workspace: Workspace }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const isOwner = workspace.role === WorkspaceRole.OWNER;

    const form = useForm<z.infer<typeof UpdateWorkspaceSchema>>({
        resolver: zodResolver(UpdateWorkspaceSchema),
        defaultValues: {
            name: workspace.name,
            description: workspace.description ?? "",
            currency: workspace.currency,
        },
    });

    const onSave = (values: z.infer<typeof UpdateWorkspaceSchema>) => {
        setError(undefined);
        setSuccess(undefined);
        startTransition(async () => {
            const result = await updateWorkspace(workspace.id, values);
            if (result.error) setError(result.error);
            else setSuccess("Pengaturan berhasil disimpan.");
        });
    };

    const handleDelete = () => {
        if (!confirm("Yakin ingin menghapus workspace ini? Semua data akan ikut terhapus.")) return;
        startTransition(async () => {
            const result = await deleteWorkspace(workspace.id);
            if (result.error) setError(result.error);
            else {
                router.push("/dashboard");
                router.refresh();
            }
        });
    };

    const handleLeave = () => {
        if (!confirm("Yakin ingin keluar dari workspace ini?")) return;
        startTransition(async () => {
            const result = await leaveWorkspace(workspace.id);
            if (result.error) setError(result.error);
            else {
                router.push("/dashboard");
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* General settings */}
            <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
                <h2 className="font-semibold text-zinc-900 mb-5">Informasi Workspace</h2>
                <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Nama Workspace
                        </label>
                        <input
                            {...form.register("name")}
                            disabled={!isOwner || isPending}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 focus:bg-white transition-colors disabled:text-zinc-400"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Deskripsi
                        </label>
                        <textarea
                            {...form.register("description")}
                            disabled={!isOwner || isPending}
                            rows={3}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 focus:bg-white transition-colors resize-none disabled:text-zinc-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Mata Uang
                        </label>
                        <select
                            {...form.register("currency")}
                            disabled={!isOwner || isPending}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 transition-colors disabled:text-zinc-400"
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
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    {isOwner && (
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Simpan Perubahan
                        </button>
                    )}
                </form>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
                <h2 className="font-semibold text-red-600 mb-4">Zona Berbahaya</h2>
                <div className="space-y-3">
                    {!isOwner && (
                        <div className="flex items-center justify-between p-4 border border-zinc-100 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Keluar dari Workspace</p>
                                <p className="text-xs text-zinc-400">
                                    Kamu tidak akan bisa lagi mengakses workspace ini.
                                </p>
                            </div>
                            <button
                                onClick={handleLeave}
                                disabled={isPending}
                                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </div>
                    )}
                    {isOwner && (
                        <div className="flex items-center justify-between p-4 border border-zinc-100 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-zinc-900">Hapus Workspace</p>
                                <p className="text-xs text-zinc-400">
                                    Hapus workspace beserta semua transaksi dan anggota. Permanen.
                                </p>
                            </div>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
