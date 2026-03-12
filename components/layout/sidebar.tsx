"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Tag,
    Settings,
    Users,
    LogOut,
    ChevronDown,
    Plus,
    Building2,
    BookOpen,
    BarChart2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";
import { useState } from "react";

type Workspace = {
    id: string;
    name: string;
    currency: string;
    isPersonal: boolean;
    role: string;
};

type UserInfo = {
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

// Nav items untuk Catatan Pribadi
const PERSONAL_NAV = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
    { href: "/categories", label: "Kategori", icon: Tag },
    { href: "/reports", label: "Laporan", icon: BarChart2 },
];

// Nav items untuk tiap Workspace (akan ditambah ?workspaceId=...)
const WORKSPACE_NAV = [
    { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
    { href: "/categories", label: "Kategori", icon: Tag },
    { href: "/reports", label: "Laporan", icon: BarChart2 },
    { href: "/settings", label: "Pengaturan", icon: Settings },
    { href: "/settings/members", label: "Anggota", icon: Users },
];

export function Sidebar({
    workspaces,
    personalWorkspace,
    user,
}: {
    workspaces: Workspace[];        // hanya non-personal
    personalWorkspace: Workspace;   // workspace pribadi
    user: UserInfo;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeWsId = searchParams.get("workspaceId");

    // Apakah sedang di konteks personal (tidak ada workspaceId, atau workspaceId = personal)
    const isPersonalContext =
        !activeWsId || activeWsId === personalWorkspace.id;

    const [expandedWs, setExpandedWs] = useState<string | null>(() => {
        // Auto-expand workspace yang sedang aktif
        if (activeWsId && activeWsId !== personalWorkspace.id) return activeWsId;
        return null;
    });

    return (
        <aside className="w-64 bg-zinc-900 text-white flex flex-col h-full fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm shrink-0">
                        D
                    </div>
                    <span className="font-bold text-lg tracking-tight">Dwitku</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

                {/* ── CATATAN PRIBADI ───────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-1.5 px-2 mb-2">
                        <BookOpen className="w-3 h-3 text-zinc-500" />
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Catatan Pribadi
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        {PERSONAL_NAV.map((item) => {
                            const Icon = item.icon;
                            const href = `${item.href}?workspaceId=${personalWorkspace.id}`;
                            // Active: path cocok DAN konteks personal
                            const active = pathname === item.href && isPersonalContext;
                            return (
                                <Link
                                    key={item.href}
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        active
                                            ? "bg-indigo-600 text-white"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    )}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* ── WORKSPACE ────────────────────────────────────── */}
                <section>
                    <div className="flex items-center justify-between px-2 mb-2">
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-zinc-500" />
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                Workspace
                            </p>
                        </div>
                        <Link
                            href="/onboarding"
                            title="Buat workspace baru"
                            className="p-0.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {workspaces.length === 0 ? (
                        <div className="px-3 py-2">
                            <p className="text-xs text-zinc-600 italic leading-relaxed">
                                Belum ada workspace bersama.
                            </p>
                            <Link
                                href="/onboarding"
                                className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block"
                            >
                                + Buat workspace
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {workspaces.map((ws) => {
                                const isOpen = expandedWs === ws.id;
                                // Workspace ini aktif jika workspaceId di URL = ws.id
                                const isActiveWs = activeWsId === ws.id;

                                return (
                                    <div key={ws.id}>
                                        {/* Header workspace */}
                                        <button
                                            onClick={() => setExpandedWs(isOpen ? null : ws.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                                                isActiveWs
                                                    ? "bg-zinc-800 text-white"
                                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                                                isActiveWs ? "bg-indigo-500 text-white" : "bg-zinc-700 text-zinc-300"
                                            )}>
                                                {getInitials(ws.name)}
                                            </div>
                                            <span className="flex-1 truncate font-medium">{ws.name}</span>
                                            <ChevronDown
                                                className={cn(
                                                    "w-3.5 h-3.5 shrink-0 transition-transform text-zinc-500",
                                                    isOpen && "rotate-180"
                                                )}
                                            />
                                        </button>

                                        {/* Sub-nav workspace */}
                                        {isOpen && (
                                            <div className="ml-4 pl-3 border-l border-zinc-800 mt-1 mb-1 space-y-0.5">
                                                {WORKSPACE_NAV.map((item) => {
                                                    const Icon = item.icon;
                                                    const href = `${item.href}?workspaceId=${ws.id}`;
                                                    // Active: path cocok DAN workspaceId di URL = ws.id
                                                    const active = pathname === item.href && activeWsId === ws.id;
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={href}
                                                            className={cn(
                                                                "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                                                                active
                                                                    ? "bg-indigo-600 text-white font-medium"
                                                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                            )}
                                                        >
                                                            <Icon className="w-3.5 h-3.5 shrink-0" />
                                                            {item.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </nav>

            {/* User info + Logout */}
            <div className="px-3 py-3 border-t border-zinc-800">
                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                    {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(user.name)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name ?? "Pengguna"}</p>
                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Keluar
                </button>
            </div>
        </aside>
    );
}
