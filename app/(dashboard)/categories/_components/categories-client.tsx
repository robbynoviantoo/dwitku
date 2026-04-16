"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory, getCategories } from "@/app/actions/category";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import { CategoryFormDialog } from "@/app/(dashboard)/categories/_components/category-form-dialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: string;
  isDefault: boolean;
  _count: { transactions: number };
};

type Props = {
  workspaceId: string;
  canEdit: boolean;
};

export function CategoriesClient({ workspaceId, canEdit }: Props) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [dialog, setDialog] = useState<{ open: boolean; category?: Category }>({
    open: false,
  });
  const [error, setError] = useState<string | undefined>();

  // Query
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", workspaceId],
    queryFn: () => getCategories(workspaceId),
  });

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: (catId: string) => deleteCategory(catId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", workspaceId] });
      broadcastInvalidate(["categories", workspaceId]);
    },
    onError: (err: any) => setError(err.message || "Gagal menghapus kategori"),
  });

  const filtered =
    filter === "ALL"
      ? categories
      : (categories as Category[]).filter((c) => c.type === filter);

  const handleDelete = async (cat: Category) => {
    const result = await Swal.fire({
      title: "Hapus Kategori?",
      html: `Apakah Anda yakin ingin menghapus kategori <b>${cat.emoji} ${cat.name}</b>? Tindakan ini tidak bisa dibatalkan.`,
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
    deleteMutation.mutate(cat.id);
  };

  const income = (categories as Category[]).filter(
    (c) => c.type === "INCOME",
  ).length;
  const expense = (categories as Category[]).filter(
    (c) => c.type === "EXPENSE",
  ).length;

  if (isLoading && categories.length === 0) {
    return <CategoriesSkeleton canEdit={canEdit} />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">Manajemen</p>
          <h1 className="text-2xl font-bold text-zinc-900">Kategori</h1>
          <p className="text-zinc-400 text-sm mt-1">
            <span className="font-semibold text-green-600">{income}</span> pemasukan ·{" "}
            <span className="font-semibold text-red-500">{expense}</span> pengeluaran
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setDialog({ open: true })}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Kategori Baru
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-zinc-100/80 dark:bg-zinc-800 p-1 rounded-xl w-fit mb-6 border border-zinc-200/60 dark:border-zinc-700">
        {[
          { key: "ALL", label: "Semua", count: (categories as Category[]).length },
          { key: "EXPENSE", label: "Pengeluaran", count: expense },
          { key: "INCOME", label: "Pemasukan", count: income },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
              filter === tab.key
                ? "bg-white text-zinc-900 shadow-sm font-semibold"
                : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            {tab.label}
            <span className={cn("ml-1.5 text-xs", filter === tab.key ? "text-green-600 font-bold" : "opacity-50")}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
          <button
            onClick={() => setError(undefined)}
            className="ml-2 underline"
          >
            tutup
          </button>
        </div>
      )}

      {/* Category Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Belum ada kategori. Buat yang pertama!</p>
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3",
            deleteMutation.isPending &&
            "opacity-50 pointer-events-none transition-opacity",
          )}
        >
          {(filtered as Category[]).map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 flex items-center gap-3.5 group hover:shadow-md hover:border-zinc-200 transition-all"
            >
              {/* Emoji icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: cat.color + "18",
                  border: `2px solid ${cat.color}30`,
                }}
              >
                {cat.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{cat.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {cat.type === "INCOME" ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600">Pemasukan</span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">Pengeluaran</span>
                  )}
                  <span className="text-xs text-zinc-400 dark:text-white">{cat._count.transactions} transaksi</span>
                </div>
              </div>

              {/* Actions */}
              {canEdit && !cat.isDefault && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setDialog({ open: true, category: cat })}
                    className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {cat.isDefault && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-white shrink-0">
                  Bawaan
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      {dialog.open && (
        <CategoryFormDialog
          workspaceId={workspaceId}
          category={dialog.category as any}
          onClose={() => setDialog({ open: false })}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["categories", workspaceId],
            });
            setDialog({ open: false });
          }}
        />
      )}
    </div>
  );
}

function CategoriesSkeleton({ canEdit }: { canEdit: boolean }) {
  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <h1 className="text-2xl font-bold text-zinc-900">Kategori</h1>
          <Skeleton className="h-4 w-40 mt-2" />
        </div>
        {canEdit && <Skeleton className="h-10 w-36 rounded-xl" />}
      </div>
      <Skeleton className="h-10 w-64 rounded-xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
