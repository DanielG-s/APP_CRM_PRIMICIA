"use client";

import React, { useEffect, useState, useMemo, useRef, useDeferredValue } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, Calendar, Bell, 
  ShoppingBag, TrendingUp, DollarSign, ArrowUp, ArrowDown, RefreshCw, Activity, Wallet, 
  Download, Search, ChevronDown, Smartphone, Mail, CalendarDays, Zap, Layers, Check, 
  ChevronLeft, ChevronRight, Filter, Store, X, FileText, PieChart as PieIcon, Info
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart 
} from 'recharts';

// --- CONSTANTES GLOBAIS ---
const COLORS = {
  primary: "#6366f1",   // Violeta
  secondary: "#0f172a", // Slate Dark
  accent: "#f59e0b",    // Amber/Laranja
  success: "#10b981",   // Emerald
  danger: "#ef4444",    // Red
  neutral: "#94a3b8",   // Gray
  grid: "#e2e8f0"
};

const CHANNEL_ICONS: any = {
  'Agenda': <CalendarDays size={24} />,
  'SMS': <Smartphone size={24} />,
  'E-mail': <Mail size={24} />,
  'WhatsApp': <MessageCircle size={24} />,
  'Agenda + SMS': <Zap size={24} />,
  'Agenda + E-mail': <Layers size={24} />,
  'Outros': <Target size={24} />
};

