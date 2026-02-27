"use client";

import React, { createContext, useContext, useState } from "react";

type SidebarContextType = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, isMobileOpen, openMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar deve ser usado dentro de um SidebarProvider");
  }
  return context;
}
