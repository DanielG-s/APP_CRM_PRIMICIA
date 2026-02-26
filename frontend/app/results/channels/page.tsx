"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Home, Users, BarChart2, MessageCircle, Calendar, Filter,
    ChevronDown, Mail, MousePointer, Eye,
    AlertCircle, PieChart as PieIcon, FileText, Check, Download,
    ArrowUpRight, ArrowDownRight, Search, XCircle, Info, Smartphone, MessageSquare, CheckSquare, Square, Send,
    BookOpen
} from 'lucide-react';
import Link from 'next/link';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { API_BASE_URL } from "@/lib/config";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRBAC } from "../../contexts/RBACContext";

// --- (TEMA VISUAL, TOOLTIPS, CONSTANTES ESTÁTICAS E COMPONENTES AUXILIARES MANTIDOS IGUAIS) ---
// Para economizar espaço, estou colando abaixo APENAS o Componente Principal atualizado
// Mantenha os imports e componentes auxiliares (FilterMultiSelect, MetricTab, etc.) que já estavam funcionando

// ... (Códigos de FilterMultiSelect, CampaignMultiSelect, CustomSelect, groupDataByWeek iguais ao anterior) ...

// --- TEMA VISUAL ---
const COLORS = {
    primary: "#6366f1", secondary: "#0f172a", accent: "#f59e0b", success: "#10b981", danger: "#ef4444", neutral: "#94a3b8", grid: "#e2e8f0",
    softBounce: "#f59e0b", hardBounce: "#dc2626", spam: "#db2777", unsubscribe: "#7c3aed", clicks: "#f97316", ctr: "#10b981", ctor: "#8b5cf6"
};
const TOOLTIPS = { receitaTotal: "Soma total...", receitaInfluenciada: "Fatia da receita...", conversoes: "Total de vendas...", vendasInfluenciadas: "Pedidos influenciados...", baseInfluenciada: "Clientes únicos...", ticket: "Valor médio...", envios: "Total envios...", entregues: "Confirmadas...", aberturas: "Aberturas únicas...", clicks: "Cliques...", bounces: "Bounces...", rejeicoes: "Rejeições..." };
const CAMPAIGN_TYPES = [{ label: 'Diário', value: 'Diário' }, { label: 'Semanal', value: 'Semanal' }, { label: 'Mensal', value: 'Mensal' }, { label: 'Apenas uma vez', value: 'Apenas uma vez' }, { label: 'Assim que ativar', value: 'Assim que ativar' }, { label: 'Comportamento', value: 'Comportamento' }];
const CONVERSION_WINDOWS = [{ label: '7 dias', value: '7 dias' }, { label: '15 dias', value: '15 dias' }, { label: '30 dias', value: '30 dias' }];
const CONVERSION_EVENTS = [{ label: 'Abertura', value: 'Abertura' }, { label: 'Clique', value: 'Clique' }];

// Mantenha os componentes auxiliares aqui (FilterMultiSelect, CampaignMultiSelect, etc.)
// ... 

// --- FUNÇÃO AUXILIAR: AGRUPAR POR SEMANA ---
const groupDataByWeek = (dailyData: any[]) => {
    if (!dailyData || dailyData.length === 0) return [];
    const weeks: any[] = [];
    let currentWeek: any = null;
    dailyData.forEach((day, index) => {
        if (index % 7 === 0) {
            if (currentWeek) {
                currentWeek.ctr = currentWeek.entregues > 0 ? ((currentWeek.cliques / currentWeek.entregues) * 100).toFixed(2) : 0;
                currentWeek.ctor = currentWeek.aberturas > 0 ? ((currentWeek.cliques / currentWeek.aberturas) * 100).toFixed(2) : 0;
                currentWeek.ticket = currentWeek.conversoes > 0 ? (currentWeek.receitaInfluenciada / currentWeek.conversoes).toFixed(2) : 0;
                currentWeek.name = `${currentWeek.startLabel} - ${day.name}`;
                weeks.push(currentWeek);
            }
            currentWeek = { startLabel: day.name, name: day.name, envios: 0, entregues: 0, aberturas: 0, cliques: 0, softBounces: 0, hardBounces: 0, bounces: 0, spam: 0, descadastro: 0, rejeicoes: 0, receitaTotal: 0, receitaInfluenciada: 0, conversoes: 0, vendasInfluenciadas: 0, baseInfluenciada: 0 };
        }
        currentWeek.envios += day.envios; currentWeek.entregues += day.entregues; currentWeek.aberturas += day.aberturas; currentWeek.cliques += day.cliques; currentWeek.softBounces += day.softBounces; currentWeek.hardBounces += day.hardBounces; currentWeek.bounces += day.bounces; currentWeek.spam += day.spam; currentWeek.descadastro += day.descadastro; currentWeek.rejeicoes += day.rejeicoes; currentWeek.receitaTotal += day.receitaTotal; currentWeek.receitaInfluenciada += day.receitaInfluenciada; currentWeek.conversoes += day.conversoes; currentWeek.vendasInfluenciadas += day.vendasInfluenciadas; currentWeek.baseInfluenciada += day.baseInfluenciada;
    });
    if (currentWeek) {
        currentWeek.ctr = currentWeek.entregues > 0 ? Number(((currentWeek.cliques / currentWeek.entregues) * 100).toFixed(2)) : 0;
        currentWeek.ctor = currentWeek.aberturas > 0 ? Number(((currentWeek.cliques / currentWeek.aberturas) * 100).toFixed(2)) : 0;
        currentWeek.ticket = currentWeek.conversoes > 0 ? Number((currentWeek.receitaInfluenciada / currentWeek.conversoes).toFixed(2)) : 0;
        if (!currentWeek.name.includes('-')) currentWeek.name = `${currentWeek.startLabel} - Fim`;
        weeks.push(currentWeek);
    }
    return weeks;
};

