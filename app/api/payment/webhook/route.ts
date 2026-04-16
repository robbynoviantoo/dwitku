import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Verifikasi signature Midtrans
  const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (hash !== signature_key) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  // Cari payment
  const payment = await prisma.payment.findUnique({ where: { orderId: order_id } });
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Update status
  if (
    transaction_status === "capture" ||
    transaction_status === "settlement"
  ) {
    await prisma.payment.update({
      where: { orderId: order_id },
      data: { status: "SUCCESS", paidAt: new Date(), midtransData: body },
    });

    // Aktifkan subscription 30 hari dari sekarang
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
    transaction_status === "deny" ||
    transaction_status === "cancel" ||
    transaction_status === "expire"
  ) {
    await prisma.payment.update({
      where: { orderId: order_id },
      data: { status: "FAILED", midtransData: body },
    });
  } else if (transaction_status === "refund") {
    await prisma.payment.update({
      where: { orderId: order_id },
      data: { status: "REFUNDED", midtransData: body },
    });
    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
