"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  ArrowLeftRight,
  Crown,
  ChevronRight,
  ShoppingBag,
  Wallet,
  Building2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { cn, getInitials } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

type Workspace = {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
  isPersonal: boolean;
  type?: string; // "FINANCE" | "SALES"
  role: string;
  _count?: { members: number; transactions: number };
};

interface WorkspacesGridProps {
  workspaces: (Workspace & { role: string })[];
  handleCreateNew: (e: React.MouseEvent) => void;
}

const ROLE_COLOR: Record<string, string> = {
  OWNER: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
  ADMIN: "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/60 border-green-200 dark:border-green-800",
  MEMBER: "text-zinc-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700",
  VIEWER: "text-zinc-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700",
};

export function WorkspacesGrid({ workspaces, handleCreateNew }: WorkspacesGridProps) {
  const router = useRouter();
  const { t } = useLanguage();

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-8">
        <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/60 flex items-center justify-center mx-auto mb-3 text-green-600 dark:text-green-400">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
          {t("workspaces.emptyTitle")}
        </h2>
        <p className="text-xs text-zinc-400 mb-5 max-w-sm mx-auto">
          {t("workspaces.emptySubtitle")}
        </p>
        <Link
          href="/onboarding"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all text-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t("workspaces.createNew")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          onClick={() => router.push(`/workspaces?workspaceId=${ws.id}`)}
          className={cn(
            "group text-left bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d]",
            "hover:border-green-600/50 dark:hover:border-green-500/50 transition-all duration-200",
            "overflow-hidden flex flex-col w-full cursor-pointer"
          )}
        >
          {/* Card Top Header */}
          <div className="p-4 border-b border-slate-100 dark:border-[#21262d]/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-950/60 border border-green-200/60 dark:border-green-800/40 flex items-center justify-center text-green-700 dark:text-green-300 font-extrabold text-sm shrink-0">
              {getInitials(ws.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm truncate leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {ws.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border",
                    ROLE_COLOR[ws.role] ?? ROLE_COLOR.VIEWER
                  )}
                >
                  {ws.role === "OWNER" && <Crown className="w-2.5 h-2.5" />}
                  {ws.role}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Wallet className="w-2.5 h-2.5" /> Keuangan
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 min-h-[32px]">
              {ws.description || "Workspace keuangan kolaboratif."}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                {ws._count?.members ?? 0} {t("members.title")}
              </span>
              <span className="flex items-center gap-1">
                <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
                {ws._count?.transactions ?? 0} {t("reports.transactions")}
              </span>
              <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300 ml-auto bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-[10px]">
                {ws.currency}
              </span>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-800/20 border-t border-slate-100 dark:border-[#21262d]/80 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              {t("workspaces.enterWorkspace")}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>
      ))}
    </div>
  );
}
