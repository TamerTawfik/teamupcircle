import { cn } from "@/lib/utils";
import Link from "next/link";
import { HeroMap } from "./hero-map";
import { Button } from "@/components/ui/button";
import { WordAnimation } from "./word-animation";

export function Hero() {
  return (
    <HeroContainer>
      {/* Content */}
      <div className="container mx-auto md:pl-14 pr-4 overflow-hidden md:overflow-visible">
        <section className="mt-[160px] lg:mt-[250px] min-h-[530px] relative lg:h-[calc(100vh-300px)]">
          <div className="flex flex-col">
            <div className="hidden md:block">
              <Button
                variant="outline"
                className="rounded-full border-border flex space-x-2 items-center cursor-default"
              >
                <span className="font-mono text-xs">Pre-alpha release</span>
              </Button>
            </div>

            <h2 className="mt-6 md:mt-10 max-w-[580px] text-foreground/80 dark:text-[#878787] leading-tight text-[24px] md:text-[36px] font-medium">
              Connect, Team up, Create, Project matchmaking, Skill-based
              discovery all made for <WordAnimation />
            </h2>

            <div className="mt-8 md:mt-10">
              <div className="flex items-center space-x-4">
                <Link href="/members" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="border-transparent h-11 px-6 dark:bg-[#1D1D1D] bg-[#F2F1EF]"
                  >
                    Connect with developers
                  </Button>
                </Link>

                <Link href="/login">
                  <Button className="h-11 px-5">Start now</Button>
                </Link>
              </div>
            </div>

            <p className="text-xs text-foreground/80 dark:text-[#707070] mt-4 font-mono">
              Join with your GitHub account, no registration required.
            </p>
          </div>
        </section>
      </div>
    </HeroContainer>
  );
}

export function HeroContainer({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <section className={cn("overflow-hidden relative bg-white dark:bg-black")}>
      {/* Map */}
      <HeroMap />

      <div className={cn("relative z-10", className)}>{children}</div>
    </section>
  );
}
