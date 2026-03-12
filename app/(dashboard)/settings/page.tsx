import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getWorkspace, getUserWorkspaces } from "@/app/actions/workspace";
import { SettingsClient } from "@/components/workspace/settings-client";
import { Settings } from "lucide-react";

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
    const workspace = await getWorkspace(activeWsId);

    if (!workspace) redirect("/dashboard");

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-zinc-900">Pengaturan Workspace</h1>
                </div>
                <p className="text-zinc-500 text-sm">
                    Konfigurasi{" "}
                    <span className="font-medium text-zinc-700">{workspace.name}</span>.
                </p>
            </div>

            <SettingsClient
                workspace={{
                    id: workspace.id,
                    name: workspace.name,
                    description: workspace.description,
                    currency: workspace.currency,
                    role: workspace.role,
                }}
            />
        </div>
    );
}
