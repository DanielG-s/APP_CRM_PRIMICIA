"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";

interface ResponsiveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    /** Altura máxima do bottom sheet (padrão: 85vh) */
    maxHeightMobile?: string;
}

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < breakpoint);
        check();
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        mql.addEventListener("change", check);
        return () => mql.removeEventListener("change", check);
    }, [breakpoint]);

    return isMobile;
}

/**
 * Modal responsivo:
 * - Mobile (< 768px): Bottom Sheet deslizante de baixo para cima
 * - Desktop (≥ 768px): Dialog centralizado padrão
 */
export function ResponsiveModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    maxHeightMobile = "85vh",
}: ResponsiveModalProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl overflow-y-auto p-6"
                    style={{ maxHeight: maxHeightMobile }}
                >
                    {(title || description) && (
                        <SheetHeader className="mb-4">
                            {title && <SheetTitle>{title}</SheetTitle>}
                            {description && <SheetDescription>{description}</SheetDescription>}
                        </SheetHeader>
                    )}
                    {children}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {(title || description) && (
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                )}
                {children}
            </DialogContent>
        </Dialog>
    );
}
