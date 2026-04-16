"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
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
        title: "Tersimpan",
        text: "Paket berhasil diperbarui.",
        icon: "success",
        confirmButtonColor: "#16a34a",
        customClass: { popup: "!rounded-2xl" },
      });
      onClose();
    } else {
      Swal.fire({
        title: "Gagal",
        text: res.error,
        icon: "error",
        confirmButtonColor: "#16a34a",
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 shrink-0">
          <h2 className="font-bold text-zinc-900">Edit Paket: {plan.key.toUpperCase()}</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Nama Paket</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Harga per Bulan (Rp)</label>
              <input
                type="number"
                name="priceMonthly"
                value={formData.priceMonthly}
                onChange={handleChange}
                required
                min={0}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Max Workspace</label>
                <input
                  type="number"
                  name="maxWorkspaces"
                  value={formData.maxWorkspaces}
                  onChange={handleChange}
                  required
                  min={-1}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition-all"
                  title="Gunakan -1 untuk Unlimited"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Max Transaksi</label>
                <input
                  type="number"
                  name="maxTx"
                  value={formData.maxTx}
                  onChange={handleChange}
                  required
                  min={-1}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm transition-all"
                  title="Gunakan -1 untuk Unlimited"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="canExport"
                  checked={formData.canExport}
                  onChange={handleChange}
                  className="rounded border-zinc-300 text-green-600 focus:ring-green-500"
                />
                Dapat Meng-export Laporan (Excel)
              </label>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="canReport"
                  checked={formData.canReport}
                  onChange={handleChange}
                  className="rounded border-zinc-300 text-green-600 focus:ring-green-500"
                />
                Akses Laporan Lanjutan
              </label>
            </div>

            <div className="pt-2 border-t border-zinc-100">
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-zinc-900">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="rounded border-zinc-300 text-green-600 focus:ring-green-500"
                />
                Paket Tersedia / Aktif
              </label>
              <p className="text-xs text-zinc-500 mt-1">Jika dimatikan, paket ini tidak akan bisa dibeli lagi oleh pengguna.</p>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-100 flex gap-3 justify-end shrink-0 bg-zinc-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
