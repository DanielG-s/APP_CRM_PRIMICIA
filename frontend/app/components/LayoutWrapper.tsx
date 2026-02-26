"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "../contexts/SidebarContext";
import LayoutShell from "./LayoutShell";

import { RBACProvider } from "../contexts/RBACContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // If the user is on an authentication page, don't show the sidebar or shell
    if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
        return <>{children}</>;
    }

    // Otherwise, wrap with the standard CRM layout
    return (
        <RBACProvider>
            <SidebarProvider>
                <LayoutShell>
                    {children}
                </LayoutShell>
            </SidebarProvider>
        </RBACProvider>
    );
}
