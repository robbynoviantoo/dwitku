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
        <div className="bg-white border border-zinc-200 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-semibold text-zinc-700 mb-2">{label}</p>
            {payload.map((p: any) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
                    <span className="text-zinc-500 capitalize">{p.name === "income" ? "Pemasukan" : "Pengeluaran"}:</span>
                    <span className="font-medium">{formatCurrency(p.value, currency)}</span>
                </div>
            ))}
        </div>
    );
}

export function MonthlyBarChart({ data, currency }: { data: MonthlyData[]; currency: string }) {
    if (data.every((d) => d.income === 0 && d.expense === 0)) {
        return (
            <div className="flex items-center justify-center h-52 text-zinc-400 text-sm">
                Belum ada data transaksi.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barCategoryGap="35%" barGap={4}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#a1a1aa" }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tickFormatter={(v) => `${v / 1000}K`}
                    tick={{ fontSize: 11, fill: "#a1a1aa" }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                />
                <Tooltip content={<MonthlyTooltip currency={currency} />} />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="income" />
                <Bar dataKey="expense" fill="#f97316" radius={[4, 4, 0, 0]} name="expense" />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ── Category Donut Chart ───────────────────────────────────────────────────

function CategoryTooltip({ active, payload, currency }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-semibold text-zinc-700">
                {d.emoji} {d.name}
            </p>
            <p className="text-zinc-500 mt-1">{formatCurrency(d.value, currency)}</p>
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
            <div className="flex items-center justify-center h-52 text-zinc-400 text-sm">
                Belum ada pengeluaran bulan ini.
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
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
            <div className="flex-1 space-y-2">
                {data.slice(0, 6).map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-xs text-zinc-500 truncate flex-1">
                            {d.emoji} {d.name}
                        </span>
                        <span className="text-xs font-medium text-zinc-700 shrink-0">
                            {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
