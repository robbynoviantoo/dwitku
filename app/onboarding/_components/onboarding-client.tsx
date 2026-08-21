"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { WorkspaceCreateForm } from "@/components/workspace/workspace-create-form";

interface OnboardingClientProps {
  isEmailVerified: boolean;
}

export function OnboardingClient({ isEmailVerified }: OnboardingClientProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();

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

        {/* Details Form Card */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6 sm:p-7 shadow-sm">
          <WorkspaceCreateForm
            isEmailVerified={isEmailVerified}
            onSuccess={() => {
              router.push("/workspaces");
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
