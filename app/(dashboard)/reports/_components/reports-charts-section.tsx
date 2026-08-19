"use client";

import {
  FuturisticMonthlyChart,
  FuturisticCategoryChart,
} from "@/components/reports/futuristic-charts";
import { useLanguage } from "@/components/providers/language-provider";
import { DateRange } from "@/components/ui/date-range-picker";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface ReportsChartsSectionProps {
  monthlyData: any[];
  categoryData: any[];
  currency: string;
  showAmount: boolean;
  dateRange: DateRange;
}

export function ReportsChartsSection({
  monthlyData,
  categoryData,
  currency,
  showAmount,
  dateRange,
}: ReportsChartsSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ── Monthly Trend Flow Chart ── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
              {t("reports.monthlyTrend")}
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Arus Kas Masuk vs Keluar (6 Bulan Terakhir)
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <FuturisticMonthlyChart
            data={monthlyData}
            currency={currency}
          />
        </div>
      </div>

      {/* ── Category Breakdown Donut Chart ── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              {t("reports.expenseByCategory")}
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {dateRange.startDate && dateRange.endDate
                ? `${dateRange.startDate} s/d ${dateRange.endDate}`
                : "Distribusi Komposisi Kategori"}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <FuturisticCategoryChart
            data={categoryData}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}
