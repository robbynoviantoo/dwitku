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
  ChevronRight,
  Plus,
  Building2,
  BarChart2,
  Sun,
  Moon,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { usePrivacy } from "@/components/providers/privacy-provider";

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

// ── NavLink helper ──────────────────────────────────────────────────────────
function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={
        active
          ? { backgroundColor: "var(--sidebar-item-bg-active)", color: "var(--sidebar-text-active)" }
          : { color: "var(--sidebar-text)" }
      }
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
        collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5",
        !active && "hover:bg-[var(--sidebar-item-bg-hover)]",
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

// ── Desktop Sidebar ─────────────────────────────────────────────────────────
function DesktopSidebar({
  workspaces,
  personalWorkspace,
  user,
  pathname,
  activeWsId,
}: {
  workspaces: Workspace[];
  personalWorkspace: Workspace;
  user: UserInfo;
  pathname: string;
  activeWsId: string | null;
}) {
  const { collapsed, toggleCollapsed } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { showAmount, toggleShowAmount } = usePrivacy();
  const isPersonalContext = !activeWsId || activeWsId === personalWorkspace.id;

  const [expandedWs, setExpandedWs] = useState<string | null>(() => {
    if (activeWsId && activeWsId !== personalWorkspace.id) return activeWsId;
    return null;
  });

  return (
    <aside
      style={{
        width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
        backgroundColor: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
      className="hidden md:flex flex-col h-full fixed left-0 top-0 z-50 overflow-hidden"
    >
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--sidebar-border)" }} className="shrink-0 py-3 px-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div style={{ backgroundColor: "var(--sidebar-logo-bg)" }} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0">
              D
            </div>
            <button onClick={toggleCollapsed} style={{ color: "var(--sidebar-text)" }} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-item-bg-hover)] transition-colors" title="Perluas Sidebar">
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div style={{ backgroundColor: "var(--sidebar-logo-bg)" }} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0">
                D
              </div>
              <span style={{ color: "var(--sidebar-text-header)" }} className="font-bold text-lg tracking-tight">DWITKU</span>
            </div>
            <button onClick={toggleCollapsed} style={{ color: "var(--sidebar-text)" }} className="p-1.5 rounded-lg cursor-pointer hover:bg-[var(--sidebar-item-bg-hover)] transition-colors shrink-0" title="Kecilkan Sidebar">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5 px-2">
        <section>
          {!collapsed && (
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <BookOpen className="w-3 h-3" style={{ color: "var(--sidebar-section-label)" }} />
              <p style={{ color: "var(--sidebar-section-label)" }} className="text-[10px] font-bold uppercase tracking-widest">Catatan Pribadi</p>
            </div>
          )}
          {collapsed && <div className="border-t mx-2 mb-2" style={{ borderColor: "var(--sidebar-border)" }} />}
          <div className="space-y-0.5">
            {PERSONAL_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={`${item.href}?workspaceId=${personalWorkspace.id}`}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href && isPersonalContext}
                collapsed={collapsed}
              />
            ))}
          </div>
        </section>

        <section>
          {!collapsed ? (
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3" style={{ color: "var(--sidebar-section-label)" }} />
                <p style={{ color: "var(--sidebar-section-label)" }} className="text-[10px] font-bold uppercase tracking-widest">Workspace</p>
              </div>
              <Link href="/onboarding" title="Buat workspace baru" style={{ color: "var(--sidebar-section-label)" }} className="p-0.5 rounded transition-colors hover:bg-[var(--sidebar-item-bg-hover)]">
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="border-t mx-2 w-8" style={{ borderColor: "var(--sidebar-border)" }} />
              <Link href="/onboarding" title="Buat workspace baru" style={{ color: "var(--sidebar-text)" }} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--sidebar-item-bg-hover)] transition-colors">
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          )}

          {workspaces.length === 0 && !collapsed && (
            <div className="px-3 py-2">
              <p className="text-xs italic leading-relaxed" style={{ color: "var(--sidebar-section-label)" }}>Belum ada workspace bersama.</p>
              <Link href="/onboarding" className="text-xs mt-1 inline-block" style={{ color: "var(--accent)" }}>+ Buat workspace</Link>
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
                      onClick={() => { if (!collapsed) setExpandedWs(isOpen ? null : ws.id); }}
                      title={collapsed ? ws.name : undefined}
                      style={isActiveWs ? { backgroundColor: "var(--sidebar-item-bg-hover)" } : { color: "var(--sidebar-text)" }}
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-xl text-sm transition-colors text-left hover:bg-[var(--sidebar-item-bg-hover)]",
                        collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2",
                      )}
                    >
                      <div
                        style={isActiveWs ? { backgroundColor: "var(--accent)", color: "#fff" } : { backgroundColor: "var(--sidebar-icon-ws-bg)", color: "var(--sidebar-icon-ws-text)" }}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                      >
                        {getInitials(ws.name)}
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate font-medium">{ws.name}</span>
                          <ChevronDown style={{ color: "var(--sidebar-section-label)", transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform 0.2s ease" }} className="w-3.5 h-3.5 shrink-0" />
                        </>
                      )}
                    </button>
                    {isOpen && !collapsed && (
                      <div className="ml-4 pl-3 mt-1 mb-1 space-y-0.5" style={{ borderLeft: "1px solid var(--sidebar-border)" }}>
                        {WORKSPACE_NAV.map((item) => {
                          const Icon = item.icon;
                          const href = `${item.href}?workspaceId=${ws.id}`;
                          const active = pathname === item.href && activeWsId === ws.id;
                          return (
                            <Link key={item.href} href={href} style={active ? { backgroundColor: "var(--sidebar-item-bg-active)", color: "var(--sidebar-text-active)" } : { color: "var(--sidebar-text)" }} className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors", !active && "hover:bg-[var(--sidebar-item-bg-hover)]", active && "font-medium")}>
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

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--sidebar-border)" }} className="shrink-0 py-2 px-2 space-y-1">
        {/* Privacy toggle */}
        <button
          onClick={toggleShowAmount}
          title={showAmount ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          style={{ color: "var(--sidebar-text)" }}
          className={cn(
            "w-full flex items-center cursor-pointer gap-3 rounded-xl text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]",
            collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2",
          )}
        >
          {showAmount ? <EyeOff className="w-4 h-4 shrink-0" /> : <Eye className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{showAmount ? "Sembunyikan Saldo" : "Tampilkan Saldo"}</span>}
        </button>
        <button onClick={toggleTheme} title={theme === "dark" ? "Mode Terang" : "Mode Gelap"} style={{ color: "var(--sidebar-text)" }} className={cn("w-full flex items-center cursor-pointer gap-3 rounded-xl text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]", collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2")}>
          {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{theme === "dark" ? "Mode Terang" : "Mode Gelap"}</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div style={{ backgroundColor: "var(--accent)" }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">{getInitials(user.name)}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--sidebar-text-header)" }}>{user.name ?? "Pengguna"}</p>
              <p className="text-xs truncate" style={{ color: "var(--sidebar-user-meta)" }}>{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={() => signOut({ callbackUrl: "/login" })} title={collapsed ? "Keluar" : undefined} style={{ color: "var(--sidebar-text)" }} className={cn("w-full flex cursor-pointer items-center gap-3 rounded-xl text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]", collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2")}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Keluar"}
        </button>
      </div>
    </aside>
  );
}

// ── Mobile Sidebar (bottom sheet drawer from left) ──────────────────────────
function MobileSidebar({
  workspaces,
  personalWorkspace,
  user,
  pathname,
  activeWsId,
}: {
  workspaces: Workspace[];
  personalWorkspace: Workspace;
  user: UserInfo;
  pathname: string;
  activeWsId: string | null;
}) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { showAmount, toggleShowAmount } = usePrivacy();
  const isPersonalContext = !activeWsId || activeWsId === personalWorkspace.id;

  const [expandedWs, setExpandedWs] = useState<string | null>(() => {
    if (activeWsId && activeWsId !== personalWorkspace.id) return activeWsId;
    return null;
  });

  const close = () => setMobileOpen(false);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={cn(
          "md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "md:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[82vw] max-w-sm shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ backgroundColor: "var(--sidebar-bg)" }}
      >
        {/* Drawer header — user profile */}
        <div
          className="shrink-0 px-5 pt-12 pb-5 relative"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)" }}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30 shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white bg-white/20 ring-2 ring-white/30 shrink-0">
                {getInitials(user.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-base font-bold text-white truncate">{user.name ?? "Pengguna"}</p>
              <p className="text-xs text-white/60 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Nav content — scrollable, background does NOT scroll */}
        <nav className="flex-1 overflow-y-auto overscroll-contain py-4 px-3 space-y-1">
          {/* Section: Pribadi */}
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest mb-2 mt-1" style={{ color: "var(--sidebar-section-label)" }}>
            Catatan Pribadi
          </p>
          {PERSONAL_NAV.map((item) => {
            const Icon = item.icon;
            const href = `${item.href}?workspaceId=${personalWorkspace.id}`;
            const active = pathname === item.href && isPersonalContext;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors", active ? "bg-white/20" : "bg-zinc-100 dark:bg-zinc-800")}>
                  <Icon className={cn("w-4 h-4", active ? "text-white" : "text-zinc-500")} />
                </div>
                <span>{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto text-white/60" />}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t" style={{ borderColor: "var(--sidebar-border)" }} />

          {/* Section: Workspace */}
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--sidebar-section-label)" }}>Workspace</p>
            <Link href="/onboarding" onClick={close} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
              <Plus className="w-3.5 h-3.5" />
              Buat
            </Link>
          </div>

          {workspaces.length === 0 ? (
            <div className="px-3 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-center">
              <Building2 className="w-6 h-6 mx-auto mb-1.5 text-zinc-300" />
              <p className="text-xs text-zinc-500">Belum ada workspace bersama</p>
              <Link href="/onboarding" onClick={close} className="text-xs mt-1 inline-block text-indigo-600 font-medium">+ Buat sekarang</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {workspaces.map((ws) => {
                const isOpen = expandedWs === ws.id;
                const isActiveWs = activeWsId === ws.id;
                return (
                  <div key={ws.id}>
                    <button
                      onClick={() => setExpandedWs(isOpen ? null : ws.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                        isActiveWs ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={isActiveWs ? { backgroundColor: "var(--accent)", color: "#fff" } : { backgroundColor: "var(--sidebar-icon-ws-bg)", color: "var(--sidebar-icon-ws-text)" }}
                      >
                        {getInitials(ws.name)}
                      </div>
                      <span className="flex-1 truncate">{ws.name}</span>
                      <ChevronDown
                        className={cn("w-4 h-4 shrink-0 transition-transform", isOpen && "rotate-180")}
                        style={{ color: "var(--sidebar-section-label)" }}
                      />
                    </button>

                    {/* Sub-nav */}
                    <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                      <div className="ml-4 pl-3 py-1 space-y-0.5" style={{ borderLeft: "2px solid var(--sidebar-border)" }}>
                        {WORKSPACE_NAV.map((item) => {
                          const Icon = item.icon;
                          const href = `${item.href}?workspaceId=${ws.id}`;
                          const active = pathname === item.href && activeWsId === ws.id;
                          return (
                            <Link
                              key={item.href}
                              href={href}
                              onClick={close}
                              className={cn(
                                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                                active
                                  ? "bg-indigo-600 text-white font-medium"
                                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                              )}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer — theme toggle + logout */}
        <div className="shrink-0 px-3 py-4 space-y-1 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          {/* Privacy toggle */}
          <button
            onClick={toggleShowAmount}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              showAmount
                ? "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                : "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100",
            )}
          >
            {showAmount
              ? <EyeOff className="w-4 h-4 shrink-0" />
              : <Eye className="w-4 h-4 shrink-0" />}
            {showAmount ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          </button>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────
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
  const { setMobileOpen } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams, setMobileOpen]);

  const sharedProps = { workspaces, personalWorkspace, user, pathname, activeWsId };

  return (
    <>
      <DesktopSidebar {...sharedProps} />
      <MobileSidebar {...sharedProps} />
    </>
  );
}
