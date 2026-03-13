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
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";
import { useState } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useEffect } from "react";

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

const PERSONAL_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/categories", label: "Kategori", icon: Tag },
  { href: "/reports", label: "Laporan", icon: BarChart2 },
];

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
  workspaces: Workspace[];
  personalWorkspace: Workspace;
  user: UserInfo;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeWsId = searchParams.get("workspaceId");
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams, setMobileOpen]);

  const isPersonalContext = !activeWsId || activeWsId === personalWorkspace.id;

  const [expandedWs, setExpandedWs] = useState<string | null>(() => {
    if (activeWsId && activeWsId !== personalWorkspace.id) return activeWsId;
    return null;
  });

  return (
    <>
      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        style={{
          width: collapsed
            ? "var(--sidebar-collapsed-width)"
            : "var(--sidebar-width)",
          backgroundColor: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          transition:
            "width 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        className={cn(
          "flex flex-col h-full fixed left-0 top-0 z-50 overflow-hidden",
          "md:translate-x-0 transition-transform duration-250",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* ── Header: Logo + Toggle ── */}
        <div
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
          className="shrink-0 py-3 px-2"
        >
          {collapsed ? (
            /* Collapsed mode: logo + toggle stacked vertically */
            <div className="flex flex-col items-center gap-2">
              <div
                style={{ backgroundColor: "var(--sidebar-logo-bg)" }}
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0"
              >
                D
              </div>
              <button
                onClick={toggleCollapsed}
                style={{ color: "var(--sidebar-text)" }}
                className="p-1.5 rounded-lg hover:bg-[var(--sidebar-item-bg-hover)] transition-colors"
                title="Perluas Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Expanded mode: logo on left, toggle on right */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  style={{ backgroundColor: "var(--sidebar-logo-bg)" }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0"
                >
                  D
                </div>
                <span
                  style={{ color: "var(--sidebar-text-header)" }}
                  className="font-bold text-lg tracking-tight"
                >
                  DWITKU
                </span>
              </div>
              <button
                onClick={toggleCollapsed}
                style={{ color: "var(--sidebar-text)" }}
                className="p-1.5 rounded-lg cursor-pointer hover:bg-[var(--sidebar-item-bg-hover)] transition-colors shrink-0"
                title="Kecilkan Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5 px-2">
          {/* CATATAN PRIBADI */}
          <section>
            {!collapsed && (
              <div className="flex items-center gap-1.5 px-2 mb-2">
                <BookOpen
                  className="w-3 h-3"
                  style={{ color: "var(--sidebar-section-label)" }}
                />
                <p
                  style={{ color: "var(--sidebar-section-label)" }}
                  className="text-[10px] font-bold uppercase tracking-widest"
                >
                  Catatan Pribadi
                </p>
              </div>
            )}
            {collapsed && (
              <div
                className="border-t mx-2 mb-2"
                style={{ borderColor: "var(--sidebar-border)" }}
              />
            )}

            <div className="space-y-0.5">
              {PERSONAL_NAV.map((item) => {
                const Icon = item.icon;
                const href = `${item.href}?workspaceId=${personalWorkspace.id}`;
                const active = pathname === item.href && isPersonalContext;
                return (
                  <Link
                    key={item.href}
                    href={href}
                    title={collapsed ? item.label : undefined}
                    style={
                      active
                        ? {
                          backgroundColor: "var(--sidebar-item-bg-active)",
                          color: "var(--sidebar-text-active)",
                        }
                        : { color: "var(--sidebar-text)" }
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                      collapsed
                        ? "justify-center w-10 h-10 mx-auto"
                        : "px-3 py-2",
                      !active && "hover:bg-[var(--sidebar-item-bg-hover)]",
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* WORKSPACE */}
          <section>
            {!collapsed ? (
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Building2
                    className="w-3 h-3"
                    style={{ color: "var(--sidebar-section-label)" }}
                  />
                  <p
                    style={{ color: "var(--sidebar-section-label)" }}
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    Workspace
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  title="Buat workspace baru"
                  style={{ color: "var(--sidebar-section-label)" }}
                  className="p-0.5 rounded transition-colors hover:bg-[var(--sidebar-item-bg-hover)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div
                  className="border-t mx-2 w-8"
                  style={{ borderColor: "var(--sidebar-border)" }}
                />
                <Link
                  href="/onboarding"
                  title="Buat workspace baru"
                  style={{ color: "var(--sidebar-text)" }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--sidebar-item-bg-hover)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            )}

            {workspaces.length === 0 && !collapsed && (
              <div className="px-3 py-2">
                <p
                  className="text-xs italic leading-relaxed"
                  style={{ color: "var(--sidebar-section-label)" }}
                >
                  Belum ada workspace bersama.
                </p>
                <Link
                  href="/onboarding"
                  className="text-xs mt-1 inline-block"
                  style={{ color: "var(--accent)" }}
                >
                  + Buat workspace
                </Link>
              </div>
            )}

            {workspaces.length > 0 && (
              <div className="space-y-1">
                {workspaces.map((ws) => {
                  const isOpen = expandedWs === ws.id;
                  const isActiveWs = activeWsId === ws.id;

                  return (
                    <div key={ws.id}>
                      <button
                        onClick={() => {
                          if (!collapsed) setExpandedWs(isOpen ? null : ws.id);
                        }}
                        title={collapsed ? ws.name : undefined}
                        style={
                          isActiveWs
                            ? {
                              backgroundColor: "var(--sidebar-item-bg-hover)",
                            }
                            : { color: "var(--sidebar-text)" }
                        }
                        className={cn(
                          "w-full flex items-center gap-2.5 rounded-lg text-sm  transition-colors text-left hover:bg-[var(--sidebar-item-bg-hover)]",
                          collapsed
                            ? "justify-center w-10 h-10 mx-auto"
                            : "px-3 py-2",
                        )}
                      >
                        <div
                          style={
                            isActiveWs
                              ? {
                                backgroundColor: "var(--accent)",
                                color: "#fff",
                              }
                              : {
                                backgroundColor: "var(--sidebar-icon-ws-bg)",
                                color: "var(--sidebar-icon-ws-text)",
                              }
                          }
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                        >
                          {getInitials(ws.name)}
                        </div>
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate font-medium">
                              {ws.name}
                            </span>
                            <ChevronDown
                              style={{
                                color: "var(--sidebar-section-label)",
                                transform: isOpen ? "rotate(180deg)" : undefined,
                                transition: "transform 0.2s ease",
                              }}
                              className="w-3.5 h-3.5 shrink-0"
                            />
                          </>
                        )}
                      </button>

                      {isOpen && !collapsed && (
                        <div
                          className="ml-4 pl-3 mt-1 mb-1 space-y-0.5"
                          style={{
                            borderLeft: "1px solid var(--sidebar-border)",
                          }}
                        >
                          {WORKSPACE_NAV.map((item) => {
                            const Icon = item.icon;
                            const href = `${item.href}?workspaceId=${ws.id}`;
                            const active =
                              pathname === item.href && activeWsId === ws.id;
                            return (
                              <Link
                                key={item.href}
                                href={href}
                                style={
                                  active
                                    ? {
                                      backgroundColor:
                                        "var(--sidebar-item-bg-active)",
                                      color: "var(--sidebar-text-active)",
                                    }
                                    : { color: "var(--sidebar-text)" }
                                }
                                className={cn(
                                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                                  !active &&
                                  "hover:bg-[var(--sidebar-item-bg-hover)]",
                                  active && "font-medium",
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

        {/* ── Footer: Theme toggle + User + Logout ── */}
        <div
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
          className="shrink-0 py-2 px-2 space-y-1"
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            style={{ color: "var(--sidebar-text)" }}
            className={cn(
              "w-full flex items-center cursor-pointer gap-3 rounded-lg text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]",
              collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2",
            )}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 shrink-0" />
            )}
            {!collapsed && (
              <span>{theme === "dark" ? "Mode Terang" : "Mode Gelap"}</span>
            )}
          </button>

          {/* User info (expanded only) */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  style={{ backgroundColor: "var(--accent)" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                >
                  {getInitials(user.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--sidebar-text-header)" }}
                >
                  {user.name ?? "Pengguna"}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--sidebar-user-meta)" }}
                >
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={collapsed ? "Keluar" : undefined}
            style={{ color: "var(--sidebar-text)" }}
            className={cn(
              "w-full flex cursor-pointer items-center gap-3 rounded-lg text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]",
              collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2",
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && "Keluar"}
          </button>
        </div>
      </aside>
    </>
  );
}
