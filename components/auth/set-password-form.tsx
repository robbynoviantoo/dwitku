"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { setPassword } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useSession } from "next-auth/react";

const SetPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Password minimal 6 karakter",
    }),
    confirmPassword: z.string().min(1, {
        message: "Konfirmasi password wajib diisi",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

export function SetPasswordForm() {
    const { update } = useSession();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof SetPasswordSchema>>({
        resolver: zodResolver(SetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values: z.infer<typeof SetPasswordSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            setPassword(values.password)
                .then(async (data) => {
                    if (data.error) {
                        setError(data.error);
                    }
                    if (data.success) {
                        setSuccess(data.success);
                        // Update session to reflect hasPassword: true
                        await update({ hasPassword: true });
                        router.push("/workspaces");
                    }
                })
                .catch(() => setError("Terjadi kesalahan sistem."));
        });
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900">Buat Password</h1>
                <p className="text-sm text-zinc-500 mt-2">
                    Buat password agar kamu bisa masuk menggunakan email di lain waktu.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Password Baru</label>
                    <div className="relative">
                        <input
                            {...form.register("password")}
                            disabled={isPending}
                            className="w-full pl-4 pr-10 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                            placeholder="Min. 6 karakter"
                            type={showPassword ? "text" : "password"}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            disabled={isPending}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Konfirmasi Password</label>
                    <input
                        {...form.register("confirmPassword")}
                        disabled={isPending}
                        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                        placeholder="Ulangi password"
                        type={showPassword ? "text" : "password"}
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isPending ? "Menyimpan..." : "Simpan Password"}
                </button>
            </form>
        </div>
    );
}
