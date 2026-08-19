"use client";

import { BarChart2 } from "lucide-react";
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker";
import { useLanguage } from "@/components/providers/language-provider";

interface ReportsHeaderProps {
  workspaceName: string;
  isPersonal: boolean;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function ReportsHeader({
  workspaceName,
  isPersonal,
  dateRange,
  onDateRangeChange,
}: ReportsHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5 tracking-tight">
          <BarChart2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          {t("reports.financialReport")}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
          {isPersonal ? t("reports.personalFinance") : `Workspace "${workspaceName}"`}
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="w-full sm:w-72 shrink-0">
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
          align="right"
        />
      </div>
    </div>
  );
}
