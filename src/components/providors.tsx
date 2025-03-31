"use client";

import React, { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render nothing or a placeholder on the server,
    // or return the children directly to avoid content layout shifts
    // if your layout doesn't heavily depend on the theme for initial structure.
    // Returning children directly is often better for initial layout.
    return <>{children}</>;
    // Alternatively, return null if it makes sense for your app structure
    // return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <TailwindIndicator />
      </ThemeProvider>
      <Toaster />
    </SessionProvider>
  );
}
