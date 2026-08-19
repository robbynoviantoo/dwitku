"use client";

import { Loader2, Trash2, LogOut, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface SettingsDangerZoneProps {
  isOwner: boolean;
  isPending: boolean;
  isLeaving: boolean;
  isDeleting: boolean;
  onLeave: () => void;
  onDelete: () => void;
}

export function SettingsDangerZone({
  isOwner,
  isPending,
  isLeaving,
  isDeleting,
  onLeave,
  onDelete,
}: SettingsDangerZoneProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-red-200 dark:border-red-900/50 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h2 className="text-sm font-bold text-red-600 dark:text-red-400">
          {t("settings.dangerZone")}
        </h2>
      </div>

      <div className="space-y-3">
        {!isOwner && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-slate-100 dark:border-[#21262d] bg-slate-50/50 dark:bg-zinc-800/20 rounded-xl">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {t("settings.leaveTitle")}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {t("settings.leaveDesc")}
              </p>
            </div>
            <button
              onClick={onLeave}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60 shrink-0"
            >
              {isLeaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              {t("settings.leaveBtn")}
            </button>
          </div>
        )}

        {isOwner && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-red-100 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/20 rounded-xl">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {t("settings.deleteTitle")}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {t("settings.deleteDesc")}
              </p>
            </div>
            <button
              onClick={onDelete}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-60 shrink-0"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {t("settings.deleteBtn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
