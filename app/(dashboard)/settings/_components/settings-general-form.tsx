"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UpdateWorkspaceSchema } from "@/lib/validations/workspace";
import { Loader2, Save } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface SettingsGeneralFormProps {
  workspace: any;
  isOwner: boolean;
  isPending: boolean;
  isSaving: boolean;
  error?: string;
  success?: string;
  onSave: (values: z.infer<typeof UpdateWorkspaceSchema>) => void;
}

export function SettingsGeneralForm({
  workspace,
  isOwner,
  isPending,
  isSaving,
  error,
  success,
  onSave,
}: SettingsGeneralFormProps) {
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof UpdateWorkspaceSchema>>({
    resolver: zodResolver(UpdateWorkspaceSchema),
    defaultValues: {
      name: workspace?.name || "",
      description: workspace?.description ?? "",
      currency: workspace?.currency || "IDR",
    },
  });

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-5 sm:p-6">
      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        {t("settings.info")}
      </h2>

      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 max-w-xl">
        {/* Nama Workspace */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
            {t("settings.name")}
          </label>
          <input
            {...form.register("name")}
            disabled={!isOwner || isPending}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-[#21262d] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-600 bg-slate-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-100 transition-colors disabled:opacity-60"
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
            {t("settings.description")}
          </label>
          <textarea
            {...form.register("description")}
            disabled={!isOwner || isPending}
            rows={3}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-[#21262d] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-600 bg-slate-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-100 transition-colors resize-none disabled:opacity-60"
          />
        </div>

        {/* Mata Uang */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
            {t("settings.currency")}
          </label>
          <select
            {...form.register("currency")}
            disabled={!isOwner || isPending}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-[#21262d] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-green-600 bg-slate-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-100 transition-colors disabled:opacity-60"
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
        {success && (
          <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-3.5 py-2.5 rounded-xl text-xs">
            {success}
          </div>
        )}

        {isOwner && (
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60 active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {t("settings.saveChanges")}
          </button>
        )}
      </form>
    </div>
  );
}
