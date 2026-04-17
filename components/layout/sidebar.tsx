"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutGrid,
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
  Eye,
  EyeOff,
  CreditCard,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { PushSubscriber } from "@/components/push-subscriber";
import * as Popover from "@radix-ui/react-popover";

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
  isAdmin?: boolean | null;
};

// Nav items when inside a workspace
const WORKSPACE_NAV = [
  { href: "/workspaces", label: "Ringkasan", icon: LayoutGrid },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/categories", label: "Kategori", icon: Tag },
  { href: "/reports", label: "Laporan", icon: BarChart2 },
  { href: "/settings", label: "Pengaturan", icon: Settings },
  { href: "/settings/members", label: "Anggota", icon: Users },
];

// Global nav (not workspace-specific)
const GLOBAL_NAV = [
  { href: "/billing", label: "Langganan", icon: CreditCard },
  { href: "/billing/history", label: "Riwayat Order", icon: ReceiptText },
];

import Swal from "sweetalert2";

// ── Desktop Sidebar ─────────────────────────────────────────────────────────
function DesktopSidebar({
  workspaces,
  user,
  pathname,
  activeWsId,
  isEmailVerified,
}: {
  workspaces: Workspace[];
  user: UserInfo;
  pathname: string;
  activeWsId: string | null;
  isEmailVerified?: boolean;
}) {
  const { collapsed, toggleCollapsed } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { showAmount, toggleShowAmount } = usePrivacy();
  const activeWs = workspaces.find((w) => w.id === activeWsId);

  const [expandedWs, setExpandedWs] = useState<string | null>(activeWsId);
  useEffect(() => { if (activeWsId) setExpandedWs(activeWsId); }, [activeWsId]);

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
            <img src="/icon-192.png" alt="Dwitku" className="w-9 h-9 rounded-xl shadow-sm object-cover" />
            <button onClick={toggleCollapsed} style={{ color: "var(--sidebar-text)" }} className="p-1.5 rounded-lg hover:bg-(--sidebar-item-bg-hover) transition-colors" title="Perluas Sidebar">
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Link href="/workspaces" className="flex items-center gap-2 min-w-0">
              <img src="/icon-192.png" alt="Dwitku" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
              <span style={{ color: "var(--sidebar-text-header)" }} className="font-bold text-lg tracking-tight">DWITKU</span>
            </Link>
            <button onClick={toggleCollapsed} style={{ color: "var(--sidebar-text)" }} className="p-1.5 rounded-lg cursor-pointer hover:bg-[var(--sidebar-item-bg-hover)] transition-colors shrink-0">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 px-2">
        {/* Workspace selector / list */}
        {!collapsed && (
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3 h-3" style={{ color: "var(--sidebar-section-label)" }} />
              <p style={{ color: "var(--sidebar-section-label)" }} className="text-[10px] font-bold uppercase tracking-widest">Workspace</p>
            </div>
            <Link href="/workspaces" style={{ color: "var(--sidebar-section-label)" }} className="p-0.5 rounded hover:bg-[var(--sidebar-item-bg-hover)] transition-colors" title="Semua workspace">
              <LayoutGrid className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
        {collapsed && <div className="border-t mx-2 mb-2" style={{ borderColor: "var(--sidebar-border)" }} />}

        {/* Workspace list */}
        <div className="space-y-1">
          {workspaces.map((ws) => {
            const isOpen = expandedWs === ws.id;
            const isActiveWs = activeWsId === ws.id;
            return (
              <div key={ws.id}>
                <Popover.Root>
                  {collapsed ? (
                    <Popover.Trigger asChild>
                      <button
                        title={ws.name}
                        style={isActiveWs ? { backgroundColor: "var(--sidebar-item-bg-hover)" } : { color: "var(--sidebar-text)" }}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl text-sm transition-colors justify-center w-10 h-10 mx-auto hover:bg-[var(--sidebar-item-bg-hover)]",
                        )}
                      >
                        <div
                          style={isActiveWs ? { backgroundColor: "var(--accent)", color: "#fff" } : { backgroundColor: "var(--sidebar-icon-ws-bg)", color: "var(--sidebar-icon-ws-text)" }}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                        >
                          {getInitials(ws.name)}
                        </div>
                      </button>
                    </Popover.Trigger>
                  ) : (
                    <button
                      onClick={() => setExpandedWs(isOpen ? null : ws.id)}
                      style={isActiveWs ? { backgroundColor: "var(--sidebar-item-bg-hover)" } : { color: "var(--sidebar-text)" }}
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-xl text-sm transition-colors text-left hover:bg-[var(--sidebar-item-bg-hover)] px-3 py-2",
                      )}
                    >
                      <div
                        style={isActiveWs ? { backgroundColor: "var(--accent)", color: "#fff" } : { backgroundColor: "var(--sidebar-icon-ws-bg)", color: "var(--sidebar-icon-ws-text)" }}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                      >
                        {getInitials(ws.name)}
                      </div>
                      <span className="flex-1 truncate font-medium">{ws.name}</span>
                      <ChevronDown style={{ color: "var(--sidebar-section-label)", transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform 0.2s ease" }} className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  )}

                {isOpen && !collapsed && (
                  <div className="ml-4 pl-3 mt-1 mb-1 space-y-0.5" style={{ borderLeft: "1px solid var(--sidebar-border)" }}>
                    {WORKSPACE_NAV.map((item) => {
                      const Icon = item.icon;
                      const href = `${item.href}?workspaceId=${ws.id}`;
                      const active = pathname === item.href && activeWsId === ws.id;
                      return (
                        <Link key={item.href} href={href}
                          style={active ? { backgroundColor: "var(--sidebar-item-bg-active)", color: "var(--sidebar-text-active)" } : { color: "var(--sidebar-text)" }}
                          className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors", !active && "hover:bg-[var(--sidebar-item-bg-hover)]", active && "font-medium")}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
                
                {/* Popout menu using Radix Portal when clicked */}
                <Popover.Portal>
                  <Popover.Content 
                    side="right" 
                    sideOffset={14} 
                    className="w-48 bg-[var(--bg-card)] border border-[var(--sidebar-border)] rounded-xl shadow-xl z-50 py-1.5 will-change-[transform,opacity] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=right]:slide-in-from-left-2"
                  >
                    <div className="px-3 py-2 border-b border-[var(--sidebar-border)] mb-1">
                      <p className="font-bold text-sm truncate" style={{ color: "var(--sidebar-text-header)" }}>{ws.name}</p>
                    </div>
                    {WORKSPACE_NAV.map((item) => {
                      const Icon = item.icon;
                      const href = `${item.href}?workspaceId=${ws.id}`;
                      const active = pathname === item.href && activeWsId === ws.id;
                      return (
                        <Link key={item.href} href={href} 
                          style={active ? { backgroundColor: "var(--sidebar-item-bg-active)", color: "var(--sidebar-text-active)" } : { color: "var(--sidebar-text)" }}
                          className={cn("flex items-center gap-2 px-3 py-2 mx-1 rounded-md text-xs transition-colors hover:bg-[var(--sidebar-item-bg-hover)]")}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </Popover.Content>
                </Popover.Portal>
                </Popover.Root>
              </div>
            );
          })}

          {workspaces.length === 0 && !collapsed && (
            <div className="px-3 py-3 text-center">
              <p className="text-xs italic" style={{ color: "var(--sidebar-section-label)" }}>Belum ada workspace.</p>
              <Link 
                href="/onboarding" 
                className="text-xs mt-1 inline-block" style={{ color: "var(--accent)" }}
                onClick={(e) => {
                  if (isEmailVerified === false) {
                    e.preventDefault();
                    Swal.fire({
                      title: "Perhatian",
                      text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa membuat workspace baru.",
                      icon: "warning",
                      confirmButtonColor: "#f59e0b",
                      confirmButtonText: "Mengerti",
                      customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" }
                    });
                  }
                }}
              >
                + Buat sekarang
              </Link>
            </div>
          )}
        </div>

        {/* Add new workspace */}
        {!collapsed && (
          <Link 
            href="/onboarding" 
            style={{ color: "var(--sidebar-text)" }} 
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-[var(--sidebar-item-bg-hover)] mt-1"
            onClick={(e) => {
              if (isEmailVerified === false) {
                e.preventDefault();
                Swal.fire({
                  title: "Perhatian",
                  text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa membuat workspace baru.",
                  icon: "warning",
                  confirmButtonColor: "#f59e0b",
                  confirmButtonText: "Mengerti",
                  customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" }
                });
              }
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Workspace
          </Link>
        )}

        {/* Global nav */}
        {!collapsed && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
            {user.isAdmin && (
              <Link href="/admin"
                style={pathname.startsWith("/admin") ? { backgroundColor: "var(--sidebar-item-bg-active)", color: "var(--sidebar-text-active)" } : { color: "var(--sidebar-text)" }}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors mb-1", !pathname.startsWith("/admin") && "hover:bg-[var(--sidebar-item-bg-hover)]", pathname.startsWith("/admin") && "font-medium")}>
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
                Admin Dashboard
              </Link>
            )}
            {GLOBAL_NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  style={active ? { backgroundColor: "var(--sidebar-item-bg-active)", color: "var(--sidebar-text-active)" } : { color: "var(--sidebar-text)" }}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors", !active && "hover:bg-[var(--sidebar-item-bg-hover)]", active && "font-medium")}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
        {collapsed && (
          <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
            {user.isAdmin && (
              <Link href="/admin" title="Admin Dashboard"
                style={{ color: "var(--sidebar-text)" }}
                className="flex justify-center items-center w-10 h-10 mx-auto rounded-xl hover:bg-[var(--sidebar-item-bg-hover)] transition-colors mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </Link>
            )}
            {GLOBAL_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} title={item.label}
                  style={{ color: "var(--sidebar-text)" }}
                  className="flex justify-center items-center w-10 h-10 mx-auto rounded-xl hover:bg-[var(--sidebar-item-bg-hover)] transition-colors">
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--sidebar-border)" }} className="shrink-0 py-2 px-2 space-y-1">
        <button onClick={toggleShowAmount} title={showAmount ? "Sembunyikan Saldo" : "Tampilkan Saldo"} style={{ color: "var(--sidebar-text)" }}
          className={cn("w-full flex items-center cursor-pointer gap-3 rounded-xl text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]", collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2")}>
          {showAmount ? <EyeOff className="w-4 h-4 shrink-0" /> : <Eye className="w-4 h-4 shrink-0" />}
          {!collapsed && <span>{showAmount ? "Sembunyikan Saldo" : "Tampilkan Saldo"}</span>}
        </button>
        <PushSubscriber collapsed={collapsed} className={cn("w-full flex items-center cursor-pointer gap-3 rounded-xl text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]", collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2", "text-[var(--sidebar-text)]")} />
        <button onClick={toggleTheme} title={theme === "dark" ? "Mode Terang" : "Mode Gelap"} style={{ color: "var(--sidebar-text)" }}
          className={cn("w-full flex items-center cursor-pointer gap-3 rounded-xl text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]", collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2")}>
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
        <button onClick={() => signOut({ callbackUrl: "/login" })} title={collapsed ? "Keluar" : undefined} style={{ color: "var(--sidebar-text)" }}
          className={cn("w-full flex cursor-pointer items-center gap-3 rounded-xl text-sm transition-colors hover:bg-[var(--sidebar-item-bg-hover)]", collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2")}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Keluar"}
        </button>
      </div>
    </aside>
  );
}

// ── Mobile Sidebar ──────────────────────────────────────────────────────────
function MobileSidebar({
  workspaces,
  user,
  pathname,
  activeWsId,
  isEmailVerified,
}: {
  workspaces: Workspace[];
  user: UserInfo;
  pathname: string;
  activeWsId: string | null;
  isEmailVerified?: boolean;
}) {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { showAmount, toggleShowAmount } = usePrivacy();

  const [expandedWs, setExpandedWs] = useState<string | null>(activeWsId);
  useEffect(() => { if (activeWsId) setExpandedWs(activeWsId); }, [activeWsId]);

  const close = () => setMobileOpen(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <div
        onClick={close}
        className={cn(
          "md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        className={cn(
          "md:hidden fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[82vw] max-w-sm shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ backgroundColor: "var(--sidebar-bg)" }}
      >
        {/* Header with user info */}
        <div className="shrink-0 px-5 pt-8 pb-3.5 relative" style={{ background: "linear-gradient(135deg, var(--accent) 0%, #059669 100%)" }}>
          <button onClick={close} className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/30 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-white/20 ring-2 ring-white/30 shrink-0">{getInitials(user.name)}</div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name ?? "Pengguna"}</p>
              <p className="text-[10px] text-white/60 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overscroll-contain py-4 px-3 space-y-1">
          {/* All workspaces link */}
          <Link href="/workspaces" onClick={close} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors mb-1">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-4 h-4 text-zinc-500" />
            </div>
            Semua Workspace
          </Link>

          <div className="my-2 border-t" style={{ borderColor: "var(--sidebar-border)" }} />

          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--sidebar-section-label)" }}>Workspace</p>
            <Link 
              href="/onboarding" 
              onClick={(e) => {
                if (isEmailVerified === false) {
                  e.preventDefault();
                  Swal.fire({
                    title: "Perhatian",
                    text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa membuat workspace baru.",
                    icon: "warning",
                    confirmButtonColor: "#f59e0b",
                    confirmButtonText: "Mengerti",
                    customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" }
                  });
                } else {
                  close();
                }
              }} 
              className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700"
            >
              <Plus className="w-3.5 h-3.5" />Buat
            </Link>
          </div>

          {workspaces.length === 0 ? (
            <div className="px-3 py-3 rounded-xl bg-zinc-50 text-center">
              <p className="text-xs text-zinc-500">Belum ada workspace</p>
              <Link 
                href="/onboarding" 
                onClick={(e) => {
                  if (isEmailVerified === false) {
                    e.preventDefault();
                    Swal.fire({
                      title: "Perhatian",
                      text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa membuat workspace baru.",
                      icon: "warning",
                      confirmButtonColor: "#f59e0b",
                      confirmButtonText: "Mengerti",
                      customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" }
                    });
                  } else {
                    close();
                  }
                }} 
                className="text-xs mt-1 inline-block text-green-600 font-medium"
              >
                + Buat sekarang
              </Link>
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
                        isActiveWs ? "bg-green-50 text-green-700 dark:bg-green-900/40" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100",
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={isActiveWs ? { backgroundColor: "var(--accent)", color: "#fff" } : { backgroundColor: "var(--sidebar-icon-ws-bg)", color: "var(--sidebar-icon-ws-text)" }}>
                        {getInitials(ws.name)}
                      </div>
                      <span className="flex-1 truncate">{ws.name}</span>
                      <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", isOpen && "rotate-180")} style={{ color: "var(--sidebar-section-label)" }} />
                    </button>
                    <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                      <div className="ml-4 pl-3 py-1 space-y-0.5" style={{ borderLeft: "2px solid var(--sidebar-border)" }}>
                        {WORKSPACE_NAV.map((item) => {
                          const Icon = item.icon;
                          const href = `${item.href}?workspaceId=${ws.id}`;
                          const active = pathname === item.href && activeWsId === ws.id;
                            return (
                            <Link key={item.href} href={href} onClick={close}
                              className={cn("flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors", active ? "bg-green-600 text-white font-medium" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100")}>
                              <Icon className="w-3.5 h-3.5 shrink-0" />{item.label}
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

        {/* Footer */}
        <div className="shrink-0 px-3 py-4 space-y-1 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          {/* Global nav in mobile footer */}
          {user.isAdmin && (
            <Link href="/admin" onClick={close}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border border-amber-200 bg-amber-50 text-amber-700",
                pathname.startsWith("/admin") && "ring-2 ring-amber-400 ring-offset-2")}>
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
              Admin Dashboard
            </Link>
          )}
          {GLOBAL_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={close}
                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active ? "bg-green-50 text-green-700" : "text-zinc-700 hover:bg-zinc-100")}>
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-green-600" : "text-zinc-400")} />
                {item.label}
              </Link>
            );
          })}
          <button onClick={toggleShowAmount}
            className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors", showAmount ? "text-zinc-700 hover:bg-zinc-100" : "text-green-600 bg-green-50 hover:bg-green-100")}>
            {showAmount ? <EyeOff className="w-4 h-4 shrink-0" /> : <Eye className="w-4 h-4 shrink-0" />}
            {showAmount ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          </button>
          <PushSubscriber collapsed={false} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-zinc-700 hover:bg-zinc-100" />
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-zinc-700 hover:bg-zinc-100">
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-green-500" />}
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-600 hover:bg-red-50">
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
  user,
  isEmailVerified,
}: {
  workspaces: Workspace[];
  user: UserInfo;
  isEmailVerified?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeWsId = searchParams.get("workspaceId");
  const { setMobileOpen } = useSidebar();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams, setMobileOpen]);

  const sharedProps = { workspaces, user, pathname, activeWsId, isEmailVerified };

  return (
    <>
      <DesktopSidebar {...sharedProps} />
      <MobileSidebar {...sharedProps} />
    </>
  );
}