export default function RetailResultsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS ---
  const today = new Date().toISOString().split('T')[0];
  const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({ start: lastYear, end: today });
  const [draftDate, setDraftDate] = useState({ start: lastYear, end: today });
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [draftStores, setDraftStores] = useState<string[]>([]);
  const [availableStores, setAvailableStores] = useState<any[]>([]);

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const [selectedMetric, setSelectedMetric] = useState('revenue'); 
  const [selectedProfile, setSelectedProfile] = useState('avgSpend');
  const [viewMode, setViewMode] = useState<'mensal' | 'trimestral'>('mensal');
  const [impactViewMode, setImpactViewMode] = useState<'mensal' | 'trimestral'>('mensal');
  const [groupMode, setGroupMode] = useState<'people' | 'revenue'>('people');
  
  const [isChannelFilterOpen, setIsChannelFilterOpen] = useState(false);
  const PRIMITIVE_CHANNELS = ['Agenda', 'SMS', 'E-mail', 'WhatsApp', 'Mobile Push'];
  const [activeFilters, setActiveFilters] = useState<string[]>([...PRIMITIVE_CHANNELS]);
  const [staticStores, setStaticStores] = useState<any[]>([]);

  const dateRef = useRef<HTMLDivElement>(null);
  const globalFilterRef = useRef<HTMLDivElement>(null);
  const channelFilterRef = useRef<HTMLDivElement>(null);

  async function fetchData(start: string, end: string, stores: string[]) {
    setLoading(true);
    try {
      const storesQuery = stores.length > 0 ? `&stores=${stores.join(',')}` : '';
      const url = `http://localhost:3000/webhook/erp/retail-metrics?start=${start}&end=${end}${storesQuery}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error("Erro API");
      const json = await res.json();
      setData(json);
      setStaticStores(json.stores || []);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  }

  useEffect(() => {
    async function loadStores() {
        try {
            const res = await fetch('http://localhost:3000/webhook/erp/stores');
            if (res.ok) setAvailableStores(await res.json());
        } catch (e) { console.error(e); }
    }
    loadStores();
  }, []);

  useEffect(() => { fetchData(dateRange.start, dateRange.end, selectedStores); }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setIsDateOpen(false);
      if (globalFilterRef.current && !globalFilterRef.current.contains(event.target as Node)) setIsFilterMenuOpen(false);
      if (isChannelFilterOpen && channelFilterRef.current && !channelFilterRef.current.contains(event.target as Node)) setIsChannelFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChannelFilterOpen, isDateOpen, isFilterMenuOpen]);

  // Actions
  const handleApplyGlobalFilters = () => {
    setDateRange(draftDate);
    setSelectedStores(draftStores);
    setIsDateOpen(false);
    setIsFilterMenuOpen(false);
    fetchData(draftDate.start, draftDate.end, draftStores);
  };

  const handleClearFilters = () => {
    const defaultStart = lastYear;
    const defaultEnd = today;
    setDraftDate({ start: defaultStart, end: defaultEnd });
    setDraftStores([]);
    setDateRange({ start: defaultStart, end: defaultEnd });
    setSelectedStores([]);
    fetchData(defaultStart, defaultEnd, []);
  };

  const toggleStoreSelection = (id: string) => {
    if (draftStores.includes(id)) setDraftStores(draftStores.filter(s => s !== id));
    else setDraftStores([...draftStores, id]);
  };

  const toggleChannelFilter = (ch: string) => {
    setActiveFilters(prev => prev.includes(ch) ? prev.filter(f => f !== ch) : [...prev, ch]);
  };

  const formatDateDisplay = (iso: string) => {
    if(!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  // --- LÓGICA DE DADOS ---
  const processData = (mode: 'mensal' | 'trimestral') => {
    if (!data) return [];
    
    // MODO MENSAL
    if (mode === 'mensal') {
        return data.history.map((item: any) => ({
            ...item,
            revenueOrganic: item.revenue - item.revenueInfluenced 
        }));
    }

    // MODO TRIMESTRAL (Agregação)
    const groupedData: any = {};
    
    data.history.forEach((item: any, index: number) => {
       const quarterIndex = Math.floor(index / 3) + 1;
       const year = item.name.split(' ')[1] || ''; 
       const label = `Trim ${quarterIndex} ${year}`;

       if(!groupedData[label]) { 
           groupedData[label] = { 
               name: label, count: 0, 
               revenue:0, revenueLastYear:0, transactions:0, revenueInfluenced:0, 
               groupNew:0, groupRecurrent:0, groupRecovered:0, 
               consumers:0, consumersActive:0,
               accTicket: 0, accRepurchase: 0, accAvgSpend: 0, accInterval: 0, accFrequency: 0
           }; 
       }
       
       const g = groupedData[label];
       g.revenue += item.revenue || 0;
       g.revenueLastYear += item.revenueLastYear || 0;
       g.transactions += item.transactions || 0;
       g.revenueInfluenced += item.revenueInfluenced || 0;
       g.groupNew += item.groupNew || 0;
       g.groupRecurrent += item.groupRecurrent || 0;
       g.groupRecovered += item.groupRecovered || 0;
       
       g.consumers += item.consumers || 0;
       g.consumersActive += item.consumersActive || 0;
       g.accTicket += item.ticket || 0;
       g.accRepurchase += Number(item.repurchase) || 0;
       g.accAvgSpend += item.avgSpend || 0;
       g.accInterval += item.interval || 0;
       g.accFrequency += item.frequency || 0;
       
       g.count++;
    });

    return Object.values(groupedData).map((g: any) => ({
        ...g,
        revenueOrganic: g.revenue - g.revenueInfluenced,
        ticket: g.count ? Math.round(g.revenue / g.transactions) : 0, 
        itemsPerTicket: g.count ? (g.transactions > 0 ? (g.revenue / g.transactions / 150).toFixed(2) : 0) : 0,
        repurchase: g.count ? (g.accRepurchase / g.count).toFixed(1) : 0,
        avgSpend: g.count ? Math.round(g.accAvgSpend / g.count) : 0,
        interval: g.count ? Math.round(g.accInterval / g.count) : 0,
        frequency: g.count ? (g.accFrequency / g.count).toFixed(2) : 0,
        consumers: Math.round(g.consumers / g.count),
        consumersActive: Math.round(g.consumersActive / g.count),
        revenueNew: g.transactions > 0 ? Math.round((g.groupNew / g.transactions) * g.revenue) : 0,
        revenueRecurrent: g.transactions > 0 ? Math.round((g.groupRecurrent / g.transactions) * g.revenue) : 0,
        revenueRecovered: g.transactions > 0 ? Math.round((g.groupRecovered / g.transactions) * g.revenue) : 0,
    }));
  };

  const mainGraphData = useMemo(() => processData(viewMode), [data, viewMode]);
  const impactGraphData = useMemo(() => processData(impactViewMode), [data, impactViewMode]);
  
  const donutTotals = useMemo(() => {
    if (!impactGraphData.length) return { total: 0, influenced: 0, percent: "0" };
    const total = impactGraphData.reduce((acc: number, item: any) => acc + item.revenue, 0);
    const influenced = impactGraphData.reduce((acc: number, item: any) => acc + item.revenueInfluenced, 0);
    return { total, influenced, percent: total > 0 ? ((influenced / total) * 100).toFixed(2) : "0" };
  }, [impactGraphData]);

  const { visibleCards, allTableData } = useMemo(() => {
    if (!data) return { visibleCards: [], allTableData: [] };
    const channels = data.channels;
    
    const eligibleChannels = channels.filter((ch: any) => {
        if (ch.name === 'Outros') return true;
        const parts = ch.name.split(' + ').map((p: string) => p.trim());
        return parts.some((part: string) => activeFilters.includes(part));
    });

    const sorted = eligibleChannels.sort((a: any, b: any) => b.value - a.value);
    
    const topChannels = sorted.filter((c:any) => c.name !== 'Outros').slice(0, 5);
    const others = sorted.slice(5).concat(sorted.filter((c:any) => c.name === 'Outros'));
    
    const finalCards = [...topChannels];
    if (others.length > 0) {
        const othersVal = others.reduce((acc: number, c: any) => acc + c.value, 0);
        const othersPct = data.kpis.revenue > 0 ? ((othersVal / data.kpis.revenue) * 100).toFixed(2) : "0";
        finalCards.push({ name: 'Outros Canais', value: othersVal, percent: othersPct, items: others, isOther: true });
    }

    return { visibleCards: finalCards, allTableData: sorted };
  }, [data, activeFilters]);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500 font-medium bg-[#f1f5f9]">Carregando Dashboard...</div>;
  if (!data) return <div className="flex h-screen items-center justify-center text-slate-500 bg-[#f1f5f9]">Sem dados disponíveis.</div>;

  // --- TEXTOS ---
  const TEXTS = {
    performance: "Visão geral dos principais indicadores financeiros da rede.",
    impacto: "Analise quanto da sua receita veio de esforços de marketing direto.",
    carteira: "Acompanhe a evolução da sua base de clientes ativos vs total.",
    comportamento: "Entenda a frequência, recência e valor monetário dos clientes.",
    segmentacao: "Distribuição entre clientes novos, recorrentes e recuperados.",
    canais: "Eficiência detalhada por canal de comunicação."
  };

  const kpiChartConfig: any = { 
      revenue: { prefix: "R$", lines: [{ key: "revenue", color: COLORS.primary, name: "Receita Atual", type: "area" }, { key: "revenueLastYear", color: COLORS.neutral, name: "Ano Anterior", type: "line" }] }, 
      transactions: { prefix: "", lines: [{ key: "transactions", color: COLORS.secondary, name: "Volume de Vendas", type: "line" }] }, 
      ticket: { prefix: "R$", lines: [{ key: "ticket", color: COLORS.primary, name: "Ticket Médio", type: "line" }, { key: "itemsPerTicket", color: COLORS.accent, name: "Peças/Atendimento", type: "line", yAxisId: "right" }] }, 
      repurchase: { prefix: "%", lines: [{ key: "repurchase", color: COLORS.success, name: "Taxa de Recompra", type: "line" }] } 
  };

  const profileConfig: any = { 
    avgSpend: { title: "LTV (12 meses)", color: COLORS.primary, dataKey: "avgSpend", prefix: "R$" }, 
    interval: { title: "Ciclo de Compra (dias)", color: COLORS.accent, dataKey: "interval", prefix: "" }, 
    frequency: { title: "Frequência Anual", color: COLORS.secondary, dataKey: "frequency", prefix: "" } 
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 shadow-2xl z-30 transition-all">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
            <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-900/50">P</div>
            <span className="font-bold text-xl tracking-tight text-white ml-3 hidden lg:block">PRIMÍCIA</span>
        </div>
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
          <NavItem icon={<Home size={20}/>} label="Visão Geral" />
          <NavItem icon={<Users size={20}/>} label="Carteira de Clientes" />
          <div className="mt-6 mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:block">Analytics</div>
          <NavItem icon={<BarChart2 size={20}/>} label="Performance Varejo" active />
          <NavItem icon={<PieIcon size={20}/>} label="Canais & Origem" />
          <div className="mt-6 mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:block">Engajamento</div>
          <NavItem icon={<MessageCircle size={20}/>} label="Campanhas" />
          <NavItem icon={<Target size={20}/>} label="Metas & Objetivos" />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-violet-100 text-violet-700 p-1.5 rounded-md"><BarChart2 size={18}/></span>
                Performance Executiva
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-700">Admin User</p>
                <p className="text-[10px] text-slate-400">Diretor Comercial</p>
             </div>
             <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">AD</div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-10 scroll-smooth">
          
          {/* BARRA DE FILTROS */}
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center pl-2 pr-2 relative z-50">
            <div className="flex items-center gap-2">
                {/* Date Picker */}
                <div onClick={() => setIsDateOpen(!isDateOpen)} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition relative" ref={dateRef}>
                    <Calendar size={14} className="text-violet-500"/> 
                    <span>{formatDateDisplay(dateRange.start)}</span> 
                    <span className="text-slate-300">→</span> 
                    <span>{formatDateDisplay(dateRange.end)}</span>
                    {isDateOpen && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl p-4 w-64 z-50" onClick={(e) => e.stopPropagation()}>
                            <div className="space-y-3">
                                <div><label className="block text-xs text-slate-500 mb-1">De:</label><input type="date" value={draftDate.start} onChange={(e) => setDraftDate({...draftDate, start: e.target.value})} className="w-full border rounded p-1.5 text-xs outline-none focus:border-violet-500" /></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Até:</label><input type="date" value={draftDate.end} onChange={(e) => setDraftDate({...draftDate, end: e.target.value})} className="w-full border rounded p-1.5 text-xs outline-none focus:border-violet-500" /></div>
                            </div>
                            <div className="border-t mt-3 pt-3 flex justify-end gap-2">
                                <button className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded" onClick={handleApplyGlobalFilters}>Filtrar</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loja Selector */}
                <div className="relative" ref={globalFilterRef}>
                    <div onClick={() => { setDraftStores([...selectedStores]); setIsFilterMenuOpen(!isFilterMenuOpen); }} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition select-none">
                        <Store size={14} className="text-violet-500"/>
                        {selectedStores.length > 0 ? `${selectedStores.length} Lojas Selecionadas` : 'Todas as Lojas'} 
                        <ChevronDown size={12}/>
                    </div>
                    {isFilterMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50">
                            <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
                                {availableStores.map(store => (
                                    <label key={store.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${draftStores.includes(store.id) ? 'bg-violet-600 border-violet-600' : 'border-slate-300 bg-white'}`} onClick={(e) => { e.preventDefault(); toggleStoreSelection(store.id); }}>
                                            {draftStores.includes(store.id) && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className="text-xs text-slate-700 truncate font-medium">{store.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="pt-2 mt-2 border-t flex justify-end">
                                <button className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded" onClick={handleApplyGlobalFilters}>Confirmar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex gap-2 pr-1">
                <button onClick={handleClearFilters} className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-1.5">Limpar</button>
                <button onClick={handleApplyGlobalFilters} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 shadow-sm transition-all">Atualizar Dashboard</button>
            </div>
          </div>

          {/* 1. KPIs PRINCIPAIS */}
          <section>
            <SectionTitle title="Indicadores de Performance" subtitle={TEXTS.performance} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                <ModernKPICard label="Faturamento Total" value={data.kpis.revenue} percent={11.69} active={selectedMetric === 'revenue'} onClick={() => setSelectedMetric('revenue')} icon={<DollarSign size={18}/>} isCurrency />
                <ModernKPICard label="Volume de Vendas" value={data.kpis.transactions} percent={-0.93} isRed active={selectedMetric === 'transactions'} onClick={() => setSelectedMetric('transactions')} icon={<ShoppingBag size={18}/>} />
                <ModernKPICard label="Ticket Médio" value={data.kpis.ticketAverage} percent={12.74} active={selectedMetric === 'ticket'} onClick={() => setSelectedMetric('ticket')} icon={<TrendingUp size={18}/>} isCurrency />
                <ModernKPICard label="Taxa de Recompra" value={data.kpis.repurchaseRate} percent={5.01} active={selectedMetric === 'repurchase'} onClick={() => setSelectedMetric('repurchase')} icon={<RefreshCw size={18}/>} isPercent />
            </div>
            
            {/* Gráfico Principal */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 relative">
                <div className="absolute top-6 right-6 z-10 flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                    {['mensal', 'trimestral'].map((m:any) => (
                        <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase ${viewMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{m}</button>
                    ))}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mainGraphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} tickFormatter={(val) => kpiChartConfig[selectedMetric].prefix + (val > 1000 ? val/1000 + 'k' : val)}/>
                        {selectedMetric === 'ticket' && <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />}
                        <Tooltip content={<CustomTooltip />} cursor={{stroke: '#cbd5e1', strokeWidth: 1}} />
                        <Legend verticalAlign="top" height={36} iconType="circle" align="left" wrapperStyle={{fontSize: '12px', fontWeight: 600, color: '#475569'}}/>
                        {kpiChartConfig[selectedMetric].lines.map((line: any, idx: number) => { 
                            if (line.type === 'area') return <Area key={idx} type="monotone" yAxisId={line.yAxisId || 0} dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={2} fill="url(#colorMetric)" activeDot={{r:5}} />;
                            return <Line key={idx} type="monotone" yAxisId={line.yAxisId || 0} dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={2} dot={false} activeDot={{r:5}} />;
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </section>

          {/* 2. BASE & PERFIL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section>
                <SectionTitle title="Evolução da Carteira" subtitle={TEXTS.carteira} />
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mainGraphData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                            <Tooltip content={<CustomTooltip type="number" />} />
                            <Legend verticalAlign="top" iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600}} />
                            <Line type="monotone" dataKey="consumers" name="Total Clientes Únicos" stroke={COLORS.secondary} strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="consumersActive" name="Ativos (Recentes)" stroke={COLORS.success} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
            <section>
                <SectionTitle title="Comportamento de Compra" subtitle={TEXTS.comportamento} />
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-[380px] flex flex-col">
                    <div className="flex gap-2 mb-4">
                        <TabButton 
                            label="LTV Anual" 
                            tooltip="Valor médio gasto por cliente acumulado em 12 meses."
                            active={selectedProfile === 'avgSpend'} 
                            onClick={() => setSelectedProfile('avgSpend')} 
                        />
                        <TabButton 
                            label="Ciclo (Dias)" 
                            tooltip="Média de dias que um cliente recorrente leva para comprar novamente."
                            active={selectedProfile === 'interval'} 
                            onClick={() => setSelectedProfile('interval')} 
                        />
                        <TabButton 
                            label="Frequência" 
                            tooltip="Quantidade média de compras por cliente no período."
                            active={selectedProfile === 'frequency'} 
                            onClick={() => setSelectedProfile('frequency')} 
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mainGraphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                                <Tooltip content={<CustomTooltip type={selectedProfile === 'avgSpend' ? 'currency' : 'number'} />} />
                                <Line type="step" dataKey={profileConfig[selectedProfile].dataKey} stroke={profileConfig[selectedProfile].color} strokeWidth={2} dot={false} name={profileConfig[selectedProfile].title} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>
          </div>

          {/* 4. SEGMENTAÇÃO */}
          <section>
            <SectionTitle title="Segmentação da Base" subtitle={TEXTS.segmentacao} />
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 relative">
                <div className="absolute top-6 right-6 z-10 flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button onClick={() => setGroupMode('people')} className={`px-3 py-1 text-[10px] font-bold rounded transition ${groupMode === 'people' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>Pessoas</button>
                    <button onClick={() => setGroupMode('revenue')} className={`px-3 py-1 text-[10px] font-bold rounded transition ${groupMode === 'revenue' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>Receita</button>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mainGraphData} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                        <Tooltip content={<CustomTooltip type={groupMode === 'revenue' ? 'currency' : 'number'} />} cursor={{fill: '#f8fafc'}} />
                        <Legend iconType="circle" align="left" verticalAlign="top" height={36} wrapperStyle={{fontSize:'12px'}}/>
                        <Bar dataKey={groupMode === 'people' ? 'groupRecurrent' : 'revenueRecurrent'} name="Recorrentes" stackId="a" fill={COLORS.primary} />
                        <Bar dataKey={groupMode === 'people' ? 'groupNew' : 'revenueNew'} name="Novos Clientes" stackId="a" fill={COLORS.success} />
                        <Bar dataKey={groupMode === 'people' ? 'groupRecovered' : 'revenueRecovered'} name="Recuperados" stackId="a" fill={COLORS.neutral} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </section>

          {/* 5. ATRIBUIÇÃO DE RECEITA (ORGANIZADO) */}
          <section>
             <SectionTitle title="Atribuição de Receita" subtitle={TEXTS.impacto} />
             
             {/* BLOCO DE CIMA: RECEITA (DONUT + ÁREA) */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1/3: Donut (Snapshot) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center h-full">
                        <div className="relative w-48 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={[{value: Number(donutTotals.percent)}, {value: 100 - Number(donutTotals.percent)}]} innerRadius={60} outerRadius={75} startAngle={90} endAngle={-270} dataKey="value" stroke="none" paddingAngle={5}>
                                        <Cell fill={COLORS.success} /> <Cell fill="#f1f5f9" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-slate-800 tracking-tighter">{donutTotals.percent}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">TAXA DE INFLUÊNCIA</span>
                            </div>
                        </div>
                        <div className="w-full mt-6 space-y-3">
                            <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                <span className="text-slate-500">Receita Total</span>
                                <span className="font-bold text-slate-700">{donutTotals.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600 font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Influenciada</span>
                                <span className="font-bold text-emerald-600">{donutTotals.influenced.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2/3: Gráfico de Área (Evolução) */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800">Evolução: Orgânico vs. Influenciado</h3>
                            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                                {['mensal', 'trimestral'].map((m:any) => (
                                    <button key={m} onClick={() => setImpactViewMode(m)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase ${impactViewMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{m}</button>
                                ))}
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={impactGraphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} tickFormatter={(val) => (val > 1000000 ? `R$ ${(val/1000000).toFixed(1)}mi` : `R$ ${(val/1000).toFixed(0)}k`)} />
                                    <Tooltip content={<CustomTooltip type="currency" />} cursor={{stroke: '#cbd5e1'}} />
                                    <Legend iconType="circle" align="left" verticalAlign="top" height={36} wrapperStyle={{fontSize:'12px'}}/>
                                    <Area type="monotone" dataKey="revenueInfluenced" name="Receita Influenciada" stackId="1" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.8} />
                                    <Area type="monotone" dataKey="revenueOrganic" name="Receita Orgânica" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
             </div>

             {/* BLOCO DE BAIXO: CANAIS (CARDS + TABELA) */}
             <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <SectionTitle title="Performance por Canal" subtitle={TEXTS.canais} />
                    
                    {/* FILTRO CANAIS */}
                    <div className="relative" ref={channelFilterRef}>
                        <button onClick={(e) => { e.stopPropagation(); setIsChannelFilterOpen(!isChannelFilterOpen); }} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-violet-400 transition">
                            <Filter size={12} /> Filtrar Canais <ChevronDown size={12}/>
                        </button>
                        {isChannelFilterOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50" onClick={(e) => e.stopPropagation()}>
                                <div className="space-y-1">
                                    {PRIMITIVE_CHANNELS.map(ch => (
                                        <div key={ch} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleChannelFilter(ch); }}>
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeFilters.includes(ch) ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300'}`}>
                                                {activeFilters.includes(ch) && <Check size={10} className="text-white" />}
                                            </div>
                                            <span className="text-xs text-slate-700">{ch}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 mt-2 border-t text-right">
                                    <span onClick={(e) => {e.stopPropagation(); setActiveFilters([])}} className="text-[10px] font-bold text-red-500 cursor-pointer hover:underline">Limpar</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bento Grid */}
                <div className={`grid gap-4 relative z-0 ${getGridClass(visibleCards.length)}`}>
                    {visibleCards.map((card: any, idx: number) => (
                        <div key={idx} className={getSlotClass(idx, visibleCards.length)}>
                            <ModernChannelCard data={card} isBig={idx === 0 && visibleCards.length >= 3} />
                        </div>
                    ))}
                </div>

                {/* Tabela de Canais */}
                <ChannelsTable data={allTableData} />
             </div>
          </section>

          {/* 7. LISTA DE LOJAS */}
          <StoresTableSection stores={staticStores} />

        </div>
      </main>
    </div>
  );
}

// --- COMPONENTES VISUAIS (DESIGN SYSTEM) ---

function SectionTitle({title, subtitle}: {title: string, subtitle?: string}) { 
    return (
        <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                {title}
            </h2>
            {subtitle && <p className="text-xs text-slate-400 ml-3 mt-0.5">{subtitle}</p>}
        </div>
    )
}

function ModernKPICard({ label, value, percent, active, onClick, icon, isRed, isCurrency, isPercent }: any) {
    let display = value;
    if(typeof value === 'number') {
        if(isPercent) display = value.toFixed(2) + "%";
        else if(isCurrency) display = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
        else display = value.toLocaleString('pt-BR');
    }

    return (
        <div onClick={onClick} className={`relative bg-white p-5 rounded-xl border transition-all cursor-pointer group hover:-translate-y-1 ${active ? 'border-violet-500 shadow-md ring-1 ring-violet-500' : 'border-slate-200 hover:border-violet-300 shadow-sm'}`}>
            <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${active ? 'bg-violet-500' : 'bg-transparent group-hover:bg-violet-200'}`} />
            <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isRed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {percent > 0 ? <ArrowUp size={10}/> : <ArrowDown size={10}/>} {Math.abs(percent)}%
                </span>
            </div>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${active ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-400 group-hover:text-violet-500'}`}>{icon}</div>
                <span className="text-2xl font-bold text-slate-800 tracking-tight">{display}</span>
            </div>
        </div>
    )
}

