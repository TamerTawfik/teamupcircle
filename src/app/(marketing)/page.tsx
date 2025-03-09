import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/sections/hero";
import { WhySection } from "@/components/sections/features";
import { FeatureGrid } from "@/components/sections/features/feature-grid";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.description}`,
};

export default async function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-white dark:bg-black">
        <Hero />
        <WhySection />
        <FeatureGrid className="flex flex-col items-center max-w-5xl mx-auto" />
        <CTA className="flex flex-col items-center max-w-5xl mx-auto mt-40 mb-28" />
        <Footer />
      </main>
    </>
  );
}
