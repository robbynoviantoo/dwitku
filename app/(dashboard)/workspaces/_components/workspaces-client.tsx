"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2";
import { useLanguage } from "@/components/providers/language-provider";
import { WorkspacesHeader } from "./workspaces-header";
import { WorkspacesGrid } from "./workspaces-grid";

type Workspace = {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
  isPersonal: boolean;
  type?: string;
  role: string;
  _count?: { members: number; transactions: number };
};

type UserInfo = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

interface WorkspacesClientProps {
  workspaces: (Workspace & { role: string })[];
  user: UserInfo;
  isEmailVerified?: boolean;
}

export function WorkspacesClient({
  workspaces: initial,
  user,
  isEmailVerified,
}: WorkspacesClientProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: workspaces = initial, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getUserWorkspaces(),
    initialData: initial,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
  };

  const handleCreateNew = (e: React.MouseEvent) => {
    if (isEmailVerified === false) {
      e.preventDefault();
      Swal.fire({
        title: t("workspaces.verifiedAlertTitle"),
        text: t("workspaces.verifiedAlertText"),
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: t("workspaces.understood"),
        customClass: {
          popup: "!rounded-2xl !font-[Inter,sans-serif]",
          title: "!text-zinc-900 !text-lg !font-bold",
          confirmButton: "!rounded-xl !text-xs !font-bold !px-5 !py-2.5",
        },
      });
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
        {/* ── 1. Header ── */}
        <WorkspacesHeader
          userName={user.name}
          isEmailVerified={isEmailVerified}
          handleCreateNew={handleCreateNew}
        />

        {/* ── 2. Workspaces Grid ── */}
        {isLoading && workspaces.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : (
          <WorkspacesGrid
            workspaces={workspaces as any[]}
            handleCreateNew={handleCreateNew}
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
