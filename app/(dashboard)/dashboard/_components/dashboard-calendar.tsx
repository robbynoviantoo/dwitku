"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCalendarTransactions, CalendarDayData } from "@/app/actions/report";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  X,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { format, startOfMonth, endOfMonth, getDay, getDaysInMonth, addMonths, subMonths } from "date-fns";
import { id as localeId, enUS as localeEn } from "date-fns/locale";
import "./calendar.css";

interface DashboardCalendarProps {
  workspaceId: string;
  currency: string;
}

export function DashboardCalendar({ workspaceId, currency }: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);
  const { showAmount } = usePrivacy();
  const { t, locale } = useLanguage();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ["calendar-transactions", workspaceId, currentYear, currentMonth],
    queryFn: () => getCalendarTransactions(workspaceId, currentYear, currentMonth),
    enabled: !!workspaceId,
  });

  const handlePrevMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  // Matrix generation for calendar (Senin - Minggu / Monday start)
  const totalDays = getDaysInMonth(currentDate);
  const firstDayOfMonth = startOfMonth(currentDate);
  
  // getDay returns 0 for Sunday, 1 for Monday...
  // We want Monday (1) to be index 0, Sunday (0) to be index 6
  let firstDayIndex = getDay(firstDayOfMonth) - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const dayNames = [
    t("calendar.days.mon"),
    t("calendar.days.tue"),
    t("calendar.days.wed"),
    t("calendar.days.thu"),
    t("calendar.days.fri"),
    t("calendar.days.sat"),
    t("calendar.days.sun"),
  ];

  const daysMap = calendarData?.days || {};
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const activeDateLocale = locale === "en" ? localeEn : localeId;
  const monthLabel = format(currentDate, "MMMM yyyy", { locale: activeDateLocale });

  // Compact number formatting for calendar cell
  const formatCompact = (num: number) => {
    if (!showAmount) return "•••";
    const isEn = locale === "en";
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + (isEn ? "B" : "M");
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + (isEn ? "M" : "jt");
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(0) + (isEn ? "k" : "rb");
    }
    return num.toString();
  };

  return (
    <div className="financial-calendar-card p-3 sm:p-4 h-full flex flex-col justify-between">
      {/* Header section */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
              {t("calendar.title")}
            </h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 hidden sm:block">
              {t("calendar.subtitle")}
            </p>
          </div>
        </div>

        {/* Navigation & Month Selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToday}
            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            {t("calendar.today")}
          </button>
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200/50 dark:border-zinc-700/50">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 px-2 capitalize min-w-[90px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all"
              aria-label="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700">
              <Sparkles className="w-4 h-4 text-green-500 animate-spin" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {t("calendar.loading")}
              </span>
            </div>
          </div>
        )}

        {/* Day Name Headers */}
        <div className="financial-calendar-grid mb-1">
          {dayNames.map((d, i) => (
            <div key={i} className="calendar-day-header">
              {d}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="financial-calendar-grid">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day-cell empty" />
          ))}

          {/* Actual days */}
          {Array.from({ length: totalDays }).map((_, index) => {
            const dayNum = index + 1;
            const dateObj = new Date(currentYear, currentMonth - 1, dayNum);
            const dateKey = format(dateObj, "yyyy-MM-dd");
            const dayData = daysMap[dateKey];
            const isToday = dateKey === todayStr;
            const isSelected = selectedDay?.date === dateKey;

            const hasTx = !!dayData && (dayData.income > 0 || dayData.expense > 0);
            const net = dayData ? dayData.net : 0;
            const isSurplus = hasTx && net > 0;
            const isDeficit = hasTx && net < 0;
            const isBalanced = hasTx && net === 0;

            let cellStateClass = "";
            if (isSurplus) cellStateClass = "has-surplus";
            else if (isDeficit) cellStateClass = "has-deficit";
            else if (isBalanced) cellStateClass = "has-balanced";

            return (
              <div
                key={dateKey}
                onClick={() => dayData && setSelectedDay(dayData)}
                className={`calendar-day-cell ${isToday ? "today" : ""} ${
                  isSelected ? "selected" : ""
                } ${cellStateClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="day-number">{dayNum}</span>
                  {hasTx && (
                    <div className="flow-dots">
                      {dayData.income > 0 && <span className="flow-dot bg-green-500" />}
                      {dayData.expense > 0 && <span className="flow-dot bg-red-400" />}
                    </div>
                  )}
                </div>

                {hasTx ? (
                  <div className="day-financial-info">
                    {dayData.income > 0 && (
                      <span className="flow-pill flow-pill-income">
                        +{formatCompact(dayData.income)}
                      </span>
                    )}
                    {dayData.expense > 0 && (
                      <span className="flow-pill flow-pill-expense">
                        -{formatCompact(dayData.expense)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="min-h-[14px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Transaction Breakdown Drawer/Modal */}
      {selectedDay && (
        <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>
                  {t("calendar.transaction")}{" "}
                  {format(new Date(selectedDay.date + "T00:00:00"), "d MMMM yyyy", {
                    locale: activeDateLocale,
                  })}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    selectedDay.net >= 0
                      ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                  }`}
                >
                  Net: {selectedDay.net >= 0 ? "+" : ""}
                  {showAmount ? formatCurrency(selectedDay.net, currency) : "••••••"}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {selectedDay.transactions.length} {t("calendar.recordedTransactions")}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-64 overflow-y-auto pr-1">
            {selectedDay.transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 hover:bg-white dark:hover:bg-zinc-800/50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-green-100/80 dark:bg-green-950 text-green-600 dark:text-green-400"
                          : "bg-red-100/80 dark:bg-red-950 text-red-500 dark:text-red-400"
                      }`}
                    >
                      {tx.category?.emoji ? (
                        <span className="text-sm">{tx.category.emoji}</span>
                      ) : isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {tx.note || tx.category?.name || (isIncome ? t("dashboard.pemasukan") : t("dashboard.pengeluaran"))}
                      </p>
                      {tx.category?.name && (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {tx.category.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold font-mono shrink-0 ml-3 ${
                      isIncome
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {showAmount ? formatCurrency(tx.amount, currency) : "••••••"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
