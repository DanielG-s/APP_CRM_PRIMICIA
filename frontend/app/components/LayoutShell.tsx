"use client";

import { useSidebar } from "../contexts/SidebarContext";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MobileHeader } from "./MobileHeader";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#020817] text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Desktop Sidebar — visível apenas em lg+, renderizada pela própria classe interna */}
      <Sidebar />

      {/* Mobile Drawer Overlay — visível apenas em < lg quando aberto */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
            aria-hidden="true"
          />
          {/* Drawer deslizante da esquerda */}
          <div className="absolute left-0 top-0 h-full animate-in slide-in-from-left duration-300">
            <Sidebar isMobileDrawer onClose={closeMobile} />
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out pb-16 lg:pb-0 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Header mobile (hambúrguer + logo + tema) — oculto em lg+ */}
        <MobileHeader />

        {/* Conteúdo da página */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Bottom Navigation — visível apenas em < lg */}
      <BottomNav />
    </div>
  );
}
