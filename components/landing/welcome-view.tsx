"use client";

import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingEditors } from "@/components/landing/editors";
import { LandingComparison } from "@/components/landing/comparison";
import { LandingHeroCTA } from "@/components/landing/hero-cta";
import { LandingAboutInled } from "@/components/landing/about-inled";

export function WelcomeView() {
  return (
    <div className="theme-light min-h-screen bg-white text-foreground selection:bg-primary/20">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingEditors />
        <LandingComparison />
        <LandingHeroCTA />
        <LandingAboutInled />
      </main>
      <LandingFooter />
    </div>
  );
}
