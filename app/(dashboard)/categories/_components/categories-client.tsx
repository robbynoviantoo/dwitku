"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory, getCategories } from "@/app/actions/category";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import { CategoryFormDialog } from "@/app/(dashboard)/categories/_components/category-form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";

import { CategoriesHeader } from "./categories-header";
import { CategoriesFilterTabs } from "./categories-filter-tabs";
import { CategoriesGrid, Category } from "./categories-grid";

type Props = {
  workspaceId: string;
  canEdit: boolean;
};

export function CategoriesClient({ workspaceId, canEdit }: Props) {
  const queryClient = useQueryClient();
  const { locale, t } = useLanguage();
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [dialog, setDialog] = useState<{ open: boolean; category?: Category }>({
    open: false,
  });
  const [error, setError] = useState<string | undefined>();

  // Query
  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ["categories", workspaceId],
    queryFn: () => getCategories(workspaceId),
    enabled: !!workspaceId,
  });

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: (catId: string) => deleteCategory(catId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", workspaceId] });
      broadcastInvalidate(["categories", workspaceId]);
    },
    onError: (err: any) => setError(err.message || t("categories.failedDelete")),
  });

  const allCategories = categories as Category[];
  const incomeCount = allCategories.filter((c) => c.type === "INCOME").length;
  const expenseCount = allCategories.filter((c) => c.type === "EXPENSE").length;

  const filteredCategories =
    filter === "ALL"
      ? allCategories
      : allCategories.filter((c) => c.type === filter);

  const handleDelete = async (cat: Category) => {
    const result = await Swal.fire({
      title: t("categories.deleteTitle"),
      html: `${t("categories.deleteText")} <b>${cat.emoji} ${cat.name}</b>? ${
        locale === "id"
          ? "Tindakan ini tidak bisa dibatalkan."
          : "This action cannot be undone."
      }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("transactions.yesDelete"),
      cancelButtonText: t("transactions.cancel"),
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

  if (isLoading && allCategories.length === 0) {
    return <CategoriesSkeleton canEdit={canEdit} />;
  }

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
      <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
        {/* ── 1. Header ────────────────────────────────────── */}
        <CategoriesHeader
          incomeCount={incomeCount}
          expenseCount={expenseCount}
          canEdit={canEdit}
          onOpenAdd={() => setDialog({ open: true })}
        />

        {/* ── 2. Filter Tabs ───────────────────────────────── */}
        <CategoriesFilterTabs
          filter={filter}
          totalCount={allCategories.length}
          incomeCount={incomeCount}
          expenseCount={expenseCount}
          onFilterChange={setFilter}
        />

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(undefined)}
              className="underline cursor-pointer font-bold"
            >
              {t("categories.close")}
            </button>
          </div>
        )}

        {/* ── 3. Category Grid ─────────────────────────────── */}
        <CategoriesGrid
          categories={filteredCategories}
          canEdit={canEdit}
          isDeleting={deleteMutation.isPending}
          onEdit={(cat) => setDialog({ open: true, category: cat })}
          onDelete={handleDelete}
          onOpenAdd={() => setDialog({ open: true })}
        />

        {/* Modal Form Dialog */}
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
    </PullToRefreshWrapper>
  );
}

function CategoriesSkeleton({ canEdit }: { canEdit: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-green-600" />
            {t("sidebar.kategori")}
          </h1>
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        {canEdit && <Skeleton className="h-10 w-28 rounded-xl" />}
      </div>

      <Skeleton className="h-10 w-64 rounded-xl" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <Skeleton key={n} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
