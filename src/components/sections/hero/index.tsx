import Link from "next/link";

import { Button } from "@/components/ui/button";
import SectionContainer from "@/components/sections/section-container";
import { WordAnimation } from "./word-animation";

export function Hero() {
  return (
    <div className="relative mt-10">
      <SectionContainer className="pt-8 pb-10 md:pt-16 overflow-hidden">
        <div className="relative">
          <div className="mx-auto">
            <div className="mx-auto max-w-2xl lg:col-span-6 lg:flex lg:items-center justify-center text-center">
              <div className="relative z-10 lg:h-auto pt-[90px] lg:pt-[90px] lg:min-h-[300px] flex flex-col items-center justify-center sm:mx-auto md:w-3/4 lg:mx-0 lg:w-full gap-4 lg:gap-8">
                <div className="flex flex-col items-center">
                  <h1 className="text-foreground text-3xl sm:text-4xl sm:leading-none lg:text-6xl">
                    <span className="block text-foreground">
                      Connect and Team Up to work on <WordAnimation />
                    </span>
                  </h1>
                  <p className="pt-2 text-foreground my-3 text-sm sm:mt-5 lg:mb-0 sm:text-base lg:text-lg">
                    Teamup Circle is an open source platform for developers to
                    team up. Easily discover and connect. Find open-source
                    projects, join a hackathon,{" "}
                    <br className="hidden sm:block" /> or build SaaS with
                    others.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild>
                    <Link href="/login">Join now</Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="#timeline">See the roadmap</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
