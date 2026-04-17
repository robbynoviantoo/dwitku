import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
// @ts-ignore — midtrans-client tidak punya type declarations resmi
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planKey } = await req.json();
  if (!planKey || !["basic", "pro"].includes(planKey)) {
    return NextResponse.json({ error: "Plan tidak valid" }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) {
    return NextResponse.json({ error: "Plan tidak ditemukan" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const orderId = `DWITKU-${planKey.toUpperCase()}-${session.user.id.slice(-6)}-${Date.now()}`;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: plan.priceMonthly,
    },
    customer_details: {
      first_name: user.name ?? "Pengguna",
      email: user.email,
    },
    item_details: [
      {
        id: plan.key,
        name: `Dwitku ${plan.name} — 1 Bulan`,
        price: plan.priceMonthly,
        quantity: 1,
      },
    ],
    callbacks: {
      finish: `${process.env.NEXTAUTH_URL}/billing?status=finish`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    // Simpan pending payment
    const existingSub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: { midtransOrderId: orderId, midtransToken: transaction.token },
      });
      await prisma.payment.upsert({
        where: { orderId },
        update: { amount: plan.priceMonthly },
        create: {
          subscriptionId: existingSub.id,
          orderId,
          amount: plan.priceMonthly,
          status: "PENDING",
        },
      });
    } else {
      const newSub = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          status: "EXPIRED",
          midtransOrderId: orderId,
          midtransToken: transaction.token,
        },
      });
      await prisma.payment.create({
        data: {
          subscriptionId: newSub.id,
          orderId,
          amount: plan.priceMonthly,
          status: "PENDING",
        },
      });
    }

    return NextResponse.json({ token: transaction.token });
  } catch (error: any) {
    console.error("SNAP Error:", error);
    return NextResponse.json({ 
      error: error?.message || "Terjadi kesalahan saat memproses pembayaran. Cek log server." 
    }, { status: 500 });
  }
}
