"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateWorkspaceSchema } from "@/lib/validations/workspace";
import { createWorkspace } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useLanguage } from "@/components/providers/language-provider";

interface OnboardingClientProps {
  isEmailVerified: boolean;
}

export function OnboardingClient({ isEmailVerified }: OnboardingClientProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const form = useForm<z.infer<typeof CreateWorkspaceSchema>>({
    resolver: zodResolver(CreateWorkspaceSchema) as any,
    defaultValues: { name: "", description: "", currency: "IDR", type: "FINANCE" },
  });

  const onSubmit = (values: z.infer<typeof CreateWorkspaceSchema>) => {
    if (!isEmailVerified) {
      Swal.fire({
        title: locale === "id" ? "Perhatian" : "Warning",
        text:
          locale === "id"
            ? "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa membuat workspace baru."
            : "You must verify your email address first before you can create a new workspace.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: locale === "id" ? "Mengerti" : "Understood",
        customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
      });
      return;
    }

    setError(undefined);
    startTransition(async () => {
      const result = await createWorkspace({ ...values, type: "FINANCE" });
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt="Logo"
            className="w-12 h-12 rounded-2xl mb-4"
          />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {t("onboarding.title2")}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs max-w-sm">
            {locale === "en"
              ? "Fill in your workspace details to start tracking your finances."
              : "Isi informasi dasar workspace untuk mulai mencatat keuangan."}
          </p>
        </div>

        {/* Details Form */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6 sm:p-7">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nama Workspace */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                {t("settings.name")} <span className="text-red-500">*</span>
              </label>
              <input
                {...form.register("name")}
                disabled={isPending}
                placeholder={t("onboarding.namePlaceholderFinance")}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-[#21262d] rounded-xl focus:outline-none focus:ring-1 focus:ring-green-600 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs transition-colors"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                {t("settings.description")}{" "}
                <span className="text-zinc-400 font-normal">
                  ({t("settings.optional").toLowerCase()})
                </span>
              </label>
              <textarea
                {...form.register("description")}
                disabled={isPending}
                rows={2}
                placeholder={t("onboarding.descPlaceholder")}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-[#21262d] rounded-xl focus:outline-none focus:ring-1 focus:ring-green-600 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs transition-colors resize-none"
              />
            </div>

            {/* Mata Uang */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                {t("settings.currency")}
              </label>
              <select
                {...form.register("currency")}
                disabled={isPending}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-[#21262d] rounded-xl focus:outline-none focus:ring-1 focus:ring-green-600 text-zinc-900 dark:text-zinc-100 text-xs transition-colors"
              >
                <option value="IDR">IDR — Rupiah Indonesia (Rp)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="SGD">SGD — Singapore Dollar (S$)</option>
                <option value="MYR">MYR — Malaysian Ringgit (RM)</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3.5 py-2.5 rounded-xl text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-60 text-xs cursor-pointer active:scale-95 mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />{" "}
                  {t("onboarding.creating")}
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />{" "}
                  {t("onboarding.createWorkspace")}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
