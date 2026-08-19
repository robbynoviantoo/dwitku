"use client";

import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

interface WorkspacesHeaderProps {
  userName?: string | null;
  isEmailVerified?: boolean;
  handleCreateNew?: (e: React.MouseEvent) => void;
}

export function WorkspacesHeader({
  userName,
  handleCreateNew,
}: WorkspacesHeaderProps) {
  const { t, locale } = useLanguage();

  const hour = new Date().getHours();
  const greetingId =
    hour < 12 ? "Pagi" : hour < 15 ? "Siang" : hour < 18 ? "Sore" : "Malam";
  const greetingEn =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const firstName = userName?.split(" ")[0] ?? (locale === "en" ? "friend" : "teman");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 tracking-tight">
          <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          {locale === "en" ? `${greetingEn}, ${firstName} 👋` : `Selamat ${greetingId}, ${firstName} 👋`}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
          {t("workspaces.subtitle")}
        </p>
      </div>

      <Link
        href="/onboarding"
        onClick={handleCreateNew}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>{t("workspaces.createNew")}</span>
      </Link>
    </div>
  );
}
