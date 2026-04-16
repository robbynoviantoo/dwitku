import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSubscription } from "@/app/actions/subscription";
import { BillingClient } from "./_components/billing-client";

export const metadata = {
  title: "Billing & Langganan — Dwitku",
  description: "Kelola langganan dan metode pembayaran Dwitku kamu.",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subscription = await getUserSubscription();

  return <BillingClient subscription={subscription as any} user={session.user} />;
}
