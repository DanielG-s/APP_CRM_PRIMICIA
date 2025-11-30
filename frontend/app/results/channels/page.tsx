"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, Calendar, Filter, 
  ChevronDown, Mail, Smartphone, Download, MousePointer, Eye, 
  AlertCircle, DollarSign, ShoppingBag, PieChart as PieIcon, FileText, Check, X, Info,
  ArrowUpRight, ArrowDownRight, Search
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// --- TEMA VISUAL ---
const COLORS = {
  primary: "#6366f1",   // Violeta
  secondary: "#0f172a", // Slate Dark
  accent: "#f59e0b",    // Amber
  success: "#10b981",   // Emerald
  danger: "#ef4444",    // Red
  neutral: "#94a3b8",   // Gray
  grid: "#e2e8f0"
};

const TOOLTIPS = {
    receitaTotal: "É a soma dos valores gerados por todas as transações realizadas pela marca (incluindo vendas e devoluções). Dentre os filtros, só o de data afeta este número.",
    receitaInfluenciada: "É a fatia da receita da marca que foi influenciada por meio de um canal.",
    conversoes: "É quando as pessoas realizam uma compra (ou mais) após interagirem com uma campanha. É considerada uma única vez dentro da janela de conversão analisada. A taxa é calculada sobre as aberturas.", 
    vendasInfluenciadas: "Quantidade de vendas que ocorreram a partir de uma interação com uma campanha, dentro da janela de conversão analisada.",
    baseInfluenciada: "São as pessoas únicas que geraram vendas influenciadas durante o período.",
    ticket: "É o valor monetário gasto, em média, em cada venda influenciada. É calculado dividindo o valor total da receita influenciada pelo número total de vendas influenciadas.",
    envios: "Total de mensagens disparadas no período selecionado.",
    entregues: "Mensagens confirmadas como recebidas pelo servidor de destino.",
    aberturas: "Quantidade de aberturas únicas (Disponível para E-mail).",
    cliques: "Total de cliques únicos em links dentro das mensagens.",
    rejeicoes: "Mensagens que falharam permanentemente (Hard Bounce) ou temporariamente (Soft Bounce)."
};

// --- DADOS MOCKADOS (CAMPANHAS) ---
const MOCK_CAMPAIGNS = [
    { 
        id: "CMP-001", name: "Blog-Quinzenal-Novembro", segment: "TODOS USUARIOS SEM ERRO", platform: "APP.PRIMICIA", channel: "E-mail", date: "2024-11-17T00:00:00", 
        revenueInfluenced: 7189.22, conversions: 18, conversionRate: 0.76, salesInfluenced: 19, ticketAverage: 378.38,
        sent: 26944, delivered: 26855, deliveredRate: 99.67, opens: 2366, openRate: 8.81, clicks: 29, ctr: 0.11, ctor: 1.23, bounces: 93, bounceRate: 0.35, rejections: 8, rejectionRate: 0.03
    },
    { 
        id: "CMP-002", name: "Pink Friday - 13", segment: "TODOS USUARIOS COM ERRO", platform: "APP.PRIMICIA", channel: "E-mail", date: "2024-11-21T13:30:00", 
        revenueInfluenced: 5709.00, conversions: 15, conversionRate: 0.92, salesInfluenced: 19, ticketAverage: 300.10,
        sent: 15000, delivered: 14800, deliveredRate: 98.66, opens: 3000, openRate: 20.00, clicks: 150, ctr: 1.00, ctor: 5.00, bounces: 150, bounceRate: 1.00, rejections: 50, rejectionRate: 0.33
    },
    { 
        id: "CMP-003", name: "Oferta Relâmpago VIP", segment: "VIPS E LOVERS", platform: "WHATSAPP", channel: "WhatsApp", date: "2024-11-05T10:00:00", 
        revenueInfluenced: 8900.50, conversions: 45, conversionRate: 2.5, salesInfluenced: 48, ticketAverage: 197.78,
        sent: 2000, delivered: 1980, deliveredRate: 99.00, opens: 1800, openRate: 90.00, clicks: 400, ctr: 20.00, ctor: 22.22, bounces: 10, bounceRate: 0.50, rejections: 10, rejectionRate: 0.50
    },
    { 
        id: "CMP-004", name: "Recuperação de Carrinho", segment: "ABANDONO 24H", platform: "SMS", channel: "SMS", date: "2024-11-07T15:45:00", 
        revenueInfluenced: 1200.00, conversions: 5, conversionRate: 1.2, salesInfluenced: 5, ticketAverage: 240.00,
        sent: 500, delivered: 450, deliveredRate: 90.00, opens: 0, openRate: 0, clicks: 45, ctr: 10.00, ctor: 0, bounces: 20, bounceRate: 4.00, rejections: 30, rejectionRate: 6.00
    },
    { 
        id: "CMP-005", name: "Lançamento Verão", segment: "BASE COMPLETA", platform: "APP.PRIMICIA", channel: "E-mail", date: "2024-11-10T09:00:00", 
        revenueInfluenced: 22100.00, conversions: 60, conversionRate: 3.1, salesInfluenced: 65, ticketAverage: 368.33,
        sent: 18000, delivered: 17900, deliveredRate: 99.44, opens: 3780, openRate: 21.00, clicks: 800, ctr: 4.44, ctor: 21.16, bounces: 50, bounceRate: 0.27, rejections: 50, rejectionRate: 0.27
    },
];

