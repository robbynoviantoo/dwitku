import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getUserWorkspaces,
  createPersonalWorkspace,
} from "@/app/actions/workspace";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";
import { Suspense } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let allWorkspaces = await getUserWorkspaces();

  const hasPersonal = allWorkspaces.some((w) => w.isPersonal);
  if (!hasPersonal) {
    await createPersonalWorkspace();
    allWorkspaces = await getUserWorkspaces();
  }

  const personalWorkspace = allWorkspaces.find((w) => w.isPersonal)!;
  const sharedWorkspaces = allWorkspaces.filter((w) => !w.isPersonal);

  return (
    <QueryProvider>
      <ThemeProvider>
        <SidebarProvider>
          <WorkspaceProvider defaultWorkspaceId={personalWorkspace.id}>
            <div className="flex min-h-screen">
              {/* Sidebar — needs Suspense for useSearchParams */}
              <Suspense
                fallback={
                  <div
                    style={{
                      width: "var(--sidebar-width)",
                      backgroundColor: "var(--sidebar-bg)",
                    }}
                    className="fixed left-0 top-0 h-full z-50"
                  />
                }
              >
                <Sidebar
                  workspaces={sharedWorkspaces}
                  personalWorkspace={personalWorkspace}
                  user={session.user}
                />
              </Suspense>

              {/* Main content shifts based on sidebar width */}
              <MainContent>{children}</MainContent>
            </div>
          </WorkspaceProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
