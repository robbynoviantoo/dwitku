"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Tag, ChevronDown, Search, Check, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { WalletLogo } from "@/components/ui/wallet-logo";
import { WalletWithBalance } from "@/app/actions/wallet";

export type CategoryItem = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: string;
};

// ── Searchable Category Select ──────────────────────────────────────────────
export function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: CategoryItem[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.emoji.includes(search)
      ),
    [categories, search]
  );

  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={open ? () => { setOpen(false); setSearch(""); } : handleOpen}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
          "bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#21262d] text-zinc-700 dark:text-zinc-200 hover:border-green-600/50",
          open && "border-green-600 ring-2 ring-green-600/10",
          value && "border-green-600/60 bg-green-50/50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
        )}
      >
        <Tag className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
        <span className="flex-1 text-left truncate">
          {selected ? `${selected.emoji} ${selected.name}` : t("transactions.allCategories")}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 shrink-0 text-zinc-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl shadow-xl z-50 overflow-hidden min-w-48">
          <div className="p-2 border-b border-slate-100 dark:border-[#21262d]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("transactions.searchCategory")}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-[#21262d] rounded-xl focus:outline-none focus:ring-1 focus:ring-green-600 bg-slate-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer",
                !value && "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 font-bold"
              )}
            >
              <span className="w-5 text-center text-sm">🗂️</span>
              <span className="flex-1">{t("transactions.allCategories")}</span>
              {!value && <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
            </button>

            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-zinc-400 text-center">
                {t("transactions.categoryNotFound")}
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.id); setOpen(false); setSearch(""); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer",
                    value === c.id && "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 font-bold"
                  )}
                >
                  <span className="w-5 text-center text-sm">{c.emoji}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  {value === c.id && <Check className="w-3.5 h-3.5 shrink-0 text-green-600 dark:text-green-400" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Searchable Wallet Select ────────────────────────────────────────────────
export function WalletFilterSelect({
  wallets,
  value,
  onChange,
}: {
  wallets: WalletWithBalance[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = wallets.find((w) => w.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
          "bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#21262d] text-zinc-700 dark:text-zinc-200 hover:border-green-600/50",
          open && "border-green-600 ring-2 ring-green-600/10",
          value && "border-green-600/60 bg-green-50/50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
        )}
      >
        <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
        <span className="flex-1 text-left truncate">
          {selected ? selected.name : "Semua Dompet"}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 shrink-0 text-zinc-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl shadow-xl z-50 overflow-hidden min-w-48 max-h-56 overflow-y-auto py-1">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer",
              !value && "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 font-bold"
            )}
          >
            <span className="w-5 text-center text-sm">💳</span>
            <span className="flex-1">Semua Dompet</span>
            {!value && <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
          </button>

          {wallets.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => { onChange(w.id); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer",
                value === w.id && "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 font-bold"
              )}
            >
              <WalletLogo providerCode={w.providerCode} size="sm" />
              <span className="flex-1 truncate">{w.name}</span>
              {value === w.id && <Check className="w-3.5 h-3.5 shrink-0 text-green-600 dark:text-green-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Type Select ─────────────────────────────────────────────────────────────
export function TypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useLanguage();
  const options = [
    { value: "", label: t("transactions.allTypes"), emoji: "📊" },
    { value: "INCOME", label: t("transactions.income"), emoji: "↑" },
    { value: "EXPENSE", label: t("transactions.expense"), emoji: "↓" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const isSelected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
              isSelected
                ? o.value === "INCOME"
                  ? "bg-[#004C29] text-white border-[#004C29]"
                  : o.value === "EXPENSE"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-zinc-800 text-white border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                : "bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#21262d] text-zinc-600 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700"
            )}
          >
            <span className="text-[11px]">{o.emoji}</span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
