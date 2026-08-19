"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  align?: "left" | "right" | "center";
}

export function DateRangePicker({
  value,
  onChange,
  align = "right",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Temporary selection state when clicking dates
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStart, setSelectingStart] = useState<string | null>(null);

  const initialDate = value.startDate
    ? new Date(value.startDate + "T00:00:00")
    : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSelectingStart(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const clickedDate = `${viewYear}-${mm}-${dd}`;

    if (!selectingStart) {
      // First click -> start range
      setSelectingStart(clickedDate);
    } else {
      // Second click -> finish range
      if (clickedDate < selectingStart) {
        onChange({ startDate: clickedDate, endDate: selectingStart });
      } else {
        onChange({ startDate: selectingStart, endDate: clickedDate });
      }
      setSelectingStart(null);
      setOpen(false);
    }
  };

  const { t } = useLanguage();

  const handleQuickSelect = (type: "thisMonth" | "lastMonth" | "thisYear" | "allTime" | "thisWeek") => {
    const now = new Date();
    if (type === "thisMonth") {
      onChange({
        startDate: format(startOfMonth(now), "yyyy-MM-dd"),
        endDate: format(endOfMonth(now), "yyyy-MM-dd"),
      });
    } else if (type === "lastMonth") {
      const last = subMonths(now, 1);
      onChange({
        startDate: format(startOfMonth(last), "yyyy-MM-dd"),
        endDate: format(endOfMonth(last), "yyyy-MM-dd"),
      });
    } else if (type === "thisYear") {
      onChange({
        startDate: format(startOfYear(now), "yyyy-MM-dd"),
        endDate: format(endOfYear(now), "yyyy-MM-dd"),
      });
    } else if (type === "thisWeek") {
      onChange({
        startDate: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        endDate: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      });
    } else if (type === "allTime") {
      onChange({ startDate: "", endDate: "" });
    }
    setSelectingStart(null);
    setOpen(false);
  };

  // Format label for display
  const getDisplayLabel = () => {
    if (!value.startDate && !value.endDate) return t("reports.allTime");
    if (value.startDate && !value.endDate) return value.startDate;
    if (value.startDate === value.endDate) {
      const d = new Date(value.startDate + "T00:00:00");
      return format(d, "dd MMM yyyy");
    }
    const d1 = new Date(value.startDate + "T00:00:00");
    const d2 = new Date(value.endDate + "T00:00:00");
    return `${format(d1, "dd MMM yyyy")} - ${format(d2, "dd MMM yyyy")}`;
  };

  const isDateInRange = (dayDate: string) => {
    const start = selectingStart || value.startDate;
    const end = selectingStart ? hoverDate : value.endDate;
    if (!start || !end) return false;
    const [s, e] = start <= end ? [start, end] : [end, start];
    return dayDate >= s && dayDate <= e;
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
          "bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#21262d] text-zinc-800 dark:text-zinc-200",
          open && "border-green-600 ring-2 ring-green-600/10",
          (value.startDate || value.endDate) &&
            "border-green-600/50 bg-green-50/40 dark:bg-green-950/20 text-green-700 dark:text-green-300"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate">{getDisplayLabel()}</span>
        </div>
        {(value.startDate || value.endDate) ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange({ startDate: "", endDate: "" });
            }}
            className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-3 h-3" />
          </span>
        ) : null}
      </button>

      {/* Popover */}
      {open && (
        <div
          className={cn(
            "absolute top-full mt-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl shadow-xl z-50 overflow-hidden min-w-[310px]",
            align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          {/* Preset Buttons */}
          <div className="p-2 border-b border-slate-100 dark:border-[#21262d] grid grid-cols-3 gap-1">
            <button
              onClick={() => handleQuickSelect("thisMonth")}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-zinc-800 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-600 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              {t("reports.presets.thisMonth")}
            </button>
            <button
              onClick={() => handleQuickSelect("lastMonth")}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-zinc-800 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-600 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              {t("reports.presets.lastMonth")}
            </button>
            <button
              onClick={() => handleQuickSelect("thisYear")}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-zinc-800 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-600 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              {t("reports.presets.thisYear")}
            </button>
            <button
              onClick={() => handleQuickSelect("thisWeek")}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-zinc-800 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-600 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              {t("reports.presets.thisWeek")}
            </button>
            <button
              onClick={() => handleQuickSelect("allTime")}
              className="col-span-2 px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-zinc-800 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-600 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> {t("reports.presets.allTime")}
            </button>
          </div>

          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-[#21262d]">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 px-3 pt-2 text-center text-[10px] font-bold text-zinc-400 uppercase">
            {DAYS_SHORT.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
            {cells.map((day, idx) => {
              if (!day) return <span key={idx} />;

              const mm = String(viewMonth + 1).padStart(2, "0");
              const dd = String(day).padStart(2, "0");
              const dayDate = `${viewYear}-${mm}-${dd}`;

              const inRange = isDateInRange(dayDate);
              const isStart =
                dayDate === (selectingStart || value.startDate);
              const isEnd =
                dayDate === (selectingStart ? hoverDate : value.endDate);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoverDate(dayDate)}
                  className={cn(
                    "h-8 text-xs font-medium rounded-lg transition-all cursor-pointer relative",
                    inRange &&
                      "bg-green-100 dark:bg-green-950/60 text-green-900 dark:text-green-100",
                    (isStart || isEnd) &&
                      "bg-green-600 !text-white font-bold rounded-lg shadow-sm",
                    !inRange &&
                      !isStart &&
                      !isEnd &&
                      "hover:bg-slate-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Instruction hint */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-100 dark:border-[#21262d] text-center">
            <p className="text-[10px] text-zinc-400">
              {selectingStart
                ? t("reports.presets.startHint")
                : t("reports.presets.defaultHint")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
