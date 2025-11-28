"use client";

import React, { useEffect, useState, useMemo, useRef, useDeferredValue } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, Calendar, Bell, 
  ShoppingBag, TrendingUp, DollarSign, ArrowUp, RefreshCw, Activity, Wallet, 
  Download, Search, ChevronDown, Smartphone, Mail, CalendarDays, Zap, Layers, Check, 
  ChevronLeft, ChevronRight, Filter, Store, X, FileText
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart 
} from 'recharts';

// --- CONSTANTES GLOBAIS ---
const COLORS = {
  blue: "#2563eb", green: "#10b981", purple: "#8b5cf6", gray: "#d1d5db", red: "#ef4444", warning: "#f59e0b", darkTooltip: "#1e2336",
  primary: "#6366f1", primaryLight: "#818cf8", secondary: "#a5b4fc", success: "#10b981", danger: "#f43f5e", textSub: "#64748b"
};
const THEME = COLORS;

const CHANNEL_ICONS: any = {
  'Agenda': <CalendarDays size={28} />,
  'SMS': <Smartphone size={28} />,
  'E-mail': <Mail size={28} />,
  'WhatsApp': <MessageCircle size={28} />,
  'Agenda + SMS': <Zap size={28} />,
  'Agenda + E-mail': <Layers size={28} />,
  'Outros': <Target size={28} />
};

