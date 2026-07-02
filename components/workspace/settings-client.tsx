"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UpdateWorkspaceSchema,
  WorkspaceRole,
  WorkspaceRoleType,
} from "@/lib/validations/workspace";
import {
  updateWorkspace,
  deleteWorkspace,
  leaveWorkspace,
  getWorkspace,
} from "@/app/actions/workspace";
import { Loader2, Trash2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/providers/language-provider";

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  role: WorkspaceRoleType;
};

export function SettingsClient({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale, t } = useLanguage();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  // Query
  const { data: workspace, isLoading } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(workspaceId),
  });

  const isOwner = workspace?.role === WorkspaceRole.OWNER;

  const form = useForm<z.infer<typeof UpdateWorkspaceSchema>>({
    resolver: zodResolver(UpdateWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      currency: "IDR",
    },
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.name,
        description: workspace.description ?? "",
        currency: workspace.currency,
      });
    }
  }, [workspace, form]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof UpdateWorkspaceSchema>) =>
      updateWorkspace(workspaceId, values),
    onSuccess: (result) => {
      if (result.error) setError(result.error);
      else {
        setSuccess(t("settings.saved"));
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkspace(workspaceId),
    onSuccess: (result) => {
      if (result.error) setError(result.error);
      else {
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        router.push("/workspaces");
        router.refresh();
      }
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveWorkspace(workspaceId),
    onSuccess: (result) => {
      if (result.error) setError(result.error);
      else {
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        router.push("/workspaces");
        router.refresh();
      }
    },
  });

  const onSave = (values: z.infer<typeof UpdateWorkspaceSchema>) => {
    setError(undefined);
    setSuccess(undefined);
    updateMutation.mutate(values);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: t("settings.alertDeleteTitle"),
      html: t("settings.alertDeleteText"),
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
    deleteMutation.mutate();
  };

  const handleLeave = async () => {
    const result = await Swal.fire({
      title: t("settings.alertLeaveTitle"),
      html: t("settings.alertLeaveText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("settings.yesLeave"),
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
    leaveMutation.mutate();
  };

  const isPending =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    leaveMutation.isPending;

  if (isLoading && !workspace) {
    return <SettingsSkeleton />;
  }

  if (!workspace) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-zinc-100 shadow-sm">
        <p className="text-zinc-500">Workspace tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* General settings */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
        <h2 className="font-semibold text-zinc-900 mb-5">
          {t("settings.info")}
        </h2>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {t("settings.name")}
            </label>
            <input
              {...form.register("name")}
              disabled={!isOwner || isPending}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-zinc-50 focus:bg-white transition-colors disabled:text-zinc-400"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {t("settings.description")}
            </label>
            <textarea
              {...form.register("description")}
              disabled={!isOwner || isPending}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-zinc-50 focus:bg-white transition-colors resize-none disabled:text-zinc-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {t("settings.currency")}
            </label>
            <select
              {...form.register("currency")}
              disabled={!isOwner || isPending}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-zinc-50 transition-colors disabled:text-zinc-400"
            >
              <option value="IDR">IDR — Rupiah Indonesia</option>
              <option value="USD">USD — US Dollar</option>
              <option value="SGD">SGD — Singapore Dollar</option>
              <option value="MYR">MYR — Malaysian Ringgit</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {isOwner && (
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {updateMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {t("settings.saveChanges")}
            </button>
          )}
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <h2 className="font-semibold text-red-600 mb-4">{t("settings.dangerZone")}</h2>
        <div className="space-y-3">
          {!isOwner && (
            <div className="flex items-center justify-between p-4 border border-zinc-100 rounded-lg">
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {t("settings.leaveTitle")}
                </p>
                <p className="text-xs text-zinc-400">
                  {t("settings.leaveDesc")}
                </p>
              </div>
              <button
                onClick={handleLeave}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {leaveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                {t("settings.leaveBtn")}
              </button>
            </div>
          )}
          {isOwner && (
            <div className="flex items-center justify-between p-4 border border-zinc-100 rounded-lg">
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {t("settings.deleteTitle")}
                </p>
                <p className="text-xs text-zinc-400">
                  {t("settings.deleteDesc")}
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {t("settings.deleteBtn")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
        <h2 className="font-semibold text-zinc-900 mb-5">
          {t("settings.info")}
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}
