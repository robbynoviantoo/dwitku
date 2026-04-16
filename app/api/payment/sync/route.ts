import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import midtransClient from "midtrans-client";

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { subscription: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.subscription.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Ping Midtrans API
    const response = await coreApi.transaction.status(orderId);
    const transactionStatus = response.transaction_status;

    let newStatus = payment.status;

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      newStatus = "SUCCESS";
      
      await prisma.payment.update({
        where: { orderId },
        data: { status: "SUCCESS", paidAt: new Date(), midtransData: response },
      });

      // Aktifkan subscription 30 hari
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
          trialEndsAt: null,
        },
      });
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire"
    ) {
      newStatus = "FAILED";
      await prisma.payment.update({
        where: { orderId },
        data: { status: "FAILED", midtransData: response },
      });
    } else if (transactionStatus === "refund") {
      newStatus = "REFUNDED";
      await prisma.payment.update({
        where: { orderId },
        data: { status: "REFUNDED", midtransData: response },
      });
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error("Payment sync error:", error);
    // Jika '404' dari midtrans di sandbox, biasanya transaction belum selesai
    // atau order_id invalid.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
