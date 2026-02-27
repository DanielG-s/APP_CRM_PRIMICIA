"use client";

import React from 'react';
import {
    Home, Users, BarChart2, MessageCircle, Target, Clock, FileText, Zap, DollarSign
} from 'lucide-react';

import { useDashboard } from '@/hooks/useDashboard';
import { KPICard } from '@/components/dashboard/KPICard';
import { ShortcutCard } from '@/components/dashboard/ShortcutCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentSalesList } from '@/components/dashboard/RecentSalesList';
import { PageHeader } from '@/components/shared';

export default function HomePage() {
    const { dailyTotal, history, recentSales, loading } = useDashboard();

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-slate-500">Carregando dashboard...</div>;
    }

    return (
        <div className="flex h-screen bg-[#f1f5f9] dark:bg-[#020817] font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <PageHeader
                    title="Visão Geral"
                    subtitle="Resumo operacional e atalhos rápidos"
                    icon={<Home size={18} />}
                />

                <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-8">

                    {/* MENSAGEM DE BOAS VINDAS */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bom dia, Admin! 👋</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Aqui está o que está acontecendo na sua rede hoje.</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Última atualização</p>
                            <p className="text-sm font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1 justify-end">
                                <Clock size={12} /> {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    {/* GRID DE KPI'S */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KPICard
                            label="Vendas Hoje"
                            value={dailyTotal.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            subvalue={`${dailyTotal.count} transações processadas`}
                            icon={<DollarSign size={24} />}
                            color="bg-emerald-100 text-emerald-600"
                        />
                        <KPICard
                            label="Meta Mensal"
                            value="68%"
                            subvalue="R$ 120k faltantes para o alvo"
                            icon={<Target size={24} />}
                            color="bg-violet-100 text-violet-600"
                        />
                        <KPICard
                            label="Campanhas Ativas"
                            value="3"
                            subvalue="Disparos agendados para hoje"
                            icon={<Zap size={24} />}
                            color="bg-amber-100 text-amber-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <RevenueChart data={history} />
                        <RecentSalesList sales={recentSales} />
                    </div>

                    {/* ATALHOS RÁPIDOS */}
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Acesso Rápido</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ShortcutCard
                                title="Nova Campanha"
                                desc="Disparar e-mail ou whats"
                                icon={<MessageCircle size={20} />}
                                href="/campaigns"
                                color="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300"
                            />
                            <ShortcutCard
                                title="Base de Clientes"
                                desc="Consultar perfis e RFM"
                                icon={<Users size={20} />}
                                href="/clients"
                                color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                            />
                            <ShortcutCard
                                title="Resultados Varejo"
                                desc="KPIs e gráficos detalhados"
                                icon={<BarChart2 size={20} />}
                                href="/results/retail"
                                color="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
                            />
                            <ShortcutCard
                                title="Exportar Dados"
                                desc="Baixar relatórios em CSV"
                                icon={<FileText size={20} />}
                                href="/reports"
                                color="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
