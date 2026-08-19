import { LandingNavbar } from "./_components/landing-navbar";
import { LandingHero } from "./_components/landing-hero";
import { LandingPreview } from "./_components/landing-preview";
import { LandingFeatures } from "./_components/landing-features";
import { LandingPricing } from "./_components/landing-pricing";
import { LandingFooter } from "./_components/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-green-100 selection:text-green-900">
      {/* ── 1. Navbar ── */}
      <LandingNavbar />

      {/* ── 2. Hero Section ── */}
      <LandingHero />

      {/* ── 3. App Mockup Preview ── */}
      <LandingPreview />

      {/* ── 4. Key Features ── */}
      <LandingFeatures />

      {/* ── 5. Pricing Plans ── */}
      <LandingPricing />

      {/* ── 6. Footer ── */}
      <LandingFooter />
    </div>
  );
}
