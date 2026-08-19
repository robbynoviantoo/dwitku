"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

export function LenisProvider({ children }: { children: ReactNode }) {
  // Lenis dinonaktifkan sesuai kebutuhan saat ini
  return <>{children}</>;
}
