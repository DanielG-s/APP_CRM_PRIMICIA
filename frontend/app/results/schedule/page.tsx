"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    CalendarRange, Plus, ChevronDown, Download,
    Filter, Search, Check, Smartphone, MessageSquare, Mail, PieChart as PieIcon,
    Info, MessageCircle, List // <--- Adicionado 'List' aqui
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { API_BASE_URL } from "@/lib/config";

// --- UTILS ---
const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
const formatDateDisplay = (iso: string) => {
    if (!iso) return '-';
    const datePart = iso.split('T')[0];
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
};
const formatPercent = (val: number) => `${(val * 100).toFixed(2)}%`;
const safeVal = (val: any) => val || 0;

// --- OPÇÕES ESTÁTICAS ---
const VIEW_OPTS = [{ label: 'Número absoluto (#)', value: 'numero' }, { label: 'Número percentual (%)', value: 'percentual' }];
const CAMPAIGN_TYPES = [{ label: 'Diário', value: 'Diário' }, { label: 'Semanal', value: 'Semanal' }, { label: 'Mensal', value: 'Mensal' }, { label: 'Apenas uma vez', value: 'Apenas uma vez' }, { label: 'Assim que ativar', value: 'Assim que ativar' }, { label: 'Comportamento', value: 'Comportamento' }];
const WINDOW_OPTS = [{ label: '7 dias', value: '7 dias' }, { label: '15 dias', value: '15 dias' }, { label: '30 dias', value: '30 dias' }];
const EVENT_OPTS = [{ label: 'Abertura', value: 'Abertura' }, { label: 'Clique', value: 'Clique' }];
const CHANNEL_ICONS: any = { 'Todos': PieIcon, 'E-mail': Mail, 'SMS': MessageCircle, 'Mobile push': Smartphone, 'WhatsApp': MessageSquare };

// KPI Meta
const KPI_META: any = {
    "Receita influenciada": { dataKey: "receita", prefix: "R$ ", suffix: "", color: "#6366f1", tooltip: "Total vendido influenciado pelas agendas." },
    "Contatos realizados": { dataKey: "realizados", prefix: "", suffix: "", color: "#4f46e5", tooltip: "Contatos efetivamente feitos (entregues)." },
    "Contatos confirmados": { dataKey: "confirmados", prefix: "", suffix: "", color: "#10b981", tooltip: "Contatos com interação positiva (cliques/interações)." },
    "Conversões": { dataKey: "conversoes", prefix: "", suffix: "", color: "#f59e0b", tooltip: "Vendas geradas a partir dos contatos." },
    "Descadastros": { dataKey: "descadastros", prefix: "", suffix: "", color: "#ef4444", tooltip: "Clientes que pediram para sair da lista." }
};

// --- COMPONENTES AUXILIARES ---

const CustomTooltipWrapper = ({ children, text }: { children: React.ReactNode; text: string }) => (
    <div className="group relative flex flex-col items-center">
        {children}
        <div className="absolute top-full mt-2 hidden flex-col items-center group-hover:flex z-50 w-64 pointer-events-none">
            <div className="h-3 w-3 -mb-2 rotate-45 bg-[#1e293b]"></div>
            <div className="relative z-10 p-3 text-xs leading-relaxed text-white bg-[#1e293b] rounded-lg shadow-lg text-center">{text}</div>
        </div>
    </div>
);

