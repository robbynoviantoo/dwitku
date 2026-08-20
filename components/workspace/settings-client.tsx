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
import { SettingsHeader } from "@/app/(dashboard)/settings/_components/settings-header";
import { SettingsGeneralForm } from "@/app/(dashboard)/settings/_components/settings-general-form";
import { SettingsTelegramCard } from "@/app/(dashboard)/settings/_components/settings-telegram-card";
import { SettingsDangerZone } from "@/app/(dashboard)/settings/_components/settings-danger-zone";

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
      <div className="text-center py-12 bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d]">
        <p className="text-zinc-500 text-xs font-semibold">Workspace tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Settings Header ── */}
      <SettingsHeader />

      {/* ── 2. General Configuration Form ── */}
      <SettingsGeneralForm
        workspace={workspace}
        isOwner={isOwner}
        isPending={isPending}
        isSaving={updateMutation.isPending}
        error={error}
        success={success}
        onSave={onSave}
      />

      {/* ── 3. Telegram Integration ── */}
      <SettingsTelegramCard workspaceId={workspace.id} />

      {/* ── 4. Danger Zone ── */}
      <SettingsDangerZone
        isOwner={isOwner}
        isPending={isPending}
        isLeaving={leaveMutation.isPending}
        isDeleting={deleteMutation.isPending}
        onLeave={handleLeave}
        onDelete={handleDelete}
      />
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6 space-y-4">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-red-200 dark:border-red-950/60 p-6 space-y-4">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
