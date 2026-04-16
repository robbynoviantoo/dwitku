"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Pencil } from "lucide-react";
import { PlanFormModal } from "./plan-form-modal";

export function PlanCardClient({ plan }: { plan: any }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            <h3 className="font-bold text-lg text-zinc-900">{plan.name}</h3>
            <p className="text-2xl font-extrabold mt-1">
              {plan.priceMonthly === 0 ? "Gratis" : `Rp ${plan.priceMonthly.toLocaleString("id-ID")}`}
              {plan.priceMonthly > 0 && <span className="text-xs text-zinc-400 font-normal ml-1">/ bln</span>}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-lg">
              {plan._count?.subscriptions || 0} subscriber
            </span>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 font-semibold text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>

        <ul className="space-y-1.5 text-sm text-zinc-600 flex-1 mb-4">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            {plan.maxWorkspaces === -1 ? "Unlimited workspace" : `${plan.maxWorkspaces} workspace`}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            {plan.maxTx === -1 ? "Unlimited transaksi" : `${plan.maxTx} transaksi`}
          </li>
          <li className="flex items-center gap-2">
            {plan.canExport ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
            Export Excel
          </li>
          <li className="flex items-center gap-2">
            {plan.canReport ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
            Laporan lanjutan
          </li>
        </ul>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-auto">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {plan.isActive ? "Aktif" : "Nonaktif"}
          </span>
          <span className="text-xs text-zinc-400 font-mono tracking-tight">ID: {plan.key}</span>
        </div>
      </div>

      {isEditing && (
        <PlanFormModal plan={plan} onClose={() => setIsEditing(false)} />
      )}
    </>
  );
}
