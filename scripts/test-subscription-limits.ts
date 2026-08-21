import { PLAN_LIMITS, isWithinLimit, isUnlimited, getPlanKey, PlanKey } from "../lib/subscription-limits";

console.log("=== RUNNING SUBSCRIPTION & TRANSACTION LIMIT TEST SUITE ===\n");

function simulateLimitCheck({
  sub,
  userCount,
  now = new Date(),
}: {
  sub: {
    status: "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELLED";
    currentPeriodEnd: Date | null;
    plan: { key: string; maxTx: number; name: string };
  } | null;
  userCount: number;
  now?: Date;
}) {
  // Logic from getUserPlanLimits
  let effectiveLimits = {
    maxTx: 50, // default free plan
    planKey: "free",
  };

  const isSubValid =
    sub &&
    (sub.status === "ACTIVE" || sub.status === "TRIAL") &&
    sub.currentPeriodEnd &&
    sub.currentPeriodEnd > now;

  if (isSubValid) {
    effectiveLimits = {
      maxTx: sub.plan.maxTx,
      planKey: sub.plan.key,
    };
  }

  const isAllowed = isWithinLimit(userCount, effectiveLimits.maxTx);
  let errorMessage: string | null = null;
  if (!isAllowed) {
    errorMessage = `Batas transaksi tercapai (Maksimal ${effectiveLimits.maxTx} transaksi/bulan untuk paket saat ini). Silakan upgrade paket langganan.`;
  }

  return {
    isSubValid: !!isSubValid,
    effectiveLimits,
    isAllowed,
    errorMessage,
  };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`, detail || "");
  }
}

// TEST 1: User Free (No subscription) dengan 49 transaksi -> Transaksi ke-50 diizinkan
{
  const result = simulateLimitCheck({
    sub: null,
    userCount: 49,
  });
  assert(
    result.isAllowed === true && result.effectiveLimits.maxTx === 50,
    "Test 1: User Free dengan 49 tx dapat membuat transaksi ke-50"
  );
}

// TEST 2: User Free dengan 50 transaksi (mencapai limit) -> Ditolak dengan pesan limit
{
  const result = simulateLimitCheck({
    sub: null,
    userCount: 50,
  });
  assert(
    result.isAllowed === false &&
      result.errorMessage?.includes("Maksimal 50 transaksi/bulan") === true,
    "Test 2: User Free dengan 50 tx ditolak dan muncul pesan batas limit 50/bulan"
  );
}

// TEST 3: User mengaktifkan TRIAL PRO (Status: TRIAL, currentPeriodEnd: +7 days)
{
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const result = simulateLimitCheck({
    sub: {
      status: "TRIAL",
      currentPeriodEnd: future,
      plan: { key: "pro", maxTx: -1, name: "Pro" },
    },
    userCount: 150, // Sebelumnya sudah ada 150 tx
  });
  assert(
    result.isSubValid === true &&
      result.effectiveLimits.maxTx === -1 &&
      result.isAllowed === true,
    "Test 3: User dengan TRIAL PRO aktif (maxTx: -1) lolos transaksi berapapun"
  );
}

// TEST 4: User mengaktifkan TRIAL BASIC (Status: TRIAL, maxTx: 500)
{
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const resultValid = simulateLimitCheck({
    sub: {
      status: "TRIAL",
      currentPeriodEnd: future,
      plan: { key: "basic", maxTx: 500, name: "Basic" },
    },
    userCount: 200,
  });
  assert(
    resultValid.isSubValid === true &&
      resultValid.effectiveLimits.maxTx === 500 &&
      resultValid.isAllowed === true,
    "Test 4a: User dengan TRIAL BASIC (200/500 tx) lolos transaksi"
  );

  const resultLimit = simulateLimitCheck({
    sub: {
      status: "TRIAL",
      currentPeriodEnd: future,
      plan: { key: "basic", maxTx: 500, name: "Basic" },
    },
    userCount: 500,
  });
  assert(
    resultLimit.isAllowed === false &&
      resultLimit.errorMessage?.includes("Maksimal 500 transaksi/bulan") === true,
    "Test 4b: User dengan TRIAL BASIC saat mencapai 500 tx dibatasi sesuai limit 500"
  );
}

// TEST 5: TRIAL yang sudah EXPIRED (currentPeriodEnd di masa lalu)
{
  const past = new Date(Date.now() - 1000);
  const result = simulateLimitCheck({
    sub: {
      status: "TRIAL",
      currentPeriodEnd: past,
      plan: { key: "pro", maxTx: -1, name: "Pro" },
    },
    userCount: 60,
  });
  assert(
    result.isSubValid === false &&
      result.effectiveLimits.maxTx === 50 &&
      result.isAllowed === false,
    "Test 5: TRIAL yang expired otomatis kembali ke limit Free (50 tx) dan memblokir tx jika > 50"
  );
}

// TEST 6: Subscription ACTIVE berbayar
{
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const result = simulateLimitCheck({
    sub: {
      status: "ACTIVE",
      currentPeriodEnd: future,
      plan: { key: "pro", maxTx: -1, name: "Pro" },
    },
    userCount: 9999,
  });
  assert(
    result.isSubValid === true &&
      result.effectiveLimits.maxTx === -1 &&
      result.isAllowed === true,
    "Test 6: Subscription ACTIVE berbayar Pro mengizinkan transaksi unlimited"
  );
}

console.log(`\n========================================`);
console.log(`SUMMARY: ${passedTests} / ${totalTests} tests passed!`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