const CustomSelect = ({ label, options, value, onChange, iconMap }: any) => {
    const [isOpen, setIsOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const c = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
    const s = options.find((o: any) => o.value === value); const Icon = iconMap && s ? iconMap[s.value] : null;
    return (<div className="relative w-full min-w-[180px]" ref={ref}><label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">{label}</label><div onClick={() => setIsOpen(!isOpen)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 cursor-pointer flex justify-between items-center hover:border-violet-500 transition select-none shadow-sm"><div className="flex items-center gap-2 overflow-hidden">{Icon && <Icon size={16} className="text-slate-500 shrink-0" />}<span className="text-slate-700 truncate">{s?.label || value}</span></div><ChevronDown size={16} className="text-slate-400 opacity-70 shrink-0" /></div>{isOpen && (<div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">{options.map((opt: any) => <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false) }} className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer ${value === opt.value ? 'bg-violet-50 text-violet-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}>{iconMap && iconMap[opt.value] && <span className={value === opt.value ? 'text-violet-600' : 'text-slate-400'}>{React.createElement(iconMap[opt.value], { size: 16 })}</span>}<span className="text-sm">{opt.label}</span></div>)}</div>)}</div>)
};

const FilterMultiSelect = ({ label, options, selected, onChange, placeholder, helperText }: any) => {
    const [isOpen, setIsOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const c = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
    const toggle = (val: string) => { if (selected.includes(val)) onChange(selected.filter((i: string) => i !== val)); else onChange([...selected, val]); };
    return (<div className="relative w-full min-w-[180px]" ref={ref}><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{label}</label><div onClick={() => setIsOpen(!isOpen)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 cursor-pointer flex justify-between items-center hover:border-violet-300 transition select-none shadow-sm"><span className="truncate block max-w-[140px] text-slate-600">{selected.length === 0 ? placeholder : `${selected.length} selecionados`}</span><ChevronDown size={14} className="text-slate-400 opacity-70 shrink-0" /></div>{isOpen && (<div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-0 flex flex-col">{helperText && <div className="px-3 py-2 text-[10px] text-slate-400 border-b border-slate-100 bg-slate-50/50">{helperText}</div>}<div className="p-2 space-y-1">{options.length === 0 && <div className="text-xs text-slate-400 p-2 text-center">Vazio</div>}{options.map((opt: any) => (<div key={opt.value} onClick={() => toggle(opt.value)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors"><span className={`text-sm ${selected.includes(opt.value) ? 'text-violet-700 font-medium' : 'text-slate-600'}`}>{opt.label}</span><div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${selected.includes(opt.value) ? 'bg-violet-600 border-violet-600' : 'border-slate-300 bg-white group-hover:border-violet-400'}`}>{selected.includes(opt.value) && <Check size={10} className="text-white" strokeWidth={4} />}</div></div>))}</div></div>)}</div>)
};

const CampaignMultiSelect = ({ label, options, selected, onChange }: any) => {
    const [isOpen, setIsOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const [search, setSearch] = useState("");
    useEffect(() => { const c = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
    const toggle = (val: string) => { if (selected.includes(val)) onChange(selected.filter((i: string) => i !== val)); else onChange([...selected, val]); };
    const selectedOpts = options.filter((o: any) => selected.includes(o.value)); const unselectedOpts = options.filter((o: any) => !selected.includes(o.value) && o.label.toLowerCase().includes(search.toLowerCase()));
    return (<div className="relative w-full min-w-[200px]" ref={ref}><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{label}</label><div onClick={() => setIsOpen(!isOpen)} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 cursor-pointer flex justify-between items-center hover:border-violet-300 transition select-none shadow-sm"><span className="truncate block max-w-[140px] text-slate-600">{selected.length === 0 ? <span className="text-slate-400">Todas as campanhas</span> : <div className="flex gap-1 items-center"><span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs font-bold max-w-[100px] truncate block">{selectedOpts[0]?.label}</span>{selected.length > 1 && <span className="text-xs text-slate-500 font-medium">+{selected.length - 1}</span>}</div>}</span><ChevronDown size={14} className="text-slate-400 opacity-70 shrink-0" /></div>{isOpen && (<div className="absolute top-full left-0 w-full min-w-[320px] mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto p-0 flex flex-col"><div className="p-2 sticky top-0 bg-white border-b border-slate-100 z-10"><input autoFocus type="text" placeholder="Buscar..." className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 outline-none focus:border-violet-400" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="p-2 space-y-1">{selectedOpts.length > 0 && (<div className="mb-2"><div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold text-slate-400"><span>Selecionados</span></div>{selectedOpts.map((opt: any) => <div key={opt.value} onClick={() => toggle(opt.value)} className="flex items-center justify-between p-2 bg-violet-50 hover:bg-violet-100 rounded cursor-pointer"><span className="text-xs font-bold text-violet-700 truncate">{opt.label}</span><Check size={10} className="text-violet-600" /></div>)}<div className="my-2 border-t border-slate-100"></div></div>)}<div className="flex items-center justify-between px-2 py-1 text-[10px] uppercase font-bold text-slate-400"><span>Existentes</span></div>{unselectedOpts.map((opt: any) => <div key={opt.value} onClick={() => toggle(opt.value)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer"><span className="text-xs font-medium text-slate-600 truncate">{opt.label}</span><div className="w-4 h-4 border border-slate-300 rounded shrink-0"></div></div>)}</div></div>)}</div>)
};

const MiniProgressCircle = ({ percent, color }: { percent: number; color: string }) => {
    const data = [{ name: "C", value: percent }, { name: "R", value: 100 - percent }]; const COLORS = [color, "#E2E8F0"];
    return (<div className="relative w-12 h-12 flex items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={16} outerRadius={21} startAngle={90} endAngle={-270} dataKey="value" stroke="none">{data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{Math.round(percent)}%</div></div>);
};
const ChartCursorTooltip = ({ active, payload, label, prefix, suffix }: any) => {
    if (active && payload && payload.length) { return (<div className="bg-white border border-gray-100 p-3 rounded shadow-md text-xs"><p className="text-slate-400 mb-1 font-medium uppercase">{label}</p><p className="text-base font-bold text-slate-800">{prefix}{payload[0].value.toLocaleString('pt-BR')}{suffix}</p></div>); } return null;
};

// --- PÁGINA PRINCIPAL ---
export default function AgendaPage() {
    const getToday = () => new Date().toISOString().split('T')[0];
    const getStartOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

    const [dateRange, setDateRange] = useState({ start: getStartOfMonth(), end: getToday() });
    const [draftDate, setDraftDate] = useState({ start: getStartOfMonth(), end: getToday() });
    const [isDateOpen, setIsDateOpen] = useState(false);
    const dateRef = useRef<HTMLDivElement>(null);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedKpi, setSelectedKpi] = useState("Receita influenciada");
    const [grouping, setGrouping] = useState("Campanhas");
    const [searchTerm, setSearchTerm] = useState("");

    const [viewType, setViewType] = useState('numero');
    const [filters, setFilters] = useState({
        channel: 'Todos', conversionEvent: 'Abertura', conversionWindow: '7 dias',
        tags: [] as string[], campaigns: [] as string[], campaignType: [] as string[], stores: [] as string[], vendedores: [] as string[]
    });
    const [optionsData, setOptionsData] = useState({ tags: [], campaigns: [], stores: [], channels: [], sellers: [] });

    useEffect(() => {
        fetch(`${API_BASE_URL}/sales/filter-options`).then(res => res.json()).then(data => {
            if (data) {
                setOptionsData({
                    tags: (data.tags || []).map((t: string) => ({ label: t, value: t })),
                    campaigns: (data.campaigns || []).map((c: any) => ({ label: c.name, value: c.id })),
                    stores: (data.stores || []).map((s: any) => ({ label: s.name, value: s.id })),
                    channels: data.channels || [],
                    sellers: []
                });
            }
        }).catch(e => console.error(e));
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('start', dateRange.start); params.append('end', dateRange.end);
            if (filters.channel !== 'Todos') params.append('channel', filters.channel);
            params.append('conversionWindow', filters.conversionWindow);
            params.append('conversionEvent', filters.conversionEvent);
            filters.tags.forEach(t => params.append('tags', t));
            filters.campaigns.forEach(c => params.append('campaigns', c));
            filters.campaignType.forEach(t => params.append('campaignType', t));
            filters.stores.forEach(s => params.append('stores', s));

            const res = await fetch(`${API_BASE_URL}/sales/schedule-metrics?${params.toString()}`);
            const json = await res.json();
            setData(json);
        } catch (error) { console.error("Erro Agenda:", error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [dateRange]);
    useEffect(() => {
        const c = (e: MouseEvent) => { if (dateRef.current && !dateRef.current.contains(e.target as Node)) setIsDateOpen(false); };
        document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c);
    }, []);

    const handleApply = () => fetchData();
    const handleClear = () => setFilters({ channel: 'Todos', conversionEvent: 'Abertura', conversionWindow: '7 dias', tags: [], campaigns: [], campaignType: [], stores: [], vendedores: [] });

    const rawTableRows = useMemo(() => {
        if (!data) return [];
        if (grouping === "Campanhas") return data.tables.campaigns;
        else if (grouping === "Lojas") return data.tables.stores;
        else if (grouping === "Vendedores") return data.tables.sellers;
        else return data.tables.daily;
    }, [data, grouping]);

    const filteredTableRows = useMemo(() => {
        if (!searchTerm) return rawTableRows;
        const lower = searchTerm.toLowerCase();
        return rawTableRows.filter((r: any) =>
            (r.name && r.name.toLowerCase().includes(lower)) ||
            (r.id && r.id.toString().toLowerCase().includes(lower)) ||
            (r.date && r.date.includes(lower))
        );
    }, [rawTableRows, searchTerm]);

    const handleExportCSV = () => {
        if (!data) return;
        let header = [];
        if (grouping === 'Campanhas') header = ["Campanha", "Data", "Canal", "Envios", "Entregas", "Aberturas", "Cliques", "CTR", "CTOR"];
        else header = ["Nome", "Receita Influenciada", "Receita/Contato", "Vendas Influenciadas", "Vendas/Contato", "Conversões", "Disponibilizados", "Realizados", "Confirmados", "Não Confirmados"];
        if (grouping === 'Vendedores') header.splice(1, 0, "Loja");

        const csv = [
            header.join(";"),
            ...filteredTableRows.map((r: any) => {
                if (grouping === 'Campanhas') {
                    return [r.name, formatDateDisplay(r.date), r.channel, r.disponibilizados, r.realizados, r.receitaInf, r.confirmados, r.ctr, r.ctor].join(";");
                }
                const base = [
                    r.name, r.receitaInf.toFixed(2), r.receitaCont?.toFixed(2) || 0, r.vendasInf, r.vendasCont?.toFixed(2) || 0,
                    ((r.conversoes || 0) * 100).toFixed(2) + '%', r.disponibilizados, r.realizados, r.confirmados, r.naoConf
                ];
                if (grouping === 'Vendedores') base.splice(1, 0, r.storeName || '-');
                return base.join(";");
            })
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a"); link.href = url; link.setAttribute("download", `agenda_report_${grouping}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const currentMeta = KPI_META[selectedKpi];

    const chartData = useMemo(() => {
        if (!data || !data.history) return [];
        if (viewType === 'percentual' && (selectedKpi === 'Contatos confirmados' || selectedKpi === 'Conversões')) {
            const key = currentMeta.dataKey;
            return data.history.map((h: any) => ({
                ...h,
                [key]: h.realizados > 0 ? Number(((h[key] / h.realizados) * 100).toFixed(1)) : 0
            }));
        }
        return data.history;
    }, [data, viewType, selectedKpi, currentMeta]);

    const getDisplayValue = (value: number, basis: number, isPercentable: boolean) => {
        if (viewType === 'percentual' && isPercentable && basis > 0) return ((value / basis) * 100).toFixed(1) + '%';
        return value.toLocaleString('pt-BR');
    };

    const fmt = (val: number, total: number, isCurrency = false) => {
        if (viewType === 'percentual' && total > 0) return formatPercent(val / total);
        if (isCurrency) return formatCurrency(val);
        return safeVal(val).toLocaleString('pt-BR');
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC] text-slate-500 font-medium">Carregando Agenda...</div>;
    if (!data) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC] text-slate-500">Sem dados.</div>;

    const kpiValues = {
        "Receita influenciada": { value: formatCurrency(data.kpis.receitaInfluenciada), suffix: '' },
        "Contatos realizados": { value: data.kpis.contatosRealizados.toLocaleString('pt-BR'), suffix: '' },
        "Contatos confirmados": { value: getDisplayValue(data.kpis.contatosConfirmados, data.kpis.contatosRealizados, true), suffix: viewType === 'percentual' ? '%' : '' },
        "Conversões": { value: getDisplayValue(data.kpis.conversoes, data.kpis.contatosRealizados, true), suffix: viewType === 'percentual' ? '%' : '' },
        "Descadastros": { value: data.kpis.descadastros, suffix: '' }
    };

    return (
        <main className="p-8 h-full w-full overflow-y-auto custom-scrollbar">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
                    <div><div className="text-xs text-slate-400 mb-1">Campanhas</div><h1 className="text-3xl font-bold text-[#1e293b]">Agenda</h1></div>
                    <button className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm"><Plus size={16} /> Criar campanha</button>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 mb-8">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="relative" ref={dateRef}>
                            <div onClick={() => setIsDateOpen(!isDateOpen)} className="bg-white border border-gray-200 text-slate-600 text-sm rounded px-3 py-2 flex items-center gap-2 shadow-sm cursor-pointer hover:border-gray-300 transition-colors w-fit">
                                <CalendarRange size={16} className="text-slate-400" />
                                <span className="font-medium">{formatDateDisplay(dateRange.start)}</span><span className="text-slate-300">→</span><span className="font-medium">{formatDateDisplay(dateRange.end)}</span>
                                <ChevronDown size={14} className="text-slate-400 ml-2" />
                            </div>
                            {isDateOpen && (
                                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl p-4 w-64 z-50">
                                    <div className="space-y-3">
                                        <div><label className="block text-xs text-slate-500 mb-1">De:</label><input type="date" value={draftDate.start} onChange={(e) => setDraftDate({ ...draftDate, start: e.target.value })} className="w-full border rounded p-1.5 text-xs outline-none" /></div>
                                        <div><label className="block text-xs text-slate-500 mb-1">Até:</label><input type="date" value={draftDate.end} onChange={(e) => setDraftDate({ ...draftDate, end: e.target.value })} className="w-full border rounded p-1.5 text-xs outline-none" /></div>
                                    </div>
                                    <div className="border-t mt-3 pt-3 flex justify-end">
                                        <button className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded" onClick={() => { setDateRange(draftDate); setIsDateOpen(false); }}>Aplicar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleClear} className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition">Limpar Filtros</button>
                            <button onClick={handleApply} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition flex items-center gap-2 shadow-sm">{loading ? '...' : 'Aplicar Filtros'}</button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="w-full sm:w-auto flex-1"><CustomSelect label="Visualização numérica" options={VIEW_OPTS} value={viewType} onChange={setViewType} /></div>
                        <div className="w-full sm:w-auto flex-1"><CustomSelect label="Canal" iconMap={CHANNEL_ICONS} options={[{ label: 'Todos', value: 'Todos' }, ...optionsData.channels.map(c => ({ label: c, value: c }))]} value={filters.channel} onChange={(v: any) => setFilters({ ...filters, channel: v })} /></div>
                        <div className="w-full sm:w-auto flex-1"><FilterMultiSelect label="Tipo de campanha" placeholder="Todos os tipos..." options={CAMPAIGN_TYPES} selected={filters.campaignType} onChange={(v: any) => setFilters({ ...filters, campaignType: v })} /></div>
                        <div className="w-full sm:w-auto flex-1"><CustomSelect label="Janela de conversão" options={WINDOW_OPTS} value={filters.conversionWindow} onChange={(v: any) => setFilters({ ...filters, conversionWindow: v })} /></div>
                        <div className="w-full sm:w-auto flex-1"><FilterMultiSelect label="Tags" placeholder="Todas as tags" options={optionsData.tags} selected={filters.tags} onChange={(v: any) => setFilters({ ...filters, tags: v })} helperText="Suas tags são atualizadas a cada 24 horas" /></div>
                        <div className="w-full sm:w-auto flex-1"><CampaignMultiSelect label="Campanhas" placeholder="Todas as campanhas" options={optionsData.campaigns} selected={filters.campaigns} onChange={(v: any) => setFilters({ ...filters, campaigns: v })} /></div>
                        <div className="w-full sm:w-auto flex-1"><CampaignMultiSelect label="Lojas" placeholder="Todas as lojas" options={optionsData.stores} selected={filters.stores} onChange={(v: any) => setFilters({ ...filters, stores: v })} /></div>
                        <div className="w-full sm:w-auto flex-1"><CampaignMultiSelect label="Vendedores" placeholder="Todos os vendedores" options={[]} selected={filters.vendedores} onChange={(v: any) => setFilters({ ...filters, vendedores: v })} /></div>
                        <div className="w-full sm:w-auto flex-1"><CustomSelect label="Evento de conversão" options={EVENT_OPTS} value={filters.conversionEvent} onChange={(v: any) => setFilters({ ...filters, conversionEvent: v })} /></div>
                    </div>
                </div>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-[#1e293b] mb-4">Consolidado da marca</h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex flex-wrap gap-4 mb-8">
                            {Object.keys(KPI_META).map((label) => {
                                const isSelected = selectedKpi === label;
                                const meta = KPI_META[label];
                                const val = kpiValues[label as keyof typeof kpiValues];
                                return (
                                    <CustomTooltipWrapper key={label} text={meta.tooltip}>
                                        <button onClick={() => setSelectedKpi(label)} className={`text-left px-4 py-3 rounded-lg border transition-all min-w-[160px] outline-none relative top-0 hover:-top-[1px] ${isSelected ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600" : "border-gray-100 hover:border-gray-300 bg-white"}`}>
                                            <div className="text-xs text-slate-500 mb-1 font-medium">{label}</div>
                                            <div className="text-lg font-bold text-[#1e293b]">{val.value}{val.suffix}</div>
                                        </button>
                                    </CustomTooltipWrapper>
                                )
                            })}
                        </div>
                        <div className="relative h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={currentMeta.color} stopOpacity={0.1} /><stop offset="95%" stopColor={currentMeta.color} stopOpacity={0} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="0" vertical={true} horizontal={true} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => viewType === 'percentual' && (selectedKpi === 'Conversões' || selectedKpi === 'Contatos confirmados') ? `${v}%` : v} />
                                    <RechartsTooltip content={<ChartCursorTooltip prefix={currentMeta.prefix} suffix={kpiValues[selectedKpi as keyof typeof kpiValues]?.suffix || ''} />} cursor={{ stroke: currentMeta.color, strokeWidth: 1, strokeDasharray: '3 3' }} />
                                    <Area type="monotone" dataKey={currentMeta.dataKey} stroke={currentMeta.color} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 5, strokeWidth: 2, stroke: "white", fill: currentMeta.color }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <CustomTooltipWrapper text="Total de contatos gerados (sent).">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 h-24 w-full">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">100%</div>
                            <div><div className="text-xs text-slate-500 mb-1">Disponibilizados</div><div className="text-lg font-bold text-[#1e293b]">{data.kpis.disponibilizados.toLocaleString('pt-BR')}</div></div>
                        </div>
                    </CustomTooltipWrapper>
                    <CustomTooltipWrapper text="Contatos que falharam ou ainda não foram entregues.">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 h-24 w-full">
                            <MiniProgressCircle percent={data.kpis.disponibilizados > 0 ? (data.kpis.naoConfirmados / data.kpis.disponibilizados) * 100 : 0} color="#ef4444" />
                            <div><div className="text-xs text-slate-500 mb-1">Não Realizados</div><div className="text-lg font-bold text-[#1e293b]">{data.kpis.naoConfirmados.toLocaleString('pt-BR')}</div></div>
                        </div>
                    </CustomTooltipWrapper>
                    <CustomTooltipWrapper text="Estimativa de clientes únicos atingidos.">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 h-24 w-full">
                            <MiniProgressCircle percent={95} color="#4f46e5" />
                            <div><div className="text-xs text-slate-500 mb-1">Clientes únicos</div><div className="text-lg font-bold text-[#1e293b]">{data.kpis.clientesUnicos.toLocaleString('pt-BR')}</div></div>
                        </div>
                    </CustomTooltipWrapper>
                    <CustomTooltipWrapper text="Média de vezes que cada cliente recebeu contato.">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 h-24 w-full">
                            <div className="w-12 h-12 rounded-full bg-[#eef2ff] text-[#6366f1] flex items-center justify-center"><List size={22} /></div>
                            <div><div className="text-xs text-slate-500 mb-1">Frequência</div><div className="text-lg font-bold text-[#1e293b]">{data.kpis.frequencia}</div></div>
                        </div>
                    </CustomTooltipWrapper>
                </section>

                <section>
                    <div className="flex flex-wrap justify-between items-end mb-4 gap-4">
                        <h2 className="text-xl font-bold text-[#1e293b]">Performance</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-500">Agrupar por</span>
                            <select value={grouping} onChange={(e) => setGrouping(e.target.value)} className="bg-white border border-gray-200 text-slate-700 text-sm rounded px-3 py-2 outline-none cursor-pointer">
                                <option>Campanhas</option>
                                <option>Lojas</option>
                                <option>Vendedores</option>
                                <option>Visão diária</option>
                            </select>
                            <div className="relative">
                                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded text-sm text-slate-700 outline-none w-48 focus:border-violet-500 transition-colors" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            </div>
                            <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 border border-emerald-500 text-emerald-600 rounded text-sm font-bold hover:bg-emerald-50 transition-colors"><Download size={14} /> Exportar CSV</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar pb-2">
                            {grouping === 'Campanhas' && (
                                <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap min-w-[1200px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 uppercase font-bold text-slate-500 bg-slate-50">
                                            <th className="p-4 pl-6 min-w-[250px]">Campanhas</th>
                                            <th className="p-4">Data</th>
                                            <th className="p-4">Canal</th>
                                            <th className="p-4 text-center">Envios</th>
                                            <th className="p-4 text-center">Entregas</th>
                                            <th className="p-4 text-center">Aberturas</th>
                                            <th className="p-4 text-center">Cliques</th>
                                            <th className="p-4 text-center">CTR</th>
                                            <th className="p-4 text-center">CTOR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredTableRows.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="font-bold text-violet-700">{row.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded w-fit">ID: {row.id.substring(0, 8)}</div>
                                                </td>
                                                <td className="p-4 text-slate-500">{formatDateDisplay(row.date)}</td>
                                                <td className="p-4"><span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded font-bold text-[10px]">{row.channel}</span></td>
                                                <td className="p-4 text-center font-bold text-slate-600">{row.disponibilizados || 0}</td>
                                                <td className="p-4 text-center text-slate-500">{row.realizados}</td>
                                                <td className="p-4 text-center text-slate-500">{safeVal(row.realizados * 0.6).toFixed(0)}</td>
                                                <td className="p-4 text-center text-slate-500">{row.confirmados}</td>
                                                <td className="p-4 text-center text-emerald-600 font-bold">29.6%</td>
                                                <td className="p-4 text-center text-blue-600 font-bold">31.1%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {grouping !== 'Campanhas' && (
                                <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap min-w-[1200px]">
                                    <thead>
                                        <tr className="border-b border-gray-100 uppercase font-bold text-slate-500 bg-slate-50">
                                            <th className="p-4 pl-6 min-w-[200px]">{grouping === 'Visão diária' ? 'Dias' : grouping}</th>
                                            {grouping === 'Vendedores' && <th className="p-4">Lojas</th>}
                                            <th className="p-4">Receita influenciada</th>
                                            <th className="p-4">Receita pelo contato</th>
                                            <th className="p-4 text-center">Vendas inf.</th>
                                            <th className="p-4 text-center">Vendas/contato</th>
                                            <th className="p-4 text-center">Conversões</th>
                                            <th className="p-4 text-center">Disponibilizados</th>
                                            <th className="p-4 text-center">Realizados</th>
                                            <th className="p-4 text-center">Confirmados</th>
                                            <th className="p-4 text-center">Não Conf.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredTableRows.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="font-bold text-[#4f46e5]">{row.name || row.date}</div>
                                                    {row.id && <div className="text-[10px] text-slate-400 font-mono mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded w-fit">ID: {row.id.toString().substring(0, 8)}</div>}
                                                </td>
                                                {grouping === 'Vendedores' && (
                                                    <td className="p-4">
                                                        <div className="font-medium text-violet-700">{row.storeName}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded w-fit">ID: {row.storeId?.substring(0, 3)}</div>
                                                    </td>
                                                )}
                                                <td className="p-4 font-medium text-slate-700">{formatCurrency(row.receitaInf)}</td>
                                                <td className="p-4 text-slate-500">{formatCurrency(row.receitaCont)}</td>
                                                <td className="p-4 text-center text-slate-500">{row.vendasInf}</td>
                                                <td className="p-4 text-center text-slate-500">{safeVal(row.vendasCont).toFixed(1)}</td>
                                                <td className="p-4 text-center text-slate-500">{formatPercent(row.conversoes)}</td>
                                                <td className="p-4 text-center font-bold text-slate-600">{row.disponibilizados || 0}</td>
                                                <td className="p-4 text-center text-slate-500">{fmt(row.realizados, row.disponibilizados)}</td>
                                                <td className="p-4 text-center text-emerald-600 font-bold">{fmt(row.confirmados, row.realizados)}</td>
                                                <td className="p-4 text-center text-red-400">{fmt(row.naoConf, row.realizados)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}