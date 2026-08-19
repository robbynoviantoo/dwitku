"use client";

import { useState } from "react";
import { X, Save, Sparkles, Check, HelpCircle } from "lucide-react";
import { updatePlan } from "@/app/actions/admin";
import Swal from "sweetalert2";

interface PlanFormModalProps {
  plan: any;
  onClose: () => void;
}

export function PlanFormModal({ plan, onClose }: PlanFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: plan.name,
    priceMonthly: plan.priceMonthly,
    maxWorkspaces: plan.maxWorkspaces,
    maxTx: plan.maxTx,
    maxMembers: plan.maxMembers ?? -1,
    maxCategories: plan.maxCategories ?? -1,
    trialDays: plan.trialDays ?? 0,
    canExport: plan.canExport,
    canReport: plan.canReport,
    isActive: plan.isActive,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await updatePlan(plan.id, formData);
    setLoading(false);

    if (res.success) {
      Swal.fire({
        title: "Tersimpan!",
        text: `Paket ${plan.name} berhasil diperbarui.`,
        icon: "success",
        confirmButtonColor: "#004C29",
        customClass: { popup: "!rounded-2xl" },
      });
      onClose();
    } else {
      Swal.fire({
        title: "Gagal",
        text: res.error,
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161b22] rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-[#21262d] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Konfigurasi Paket: {plan.key.toUpperCase()}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Atur harga, batasan kuota, dan hak akses fitur untuk paket ini
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
            {/* Name & Monthly Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                  Nama Tampilan Paket
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                  Harga per Bulan (IDR)
                </label>
                <input
                  type="number"
                  name="priceMonthly"
                  value={formData.priceMonthly}
                  onChange={handleChange}
                  required
                  min={0}
                  step={1000}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 transition-all"
                />
              </div>
            </div>

            {/* Quotas: Workspaces & Transactions */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-3">
              <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span>Batasan Kuota (Gunakan -1 untuk Unlimited)</span>
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">
                    Max Workspaces
                  </label>
                  <input
                    type="number"
                    name="maxWorkspaces"
                    value={formData.maxWorkspaces}
                    onChange={handleChange}
                    required
                    min={-1}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">
                    Max Transaksi / Bulan
                  </label>
                  <input
                    type="number"
                    name="maxTx"
                    value={formData.maxTx}
                    onChange={handleChange}
                    required
                    min={-1}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">
                    Max Anggota / Tim
                  </label>
                  <input
                    type="number"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleChange}
                    required
                    min={-1}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">
                    Max Kategori Kustom
                  </label>
                  <input
                    type="number"
                    name="maxCategories"
                    value={formData.maxCategories}
                    onChange={handleChange}
                    required
                    min={-1}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Trial Days */}
            <div>
              <label className="font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                Masa Percobaan Gratis (Hari Trial)
              </label>
              <input
                type="number"
                name="trialDays"
                value={formData.trialDays}
                onChange={handleChange}
                required
                min={0}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <label className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="canExport"
                  checked={formData.canExport}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-green-600 focus:ring-green-500"
                />
                <span className="font-semibold">Bisa Ekspor Laporan ke Excel & CSV (XLSX)</span>
              </label>

              <label className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="canReport"
                  checked={formData.canReport}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-green-600 focus:ring-green-500"
                />
                <span className="font-semibold">Akses Laporan Lanjutan & Deep Analytics</span>
              </label>

              <label className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100 cursor-pointer select-none pt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-green-600 focus:ring-green-500"
                />
                <span className="font-bold">Paket Berstatus Aktif & Dapat Dibeli</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex gap-3 justify-end shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer active:scale-95"
            >
              {loading ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

