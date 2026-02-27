"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, BarChart2, UserCircle } from "lucide-react";

const NAV_ITEMS = [
    { href: "/", icon: Home, label: "Início" },
    { href: "/clients", icon: Users, label: "Clientes" },
    { href: "/results/retail", icon: BarChart2, label: "Dashboard" },
    { href: "/profile", icon: UserCircle, label: "Perfil" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0f172a] border-t border-slate-800 safe-area-inset-bottom">
            <div className="flex h-16">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] ${
                                isActive
                                    ? "text-violet-400"
                                    : "text-slate-500 hover:text-slate-300 active:text-slate-200"
                            }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
