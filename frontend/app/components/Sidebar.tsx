"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../contexts/SidebarContext"; 
import {
  Home, Users, BarChart2, PieChart as PieIcon, 
  CalendarRange, MessageCircle, Target, ChevronLeft, ChevronRight, 
  Layers // <--- 1. Importei o ícone Layers para Segmentos
} from "lucide-react";

// O componente NavItem permanece igual
function NavItem({ icon, label, href, isCollapsed }: { icon: React.ReactNode, label: string, href: string, isCollapsed: boolean }) {
    const pathname = usePathname();
    const isActive = pathname === href; 

    return (
        <Link href={href}>
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
    )
}

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside 
        className={`bg-[#0f172a] text-slate-300 flex flex-col shrink-0 shadow-2xl z-30 h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'} 
        `}
    >
        {/* HEADER DA SIDEBAR */}
        <div className="h-20 flex items-center justify-center relative border-b border-slate-800 transition-all">
            <div className="flex items-center gap-3 overflow-hidden px-4 w-full">
                <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shrink-0">Q</div>
                
                <span className={`font-bold text-xl tracking-tight text-white transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                    QUANTIX
                </span>
            </div>

            <button 
                onClick={toggleSidebar} 
                className="absolute -right-3 top-9 bg-violet-600 text-white p-1 rounded-full shadow-lg hover:bg-violet-500 transition-colors z-50 border-2 border-[#0f172a]"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
        </div>
        
        {/* NAVEGAÇÃO */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden px-1">
            <NavItem href="/" icon={<Home size={20}/>} label="Visão Geral" isCollapsed={isCollapsed} />
            <NavItem href="/clients" icon={<Users size={20}/>} label="Carteira de Clientes" isCollapsed={isCollapsed} />
            
            {/* ANALYTICS */}
            <div className={`mt-6 mb-2 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-opacity ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'}`}>Analytics</div>
            {isCollapsed && <div className="my-4 border-t border-slate-800 mx-4"></div>}
            
            <NavItem href="/results/retail" icon={<BarChart2 size={20}/>} label="Performance Varejo" isCollapsed={isCollapsed} />
            <NavItem href="/results/channels" icon={<PieIcon size={20}/>} label="Canais & Origem" isCollapsed={isCollapsed} />
            <NavItem href="/results/schedule" icon={<CalendarRange size={20}/>} label="Agenda" isCollapsed={isCollapsed} />

            {/* ENGAJAMENTO */}
            <div className={`mt-6 mb-2 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-opacity ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'}`}>Engajamento</div>
            {isCollapsed && <div className="my-4 border-t border-slate-800 mx-4"></div>}
            
            <NavItem href="/campaigns" icon={<MessageCircle size={20}/>} label="Campanhas" isCollapsed={isCollapsed} />
            
            {/* --- 2. NOVO ITEM ADICIONADO AQUI --- */}
            <NavItem href="/segments" icon={<Layers size={20}/>} label="Segmentos" isCollapsed={isCollapsed} />
            
            <NavItem href="/goals" icon={<Target size={20}/>} label="Metas & Objetivos" isCollapsed={isCollapsed} />
        </nav>
    </aside>
  );
}