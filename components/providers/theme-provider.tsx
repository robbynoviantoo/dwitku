"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme as useNextTheme } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
}

// Re-export useTheme from next-themes so sidebar can use it
export function useTheme() {
  const { theme, setTheme } = useNextTheme();
  return {
    theme: (theme ?? "light") as "light" | "dark",
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