// --- DADOS MOCKADOS (LOJAS) ---
const MOCK_STORES = [
    { id: "004", name: "PRIMICIA - VAREJO FABRICA", revenue: 342991.22, revenueInfluenced: 12535.11, conversions: 33, salesInfluenced: 36, ticketAverage: 348.20 },
    { id: "001", name: "PRIMICIA - MATRIZ", revenue: 520100.00, revenueInfluenced: 45000.00, conversions: 120, salesInfluenced: 130, ticketAverage: 346.15 },
    { id: "002", name: "PRIMICIA - SHOPPING IGUATEMI", revenue: 280500.50, revenueInfluenced: 18200.00, conversions: 55, salesInfluenced: 60, ticketAverage: 303.33 },
    { id: "003", name: "PRIMICIA - OUTLET", revenue: 150000.00, revenueInfluenced: 5000.00, conversions: 20, salesInfluenced: 20, ticketAverage: 250.00 },
];

export default function ChannelResultsPage() {
  const [dateRange, setDateRange] = useState({ start: '2024-11-01', end: '2024-11-30' });
  const [draftDate, setDraftDate] = useState({ start: '2024-11-01', end: '2024-11-30' });
  const [isDateOpen, setIsDateOpen] = useState(false);
  
  // Filtros da Tabela
  const [tableSearch, setTableSearch] = useState("");
  const [groupBy, setGroupBy] = useState("Campanhas");

  // Estados de Visualização
  const [engagementMetric, setEngagementMetric] = useState('aberturas');
  const [revenueMetric, setRevenueMetric] = useState('receitaInfluenciada');
  const [engagementView, setEngagementView] = useState<'diario' | 'semanal'>('diario');
  const [revenueView, setRevenueView] = useState<'diario' | 'semanal'>('diario');
  const [showComparison, setShowComparison] = useState(false);

  // Dados dinâmicos
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);

  // --- FILTRO DA TABELA (CAMPANHAS) ---
  const filteredCampaigns = useMemo(() => {
      const term = tableSearch.toLowerCase();
      return MOCK_CAMPAIGNS.filter(c => 
          c.name.toLowerCase().includes(term) || 
          c.id.toLowerCase().includes(term) || 
          c.segment.toLowerCase().includes(term)
      );
  }, [tableSearch]);

  // --- FILTRO DA TABELA (LOJAS) ---
  const filteredStores = useMemo(() => {
      const term = tableSearch.toLowerCase();
      return MOCK_STORES.filter(s => 
          s.name.toLowerCase().includes(term) || 
          s.id.toLowerCase().includes(term)
      );
  }, [tableSearch]);

  // --- EXPORTAR CSV ---
  const handleExportCSV = () => {
      let csvContent = "";
      
      if (groupBy === 'Lojas') {
          const headers = ["ID", "Loja", "Receita Total", "Receita Inf.", "Conversões", "Vendas Inf.", "Ticket Médio Inf."];
          const rows = filteredStores.map(s => [
              s.id, s.name, s.revenue.toFixed(2), s.revenueInfluenced.toFixed(2), s.conversions, s.salesInfluenced, s.ticketAverage.toFixed(2)
          ]);
          csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
      } else {
          const headers = [
              "ID", "Nome", "Segmento", "Data", "Canal", 
              "Receita Inf.", "Conversões", "Taxa Conv.", "Vendas Inf.", "Ticket Médio",
              "Envios", "Entregas", "Taxa Entrega", "Aberturas", "Taxa Abertura", "Cliques", "CTR", "CTOR", "Bounces", "Rejeições"
          ];
          const rows = filteredCampaigns.map(c => [
              c.id, c.name, c.segment, new Date(c.date).toLocaleDateString('pt-BR'), c.channel,
              c.revenueInfluenced.toFixed(2), c.conversions, c.conversionRate + "%", c.salesInfluenced, c.ticketAverage.toFixed(2),
              c.sent, c.delivered, c.deliveredRate + "%", c.opens, c.openRate + "%", c.clicks, c.ctr + "%", c.ctor + "%", c.bounces, c.rejections
          ]);
          csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `performance_${groupBy.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- FUNÇÃO DE GERAÇÃO DE DADOS GRÁFICOS ---
  useEffect(() => {
      setLoading(true);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Simulação de dados gráficos
      const generateData = (view: string) => {
         const count = view === 'diario' ? daysDiff : Math.ceil(daysDiff / 7);
         return Array.from({ length: count }).map((_, i) => ({
             name: view === 'diario' ? `${i+1}/nov` : `Semana ${i+1}`,
             envios: Math.floor(Math.random() * 5000) + 2000,
             entregues: Math.floor(Math.random() * 4800) + 1900,
             aberturas: Math.floor(Math.random() * 3000) + 1000,
             cliques: Math.floor(Math.random() * 800) + 200,
             rejeicoes: Math.floor(Math.random() * 50),
             receitaTotal: Math.floor(Math.random() * 50000) + 10000,
             receitaInfluenciada: Math.floor(Math.random() * 15000) + 2000,
             vendasInfluenciadas: Math.floor(Math.random() * 50) + 5, 
             baseInfluenciada: Math.floor(Math.random() * 40) + 2, 
             ticket: Math.floor(Math.random() * 100) + 200,
             conversoes: Math.floor(Math.random() * 5) 
         }));
      };

      setEngagementData(generateData(engagementView));
      setRevenueData(generateData(revenueView));
      setLoading(false);
  }, [dateRange, engagementView, revenueView]);

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) setIsDateOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplyDate = () => {
      setDateRange(draftDate);
      setIsDateOpen(false);
  };

  const formatDateDisplay = (iso: string) => {
    if(!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  
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
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 p-1.5 rounded-md"><PieIcon size={18}/></span>
                Resultados de Canais
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

        <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-8">
            
            {/* ABAS */}
            <div className="flex border-b border-slate-200">
                {['Lista de campanhas', 'Resultados de Canais', 'Tempo real'].map((tab) => {
                    const key = tab.toLowerCase().replace(/ /g, '');
                    const isActive = key === 'resultadosdecanais'; 
                    return (
                        <button key={key} className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${isActive ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            {tab}
                        </button>
                    )
                })}
            </div>

            {/* FILTROS GLOBAIS */}
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
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                        Consolidado de Engajamento
                    </h2>
                    <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                        <button onClick={() => setEngagementView('diario')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${engagementView === 'diario' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}>Diário</button>
                        <button onClick={() => setEngagementView('semanal')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${engagementView === 'semanal' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}>Semanal</button>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-6 border-b border-slate-100 rounded-t-xl">
                        <MetricTab label="Envios" value="431.881" icon={<Mail size={14}/>} active={engagementMetric === 'envios'} onClick={() => setEngagementMetric('envios')} description={TOOLTIPS.envios} />
                        <MetricTab label="Entregues" value="422.973" sub="98%" icon={<Check size={14}/>} active={engagementMetric === 'entregues'} onClick={() => setEngagementMetric('entregues')} description={TOOLTIPS.entregues} />
                        <MetricTab label="Aberturas" value="37.135" sub="8.7%" icon={<Eye size={14}/>} active={engagementMetric === 'aberturas'} onClick={() => setEngagementMetric('aberturas')} color="text-violet-600" description={TOOLTIPS.aberturas} />
                        <MetricTab label="Cliques" value="7.895" sub="21%" icon={<MousePointer size={14}/>} active={engagementMetric === 'cliques'} onClick={() => setEngagementMetric('cliques')} description={TOOLTIPS.cliques} />
                        <MetricTab label="Rejeições" value="151" sub="0.04%" icon={<AlertCircle size={14}/>} active={engagementMetric === 'rejeicoes'} onClick={() => setEngagementMetric('rejeicoes')} isDanger description={TOOLTIPS.rejeicoes} />
                    </div>
                    <div className="p-6 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={engagementData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#cbd5e1'}} />
                                <Line type="monotone" dataKey={engagementMetric} stroke={COLORS.primary} strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
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
                        <MetricTab label="Receita Total" value="R$ 1.7M" active={revenueMetric === 'receitaTotal'} onClick={() => setRevenueMetric('receitaTotal')} description={TOOLTIPS.receitaTotal} showComparison={showComparison} compValue="R$ 1.4M" compPercent={22.4} />
                        <MetricTab label="Receita Influenciada" value="R$ 45k" color="text-emerald-600" active={revenueMetric === 'receitaInfluenciada'} onClick={() => setRevenueMetric('receitaInfluenciada')} description={TOOLTIPS.receitaInfluenciada} showComparison={showComparison} compValue="R$ 38k" compPercent={18.5} />
                        <MetricTab label="Conversões" value="158" active={revenueMetric === 'conversoes'} onClick={() => setRevenueMetric('conversoes')} description={TOOLTIPS.conversoes} showComparison={showComparison} compValue="130" compPercent={21.5} />
                        <MetricTab label="Vendas Inf." value="156" active={revenueMetric === 'vendasInfluenciadas'} onClick={() => setRevenueMetric('vendasInfluenciadas')} description={TOOLTIPS.vendasInfluenciadas} showComparison={showComparison} compValue="125" compPercent={24.8} />
                        <MetricTab label="Base Inf." value="150" active={revenueMetric === 'baseInfluenciada'} onClick={() => setRevenueMetric('baseInfluenciada')} description={TOOLTIPS.baseInfluenciada} showComparison={showComparison} compValue="120" compPercent={25.0} />
                        <MetricTab label="Ticket Médio Inf." value="R$ 285" active={revenueMetric === 'ticket'} onClick={() => setRevenueMetric('ticket')} description={TOOLTIPS.ticket} showComparison={showComparison} compValue="R$ 293" compPercent={-2.4} isDangerComp />
                    </div>
                    <div className="p-6 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
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

            {/* SEÇÃO 3: TABELA DE PERFORMANCE */}
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
                        {groupBy === 'Campanhas' ? (
                            <table className="w-full text-xs text-left whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Campanhas</th>
                                        <th className="px-4 py-4">Último Envio</th>
                                        <th className="px-4 py-4">Plataforma</th>
                                        <th className="px-4 py-4 text-right">Receita Inf.</th>
                                        <th className="px-4 py-4 text-center">Conversões</th>
                                        <th className="px-4 py-4 text-center">Vendas Inf.</th>
                                        <th className="px-4 py-4 text-right">Ticket Médio</th>
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
                                    {filteredCampaigns.map((camp) => (
                                        <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-violet-700 text-sm mb-1">{camp.name}</p>
                                                <p className="text-[10px] text-slate-500 mb-1">Segmento: <span className="text-emerald-600 font-bold underline cursor-pointer">{camp.segment}</span></p>
                                                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200">ID: {camp.id}</span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                {new Date(camp.date).toLocaleDateString('pt-BR')} • {new Date(camp.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md font-bold text-[10px]">{camp.platform}</span>
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold text-slate-700">R$ {camp.revenueInfluenced.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-bold text-slate-700 block">{camp.conversions}</span>
                                                <span className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{camp.conversionRate}%</span>
                                            </td>
                                            <td className="px-4 py-4 text-center font-bold text-slate-700">{camp.salesInfluenced}</td>
                                            <td className="px-4 py-4 text-right text-slate-600">R$ {camp.ticketAverage.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
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
                                    {filteredStores.map((store) => (
                                        <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700 text-sm mb-1">{store.name}</p>
                                                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200">ID: {store.id}</span>
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
                    
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                        <span>Resultados por página 10 <ChevronDown size={10} className="inline"/></span>
                        <div className="flex gap-2 items-center">
                            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400">{'<'}</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-white font-bold">1</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100">2</button>
                            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400">{'>'}</button>
                        </div>
                        <span>1-10 de 141</span>
                    </div>
                </div>
            </section>
            
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTES MANTIDOS ---
function MetricTab({ 
    label, value, sub, icon, active, onClick, color="text-slate-700", isDanger, description,
    showComparison, compValue, compPercent, isDangerComp 
}: any) {
    return (
        <div 
            onClick={onClick} 
            className={`p-4 cursor-pointer transition-all border-r border-slate-100 last:border-0 relative group/tab ${active ? 'bg-slate-50' : 'hover:bg-slate-50'} first:rounded-tl-xl last:rounded-tr-xl`}
        >
            {active && <div className="absolute top-0 left-0 w-full h-1 bg-violet-500"/>}
            
            <div className="flex items-center gap-2 mb-2">
                <div className="text-slate-400">{icon}</div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                
                {/* TOOLTIP ICON COM HOVER */}
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

            {/* BLOCO DE COMPARATIVO */}
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

// --- Sidebar, NavItem, CustomTooltip (Mantidos Iguais) ---
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
const CustomTooltip = ({ active, payload, label, type }: any) => { if (active && payload && payload.length) { return (<div className="bg-slate-900 text-white p-3 shadow-xl rounded-lg text-xs border border-slate-700"><p className="font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</p>{payload.map((entry: any, index: number) => (<div key={index} className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div><span className="text-slate-300">{entry.name}:</span><span className="font-bold text-white ml-auto">{type === 'currency' ? `R$ ${entry.value.toLocaleString('pt-BR')}` : entry.value.toLocaleString('pt-BR')}</span></div>))}</div>); } return null; };