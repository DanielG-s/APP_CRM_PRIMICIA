"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { API_BASE_URL } from "@/lib/config";

interface Role {
    id: string;
    name: string;
    level: number;
    permissions: string[];
}

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: Role;
    tenantId: string;
    organizationName: string;
}

interface RBACContextType {
    profile: UserProfile | null;
    loading: boolean;
    hasPermission: (permission: string) => boolean;
}

const RBACContext = createContext<RBACContextType>({
    profile: null,
    loading: true,
    hasPermission: () => false,
});

export const RBACProvider = ({ children }: { children: React.ReactNode }) => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            if (!isLoaded) return;
            if (!isSignedIn) {
                setProfile(null);
                setLoading(false);
                return;
            }

            try {
                const token = await getToken();
                if (!token) throw new Error("No token");

                const res = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await res.json();
                setProfile(data);
            } catch (error) {
                console.error("Erro ao carregar perfil RBAC:", error);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [isLoaded, isSignedIn, getToken]);

    const hasPermission = (permission: string) => {
        if (!profile || !profile.role) return false;
        if (profile.role.level === 0) return true; // Super Admin always has full access
        return profile.role.permissions?.includes(permission) || false;
    };

    return (
        <RBACContext.Provider value={{ profile, loading, hasPermission }}>
            {children}
        </RBACContext.Provider>
    );
};

export const useRBAC = () => useContext(RBACContext);