const FAKE_STORES = Array.from({ length: 15 }).map((_, i) => ({ id: i.toString(), name: i === 0 ? "Primícia - Loja Matriz" : `Primícia - Filial ${i}` }));

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
  
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const [selectedMetric, setSelectedMetric] = useState('revenue'); 
  const [selectedProfile, setSelectedProfile] = useState('avgSpend');
  const [viewMode, setViewMode] = useState<'mensal' | 'trimestral'>('mensal');
  const [impactViewMode, setImpactViewMode] = useState<'mensal' | 'trimestral'>('mensal');
  const [groupMode, setGroupMode] = useState<'people' | 'revenue'>('people');
  
  // Filtros Canais
  const [isChannelFilterOpen, setIsChannelFilterOpen] = useState(false);
  const PRIMITIVE_CHANNELS = ['Agenda', 'SMS', 'E-mail', 'WhatsApp', 'Mobile Push'];
  const [activeFilters, setActiveFilters] = useState<string[]>(['Agenda', 'SMS', 'E-mail', 'WhatsApp', 'Mobile Push']);
  const [draftChannelFilters, setDraftChannelFilters] = useState<string[]>([]);

  // Paginação e Busca
  const [storeSearch, setStoreSearch] = useState("");
  const deferredStoreSearch = useDeferredValue(storeSearch);
  const [storePage, setStorePage] = useState(1);
  const [storesPerPage, setStoresPerPage] = useState(5);
  const [staticStores, setStaticStores] = useState<any[]>([]);
  const [channelSearchTerm, setChannelSearchTerm] = useState("");
  const deferredChannelSearch = useDeferredValue(channelSearchTerm);


  // Refs
  const dateRef = useRef<HTMLDivElement>(null);
  const globalFilterRef = useRef<HTMLDivElement>(null);
  const channelFilterRef = useRef<HTMLDivElement>(null);

  // --- FETCHING ---
  async function fetchData(start: string, end: string, stores: string[]) {
    setLoading(true);
    try {
      const storesQuery = stores.length > 0 ? `&stores=${stores.join(',')}` : '';
      const url = `http://localhost:3000/webhook/erp/retail-metrics?start=${start}&end=${end}${storesQuery}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      setData(json);

      const totalRevenue = json.kpis.revenue || 0;
      const storesData = Array.from({ length: 24 }).map((_, i) => {
            const share = i === 0 ? 0.4 : (Math.random() * 0.05); 
            const rev = totalRevenue * share;
            const inf = rev * (0.2 + Math.random() * 0.15); 
            return {
                id: i + 1, code: `0${10 + i}`,
                name: i === 0 ? "Primícia - Loja Matriz" : `Primícia - Filial ${['Centro', 'Shopping', 'Norte', 'Sul'][i % 4]} ${i}`,
                revenue: rev, revenueInfluenced: inf, percentInfluenced: rev > 0 ? ((inf/rev)*100).toFixed(2) : "0.00",
                transactions: Math.floor(rev / 180), repurchase: Math.floor(100 + Math.random() * 500),
                repurchasePercent: (40 + Math.random() * 20).toFixed(2), ticket: (150 + Math.random() * 50), pa: (1.8 + Math.random()).toFixed(2)
            };
      });
      setStaticStores(storesData.sort((a, b) => b.revenue - a.revenue));
    } catch (error) { console.error("Erro:", error); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchData(dateRange.start, dateRange.end, selectedStores); }, []);

  // --- CLICK OUTSIDE ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setIsDateOpen(false);
      if (globalFilterRef.current && !globalFilterRef.current.contains(event.target as Node)) setIsFilterMenuOpen(false);
      if (
        channelFilterRef.current &&
        !channelFilterRef.current.contains(event.target as Node)
      ) {
        setIsChannelFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ACTIONS GLOBAIS ---
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

  const toggleStoreSelection = (storeId: string) => {
    if (draftStores.includes(storeId)) setDraftStores(draftStores.filter(id => id !== storeId));
    else setDraftStores([...draftStores, storeId]);
  };

  const formatDateDisplay = (isoString: string) => {
    if(!isoString) return '';
    const [y, m, d] = isoString.split('-');
    return `${d}/${m}/${y}`;
  }

  // --- ACTIONS CANAIS ---
  const openChannelFilter = () => {
      setDraftChannelFilters([...activeFilters]);
      setIsChannelFilterOpen(!isChannelFilterOpen);
  };
  const toggleChannelDraft = (channel: string) => {
    setDraftChannelFilters((prev) => {
      if (prev.includes(channel)) return prev.filter((f) => f !== channel);
      return [...prev, channel];
    });
  };
  const applyChannelFilter = () => {
      setActiveFilters(draftChannelFilters);
      setIsChannelFilterOpen(false);
  };

  useEffect(() => {
    if (isChannelFilterOpen) {
      setDraftChannelFilters(activeFilters);
    }
  }, [isChannelFilterOpen, activeFilters]);
  
  const handleExportCSV = () => {
    if (!allTableData.length) return;
    const headers = "Canal;Valor;Influencia\n";
    const rows = allTableData.map((c:any) => `${c.name};${c.value};${c.percent}%`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = "canais.csv"; a.click();
  };
  
  // Paginação Lojas (Dentro do componente)
  const handleStorePageChange = (newPage: number) => { 
      if (newPage >= 1 && newPage <= totalStorePages) setStorePage(newPage); 
  };

  // --- MEMOS DE DADOS ---
  const processData = (mode: 'mensal' | 'trimestral') => {
    if (!data) return [];
    if (mode === 'mensal') {
        return data.history.map((item: any) => ({
            ...item,
            revenueOrganic: item.revenue - item.revenueInfluenced 
        }));
    }
    const groupedData: any = {};
    data.history.forEach((item: any, index: number) => {
       const quarterIndex = Math.floor(index / 3) + 1;
       const year = item.name.split(' ')[1] || '2024'; 
       const label = `Trim ${quarterIndex} ${year}`;
       if(!groupedData[label]) { groupedData[label] = { ...item, name: label, count: 0, revenue:0, revenueLastYear:0, transactions:0, revenueInfluenced:0, ticket:0, itemsPerTicket:0, repurchase:0, avgSpend:0, interval:0, frequency:0, groupNew:0, groupRecurrent:0, groupRecovered:0, revenueNew:0, revenueRecurrent:0, revenueRecovered:0, consumers:0, consumersActive:0 }; }
       groupedData[label].revenue += item.revenue || 0;
       groupedData[label].revenueLastYear += item.revenueLastYear || 0;
       groupedData[label].transactions += item.transactions || 0;
       groupedData[label].revenueInfluenced += item.revenueInfluenced || 0;
       groupedData[label].groupNew += item.groupNew || 0;
       groupedData[label].groupRecurrent += item.groupRecurrent || 0;
       groupedData[label].groupRecovered += item.groupRecovered || 0;
       groupedData[label].revenueNew += item.revenueNew || 0;
       groupedData[label].revenueRecurrent += item.revenueRecurrent || 0;
       groupedData[label].revenueRecovered += item.revenueRecovered || 0;
       groupedData[label].ticket += item.ticket || 0;
       groupedData[label].itemsPerTicket += item.itemsPerTicket || 0;
       groupedData[label].repurchase += item.repurchase || 0;
       groupedData[label].avgSpend += item.avgSpend || 0;
       groupedData[label].interval += item.interval || 0;
       groupedData[label].frequency += item.frequency || 0;
       groupedData[label].count++;
       groupedData[label].consumers = item.consumers;
       groupedData[label].consumersActive = item.consumersActive;
    });
    return Object.values(groupedData).map((g: any) => ({
        ...g,
        ticket: g.count ? Math.floor(g.ticket / g.count) : 0,
        itemsPerTicket: g.count ? Number((g.itemsPerTicket / g.count).toFixed(1)) : 0,
        repurchase: g.count ? Math.floor(g.repurchase / g.count) : 0,
        avgSpend: g.count ? Math.floor(g.avgSpend / g.count) : 0,
        interval: g.count ? Math.floor(g.interval / g.count) : 0,
        frequency: g.count ? Number((g.frequency / g.count).toFixed(2)) : 0,
        revenueOrganic: g.revenue - g.revenueInfluenced
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

  // Lógica de Canais (Smart Grid)
  const { visibleCards, othersCard, allTableData } = useMemo(() => {
    if (!data) return { visibleCards: [], othersCard: null, allTableData: [] };
    const channels = data.channels;
    
    // 1. Filtro Permissivo (Lógica "OU")
    const eligibleChannels = channels.filter((ch: any) => {
        if (ch.name === 'Outros') return true;
        const parts = ch.name.split(' + ').map(p => p.trim());
        const isVisible = parts.some((part: string) => activeFilters.includes(part));
        return isVisible;
    });

    const mainCandidates = eligibleChannels.filter((ch:any) => ch.name !== 'Outros').sort((a: any, b: any) => b.value - a.value);
    const slots = mainCandidates.slice(0, 5);
    const overflow = mainCandidates.slice(5);
    const nativeOthers = eligibleChannels.find((ch:any) => ch.name === 'Outros');
    
    let finalOthersCard = null;
    const othersItemsList = [...overflow];
    if (nativeOthers) othersItemsList.push(nativeOthers);

    if (othersItemsList.length > 0) {
        const othersValue = othersItemsList.reduce((acc: number, curr: any) => acc + curr.value, 0);
        const othersPercent = data.kpis.revenue > 0 ? ((othersValue / data.kpis.revenue) * 100).toFixed(2) : "0";
        finalOthersCard = { name: 'Outros', value: othersValue, percent: othersPercent, items: othersItemsList, isOther: true };
    }

    const renderList = [...slots];
    if (finalOthersCard) renderList.push(finalOthersCard);
    
    // Lista da Tabela
    let tableList = [...eligibleChannels].sort((a: any, b: any) => b.value - a.value);
    if (deferredChannelSearch) {
        tableList = tableList.filter(ch => ch.name.toLowerCase().includes(deferredChannelSearch.toLowerCase()));
    }

    return { visibleCards: renderList, othersCard: finalOthersCard, allTableData: tableList };
  }, [data, activeFilters, deferredChannelSearch]);

  // Lógica Paginação Lojas
  const { paginatedStores, totalStores, totalStorePages } = useMemo(() => {
    let filteredStores = staticStores;
    if (deferredStoreSearch) filteredStores = staticStores.filter(s => s.name.toLowerCase().includes(deferredStoreSearch.toLowerCase()));
    const totalStores = filteredStores.length;
    const totalStorePages = Math.ceil(totalStores / storesPerPage);
    const startIndex = (storePage - 1) * storesPerPage;
    const paginatedStores = filteredStores.slice(startIndex, startIndex + storesPerPage);
    return { paginatedStores, totalStores, totalStorePages };
  }, [staticStores, deferredStoreSearch, storePage, storesPerPage]);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400 bg-[#f8fafc]">Carregando dados...</div>;
  if (!data) return <div className="flex h-screen items-center justify-center text-slate-500 bg-[#f8fafc]">Erro ao carregar.</div>;

  // Textos e Configs
  const TEXTS = {
    impacto_canal: "Apresenta a receita gerada a partir das transações influenciadas pelos canais e suas combinações.",
    impacto_titulo: "Essa análise mostrará como as estratégias digitais da sua marca afetam a receita total.",
    receita_total: "A receita total corresponde à soma da receita de todas as transações que aconteceram no período.",
    receita_influenciada: "A receita influenciada é o resultado das ações digitais, criadas na plataforma da Dito, que impactaram a receita total no período selecionado.",
    consumidores: "O total de consumidores são pessoas que realizaram compras no período de 12 meses referente ao filtro de data selecionado.\n\nTotal de consumidores ativos são pessoas que realizaram compras nos últimos 12 meses e possuem ao menos um contato válido.",
    perfil_main: "Todas as análises consideram os últimos 12 meses a partir do período filtrado.\n\nA informação é gerada no 1º dia de cada mês.\n\nOs números do consolidado abaixo representam o mês mais recente do período filtrado.",
    grupo: "Novos: primeira compra.\n\nRecorrentes: compra anterior há menos de 12 meses.\n\nRecuperados: compra anterior há mais de 12 meses.\n\nSomente transações com receita > 0 são consideradas.",
    revenue: "A receita total corresponde à receita gerada pelo somatório de transações...",
    transactions: "O total de transações corresponde à quantidade de compras...",
    ticket: "O ticket médio corresponde ao valor médio gasto por compra...",
    repurchase: "Total de recompra corresponde às transações de clientes...",
    perfil_gasto: "Valor médio gasto por consumidor nos últimos 12 meses...",
    perfil_intervalo: "Tempo médio para um consumidor voltar a comprar...",
    perfil_freq: "Número médio de compras por consumidor nos últimos 12 meses..."
  };

  const kpiChartConfig: any = { 
      revenue: { yAxisFormat: (val: number) => `R$ ${val/1000}k`, lines: [{ key: "revenue", color: THEME.primary, name: "Receita Atual", type: "area" }, { key: "revenueLastYear", color: THEME.secondary, name: "Ano Anterior", type: "line" }] }, 
      transactions: { yAxisFormat: (val: number) => val, lines: [{ key: "transactions", color: THEME.danger, name: "Total Transações", type: "line" }] }, 
      ticket: { yAxisFormat: (val: number) => `R$ ${val}`, lines: [{ key: "ticket", color: THEME.primary, name: "Ticket Médio", type: "line" }, { key: "itemsPerTicket", color: THEME.gray, name: "PA (Peças)", type: "line", yAxisId: "right" }] }, 
      repurchase: { yAxisFormat: (val: number) => `R$ ${val}`, lines: [{ key: "repurchase", color: THEME.warning, name: "Recompra", type: "line" }] } 
  };
  const profileChartConfig: any = { avgSpend: { title: "Gasto Médio", color: THEME.primary, dataKey: "avgSpend", formatter: (val: number) => `R$ ${val}` }, interval: { title: "Intervalo (dias)", color: THEME.success, dataKey: "interval", formatter: (val: number) => `${val} dias` }, frequency: { title: "Frequência", color: THEME.primaryLight, dataKey: "frequency", formatter: (val: number) => val } };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900">
      <aside className="w-64 bg-[#111827] text-white flex flex-col shrink-0 shadow-xl z-20">
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white mr-3 shadow-lg shadow-indigo-500/30">P</div>
            <span className="font-bold text-xl tracking-tight">PRIMÍCIA</span>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <Link href="/"><NavItem icon={<Home size={20}/>} label="Visão Geral" /></Link>
          <Link href="/clients"><NavItem icon={<Users size={20}/>} label="Clientes" /></Link>
          <div className="pt-2 pb-2"><p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Relatórios</p><NavItem icon={<BarChart2 size={20}/>} label="Analytics" active />
            <div className="pl-12 pr-2 space-y-1 mt-1 border-l-2 border-gray-800 ml-5">
                <div className="px-3 py-2 text-indigo-400 text-sm font-medium cursor-default">Varejo</div>
                <Link href="/results/channels"><div className="px-3 py-2 text-gray-400 hover:text-white text-sm cursor-pointer transition-colors">Canais</div></Link>
            </div>
          </div>
          <div className="pt-6 pb-2"><p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Marketing</p><Link href="/campaigns"><NavItem icon={<MessageCircle size={20}/>} label="Campanhas" /></Link><NavItem icon={<Calendar size={20}/>} label="Agenda" /><NavItem icon={<Target size={20}/>} label="Metas" /></div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-10 shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Resultados Varejo</h1>
            <p className="text-xs text-slate-500 mt-0.5">Acompanhe a performance geral da sua marca</p>
          </div>
          <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer transition shadow-sm"><Bell className="text-gray-500" size={20} /></div><div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">DA</div></div>
        </header>

        <div className="flex-1 p-10 overflow-auto space-y-12 scroll-smooth">
          {/* Filtros Gerais */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center pl-4 pr-2 relative z-50">
            <div className="flex items-center gap-4">
                <div onClick={() => setIsDateOpen(!isDateOpen)} className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 font-medium cursor-pointer hover:bg-slate-100 transition relative" ref={dateRef}>
                    <Calendar size={16} className="text-indigo-500"/> <span>{formatDateDisplay(dateRange.start)}</span> <span className="text-gray-300">|</span> <span>{formatDateDisplay(dateRange.end)}</span>
                    {isDateOpen && (<div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-72 z-50" onClick={(e) => e.stopPropagation()}><p className="text-xs font-bold text-gray-400 uppercase mb-3">Período</p><div className="space-y-3"><div><label className="block text-xs text-gray-500 mb-1">Início</label><input type="date" value={draftDate.start} onChange={(e) => setDraftDate({...draftDate, start: e.target.value})} className="w-full border rounded p-2 text-sm text-gray-600 outline-none focus:border-indigo-500" /></div><div><label className="block text-xs text-gray-500 mb-1">Fim</label><input type="date" value={draftDate.end} onChange={(e) => setDraftDate({...draftDate, end: e.target.value})} className="w-full border rounded p-2 text-sm text-gray-600 outline-none focus:border-indigo-500" /></div></div><div className="border-t mt-4 pt-3 flex justify-end gap-2"><button className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2" onClick={() => setIsDateOpen(false)}>Cancelar</button><button className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg" onClick={handleApplyGlobalFilters}>Aplicar</button></div></div>)}
                </div>
                <div className="relative" ref={globalFilterRef}>
                    <div onClick={() => { setDraftStores([...selectedStores]); setIsFilterMenuOpen(!isFilterMenuOpen); }} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors select-none">Filtros e visualizações {selectedStores.length > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{selectedStores.length}</span>} <ChevronDown size={14}/></div>
                    {isFilterMenuOpen && (<div className="absolute top-full left-0 mt-4 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50"><p className="text-xs font-bold text-gray-400 uppercase mb-2">Filtrar Lojas</p><div className="max-h-60 overflow-y-auto space-y-1 border-b border-gray-100 pb-3 mb-3 custom-scrollbar">{FAKE_STORES.map(store => (<label key={store.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${draftStores.includes(store.id) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`} onClick={(e) => { e.preventDefault(); toggleStoreSelection(store.id); }}>{draftStores.includes(store.id) && <Check size={14} className="text-white" />}</div><span className="text-sm text-gray-700 truncate">{store.name}</span></label>))}</div><div className="flex justify-end gap-2"><button className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg" onClick={handleApplyGlobalFilters}>Aplicar</button></div></div>)}
                </div>
            </div>
            <div className="flex gap-2"><button onClick={handleClearFilters} className="text-sm text-emerald-600 hover:bg-emerald-50 px-4 py-1.5 rounded-xl font-medium transition-colors">Limpar filtros</button><button onClick={handleApplyGlobalFilters} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">Aplicar</button></div>
          </div>

          {/* 1. Consolidados */}
          <section>
            <SectionTitle title="Consolidados da marca" tooltip={TEXTS.revenue} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <SelectableCard label="Receita" value={data.kpis.revenue} percent={11.69} active={selectedMetric === 'revenue'} onClick={() => setSelectedMetric('revenue')} icon={<DollarSign size={20}/>} />
                <SelectableCard label="Transações" value={data.kpis.transactions} percent={-0.93} isRed active={selectedMetric === 'transactions'} onClick={() => setSelectedMetric('transactions')} icon={<ShoppingBag size={20}/>} />
                <SelectableCard label="Ticket Médio" value={data.kpis.ticketAverage} percent={12.74} active={selectedMetric === 'ticket'} onClick={() => setSelectedMetric('ticket')} icon={<TrendingUp size={20}/>} />
                <SelectableCard label="Recompras" value={data.kpis.repurchaseRate} percent={54.01} isPercent active={selectedMetric === 'repurchase'} onClick={() => setSelectedMetric('repurchase')} icon={<RefreshCw size={20}/>} />
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden"><div className="absolute top-8 right-8 z-10 bg-slate-50 p-1 rounded-lg border border-slate-200 flex">{['mensal', 'trimestral'].map((m:any) => (<button key={m} onClick={() => setViewMode(m)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{m === 'mensal' ? 'Mensal' : 'Trimestral'}</button>))}</div><div className="h-96 w-full mt-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={mainGraphData} margin={{ top: 20, right: 0, left: -10, bottom: 0 }}><defs><linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.primary} stopOpacity={0.1}/><stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} /><YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} tickFormatter={kpiChartConfig[selectedMetric].yAxisFormat}/>{selectedMetric === 'ticket' && <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />}<Tooltip content={<CustomTooltip />} cursor={{stroke: '#e2e8f0', strokeWidth: 1}} /><Legend verticalAlign="top" height={36} iconType="circle" align="left" />{kpiChartConfig[selectedMetric].lines.map((line: any, idx: number) => { if (line.type === 'area' || (selectedMetric === 'revenue' && line.key === 'revenue')) { return <Area key={idx} type="monotone" yAxisId={line.yAxisId || 0} dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={3} fill="url(#colorMetric)" activeDot={{r:6, strokeWidth: 0}} /> } return <Line key={idx} type="monotone" yAxisId={line.yAxisId || 0} dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={line.width} dot={false} activeDot={{r:6}} /> })}</LineChart></ResponsiveContainer></div></div>
          </section>

          {/* 2. BASE & 3. PERFIL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section><SectionTitle title="Base de consumidores" tooltip={TEXTS.consumidores} /><div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 h-[420px]"><div className="h-full pb-4 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={mainGraphData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} interval="preserveStartEnd" /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} /><Tooltip content={<CustomTooltip type="number" />} /><Legend verticalAlign="top" iconType="circle" /><Line type="monotone" dataKey="consumers" name="Total" stroke={THEME.textSub} strokeWidth={2} dot={false} /><Line type="monotone" dataKey="consumersActive" name="Ativos" stroke={THEME.success} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></div></section>
            <section><SectionTitle title="Perfil de consumidores" tooltip={TEXTS.perfil_main} /><div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 h-[420px] flex flex-col"><div className="flex gap-2 mb-6 overflow-x-auto pb-2"><MiniFilterButton label="Gasto Médio" active={selectedProfile === 'avgSpend'} onClick={() => setSelectedProfile('avgSpend')} /><MiniFilterButton label="Intervalo" active={selectedProfile === 'interval'} onClick={() => setSelectedProfile('interval')} /><MiniFilterButton label="Frequência" active={selectedProfile === 'frequency'} onClick={() => setSelectedProfile('frequency')} /></div><div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={mainGraphData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} interval="preserveStartEnd" /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} tickFormatter={profileChartConfig[selectedProfile].formatter} /><Tooltip content={<CustomTooltip type={selectedProfile === 'avgSpend' ? 'currency' : 'number'} />} /><Line type="monotone" dataKey={profileChartConfig[selectedProfile].dataKey} stroke={profileChartConfig[selectedProfile].color} strokeWidth={3} dot={false} name={profileChartConfig[selectedProfile].title} /></LineChart></ResponsiveContainer></div></div></section>
          </div>

          {/* 4. GRUPO */}
          <section><SectionTitle title="Grupo de consumidores" tooltip={TEXTS.grupo} /><div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 h-96 relative"><div className="absolute top-8 right-8 z-10 flex gap-2 bg-slate-50 p-1 rounded-lg"><button onClick={() => setGroupMode('people')} className={`px-3 py-1 text-xs font-bold rounded transition ${groupMode === 'people' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>Pessoas</button><button onClick={() => setGroupMode('revenue')} className={`px-3 py-1 text-xs font-bold rounded transition ${groupMode === 'revenue' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>Receita</button></div><ResponsiveContainer width="100%" height="100%"><BarChart data={mainGraphData} barSize={32}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(val) => groupMode === 'revenue' ? `R$ ${val/1000}k` : val} /><Tooltip content={<CustomTooltip type={groupMode === 'revenue' ? 'currency' : 'number'} />} cursor={{fill: '#f8fafc'}} /><Legend iconType="circle" align="left" verticalAlign="top" height={36} /><Bar dataKey={groupMode === 'people' ? 'groupRecurrent' : 'revenueRecurrent'} name="Recorrentes" stackId="a" fill={THEME.primary} radius={[0,0,0,0]} /><Bar dataKey={groupMode === 'people' ? 'groupNew' : 'revenueNew'} name="Novos" stackId="a" fill={THEME.success} radius={[0,0,0,0]} /><Bar dataKey={groupMode === 'people' ? 'groupRecovered' : 'revenueRecovered'} name="Recuperados" stackId="a" fill={THEME.gray} radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></section>

          {/* 5. IMPACTO DIGITAL */}
          <section>
            <div className="flex justify-between items-center mb-6 mt-8"><SectionTitle title="Impacto das ações digitais" tooltip={TEXTS.impacto_titulo} /><div className="bg-slate-50 p-1 rounded-lg border border-slate-200 flex"><button onClick={() => setImpactViewMode('mensal')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${impactViewMode === 'mensal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Mensal</button><button onClick={() => setImpactViewMode('trimestral')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${impactViewMode === 'trimestral' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Trimestral</button></div></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col items-center justify-center relative overflow-hidden"><div className="absolute top-0 right-0 p-6 opacity-10"><Activity size={100} className="text-indigo-200"/></div><div className="relative w-64 h-64 z-10"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{value: Number(donutTotals.percent)}, {value: 100 - Number(donutTotals.percent)}]} innerRadius={80} outerRadius={95} startAngle={90} endAngle={-270} dataKey="value" stroke="none" cornerRadius={10} paddingAngle={5}><Cell fill={THEME.success} /> <Cell fill="#f1f5f9" /></Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Influência</span><span className="text-4xl font-black text-slate-800 tracking-tight">{donutTotals.percent}%</span></div></div><div className="w-full mt-6 space-y-3"><div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-slate-300"/><span className="text-sm font-bold text-slate-600">Receita Total</span></div><span className="font-mono font-bold text-slate-700">R$ {(donutTotals.total/1000000).toFixed(1)}mi</span></div><div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100"><div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500"/><span className="text-sm font-bold text-emerald-800">Influenciada</span></div><span className="font-mono font-bold text-emerald-700">R$ {(donutTotals.influenced/1000000).toFixed(1)}mi</span></div></div></div>
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 h-[450px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={impactGraphData} barSize={18}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} tickFormatter={(val) => `R$ ${(val/1000000).toFixed(1)} mi`} /><Tooltip content={<CustomTooltip type="currency" />} cursor={{fill: '#f8fafc'}} /><Legend verticalAlign="top" align="right" iconType="circle" height={36} /><Bar dataKey="revenueInfluenced" name="Receita influenciada" stackId="a" fill={THEME.success} radius={[0,0,4,4]} /><Bar dataKey="revenueOrganic" name="Receita orgânica" stackId="a" fill={THEME.primary} radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
            </div>
          </section>

          {/* 6. IMPACTO POR CANAL (SMART GRID) */}
          <section>
             <div className="flex justify-between items-center mt-8 mb-6 relative z-20">
                <SectionTitle title="Impacto por canal" tooltip={TEXTS.impacto_canal} />
                <div className="relative" ref={channelFilterRef} onMouseDown={(e) => e.stopPropagation()}>
                    <button onClick={openChannelFilter} onMouseDown={(e) => e.stopPropagation()} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"><Filter size={16}/> Filtrar Canais <ChevronDown size={16}/></button>
                    {isChannelFilterOpen && (<div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-4" onMouseDown={(e) => e.stopPropagation()}><p className="text-xs font-bold text-slate-400 uppercase mb-3">Exibir Canais</p><div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">{PRIMITIVE_CHANNELS.map(ch => (
                      <div
                        key={ch}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleChannelDraft(ch);
                        }}
                      ><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${draftChannelFilters.includes(ch) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>{draftChannelFilters.includes(ch) && <Check size={14} className="text-white" />}</div><span className="text-sm text-slate-700 font-medium">{ch}</span></div>))}</div><div className="border-t mt-3 pt-3 flex justify-end gap-2"><button className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2" onClick={() => setIsChannelFilterOpen(false)}>Cancelar</button><button className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg w-full transition-colors" onClick={applyChannelFilter}>Aplicar</button></div></div>)}
                </div>
            </div>
            <div className={`grid gap-6 mb-8 ${getGridClass(visibleCards.length)}`}>
                {visibleCards.map((card: any, idx: number) => (
                    <div key={idx} className={getSlotClass(idx, visibleCards.length)}>
                        <ModernChannelCard data={card} isBig={idx === 0 && visibleCards.length >= 3} />
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-100/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar na tabela..." value={channelSearchTerm} onChange={(e) => setChannelSearchTerm(e.target.value)} className="pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-80 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all" /></div><button onClick={handleExportCSV} className="text-indigo-600 text-sm bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-100 font-bold transition-colors"><Download size={18}/> Exportar CSV</button></div>
                <table className="w-full text-sm text-left text-slate-600"><thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="px-6 py-4">Canal</th><th className="px-6 py-4">Valor</th><th className="px-6 py-4 text-right">% Infl.</th></tr></thead><tbody className="divide-y divide-slate-100">{allTableData.map((ch:any, idx:number) => (<tr key={idx} className="hover:bg-indigo-50/30 transition-colors"><td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3"><div className="p-1.5 rounded bg-slate-100 text-slate-500">{CHANNEL_ICONS[ch.name] || <Target size={16}/>}</div> {ch.name}</td><td className="px-6 py-4 font-mono text-slate-600">R$ {ch.value.toLocaleString('pt-BR')}</td><td className="px-6 py-4 text-right"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">{ch.percent}%</span></td></tr>))}</tbody></table>
            </div>
          </section>

          {/* 7. LISTA DE LOJAS */}
          <section>
            <SectionTitle title="Lista de lojas" />
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-100/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 relative"><Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" value={storeSearch} onChange={(e) => {setStoreSearch(e.target.value); setStorePage(1)}} placeholder="Buscar por loja..." className="pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all" /></div>
                <table className="w-full text-sm text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="px-6 py-4">Nome da Loja</th><th className="px-6 py-4">Receita</th><th className="px-6 py-4">Influência</th><th className="px-6 py-4">Transações</th><th className="px-6 py-4">Ticket Médio</th></tr></thead><tbody className="divide-y divide-slate-100">{paginatedStores.map((store: any) => (<tr key={store.id} className="hover:bg-indigo-50/30 transition-colors group"><td className="px-6 py-4"><div className="font-bold text-slate-800">{store.name}</div><div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {store.code}</div></td><td className="px-6 py-4 font-mono text-slate-600">R$ {store.revenue.toLocaleString('pt-BR', {maximumFractionDigits:0})}</td><td className="px-6 py-4"><div className="flex items-center gap-2"><span className="font-mono text-slate-600">R$ {store.revenueInfluenced.toLocaleString('pt-BR', {maximumFractionDigits:0})}</span><span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full">{store.percentInfluenced}%</span></div></td><td className="px-6 py-4 text-slate-500">{store.transactions}</td><td className="px-6 py-4 font-mono text-slate-500">R$ {store.ticket.toFixed(2)}</td></tr>))}</tbody></table>
                <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50"><div className="flex items-center gap-2"><span>Lojas por página:</span><select value={storesPerPage} onChange={(e) => { setStoresPerPage(Number(e.target.value)); setStorePage(1); }} className="border rounded p-1 bg-white outline-none cursor-pointer hover:border-indigo-300"><option value="5">5</option><option value="10">10</option></select></div><div className="flex items-center gap-4"><span>{(storePage-1)*storesPerPage+1}-{Math.min(storePage*storesPerPage, totalStores)} de {totalStores}</span><div className="flex gap-1"><button disabled={storePage===1} onClick={()=>handleStorePageChange(storePage-1)} className="p-1.5 rounded bg-white border hover:bg-slate-100 disabled:opacity-50"><ChevronLeft size={14}/></button><span className="px-2 py-1.5 font-bold bg-indigo-600 text-white rounded">{storePage}</span><button disabled={storePage===totalStorePages} onClick={()=>handleStorePageChange(storePage+1)} className="p-1.5 rounded bg-white border hover:bg-slate-100 disabled:opacity-50"><ChevronRight size={14}/></button></div></div></div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

// --- COMPONENTES AUXILIARES (AGORA COM FUNÇÕES DE GRID MOVIDAS PARA CÁ) ---

function getGridClass(count: number) {
    if (count <= 2) return "grid-cols-1 lg:grid-cols-2 h-[300px]";
    if (count === 3) return "grid-cols-1 lg:grid-cols-3 h-[300px]";
    if (count === 4) return "grid-cols-2 lg:grid-cols-2 h-[400px]"; 
    return "grid-cols-1 lg:grid-cols-3 h-[450px]"; 
}

function getSlotClass(index: number, total: number) {
     if (total > 4 && index === 0) return "lg:col-span-2 lg:row-span-2 h-full";
     return "col-span-1 h-full";
}

function SelectableCard({ label, value, percent, isRed, isPercent, active, onClick, icon, tooltipText }: any) { let formattedValue = value; if (typeof value === 'number') { if (isPercent) formattedValue = `${value}%`; else formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); } return <div onClick={onClick} className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 bg-white group relative overflow-hidden ${active ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}>{tooltipText && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg hidden group-hover:block z-50 shadow-xl text-center transition-opacity">{tooltipText}<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div></div>}<div className="flex justify-between items-start mb-3 relative z-10"><div className="flex items-center gap-3 text-slate-500"><div className={`p-2 rounded-lg transition-colors ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50'}`}>{icon}</div><span className="text-xs uppercase font-bold tracking-wider">{label}</span></div><span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${isRed ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{percent > 0 ? <ArrowUp size={12} className="mr-1"/> : ''} {Math.abs(percent)}%</span></div><span className="text-2xl font-black text-slate-800 tracking-tight relative z-10">{formattedValue}</span>{active && <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tl from-indigo-50 to-transparent rounded-tl-full opacity-50" />}</div> }
function ModernChannelCard({ data, isBig, small }: any) { if (!data) return null; return <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ease-out group border border-slate-100 bg-white w-full h-full flex flex-col justify-center items-center p-1 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200`}><div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-white rounded-full -mr-10 -mt-10 opacity-30 transition-transform group-hover:scale-150" /><div className="z-10 flex flex-col items-center justify-center h-full w-full"><div className={`p-4 rounded-2xl mb-3 text-indigo-600 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner ${isBig ? 'scale-125' : ''}`}>{CHANNEL_ICONS[data.name] || <Target size={24}/>}</div><h3 className="text-slate-500 font-bold uppercase tracking-wider text-[10px] group-hover:text-indigo-900 text-center transition-colors">{data.name}</h3></div><div className="absolute inset-x-0 bottom-0 h-full flex flex-col justify-center items-center bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-20">{data.isOther ? (<div className="w-full h-full p-4 overflow-auto custom-scrollbar"><p className="text-center text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100 pb-2 mb-2">OUTROS CANAIS</p>{data.items.map((item: any, idx: number) => (<div key={idx} className="flex justify-between items-center text-[10px] border-b border-slate-50 py-1.5"><span className="truncate w-20 text-slate-600 font-medium">{item.name}</span><span className="font-bold text-indigo-600">{item.percent}%</span></div>))}</div>) : (<div className="text-center"><p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Receita Gerada</p><h4 className={`${isBig ? 'text-3xl' : 'text-lg'} font-black text-slate-800 mb-3`}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(data.value)}</h4><div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mx-auto shadow-sm"><span className="text-[10px] font-bold text-indigo-400 uppercase">INF</span><span className="text-xs font-bold text-indigo-700">{data.percent}%</span></div></div>)}</div></div> }
function EmptySlot() { return <div className="h-full w-full bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs font-medium uppercase tracking-wider">Vazio</div> }
function SectionTitle({title, tooltip}: {title: string, tooltip?: string}) { return <div className="flex items-center gap-2 mt-2 mb-4 group relative w-fit"><h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>{tooltip && <><span className="text-slate-400 text-[10px] border border-slate-200 rounded-full w-4 h-4 flex items-center justify-center cursor-help hover:bg-slate-100 hover:text-slate-600 transition-colors">?</span><div className="absolute bottom-full left-0 mb-2 w-80 bg-slate-800 text-white text-sm p-4 rounded-xl shadow-xl hidden group-hover:block z-50 whitespace-pre-line leading-relaxed text-left shadow-slate-900/20">{tooltip}<div className="absolute top-full left-4 border-8 border-transparent border-t-slate-800"></div></div></>}</div> }
const CustomTooltip = ({ active, payload, label, type }: any) => { if (active && payload && payload.length) { return (<div className="bg-slate-900/95 backdrop-blur text-white p-4 shadow-2xl rounded-xl text-sm z-50 border border-slate-800"><p className="font-bold text-slate-300 mb-2 text-xs uppercase tracking-wider">{label}</p>{payload.map((entry: any, index: number) => { let displayValue = entry.value; const isCurrency = type === 'currency' || (type !== 'number' && typeof entry.value === 'number' && entry.value > 100 && !entry.name.includes('Frequência') && !entry.name.includes('Peças') && !entry.name.includes('Transações') && !entry.name.includes('Consumidores')); if (typeof entry.value === 'number') displayValue = isCurrency ? `R$ ${entry.value.toLocaleString('pt-BR')}` : entry.value.toLocaleString('pt-BR'); return <div key={index} className="flex items-center gap-3 mb-1.5 last:mb-0"><div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: entry.color }}></div><span className="text-slate-300">{entry.name}:</span><span className="font-bold text-white ml-auto">{displayValue}</span></div> })}</div>); } return null; };
function MiniFilterButton({ label, active, onClick }: any) { return <button onClick={onClick} className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{label}</button> }
function NavItem({ icon, label, active }: any) { return <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-gray-800 hover:text-white'}`}>{icon}<span className="text-sm font-medium">{label}</span></div> }