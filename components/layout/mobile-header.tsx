"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";

export function MobileHeader() {
    const { setMobileOpen } = useSidebar();

    return (
        <header className="md:hidden flex items-center mt-5 h-14 px-4 sticky top-0 z-0  border-b border-zinc-100">
            <button
                onClick={() => setMobileOpen(true)}
                className="p-3 rounded-lg text-zinc-500 bg-white hover:text-zinc-900 transition-colors"
            >
                <Menu className="w-8 h-8" />
            </button>
        </header>
    );
}
