"use client";

import {
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
    Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type MonthlyData = { month: string; income: number; expense: number };
type CategoryData = { name: string; emoji: string; color: string; value: number };

// ── Monthly Bar Chart ──────────────────────────────────────────────────────

function MonthlyTooltip({ active, payload, label, currency }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-xl px-3.5 py-2.5 text-xs shadow-none">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2 my-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
                    <span className="text-zinc-500 capitalize">{p.name === "income" ? "Pemasukan" : "Pengeluaran"}:</span>
                    <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">{formatCurrency(p.value, currency)}</span>
                </div>
            ))}
        </div>
    );
}

export function MonthlyBarChart({ data, currency }: { data: MonthlyData[]; currency: string }) {
    if (data.every((d) => d.income === 0 && d.expense === 0)) {
        return (
            <div className="flex items-center justify-center h-52 text-zinc-400 text-xs font-semibold">
                Belum ada data transaksi.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barCategoryGap="35%" barGap={4}>
                <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="3 3" />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tickFormatter={(v) => `${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'k'}`}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={45}
                />
                <Tooltip content={<MonthlyTooltip currency={currency} />} />
                <Bar dataKey="income" fill="#004C29" radius={[4, 4, 0, 0]} name="income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="expense" />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ── Category Donut Chart ───────────────────────────────────────────────────

function CategoryTooltip({ active, payload, currency }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-xl px-3.5 py-2 text-xs shadow-none">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>{d.emoji}</span> <span>{d.name}</span>
            </p>
            <p className="font-mono font-bold text-zinc-700 dark:text-zinc-300 mt-1">{formatCurrency(d.value, currency)}</p>
        </div>
    );
}

export function CategoryDonutChart({
    data,
    currency,
}: {
    data: CategoryData[];
    currency: string;
}) {
    const total = data.reduce((s, d) => s + d.value, 0);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-52 text-zinc-400 text-xs font-semibold">
                Belum ada pengeluaran pada periode ini.
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <ResponsiveContainer width={180} height={180}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CategoryTooltip currency={currency} />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex-1 space-y-2 w-full">
                {data.slice(0, 6).map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate flex-1">
                            {d.emoji} {d.name}
                        </span>
                        <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 shrink-0">
                            {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
