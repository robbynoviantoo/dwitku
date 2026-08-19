"use client";

import { Users } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function MembersHeader() {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 tracking-tight">
        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
        {t("members.title")}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
        {t("members.subtitle")}
      </p>
    </div>
  );
}
