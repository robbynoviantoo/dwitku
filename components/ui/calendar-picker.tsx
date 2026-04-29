import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function CalendarPicker({
    value,        // "YYYY-MM-DD"
    onChange,
    error,
    placeholder = "Pilih tanggal",
    allowClear = false,
    align = "left",
}: {
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
    allowClear?: boolean;
    align?: "left" | "right" | "center";
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const parsedDate = value ? new Date(value + "T00:00:00") : new Date();
    const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedDate = value ? new Date(value + "T00:00:00") : null;

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const selectDay = (day: number) => {
        const mm = String(viewMonth + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        onChange(`${viewYear}-${mm}-${dd}`);
        setOpen(false);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const today = new Date();
    const isToday = (day: number) =>
        today.getFullYear() === viewYear &&
        today.getMonth() === viewMonth &&
        today.getDate() === day;
    const isSelected = (day: number) =>
        selectedDate &&
        selectedDate.getFullYear() === viewYear &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getDate() === day;

    // Formatted display
    const displayText = selectedDate
        ? selectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
        : placeholder;

    return (
        <div ref={ref} className="relative w-full">
            {/* Trigger */}
            <div className="relative w-full">
                <button
                    type="button"
                    onClick={() => setOpen(v => !v)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 border-2 rounded-xl text-sm transition-all text-left",
                        open
                            ? "border-green-400 bg-white"
                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-300",
                        !value && "text-zinc-400",
                        value && "text-zinc-900 font-medium",
                        allowClear && value && "pr-10"
                    )}
                >
                    <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span className="flex-1 truncate">{displayText}</span>
                </button>
                {allowClear && value && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {/* Calendar dropdown */}
            {open && (
                <div className={cn(
                    "absolute top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-[60] overflow-hidden min-w-[280px]",
                    align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
                )}>
                    {/* Nav */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-zinc-500" />
                        </button>
                        <span className="text-sm font-semibold text-zinc-800">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </button>
                    </div>

                    {/* Days header */}
                    <div className="grid grid-cols-7 px-3 pt-2 pb-1">
                        {DAYS_SHORT.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-zinc-400 uppercase py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
                        {cells.map((day, i) =>
                            day === null ? (
                                <div key={`e-${i}`} />
                            ) : (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => selectDay(day)}
                                    className={cn(
                                        "mx-auto flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all",
                                        isSelected(day)
                                            ? "bg-green-600 text-white font-bold shadow-sm"
                                            : isToday(day)
                                                ? "bg-green-50 text-green-600 font-semibold ring-1 ring-green-200"
                                                : "text-zinc-700 hover:bg-zinc-100",
                                    )}
                                >
                                    {day}
                                </button>
                            )
                        )}
                    </div>

                    {/* Quick: Hari ini */}
                    <div className="px-3 pb-3">
                        <button
                            type="button"
                            onClick={() => {
                                const t = new Date();
                                const mm = String(t.getMonth() + 1).padStart(2, "0");
                                const dd = String(t.getDate()).padStart(2, "0");
                                onChange(`${t.getFullYear()}-${mm}-${dd}`);
                                setOpen(false);
                            }}
                            className="w-full py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                        >
                            Hari ini
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
