"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../contexts/SidebarContext";
import { UserButton } from "@clerk/nextjs";
import {
    Home, Users, BarChart2, PieChart as PieIcon,
    CalendarRange, MessageCircle, ChevronLeft, ChevronRight,
    Layers, Settings, Moon, Sun, X
} from "lucide-react";
import { useTheme } from "next-themes";

function NavItem({
    icon, label, href, isCollapsed, onClick
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    isCollapsed: boolean;
    onClick?: () => void;
}) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} onClick={onClick}>
            <div className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-all group relative ${isActive ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                <div className="shrink-0">{icon}</div>

                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {label}
                </span>

                {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                        {label}
                    </div>
                )}
            </div>
        </Link>
    );
}

interface SidebarProps {
    isMobileDrawer?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isMobileDrawer = false, onClose }: SidebarProps) {
    const { isCollapsed, toggleSidebar } = useSidebar();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // In mobile drawer mode: always expanded, relative positioned, full height
    // In desktop mode: fixed, height screen, collapsible
    const containerClasses = isMobileDrawer
        ? "bg-[#0f172a] text-slate-300 flex flex-col w-72 h-full shadow-2xl"
        : `bg-[#0f172a] text-slate-300 hidden lg:flex flex-col shrink-0 shadow-2xl z-30 h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`;

    const effectiveCollapsed = isMobileDrawer ? false : isCollapsed;

    return (
        <aside className={containerClasses}>
            {/* HEADER DA SIDEBAR */}
            <div className="h-20 flex items-center justify-center relative border-b border-slate-800 transition-all">
                <div className="flex items-center gap-3 overflow-hidden px-4 w-full">
                    <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shrink-0">Q</div>

                    <span className={`font-bold text-xl tracking-tight text-white transition-all duration-300 ${effectiveCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                        Merxios
                    </span>
                </div>

                {/* Desktop collapse toggle */}
                {!isMobileDrawer && (
                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-9 bg-violet-600 text-white p-1 rounded-full shadow-lg hover:bg-violet-500 transition-colors z-50 border-2 border-[#0f172a]"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                )}

                {/* Mobile drawer close button */}
                {isMobileDrawer && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* NAVEGAÇÃO */}
            <nav className="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden px-1 scrollbar-hide">
                <NavItem href="/" icon={<Home size={20} />} label="Visão Geral" isCollapsed={effectiveCollapsed} onClick={onClose} />
                <NavItem href="/clients" icon={<Users size={20} />} label="Carteira de Clientes" isCollapsed={effectiveCollapsed} onClick={onClose} />

                {/* ANALYTICS */}
                <div className={`mt-6 mb-2 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-opacity ${effectiveCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'}`}>Analytics</div>
                {effectiveCollapsed && <div className="my-4 border-t border-slate-800 mx-4"></div>}

                <NavItem href="/results/retail" icon={<BarChart2 size={20} />} label="Performance Varejo" isCollapsed={effectiveCollapsed} onClick={onClose} />
                <NavItem href="/results/channels" icon={<PieIcon size={20} />} label="Canais & Origem" isCollapsed={effectiveCollapsed} onClick={onClose} />
                <NavItem href="/results/schedule" icon={<CalendarRange size={20} />} label="Agenda" isCollapsed={effectiveCollapsed} onClick={onClose} />

                {/* ENGAJAMENTO */}
                <div className={`mt-6 mb-2 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-opacity ${effectiveCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'}`}>Engajamento</div>
                {effectiveCollapsed && <div className="my-4 border-t border-slate-800 mx-4"></div>}

                <NavItem href="/campaigns" icon={<MessageCircle size={20} />} label="Campanhas" isCollapsed={effectiveCollapsed} onClick={onClose} />
                <NavItem href="/segments/list" icon={<Layers size={20} />} label="Segmentos" isCollapsed={effectiveCollapsed} onClick={onClose} />

                {/* SISTEMA / CONFIGURAÇÕES */}
                <div className={`mt-6 mb-2 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-opacity ${effectiveCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'}`}>Sistema</div>
                {effectiveCollapsed && <div className="my-4 border-t border-slate-800 mx-4"></div>}

                <NavItem href="/settings" icon={<Settings size={20} />} label="Configurações" isCollapsed={effectiveCollapsed} onClick={onClose} />
            </nav>

            {/* PROFILE & THEME SECTION */}
            <div className="absolute bottom-4 left-0 w-full px-4 flex flex-col gap-2">
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className={`p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-row items-center cursor-pointer shadow-lg backdrop-blur-sm transition-all overflow-hidden hover:bg-slate-800/80 ${effectiveCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                    >
                        <div className="shrink-0 flex items-center justify-center text-slate-400">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </div>
                        <span className={`text-sm font-medium transition-all duration-300 overflow-hidden text-slate-200 ${effectiveCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 flex-1 text-left'}`}>
                            Tema {theme === 'dark' ? 'Claro' : 'Escuro'}
                        </span>
                    </button>
                )}

                <div className={`p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center shadow-lg backdrop-blur-sm transition-all overflow-hidden ${effectiveCollapsed ? 'justify-center' : 'justify-start gap-3'}`}>
                    <div className="shrink-0 flex items-center justify-center">
                        <UserButton />
                    </div>

                    <span className={`text-sm font-medium transition-all duration-300 overflow-hidden text-slate-200 ${effectiveCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 flex-1'}`}>
                        <Link href="/profile" onClick={onClose} className="block w-full hover:text-violet-400">Meu Perfil</Link>
                    </span>
                </div>
            </div>
        </aside>
    );
}
