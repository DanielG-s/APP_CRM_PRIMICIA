"use client";

import { useEffect, useState } from "react";
import { useAuth, UserProfile } from "@clerk/nextjs";
import { Shield, Home } from "lucide-react";

interface BackendProfile {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
}

export default function ProfilePage() {
    const { getToken } = useAuth();
    const [profile, setProfile] = useState<BackendProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const token = await getToken();
                if (!token) return;

                const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
                const res = await fetch(`${url}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Erro ao carregar perfil do backend", err);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [getToken]);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meu Perfil</h1>
                <p className="text-slate-500 mt-1">Gerencie suas configurações de conta e visualize suas permissões de acesso.</p>
            </div>

            {loading ? (
                <div className="animate-pulse bg-slate-100 h-32 w-full rounded-2xl border border-slate-200"></div>
            ) : profile ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-800">{profile.name}</h2>
                        <p className="text-slate-500">{profile.email}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-violet-50 border border-violet-100 px-4 py-2 rounded-lg flex items-center gap-2">
                            <Shield size={18} className="text-violet-600" />
                            <div>
                                <p className="text-[10px] text-violet-500 font-bold uppercase tracking-wider">Perfil de Acesso</p>
                                <p className="font-medium text-violet-900 leading-none mt-1">{profile.role.replace('_', ' ')}</p>
                            </div>
                        </div>
                        {profile.tenantId && (
                            <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg flex items-center gap-2">
                                <Home size={18} className="text-blue-600" />
                                <div>
                                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">ID da Organização</p>
                                    <p className="font-medium text-blue-900 leading-none mt-1 truncate max-w-[120px]" title={profile.tenantId}>{profile.tenantId}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl">Falha ao carregar permissões do sistema.</div>
            )}

            {/* Clerk UserProfile Container */}
            <div className="w-full flex justify-center py-6">
                <UserProfile
                    routing="hash"
                    appearance={{
                        elements: {
                            card: "shadow-none border border-slate-200",
                            rootBox: "w-full max-w-full",
                        }
                    }}
                />
            </div>
        </div>
    );
}
