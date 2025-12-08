"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Calendar, Filter, 
  ChevronDown, Mail, MousePointer, Eye, 
  AlertCircle, PieChart as PieIcon, FileText, Check, Download,
  ArrowUpRight, ArrowDownRight, Search, XCircle, Info
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- TEMA VISUAL ---
const COLORS = {
  primary: "#6366f1",   
  secondary: "#0f172a", 
  accent: "#f59e0b",    
  success: "#10b981",   
  danger: "#ef4444",    
  neutral: "#94a3b8",   
  grid: "#e2e8f0",
  softBounce: "#f59e0b", 
  hardBounce: "#dc2626", 
  spam: "#db2777",       
  unsubscribe: "#7c3aed",
  clicks: "#f97316",     
  ctr: "#10b981",        
  ctor: "#8b5cf6"        
};

const TOOLTIPS = {
  receitaTotal: "Soma total gerada por todas as transações no período.",
  receitaInfluenciada: "Fatia da receita atribuída diretamente às campanhas.",
  conversoes: "Total de vendas realizadas após interação.", 
  vendasInfluenciadas: "Quantidade de pedidos influenciados.",
  baseInfluenciada: "Clientes únicos que compraram.",
  ticket: "Valor médio gasto por venda influenciada.",
  envios: "Total de mensagens enviadas.",
  entregues: "Mensagens confirmadas pelo servidor.",
  aberturas: "Total de aberturas únicas.",
  cliques: "Gráfico detalhado: Volume de Cliques (Eixo esquerdo) comparado com CTR e CTOR (Eixo direito).",
  bounces: "Gráfico detalhado: Soft Bounce (Erro Temporário) e Hard Bounce (Erro Permanente).",
  rejeicoes: "Gráfico detalhado: Marcações de Spam vs Solicitações de Descadastro."
};

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
            currentWeek = {
                startLabel: day.name, name: day.name, 
                envios: 0, entregues: 0, aberturas: 0, cliques: 0, softBounces: 0, hardBounces: 0, bounces: 0, spam: 0, descadastro: 0, rejeicoes: 0, receitaTotal: 0, receitaInfluenciada: 0, conversoes: 0, vendasInfluenciadas: 0, baseInfluenciada: 0
            };
        }
        currentWeek.envios += day.envios;
        currentWeek.entregues += day.entregues;
        currentWeek.aberturas += day.aberturas;
        currentWeek.cliques += day.cliques;
        currentWeek.softBounces += day.softBounces;
        currentWeek.hardBounces += day.hardBounces;
        currentWeek.bounces += day.bounces;
        currentWeek.spam += day.spam;
        currentWeek.descadastro += day.descadastro;
        currentWeek.rejeicoes += day.rejeicoes;
        currentWeek.receitaTotal += day.receitaTotal;
        currentWeek.receitaInfluenciada += day.receitaInfluenciada;
        currentWeek.conversoes += day.conversoes;
        currentWeek.vendasInfluenciadas += day.vendasInfluenciadas;
        currentWeek.baseInfluenciada += day.baseInfluenciada;
    });

    if (currentWeek) {
        currentWeek.ctr = currentWeek.entregues > 0 ? Number(((currentWeek.cliques / currentWeek.entregues) * 100).toFixed(2)) : 0;
        currentWeek.ctor = currentWeek.aberturas > 0 ? Number(((currentWeek.cliques / currentWeek.aberturas) * 100).toFixed(2)) : 0;
        currentWeek.ticket = currentWeek.conversoes > 0 ? Number((currentWeek.receitaInfluenciada / currentWeek.conversoes).toFixed(2)) : 0;
        if(!currentWeek.name.includes('-')) currentWeek.name = `${currentWeek.startLabel} - Fim`;
        weeks.push(currentWeek);
    }
    return weeks;
};

