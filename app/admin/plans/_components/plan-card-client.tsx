"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Pencil, Users, Tag, Sparkles, Building2, BarChart2 } from "lucide-react";
import { PlanFormModal } from "./plan-form-modal";
import { formatCurrency } from "@/lib/utils";

export function PlanCardClient({ plan }: { plan: any }) {
  const [isEditing, setIsEditing] = useState(false);

  const isPro = plan.key === "pro";
  const isBasic = plan.key === "basic";

  return (
    <>
      <div className={`bg-white dark:bg-[#161b22] rounded-3xl border p-6 flex flex-col justify-between transition-all ${
        isPro
          ? "border-amber-500/40 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/20"
          : isBasic
          ? "border-green-500/40 shadow-md shadow-green-500/5 ring-1 ring-green-500/20"
          : "border-slate-200 dark:border-[#21262d]"
      }`}>
        <div>
          <div className="flex items-start justify-between mb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                  {plan.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-zinc-500 uppercase">
                  {plan.key}
                </span>
              </div>
              <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                {plan.priceMonthly === 0
                  ? "Gratis"
                  : formatCurrency(plan.priceMonthly, "IDR")}
                {plan.priceMonthly > 0 && (
                  <span className="text-xs text-zinc-400 font-normal ml-1">/ bln</span>
                )}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[11px] bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                {plan._count?.subscriptions || 0} subscriber
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-200 hover:bg-green-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 py-3 border-y border-slate-100 dark:border-zinc-800 my-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Building2 className="w-3.5 h-3.5" /> Max Workspace
              </span>
              <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                {plan.maxWorkspaces === -1 ? "Unlimited" : `${plan.maxWorkspaces} Ws`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <BarChart2 className="w-3.5 h-3.5" /> Max Transaksi / bln
              </span>
              <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                {plan.maxTx === -1 ? "Unlimited" : `${plan.maxTx} Tx`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Users className="w-3.5 h-3.5" /> Max Anggota Tim
              </span>
              <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                {plan.maxMembers === -1 ? "Unlimited" : `${plan.maxMembers} Anggota`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Tag className="w-3.5 h-3.5" /> Max Kategori Kustom
              </span>
              <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                {plan.maxCategories === -1 ? "Unlimited" : `${plan.maxCategories} Kategori`}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 mb-4">
            <div className="flex items-center gap-2">
              {plan.canExport ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
              )}
              <span>Ekspor Data Excel & CSV</span>
            </div>
            <div className="flex items-center gap-2">
              {plan.canReport ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
              )}
              <span>Akses Laporan Lanjutan</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {plan.trialDays > 0 ? `🎁 ${plan.trialDays} Hari Free Trial` : "⚡ Tanpa Trial (Langsung Aktif)"}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between mt-auto text-xs">
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
              plan.isActive
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/60 text-red-500 border border-red-200 dark:border-red-800"
            }`}
          >
            {plan.isActive ? "Aktif & Tersedia" : "Nonaktif"}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            Key: {plan.key}
          </span>
        </div>
      </div>

      {isEditing && (
        <PlanFormModal plan={plan} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}

