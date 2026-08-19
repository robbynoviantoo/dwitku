"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { CategorySelect, WalletFilterSelect, TypeSelect, CategoryItem } from "./transactions-filter-selects";
import { WalletWithBalance } from "@/app/actions/wallet";
import { TransactionFilter } from "@/app/actions/transaction";

interface TransactionsFilterPanelProps {
  filter: TransactionFilter;
  search: string;
  categories: CategoryItem[];
  wallets: WalletWithBalance[];
  onFilterChange: (updates: Partial<TransactionFilter>) => void;
  onSearch: (q: string) => void;
  onReset: () => void;
}

export function TransactionsFilterPanel({
  filter,
  search,
  categories,
  wallets,
  onFilterChange,
  onSearch,
  onReset,
}: TransactionsFilterPanelProps) {
  const { t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasAdvancedFilter = Boolean(
    filter.startDate ||
      filter.endDate ||
      filter.type ||
      filter.categoryId ||
      filter.walletId
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#21262d] bg-white dark:bg-[#161b22] p-3 space-y-3 shrink-0">
      {/* Top row: Search input + Toggles */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("transactions.searchPlaceholder")}
            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 dark:border-[#21262d] rounded-xl focus:outline-none focus:ring-1 focus:ring-green-600 bg-slate-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Toggle Advanced Filters button */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            showAdvanced || hasAdvancedFilter
              ? "border-green-600/60 bg-green-50/50 dark:bg-green-950/40 text-green-700 dark:text-green-300"
              : "border-slate-200 dark:border-[#21262d] text-zinc-600 dark:text-zinc-300 hover:border-slate-300 bg-white dark:bg-[#161b22]"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter</span>
          {hasAdvancedFilter && (
            <span className="w-2 h-2 rounded-full bg-green-600" />
          )}
        </button>

        {/* Reset Filter Button */}
        {(hasAdvancedFilter || search) && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced Filter drawer */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 dark:border-[#21262d] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 animate-in fade-in duration-150">
          {/* Tipe Transaksi */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1">
              {t("transactions.type")}
            </label>
            <TypeSelect
              value={filter.type ?? ""}
              onChange={(type) => onFilterChange({ type: type ? (type as any) : undefined })}
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1">
              {t("sidebar.kategori")}
            </label>
            <CategorySelect
              categories={categories}
              value={filter.categoryId ?? ""}
              onChange={(categoryId) => onFilterChange({ categoryId: categoryId || undefined })}
            />
          </div>

          {/* Dompet / Rekening */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1">
              Dompet / Bank
            </label>
            <WalletFilterSelect
              wallets={wallets}
              value={filter.walletId ?? ""}
              onChange={(walletId) => onFilterChange({ walletId: walletId || undefined })}
            />
          </div>

          {/* Rentang Tanggal */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-1">
              {t("transactions.date")}
            </label>
            <CalendarPicker
              value={filter.startDate ?? ""}
              onChange={(date) => onFilterChange({ startDate: date || undefined, endDate: date || undefined })}
              placeholder={t("transactions.selectDate")}
              allowClear
            />
          </div>
        </div>
      )}
    </div>
  );
}
