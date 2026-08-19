import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { PrivacyProvider } from "@/components/providers/privacy-provider";
import { EmailVerificationBanner } from "@/components/layout/email-verification-banner";
import { FloatingTrialButton } from "@/components/layout/floating-trial-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const cookieStore = await cookies();
  const showAmountCookie = cookieStore.get("show_amount")?.value;
  const defaultShowAmount = showAmountCookie !== "0" && showAmountCookie !== "false";

  const sidebarCollapsedCookie = cookieStore.get("sidebar_collapsed")?.value;
  const defaultCollapsed = sidebarCollapsedCookie === "1" || sidebarCollapsedCookie === "true";

  const [allWorkspaces, dbUser] = await Promise.all([
    getUserWorkspaces(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isAdmin: true,
        emailVerified: true,
        email: true,
        password: true,
        subscription: {
          select: {
            status: true,
            hasUsedTrial: true,
            plan: { select: { key: true } },
          },
        },
      },
    }),
  ]);

  // Tampilkan banner hanya untuk user credential (punya password) yang belum verif email
  const showVerificationBanner = !!dbUser?.password && !dbUser?.emailVerified;

  // Cek kelayakan klaim trial
  const canClaimTrial =
    !dbUser?.subscription?.hasUsedTrial &&
    (!dbUser?.subscription || dbUser.subscription.plan?.key === "free") &&
    dbUser?.subscription?.status !== "ACTIVE" &&
    dbUser?.subscription?.status !== "TRIAL";

  return (
    <ThemeProvider>
      <SidebarProvider defaultCollapsed={defaultCollapsed}>
        <PrivacyProvider defaultShowAmount={defaultShowAmount}>
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

              {/* Floating Pro Trial CTA button for eligible users */}
              <FloatingTrialButton canClaimTrial={canClaimTrial} />
            </div>
          </WorkspaceProvider>
        </PrivacyProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