// ... Mantenha os outros componentes FilterMultiSelect, CampaignMultiSelect, CustomSelect ...
// (Vou re-declarar aqui rapidinho para o código ficar completo e copiável)
const FilterMultiSelect = ({ label, options, selected, onChange, placeholder, helperText }: any) => {
    const [isOpen, setIsOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const c = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
    const toggle = (val: string) => { if (selected.includes(val)) onChange(selected.filter((i: string) => i !== val)); else onChange([...selected, val]); };
    return (<div className="relative" ref={ref}><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">{label}</label><div onClick={() => setIsOpen(!isOpen)} className="w-full p-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer flex justify-between items-center hover:border-violet-300 dark:hover:border-violet-500 transition select-none shadow-sm"><span className="truncate block max-w-[140px] text-slate-600 dark:text-slate-300">{selected.length === 0 ? placeholder : `${selected.length} selecionados`}</span><ChevronDown size={14} className="text-slate-400 opacity-70" /></div>{isOpen && (<div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-0 flex flex-col">{helperText && <div className="px-3 py-2 text-[10px] text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">{helperText}</div>}<div className="p-2 space-y-1">{options.length === 0 && <div className="text-xs text-slate-400 p-2 text-center">Vazio</div>}{options.map((opt: any) => (<div key={opt.value} onClick={() => toggle(opt.value)} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer group transition-colors"><span className={`text-sm ${selected.includes(opt.value) ? 'text-violet-700 dark:text-violet-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>{opt.label}</span><div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(opt.value) ? 'bg-violet-600 border-violet-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent group-hover:border-violet-400'}`}>{selected.includes(opt.value) && <Check size={10} className="text-white" strokeWidth={4} />}</div></div>))}</div></div>)}</div>)
};
const CampaignMultiSelect = ({ label, options, selected, onChange }: any) => {
    const [isOpen, setIsOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const [search, setSearch] = useState("");
    useEffect(() => { const c = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
    const toggle = (val: string) => { if (selected.includes(val)) onChange(selected.filter((i: string) => i !== val)); else onChange([...selected, val]); };
    const selectedOpts = options.filter((o: any) => selected.includes(o.value)); const unselectedOpts = options.filter((o: any) => !selected.includes(o.value) && o.label.toLowerCase().includes(search.toLowerCase()));
    return (<div className="relative" ref={ref}><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">{label}</label><div onClick={() => setIsOpen(!isOpen)} className="w-full p-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer flex justify-between items-center hover:border-violet-300 dark:hover:border-violet-500 transition select-none shadow-sm"><span className="truncate block max-w-[140px] text-slate-600 dark:text-slate-300">{selected.length === 0 ? <span className="text-slate-400">Todas as campanhas</span> : <div className="flex gap-1 items-center"><span className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded text-xs font-bold max-w-[100px] truncate block">{selectedOpts[0]?.label}</span>{selected.length > 1 && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">+{selected.length - 1}</span>}</div>}</span><ChevronDown size={14} className="text-slate-400 opacity-70" /></div>{isOpen && (<div className="absolute top-full left-0 w-full min-w-[320px] mt-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto p-0 flex flex-col"><div className="p-2 sticky top-0 bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 z-10"><input autoFocus type="text" placeholder="Buscar campanha..." className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded p-2 outline-none focus:border-violet-400" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="p-2 space-y-1">{selectedOpts.length > 0 && (<div className="mb-2"><div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold text-slate-400"><span>Selecionados</span></div>{selectedOpts.map((opt: any) => <div key={opt.value} onClick={() => toggle(opt.value)} className="flex items-center justify-between p-2 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 rounded cursor-pointer"><span className="text-xs font-bold text-violet-700 dark:text-violet-400 truncate">{opt.label}</span><Check size={10} className="text-violet-600 dark:text-violet-400" /></div>)}<div className="my-2 border-t border-slate-100 dark:border-slate-800"></div></div>)}<div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold text-slate-400"><span>Existentes</span></div>{unselectedOpts.map((opt: any) => <div key={opt.value} onClick={() => toggle(opt.value)} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"><span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{opt.label}</span><div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div></div>)}</div></div>)}</div>)
};
const CustomSelect = ({ label, options, value, onChange, iconMap }: any) => {
    const [isOpen, setIsOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const c = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
    const s = options.find((o: any) => o.value === value); const Icon = iconMap && s ? iconMap[s.value] : null;
    return (<div className="relative" ref={ref}><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">{label}</label><div onClick={() => setIsOpen(!isOpen)} className="w-full p-2.5 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer flex justify-between items-center hover:border-violet-300 dark:hover:border-violet-500 transition select-none shadow-sm"><div className="flex items-center gap-2 overflow-hidden">{Icon && <Icon size={16} className="text-slate-500 dark:text-slate-400" />}<span className="text-slate-700 dark:text-slate-200 truncate">{s?.label || value}</span></div><ChevronDown size={14} className="text-slate-400 opacity-70" /></div>{isOpen && (<div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden py-1">{options.map((opt: any) => <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false) }} className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer ${value === opt.value ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{iconMap && iconMap[opt.value] && <span className={value === opt.value ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}>{React.createElement(iconMap[opt.value], { size: 16 })}</span>}<span className="text-sm">{opt.label}</span></div>)}</div>)}</div>)
};

// --- COMPONENTE: MODAL DE TUTORIAL (CANAIS) ---
const ChannelsTutorialModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [step, setStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    if (!isOpen) return null;

    const tutorials = [
        {
            badge: "Engajamento",
            title: "Métricas de Disparo",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-600 text-lg leading-relaxed">
                        Acompanhe o <strong>desempenho técnico</strong> de cada mensagem enviada.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="font-bold text-blue-700 text-sm">📈 Taxas de Abertura</div>
                            <div className="text-xs text-blue-600">Mensure quantas pessoas visualizaram.</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <div className="font-bold text-amber-700 text-sm">⚠️ Bounces & Rejeições</div>
                            <div className="text-xs text-amber-600">Controle a saúde da sua base de contatos.</div>
                        </div>
                    </div>
                </div>
            ),
            icon: <Mail size={56} className="text-white" />,
            color: "bg-blue-600",
            bgElement: "bg-blue-400"
        },
        {
            badge: "Conversão",
            title: "Funil de Receita",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-600">
                        O envio gerou vendas? Aqui você tem a prova.
                    </p>
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-2">
                        <PieIcon size={24} className="text-emerald-600" />
                        <div className="text-sm text-slate-700">
                            Veja a <strong>Receita Influenciada</strong>, número de <strong>Conversões</strong> e o <strong>Ticket Médio</strong> exato gerado apenas pelos clientes que interagiram com as campanhas.
                        </div>
                    </div>
                </div>
            ),
            icon: <PieIcon size={56} className="text-white" />,
            color: "bg-emerald-600",
            bgElement: "bg-emerald-400"
        },
        {
            badge: "Análise",
            title: "Tabelas e Agrupamentos",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Diferentes visões para facilitar sua análise estratégica:
                    </p>
                    <ul className="space-y-3 mt-2">
                        <li className="flex gap-3 items-start">
                            <div className="p-1.5 bg-violet-100 rounded text-violet-600 mt-0.5"><Filter size={14} /></div>
                            <div>
                                <strong className="block text-slate-800 text-sm">Campanhas vs Lojas vs Disparos</strong>
                                <span className="text-slate-500 text-xs">Mude o agrupamento da tabela abaixo para analisar os resultados por ação de marketing ou descobrir quais lojas (PDVs) mais venderam com as campanhas.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            ),
            icon: <FileText size={56} className="text-white" />,
            color: "bg-violet-600",
            bgElement: "bg-violet-400"
        }
    ];

    const currentStep = tutorials[step];

    const handleNext = () => {
        if (step < tutorials.length - 1) setStep(step + 1);
        else handleFinish();
    };

    const handleFinish = () => {
        if (dontShowAgain) {
            localStorage.setItem('crm_channels_tutorial_hide', 'true');
        } else {
            localStorage.removeItem('crm_channels_tutorial_hide');
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
                        <XCircle size={20} />
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

// --- PÁGINA PRINCIPAL ---
export default function ChannelResultsPage() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const { hasPermission } = useRBAC();
    const getToday = () => new Date().toISOString().split('T')[0];
    const getStartOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

    const [dateRange, setDateRange] = useState({ start: getStartOfMonth(), end: getToday() });
    const [draftDate, setDraftDate] = useState({ start: getStartOfMonth(), end: getToday() });
    const [isDateOpen, setIsDateOpen] = useState(false);

    const [tableSearch, setTableSearch] = useState("");
    const [groupBy, setGroupBy] = useState("Campanhas");

    const [filters, setFilters] = useState({
        channel: 'Todos', conversionEvent: 'Abertura', conversionWindow: '7 dias',
        tags: [] as string[], campaigns: [] as string[], campaignType: [] as string[]
    });

    const [optionsData, setOptionsData] = useState({
        tags: [] as { label: string, value: string }[],
        campaigns: [] as { label: string, value: string }[],
        types: [] as { label: string, value: string }[],
        channels: [] as string[]
    });

    const [fullDailyData, setFullDailyData] = useState<any[]>([]);
    const [campaignsList, setCampaignsList] = useState<any[]>([]);
    const [storesList, setStoresList] = useState<any[]>([]);
    const [dispatchesList, setDispatchesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const dateRef = useRef<HTMLDivElement>(null);

    const [engagementMetric, setEngagementMetric] = useState('aberturas');
    const [engagementView, setEngagementView] = useState<'diario' | 'semanal'>('diario');
    const [revenueMetric, setRevenueMetric] = useState('receitaInfluenciada');
    const [revenueView, setRevenueView] = useState<'diario' | 'semanal'>('diario');
    const [showComparison, setShowComparison] = useState(false);

    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    useEffect(() => {
        const userHidTutorial = localStorage.getItem('crm_channels_tutorial_hide');
        if (userHidTutorial !== 'true') setIsTutorialOpen(true);
    }, []);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_BASE_URL}/sales/filter-options`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data) {
                    setOptionsData({
                        tags: data.tags.map((t: string) => ({ label: t, value: t })),
                        campaigns: data.campaigns.map((c: any) => ({ label: c.name, value: c.id })),
                        types: CAMPAIGN_TYPES,
                        channels: data.channels
                    });
                }
            } catch (error) { console.error(error); }
        };
        fetchOptions();
    }, [getToken]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const params = new URLSearchParams();
            params.append('start', dateRange.start); params.append('end', dateRange.end);
            if (filters.channel !== 'Todos') params.append('channel', filters.channel);
            if (filters.conversionEvent) params.append('conversionEvent', filters.conversionEvent);
            if (filters.conversionWindow) params.append('conversionWindow', filters.conversionWindow);
            filters.tags.forEach(tag => params.append('tags', tag));
            filters.campaigns.forEach(id => params.append('campaigns', id));
            filters.campaignType.forEach(type => params.append('campaignType', type));

            const res = await fetch(`${API_BASE_URL}/sales/channel-results?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data) {
                setFullDailyData(data.chart || []);
                if (data.campaignsList) {
                    setCampaignsList(data.campaignsList.map((c: any) => ({
                        ...c,
                        deliveredRate: c.sent > 0 ? ((c.delivered / c.sent) * 100).toFixed(1) : 0,
                        openRate: c.delivered > 0 ? ((c.opens / c.delivered) * 100).toFixed(1) : 0,
                        ctr: c.delivered > 0 ? ((c.clicks / c.delivered) * 100).toFixed(1) : 0,
                        ctor: c.opens > 0 ? ((c.clicks / c.opens) * 100).toFixed(1) : 0,
                        bounceRate: c.sent > 0 ? (((c.softBounces + c.hardBounces) / c.sent) * 100).toFixed(1) : 0,
                        rejectionRate: c.sent > 0 ? (((c.spamReports + c.unsubscribes) / c.sent) * 100).toFixed(2) : 0,
                        bounces: c.softBounces + c.hardBounces, rejections: c.spamReports + c.unsubscribes,
                        revenueInfluenced: 0, conversions: 0, ticketAverage: 0
                    })));
                }
                if (data.dispatchesList) setDispatchesList(data.dispatchesList);
                if (data.storesList) setStoresList(data.storesList);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [dateRange]);
    const handleApplyFilters = () => { setCurrentPage(1); fetchData(); };
    const handleClearFilters = () => { setFilters({ channel: 'Todos', conversionEvent: 'Abertura', conversionWindow: '7 dias', tags: [], campaigns: [], campaignType: [] }); };

    const currentEngagementData = useMemo(() => engagementView === 'semanal' ? groupDataByWeek(fullDailyData) : fullDailyData, [engagementView, fullDailyData]);
    const currentRevenueData = useMemo(() => revenueView === 'semanal' ? groupDataByWeek(fullDailyData) : fullDailyData, [revenueView, fullDailyData]);

    const filteredCampaigns = useMemo(() => {
        const term = tableSearch.toLowerCase();
        let list = campaignsList;
        if (term) list = list.filter(c => c.name.toLowerCase().includes(term) || c.id.toLowerCase().includes(term));
        return list;
    }, [tableSearch, campaignsList]);

    const filteredStores = useMemo(() => {
        const term = tableSearch.toLowerCase();
        return storesList.filter((s: any) => s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term));
    }, [tableSearch, storesList]);

    const filteredDispatches = useMemo(() => {
        const term = tableSearch.toLowerCase();
        let list = dispatchesList;
        if (term) list = list.filter((d: any) => d.campaignName.toLowerCase().includes(term));
        return list;
    }, [tableSearch, dispatchesList]);

    const currentTableData = useMemo(() => {
        if (groupBy === 'Lojas') return filteredStores;
        if (groupBy === 'Disparos') return filteredDispatches;
        return filteredCampaigns;
    }, [groupBy, filteredStores, filteredCampaigns, filteredDispatches]);

    const totalItems = currentTableData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentItems = currentTableData.slice((currentPage - 1) * itemsPerPage, Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, totalItems));

    useEffect(() => { setCurrentPage(1); }, [tableSearch, groupBy]);

    // --- FUNÇÃO DE EXPORTAÇÃO CSV ---
    const handleExportCSV = () => {
        // 1. Define qual conjunto de dados usar
        const isCampaignView = groupBy === 'Campanhas';
        const dataToExport = isCampaignView ? filteredCampaigns : filteredStores;

        if (!dataToExport || dataToExport.length === 0) {
            alert("Não há dados para exportar com os filtros atuais.");
            return;
        }

        // 2. Define o Cabeçalho (Header)
        const headers = isCampaignView
            ? ["ID", "Nome da Campanha", "Data", "Canal", "Envios", "Entregues", "Aberturas", "Cliques", "CTR (%)", "CTOR (%)", "Receita Influenciada", "Conversões"]
            : ["ID", "Nome da Loja", "Receita Total", "Receita Influenciada", "Transações Totais", "Vendas Influenciadas", "Ticket Médio Inf."];

        // 3. Formata as Linhas (Rows)
        const csvRows = dataToExport.map((item: any) => {
            if (isCampaignView) {
                return [
                    item.id,
                    `"${item.name}"`, // Aspas para evitar quebra se tiver vírgula no nome
                    new Date(item.date).toLocaleDateString('pt-BR'),
                    item.channel,
                    item.sent,
                    item.delivered,
                    item.opens,
                    item.clicks,
                    item.ctr.toString().replace('.', ','), // Excel BR prefere vírgula decimal
                    item.ctor.toString().replace('.', ','),
                    item.revenueInfluenced.toFixed(2).replace('.', ','),
                    item.conversions
                ];
            } else {
                return [
                    item.id,
                    `"${item.name}"`,
                    item.revenue.toFixed(2).replace('.', ','),
                    item.revenueInfluenced.toFixed(2).replace('.', ','),
                    item.transactions || 0,
                    item.salesInfluenced || 0,
                    item.ticketAverage.toFixed(2).replace('.', ',')
                ];
            }
        });

        // 4. Monta o conteúdo do CSV (Separado por ponto e vírgula ';' é melhor para Excel em PT-BR)
        const csvContent = [
            headers.join(";"),
            ...csvRows.map(row => row.join(";"))
        ].join("\n");

        // 5. Cria o Blob e dispara o Download
        // \uFEFF é o BOM para garantir UTF-8 no Excel
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `relatorio_${isCampaignView ? 'campanhas' : 'lojas'}_${getToday()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) { if (dateRef.current && !dateRef.current.contains(event.target as Node)) setIsDateOpen(false); }
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleApplyDate = () => { setDateRange(draftDate); setIsDateOpen(false); };
    const formatDateDisplay = (iso: string) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; }
    const formatAxis = (val: number, type: 'currency' | 'number') => {
        if (val < 1000) return type === 'currency' ? `R$ ${val}` : val.toString();
        const inMil = val / 1000;
        const formatted = inMil % 1 === 0 ? inMil.toFixed(0) : inMil.toFixed(1);
        return type === 'currency' ? `R$ ${formatted}mil` : `${formatted}mil`;
    };
    const isRevenueMetricCurrency = useMemo(() => ['receitaTotal', 'receitaInfluenciada', 'ticket'].includes(revenueMetric), [revenueMetric]);
    const channelIcons: any = { 'Todos': PieIcon, 'E-mail': Mail, 'SMS': MessageCircle, 'Mobile push': Smartphone, 'WhatsApp': MessageSquare };

    return (
        <div className="flex h-screen bg-[#f1f5f9] dark:bg-[#020817] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <ChannelsTutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

                <header className="h-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
                    <div><h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-md"><PieIcon size={18} /></span>Resultados de Canais</h1></div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsTutorialOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold cursor-pointer">
                            <BookOpen size={16} className="text-emerald-500" /> Como usar?
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <div className="text-right hidden sm:block"><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{user?.fullName || 'Usuário'}</p><p className="text-[10px] text-slate-400 dark:text-slate-500">Merxios Auth</p></div><div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">{user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}</div>
                    </div>
                </header>

                <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-8">
                    {/* FILTROS */}
                    <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                        <div className="flex justify-between items-center">
                            <div className="relative" ref={dateRef}>
                                <div onClick={() => setIsDateOpen(!isDateOpen)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 transition w-fit shadow-sm">
                                    <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
                                    <span className="font-medium">{formatDateDisplay(dateRange.start)}</span> <span className="text-slate-400 dark:text-slate-500">até</span> <span className="font-medium">{formatDateDisplay(dateRange.end)}</span>
                                    <ChevronDown size={14} className="ml-2 opacity-50" />
                                </div>
                                {isDateOpen && (
                                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 w-72 z-50" onClick={(e) => e.stopPropagation()}>
                                        <div className="space-y-3">
                                            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">De:</label><input type="date" value={draftDate.start} onChange={(e) => setDraftDate({ ...draftDate, start: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm outline-none bg-transparent text-slate-700 dark:text-slate-200 focus:border-violet-500 dark:focus:border-violet-500" /></div>
                                            <div><label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Até:</label><input type="date" value={draftDate.end} onChange={(e) => setDraftDate({ ...draftDate, end: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded p-2 text-sm outline-none bg-transparent text-slate-700 dark:text-slate-200 focus:border-violet-500 dark:focus:border-violet-500" /></div>
                                        </div>
                                        <div className="border-t border-slate-200 dark:border-slate-800 mt-4 pt-3 flex justify-end gap-2">
                                            <button className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onClick={() => setIsDateOpen(false)}>Cancelar</button>
                                            <button className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded" onClick={() => { setDateRange(draftDate); setIsDateOpen(false); }}>Aplicar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleClearFilters} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">Limpar Filtros</button>
                                <button onClick={handleApplyFilters} className="px-4 py-2 bg-slate-800 dark:bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-slate-700 dark:hover:bg-violet-700 transition flex items-center gap-2 shadow-sm">
                                    {loading ? 'Filtrando...' : 'Aplicar Filtros'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="lg:col-span-1"><CustomSelect label="Canal" iconMap={channelIcons} options={[{ label: 'Todos', value: 'Todos' }, ...optionsData.channels.map(c => ({ label: c, value: c }))]} value={filters.channel} onChange={(v: any) => setFilters({ ...filters, channel: v })} /></div>
                            <div className="lg:col-span-1"><CustomSelect label="Evento de conversão" options={CONVERSION_EVENTS} value={filters.conversionEvent} onChange={(v: any) => setFilters({ ...filters, conversionEvent: v })} /></div>
                            <div className="lg:col-span-1"><CustomSelect label="Janela de conversão" options={CONVERSION_WINDOWS} value={filters.conversionWindow} onChange={(v: any) => setFilters({ ...filters, conversionWindow: v })} /></div>
                            <div className="lg:col-span-1"><FilterMultiSelect label="Tags" placeholder="Todas as tags" options={optionsData.tags} selected={filters.tags} onChange={(v: any) => setFilters({ ...filters, tags: v })} helperText="Suas tags são atualizadas a cada 24 horas" /></div>
                            <div className="lg:col-span-1"><FilterMultiSelect label="Tipo de campanha" placeholder="Todos os tipos..." options={optionsData.types} selected={filters.campaignType} onChange={(v: any) => setFilters({ ...filters, campaignType: v })} /></div>
                            <div className="lg:col-span-1"><CampaignMultiSelect label="Campanhas" options={optionsData.campaigns} selected={filters.campaigns} onChange={(v: any) => setFilters({ ...filters, campaigns: v })} /></div>
                        </div>
                    </div>

                    {/* GRÁFICOS */}
                    <section className="space-y-4">
                        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
                            <div className="grid grid-cols-2 md:grid-cols-6 border-b border-slate-100 dark:border-slate-800 rounded-t-xl">
                                <MetricTab label="Envios" value={fullDailyData.reduce((acc, i) => acc + i.envios, 0).toLocaleString()} icon={<Mail size={14} />} active={engagementMetric === 'envios'} onClick={() => setEngagementMetric('envios')} description={TOOLTIPS.envios} />
                                <MetricTab label="Entregues" value={fullDailyData.reduce((acc, i) => acc + i.entregues, 0).toLocaleString()} sub="98%" icon={<Check size={14} />} active={engagementMetric === 'entregues'} onClick={() => setEngagementMetric('entregues')} description={TOOLTIPS.entregues} />
                                <MetricTab label="Aberturas" value={fullDailyData.reduce((acc, i) => acc + i.aberturas, 0).toLocaleString()} sub="8.7%" icon={<Eye size={14} />} active={engagementMetric === 'aberturas'} onClick={() => setEngagementMetric('aberturas')} />
                                <MetricTab label="Cliques" value={fullDailyData.reduce((acc, i) => acc + i.cliques, 0).toLocaleString()} sub="2.18%" icon={<MousePointer size={14} />} active={engagementMetric === 'cliques'} onClick={() => setEngagementMetric('cliques')} />
                                <MetricTab label="Bounces" value={fullDailyData.reduce((acc, i) => acc + i.bounces, 0).toLocaleString()} sub="1.23%" icon={<XCircle size={14} />} active={engagementMetric === 'bounces'} onClick={() => setEngagementMetric('bounces')} isDanger />
                                <MetricTab label="Rejeições" value={fullDailyData.reduce((acc, i) => acc + i.rejeicoes, 0).toLocaleString()} sub="0.04%" icon={<AlertCircle size={14} />} active={engagementMetric === 'rejeicoes'} onClick={() => setEngagementMetric('rejeicoes')} isDanger />
                            </div>
                            <div className="p-6 h-72 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={currentEngagementData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                        {engagementMetric === 'cliques' && (<YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.ctr }} tickFormatter={(val) => `${val}%`} />)}
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1' }} />
                                        <Line yAxisId="left" type="monotone" dataKey={engagementMetric} stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 2: RECEITA */}
                    <section className="space-y-4">
                        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="grid grid-cols-2 md:grid-cols-6 border-b border-slate-100 dark:border-slate-800 rounded-t-xl">
                                <MetricTab label="Receita Total" value={`R$ ${fullDailyData.reduce((acc, i) => acc + (i.receitaTotal || 0), 0).toLocaleString()}`} active={revenueMetric === 'receitaTotal'} onClick={() => setRevenueMetric('receitaTotal')} description={TOOLTIPS.receitaTotal} showComparison={showComparison} compValue="R$ 1.4M" compPercent={22.4} />
                                <MetricTab label="Receita Influenciada" value={`R$ ${fullDailyData.reduce((acc, i) => acc + i.receitaInfluenciada, 0).toLocaleString()}`} color="text-emerald-600" active={revenueMetric === 'receitaInfluenciada'} onClick={() => setRevenueMetric('receitaInfluenciada')} description={TOOLTIPS.receitaInfluenciada} showComparison={showComparison} compValue="R$ 38k" compPercent={18.5} />
                                <MetricTab label="Conversões" value={fullDailyData.reduce((acc, i) => acc + i.conversoes, 0)} active={revenueMetric === 'conversoes'} onClick={() => setRevenueMetric('conversoes')} description={TOOLTIPS.conversoes} showComparison={showComparison} compValue="130" compPercent={21.5} />
                                <MetricTab label="Vendas Inf." value={fullDailyData.reduce((acc, i) => acc + i.vendasInfluenciadas, 0)} active={revenueMetric === 'vendasInfluenciadas'} onClick={() => setRevenueMetric('vendasInfluenciadas')} description={TOOLTIPS.vendasInfluenciadas} showComparison={showComparison} compValue="125" compPercent={24.8} />
                                <MetricTab label="Base Inf." value={fullDailyData.reduce((acc, i) => acc + i.baseInfluenciada, 0)} active={revenueMetric === 'baseInfluenciada'} onClick={() => setRevenueMetric('baseInfluenciada')} description={TOOLTIPS.baseInfluenciada} showComparison={showComparison} compValue="120" compPercent={25.0} />
                                <MetricTab label="Ticket Médio Inf." value="R$ 285" active={revenueMetric === 'ticket'} onClick={() => setRevenueMetric('ticket')} description={TOOLTIPS.ticket} showComparison={showComparison} compValue="R$ 293" compPercent={-2.4} isDangerComp />
                            </div>
                            <div className="p-6 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={currentRevenueData}>
                                        <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.1} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => formatAxis(val, isRevenueMetricCurrency ? 'currency' : 'number')} />
                                        <Tooltip content={<CustomTooltip type={isRevenueMetricCurrency ? 'currency' : 'number'} />} cursor={{ stroke: '#cbd5e1' }} />
                                        <Area type="monotone" dataKey={revenueMetric} stroke={COLORS.success} fill="url(#colorRevenue)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    {/* TABELA - ONDE FIZEMOS A ALTERAÇÃO PRINCIPAL */}
                    <section className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div><h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Performance</h2><p className="text-xs text-slate-500 dark:text-slate-400">Detalhes por campanha, loja ou disparo.</p></div>
                            <div className="flex gap-2 items-center">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Agrupar por</span>
                                <select className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg p-2 outline-none focus:border-violet-500" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                                    <option>Campanhas</option>
                                    <option>Lojas</option>
                                    <option>Disparos</option>
                                </select>
                                {hasPermission('app:export') && (
                                    <button onClick={handleExportCSV} className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0f172a] px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"><Download size={14} /> Exportar CSV</button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 flex items-center gap-2"><span className="text-xs font-bold text-slate-600 dark:text-slate-400">Nome</span></div>
                                <div className="relative w-full"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 text-sm outline-none bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" value={tableSearch} onChange={e => setTableSearch(e.target.value)} /></div>
                            </div>

                            <div className="overflow-x-auto">
                                {/* TABELA DE DISPAROS - COLUNAS DO PRINT */}
                                {groupBy === 'Disparos' ? (
                                    <table className="w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">Disparos</th>
                                                <th className="px-4 py-4 text-center">Receita influenciada</th>
                                                <th className="px-4 py-4 text-center">Conversões</th>
                                                <th className="px-4 py-4 text-center">Ticket médio influenciado</th>
                                                <th className="px-4 py-4 text-center">Envios</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {currentItems.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500 italic">Nenhum disparo encontrado.</td></tr>
                                            ) : (
                                                currentItems.map((disp: any) => (
                                                    <tr key={disp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-violet-700 dark:text-violet-400 font-bold text-sm">{disp.campaignName}</span>
                                                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{new Date(disp.date).toLocaleDateString('pt-BR')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center font-bold text-emerald-600 dark:text-emerald-500">
                                                            {disp.revenue ? `R$ ${disp.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-slate-700 dark:text-slate-200">{disp.conversions || 0}</td>
                                                        <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300">
                                                            {disp.ticket ? `R$ ${disp.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300">{disp.sent}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                ) : groupBy === 'Campanhas' ? (
                                    <table className="w-full text-xs text-left whitespace-nowrap">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">Campanhas</th>
                                                <th className="px-4 py-4">Data</th>
                                                <th className="px-4 py-4">Canal</th>
                                                <th className="px-4 py-4 text-center">Envios</th>
                                                <th className="px-4 py-4 text-center">Entregas</th>
                                                <th className="px-4 py-4 text-center">Aberturas</th>
                                                <th className="px-4 py-4 text-center">Cliques</th>
                                                <th className="px-4 py-4 text-center">CTR</th>
                                                <th className="px-4 py-4 text-center">CTOR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {currentItems.map((camp: any) => (
                                                <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-violet-700 dark:text-violet-400 text-sm mb-1">{camp.name}</p>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Segmento: <span className="text-emerald-600 dark:text-emerald-500 font-bold underline cursor-pointer">{camp.segmentId || 'Geral'}</span></p>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{new Date(camp.date).toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-4 py-4"><span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 px-2 py-1 rounded-md font-bold text-[10px]">{camp.channel}</span></td>
                                                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300">{camp.sent.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-center"><span className="block text-slate-700 dark:text-slate-200">{camp.delivered.toLocaleString()}</span><span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.deliveredRate}%</span></td>
                                                    <td className="px-4 py-4 text-center"><span className="block text-slate-700 dark:text-slate-200">{camp.opens.toLocaleString()}</span><span className="bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.openRate}%</span></td>
                                                    <td className="px-4 py-4 text-center text-slate-700 dark:text-slate-200">{camp.clicks}</td>
                                                    <td className="px-4 py-4 text-center"><span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.ctr}%</span></td>
                                                    <td className="px-4 py-4 text-center"><span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.ctor}%</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">Lojas</th>
                                                <th className="px-4 py-4 text-right">Receita da Loja</th>
                                                <th className="px-4 py-4 text-right">Receita Influenciada</th>
                                                <th className="px-4 py-4 text-center">Conversões</th>
                                                <th className="px-4 py-4 text-center">Vendas Influenciadas</th>
                                                <th className="px-4 py-4 text-right">Ticket Médio Inf.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {currentItems.map((store: any) => (
                                                <tr key={store.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4"><p className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">{store.name}</p></td>
                                                    <td className="px-4 py-4 text-right font-mono text-slate-600 dark:text-slate-300">R$ {store.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-4 text-right font-bold text-slate-700 dark:text-slate-200">R$ {store.revenueInfluenced.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-4 py-4 text-center text-slate-700 dark:text-slate-200">{store.conversions}</td>
                                                    <td className="px-4 py-4 text-center font-bold text-slate-700 dark:text-slate-200">{store.salesInfluenced}</td>
                                                    <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-300">R$ {store.ticketAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* PAGINAÇÃO */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span>Itens por página</span>
                                    <select className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded p-1 outline-none focus:border-violet-500" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                        <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`w-6 h-6 flex items-center justify-center rounded ${currentPage === 1 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{'<'}</button>
                                    <span>Pág {currentPage} de {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`w-6 h-6 flex items-center justify-center rounded ${currentPage === totalPages || totalPages === 0 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{'>'}</button>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}

// --- SUB-COMPONENTES (Sidebar e Helpers) ---
// ... (MetricTab, Sidebar, NavItem, CustomTooltip permanecem iguais ao código anterior)
function MetricTab({ label, value, sub, icon, active, onClick, color = "text-slate-700 dark:text-slate-200", isDanger, description, showComparison, compValue, compPercent, isDangerComp }: any) { return (<div onClick={onClick} className={`p-4 cursor-pointer transition-all border-r border-slate-100 dark:border-slate-800 last:border-0 relative group/tab ${active ? 'bg-slate-50 dark:bg-slate-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} first:rounded-tl-xl last:rounded-tr-xl`}>{active && <div className="absolute top-0 left-0 w-full h-1 bg-violet-500" />}<div className="flex items-center gap-2 mb-2"><div className="text-slate-400">{icon}</div><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</span>{description && (<div className="relative group/info ml-auto"><Info size={12} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400" /><div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800 dark:bg-slate-700 text-white text-xs p-3 rounded-lg shadow-xl hidden group-hover/info:block z-[100] font-medium leading-relaxed opacity-0 group-hover/info:opacity-100 transition-opacity duration-200 pointer-events-none">{description}<div className="absolute top-full right-1 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></div></div></div>)}</div><div className="flex items-end gap-2"><span className={`text-lg font-bold leading-none ${isDanger ? 'text-red-500' : color}`}>{value}</span>{sub && !showComparison && <span className={`text-[10px] font-bold ${isDanger ? 'text-red-400 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-500'} mb-0.5`}>{sub}</span>}</div>{showComparison && compValue && (<div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60"><p className="text-[10px] text-slate-400 mb-0.5">Comparativo</p><div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{compValue}</span><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isDangerComp || compPercent < 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>{compPercent > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(compPercent)}%</span></div></div>)}</div>) }
const CustomTooltip = ({ active, payload, label, type }: any) => { if (active && payload && payload.length) { return (<div className="bg-slate-900 text-white p-3 shadow-xl rounded-lg text-xs border border-slate-700"><p className="font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</p>{payload.map((entry: any, index: number) => { const isPercent = ['CTR', 'CTOR'].includes(entry.name); let valDisplay = entry.value.toLocaleString('pt-BR'); if (type === 'currency') valDisplay = `R$ ${valDisplay}`; if (isPercent) valDisplay = `${entry.value}%`; return (<div key={index} className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }}></div><span className="text-slate-300">{entry.name}:</span><span className="font-bold text-white ml-auto">{valDisplay}</span></div>) })}</div>); } return null; };