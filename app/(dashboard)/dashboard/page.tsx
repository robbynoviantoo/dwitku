import { auth } from "@/auth";
import { DashboardClient } from "./_components/dashboard-client";
import { Suspense } from "react";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <Suspense fallback={null}>
      <DashboardClient
        initialUser={session?.user ? { name: session.user.name } : undefined}
      />
    </Suspense>
  );
}
