"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  XCircle,
  Users,
  Shield,
  Crown,
  Filter,
  Sparkles,
  RefreshCw,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { UserActions } from "./user-actions";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isAdmin: boolean;
  emailVerified: Date | null;
  password: string | null;
  createdAt: Date | string;
  subscription: {
    id: string;
    status: string;
    hasUsedTrial?: boolean;
    plan: {
      key: string;
      name: string;
    };
  } | null;
  accounts: { provider: string }[];
  _count: {
    memberships: number;
    transactions: number;
  };
}

interface UsersTableClientProps {
  users: UserItem[];
  currentUserId: string;
}

export function UsersTableClient({ users, currentUserId }: UsersTableClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("ALL");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedTrial, setSelectedTrial] = useState<string>("ALL");
  const [selectedVerification, setSelectedVerification] = useState<string>("ALL");
  const [selectedProvider, setSelectedProvider] = useState<string>("ALL");
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("CREATED_DESC");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedPlan("ALL");
    setSelectedRole("ALL");
    setSelectedTrial("ALL");
    setSelectedVerification("ALL");
    setSelectedProvider("ALL");
    setSelectedWorkspaceFilter("ALL");
    setSortBy("CREATED_DESC");
    setPage(1);
  };

  const isFiltered =
    search !== "" ||
    selectedPlan !== "ALL" ||
    selectedRole !== "ALL" ||
    selectedTrial !== "ALL" ||
    selectedVerification !== "ALL" ||
    selectedProvider !== "ALL" ||
    selectedWorkspaceFilter !== "ALL" ||
    sortBy !== "CREATED_DESC";

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    const list = users.filter((u) => {
      // Search
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        (u.name && u.name.toLowerCase().includes(searchLower)) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.id.toLowerCase().includes(searchLower);

      // Plan
      const userPlanKey = u.subscription?.plan?.key || "free";
      const userStatus = u.subscription?.status;
      const isPaidActive =
        (userStatus === "ACTIVE" || userStatus === "TRIAL") && userPlanKey !== "free";

      let matchesPlan = true;
      if (selectedPlan === "FREE") {
        matchesPlan = !isPaidActive;
      } else if (selectedPlan === "BASIC") {
        matchesPlan = isPaidActive && userPlanKey === "basic";
      } else if (selectedPlan === "PRO") {
        matchesPlan = isPaidActive && userPlanKey === "pro";
      } else if (selectedPlan === "TRIAL") {
        matchesPlan = userStatus === "TRIAL";
      } else if (selectedPlan === "EXPIRED") {
        matchesPlan = userStatus === "EXPIRED" || userStatus === "CANCELLED";
      }

      // Role
      let matchesRole = true;
      if (selectedRole === "ADMIN") {
        matchesRole = u.isAdmin;
      } else if (selectedRole === "USER") {
        matchesRole = !u.isAdmin;
      }

      // Trial Status
      let matchesTrial = true;
      const hasUsedTrial = !!u.subscription?.hasUsedTrial;
      if (selectedTrial === "CLAIMED") {
        matchesTrial = hasUsedTrial;
      } else if (selectedTrial === "UNCLAIMED") {
        matchesTrial = !hasUsedTrial;
      }

      // Verification
      const isGoogleUser = u.accounts.some((a) => a.provider === "google");
      const isVerified = !!u.emailVerified || isGoogleUser;
      let matchesVerification = true;
      if (selectedVerification === "VERIFIED") {
        matchesVerification = isVerified;
      } else if (selectedVerification === "UNVERIFIED") {
        matchesVerification = !isVerified;
      }

      // Provider
      let matchesProvider = true;
      if (selectedProvider === "GOOGLE") {
        matchesProvider = isGoogleUser;
      } else if (selectedProvider === "CREDENTIALS") {
        matchesProvider = !isGoogleUser && !!u.password;
      }

      // Workspace Count
      let matchesWorkspace = true;
      if (selectedWorkspaceFilter === "HAS_WS") {
        matchesWorkspace = u._count.memberships > 0;
      } else if (selectedWorkspaceFilter === "NO_WS") {
        matchesWorkspace = u._count.memberships === 0;
      }

      return (
        matchesSearch &&
        matchesPlan &&
        matchesRole &&
        matchesTrial &&
        matchesVerification &&
        matchesProvider &&
        matchesWorkspace
      );
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "CREATED_DESC") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "CREATED_ASC") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "TX_DESC") {
        return b._count.transactions - a._count.transactions;
      }
      if (sortBy === "WS_DESC") {
        return b._count.memberships - a._count.memberships;
      }
      if (sortBy === "NAME_ASC") {
        return (a.name || a.email).localeCompare(b.name || b.email);
      }
      if (sortBy === "NAME_DESC") {
        return (b.name || b.email).localeCompare(a.name || a.email);
      }
      return 0;
    });
  }, [
    users,
    search,
    selectedPlan,
    selectedRole,
    selectedVerification,
    selectedProvider,
    selectedWorkspaceFilter,
    sortBy,
  ]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Quick Stat Counts
  const stats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.isAdmin).length,
      pro: users.filter(
        (u) =>
          u.subscription?.plan?.key === "pro" &&
          (u.subscription?.status === "ACTIVE" || u.subscription?.status === "TRIAL")
      ).length,
      basic: users.filter(
        (u) =>
          u.subscription?.plan?.key === "basic" &&
          (u.subscription?.status === "ACTIVE" || u.subscription?.status === "TRIAL")
      ).length,
      claimedTrial: users.filter((u) => !!u.subscription?.hasUsedTrial).length,
      unclaimedTrial: users.filter((u) => !u.subscription?.hasUsedTrial).length,
      unverified: users.filter(
        (u) => !u.emailVerified && !u.accounts.some((a) => a.provider === "google")
      ).length,
    };
  }, [users]);

  const STATUS_COLOR: Record<string, string> = {
    TRIAL: "text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
    ACTIVE: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    EXPIRED: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
    CANCELLED: "text-red-600 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800",
  };

  return (
    <div className="space-y-4">
      {/* Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setSelectedPlan("ALL");
            setSelectedRole("ALL");
            setSelectedTrial("ALL");
            setSelectedVerification("ALL");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedPlan === "ALL" && selectedRole === "ALL" && selectedTrial === "ALL" && selectedVerification === "ALL"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
              : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-slate-50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Semua ({stats.total})</span>
        </button>

        <button
          onClick={() => {
            setSelectedRole("ADMIN");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedRole === "ADMIN"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50/50"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin ({stats.admin})</span>
        </button>

        <button
          onClick={() => {
            setSelectedPlan("PRO");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedPlan === "PRO"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50/50"
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Pro ({stats.pro})</span>
        </button>

        <button
          onClick={() => {
            setSelectedPlan("BASIC");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedPlan === "BASIC"
              ? "bg-green-600 text-white shadow-xs"
              : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 text-green-600 dark:text-green-400 hover:bg-green-50/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Basic ({stats.basic})</span>
        </button>

        <button
          onClick={() => {
            setSelectedTrial("CLAIMED");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedTrial === "CLAIMED"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pernah Trial ({stats.claimedTrial})</span>
        </button>

        <button
          onClick={() => {
            setSelectedTrial("UNCLAIMED");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedTrial === "UNCLAIMED"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Belum Trial ({stats.unclaimedTrial})</span>
        </button>

        <button
          onClick={() => {
            setSelectedVerification("UNVERIFIED");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedVerification === "UNVERIFIED"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-slate-50"
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Belum Verifikasi ({stats.unverified})</span>
        </button>
      </div>

      {/* Main Search & Action Bar */}
      <div className="bg-white dark:bg-[#161b22] p-4 rounded-2xl border border-slate-200 dark:border-[#21262d] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, email, atau ID user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Plan Filter */}
            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                setPage(1);
              }}
              aria-label="Filter paket langganan"
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 text-xs font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer"
            >
              <option value="ALL">Semua Paket</option>
              <option value="FREE">Gratis (Free)</option>
              <option value="BASIC">Basic</option>
              <option value="PRO">Pro Unlimited</option>
              <option value="TRIAL">Trial Aktif</option>
              <option value="EXPIRED">Expired / Cancelled</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              aria-label="Urutkan pengguna"
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 outline-none focus:border-green-500 text-xs font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer"
            >
              <option value="CREATED_DESC">Terbaru Bergabung</option>
              <option value="CREATED_ASC">Terlama</option>
              <option value="TX_DESC">Transaksi Terbanyak</option>
              <option value="WS_DESC">Workspace Terbanyak</option>
              <option value="NAME_ASC">Nama (A - Z)</option>
              <option value="NAME_DESC">Nama (Z - A)</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showAdvancedFilters || isFiltered
                  ? "border-green-600 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300"
                  : "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Lainnya</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isPending}
              title="Refresh Data Pengguna"
              className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-green-600 ${isPending ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in duration-150">
            {/* Role Filter */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 mb-1 block">Role Pengguna</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
              >
                <option value="ALL">Semua Role</option>
                <option value="ADMIN">Super Admin Saja</option>
                <option value="USER">User Biasa</option>
              </select>
            </div>

            {/* Trial Status Filter */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 mb-1 block">Status Trial</label>
              <select
                value={selectedTrial}
                onChange={(e) => {
                  setSelectedTrial(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
              >
                <option value="ALL">Semua Status Trial</option>
                <option value="CLAIMED">Pernah Klaim Trial</option>
                <option value="UNCLAIMED">Belum Pernah Trial (Tersedia)</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 mb-1 block">Status Email</label>
              <select
                value={selectedVerification}
                onChange={(e) => {
                  setSelectedVerification(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
              >
                <option value="ALL">Semua Status Email</option>
                <option value="VERIFIED">Terverifikasi (Email / Google)</option>
                <option value="UNVERIFIED">Belum Verifikasi</option>
              </select>
            </div>

            {/* Provider Filter */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 mb-1 block">Metode Login</label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200"
              >
                <option value="ALL">Semua Metode</option>
                <option value="GOOGLE">Google OAuth</option>
                <option value="CREDENTIALS">Email & Password</option>
              </select>
            </div>
          </div>
        )}

        {/* Reset Active Filters Pill */}
        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <span className="text-zinc-400">
              Filter aktif: Ditemukan <strong>{filteredUsers.length}</strong> pengguna
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-slate-200 dark:border-[#21262d] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-400 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                <th className="px-6 py-3.5 font-semibold">Pengguna</th>
                <th className="px-6 py-3.5 font-semibold">Verifikasi</th>
                <th className="px-6 py-3.5 font-semibold">Paket Aktif</th>
                <th className="px-6 py-3.5 font-semibold">Workspace</th>
                <th className="px-6 py-3.5 font-semibold">Transaksi</th>
                <th className="px-6 py-3.5 font-semibold">Bergabung</th>
                <th className="px-6 py-3.5 font-semibold">Role</th>
                <th className="text-right px-6 py-3.5 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {paginatedUsers.map((u) => {
                const sub = u.subscription;
                const planKey = sub?.plan?.key ?? "free";
                const planName = sub?.plan?.name ?? "Gratis";
                const subStatus = sub?.status;
                const isGoogleUser = u.accounts.some((a) => a.provider === "google");
                const hasPassword = !!u.password;
                const isEmailVerified = !!u.emailVerified || isGoogleUser;

                const isPro = planKey === "pro";
                const isBasic = planKey === "basic";

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* User Profile */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.image}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-500/15 text-green-700 dark:text-green-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {u.name || "Tanpa Nama"}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Verification */}
                    <td className="px-6 py-3.5">
                      {isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Belum
                        </span>
                      )}
                    </td>

                    {/* Subscription */}
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              isPro
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : isBasic
                                ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            {planName}
                          </span>
                          {subStatus && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                STATUS_COLOR[subStatus] ?? ""
                              }`}
                            >
                              {subStatus}
                            </span>
                          )}
                        </div>

                        {/* Trial Status Badge */}
                        {sub?.hasUsedTrial ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                            <span>Pernah Trial</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                            <span>Trial Tersedia</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Workspaces count */}
                    <td className="px-6 py-3.5 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      {u._count.memberships} Ws
                    </td>

                    {/* Transactions count */}
                    <td className="px-6 py-3.5 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      {u._count.transactions.toLocaleString("id-ID")}
                    </td>

                    {/* Joined date */}
                    <td className="px-6 py-3.5 text-zinc-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col gap-0.5 items-start">
                        {u.isAdmin ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            ADMIN
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-medium">User</span>
                        )}
                        {isGoogleUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-500 border border-blue-200 dark:border-blue-800">
                            Google
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <UserActions
                        userId={u.id}
                        userName={u.name}
                        userEmail={u.email}
                        isAdmin={u.isAdmin}
                        isMe={currentUserId === u.id}
                        hasActiveSubscription={
                          !!subStatus && subStatus !== "EXPIRED" && subStatus !== "CANCELLED"
                        }
                        hasUsedTrial={!!sub?.hasUsedTrial}
                        hasPassword={hasPassword}
                      />
                    </td>
                  </tr>
                );
              })}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-400">
                    Tidak ada pengguna yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>Tampilkan per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-zinc-400">
              (Total {filteredUsers.length} pengguna)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

