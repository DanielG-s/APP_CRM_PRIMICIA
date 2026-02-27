"use client";

import React, { useEffect, useState, useDeferredValue, useRef } from 'react';
import {
    Users, Filter, Target, ShoppingBag,
    Lightbulb, MousePointerClick, Star, TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@clerk/nextjs";
import { useRBAC } from "../contexts/RBACContext";
import {
    PageHeader, TutorialModal, TutorialStep,
    SearchBar, FilterDropdown, SortableHeader,
    StatusBadge, PaginationControl
} from '@/components/shared';

const RFM_COLORS: Record<string, string> = {
    'VIP': 'bg-violet-100 text-violet-700 border-violet-200',
    'Leal': 'bg-blue-50 text-blue-700 border-blue-100',
    'Novo': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Em Risco': 'bg-amber-50 text-amber-700 border-amber-100',
    'Inativo': 'bg-slate-100 text-slate-500 border-slate-200',
    'Lead': 'bg-gray-50 text-gray-500 border-gray-200'
};

const SEGMENTS_OPTIONS = ['VIP', 'Leal', 'Novo', 'Em Risco', 'Inativo', 'Lead'];

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        badge: "Sua Base",
        title: "Visão 360° dos Clientes",
        content: (
            <div className="space-y-4">
                <p className="text-slate-600 text-lg leading-relaxed">
                    Esta é a sua <strong>Carteira de Clientes</strong> centralizada.
                    Aqui você tem acesso imediato ao comportamento de compra de cada consumidor.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-violet-50 p-3 rounded-lg border border-violet-100">
                        <div className="font-bold text-violet-700 text-sm">📈 LTV (Lifetime Value)</div>
                        <div className="text-xs text-violet-600">Entenda a receita total gerada por cada cliente.</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="font-bold text-blue-700 text-sm">📅 Recência</div>
                        <div className="text-xs text-blue-600">Identifique quando foi a última visita.</div>
                    </div>
                </div>
            </div>
        ),
        icon: <Users size={56} className="text-white" />,
        color: "bg-slate-900",
        bgElement: "bg-violet-500"
    },
    {
        badge: "Inteligência",
        title: "O Poder do RFM",
        content: (
            <div className="space-y-4">
                <p className="text-slate-600">
                    O sistema categoriza a saúde dos seus clientes usando <strong>RFM</strong> (Recência, Frequência, Valor Monetário).
                </p>
                <ul className="space-y-3 mt-2">
                    <li className="flex gap-3 items-start">
                        <div className="p-1.5 bg-violet-100 rounded text-violet-700 mt-0.5"><Star size={14} /></div>
                        <div>
                            <strong className="block text-slate-800 text-sm">VIPs & Leais</strong>
                            <span className="text-slate-500 text-xs">A base que sustenta seu negócio. Ofereça benefícios exclusivos.</span>
                        </div>
                    </li>
                    <li className="flex gap-3 items-start">
                        <div className="p-1.5 bg-amber-100 rounded text-amber-700 mt-0.5"><Target size={14} /></div>
                        <div>
                            <strong className="block text-slate-800 text-sm">Em Risco & Inativos</strong>
                            <span className="text-slate-500 text-xs">Perderam o engajamento. Alvo perfeito para campanhas de resgate agressivas.</span>
                        </div>
                    </li>
                </ul>
            </div>
        ),
        icon: <TrendingUp size={56} className="text-white" />,
        color: "bg-violet-600",
        bgElement: "bg-violet-400"
    },
    {
        badge: "Filtros",
        title: "Busca Profunda",
        content: (
            <div className="space-y-4">
                <p className="text-slate-600">
                    Navegue na sua base com rapidez e engajamento.
                </p>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-2">
                    <Filter size={24} className="text-slate-600" />
                    <div className="text-sm text-slate-700">
                        <strong>Use os Filtros</strong> para visualizar apenas os grupos RFM que te interessam, ou use a <strong>Barra de Busca</strong> para encontrar um contato rapidamente.
                    </div>
                </div>
            </div>
        ),
        icon: <Lightbulb size={56} className="text-white" />,
        color: "bg-emerald-600",
        bgElement: "bg-emerald-400"
    },
    {
        badge: "Detalhes",
        title: "Mergulhe no Perfil",
        content: (
            <div className="space-y-4">
                <p className="text-slate-600">
                    Pronto para o próximo nível?
                </p>
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-2">
                    <MousePointerClick size={24} className="text-amber-600" />
                    <div className="text-sm text-slate-700">
                        <strong>Clique em qualquer cliente na tabela</strong> para abrir seu perfil detalhado. Veja o histórico completo de compras!
                    </div>
                </div>
            </div>
        ),
        icon: <ShoppingBag size={56} className="text-white" />,
        color: "bg-amber-500",
        bgElement: "bg-amber-300"
    }
];