function TabButton({ label, active, onClick, tooltip }: any) {
    return (
        <div className="relative group">
            <button onClick={onClick} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                {label}
                {tooltip && <Info size={10} className={active ? 'text-slate-400' : 'text-slate-300'} />}
            </button>
            {tooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl hidden group-hover:block z-50 text-center leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
            )}
        </div>
    )
}

function NavItem({ icon, label, active }: any) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-all ${active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            {icon}
            <span className="text-sm font-medium hidden lg:block">{label}</span>
        </div>
    )
}

function ModernChannelCard({ data, isBig }: any) { 
    if (!data) return null; 
    return (
        <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-4 h-full flex flex-col justify-between hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-lg ${data.isOther ? 'bg-slate-100 text-slate-500' : 'bg-violet-50 text-violet-600'}`}>
                    {CHANNEL_ICONS[data.name] || <Target size={20}/>}
                </div>
                <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full border border-slate-100">
                    {data.percent}%
                </span>
            </div>
            <div>
                <h4 className="text-slate-500 text-xs font-bold uppercase mb-1 mt-2">{data.name}</h4>
                <p className="text-lg font-bold text-slate-800">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(data.value)}
                </p>
            </div>
            {data.isOther && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur flex flex-col p-4 opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Detalhes</p>
                    {data.items.slice(0,3).map((it:any, idx:number) => (
                        <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-100">
                            <span>{it.name}</span>
                            <span className="font-bold">{it.percent}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    ) 
}

function StoresTableSection({ stores }: { stores: any[] }) {
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'revenue', direction: 'desc' });

    const handleSort = (key: string) => {
        setSortConfig((current) => ({ key, direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc' }));
    };

    const { paginatedStores, totalStores, totalPages } = useMemo(() => {
        let processed = [...stores];
        if (deferredSearch) processed = processed.filter(s => s.name.toLowerCase().includes(deferredSearch.toLowerCase()));
        
        processed.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (typeof valA === 'string' && !isNaN(Number(valA))) valA = Number(valA);
            if (typeof valB === 'string' && !isNaN(Number(valB))) valB = Number(valB);
            return sortConfig.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
        });

        const start = (page - 1) * perPage;
        return { paginatedStores: processed.slice(start, start + perPage), totalStores: processed.length, totalPages: Math.ceil(processed.length / perPage) };
    }, [stores, deferredSearch, page, perPage, sortConfig]);

    const SortHeader = ({ label, k, align="left" }: any) => (
        <th className={`px-6 py-3 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-violet-600 transition text-${align}`} onClick={() => handleSort(k)}>
            <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
                {label} {sortConfig.key === k && (sortConfig.direction === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>)}
            </div>
        </th>
    );

    return (
        <section>
            <SectionTitle title="Ranking de Lojas" />
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                    <Search className="text-slate-400" size={16} />
                    <input type="text" placeholder="Filtrar lojas..." value={search} onChange={(e) => setSearch(e.target.value)} className="text-sm outline-none w-full placeholder-slate-400 text-slate-700"/>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <SortHeader label="Loja" k="name" />
                            <SortHeader label="Receita" k="revenue" />
                            <SortHeader label="Influência" k="revenueInfluenced" />
                            <SortHeader label="Transações" k="transactions" />
                            <SortHeader label="Recompra" k="repurchase" align="center" />
                            <SortHeader label="PA" k="itemsPerTicket" align="center" />
                            <SortHeader label="Ticket Médio" k="ticket" align="right" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedStores.map((s: any) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-700">{s.name}</td>
                                <td className="px-6 py-4 font-mono text-slate-600">R$ {s.revenue.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td>
                                <td className="px-6 py-4 font-mono text-slate-600">R$ {s.revenueInfluenced.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td>
                                <td className="px-6 py-4 text-slate-500">{s.transactions}</td>
                                <td className="px-6 py-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{s.repurchase}%</span></td>
                                <td className="px-6 py-4 text-center text-slate-600 font-mono">{s.itemsPerTicket}</td>
                                <td className="px-6 py-4 text-right font-bold text-slate-700">R$ {s.ticket.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-2 text-xs text-slate-500">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="disabled:opacity-30 hover:text-violet-600 font-bold"><ChevronLeft size={16}/></button>
                    <span>Página {page} de {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="disabled:opacity-30 hover:text-violet-600 font-bold"><ChevronRight size={16}/></button>
                </div>
            </div>
        </section>
    );
}

function ChannelsTable({ data }: { data: any[] }) {
    const [search, setSearch] = useState("");
    const deferred = useDeferredValue(search);
    const filtered = useMemo(() => data.filter(c => c.name.toLowerCase().includes(deferred.toLowerCase())), [data, deferred]);
    
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-100 flex justify-between">
                <div className="flex items-center gap-2 w-full max-w-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Search size={14} className="text-slate-400"/>
                    <input type="text" placeholder="Buscar canal..." className="bg-transparent outline-none text-xs w-full" value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
                <button className="text-xs font-bold text-violet-600 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition">Exportar CSV</button>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase text-left">
                    <tr><th className="px-6 py-3">Canal</th><th className="px-6 py-3">Receita</th><th className="px-6 py-3 text-right">% Share</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.map((ch: any, i:number) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-bold text-slate-700 flex items-center gap-2">{CHANNEL_ICONS[ch.name] || <Target size={16}/>} {ch.name}</td>
                            <td className="px-6 py-3 font-mono text-slate-600">R$ {ch.value.toLocaleString('pt-BR')}</td>
                            <td className="px-6 py-3 text-right"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{ch.percent}%</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function getGridClass(count: number) {
    if (count <= 2) return "grid-cols-1 lg:grid-cols-2 h-[200px]"; // Altura menor, mais compacto
    if (count === 3) return "grid-cols-1 lg:grid-cols-3 h-[200px]";
    return "grid-cols-1 lg:grid-cols-3 h-[400px]"; 
}

function getSlotClass(index: number, total: number) {
     if (total > 4 && index === 0) return "lg:col-span-2 lg:row-span-2 h-full";
     return "col-span-1 h-full";
}

const CustomTooltip = ({ active, payload, label, type }: any) => { 
    if (active && payload && payload.length) { 
        return (
            <div className="bg-slate-900 text-white p-3 shadow-xl rounded-lg text-xs border border-slate-700">
                <p className="font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-slate-300">{entry.name}:</span>
                        <span className="font-bold text-white ml-auto">
                            {type === 'currency' ? `R$ ${entry.value.toLocaleString('pt-BR')}` : entry.value.toLocaleString('pt-BR')}
                        </span>
                    </div>
                ))}
            </div>
        ); 
    } 
    return null; 
};