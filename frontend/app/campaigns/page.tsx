"use client";

import React, { useEffect, useState } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, Calendar, Bell, 
  TrendingUp, DollarSign, ShoppingBag, ArrowRight, Activity, 
  Clock, FileText, PieChart as PieIcon, Zap
} from 'lucide-react';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';

// --- TEMA ---
const COLORS = {
  primary: "#6366f1",
  secondary: "#0f172a",
  success: "#10b981",
  grid: "#e2e8f0"
};

export default function HomePage() {
  const [dailyTotal, setDailyTotal] = useState<any>({ total: 0, count: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // CORREÇÃO DE HIDRATAÇÃO: Estado para o relógio
  const [currentTime, setCurrentTime] = useState<string>("");

  // --- EFEITO DO RELÓGIO ---
  useEffect(() => {
    // Define a hora inicial apenas no cliente
    setCurrentTime(new Date().toLocaleTimeString());

    // Atualiza a cada segundo (opcional, mas fica legal)
    const interval = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Total do Dia
        const resTotal = await fetch('http://localhost:3000/webhook/erp/dashboard-total');
        if (resTotal.ok) setDailyTotal(await resTotal.json());

        // 2. Histórico 7 Dias
        const resHistory = await fetch('http://localhost:3000/webhook/erp/dashboard-history');
        if (resHistory.ok) setHistory(await resHistory.json());

        // 3. Últimas Vendas
        const resRecent = await fetch('http://localhost:3000/webhook/erp/recent-sales');
        if (resRecent.ok) setRecentSales(await resRecent.json());

      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // --- COMPONENTES DE UI ---
  
  const KPICard = ({ label, value, subvalue, icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {subvalue && <p className="text-xs text-slate-400 mt-1">{subvalue}</p>}
        </div>
    </div>
  );

  const ShortcutCard = ({ title, desc, icon, href, color }: any) => (
    <Link href={href} className="block">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-violet-300 hover:shadow-md transition-all cursor-pointer group h-full">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${color}`}>
                {icon}
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
    </Link>
  );

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900">
      <Sidebar activePage="home" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header title="Visão Geral" subtitle="Resumo operacional e atalhos rápidos" icon={<Home size={18}/>} />

        <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-8">
            
            {/* MENSAGEM DE BOAS VINDAS */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Bom dia, Admin! 👋</h2>
                    <p className="text-slate-500 text-sm mt-1">Aqui está o que está acontecendo na sua rede hoje.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-slate-400 uppercase">Última atualização</p>
                    <p className="text-sm font-mono text-slate-600 flex items-center gap-1 justify-end">
                        <Clock size={12}/> 
                        {/* CORREÇÃO AQUI: Usar estado currentTime em vez de new Date() direto */}
                        {currentTime || "--:--:--"}
                    </p>
                </div>
            </div>

            {/* GRID DE KPI'S (REAL-TIME) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard 
                    label="Vendas Hoje" 
                    value={dailyTotal.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    subvalue={`${dailyTotal.count} transações processadas`}
                    icon={<DollarSign size={24}/>}
                    color="bg-emerald-100 text-emerald-600"
                />
                <KPICard 
                    label="Meta Mensal" 
                    value="68%" 
                    subvalue="R$ 120k faltantes para o alvo"
                    icon={<Target size={24}/>}
                    color="bg-violet-100 text-violet-600"
                />
                <KPICard 
                    label="Campanhas Ativas" 
                    value="3" 
                    subvalue="Disparos agendados para hoje"
                    icon={<Zap size={24}/>}
                    color="bg-amber-100 text-amber-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* GRÁFICO DE TENDÊNCIA (7 DIAS) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp size={18} className="text-violet-500"/> Evolução Recente
                        </h3>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">Últimos 7 dias</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} tickFormatter={(val) => `R$${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none'}}
                                    itemStyle={{color: '#fff'}}
                                    formatter={(value: number) => [value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 'Vendas']}
                                />
                                <Area type="monotone" dataKey="vendas" stroke={COLORS.primary} strokeWidth={3} fill="url(#colorVendas)" activeDot={{r: 6}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* FEED DE VENDAS (REAL TIME) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-emerald-500"/> Últimas Vendas
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {recentSales.length === 0 && <p className="text-xs text-slate-400 italic">Nenhuma venda recente.</p>}
                        
                        {recentSales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                                <div>
                                    <p className="text-xs font-bold text-slate-700">{sale.customer}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{sale.store}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-emerald-600">
                                        +{sale.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {new Date(sale.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link href="/results/retail" className="mt-4 text-xs font-bold text-violet-600 flex items-center justify-center gap-1 hover:underline pt-2 border-t border-slate-100">
                        Ver Relatório Completo <ArrowRight size={12}/>
                    </Link>
                </div>
            </div>

            {/* ATALHOS RÁPIDOS */}
            <div>
                <h3 className="font-bold text-slate-800 mb-4">Acesso Rápido</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ShortcutCard 
                        title="Nova Campanha" 
                        desc="Disparar e-mail ou whats" 
                        icon={<MessageCircle size={20}/>} 
                        href="/campaigns"
                        color="bg-violet-100 text-violet-600"
                    />
                    <ShortcutCard 
                        title="Base de Clientes" 
                        desc="Consultar perfis e RFM" 
                        icon={<Users size={20}/>} 
                        href="/clients"
                        color="bg-blue-100 text-blue-600"
                    />
                    <ShortcutCard 
                        title="Resultados Varejo" 
                        desc="KPIs e gráficos detalhados" 
                        icon={<BarChart2 size={20}/>} 
                        href="/results/retail"
                        color="bg-emerald-100 text-emerald-600"
                    />
                    <ShortcutCard 
                        title="Exportar Dados" 
                        desc="Baixar relatórios em CSV" 
                        icon={<FileText size={20}/>} 
                        href="/reports"
                        color="bg-slate-100 text-slate-600"
                    />
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}

// --- SHARED COMPONENTS ---
function Sidebar({ activePage }: { activePage: string }) {
    const isActive = (p: string) => activePage === p;
    return (
        <aside className="w-20 lg:w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 shadow-2xl z-30 transition-all">
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
                <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-900/50">Q</div>
                <span className="font-bold text-xl tracking-tight text-white ml-3 hidden lg:block">QUANTIX</span>
            </div>
            <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
                <Link href="/"><NavItem icon={<Home size={20}/>} label="Visão Geral" active={isActive('home')} /></Link>
                <Link href="/clients"><NavItem icon={<Users size={20}/>} label="Carteira de Clientes" active={isActive('clients')} /></Link>
                <div className="mt-6 mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:block">Analytics</div>
                <Link href="/results/retail"><NavItem icon={<BarChart2 size={20}/>} label="Performance Varejo" active={isActive('retail')} /></Link>
                <Link href="/results/retail"><NavItem icon={<PieIcon size={20}/>} label="Canais & Origem" /></Link>
                <div className="mt-6 mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:block">Engajamento</div>
                <Link href="/campaigns"><NavItem icon={<MessageCircle size={20}/>} label="Campanhas" active={isActive('campaigns')} /></Link>
                <Link href="/reports"><NavItem icon={<FileText size={20}/>} label="Relatórios" active={isActive('reports')} /></Link>
            </nav>
        </aside>
    )
}

function NavItem({ icon, label, active }: any) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-all ${active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            {icon} <span className="text-sm font-medium hidden lg:block">{label}</span>
        </div>
    )
}

function Header({ title, subtitle, icon }: any) {
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
                    <p className="text-xs font-bold text-slate-700">Admin User</p>
                    <p className="text-[10px] text-slate-400">Diretor Comercial</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">AD</div>
            </div>
        </header>
    )
}