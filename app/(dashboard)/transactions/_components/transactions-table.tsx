"use client";

import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { ArrowLeftRight, ChevronLeft, ChevronRight, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface TransactionsTableProps {
  table: ReactTable<any>;
  items: any[];
  columnsLength: number;
  total: number;
  page: number;
  totalPages: number;
  isPlaceholderData: boolean;
  isPendingDelete: boolean;
  canEdit: boolean;
  onPageChange: (newPage: number) => void;
  onOpenAdd: () => void;
}

export function TransactionsTable({
  table,
  items,
  columnsLength,
  total,
  page,
  totalPages,
  isPlaceholderData,
  isPendingDelete,
  canEdit,
  onPageChange,
  onOpenAdd,
}: TransactionsTableProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "hidden md:flex flex-col flex-1 min-h-0 bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] overflow-hidden",
        (isPlaceholderData || isPendingDelete) &&
          "opacity-50 pointer-events-none transition-opacity"
      )}
    >
      {/* Scrollable Table Viewport */}
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-zinc-800/90 border-b border-slate-200 dark:border-[#21262d]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const isSortable = h.column.getCanSort();
                  const sortDirection = h.column.getIsSorted();

                  return (
                    <th
                      key={h.id}
                      className={cn(
                        "text-left px-4 py-3 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap",
                        isSortable &&
                          "cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      )}
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{flexRender(h.column.columnDef.header, h.getContext())}</span>
                        {isSortable && (
                          <span className="inline-flex shrink-0">
                            {sortDirection === "asc" && (
                              <ChevronUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            )}
                            {sortDirection === "desc" && (
                              <ChevronDown className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            )}
                            {!sortDirection && (
                              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#21262d]/80">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={columnsLength}
                  className="text-center py-20 text-zinc-400 text-sm"
                >
                  <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">{t("transactions.noTransactions")}</p>
                  {canEdit && (
                    <button
                      onClick={onOpenAdd}
                      className="mt-2 text-green-600 dark:text-green-400 underline underline-offset-2 text-xs font-bold hover:text-green-700 cursor-pointer"
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
                  className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-xs">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-[#21262d] bg-slate-50/50 dark:bg-zinc-800/40 shrink-0">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
            {t("transactions.pageOf")}{" "}
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{page}</span>{" "}
            {t("transactions.of")}{" "}
            <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalPages}</span>
            <span className="text-zinc-400"> · {total} {t("transactions.found")}</span>
          </p>

          <div className="flex gap-1.5">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isPlaceholderData}
              className="p-1.5 rounded-xl cursor-pointer border border-slate-200 dark:border-[#21262d] text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isPlaceholderData}
              className="p-1.5 rounded-xl cursor-pointer border border-slate-200 dark:border-[#21262d] text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
