"use client";

import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/sections/hero";
import { CTA } from "@/components/sections/cta";
import { GithubCTA } from "@/components/sections/github-cta";
import { Footer } from "@/components/sections/footer";
import content from "@/components/sections/content";
import FeaturesSection from "@/components/sections/features";
import { Timeline } from "@/components/sections/timeline";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CTA />
        <FeaturesSection {...content.featuresSection} />
        <Timeline />
        <GithubCTA className="flex flex-col items-center max-w-5xl mx-auto mt-40 mb-28" />
        <Footer />
      </main>
    </>
  );
}
