"use client";

import React, { useState } from 'react';
import { 
    Home, Users, BarChart2, MessageCircle, Target, ArrowRight, TrendingUp, 
    PieChart as PieIcon, FileText, Download, Calendar, FileSpreadsheet 
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK PARA EXPORTAÇÃO ---
// Em um cenário real, isso chamaria uma rota do backend que gera o CSV/PDF
const REPORT_TYPES = [
    { id: 'sales', label: 'Vendas Detalhadas', icon: <DollarSign size={16}/> },
    { id: 'customers', label: 'Base de Clientes (RFM)', icon: <Users size={16}/> },
    { id: 'campaigns', label: 'Performance de Campanhas', icon: <MessageCircle size={16}/> },
];
import { DollarSign } from 'lucide-react'; // Import extra necessário

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
      setIsExporting(true);
      // Simula delay de geração do relatório
      setTimeout(() => {
          setIsExporting(false);
          alert(`Relatório de ${REPORT_TYPES.find(r => r.id === selectedReport)?.label} gerado com sucesso!`);
      }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900">
      <Sidebar activePage="reports" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header title="Central de Relatórios" subtitle="Hub de inteligência e exportação de dados" icon={<FileText size={18}/>} />

        <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-10">
            
            {/* SEÇÃO 1: EXPORTAÇÃO RÁPIDA */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                        <Download size={20}/>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Exportação de Dados</h2>
                        <p className="text-xs text-slate-500">Baixe os dados brutos para analisar no Excel ou BI.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Seletor de Tipo */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Relatório</label>
                        <div className="space-y-2">
                            {REPORT_TYPES.map(type => (
                                <label key={type.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedReport === type.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                                    <input 
                                        type="radio" 
                                        name="reportType" 
                                        className="accent-violet-600" 
                                        checked={selectedReport === type.id}
                                        onChange={() => setSelectedReport(type.id)}
                                    />
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        {type.icon} {type.label}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Seletor de Data */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Período de Análise</label>
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input type="date" className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" />
                            </div>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input type="date" className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-500" />
                            </div>
                        </div>
                    </div>

                    {/* Botão de Ação */}
                    <div>
                        <button 
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all ${isExporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                        >
                            {isExporting ? 'Gerando Arquivo...' : (
                                <>
                                    <FileSpreadsheet size={18}/> Baixar Relatório CSV
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">O download iniciará automaticamente.</p>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 2: ATALHOS PARA DASHBOARDS (NAVHUb) */}
            <section>
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                    Dashboards Interativos
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Card Varejo */}
                    <Link href="/results/retail">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-violet-300 transition-all cursor-pointer group h-full flex flex-col">
                            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <TrendingUp size={24}/>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Performance Varejo</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-1">
                                Acompanhe receita, ticket médio, PA e taxa de recompra com visão detalhada por loja e período.
                            </p>
                            <span className="text-xs font-bold text-violet-600 flex items-center gap-1 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50">
                                Acessar Dashboard <ArrowRight size={12}/>
                            </span>
                        </div>
                    </Link>

                    {/* Card Clientes */}
                    <Link href="/clients">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group h-full flex flex-col">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users size={24}/>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Base de Clientes</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-1">
                                Consulte a carteira completa, identifique clientes inativos e analise o LTV individual.
                            </p>
                            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50">
                                Gerenciar Base <ArrowRight size={12}/>
                            </span>
                        </div>
                    </Link>

                    {/* Card Campanhas */}
                    <Link href="/campaigns">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group h-full flex flex-col">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MessageCircle size={24}/>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Campanhas CRM</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-1">
                                Histórico de disparos de WhatsApp, E-mail e SMS com taxas de conversão e receita.
                            </p>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50">
                                Ver Disparos <ArrowRight size={12}/>
                            </span>
                        </div>
                    </Link>

                </div>
            </section>
        </div>
      </main>
    </div>
  );
}

// --- SHARED COMPONENTS (Sidebar & Header) ---
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