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
    <div className="flex items-center justify-between gap-4 flex-wrap shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
          <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
          <span>{greeting}, {userName?.split(" ")[0] ?? t("greeting.friend")}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
            {workspaceName ?? "..."}
          </span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <Link
        href={`/transactions?workspaceId=${workspaceId}`}
        onClick={onCreateTx}
        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer"
      >
        <ArrowLeftRight className="w-4 h-4" />
        Catat Transaksi
      </Link>
    </div>
  );
}