export default function ChannelResultsPage() {
  
  // --- DATA DINÂMICA ---
  const getToday = () => new Date().toISOString().split('T')[0];
  const getStartOfMonth = () => {
    const d = new Date();
    d.setDate(1); 
    return d.toISOString().split('T')[0];
  };

  const [dateRange, setDateRange] = useState({ start: getStartOfMonth(), end: getToday() });
  const [draftDate, setDraftDate] = useState({ start: getStartOfMonth(), end: getToday() });
  const [isDateOpen, setIsDateOpen] = useState(false);
  
  const [tableSearch, setTableSearch] = useState("");
  const [groupBy, setGroupBy] = useState("Campanhas");

  const [filters, setFilters] = useState({
    channel: 'Todos',
    conversionEvent: 'Abertura',
    conversionWindow: '7 dias',
    tags: [] as string[],
    campaigns: [] as string[],
    campaignType: 'Todos'
  });

  // Estados de Visualização
  const [engagementMetric, setEngagementMetric] = useState('aberturas');
  const [engagementView, setEngagementView] = useState<'diario' | 'semanal'>('diario');
  const [revenueMetric, setRevenueMetric] = useState('receitaInfluenciada');
  const [revenueView, setRevenueView] = useState<'diario' | 'semanal'>('diario');
  const [showComparison, setShowComparison] = useState(false);

  // --- DADOS REAIS ---
  const [fullDailyData, setFullDailyData] = useState<any[]>([]);
  const [campaignsList, setCampaignsList] = useState<any[]>([]); 
  const [storesList, setStoresList] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);

  // --- PAGINAÇÃO (ESTADOS NOVOS) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const dateRef = useRef<HTMLDivElement>(null);

  // UseMemo dos Gráficos
  const currentEngagementData = useMemo(() => {
      if (engagementView === 'semanal') return groupDataByWeek(fullDailyData);
      return fullDailyData;
  }, [engagementView, fullDailyData]);

  const currentRevenueData = useMemo(() => {
      if (revenueView === 'semanal') return groupDataByWeek(fullDailyData);
      return fullDailyData;
  }, [revenueView, fullDailyData]);

  // --- FILTROS TABELAS ---
  const filteredCampaigns = useMemo(() => {
    const term = tableSearch.toLowerCase();
    let campaigns = campaignsList.filter(c => {
      if (filters.channel !== 'Todos' && c.channel !== filters.channel) return false;
      return true;
    });
    if (term) {
      campaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.id.toLowerCase().includes(term) || 
        (c.segmentId && c.segmentId.toLowerCase().includes(term))
      );
    }
    return campaigns;
  }, [tableSearch, filters, campaignsList]); 

  const filteredStores = useMemo(() => {
    const term = tableSearch.toLowerCase();
    return storesList.filter((s: any) => 
      s.name.toLowerCase().includes(term) || 
      s.id.toLowerCase().includes(term)
    );
  }, [tableSearch, storesList]);

  // --- LÓGICA DE PAGINAÇÃO ---
  // Reseta para página 1 se mudar filtros, busca ou agrupamento
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, groupBy, filters, dateRange]);

  // Determina qual lista está ativa
  const currentTableData = groupBy === 'Lojas' ? filteredStores : filteredCampaigns;
  
  // Calcula paginação
  const totalItems = currentTableData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  // ITENS QUE SERÃO EXIBIDOS NA TABELA
  const currentItems = currentTableData.slice(startIndex, endIndex);

  // --- BUSCAR DADOS ---
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const url = `http://localhost:3000/sales/channel-results?start=${dateRange.start}&end=${dateRange.end}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data) {
                if (data.chart) setFullDailyData(data.chart);
                
                if (data.campaignsList) {
                    const formattedCampaigns = data.campaignsList.map((c: any) => ({
                        ...c,
                        deliveredRate: c.sent > 0 ? ((c.delivered / c.sent) * 100).toFixed(1) : 0,
                        openRate: c.delivered > 0 ? ((c.opens / c.delivered) * 100).toFixed(1) : 0,
                        ctr: c.delivered > 0 ? ((c.clicks / c.delivered) * 100).toFixed(1) : 0,
                        ctor: c.opens > 0 ? ((c.clicks / c.opens) * 100).toFixed(1) : 0,
                        bounceRate: c.sent > 0 ? (((c.softBounces + c.hardBounces) / c.sent) * 100).toFixed(1) : 0,
                        rejectionRate: c.sent > 0 ? (((c.spamReports + c.unsubscribes) / c.sent) * 100).toFixed(2) : 0,
                        bounces: c.softBounces + c.hardBounces,
                        rejections: c.spamReports + c.unsubscribes,
                        revenueInfluenced: 0, conversions: 0, ticketAverage: 0
                    }));
                    setCampaignsList(formattedCampaigns);
                }

                if (data.storesList) setStoresList(data.storesList);
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [dateRange]);

  // Utils
  const handleExportCSV = () => { /* ... Lógica de exportação ... */ };
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setIsDateOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplyDate = () => { setDateRange(draftDate); setIsDateOpen(false); };
  const formatDateDisplay = (iso: string) => { if(!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; }
  const formatAxis = (val: number, type: 'currency' | 'number') => {
    if (val < 1000) return type === 'currency' ? `R$ ${val}` : val.toString();
    const inMil = val / 1000;
    const formatted = inMil % 1 === 0 ? inMil.toFixed(0) : inMil.toFixed(1);
    return type === 'currency' ? `R$ ${formatted}mil` : `${formatted}mil`;
  };
  const isRevenueMetricCurrency = useMemo(() => ['receitaTotal', 'receitaInfluenciada', 'ticket'].includes(revenueMetric), [revenueMetric]);

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900">
      <Sidebar activePage="channels" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <div><h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-md"><PieIcon size={18}/></span>Resultados de Canais</h1></div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block"><p className="text-xs font-bold text-slate-700">Admin User</p><p className="text-[10px] text-slate-400">Diretor Comercial</p></div>
             <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">AD</div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-8">
            <div className="flex border-b border-slate-200">
                {['Lista de campanhas', 'Resultados de Canais', 'Tempo real'].map((tab) => {
                    const key = tab.toLowerCase().replace(/ /g, '');
                    const isActive = key === 'resultadosdecanais'; 
                    return <button key={key} className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${isActive ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{tab}</button>
                })}
            </div>

            {/* FILTROS */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <div className="relative" ref={dateRef}>
                        <div onClick={() => setIsDateOpen(!isDateOpen)} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 cursor-pointer hover:border-violet-400 transition w-fit">
                            <Calendar size={16} className="text-slate-400"/>
                            <span className="font-medium">{formatDateDisplay(dateRange.start)}</span> <span className="text-slate-400">até</span> <span className="font-medium">{formatDateDisplay(dateRange.end)}</span>
                            <ChevronDown size={14} className="ml-2 opacity-50"/>
                        </div>
                        {isDateOpen && (
                            <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 w-72 z-50" onClick={(e) => e.stopPropagation()}>
                                <div className="space-y-3">
                                    <div><label className="block text-xs text-slate-500 mb-1">De:</label><input type="date" value={draftDate.start} onChange={(e) => setDraftDate({...draftDate, start: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-violet-500" /></div>
                                    <div><label className="block text-xs text-slate-500 mb-1">Até:</label><input type="date" value={draftDate.end} onChange={(e) => setDraftDate({...draftDate, end: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-violet-500" /></div>
                                </div>
                                <div className="border-t mt-4 pt-3 flex justify-end gap-2">
                                    <button className="text-xs font-medium text-slate-500" onClick={() => setIsDateOpen(false)}>Cancelar</button>
                                    <button className="text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded" onClick={handleApplyDate}>Aplicar</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition">Limpar Filtros</button>
                        <button className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition">Aplicar</button>
                    </div>
                </div>
                {/* SELECTS ADICIONAIS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Canal</label><select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-violet-500"><option>Todos os canais</option></select></div>
                     <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Evento</label><select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-violet-500"><option>Abertura</option></select></div>
                     <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Janela</label><select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-violet-500"><option>7 dias</option></select></div>
                     <div><label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Tags</label><select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-violet-500"><option>Selecione tags...</option></select></div>
                </div>
            </div>

            {/* SEÇÃO 1: ENGAJAMENTO */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><span className="w-1 h-5 bg-violet-500 rounded-full"></span>Consolidado de Engajamento</h2>
                    <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                        <button onClick={() => setEngagementView('diario')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${engagementView === 'diario' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}>Diário</button>
                        <button onClick={() => setEngagementView('semanal')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${engagementView === 'semanal' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}>Semanal</button>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-6 border-b border-slate-100 rounded-t-xl">
                        <MetricTab label="Envios" value={fullDailyData.reduce((acc, i) => acc + i.envios, 0).toLocaleString()} icon={<Mail size={14}/>} active={engagementMetric === 'envios'} onClick={() => setEngagementMetric('envios')} description={TOOLTIPS.envios} />
                        <MetricTab label="Entregues" value={fullDailyData.reduce((acc, i) => acc + i.entregues, 0).toLocaleString()} sub="98%" icon={<Check size={14}/>} active={engagementMetric === 'entregues'} onClick={() => setEngagementMetric('entregues')} description={TOOLTIPS.entregues} />
                        <MetricTab label="Aberturas" value={fullDailyData.reduce((acc, i) => acc + i.aberturas, 0).toLocaleString()} sub="8.7%" icon={<Eye size={14}/>} active={engagementMetric === 'aberturas'} onClick={() => setEngagementMetric('aberturas')} color="text-violet-600" description={TOOLTIPS.aberturas} />
                        <MetricTab label="Cliques" value={fullDailyData.reduce((acc, i) => acc + i.cliques, 0).toLocaleString()} sub="2.18%" icon={<MousePointer size={14}/>} active={engagementMetric === 'cliques'} onClick={() => setEngagementMetric('cliques')} description={TOOLTIPS.cliques} />
                        <MetricTab label="Bounces" value={fullDailyData.reduce((acc, i) => acc + i.bounces, 0).toLocaleString()} sub="1.23%" icon={<XCircle size={14}/>} active={engagementMetric === 'bounces'} onClick={() => setEngagementMetric('bounces')} isDanger description={TOOLTIPS.bounces} />
                        <MetricTab label="Rejeições" value={fullDailyData.reduce((acc, i) => acc + i.rejeicoes, 0).toLocaleString()} sub="0.04%" icon={<AlertCircle size={14}/>} active={engagementMetric === 'rejeicoes'} onClick={() => setEngagementMetric('rejeicoes')} isDanger description={TOOLTIPS.rejeicoes} />
                    </div>
                    <div className="p-6 h-72 relative">
                        {loading && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center text-sm font-bold text-slate-500">Carregando dados...</div>}
                        
                        <div className="absolute top-4 right-6 z-10 bg-white/90 p-1.5 rounded backdrop-blur-sm flex gap-4 text-xs font-bold border border-slate-100 shadow-sm">
                             {engagementMetric === 'bounces' && (<><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS.softBounce}}></div><span className="text-slate-600">Soft Bounce</span></div><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS.hardBounce}}></div><span className="text-slate-600">Hard Bounce</span></div></>)}
                             {engagementMetric === 'rejeicoes' && (<><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS.spam}}></div><span className="text-slate-600">Spam</span></div><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS.unsubscribe}}></div><span className="text-slate-600">Descadastro</span></div></>)}
                             {engagementMetric === 'cliques' && (<><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS.clicks}}></div><span className="text-slate-600">Cliques</span></div><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS.ctr}}></div><span className="text-slate-600">CTR %</span></div><div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background: COLORS.ctor}}></div><span className="text-slate-600">CTOR %</span></div></>)}
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={currentEngagementData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                                {engagementMetric === 'cliques' && (<YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: COLORS.ctr}} tickFormatter={(val) => `${val}%`} />)}
                                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#cbd5e1'}} />
                                {engagementMetric === 'bounces' ? (
                                    <><Line yAxisId="left" type="monotone" dataKey="softBounces" name="Soft Bounce" stroke={COLORS.softBounce} strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: COLORS.softBounce}} activeDot={{r: 6}} /><Line yAxisId="left" type="monotone" dataKey="hardBounces" name="Hard Bounce" stroke={COLORS.hardBounce} strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: COLORS.hardBounce}} activeDot={{r: 6}} /></>
                                ) : engagementMetric === 'rejeicoes' ? (
                                    <><Line yAxisId="left" type="monotone" dataKey="spam" name="Spam" stroke={COLORS.spam} strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: COLORS.spam}} activeDot={{r: 6}} /><Line yAxisId="left" type="monotone" dataKey="descadastro" name="Descadastro" stroke={COLORS.unsubscribe} strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: COLORS.unsubscribe}} activeDot={{r: 6}} /></>
                                ) : engagementMetric === 'cliques' ? (
                                    <><Line yAxisId="left" type="monotone" dataKey="cliques" name="Cliques" stroke={COLORS.clicks} strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: COLORS.clicks}} activeDot={{r: 6}} /><Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR" stroke={COLORS.ctr} strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: COLORS.ctr}} activeDot={{r: 6}} /><Line yAxisId="right" type="monotone" dataKey="ctor" name="CTOR" stroke={COLORS.ctor} strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: COLORS.ctor}} activeDot={{r: 6}} /></>
                                ) : (
                                    <Line yAxisId="left" type="monotone" dataKey={engagementMetric} stroke={COLORS.primary} strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 2: RECEITA */}
            <section className="space-y-4">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><span className="w-1 h-5 bg-emerald-500 rounded-full"></span>Consolidado de Receita</h2>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none"><input type="checkbox" className="accent-emerald-600 w-4 h-4" checked={showComparison} onChange={() => setShowComparison(!showComparison)} />Comparar com ano anterior</label>
                    </div>
                    <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                        <button onClick={() => setRevenueView('diario')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${revenueView === 'diario' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Diário</button>
                        <button onClick={() => setRevenueView('semanal')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${revenueView === 'semanal' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Semanal</button>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-6 border-b border-slate-100 rounded-t-xl">
                        <MetricTab label="Receita Total" value={`R$ ${fullDailyData.reduce((acc,i)=>acc + (i.receitaTotal||0), 0).toLocaleString()}`} active={revenueMetric === 'receitaTotal'} onClick={() => setRevenueMetric('receitaTotal')} description={TOOLTIPS.receitaTotal} showComparison={showComparison} compValue="R$ 1.4M" compPercent={22.4} />
                        <MetricTab label="Receita Influenciada" value={`R$ ${fullDailyData.reduce((acc,i)=>acc + i.receitaInfluenciada, 0).toLocaleString()}`} color="text-emerald-600" active={revenueMetric === 'receitaInfluenciada'} onClick={() => setRevenueMetric('receitaInfluenciada')} description={TOOLTIPS.receitaInfluenciada} showComparison={showComparison} compValue="R$ 38k" compPercent={18.5} />
                        <MetricTab label="Conversões" value={fullDailyData.reduce((acc,i)=>acc + i.conversoes, 0)} active={revenueMetric === 'conversoes'} onClick={() => setRevenueMetric('conversoes')} description={TOOLTIPS.conversoes} showComparison={showComparison} compValue="130" compPercent={21.5} />
                        <MetricTab label="Vendas Inf." value={fullDailyData.reduce((acc,i)=>acc + i.vendasInfluenciadas, 0)} active={revenueMetric === 'vendasInfluenciadas'} onClick={() => setRevenueMetric('vendasInfluenciadas')} description={TOOLTIPS.vendasInfluenciadas} showComparison={showComparison} compValue="125" compPercent={24.8} />
                        <MetricTab label="Base Inf." value={fullDailyData.reduce((acc,i)=>acc + i.baseInfluenciada, 0)} active={revenueMetric === 'baseInfluenciada'} onClick={() => setRevenueMetric('baseInfluenciada')} description={TOOLTIPS.baseInfluenciada} showComparison={showComparison} compValue="120" compPercent={25.0} />
                        <MetricTab label="Ticket Médio Inf." value="R$ 285" active={revenueMetric === 'ticket'} onClick={() => setRevenueMetric('ticket')} description={TOOLTIPS.ticket} showComparison={showComparison} compValue="R$ 293" compPercent={-2.4} isDangerComp />
                    </div>
                    <div className="p-6 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currentRevenueData}>
                                <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.1}/><stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} tickFormatter={(val) => formatAxis(val, isRevenueMetricCurrency ? 'currency' : 'number')} />
                                <Tooltip content={<CustomTooltip type={isRevenueMetricCurrency ? 'currency' : 'number'} />} cursor={{stroke: '#cbd5e1'}} />
                                <Area type="monotone" dataKey={revenueMetric} stroke={COLORS.success} fill="url(#colorRevenue)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 3: TABELA DE PERFORMANCE (AGORA COM PAGINAÇÃO REAL) */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Performance</h2>
                        <p className="text-xs text-slate-500">Selecione Campanhas ou Lojas para ter detalhes.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs font-bold text-slate-500">Agrupar por</span>
                        <select 
                            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2 outline-none focus:border-violet-500"
                            value={groupBy} onChange={e => setGroupBy(e.target.value)}
                        >
                            <option>Campanhas</option>
                            <option>Lojas</option>
                            <option>Disparos</option>
                        </select>
                        <button onClick={handleExportCSV} className="flex items-center gap-2 text-emerald-600 border border-emerald-200 bg-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-50 transition">
                            <Download size={14}/> Exportar CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600">Nome</span>
                            <ChevronDown size={12} className="text-slate-400"/>
                        </div>
                        <div className="relative w-full">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                            <input 
                                type="text" 
                                placeholder="Buscar por nome, ID ou segmento..." 
                                className="w-full pl-10 pr-4 py-2 text-sm outline-none text-slate-700 placeholder-slate-400"
                                value={tableSearch} onChange={e => setTableSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {/* TABELA: Usa currentItems (que já está paginado) */}
                        {groupBy === 'Campanhas' ? (
                            <table className="w-full text-xs text-left whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Campanhas</th>
                                        <th className="px-4 py-4">Último Envio</th>
                                        <th className="px-4 py-4">Plataforma</th>
                                        <th className="px-4 py-4 text-center">Envios</th>
                                        <th className="px-4 py-4 text-center">Entregas</th>
                                        <th className="px-4 py-4 text-center">Aberturas</th>
                                        <th className="px-4 py-4 text-center">Cliques</th>
                                        <th className="px-4 py-4 text-center">CTR</th>
                                        <th className="px-4 py-4 text-center">CTOR</th>
                                        <th className="px-4 py-4 text-center">Bounces</th>
                                        <th className="px-4 py-4 text-center">Rejeições</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentItems.map((camp: any) => (
                                        <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-violet-700 text-sm mb-1">{camp.name}</p>
                                                <p className="text-[10px] text-slate-500 mb-1">Segmento: <span className="text-emerald-600 font-bold underline cursor-pointer">{camp.segmentId || 'Geral'}</span></p>
                                                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200">ID: {camp.id.slice(0,8)}</span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                {new Date(camp.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md font-bold text-[10px]">{camp.channel}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center text-slate-600">{camp.sent.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="block text-slate-700">{camp.delivered.toLocaleString()}</span>
                                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.deliveredRate}%</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="block text-slate-700">{camp.opens.toLocaleString()}</span>
                                                <span className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.openRate}%</span>
                                            </td>
                                            <td className="px-4 py-4 text-center text-slate-700">{camp.clicks}</td>
                                            <td className="px-4 py-4 text-center"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.ctr}%</span></td>
                                            <td className="px-4 py-4 text-center"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.ctor}%</span></td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="block text-slate-700">{camp.bounces}</span>
                                                <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.bounceRate}%</span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="block text-slate-700">{camp.rejections}</span>
                                                <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.rejectionRate}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : groupBy === 'Lojas' ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Lojas</th>
                                        <th className="px-4 py-4 text-right">Receita da Loja</th>
                                        <th className="px-4 py-4 text-right">Receita Influenciada</th>
                                        <th className="px-4 py-4 text-center">Conversões</th>
                                        <th className="px-4 py-4 text-center">Vendas Influenciadas</th>
                                        <th className="px-4 py-4 text-right">Ticket Médio Inf.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentItems.map((store: any) => (
                                        <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700 text-sm mb-1">{store.name}</p>
                                                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200">ID: {store.id.slice(0,8)}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono text-slate-600">R$ {store.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                            <td className="px-4 py-4 text-right font-bold text-slate-700">R$ {store.revenueInfluenced.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                            <td className="px-4 py-4 text-center text-slate-700">{store.conversions}</td>
                                            <td className="px-4 py-4 text-center font-bold text-slate-700">{store.salesInfluenced}</td>
                                            <td className="px-4 py-4 text-right text-slate-600">R$ {store.ticketAverage.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-slate-400">Visualização por Disparos em desenvolvimento.</div>
                        )}
                    </div>
                    
                    {/* FOOTER DA TABELA COM PAGINAÇÃO REAL */}
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <span>Resultados por página</span>
                            <select 
                                className="bg-slate-50 border border-slate-200 rounded p-1 outline-none"
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reseta pra pag 1 se mudar o tamanho
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="flex gap-2 items-center">
                            {/* Botão Anterior */}
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-6 h-6 flex items-center justify-center rounded ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-500'}`}
                            >
                                {'<'}
                            </button>

                            {/* Números das Páginas (Exibe até 3) */}
                            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                // Lógica simples para "rolar" os números se estiver na pág 5
                                if (totalPages > 3 && currentPage > 1) {
                                    if(currentPage === totalPages) pageNum = totalPages - 2 + i;
                                    else pageNum = currentPage - 1 + i;
                                }
                                
                                return (
                                    <button 
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-6 h-6 flex items-center justify-center rounded font-bold transition ${currentPage === pageNum ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-500'}`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}

                            {/* Botão Próximo */}
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`w-6 h-6 flex items-center justify-center rounded ${currentPage === totalPages || totalPages === 0 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-500'}`}
                            >
                                {'>'}
                            </button>
                        </div>

                        <span>
                            {totalItems === 0 ? '0 resultados' : `${startIndex + 1}-${Math.min(endIndex, totalItems)} de ${totalItems}`}
                        </span>
                    </div>
                </div>
            </section>
            
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTES (SEM ALTERAÇÃO) ---
function MetricTab({ label, value, sub, icon, active, onClick, color="text-slate-700", isDanger, description, showComparison, compValue, compPercent, isDangerComp }: any) {
    return (
        <div onClick={onClick} className={`p-4 cursor-pointer transition-all border-r border-slate-100 last:border-0 relative group/tab ${active ? 'bg-slate-50' : 'hover:bg-slate-50'} first:rounded-tl-xl last:rounded-tr-xl`}>
            {active && <div className="absolute top-0 left-0 w-full h-1 bg-violet-500"/>}
            <div className="flex items-center gap-2 mb-2">
                <div className="text-slate-400">{icon}</div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                {description && (
                    <div className="relative group/info ml-auto">
                        <Info size={12} className="text-slate-300 hover:text-slate-500"/>
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl hidden group-hover/info:block z-[100] font-medium leading-relaxed opacity-0 group-hover/info:opacity-100 transition-opacity duration-200 pointer-events-none">
                            {description}
                            <div className="absolute top-full right-1 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-end gap-2">
                <span className={`text-lg font-bold leading-none ${isDanger ? 'text-red-500' : color}`}>{value}</span>
                {sub && !showComparison && <span className={`text-[10px] font-bold ${isDanger ? 'text-red-400' : 'text-emerald-600'} mb-0.5`}>{sub}</span>}
            </div>
            {showComparison && compValue && (
                <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <p className="text-[10px] text-slate-400 mb-0.5">Comparativo</p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-600">{compValue}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isDangerComp || compPercent < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {compPercent > 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {Math.abs(compPercent)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

function Sidebar({ activePage }: { activePage: string }) {
    const isActive = (p: string) => activePage === p;
    return (
        <aside className="w-20 lg:w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 shadow-2xl z-30 transition-all">
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
                <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-900/50">P</div>
                <span className="font-bold text-xl tracking-tight text-white ml-3 hidden lg:block">PRIMÍCIA</span>
            </div>
            <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
                <Link href="/"><NavItem icon={<Home size={20}/>} label="Visão Geral" active={isActive('home')} /></Link>
                <Link href="/clients"><NavItem icon={<Users size={20}/>} label="Carteira de Clientes" active={isActive('clients')} /></Link>
                <div className="mt-6 mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:block">Analytics</div>
                <Link href="/results/retail"><NavItem icon={<BarChart2 size={20}/>} label="Performance Varejo" active={isActive('retail')} /></Link>
                <Link href="/results/channels"><NavItem icon={<PieIcon size={20}/>} label="Canais & Origem" active={isActive('channels')} /></Link>
                <div className="mt-6 mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:block">Engajamento</div>
                <Link href="/campaigns"><NavItem icon={<MessageCircle size={20}/>} label="Campanhas" active={isActive('campaigns')} /></Link>
                <Link href="/reports"><NavItem icon={<FileText size={20}/>} label="Relatórios" active={isActive('reports')} /></Link>
            </nav>
        </aside>
    )
}

function NavItem({ icon, label, active }: any) {
    return <div className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-all ${active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>{icon} <span className="text-sm font-medium hidden lg:block">{label}</span></div>
}

const CustomTooltip = ({ active, payload, label, type }: any) => { 
    if (active && payload && payload.length) { 
        return (
            <div className="bg-slate-900 text-white p-3 shadow-xl rounded-lg text-xs border border-slate-700">
                <p className="font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => {
                    const isPercent = ['CTR', 'CTOR'].includes(entry.name);
                    let valDisplay = entry.value.toLocaleString('pt-BR');
                    if(type === 'currency') valDisplay = `R$ ${valDisplay}`;
                    if(isPercent) valDisplay = `${entry.value}%`;
                    return (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }}></div>
                            <span className="text-slate-300">{entry.name}:</span>
                            <span className="font-bold text-white ml-auto">{valDisplay}</span>
                        </div>
                    )
                })}
            </div>
        ); 
    } 
    return null; 
};