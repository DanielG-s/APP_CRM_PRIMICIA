"use client";

import React, { useEffect, useState, useDeferredValue, useMemo, useRef } from 'react';
import {
    Users, Search, Filter, ChevronLeft, ChevronRight,
    ArrowUp, ArrowDown, Target, Check, Calendar, Mail, Phone, ShoppingBag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { API_BASE_URL } from "@/lib/config";
import { useAuth, useUser } from "@clerk/nextjs";

// --- CORES DAS TAGS ---
const RFM_COLORS: any = {
    'VIP': 'bg-violet-100 text-violet-700 border-violet-200',
    'Leal': 'bg-blue-50 text-blue-700 border-blue-100',
    'Novo': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Em Risco': 'bg-amber-50 text-amber-700 border-amber-100',
    'Inativo': 'bg-slate-100 text-slate-500 border-slate-200',
    'Lead': 'bg-gray-50 text-gray-500 border-gray-200'
};

const SEGMENTS_OPTIONS = ['VIP', 'Leal', 'Novo', 'Em Risco', 'Inativo', 'Lead'];

/**
 * Clients Page Component.
 * Displays a paginated list of customers with filtering (text, RFM segment) and sorting capabilities.
 */
export default function ClientsPage() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [totalClients, setTotalClients] = useState(0);

    // Estados de Filtro e Ordenação
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'lastPurchase', direction: 'desc' });

    // Estado do Menu Segmentar
    const [isSegmentMenuOpen, setIsSegmentMenuOpen] = useState(false);
    const [activeSegments, setActiveSegments] = useState<string[]>([]);
    const segmentMenuRef = useRef<HTMLDivElement>(null);

    // --- FETCHING VIA BACKEND PAGINATION ---
    useEffect(() => {
        let isActive = true;
        async function fetchClients() {
            setLoading(true);
            try {
                const token = await getToken();
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', itemsPerPage.toString());
                if (deferredSearch) params.append('search', deferredSearch);
                if (sortConfig.key) {
                    params.append('sortBy', sortConfig.key);
                    params.append('sortDir', sortConfig.direction);
                }
                if (activeSegments.length > 0) {
                    params.append('segments', activeSegments.join(','));
                }

                const res = await fetch(`${API_BASE_URL}/webhook/erp/customers?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok && isActive) {
                    const data = await res.json();
                    setClients(data.data);
                    setTotalPages(data.pagination.totalPages);
                    setTotalClients(data.pagination.total);
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (isActive) setLoading(false);
            }
        }
        fetchClients();
        return () => { isActive = false; };
    }, [getToken, page, deferredSearch, sortConfig, activeSegments]);

    // Click Outside para fechar o menu de segmentação
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (segmentMenuRef.current && !segmentMenuRef.current.contains(event.target as Node)) {
                setIsSegmentMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSort = (key: string) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
        }));
    };

    const toggleSegment = (segment: string) => {
        setActiveSegments(prev =>
            prev.includes(segment) ? prev.filter(s => s !== segment) : [...prev, segment]
        );
        setPage(1); // Volta para pág 1 ao filtrar
    };

    // Header da Tabela
    const SortHeader = ({ label, sortKey, align = "left" }: any) => (
        <th className={`px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors select-none text-${align} text-xs font-bold text-slate-500 uppercase`} onClick={() => handleSort(sortKey)}>
            <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
                {label}
                <div className="flex flex-col">
                    {sortConfig.key === sortKey ? (
                        sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-violet-600" /> : <ArrowDown size={12} className="text-violet-600" />
                    ) : (
                        <ArrowDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-50" />
                    )}
                </div>
            </div>
        </th>
    );

    return (
        <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900">
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <Header title="Carteira de Clientes" subtitle="Visão geral e gestão de consumidores" icon={<Users size={18} />} user={user} />

                <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-6">

                    {/* Toolbar */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-20">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full max-w-md focus-within:border-violet-400 transition-colors">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou e-mail"
                                className="bg-transparent outline-none text-sm w-full placeholder-slate-400 text-slate-700"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex gap-2">
                            {/* BOTÃO SEGMENTAR */}
                            <div className="relative" ref={segmentMenuRef}>
                                <button
                                    onClick={() => setIsSegmentMenuOpen(!isSegmentMenuOpen)}
                                    className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition ${activeSegments.length > 0 ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <Filter size={14} />
                                    {activeSegments.length > 0 ? `${activeSegments.length} Filtros` : 'Filtros'}
                                </button>

                                {isSegmentMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-30">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-2">Filtrar por Perfil</p>
                                        {SEGMENTS_OPTIONS.map(opt => (
                                            <div
                                                key={opt}
                                                onClick={() => toggleSegment(opt)}
                                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer"
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeSegments.includes(opt) ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300'}`}>
                                                    {activeSegments.includes(opt) && <Check size={10} className="text-white" />}
                                                </div>
                                                <span className="text-xs text-slate-700 font-medium">{opt}</span>
                                            </div>
                                        ))}
                                        {activeSegments.length > 0 && (
                                            <div className="border-t mt-2 pt-2 text-right px-2">
                                                <button onClick={() => setActiveSegments([])} className="text-[10px] text-red-500 font-bold hover:underline">Limpar</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-sm font-bold text-slate-500">{totalClients.toLocaleString('pt-BR')} consumidores na base</h2>
                    </div>

                    {/* Tabela */}
                    {loading ? (
                        <div className="flex h-64 items-center justify-center text-slate-400 animate-pulse">Carregando dados do CRM...</div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <SortHeader label="Nome" sortKey="name" />
                                        <SortHeader label="Comportamento" sortKey="rfmScore" />
                                        <SortHeader label="Campanhas" sortKey="campaignsCount" />
                                        <SortHeader label="Compras" sortKey="totalTransactions" />
                                        <SortHeader label="Última Compra" sortKey="lastPurchase" />
                                        <SortHeader label="Receita Total" sortKey="ltv" />
                                        <SortHeader label="Cadastro" sortKey="createdAt" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {clients.map((client: any) => (
                                        <tr key={client.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push(`/clients/${client.id}`)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-violet-600 font-bold border border-slate-200 shadow-sm uppercase shrink-0">
                                                        {client.rfmLabel === 'VIP' ? <Target size={18} /> : client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">{client.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${RFM_COLORS[client.rfmLabel] || RFM_COLORS['Lead']}`}>
                                                                {client.rfmLabel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-700">{client.rfmScore || '-'}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-700">{client.campaignsCount || 0}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-700">{client.totalTransactions}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                {client.lastPurchase ? (
                                                    <span className="text-slate-600 font-medium text-xs">
                                                        {new Date(client.lastPurchase).toLocaleDateString('pt-BR')}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 font-mono font-bold text-slate-700 text-xs">
                                                {client.ltv > 0 ? client.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="text-slate-500 text-xs">
                                                    {client.createdAt ? formatDistanceToNow(new Date(client.createdAt), { addSuffix: false, locale: ptBR }).replace('cerca de', '') : '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Paginação */}
                            <div className="p-4 border-t border-slate-100 flex justify-end items-center bg-slate-50/50 gap-3">
                                <span className="text-xs text-slate-500">
                                    {clients.length > 0 ? `${(page - 1) * itemsPerPage + 1}-${Math.min(page * itemsPerPage, totalClients)} de ${totalClients}` : '0 de 0'}
                                </span>
                                <div className="flex gap-1">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-violet-600 disabled:opacity-50 transition-all"><ChevronLeft size={16} /></button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-violet-600 disabled:opacity-50 transition-all"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

function Header({ title, subtitle, icon, user }: any) {
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
            <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-violet-100 text-violet-700 p-1.5 rounded-md">{icon}</span> {title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 ml-9">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-700">{user?.fullName || 'Usuário'}</p>
                    <p className="text-[10px] text-slate-400">Merxios Auth</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">{user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}</div>
            </div>
        </header>
    )
}
// --- SHARED COMPONENTS ---
function NavItem({ icon, label, active }: any) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-all ${active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            {icon} <span className="text-sm font-medium hidden lg:block">{label}</span>
        </div>
    )
}

