import { prisma } from "@/lib/prisma";
import { LandingNavbar } from "./_components/landing-navbar";
import { LandingHero } from "./_components/landing-hero";
import { LandingPreview } from "./_components/landing-preview";
import { LandingFeatures } from "./_components/landing-features";
import { LandingPricing } from "./_components/landing-pricing";
import { LandingPrivacyCommitment } from "./_components/landing-privacy-commitment";
import { LandingFooter } from "./_components/landing-footer";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const dbPlans = await prisma.plan
    .findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: "asc" },
    })
    .catch(() => []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-green-100 selection:text-green-900">
      {/* ── 1. Navbar ── */}
      <LandingNavbar />

      {/* ── Top Hero & Preview Section with Aurora Emerald Glow & Precision Grid Mesh (100vh Fullscreen Fold) ── */}
      <div className="relative overflow-hidden bg-[#fafbfa] dark:bg-[#070b0e] min-h-[100dvh] flex flex-col justify-between">
        {/* 1. Precision Grid Mesh Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#004C2912_1px,transparent_1px),linear-gradient(to_bottom,#004C2912_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_65%_at_50%_35%,black_40%,transparent_100%)]" />

        {/* 2. Top-Center Ambient Aurora Emerald Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(0,76,41,0.18),rgba(16,185,129,0.09)_35%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(0,76,41,0.35),rgba(5,150,105,0.15)_40%,transparent_75%)] pointer-events-none blur-3xl select-none" />

        {/* 3. Subtle Flank Ambient Glows (Left & Right) */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none select-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#004C29]/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none select-none" />

        {/* 4. Bottom Smooth Fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fafbfa] via-[#fafbfa]/60 to-transparent dark:from-[#070b0e] dark:via-[#070b0e]/60 pointer-events-none z-10 select-none" />

        {/* ── Content on top spanning 100vh ── */}
        <div className="relative z-20 flex-1 flex flex-col justify-between">
          {/* ── 2. Hero Section ── */}
          <LandingHero />

          {/* ── 3. App Mockup Preview (Anchored at Bottom of 100vh) ── */}
          <LandingPreview />
        </div>
      </div>

      {/* ── 4. Key Features ── */}
      <LandingFeatures />

      {/* ── 5. Financial Privacy Commitment CTA ── */}
      <LandingPrivacyCommitment />

      {/* ── 6. Pricing Plans ── */}
      <LandingPricing dbPlans={dbPlans} />

      {/* ── 7. Footer ── */}
      <LandingFooter />
    </div>
  );
}
