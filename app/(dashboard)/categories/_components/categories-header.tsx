"use client";

import { Tag, Plus } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface CategoriesHeaderProps {
  incomeCount: number;
  expenseCount: number;
  canEdit: boolean;
  onOpenAdd: () => void;
}

export function CategoriesHeader({
  incomeCount,
  expenseCount,
  canEdit,
  onOpenAdd,
}: CategoriesHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 tracking-tight">
          <Tag className="w-6 h-6 text-green-600 dark:text-green-400" />
          {t("sidebar.kategori")}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
          <span className="font-bold text-green-600 dark:text-green-400">{incomeCount}</span>{" "}
          {t("transactions.income").toLowerCase()} ·{" "}
          <span className="font-bold text-red-500 dark:text-red-400">{expenseCount}</span>{" "}
          {t("transactions.expense").toLowerCase()}
        </p>
      </div>

      {canEdit && (
        <button
          onClick={onOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t("categories.newCategory")}
        </button>
      )}
    </div>
  );
}
