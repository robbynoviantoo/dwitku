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
import { EmailVerificationBanner } from "@/components/layout/email-verification-banner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [allWorkspaces, dbUser] = await Promise.all([
    getUserWorkspaces(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, emailVerified: true, email: true, password: true },
    }),
  ]);

  // Tampilkan banner hanya untuk user credential (punya password) yang belum verif email
  const showVerificationBanner = !!dbUser?.password && !dbUser?.emailVerified;

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
                    isEmailVerified={!showVerificationBanner}
                  />
                </Suspense>

                {/* Main content shifts based on sidebar width */}
                <MainContent>
                  {/* Email verification banner — hanya muncul untuk unverified credentials users */}
                  {showVerificationBanner && dbUser?.email && (
                    <EmailVerificationBanner userEmail={dbUser.email} />
                  )}
                  <div className={showVerificationBanner ? "grayscale-unverified" : ""}>
                    {children}
                  </div>
                </MainContent>
              </div>
            </WorkspaceProvider>
          </PrivacyProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
