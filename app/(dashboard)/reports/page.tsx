import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { getTransactionSummary } from "@/app/actions/transaction";
import { getMonthlyChart, getCategoryChart, getMonthComparison } from "@/app/actions/report";
import { MonthlyBarChart, CategoryDonutChart } from "@/components/reports/charts";
import { formatCurrency } from "@/lib/utils";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    BarChart2,
} from "lucide-react";

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
    if (previous === 0) return null;
    const pct = Math.round(((current - previous) / Math.abs(previous)) * 100);
    const up = pct >= 0;
    return (
        <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-green-600" : "text-red-500"
                }`}
        >
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(pct)}% vs bln lalu
        </span>
    );
}

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ workspaceId?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { workspaceId } = await searchParams;
    const allWorkspaces = await getUserWorkspaces();
    if (allWorkspaces.length === 0) redirect("/dashboard");

    const personalWs = allWorkspaces.find((w) => w.isPersonal) ?? allWorkspaces[0];
    const activeWs = workspaceId
        ? (allWorkspaces.find((w) => w.id === workspaceId) ?? personalWs)
        : personalWs;

    const [summary, monthlyData, categoryData, comparison] = await Promise.all([
        getTransactionSummary(activeWs.id),
        getMonthlyChart(activeWs.id),
        getCategoryChart(activeWs.id),
        getMonthComparison(activeWs.id),
    ]);

    const currency = activeWs.currency;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                    <BarChart2 className="w-6 h-6 text-indigo-500" />
                    Laporan Keuangan
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Ringkasan dan analisis keuangan{" "}
                    {activeWs.isPersonal ? "pribadi" : `workspace "${activeWs.name}"`}.
                </p>
            </div>

            {/* Summary + Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    {
                        label: "Total Pemasukan",
                        value: summary.income,
                        current: comparison?.current.income ?? 0,
                        previous: comparison?.previous.income ?? 0,
                        icon: TrendingUp,
                        color: "text-green-600",
                        bg: "bg-green-50 border-green-100",
                        iconBg: "bg-green-100",
                    },
                    {
                        label: "Total Pengeluaran",
                        value: summary.expense,
                        current: comparison?.current.expense ?? 0,
                        previous: comparison?.previous.expense ?? 0,
                        icon: TrendingDown,
                        color: "text-red-500",
                        bg: "bg-red-50 border-red-100",
                        iconBg: "bg-red-100",
                    },
                    {
                        label: "Saldo Bersih",
                        value: summary.net,
                        current: comparison?.current.net ?? 0,
                        previous: comparison?.previous.net ?? 0,
                        icon: Wallet,
                        color: summary.net >= 0 ? "text-indigo-600" : "text-red-500",
                        bg: "bg-indigo-50 border-indigo-100",
                        iconBg: "bg-indigo-100",
                    },
                ].map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`bg-white rounded-xl border shadow-sm p-5 ${card.bg}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                                <p className="text-sm font-medium text-zinc-600">{card.label}</p>
                            </div>
                            <p className={`text-2xl font-bold mb-1 ${card.color}`}>
                                {formatCurrency(card.value, currency)}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <p className="text-xs text-zinc-400">Bulan ini:</p>
                                <p className="text-xs font-medium text-zinc-600">
                                    {formatCurrency(card.current, currency)}
                                </p>
                                <ChangeIndicator current={card.current} previous={card.previous} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                {/* Monthly Bar Chart — 3/5 width */}
                <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-semibold text-zinc-900 text-sm">Pemasukan vs Pengeluaran</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">6 bulan terakhir</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />
                                Pemasukan
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" />
                                Pengeluaran
                            </span>
                        </div>
                    </div>
                    <MonthlyBarChart data={monthlyData} currency={currency} />
                </div>

                {/* Category Donut — 2/5 width */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
                    <div className="mb-5">
                        <h2 className="font-semibold text-zinc-900 text-sm">Pengeluaran per Kategori</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Bulan ini</p>
                    </div>
                    <CategoryDonutChart data={categoryData} currency={currency} />
                </div>
            </div>

            {/* Month Comparison Table */}
            {comparison && (
                <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
                    <h2 className="font-semibold text-zinc-900 text-sm mb-5">Perbandingan Bulan Ini vs Bulan Lalu</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className="text-left py-2 text-xs text-zinc-500 font-medium w-40">Metrik</th>
                                    <th className="text-right py-2 text-xs text-zinc-500 font-medium">Bulan Ini</th>
                                    <th className="text-right py-2 text-xs text-zinc-500 font-medium">Bulan Lalu</th>
                                    <th className="text-right py-2 text-xs text-zinc-500 font-medium">Perubahan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: "Pemasukan", cur: comparison.current.income, prev: comparison.previous.income, colorClass: "text-green-600" },
                                    { label: "Pengeluaran", cur: comparison.current.expense, prev: comparison.previous.expense, colorClass: "text-red-500" },
                                    { label: "Saldo Bersih", cur: comparison.current.net, prev: comparison.previous.net, colorClass: comparison.current.net >= 0 ? "text-indigo-600" : "text-red-500" },
                                ].map((row) => {
                                    const diff = row.cur - row.prev;
                                    const pct = row.prev !== 0 ? Math.round((diff / Math.abs(row.prev)) * 100) : null;
                                    return (
                                        <tr key={row.label} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                                            <td className="py-3 font-medium text-zinc-700">{row.label}</td>
                                            <td className={`py-3 text-right font-semibold ${row.colorClass}`}>
                                                {formatCurrency(row.cur, currency)}
                                            </td>
                                            <td className="py-3 text-right text-zinc-400">
                                                {formatCurrency(row.prev, currency)}
                                            </td>
                                            <td className="py-3 text-right">
                                                {pct !== null ? (
                                                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                                                        {diff >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        {Math.abs(pct)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-zinc-300 flex items-center justify-end gap-0.5">
                                                        <Minus className="w-3 h-3" /> —
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
