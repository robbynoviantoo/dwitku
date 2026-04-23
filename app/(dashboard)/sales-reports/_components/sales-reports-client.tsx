"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getSalesSummary, getSalesReport } from "@/app/actions/sale";
import { formatCurrency } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { TrendingUp, Wallet, Receipt, ShoppingBag, BarChart3 } from "lucide-react";
import { useState } from "react";

export function SalesReportsClient() {
    const searchParams = useSearchParams();
    const workspaceId = searchParams.get("workspaceId") ?? "";
    const { showAmount } = usePrivacy();
    const [months, setMonths] = useState(6);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const { data: summary } = useQuery({
        queryKey: ["sales-summary", workspaceId, dateFrom, dateTo],
        queryFn: () => getSalesSummary(workspaceId, dateFrom || undefined, dateTo || undefined),
        enabled: !!workspaceId,
    });

    const { data: chartData = [] } = useQuery({
        queryKey: ["sales-chart", workspaceId, months],
        queryFn: () => getSalesReport(workspaceId, months),
        enabled: !!workspaceId,
    });

    const currency = "IDR";

    const summaryCards = [
        {
            label: "Omzet", sublabel: "Total pendapatan kotor",
            value: summary?.omzet ?? 0, icon: <TrendingUp className="w-5 h-5" />,
            bg: "bg-green-50", text: "text-green-700", iconBg: "bg-green-100",
        },
        {
            label: "HPP Total", sublabel: "Harga pokok penjualan",
            value: summary?.hpp ?? 0, icon: <Receipt className="w-5 h-5" />,
            bg: "bg-orange-50", text: "text-orange-700", iconBg: "bg-orange-100",
        },
        {
            label: "Laba Kotor", sublabel: "Omzet - HPP",
            value: summary?.labaKotor ?? 0, icon: <Wallet className="w-5 h-5" />,
            bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100",
        },
        {
            label: "Biaya Operasional", sublabel: "Total biaya ops",
            value: summary?.biayaOperasional ?? 0, icon: <Receipt className="w-5 h-5" />,
            bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100",
        },
        {
            label: "Laba Bersih", sublabel: "Laba Kotor - Biaya Ops",
            value: summary?.labaBersih ?? 0, icon: <ShoppingBag className="w-5 h-5" />,
            bg: (summary?.labaBersih ?? 0) >= 0 ? "bg-blue-50" : "bg-red-50",
            text: (summary?.labaBersih ?? 0) >= 0 ? "text-blue-700" : "text-red-600",
            iconBg: (summary?.labaBersih ?? 0) >= 0 ? "bg-blue-100" : "bg-red-100",
        },
    ];

    // Find max value for chart scaling
    const maxChartVal = Math.max(...chartData.map(d => Math.max(d.omzet, d.labaBersih)), 1);

    if (!workspaceId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
                <BarChart3 className="w-12 h-12 text-zinc-200 mb-4" />
                <h2 className="text-lg font-bold text-zinc-700 mb-1">Pilih workspace terlebih dahulu</h2>
                <p className="text-sm text-zinc-400">Pilih workspace penjualan untuk melihat laporan.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900">Laporan Penjualan</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">Ringkasan omzet, laba kotor, dan laba bersih</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="text-sm px-3 py-2 border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <span className="self-center text-zinc-400 text-xs">s/d</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="text-sm px-3 py-2 border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                    {(dateFrom || dateTo) && (
                        <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-500 hover:text-red-600 px-2">Reset</button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {summaryCards.map((card) => (
                    <div key={card.label} className={`${card.bg} rounded-2xl p-5 space-y-3`}>
                        <div className={`${card.iconBg} w-9 h-9 rounded-xl flex items-center justify-center ${card.text}`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">{card.sublabel}</p>
                            <p className={`text-xl font-bold mt-0.5 ${card.text}`}>
                                {showAmount ? formatCurrency(card.value, currency) : "••••••"}
                            </p>
                            <p className="text-xs font-semibold text-zinc-600 mt-1">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Profit Formula Breakdown */}
            {summary && (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                    <h2 className="font-semibold text-zinc-900 mb-4">Rincian Perhitungan</h2>
                    <div className="space-y-3">
                        {[
                            { label: "Omzet", formula: "= Σ (Harga Jual × Qty)", value: summary.omzet, color: "text-green-700" },
                            { label: "― HPP Total", formula: "= Σ (HPP × Qty)", value: -summary.hpp, color: "text-orange-600" },
                            { label: "= Laba Kotor", formula: "Omzet - HPP", value: summary.labaKotor, color: "text-emerald-700", divider: true },
                            { label: "― Biaya Operasional", formula: "", value: -summary.biayaOperasional, color: "text-red-600" },
                            { label: "= Laba Bersih", formula: "Laba Kotor - Biaya Ops", value: summary.labaBersih, color: summary.labaBersih >= 0 ? "text-blue-700" : "text-red-600", bold: true, divider: true },
                        ].map(({ label, formula, value, color, divider, bold }) => (
                            <div key={label}>
                                {divider && <div className="border-t border-zinc-100 my-1" />}
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <span className={`${bold ? "font-bold" : "font-medium"} ${color}`}>{label}</span>
                                        {formula && <span className="text-zinc-400 text-xs ml-2">{formula}</span>}
                                    </div>
                                    <span className={`${bold ? "font-bold text-base" : "font-semibold"} ${color}`}>
                                        {showAmount ? `${value >= 0 ? "" : ""}Rp ${Math.abs(value).toLocaleString("id-ID")}` : "••••••"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {summary.omzet > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-3 gap-3 text-center">
                            {[
                                { label: "Margin Kotor", value: `${((summary.labaKotor / summary.omzet) * 100).toFixed(1)}%` },
                                { label: "Margin Bersih", value: `${((summary.labaBersih / summary.omzet) * 100).toFixed(1)}%` },
                                { label: "Rasio HPP", value: `${((summary.hpp / summary.omzet) * 100).toFixed(1)}%` },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-zinc-50 rounded-xl p-3">
                                    <p className="text-xs text-zinc-400">{label}</p>
                                    <p className="text-base font-bold text-zinc-900 mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold text-zinc-900">Tren Bulanan</h2>
                        <select value={months} onChange={e => setMonths(Number(e.target.value))}
                            className="text-xs px-3 py-1.5 border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value={3}>3 Bulan</option>
                            <option value={6}>6 Bulan</option>
                            <option value={12}>12 Bulan</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-3 h-40 overflow-x-auto pb-2">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-1 min-w-[50px] flex flex-col items-center gap-1">
                                <div className="w-full flex items-end gap-0.5 h-28">
                                    <div
                                        className="flex-1 bg-green-200 rounded-t-md transition-all duration-500"
                                        style={{ height: `${(d.omzet / maxChartVal) * 100}%` }}
                                        title={`Omzet: Rp ${d.omzet.toLocaleString("id-ID")}`}
                                    />
                                    <div
                                        className={`flex-1 rounded-t-md transition-all duration-500 ${d.labaBersih >= 0 ? "bg-blue-400" : "bg-red-300"}`}
                                        style={{ height: `${(Math.abs(d.labaBersih) / maxChartVal) * 100}%` }}
                                        title={`Laba Bersih: Rp ${d.labaBersih.toLocaleString("id-ID")}`}
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-400 text-center leading-tight">{d.month}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> Omzet</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-400 inline-block" /> Laba Bersih</div>
                    </div>
                </div>
            )}
        </div>
    );
}
