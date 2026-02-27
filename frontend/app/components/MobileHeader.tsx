"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import React from "react";

export function MobileHeader() {
    const { openMobile } = useSidebar();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-20 lg:hidden bg-[#0f172a] border-b border-slate-800 h-16 flex items-center justify-between px-4 shrink-0">
            <button
                onClick={openMobile}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Abrir menu"
            >
                <Menu size={22} />
            </button>

            <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg">
                    Q
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Merxios</span>
            </div>

            <div className="flex items-center gap-1">
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Alternar tema"
                    >
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                )}
                <div className="flex items-center justify-center min-w-[44px] min-h-[44px]">
                    <UserButton />
                </div>
            </div>
        </header>
    );
}