export default function ClientsPage() {
    const { getToken } = useAuth();
    const { hasPermission } = useRBAC();
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [totalClients, setTotalClients] = useState(0);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'lastPurchase', direction: 'desc' });
    const [activeSegments, setActiveSegments] = useState<string[]>([]);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    useEffect(() => {
        const userHidTutorial = localStorage.getItem('crm_clients_tutorial_hide');
        if (userHidTutorial !== 'true') setIsTutorialOpen(true);
    }, []);

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
                if (activeSegments.length > 0) params.append('segments', activeSegments.join(','));

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

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
        }));
    };

    const handleSegmentsChange = (segments: string[]) => {
        setActiveSegments(segments);
        setPage(1);
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9] dark:bg-[#020817] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <TutorialModal
                    isOpen={isTutorialOpen}
                    onClose={() => setIsTutorialOpen(false)}
                    storageKey="crm_clients_tutorial_hide"
                    steps={TUTORIAL_STEPS}
                />
                <PageHeader
                    title="Carteira de Clientes"
                    subtitle="Visão geral e gestão de consumidores"
                    icon={<Users size={18} />}
                    onTutorialClick={() => setIsTutorialOpen(true)}
                />

                <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-6">
                    <SearchBar
                        value={search}
                        onChange={v => { setSearch(v); setPage(1); }}
                        placeholder="Buscar por nome ou e-mail"
                    >
                        <FilterDropdown
                            options={SEGMENTS_OPTIONS}
                            selected={activeSegments}
                            onChange={handleSegmentsChange}
                            sectionTitle="Filtrar por Perfil"
                        />
                    </SearchBar>

                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-sm font-bold text-slate-500">
                            {totalClients.toLocaleString('pt-BR')} consumidores na base
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center text-slate-400 animate-pulse">
                            Carregando dados do CRM...
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <SortableHeader label="Nome" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableHeader label="Comportamento" sortKey="rfmScore" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableHeader label="Campanhas" sortKey="campaignsCount" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableHeader label="Compras" sortKey="totalTransactions" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableHeader label="Última Compra" sortKey="lastPurchase" sortConfig={sortConfig} onSort={handleSort} />
                                        {hasPermission('app:financials') && (
                                            <SortableHeader label="Receita Total" sortKey="ltv" sortConfig={sortConfig} onSort={handleSort} />
                                        )}
                                        <SortableHeader label="Cadastro" sortKey="createdAt" sortConfig={sortConfig} onSort={handleSort} />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {clients.map((client: any) => (
                                        <tr
                                            key={client.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                            onClick={() => router.push(`/clients/${client.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold border border-slate-200 dark:border-slate-700 shadow-sm uppercase shrink-0">
                                                        {client.rfmLabel === 'VIP' ? <Target size={18} /> : client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">
                                                            {client.name}
                                                        </p>
                                                        <StatusBadge
                                                            status={client.rfmLabel}
                                                            colorMap={RFM_COLORS}
                                                            fallback={RFM_COLORS['Lead']}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">{client.rfmScore || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">{client.campaignsCount || 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">{client.totalTransactions}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                                                    {client.lastPurchase ? new Date(client.lastPurchase).toLocaleDateString('pt-BR') : '-'}
                                                </span>
                                            </td>
                                            {hasPermission('app:financials') && (
                                                <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                                                    {client.ltv > 0 ? client.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <span className="text-slate-500 dark:text-slate-400 text-xs">
                                                    {client.createdAt
                                                        ? formatDistanceToNow(new Date(client.createdAt), { addSuffix: false, locale: ptBR }).replace('cerca de', '')
                                                        : '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <PaginationControl
                                page={page}
                                totalPages={totalPages}
                                totalItems={totalClients}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
