"use client";

import React, { useEffect, useState, useDeferredValue, useMemo, useRef } from 'react';
import {
    Users, Search, Filter, ChevronLeft, ChevronRight,
    ArrowUp, ArrowDown, Target, Check, Calendar, Mail, Phone, ShoppingBag,
    BookOpen, X, Lightbulb, MousePointerClick, Star, TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { API_BASE_URL } from "@/lib/config";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRBAC } from "../contexts/RBACContext";

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

// --- COMPONENTE: MODAL DE TUTORIAL (CLIENTES) ---
const ClientsTutorialModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [step, setStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    if (!isOpen) return null;

    const tutorials = [
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

    const currentStep = tutorials[step];

    const handleNext = () => {
        if (step < tutorials.length - 1) setStep(step + 1);
        else handleFinish();
    };

    const handleFinish = () => {
        if (dontShowAgain) {
            localStorage.setItem('crm_clients_tutorial_hide', 'true');
        } else {
            localStorage.removeItem('crm_clients_tutorial_hide');
        }
        onClose();
        setTimeout(() => setStep(0), 300);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">

                {/* ESQUERDA */}
                <div className={`${currentStep.color} md:w-5/12 relative overflow-hidden transition-colors duration-500 flex flex-col items-center justify-center p-10 text-center`}>
                    <div className={`absolute top-0 right-0 w-64 h-64 ${currentStep.bgElement} rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2`}></div>
                    <div className={`absolute bottom-0 left-0 w-48 h-48 ${currentStep.bgElement} rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2`}></div>

                    <div className="relative z-10 mb-6 transform transition-all duration-500 hover:scale-110">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                            {currentStep.icon}
                        </div>
                    </div>

                    <h3 className="text-white font-bold text-2xl relative z-10">{currentStep.badge}</h3>
                    <div className="mt-2 text-white/60 text-sm font-medium tracking-widest uppercase">Passo {step + 1} de {tutorials.length}</div>
                </div>

                {/* DIREITA */}
                <div className="flex-1 p-10 flex flex-col justify-between relative bg-white">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>

                    <div className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300" key={step}>
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">{currentStep.title}</h2>
                        {currentStep.content}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {tutorials.map((_, i) => (
                                    <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 ' + currentStep.color.replace('bg-', 'bg-') : 'w-2 bg-slate-200'}`}></div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                {step > 0 ? (
                                    <button onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors">
                                        Voltar
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setDontShowAgain(!dontShowAgain)}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-slate-800 border-slate-800' : 'border-slate-300'}`}>
                                            {dontShowAgain && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className="text-xs text-slate-400 group-hover:text-slate-600 select-none">Não mostrar mais</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleNext}
                                    className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transform hover:-translate-y-0.5 transition-all ${step === tutorials.length - 1 ? 'bg-slate-900 hover:bg-slate-800' : currentStep.color + ' hover:opacity-90'}`}
                                >
                                    {step === tutorials.length - 1 ? 'Começar a Usar' : 'Próximo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Clients Page Component.
 * Displays a paginated list of customers with filtering (text, RFM segment) and sorting capabilities.
 */
export default function ClientsPage() {
    const { getToken } = useAuth();
    const { user } = useUser();
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

    // Estados de Filtro e Ordenação
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'lastPurchase', direction: 'desc' });

    // Estado do Menu Segmentar
    const [isSegmentMenuOpen, setIsSegmentMenuOpen] = useState(false);
    const [activeSegments, setActiveSegments] = useState<string[]>([]);
    const segmentMenuRef = useRef<HTMLDivElement>(null);

    // Estado do Tutorial
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    useEffect(() => {
        const userHidTutorial = localStorage.getItem('crm_clients_tutorial_hide');
        if (userHidTutorial !== 'true') {
            setIsTutorialOpen(true);
        }
    }, []);

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
        <th className={`px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none text-${align} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase`} onClick={() => handleSort(sortKey)}>
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
        <div className="flex h-screen bg-[#f1f5f9] dark:bg-[#020817] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <ClientsTutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
                <Header title="Carteira de Clientes" subtitle="Visão geral e gestão de consumidores" icon={<Users size={18} />} user={user} onTutorialClick={() => setIsTutorialOpen(true)} />

                <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-6">

                    {/* Toolbar */}
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative z-20">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 w-full max-w-md focus-within:border-violet-400 transition-colors">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou e-mail"
                                className="bg-transparent outline-none text-sm w-full placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-100"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex gap-2">
                            {/* BOTÃO SEGMENTAR */}
                            <div className="relative" ref={segmentMenuRef}>
                                <button
                                    onClick={() => setIsSegmentMenuOpen(!isSegmentMenuOpen)}
                                    className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition ${activeSegments.length > 0 ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <Filter size={14} />
                                    {activeSegments.length > 0 ? `${activeSegments.length} Filtros` : 'Filtros'}
                                </button>

                                {isSegmentMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 z-30">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-2">Filtrar por Perfil</p>
                                        {SEGMENTS_OPTIONS.map(opt => (
                                            <div
                                                key={opt}
                                                onClick={() => toggleSegment(opt)}
                                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer"
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeSegments.includes(opt) ? 'bg-violet-600 border-violet-600' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}>
                                                    {activeSegments.includes(opt) && <Check size={10} className="text-white" />}
                                                </div>
                                                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{opt}</span>
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
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <SortHeader label="Nome" sortKey="name" />
                                        <SortHeader label="Comportamento" sortKey="rfmScore" />
                                        <SortHeader label="Campanhas" sortKey="campaignsCount" />
                                        <SortHeader label="Compras" sortKey="totalTransactions" />
                                        <SortHeader label="Última Compra" sortKey="lastPurchase" />
                                        {hasPermission('app:financials') && <SortHeader label="Receita Total" sortKey="ltv" />}
                                        <SortHeader label="Cadastro" sortKey="createdAt" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {clients.map((client: any) => (
                                        <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => router.push(`/clients/${client.id}`)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold border border-slate-200 dark:border-slate-700 shadow-sm uppercase shrink-0">
                                                        {client.rfmLabel === 'VIP' ? <Target size={18} /> : client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">{client.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${RFM_COLORS[client.rfmLabel] || RFM_COLORS['Lead']}`}>
                                                                {client.rfmLabel}
                                                            </span>
                                                        </div>
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
                                                    {client.createdAt ? formatDistanceToNow(new Date(client.createdAt), { addSuffix: false, locale: ptBR }).replace('cerca de', '') : '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Paginação */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center bg-slate-50/50 dark:bg-slate-800/30 gap-3">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {clients.length > 0 ? `${(page - 1) * itemsPerPage + 1}-${Math.min(page * itemsPerPage, totalClients)} de ${totalClients}` : '0 de 0'}
                                </span>
                                <div className="flex gap-1">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 transition-all"><ChevronLeft size={16} /></button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 transition-all"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

function Header({ title, subtitle, icon, user, onTutorialClick }: any) {
    return (
        <header className="h-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20 transition-colors">
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 p-1.5 rounded-md">{icon}</span> {title}
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 ml-9">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
                {onTutorialClick && (
                    <>
                        <button onClick={onTutorialClick} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold cursor-pointer">
                            <BookOpen size={16} className="text-violet-500" /> Como usar?
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    </>
                )}
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{user?.fullName || 'Usuário'}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Merxios Auth</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs transition-colors">{user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}</div>
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

