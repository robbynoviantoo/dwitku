"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  X,
  SlidersHorizontal,
  Calendar,
  Tag,
  Filter,
  ChevronDown,
  Check,
  FileSpreadsheet,
  Loader2,
  Lock,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import {
  deleteTransaction,
  getTransactions,
  getTransactionSummary,
  type TransactionFilter,
} from "@/app/actions/transaction";
import { getCategories } from "@/app/actions/category";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";
import { usePrivacy } from "@/components/providers/privacy-provider";
import * as XLSX from "xlsx";

// ── Shared mini calendar for filter panel ───────────────────────────────────
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const MONTHS_FULL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS_SHORT = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

function MiniCalendar({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parsed = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const today = new Date();
  const isToday = (d: number) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;
  const isSelected = (d: number) => selectedDate && selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === d;

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const displayText = selectedDate
    ? `${selectedDate.getDate()} ${MONTHS_SHORT[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    : label;

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all truncate",
          open ? "border-green-400 bg-white ring-1 ring-green-100" : "border-zinc-200 bg-white hover:border-green-300",
          value ? "text-zinc-800 font-medium" : "text-zinc-400",
        )}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
        <span className="truncate">{displayText}</span>
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="ml-auto shrink-0 text-zinc-300 hover:text-zinc-500 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-2xl z-[60] overflow-hidden w-64">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-100">
            <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-zinc-100 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 text-zinc-500" />
            </button>
            <span className="text-xs font-semibold text-zinc-800">{MONTHS_FULL[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-zinc-100 transition-colors">
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>
          <div className="grid grid-cols-7 px-2 pt-2">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-[9px] font-bold text-zinc-400 uppercase py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-2">
            {cells.map((day, i) =>
              day === null ? <div key={`e-${i}`} /> : (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={cn(
                    "mx-auto flex items-center justify-center w-7 h-7 rounded-full text-xs transition-all",
                    isSelected(day) ? "bg-green-600 text-white font-bold" : isToday(day) ? "bg-green-50 text-green-600 font-semibold ring-1 ring-green-200" : "text-zinc-700 hover:bg-zinc-100",
                  )}
                >{day}</button>
              )
            )}
          </div>
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={() => {
                const t = new Date();
                const mm = String(t.getMonth() + 1).padStart(2, "0");
                const dd = String(t.getDate()).padStart(2, "0");
                onChange(`${t.getFullYear()}-${mm}-${dd}`);
                setOpen(false);
              }}
              className="w-full py-1 text-[10px] font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
            >Hari ini</button>
          </div>
        </div>
      )}
    </div>
  );
}

type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: string;
};

type Transaction = {
  id: string;
  amount: number | any;
  note: string | null;
  date: Date | string;
  type: string;
  categoryId: string;
  category: { id: string; name: string; emoji: string; color: string };
  createdBy: { id: string; name: string | null; image: string | null };
};

type Props = {
  workspaceId: string;
  currency: string;
  canEdit: boolean;
  canExport?: boolean;
  planKey?: string;
  isEmailVerified?: boolean;
};

const PAGE_SIZE = 10;
const col = createColumnHelper<Transaction>();

// ── Searchable Category Select ──────────────────────────────────────────────
function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.emoji.includes(search),
      ),
    [categories, search],
  );

  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={open ? () => { setOpen(false); setSearch(""); } : handleOpen}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-lg border text-sm transition-all",
          "bg-white border-zinc-200 text-zinc-700 hover:border-green-300 hover:bg-green-50/30",
          open && "border-green-400 ring-2 ring-green-100",
          value && "border-green-300 bg-green-50/40 text-green-800",
        )}
      >
        <Tag className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
        <span className="flex-1 text-left truncate">
          {selected ? `${selected.emoji} ${selected.name}` : "Semua Kategori"}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 shrink-0 text-zinc-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-48">
          {/* Search inside dropdown */}
          <div className="p-2 border-b border-zinc-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 bg-zinc-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {/* All option */}
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-green-50 transition-colors text-left",
                !value && "bg-green-50 text-green-700 font-medium",
              )}
            >
              <span className="w-5 text-center text-base">🗂️</span>
              <span className="flex-1">Semua Kategori</span>
              {!value && <Check className="w-3.5 h-3.5 text-green-500" />}
            </button>

            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-zinc-400 text-center">
                Kategori tidak ditemukan
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.id); setOpen(false); setSearch(""); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-indigo-50 transition-colors text-left",
                    value === c.id && "bg-indigo-50 text-indigo-700 font-medium",
                  )}
                >
                  <span className="w-5 text-center text-base">{c.emoji}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  {value === c.id && <Check className="w-3.5 h-3.5 shrink-0 text-green-500" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Type Select ─────────────────────────────────────────────────────────────
function TypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { value: "", label: "Semua Tipe", emoji: "📊" },
    { value: "INCOME", label: "Pemasukan", emoji: "↑", color: "text-green-700 bg-green-50 border-green-200" },
    { value: "EXPENSE", label: "Pengeluaran", emoji: "↓", color: "text-red-700 bg-red-50 border-red-200" },
  ];
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
            value === o.value
              ? o.value === "INCOME"
                ? "bg-green-100 border-green-300 text-green-800 shadow-sm"
                : o.value === "EXPENSE"
                  ? "bg-red-100 border-red-300 text-red-800 shadow-sm"
                  : "bg-indigo-100 border-indigo-300 text-indigo-800 shadow-sm"
              : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
          )}
        >
          <span className="text-xs">{o.emoji}</span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Filter Panel (collapsible) ──────────────────────────────────────────────
function FilterPanel({
  filter,
  search,
  categories,
  onFilterChange,
  onSearch,
  onReset,
}: {
  filter: TransactionFilter;
  search: string;
  categories: Category[];
  onFilterChange: (u: Partial<TransactionFilter>) => void;
  onSearch: (v: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filter.type,
    filter.categoryId,
    filter.dateFrom,
    filter.dateTo,
    search,
  ].filter(Boolean).length;

  return (
    <div className="mb-4">
      {/* Filter trigger bar + search */}
      <div className="flex items-center gap-2">
        {/* Search always visible */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari catatan transaksi..."
            className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white shadow-sm transition-all placeholder:text-zinc-400"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm",
            open
              ? "bg-green-600 border-green-600 text-white"
              : "bg-white border-zinc-200 text-zinc-700 hover:border-green-300 hover:bg-green-50/40",
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
          {activeCount > 0 && (
            <span
              className={cn(
                "absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                open ? "bg-white text-green-600" : "bg-green-600 text-white",
              )}
            >
              {activeCount}
            </span>
          )}
        </button>

        {/* Reset button */}
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all bg-white shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Collapsible filter panel */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          open
            ? "max-h-[600px] opacity-100 mt-2 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden",
        )}
      >
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-4 space-y-4">
          {/* Tipe transaksi */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              <Filter className="w-3 h-3" />
              Tipe Transaksi
            </label>
            <TypeSelect
              value={filter.type ?? ""}
              onChange={(v) => onFilterChange({ type: (v as any) || undefined })}
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              <Tag className="w-3 h-3" />
              Kategori
            </label>
            <CategorySelect
              categories={categories}
              value={filter.categoryId ?? ""}
              onChange={(v) => onFilterChange({ categoryId: v || undefined })}
            />
          </div>

          {/* Rentang tanggal */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              <Calendar className="w-3 h-3" />
              Rentang Tanggal
            </label>
            <div className="flex gap-2 min-w-0">
              <MiniCalendar
                value={filter.dateFrom ?? ""}
                onChange={(v) => onFilterChange({ dateFrom: v || undefined })}
                label="Dari"
              />
              <MiniCalendar
                value={filter.dateTo ?? ""}
                onChange={(v) => onFilterChange({ dateTo: v || undefined })}
                label="Sampai"
              />
            </div>
          </div>

          {/* Active filters pills */}
          {activeCount > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-100">
              {filter.type && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                  {filter.type === "INCOME" ? "↑ Pemasukan" : "↓ Pengeluaran"}
                  <button onClick={() => onFilterChange({ type: undefined })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filter.categoryId && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                  {categories.find((c) => c.id === filter.categoryId)?.emoji}{" "}
                  {categories.find((c) => c.id === filter.categoryId)?.name}
                  <button onClick={() => onFilterChange({ categoryId: undefined })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filter.dateFrom && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                  Dari {filter.dateFrom}
                  <button onClick={() => onFilterChange({ dateFrom: undefined })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filter.dateTo && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                  S/d {filter.dateTo}
                  <button onClick={() => onFilterChange({ dateTo: undefined })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function TransactionsClient({ workspaceId, currency, canEdit, canExport = false, planKey = "free", isEmailVerified }: Props) {
  const queryClient = useQueryClient();
  const { showAmount } = usePrivacy();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{
    open: boolean;
    transaction?: Transaction;
  }>({ open: false });
  const [error, setError] = useState<string | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenDialog = (tx?: Transaction) => {
    if (isEmailVerified === false) {
      Swal.fire({
        title: "Perhatian",
        text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa mencatat transaksi.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Mengerti",
        customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" }
      });
      return;
    }
    setDialog({ open: true, transaction: tx });
  };

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", workspaceId],
    queryFn: () => getCategories(workspaceId),
  });

  const {
    data: transactionData,
    isLoading: isLoadingTransactions,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["transactions", workspaceId, { ...filter, page }],
    queryFn: () =>
      getTransactions(workspaceId, { ...filter, page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: [
      "transaction-summary",
      workspaceId,
      filter.dateFrom,
      filter.dateTo,
    ],
    queryFn: () =>
      getTransactionSummary(workspaceId, filter.dateFrom, filter.dateTo),
  });

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: (transactionId: string) =>
      deleteTransaction(transactionId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["report-monthly", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["report-category", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["report-comparison", workspaceId] });

      broadcastInvalidate(["transactions", workspaceId]);
      broadcastInvalidate(["transaction-summary", workspaceId]);
      broadcastInvalidate(["report-monthly", workspaceId]);
      broadcastInvalidate(["report-category", workspaceId]);
      broadcastInvalidate(["report-comparison", workspaceId]);
    },
    onError: (err: any) => setError(err.message || "Gagal menghapus transaksi"),
  });

  const items = transactionData?.items ?? [];
  const total = transactionData?.total ?? 0;
  const totalPages = transactionData?.totalPages ?? 0;

  const handleFilterChange = (updates: Partial<TransactionFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    handleFilterChange({ search: val || undefined });
  };

  const handleReset = () => {
    setFilter({});
    setSearch("");
    setPage(1);
  };

  const handleDelete = async (tx: Transaction) => {
    const result = await Swal.fire({
      title: "Hapus Transaksi?",
      html: `Transaksi ini akan dihapus permanen dan tidak bisa dikembalikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      customClass: {
        popup: "!rounded-2xl !font-[Inter,sans-serif]",
        title: "!text-zinc-900 !text-lg !font-bold",
        htmlContainer: "!text-zinc-500 !text-sm",
        confirmButton: "!rounded-xl !text-sm !font-semibold !px-5 !py-2.5",
        cancelButton: "!rounded-xl !text-sm !font-medium !px-5 !py-2.5",
      },
    });
    if (!result.isConfirmed) return;
    deleteMutation.mutate(tx.id);
  };

  const columns = [
    col.accessor("date", {
      header: "Tanggal",
      cell: (info) => (
        <span className="text-sm text-zinc-600 whitespace-nowrap tabular-nums">
          {formatDateShort(new Date(info.getValue()))}
        </span>
      ),
    }),
    col.accessor("type", {
      header: "Tipe",
      cell: (info) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
            info.getValue() === "INCOME"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600",
          )}
        >
          {info.getValue() === "INCOME" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {info.getValue() === "INCOME" ? "Masuk" : "Keluar"}
        </span>
      ),
    }),
    col.accessor("category", {
      header: "Kategori",
      cell: (info) => {
        const cat = info.getValue();
        return (
          <span className="flex items-center gap-1.5 text-sm">
            <span>{cat.emoji}</span>
            <span className="text-zinc-700">{cat.name}</span>
          </span>
        );
      },
    }),
    col.accessor("note", {
      header: "Catatan",
      cell: (info) => (
        <span className="text-sm text-zinc-500 max-w-48 truncate block">
          {info.getValue() ?? "—"}
        </span>
      ),
    }),
    col.accessor("amount", {
      header: "Nominal",
      cell: (info) => {
        const tx = info.row.original;
        return (
          <span
            className={cn(
              "text-sm font-semibold whitespace-nowrap tabular-nums",
              tx.type === "INCOME" ? "text-green-600" : "text-red-500",
            )}
          >
            {tx.type === "INCOME" ? "+" : "-"}
            {showAmount
              ? formatCurrency(Number(info.getValue()), currency)
              : <span className="tracking-widest text-sm">••••••</span>}
          </span>
        );
      },
    }),
    col.accessor("createdBy", {
      header: "Dibuat oleh",
      cell: (info) => {
        const u = info.getValue();
        return (
          <span className="flex items-center gap-1.5 text-sm text-zinc-500">
            {u.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.image} alt="" className="w-5 h-5 rounded-full" />
            )}
            {u.name ?? "—"}
          </span>
        );
      },
    }),
    col.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const tx = info.row.original;
        if (!canEdit) return null;
        return (
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => handleOpenDialog(tx as any)}
              className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(tx)}
              disabled={deleteMutation.isPending}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: items as any[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const isLoading =
    isLoadingTransactions || isLoadingCategories || isLoadingSummary;

  if (isLoading && !transactionData) {
    return <TransactionsSkeleton canEdit={canEdit} />;
  }

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["categories", workspaceId] }),
    ]);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allData = await getTransactions(workspaceId, { ...filter, page: 1, limit: 99999 });
      const rows = allData.items.map((tx) => ({
        "Tanggal": new Date(tx.date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
        "Tipe": tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
        "Kategori": `${tx.category.emoji} ${tx.category.name}`,
        "Catatan": tx.note ?? "-",
        "Nominal": Number(tx.amount),
        "Mata Uang": currency,
        "Dibuat Oleh": tx.createdBy.name ?? "-",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      // Column widths
      ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 16 }, { wch: 10 }, { wch: 20 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
      const today = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `transaksi-${today}.xlsx`);
    } catch (e) {
      setError("Gagal mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">Keuangan</p>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Transaksi</h1>
          <p className="text-zinc-400 text-sm mt-1 font-normal">
            {total.toLocaleString("id-ID")} transaksi ditemukan
          </p>
        </div>
        {/* Right side: Export + Tambah */}
        <div className="flex items-center gap-2">
          {canExport ? (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {isExporting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline">{isExporting ? "Mengekspor..." : "Export Excel"}</span>
            </button>
          ) : (
            <button
              onClick={() => Swal.fire({
                title: "🔒 Fitur Premium",
                html: `<p class="text-zinc-500 text-sm">Export Excel tersedia mulai paket <b>Basic</b>.</p><p class="text-zinc-400 text-xs mt-1">Upgrade sekarang mulai <b>Rp 25.000/bln</b>.</p>`,
                icon: "info",
                confirmButtonText: "Lihat Paket",
                showCancelButton: true,
                cancelButtonText: "Nanti",
                confirmButtonColor: "#16a34a",
                customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl", cancelButton: "!rounded-xl" },
              }).then((r) => { if (r.isConfirmed) window.location.href = "/billing"; })}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-zinc-200 text-zinc-400 text-sm font-medium rounded-xl transition-all shadow-sm cursor-pointer hover:border-green-300 hover:text-green-600"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => handleOpenDialog()}
              className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filter={filter}
        search={search}
        categories={categories}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(undefined)}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Card List (hidden on md+) */}
      <div
        className={cn(
          "md:hidden flex flex-col gap-3",
          (isPlaceholderData || deleteMutation.isPending) &&
            "opacity-50 pointer-events-none transition-opacity",
        )}
      >
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm py-14 text-center">
            <ArrowLeftRight className="w-8 h-8 mx-auto mb-3 text-zinc-300" />
            <p className="text-sm text-zinc-400 font-medium">Belum ada transaksi.</p>
            {canEdit && (
              <button
                onClick={() => handleOpenDialog()}
                className="mt-3 text-green-600 text-sm font-medium underline underline-offset-2"
              >
                Tambah sekarang
              </button>
            )}
          </div>
        ) : (
          items.map((tx) => {
            const isIncome = tx.type === "INCOME";
            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-xl flex-shrink-0">
                      {tx.category.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 leading-tight tracking-tight">
                        {tx.category.name}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 tabular-nums">
                        {formatDateShort(new Date(tx.date))}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-base font-bold whitespace-nowrap tabular-nums",
                      isIncome ? "text-green-600" : "text-red-500",
                    )}
                  >
                    {isIncome ? "+" : "-"}
                    {showAmount
                      ? formatCurrency(Number(tx.amount), currency)
                      : <span className="tracking-widest">••••••</span>}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
                        isIncome
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600",
                      )}
                    >
                      {isIncome ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isIncome ? "Masuk" : "Keluar"}
                    </span>
                    {tx.note && (
                      <p className="text-xs text-zinc-500 truncate">{tx.note}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      {tx.createdBy.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tx.createdBy.image}
                          alt=""
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span className="text-xs text-zinc-400">{tx.createdBy.name}</span>
                    </div>

                    {canEdit && (
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => handleOpenDialog(tx as any)}
                          className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx as any)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-2">
            <p className="text-sm text-zinc-500 tabular-nums">
              {page} / {totalPages} · {total} transaksi
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isPlaceholderData}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || isPlaceholderData}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div
        className={cn(
          "hidden md:block bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden",
          (isPlaceholderData || deleteMutation.isPending) &&
          "opacity-50 pointer-events-none transition-opacity",
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-zinc-100 bg-zinc-50">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="text-left px-4 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-20 text-zinc-400 text-sm"
                  >
                    <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">Belum ada transaksi</p>
                    {canEdit && (
                      <button
                        onClick={() => setDialog({ open: true })}
                        className="mt-2 text-green-600 underline underline-offset-2 text-sm hover:text-green-700"
                      >
                        Tambah sekarang
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50/60 transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100 bg-zinc-50/50">
            <p className="text-sm text-zinc-500 tabular-nums">
              Halaman <span className="font-semibold text-zinc-700">{page}</span> dari{" "}
              <span className="font-semibold text-zinc-700">{totalPages}</span>
              <span className="text-zinc-400"> · {total} transaksi</span>
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isPlaceholderData}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page >= totalPages || isPlaceholderData}
                className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-white hover:shadow-sm disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      {dialog.open && (
        <TransactionFormDialog
          workspaceId={workspaceId}
          categories={categories}
          transaction={dialog.transaction as any}
          onClose={() => setDialog({ open: false })}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["report-monthly", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["report-category", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["report-comparison", workspaceId] });
          }}
        />
      )}
    </div>
    </PullToRefreshWrapper>
  );
}

function TransactionsSkeleton({ canEdit }: { canEdit: boolean }) {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 tracking-tight">
            <ArrowLeftRight className="w-6 h-6 text-green-500" />
            Transaksi
          </h1>
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        {canEdit && <Skeleton className="h-10 w-28 rounded-xl" />}
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-24 rounded-xl" />
      </div>

      {/* Mobile card skeletons — match actual card height */}
      <div className="md:hidden flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
            {/* Top row: emoji + name + amount */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded" />
            </div>
            {/* Bottom row: badge + note + avatar + actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                {canEdit && <Skeleton className="h-7 w-16 rounded-lg" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden md:block bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="h-[46px] bg-gradient-to-r from-zinc-50 to-slate-50 border-b border-zinc-100" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-[58px] border-b border-zinc-50 px-4 flex items-center gap-8">
            <Skeleton className="h-4 w-20" /> {/* date */}
            <Skeleton className="h-5 w-16 rounded-full" /> {/* type badge */}
            <Skeleton className="h-4 w-28" /> {/* category */}
            <Skeleton className="h-4 flex-1" /> {/* note */}
            <Skeleton className="h-4 w-24" /> {/* amount */}
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            {canEdit && <Skeleton className="h-7 w-14 rounded-lg" />}
          </div>
        ))}
      </div>
    </div>
  );
}
