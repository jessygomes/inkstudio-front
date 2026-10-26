"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      storageKey="inkera-appearance"
      defaultTheme="dark"
      themes={["dark", "light"]}
      enableSystem={false}
      enableColorScheme={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
