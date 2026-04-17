import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OnboardingClient } from "./_components/onboarding-client";

export const metadata = {
    title: "Buat Workspace — Dwitku",
    description: "Buat workspace baru untuk mulai mencatat keuangan.",
};

export default async function OnboardingPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id! },
        select: { emailVerified: true, password: true },
    });

    // Unverified = has password (credentials) and no emailVerified date
    const isEmailVerified = !dbUser?.password || !!dbUser?.emailVerified;

    return <OnboardingClient isEmailVerified={isEmailVerified} />;
}
