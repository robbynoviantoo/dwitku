"use client";

import { useState } from "react";
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
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
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

  const handleDelete = (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"? Ini tidak bisa dibatalkan.`))
      return;
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-500" />
            Kategori
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {income} pemasukan · {expense} pengeluaran
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setDialog({ open: true })}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Kategori Baru
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit mb-6">
        {[
          {
            key: "ALL",
            label: "Semua",
            count: (categories as Category[]).length,
          },
          { key: "EXPENSE", label: "Pengeluaran", count: expense },
          { key: "INCOME", label: "Pemasukan", count: income },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
              filter === tab.key
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
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
              className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4 flex items-center gap-3 group hover:shadow-md transition-shadow"
            >
              {/* Emoji icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{
                  backgroundColor: cat.color + "20",
                  border: `2px solid ${cat.color}40`,
                }}
              >
                {cat.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">
                  {cat.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {cat.type === "INCOME" ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-xs text-zinc-400">
                    {cat._count.transactions} tx
                    {cat.isDefault && " · default"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {canEdit && !cat.isDefault && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setDialog({ open: true, category: cat })}
                    className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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

              {/* Locked indicator for default categories */}
              {cat.isDefault && (
                <div className="px-2 py-0.5 bg-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-tight rounded-md">
                  Bawaan
                </div>
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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-500" />
            Kategori
          </h1>
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        {canEdit && <Skeleton className="h-10 w-24 rounded-xl" />}
      </div>

      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
