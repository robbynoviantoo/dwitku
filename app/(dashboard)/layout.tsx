import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";
import { Suspense } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { PrivacyProvider } from "@/components/providers/privacy-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [allWorkspaces, dbUser] = await Promise.all([
    getUserWorkspaces(),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } }),
  ]);

  return (
    <QueryProvider>
      <ThemeProvider>
        <SidebarProvider>
          <PrivacyProvider>
            <WorkspaceProvider>
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
                    workspaces={allWorkspaces}
                    user={{ ...session.user, isAdmin: dbUser?.isAdmin }}
                  />
                </Suspense>

                {/* Main content shifts based on sidebar width */}
                <MainContent>{children}</MainContent>
              </div>
            </WorkspaceProvider>
          </PrivacyProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
