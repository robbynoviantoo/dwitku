import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/app/actions/subscription";
import { BillingClient } from "./_components/billing-client";

import { cookies } from "next/headers";

export async function generateMetadata() {
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value || "id";
    const isEn = locale === "en";
    return {
        title: isEn ? "Billing & Subscription — Dwitku" : "Billing & Langganan — Dwitku",
        description: isEn ? "Manage your Dwitku subscription and payment methods." : "Kelola langganan dan metode pembayaran Dwitku kamu.",
    };
}

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subscription = await getUserSubscription();

  return <BillingClient subscription={subscription as any} user={session.user} />;
}
