"use client";

import React, { useEffect, useState } from 'react';
import {
    User, Mail, Phone, Calendar, CreditCard, ShoppingBag,
    MessageCircle, Clock, AlertCircle, ChevronLeft, Target,
    ArrowLeft, Smartphone, Hash, Edit2, Search, Store as StoreIcon
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { API_BASE_URL } from "@/lib/config";

export default function ClientDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'behavior' | 'extra'>('overview');

    useEffect(() => {
        if (!id) return;
        async function fetchClient() {
            try {
                // ... inside the component
                const res = await fetch(`${API_BASE_URL}/webhook/erp/customers/${id}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setClient(null);
                        return;
                    }
                    throw new Error(`Failed to fetch client: ${res.statusText}`);
                }
                const data = await res.json();
                setClient(data);
            } catch (e) {
                console.error("Error fetching client:", e);
                setClient(null);
            } finally {
                setLoading(false);
            }
        }
        fetchClient();
    }, [id]);

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Carregando perfil...</div>;
    if (!client) return <div className="flex h-screen items-center justify-center text-slate-400">Cliente não encontrado</div>;

    return (
        <div className="flex h-screen bg-[#f8f9fa] font-sans text-slate-900 overflow-hidden">

            {/* SIDEBAR DETALHES (ESQUERDA) */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto shrink-0">
                <div className="p-6">
                    <button onClick={() => router.back()} className="flex items-center text-xs font-bold text-slate-500 hover:text-green-600 mb-6 transition-colors gap-1">
                        <ArrowLeft size={14} /> Voltar para Lista de consumidores
                    </button>

                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl uppercase shrink-0">
                            {client.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-slate-800 leading-tight">{client.name}</h1>
                            <p className="text-xs text-slate-500 mt-1">{client.age ? `${Math.floor(client.age)} anos` : 'Idade não informada'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {client.id.slice(0, 8)}...</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="text-xs">
                            <span className="text-slate-400 block mb-1">Data de cadastro</span>
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                                {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                                <span className="text-slate-400 font-normal">({new Date(client.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})</span>
                            </span>
                        </div>
                        <div className="text-xs">
                            <span className="text-slate-400 block mb-1">Loja de preferência</span>
                            <span className="font-semibold text-slate-700">{client.preferredStore || '-'}</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <User size={16} className="text-slate-400" /> Características
                        </h3>

                        <div className="space-y-4">
                            <DetailRow label="CPF" value={client.cpf} />
                            <DetailRow label="E-mail" value={client.email} />
                            <DetailRow label="Telefone" value={client.phone} />
                            <DetailRow label="Gênero" value="Feminino" />
                            <DetailRow label="Data de nascimento" value={client.birthDate ? new Date(client.birthDate).toLocaleDateString('pt-BR') : '-'} />
                            <DetailRow label="Cidade" value={client.city} />
                            <DetailRow label="Estado" value={client.state} />
                            <DetailRow label="País" value="Brasil" />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <MessageCircle size={16} className="text-slate-400" /> Canais habilitados
                        </h3>
                        <div className="space-y-3">
                            <ChannelToggle label="E-mail" enabled={!!client.email} />
                            <ChannelToggle label="SMS" enabled={true} />
                            <ChannelToggle label="Agenda" enabled={true} />
                            <ChannelToggle label="WhatsApp" enabled={!!client.phone} />
                            <ChannelToggle label="Android" enabled={false} />
                            <ChannelToggle label="iOS" enabled={false} />
                        </div>
                    </div>

                </div>
            </aside>

            {/* MAIN CONTENT (DIREITA) */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Header KPI */}
                <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
                    <div className="flex gap-4 w-full">
                        {/* KPI CARDS */}
                        <KpiCard
                            label="Receita total"
                            value={client.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={<CreditCard size={16} className="text-white" />}
                            color="bg-emerald-500"
                        />
                        <KpiCard
                            label="Ticket médio"
                            value={(client.totalTransactions > 0 ? client.ltv / client.totalTransactions : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={<CreditCard size={16} className="text-white" />} // Icon repeated as placeholder
                            color="bg-violet-500"
                        />
                        <KpiCard
                            label="Compras"
                            value={client.totalTransactions}
                            icon={<ShoppingBag size={16} className="text-white" />}
                            color="bg-blue-500"
                        />
                        <KpiCard
                            label="Campanhas"
                            value={client.campaignsCount || 0}
                            icon={<Target size={16} className="text-white" />}
                            color="bg-orange-500"
                        />
                    </div>
                </div>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-8">

                    {/* TABS */}
                    <div className="flex gap-8 border-b border-slate-200 mb-8">
                        <TabButton label="Visão geral" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <TabButton label="Comportamento" active={activeTab === 'behavior'} onClick={() => setActiveTab('behavior')} />
                        <TabButton label="Características extras" active={activeTab === 'extra'} onClick={() => setActiveTab('extra')} />
                    </div>

                    {/* TAB CONTENT */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Linha 1: Score only */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 mb-1">Pontuação RFM</h3>
                                    <p className="text-3xl font-bold text-violet-600">{client.rfmScore || 0}</p>
                                    <p className="text-xs text-slate-400 mt-1">{client.rfmLabel}</p>
                                </div>
                                <div className="h-16 w-16 rounded-full border-4 border-violet-100 border-t-violet-600 flex items-center justify-center">
                                    <ActivityIcon />
                                </div>
                            </div>

                            {/* RFM Block */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Target size={16} /> RFM</h3>
                                    <span className="text-xs font-bold text-green-600 cursor-pointer hover:underline">Ver RFM</span>
                                </div>
                                <p className="text-xs text-slate-400 mb-6">Os dados se referem ao período de {formatDistanceToNow(new Date().setFullYear(new Date().getFullYear() - 1), { locale: ptBR })} a hoje.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Grupo atual</p>
                                        <p className="font-bold text-slate-700 flex items-center gap-2 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${client.rfmLabel === 'VIP' ? 'bg-violet-500' : 'bg-slate-300'}`}></span>
                                            {client.rfmLabel}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Recência</p>
                                        <p className="font-bold text-slate-700 mt-1">{client.daysSinceLastBuy} dias</p>
                                    </div>
                                </div>
                            </div>

                            {/* Last Purchases */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Clock size={16} /> Últimas compras</h3>
                                    <span
                                        onClick={() => setActiveTab('behavior')}
                                        className="text-xs font-bold text-green-600 cursor-pointer hover:underline"
                                    >
                                        Ver todas
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {client.recentTransactions?.map((tx: any) => (
                                        <div key={tx.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                            <div>
                                                <p className="text-xs font-bold text-slate-600">{formatDistanceToNow(new Date(tx.date), { addSuffix: true, locale: ptBR })}</p>
                                                <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-sm font-bold ${Number(tx.value) < 0 ? 'text-red-500' : 'text-slate-700'}`}>{Number(tx.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                        </div>
                                    ))}
                                    {(!client.recentTransactions || client.recentTransactions.length === 0) && <p className="text-slate-400 text-xs text-center py-4">Nenhuma compra registrada</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'behavior' && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500">
                                        <Calendar size={14} /> Início
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 my-auto">Filtros e visualizações</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-500 rounded hover:bg-slate-200">Limpar filtros</button>
                                    <button className="px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-600 rounded cursor-not-allowed">Aplicar</button>
                                </div>
                            </div>

                            <div className="bg-blue-50 text-blue-700 text-xs px-4 py-3 rounded-lg flex items-center gap-2 mb-8">
                                <AlertCircle size={14} /> Estão sendo consideradas as últimas 1.000 interações do consumidor.
                            </div>

                            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                                {/* Mocked Timelines */}
                                {client.history?.map((event: any, idx: number) => (
                                    <div key={idx} className="relative pl-8">
                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${event.type === 'purchase' ? 'bg-emerald-500' : event.type === 'return' ? 'bg-red-500' : 'bg-violet-500'} ring-1 ring-slate-100`}></div>
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-5">
                                                <p className="text-sm font-bold text-slate-700">{event.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">{formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: ptBR })}</p>
                                            </div>
                                            <div className="col-span-4">
                                                <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded w-fit">
                                                    <StoreIcon size={12} />
                                                    {event.storeCode ? `${event.storeCode} - ${event.storeTradeName || event.store || 'Loja Física'}` : (event.storeTradeName || event.store || 'Loja Física')}
                                                </div>
                                            </div>
                                            <div className="col-span-3 text-right">
                                                {event.value && (
                                                    <span className={`text-sm font-bold ${Number(event.value) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        {Number(event.value) > 0 ? '+' : ''}{Number(event.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!client.history || client.history.length === 0) && (
                                    <p className="text-slate-400 text-xs py-4 pl-4">Nenhuma interação registrada.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'extra' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="relative w-full max-w-md">
                                    <input type="text" placeholder="Buscar característica extra..." className="w-full pl-3 pr-10 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-violet-400" />
                                    <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
                                </div>
                            </div>
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Característica extra</th>
                                        <th className="px-6 py-4">Conteúdo</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {client.neighborhood && <ExtraRow label="bairro" value={client.neighborhood} />}
                                    {client.externalId && <ExtraRow label="cd_pessoa" value={client.externalId} />}
                                    {client.zipCode && <ExtraRow label="cep" value={client.zipCode} />}
                                    {client.address && <ExtraRow label="endereco" value={client.address} />}
                                    {client.personType && <ExtraRow label="tipo_pessoa" value={client.personType} />}
                                    {client.state && <ExtraRow label="uf" value={client.state} />}

                                    {(!client.neighborhood && !client.address) && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-xs text-slate-400">
                                                Nenhuma característica adicional cadastrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

// --- SUBCOMPONENTS ---

function DetailRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="text-slate-900 font-bold text-right truncate max-w-[150px]">{value || '-'}</span>
        </div>
    )
}

function ChannelToggle({ label, enabled }: any) {
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 flex items-center gap-2">
                {getIconForChannel(label)} {label}
            </span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${enabled ? 'left-4.5' : 'left-0.5'}`} style={{ left: enabled ? '18px' : '2px' }}></div>
            </div>
        </div>
    )
}

function KpiCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center gap-3 min-w-[180px] shadow-sm">
            <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shadow-sm`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">{label}</p>
                <p className="text-sm font-bold text-emerald-600">{value}</p>
            </div>
        </div>
    )
}

function TabButton({ label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`pb-4 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${active ? 'border-green-500 text-green-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
            {label}
        </button>
    )
}

function TimelineItem({ title, date, type }: any) {
    const isError = type === 'error';
    return (
        <div className="relative pl-8">
            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${isError ? 'bg-red-500' : 'bg-violet-300'} ring-1 ring-slate-100`}></div>
            <div className="flex justify-between">
                <div>
                    <p className={`text-ms font-bold ${isError ? 'text-red-600' : 'text-slate-600'}`}>{title}</p>
                    <p className="text-xs text-slate-400 mt-1">{date}</p>
                </div>
            </div>
        </div>
    )
}

function ExtraRow({ label, value }: any) {
    return (
        <tr className="hover:bg-slate-50 group">
            <td className="px-6 py-3 font-bold text-slate-700">{label}</td>
            <td className="px-6 py-3 text-slate-500 font-mono uppercase">{value}</td>
            <td className="px-6 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-slate-400 hover:text-slate-600"><Edit2 size={14} /></button>
            </td>
        </tr>
    )
}

function getIconForChannel(label: string) {
    switch (label) {
        case 'E-mail': return <Mail size={12} />;
        case 'SMS': return <MessageCircle size={12} />;
        case 'Agenda': return <Calendar size={12} />;
        case 'WhatsApp': return <MessageCircle size={12} />; // or specific icons
        case 'Android': return <Smartphone size={12} />;
        case 'iOS': return <Smartphone size={12} />;
        default: return <Hash size={12} />;
    }
}

function ActivityIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
