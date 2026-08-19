"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type MonthlyData = { month: string; income: number; expense: number };
type CategoryData = { name: string; emoji: string; color: string; value: number };

// ── Futuristic Tooltip ──────────────────────────────────────────────────────
function FuturisticTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-950/95 dark:bg-[#161b22]/95 border border-white/10 dark:border-[#21262d] backdrop-blur-xl rounded-2xl p-3 text-xs shadow-2xl text-white min-w-[150px]">
      <p className="font-bold text-zinc-300 border-b border-white/10 pb-1.5 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3 my-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-zinc-400 capitalize">
              {p.name === "income" ? "Masuk" : p.name === "expense" ? "Keluar" : p.name}:
            </span>
          </div>
          <span className="font-extrabold font-mono text-zinc-100">
            {formatCurrency(p.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Futuristic Cashflow Area & Bar Chart ────────────────────────────────────
export function FuturisticMonthlyChart({
  data,
  currency,
}: {
  data: MonthlyData[];
  currency: string;
}) {
  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-xs font-semibold">
        Belum ada data transaksi 6 bulan terakhir.
      </div>
    );
  }

  return (
    <div className="w-full h-64 outline-none select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} accessibilityLayer={false}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#004C29" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#004C29" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="rgba(148, 163, 184, 0.12)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) =>
              v >= 1000000
                ? `${(v / 1000000).toFixed(1)}M`
                : v > 0
                ? `${(v / 1000).toFixed(0)}k`
                : "0"
            }
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<FuturisticTooltip currency={currency} />} />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#004C29"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#incomeGrad)"
            name="income"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#expenseGrad)"
            name="expense"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Futuristic Category Breakdown Donut Chart ──────────────────────────────
export function FuturisticCategoryChart({
  data,
  currency,
}: {
  data: CategoryData[];
  currency: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 text-xs font-semibold">
        Belum ada pengeluaran pada periode ini.
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full h-64 outline-none select-none">
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer={false}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color || "#004C29"} />
              ))}
            </Pie>
            <Tooltip content={<FuturisticTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Total Count Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total</span>
          <span className="text-xs font-black font-mono text-zinc-800 dark:text-zinc-200">
            {formatCurrency(total, currency).replace(",00", "")}
          </span>
        </div>
      </div>

      {/* Futuristic Progress Legend */}
      <div className="flex-1 space-y-2 w-full max-h-56 overflow-y-auto pr-1">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={d.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 truncate text-zinc-700 dark:text-zinc-300 font-semibold">
                  <span>{d.emoji}</span>
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: d.color || "#004C29" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
