import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { SettingsClient } from "@/components/workspace/settings-client";
import { Settings } from "lucide-react";
import { Suspense } from "react";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await searchParams;

  const allWorkspaces = await getUserWorkspaces();
  if (allWorkspaces.length === 0) redirect("/onboarding");

  const activeWsId = workspaceId ?? allWorkspaces[0].id;

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">Konfigurasi</p>
        <h1 className="text-2xl font-bold text-zinc-900">
          Pengaturan Workspace
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Konfigurasi pengaturan workspace Anda secara menyeluruh.
        </p>
      </div>

      <Suspense fallback={null}>
        <SettingsClient workspaceId={activeWsId} />
      </Suspense>
    </div>
  );
}
