import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, History, ReceiptText } from "lucide-react";
import { SyncButton } from "./_components/sync-button";
import { ContinuePaymentButton } from "./_components/continue-payment-button";

export const metadata = {
  title: "Riwayat Pembayaran — Dwitku",
};

export default async function BillingHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Cari subscription untuk dapetin payments
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const payments = subscription?.payments || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/billing" className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-green-600" />
            Riwayat Pembayaran
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Catatan tagihan dan transaksi langgananmu.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-500 bg-zinc-50 border-b border-zinc-100">
                <th className="text-left px-6 py-3 font-medium">Order ID</th>
                <th className="text-left px-6 py-3 font-medium">Tanggal</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {payments.map((p) => {
                const isSuccess = p.status === "SUCCESS";
                const isFailed = p.status === "FAILED";
                const isPending = p.status === "PENDING";
                
                return (
                  <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-zinc-700 font-mono text-xs">
                      {p.orderId}
                    </td>
                    <td className="px-6 py-3.5 text-zinc-500">
                      {p.createdAt.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isSuccess ? "bg-green-50 text-green-700" :
                          isPending ? "bg-amber-50 text-amber-700" :
                          isFailed ? "bg-red-50 text-red-700" : "bg-zinc-100 text-zinc-700"
                        }`}>
                          {isPending && <Clock className="w-3 h-3" />}
                          {p.status}
                        </span>
                        {isPending && <SyncButton orderId={p.orderId} />}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-zinc-900 flex items-center justify-between w-full min-w-[150px]">
                      <span>Rp {p.amount.toLocaleString("id-ID")}</span>
                      {isPending && subscription?.midtransOrderId === p.orderId && subscription?.midtransToken && (
                        <ContinuePaymentButton snapToken={subscription.midtransToken} />
                      )}
                    </td>
                  </tr>
                );
              })}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                      <History className="w-8 h-8 mb-3 opacity-20" />
                      <p className="text-sm">Belum ada riwayat pembayaran.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
