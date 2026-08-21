"use client";

import Link from "next/link";
import { Sparkles, ArrowLeftRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface DashboardHeaderProps {
  greeting: string;
  userName?: string | null;
  workspaceName?: string;
  workspaceId: string;
  onCreateTx: (e: React.MouseEvent) => void;
}

export function DashboardHeader({
  greeting,
  userName,
  workspaceName,
  workspaceId,
  onCreateTx,
}: DashboardHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 shrink-0" />
            <span>{greeting}, {userName?.split(" ")[0] ?? t("greeting.friend")}</span>
          </h1>
          {workspaceName && (
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300 border border-green-200/60 dark:border-green-800/60 whitespace-nowrap">
              {workspaceName}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <Link
        href={`/transactions?workspaceId=${workspaceId}&action=add`}
        onClick={onCreateTx}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto"
      >
        <ArrowLeftRight className="w-4 h-4" />
        Catat Transaksi
      </Link>
    </div>
  );
}
