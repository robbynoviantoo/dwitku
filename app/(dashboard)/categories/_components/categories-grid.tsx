"use client";

import { Tag, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: string;
  isDefault: boolean;
  _count: { transactions: number };
};

interface CategoriesGridProps {
  categories: Category[];
  canEdit: boolean;
  isDeleting: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onOpenAdd: () => void;
}

export function CategoriesGrid({
  categories,
  canEdit,
  isDeleting,
  onEdit,
  onDelete,
  onOpenAdd,
}: CategoriesGridProps) {
  const { t } = useLanguage();

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]">
        <Tag className="w-10 h-10 mb-2 opacity-20 text-zinc-400" />
        <p className="text-xs font-semibold text-zinc-500">{t("categories.noCategories")}</p>
        {canEdit && (
          <button
            onClick={onOpenAdd}
            className="mt-3 text-xs font-bold text-green-600 hover:underline cursor-pointer"
          >
            + {t("categories.newCategory")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5",
        isDeleting && "opacity-50 pointer-events-none transition-opacity"
      )}
    >
      {categories.map((cat) => {
        const isIncome = cat.type === "INCOME";
        return (
          <div
            key={cat.id}
            className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-3.5 flex items-center gap-3 group hover:border-green-600/50 dark:hover:border-green-600/50 transition-all duration-150"
          >
            {/* Emoji container */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
              style={{
                backgroundColor: cat.color + "18",
                border: `1px solid ${cat.color}30`,
              }}
            >
              {cat.emoji}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {cat.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                    isIncome
                      ? "bg-green-50 dark:bg-green-950/80 text-green-700 dark:text-green-300"
                      : "bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300"
                  )}
                >
                  {isIncome ? t("transactions.income") : t("transactions.expense")}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {cat._count.transactions} {t("transactions.found")}
                </span>
              </div>
            </div>

            {/* Action buttons or Default pill */}
            {canEdit && !cat.isDefault && (
              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => onEdit(cat)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(cat)}
                  disabled={isDeleting}
                  className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {cat.isDefault && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                {t("categories.default")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
