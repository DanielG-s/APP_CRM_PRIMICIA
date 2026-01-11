"use client";

import { useSidebar } from "../contexts/SidebarContext";
import { Sidebar } from "./Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Conteúdo Principal com Margem Dinâmica */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'}`}
      >
        {children}
      </div>
    </div>
  );
}