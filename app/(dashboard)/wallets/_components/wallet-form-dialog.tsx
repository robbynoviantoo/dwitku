"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WalletSchema, WalletFormValues } from "@/lib/validations/wallet";
import { createWallet, updateWallet, WalletWithBalance } from "@/app/actions/wallet";
import { WALLET_PROVIDERS, getWalletProvider } from "@/lib/wallet-providers";
import { WalletLogo } from "@/components/ui/wallet-logo";
import { X, Loader2, CreditCard, Building2, Wallet as WalletIcon, Banknote, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import { useLanguage } from "@/components/providers/language-provider";

interface Props {
  workspaceId: string;
  wallet?: WalletWithBalance | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Format number with thousand separator (dot) ──────────────────────────────
function formatThousands(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseThousands(formatted: string): number {
  return Number(formatted.replace(/\./g, ""));
}

export function WalletFormDialog({ workspaceId, wallet, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const isEdit = !!wallet;

  const [selectedType, setSelectedType] = useState<"BANK" | "EWALLET" | "CASH" | "OTHER">(
    wallet?.type || "BANK"
  );
  const [selectedProvider, setSelectedProvider] = useState<string>(
    wallet?.providerCode || "bca"
  );

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(WalletSchema) as any,
    defaultValues: {
      name: wallet?.name || "BCA Utama",
      type: wallet?.type || "BANK",
      providerCode: wallet?.providerCode || "bca",
      accountNumber: wallet?.accountNumber || "",
      holderName: wallet?.holderName || "",
      color: wallet?.color || "#00569c",
      initialBalance: wallet?.initialBalance || 0,
      isDefault: wallet?.isDefault || false,
    },
  });

  // Lock body scroll while dialog is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  const [balanceDisplay, setBalanceDisplay] = useState(
    wallet?.initialBalance && wallet.initialBalance > 0
      ? formatThousands(String(wallet.initialBalance))
      : ""
  );

  // Filter providers by selected type
  const availableProviders = WALLET_PROVIDERS.filter((p) => {
    if (selectedType === "BANK") return p.type === "BANK";
    if (selectedType === "EWALLET") return p.type === "EWALLET";
    if (selectedType === "CASH") return p.type === "CASH";
    return p.type === "OTHER";
  });

  const handleSelectProvider = (code: string) => {
    const prov = getWalletProvider(code);
    setSelectedProvider(code);
    form.setValue("providerCode", code);
    form.setValue("color", prov.color);
    if (!isEdit) {
      form.setValue("name", prov.name);
    }
  };

  const handleTypeChange = (type: "BANK" | "EWALLET" | "CASH" | "OTHER") => {
    setSelectedType(type);
    form.setValue("type", type);
    const firstOfGroup = WALLET_PROVIDERS.find((p) => p.type === type);
    if (firstOfGroup) {
      handleSelectProvider(firstOfGroup.code);
    }
  };

  const onSubmit = (values: WalletFormValues) => {
    setError(undefined);
    startTransition(async () => {
      let res;
      if (isEdit && wallet) {
        res = await updateWallet(wallet.id, workspaceId, values);
      } else {
        res = await createWallet(workspaceId, values);
      }

      if (res.error) {
        setError(res.error);
      } else {
        queryClient.invalidateQueries({ queryKey: ["wallets", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["wallets-summary", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
        broadcastInvalidate(["wallets", "transactions", "dashboard"]);
        onSuccess();
        onClose();
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isEdit ? "Edit Dompet / Rekening" : "Tambah Dompet / Rekening"}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Hubungkan rekening bank, e-wallet, atau dompet tunai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl">
              {error}
            </div>
          )}

          {/* 1. Tipe Dompet (Pills) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
              Tipe Akun Keuangan
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: "BANK", label: "Bank", icon: Building2 },
                { type: "EWALLET", label: "E-Wallet", icon: WalletIcon },
                { type: "CASH", label: "Tunai", icon: Banknote },
                { type: "OTHER", label: "Lainnya", icon: CreditCard },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleTypeChange(item.type as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer",
                      isSelected
                        ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300 ring-2 ring-green-500/20"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Pilihan Logo / Preset Provider */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
              Pilih Institusi / Provider
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/50">
              {availableProviders.map((p) => {
                const isSelected = selectedProvider === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleSelectProvider(p.code)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer group",
                      isSelected
                        ? "border-green-500 bg-white dark:bg-zinc-800 shadow-sm ring-2 ring-green-500/20"
                        : "border-transparent hover:bg-white dark:hover:bg-zinc-800/60"
                    )}
                  >
                    <WalletLogo providerCode={p.code} size="md" />
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1 truncate w-full">
                      {p.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Nama Dompet / Rekening */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Dompet / Rekening <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...form.register("name")}
              placeholder="Contoh: BCA Tabungan, GoPay Robby"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* 4. Pemilik Rekening & Nomor Rekening (2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nama Pemilik Akun
              </label>
              <input
                type="text"
                {...form.register("holderName")}
                placeholder="Contoh: Robby Noviantoo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nomor Rekening / HP
              </label>
              <input
                type="text"
                {...form.register("accountNumber")}
                placeholder="Contoh: 1234567890 / 08123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* 5. Saldo Awal */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Saldo Awal (Saat Mendaftar)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={balanceDisplay}
                onChange={(e) => {
                  const raw = e.target.value;
                  const formatted = formatThousands(raw);
                  setBalanceDisplay(formatted);
                  form.setValue("initialBalance", parseThousands(formatted) || 0);
                }}
                placeholder="0"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-mono text-right font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Saldo awal ini akan menjadi dasar perhitungan saldo bersih dompetmu.
            </p>
          </div>

          {/* 6. Set As Default */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              {...form.register("isDefault")}
              className="w-4 h-4 text-green-600 rounded border-zinc-300 focus:ring-green-500 cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Jadikan dompet utama (default untuk transaksi baru)
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{isEdit ? "Perbarui Dompet" : "Simpan Dompet"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
