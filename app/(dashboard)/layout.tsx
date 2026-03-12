import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces, createPersonalWorkspace } from "@/app/actions/workspace";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Suspense } from "react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    let allWorkspaces = await getUserWorkspaces();

    // Pastikan ada workspace pribadi — auto-buat jika belum ada
    const hasPersonal = allWorkspaces.some((w) => w.isPersonal);
    if (!hasPersonal) {
        await createPersonalWorkspace();
        allWorkspaces = await getUserWorkspaces();
    }

    const personalWorkspace = allWorkspaces.find((w) => w.isPersonal)!;
    const sharedWorkspaces = allWorkspaces.filter((w) => !w.isPersonal);

    return (
        <WorkspaceProvider defaultWorkspaceId={personalWorkspace.id}>
            <div className="flex h-screen bg-zinc-50">
                {/* Suspense diperlukan karena Sidebar pakai useSearchParams */}
                <Suspense fallback={<div className="w-64 bg-zinc-900" />}>
                    <Sidebar
                        workspaces={sharedWorkspaces}
                        personalWorkspace={personalWorkspace}
                        user={session.user}
                    />
                </Suspense>
                <main className="flex-1 ml-64 overflow-y-auto">
                    {children}
                </main>
            </div>
        </WorkspaceProvider>
    );
}
