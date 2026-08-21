"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateWorkspaceSchema } from "@/lib/validations/workspace";
import { createWorkspace } from "@/app/actions/workspace";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

interface WorkspaceCreateFormProps {
  isEmailVerified?: boolean;
  onSuccess?: (workspace: any) => void;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
}

export function WorkspaceCreateForm({
  isEmailVerified = true,
  onSuccess,
  onCancel,
  submitLabel,
  className,
}: WorkspaceCreateFormProps) {
  const { locale, t } = useLanguage();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const form = useForm<z.infer<typeof CreateWorkspaceSchema>>({
    resolver: zodResolver(CreateWorkspaceSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      currency: "IDR",
      type: "FINANCE",
    },
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
        form.reset();
        if (onSuccess) {
          onSuccess(result.workspace);
        }
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
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

      <div className="flex items-center gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#21262d] text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-60 text-xs cursor-pointer active:scale-95"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />{" "}
              {t("onboarding.creating")}
            </>
          ) : (
            <>
              <Building2 className="w-4 h-4" />{" "}
              {submitLabel || t("onboarding.createWorkspace")}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
