"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface CategoriesFilterTabsProps {
  filter: "ALL" | "INCOME" | "EXPENSE";
  totalCount: number;
  incomeCount: number;
  expenseCount: number;
  onFilterChange: (filter: "ALL" | "INCOME" | "EXPENSE") => void;
}

export function CategoriesFilterTabs({
  filter,
  totalCount,
  incomeCount,
  expenseCount,
  onFilterChange,
}: CategoriesFilterTabsProps) {
  const { t } = useLanguage();

  const tabs: { key: "ALL" | "INCOME" | "EXPENSE"; label: string; count: number }[] = [
    { key: "ALL", label: t("categories.all"), count: totalCount },
    { key: "EXPENSE", label: t("transactions.expense"), count: expenseCount },
    { key: "INCOME", label: t("transactions.income"), count: incomeCount },
  ];

  return (
    <div className="flex gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] w-fit mb-6">
      {tabs.map((tab) => {
        const isSelected = filter === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5",
              isSelected
                ? "bg-slate-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                isSelected
                  ? "bg-green-600 text-white"
                  : "bg-slate-100 dark:bg-zinc-800 text-zinc-500"
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
