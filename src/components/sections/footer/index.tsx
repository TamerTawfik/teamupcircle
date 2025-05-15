import { ModeToggle } from "@/components/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import SectionContainer from "@/components/sections/section-container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full !py-0">
      <SectionContainer>
        <div className="border-default flex justify-between border-t pt-8">
          <small className="text-sm text-muted-foreground">
            &copy; {currentYear} made with ❤️ by{" "}
            <Link target="_blank" href="https://github.com/TamerTawfik">
              Tamer Tawfik
            </Link>
          </small>
          <div>
            <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
              <ModeToggle className="border-none -mt-4" />
            </Suspense>
          </div>
        </div>
      </SectionContainer>
    </footer>
  );
}
