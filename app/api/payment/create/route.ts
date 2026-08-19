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

  const { planKey, billingCycle = "monthly" } = await req.json();
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

  const isYearly = billingCycle === "yearly";
  const rawPrice = isYearly
    ? plan.priceYearly > 0
      ? plan.priceYearly
      : plan.priceMonthly * 10
    : plan.priceMonthly;

  // Cek apakah user saat ini sedang aktif paket BASIC dan ingin UPGRADE ke PRO
  const existingSub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  const isUpgrade =
    existingSub &&
    existingSub.status === "ACTIVE" &&
    existingSub.plan?.key === "basic" &&
    planKey === "pro";

  let price = rawPrice;
  let itemName = `Dwitku ${plan.name} — ${isYearly ? "1 Tahun (Tahunan)" : "1 Bulan"}`;

  if (isUpgrade) {
    const basicPlan = existingSub.plan;
    const now = Date.now();
    const periodEndMs = existingSub.currentPeriodEnd
      ? new Date(existingSub.currentPeriodEnd).getTime()
      : now;
    const msRemaining = Math.max(0, periodEndMs - now);
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    // Nilai harian paket Basic
    const isBasicYearly =
      daysRemaining > 31 ||
      (existingSub.midtransOrderId && existingSub.midtransOrderId.includes("YEARLY"));
    const basicDailyRate = isBasicYearly
      ? (basicPlan.priceYearly > 0
          ? basicPlan.priceYearly
          : basicPlan.priceMonthly * 10) / 365
      : basicPlan.priceMonthly / 30;

    // Kredit sisa Basic yang belum terpakai
    const unusedCredit = Math.min(
      Math.round(daysRemaining * basicDailyRate),
      rawPrice - 1000
    );

    // Harga upgrade setelah dipotong sisa kredit Basic
    const proratedPrice = rawPrice - unusedCredit;
    price = Math.max(proratedPrice, 1000);

    itemName = `Upgrade ke Pro (${isYearly ? "1 Tahun" : "30 Hari"} — Kredit Basic ${daysRemaining} hari: -Rp ${unusedCredit.toLocaleString("id-ID")})`;
  }

  const orderId = `DWITKU-${isUpgrade ? "UPGRADE-PRO" : planKey.toUpperCase()}-${isYearly ? "YEARLY" : "MONTHLY"}-${session.user.id.slice(-6)}-${Date.now()}`;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: price,
    },
    customer_details: {
      first_name: user.name ?? "Pengguna",
      email: user.email,
    },
    item_details: [
      {
        id: `${plan.key}-${isYearly ? "yearly" : "monthly"}${isUpgrade ? "-upgrade" : ""}`,
        name: itemName,
        price: price,
        quantity: 1,
      },
    ],
    callbacks: {
      finish: `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/billing?status=finish`,
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
        data: { planId: plan.id, midtransOrderId: orderId, midtransToken: transaction.token },
      });
      await prisma.payment.upsert({
        where: { orderId },
        update: { amount: price },
        create: {
          subscriptionId: existingSub.id,
          orderId,
          amount: price,
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
          amount: price,
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
