"use client";

import React, { useState } from 'react';
import {
    Home, Users, BarChart2, MessageCircle, Target, ArrowRight, TrendingUp,
    PieChart as PieIcon, FileText, Download, Calendar, FileSpreadsheet,
    BookOpen, Check, X
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK PARA EXPORTAÇÃO ---
// Em um cenário real, isso chamaria uma rota do backend que gera o CSV/PDF
const REPORT_TYPES = [
    { id: 'sales', label: 'Vendas Detalhadas', icon: <DollarSign size={16} /> },
    { id: 'customers', label: 'Base de Clientes (RFM)', icon: <Users size={16} /> },
    { id: 'campaigns', label: 'Performance de Campanhas', icon: <MessageCircle size={16} /> },
];
import { DollarSign } from 'lucide-react'; // Import extra necessário

// --- COMPONENTE: MODAL DE TUTORIAL (RELATÓRIOS) ---
const ReportsTutorialModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [step, setStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    if (!isOpen) return null;

    const tutorials = [
        {
            badge: "Inteligência",
            title: "Hub de Dados",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                        Bem-vindo à <strong>Central de Relatórios</strong>. Aqui você extrai o máximo valor das suas informações.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-violet-50 dark:bg-violet-900/40 p-3 rounded-lg border border-violet-100 dark:border-violet-800">
                            <div className="font-bold text-violet-700 dark:text-violet-400 text-sm">📊 Análises</div>
                            <div className="text-xs text-violet-600 dark:text-violet-300">Acesse dashboards visuais prontos para uso.</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/40 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">📥 Exportação</div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-300">Baixe planilhas para estudar no Excel ou BI.</div>
                        </div>
                    </div>
                </div>
            ),
            icon: <FileText size={56} className="text-white" />,
            color: "bg-slate-900",
            bgElement: "bg-violet-500"
        },
        {
            badge: "Exportação",
            title: "Planilhas e Dados Brutos",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                        Precisa cruzar os dados com outras planilhas da sua empresa?
                    </p>
                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/40 rounded-xl border border-blue-100 dark:border-blue-800 mb-2">
                        <Download size={24} className="text-blue-600 dark:text-blue-500" />
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                            Escolha o <strong>tipo de relatório</strong>, o <strong>período</strong>, e clique em baixar. O download começa na hora.
                        </div>
                    </div>
                </div>
            ),
            icon: <Download size={56} className="text-white" />,
            color: "bg-blue-600",
            bgElement: "bg-blue-400"
        },
        {
            badge: "Dashboards",
            title: "Atalhos Visuais",
            content: (
                <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                        Prefere ver os dados graficamente antes de exportar?
                    </p>
                    <ul className="space-y-3 mt-2">
                        <li className="flex gap-3 items-start">
                            <div className="p-1.5 bg-violet-100 dark:bg-violet-900/40 rounded text-violet-600 dark:text-violet-400 mt-0.5"><TrendingUp size={14} /></div>
                            <div>
                                <strong className="block text-slate-800 dark:text-slate-100 text-sm">Cards de Acesso Rápido</strong>
                                <span className="text-slate-500 dark:text-slate-400 text-xs">Abaixo, na seção <em>Dashboards Interativos</em>, você vai direto para as telas de Varejo, Campanhas ou Clientes.</span>
                            </div>
                        </li>
                    </ul>
                </div>
            ),
            icon: <TrendingUp size={56} className="text-white" />,
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
            localStorage.setItem('crm_reports_tutorial_hide', 'true');
        } else {
            localStorage.removeItem('crm_reports_tutorial_hide');
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
                <div className="flex-1 p-10 flex flex-col justify-between relative bg-white dark:bg-slate-900">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={20} />
                    </button>

                    <div className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300" key={step}>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">{currentStep.title}</h2>
                        {currentStep.content}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {tutorials.map((_, i) => (
                                    <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 ' + currentStep.color.replace('bg-', 'bg-') : 'w-2 bg-slate-200'}`}></div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                {step > 0 ? (
                                    <button onClick={() => setStep(step - 1)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-sm transition-colors">
                                        Voltar
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setDontShowAgain(!dontShowAgain)}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-slate-800 border-slate-800 dark:bg-slate-600 dark:border-slate-600' : 'border-slate-300 dark:border-slate-600'}`}>
                                            {dontShowAgain && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className="text-xs text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 select-none">Não mostrar mais</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleNext}
                                    className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-violet-100 dark:shadow-none hover:shadow-violet-200 transform hover:-translate-y-0.5 transition-all ${step === tutorials.length - 1 ? 'bg-slate-900 hover:bg-slate-800' : currentStep.color + ' hover:opacity-90'}`}
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

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState('sales');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isExporting, setIsExporting] = useState(false);

    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    React.useEffect(() => {
        const userHidTutorial = localStorage.getItem('crm_reports_tutorial_hide');
        if (userHidTutorial !== 'true') setIsTutorialOpen(true);
    }, []);

    const handleExport = () => {
        setIsExporting(true);
        // Simula delay de geração do relatório
        setTimeout(() => {
            setIsExporting(false);
            alert(`Relatório de ${REPORT_TYPES.find(r => r.id === selectedReport)?.label} gerado com sucesso!`);
        }, 1500);
    };

    return (
        <div className="flex h-screen bg-[#f1f5f9] dark:bg-[#0f172a] font-sans text-slate-900 dark:text-slate-100">
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <ReportsTutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
                <Header title="Central de Relatórios" subtitle="Hub de inteligência e exportação de dados" icon={<FileText size={18} />} onTutorialClick={() => setIsTutorialOpen(true)} />

                <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-10">

                    {/* SEÇÃO 1: EXPORTAÇÃO RÁPIDA */}
                    <section className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
                                <Download size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Exportação de Dados</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Baixe os dados brutos para analisar no Excel ou BI.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            {/* Seletor de Tipo */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Tipo de Relatório</label>
                                <div className="space-y-2">
                                    {REPORT_TYPES.map(type => (
                                        <label key={type.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedReport === type.id ? 'border-violet-500 dark:border-violet-400 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'}`}>
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
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Período de Análise</label>
                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                        <input type="date" className="w-full pl-10 pr-3 py-2.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-violet-500" />
                                    </div>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                        <input type="date" className="w-full pl-10 pr-3 py-2.5 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-violet-500" />
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
                                            <FileSpreadsheet size={18} /> Baixar Relatório CSV
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-slate-400 mt-2 text-center">O download iniciará automaticamente.</p>
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 2: ATALHOS PARA DASHBOARDS (NAVHUb) */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
                            Dashboards Interativos
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Card Varejo */}
                            <Link href="/results/retail">
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-500 transition-all cursor-pointer group h-full flex flex-col">
                                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Performance Varejo</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
                                        Acompanhe receita, ticket médio, PA e taxa de recompra com visão detalhada por loja e período.
                                    </p>
                                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                                        Acessar Dashboard <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>

                            {/* Card Clientes */}
                            <Link href="/clients">
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer group h-full flex flex-col">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Base de Clientes</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
                                        Consulte a carteira completa, identifique clientes inativos e analise o LTV individual.
                                    </p>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                                        Gerenciar Base <ArrowRight size={12} />
                                    </span>
                                </div>
                            </Link>

                            {/* Card Campanhas */}
                            <Link href="/campaigns">
                                <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-500 transition-all cursor-pointer group h-full flex flex-col">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <MessageCircle size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Campanhas CRM</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
                                        Histórico de disparos de WhatsApp, E-mail e SMS com taxas de conversão e receita.
                                    </p>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                                        Ver Disparos <ArrowRight size={12} />
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


function NavItem({ icon, label, active }: any) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-all ${active ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            {icon} <span className="text-sm font-medium hidden lg:block">{label}</span>
        </div>
    )
}

function Header({ title, subtitle, icon, onTutorialClick }: any) {
    return (
        <header className="h-20 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 p-1.5 rounded-md">{icon}</span> {title}
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 ml-9">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
                {onTutorialClick && (
                    <button onClick={onTutorialClick} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold cursor-pointer">
                        <BookOpen size={16} className="text-violet-500" /> Como usar?
                    </button>
                )}
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Admin User</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Diretor Comercial</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">AD</div>
            </div>
        </header>
    )
}