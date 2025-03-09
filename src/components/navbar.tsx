"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StarusButton } from "./starus-button";
import { Logo } from "@/components/logo";
import { Button } from "./ui/button";
import { siteConfig } from "@/config/site";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // If click outside of the menu, close it
    const handleClick = (e: MouseEvent) => {
      if (isMobileMenuOpen && !navbarRef.current?.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-4 z-50 w-full" ref={navbarRef}>
      <div className="container">
        <div
          className={cn(
            "flex justify-between border border-transparent items-center p-4 -mx-4 rounded-full transition-colors",
            isScrolled
              ? "bg-background/90 border-foreground/10"
              : "bg-transparent"
          )}
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="row items-center font-medium">
              <Logo className="h-8" />
              <span className="-ml-4 text-lg">{siteConfig.name}</span>
            </Link>
          </div>

          <div className="row items-center gap-8">
            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              <StarusButton />
              {/* Sign in button */}
              <Button asChild>
                <Link className="hidden md:flex font-light" href="/login">
                  Sign in
                </Link>
              </Button>
              <Button
                className="md:hidden -my-2"
                size="icon"
                variant="ghost"
                onClick={() => {
                  setIsMobileMenuOpen((p) => !p);
                }}
              >
                <MenuIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden -mx-4"
            >
              <div className="rounded-xl bg-background/90 border border-foreground/10 mt-4 md:hidden backdrop-blur-lg">
                <div className="col text-sm divide-y divide-foreground/10">
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-foreground hover:bg-foreground/5"
                  >
                    Sign in
                  </Link>
                  <Link
                    href={siteConfig.links.github}
                    className="block px-4 py-3 text-foreground hover:bg-foreground/5"
                  >
                    GitHub
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
