"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserWorkspaces } from "@/app/actions/workspace";
import {
  Building2,
  Users,
  ArrowLeftRight,
  Plus,
  Crown,
  Eye,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn, getInitials } from "@/lib/utils";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type Workspace = {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
  isPersonal: boolean;
  role: string;
  _count?: { members: number; transactions: number };
};

type UserInfo = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Pemilik",
  ADMIN: "Admin",
  MEMBER: "Anggota",
  VIEWER: "Pengamat",
};

const ROLE_COLOR: Record<string, string> = {
  OWNER: "text-amber-600 bg-amber-50 border-amber-200",
  ADMIN: "text-green-600 bg-green-50 border-green-200",
  MEMBER: "text-zinc-600 bg-zinc-50 border-zinc-200",
  VIEWER: "text-zinc-500 bg-zinc-50 border-zinc-200",
};

const WORKSPACE_COLORS = [
  "from-emerald-500 to-green-600",
  "from-green-500 to-emerald-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-400 to-teal-500",
];

function colorForWorkspace(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return WORKSPACE_COLORS[hash % WORKSPACE_COLORS.length];
}

import Swal from "sweetalert2";

interface WorkspacesClientProps {
  workspaces: (Workspace & { role: string })[];
  user: UserInfo;
  isEmailVerified?: boolean;
}

export function WorkspacesClient({ workspaces: initial, user, isEmailVerified }: WorkspacesClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: workspaces = initial, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getUserWorkspaces(),
    initialData: initial,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Pagi" : hour < 15 ? "Siang" : hour < 18 ? "Sore" : "Malam";

  const handleCreateNew = (e: React.MouseEvent) => {
    if (isEmailVerified === false) {
      e.preventDefault();
      Swal.fire({
        title: "Perhatian",
        text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa membuat workspace baru. Silakan cek inbox emailmu atau klik Kirim Ulang pada banner di atas.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Mengerti",
        customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" }
      });
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Selamat {greeting}, {user.name?.split(" ")[0] ?? "teman"} 👋
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">
              Pilih workspace untuk mulai mencatat keuangan.
            </p>
          </div>
          <Link
            href="/onboarding"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Buat Workspace</span>
            <span className="sm:hidden">Baru</span>
          </Link>
        </div>

        {/* Workspace list */}
        {isLoading && workspaces.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-zinc-300" />
            </div>
            <h2 className="text-lg font-bold text-zinc-700 mb-1">Belum ada workspace</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Buat workspace untuk mulai mencatat keuangan bersama atau sendiri.
            </p>
            <Link
              href="/onboarding"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              Buat Workspace Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(workspaces as any[]).map((ws) => (
              <button
                key={ws.id}
                onClick={() => router.push(`/workspaces?workspaceId=${ws.id}`)}
                className={cn(
                  "group text-left bg-white rounded-2xl border border-zinc-100 shadow-sm",
                  "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
                  "overflow-hidden flex flex-col w-full",
                )}
              >
                {/* Colored top banner with initials */}
                <div className={cn("h-20 bg-gradient-to-br flex items-center px-5", colorForWorkspace(ws.id))}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl">
                    {getInitials(ws.name)}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-white font-bold text-base truncate leading-tight">{ws.name}</p>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1",
                      ROLE_COLOR[ws.role] ?? ROLE_COLOR.VIEWER,
                    )}>
                      {ws.role === "OWNER" && <Crown className="w-2.5 h-2.5" />}
                      {ROLE_LABEL[ws.role] ?? ws.role}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="flex-1 p-4">
                  {ws.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{ws.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {ws._count?.members ?? 0} anggota
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      {ws._count?.transactions ?? 0} transaksi
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Eye className="w-3.5 h-3.5" />
                      {ws.currency}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 pb-3 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Klik untuk masuk</span>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
