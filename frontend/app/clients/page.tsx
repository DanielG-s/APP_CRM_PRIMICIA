"use client";

import React, { useEffect, useState, useDeferredValue, useMemo, useRef } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, Search, Filter, 
  ChevronLeft, ChevronRight, MoreHorizontal, Mail, Phone, Calendar, 
  PieChart as PieIcon, FileText, Crown, AlertCircle,
  ArrowUp, ArrowDown, X, ShoppingBag, Check, Code
} from 'lucide-react';
import Link from 'next/link';

// --- CORES DAS TAGS ---
const RFM_COLORS: any = {
    'VIP': 'bg-violet-100 text-violet-700 border-violet-200',
    'Leal': 'bg-blue-50 text-blue-700 border-blue-100',
    'Novo': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Em Risco': 'bg-amber-50 text-amber-700 border-amber-100',
    'Inativo': 'bg-slate-100 text-slate-500 border-slate-200',
    'Lead': 'bg-gray-50 text-gray-500 border-gray-200'
};

const SEGMENTS_OPTIONS = ['VIP', 'Leal', 'Novo', 'Em Risco', 'Inativo', 'Lead'];

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Estados de Filtro e Ordenação
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'lastPurchase', direction: 'desc' });
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  // Estado do Menu Segmentar
  const [isSegmentMenuOpen, setIsSegmentMenuOpen] = useState(false);
  const [activeSegments, setActiveSegments] = useState<string[]>([]);
  const segmentMenuRef = useRef<HTMLDivElement>(null);

  // --- FETCHING ---
  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3000/webhook/erp/customers');
        if (res.ok) setClients(await res.json());
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    }
    fetchClients();
  }, []);

  // Click Outside para fechar o menu de segmentação
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (segmentMenuRef.current && !segmentMenuRef.current.contains(event.target as Node)) {
        setIsSegmentMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
        key,
        direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const toggleSegment = (segment: string) => {
    setActiveSegments(prev => 
        prev.includes(segment) ? prev.filter(s => s !== segment) : [...prev, segment]
    );
    setPage(1); // Volta para pág 1 ao filtrar
  };

  // --- FILTER & SORT ---
  const processedData = useMemo(() => {
    let data = [...clients];

    // 1. Filtro de Texto
    if (deferredSearch) {
        const term = deferredSearch.toLowerCase();
        data = data.filter(c => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || (c.cpf && c.cpf.includes(term)));
    }

    // 2. Filtro de Segmento (NOVO)
    if (activeSegments.length > 0) {
        data = data.filter(c => activeSegments.includes(c.rfmLabel));
    }

    // 3. Ordenação
    if (sortConfig.key) {
        data.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (valA === null) return 1; if (valB === null) return -1;
            if (typeof valA === 'string' && !isNaN(Number(valA))) valA = Number(valA);
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return data;
  }, [clients, deferredSearch, sortConfig, activeSegments]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, page]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Header da Tabela
  const SortHeader = ({ label, sortKey, align="left" }: any) => (
    <th className={`px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors select-none text-${align}`} onClick={() => handleSort(sortKey)}>
        <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
            {label} 
            <div className="flex flex-col">
                {sortConfig.key === sortKey ? (
                    sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-violet-600"/> : <ArrowDown size={12} className="text-violet-600"/>
                ) : (
                    <ArrowDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-50"/>
                )}
            </div>
        </div>
    </th>
  );

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900">
      <Sidebar activePage="clients" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header title="Carteira de Clientes" subtitle="Gestão da base, LTV e perfis RFM" icon={<Users size={18}/>} />

        <div className="flex-1 p-6 lg:p-10 overflow-auto space-y-6">
            
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-20">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full max-w-md focus-within:border-violet-400 transition-colors">
                    <Search size={16} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome, e-mail ou CPF..." 
                        className="bg-transparent outline-none text-sm w-full placeholder-slate-400 text-slate-700"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex gap-2">
                    
                    {/* BOTÃO SEGMENTAR (FUNCIONAL) */}
                    <div className="relative" ref={segmentMenuRef}>
                        <button 
                            onClick={() => setIsSegmentMenuOpen(!isSegmentMenuOpen)}
                            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition ${activeSegments.length > 0 ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <Filter size={14}/> 
                            {activeSegments.length > 0 ? `${activeSegments.length} Filtros` : 'Segmentar'}
                        </button>
                        
                        {isSegmentMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-30">
                                <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-2">Filtrar por Perfil</p>
                                {SEGMENTS_OPTIONS.map(opt => (
                                    <div 
                                        key={opt} 
                                        onClick={() => toggleSegment(opt)}
                                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer"
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeSegments.includes(opt) ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300'}`}>
                                            {activeSegments.includes(opt) && <Check size={10} className="text-white"/>}
                                        </div>
                                        <span className="text-xs text-slate-700 font-medium">{opt}</span>
                                    </div>
                                ))}
                                {activeSegments.length > 0 && (
                                    <div className="border-t mt-2 pt-2 text-right px-2">
                                        <button onClick={() => setActiveSegments([])} className="text-[10px] text-red-500 font-bold hover:underline">Limpar</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="px-4 py-2 text-xs text-slate-400 italic bg-slate-50 rounded-lg border border-slate-100 cursor-help flex items-center gap-1" title="Novos clientes são importados automaticamente do ERP">
                        <Target size={12}/> Sincronização Automática
                    </div>
                </div>
            </div>

            {/* Tabela */}
            {loading ? (
                <div className="flex h-64 items-center justify-center text-slate-400 animate-pulse">Carregando dados do CRM...</div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                            <tr>
                                <SortHeader label="Cliente" sortKey="name" />
                                <SortHeader label="Contatos" sortKey="email" />
                                <SortHeader label="Perfil (RFM)" sortKey="rfmLabel" />
                                <SortHeader label="LTV Total" sortKey="ltv" />
                                <SortHeader label="Última Compra" sortKey="lastPurchase" />
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.map((client: any) => (
                                <tr key={client.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedClient(client)}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 group-hover:border-violet-200 group-hover:text-violet-600 transition-colors uppercase">
                                                {client.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700">{client.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {client.cpf ? `CPF: ${client.cpf}` : `ID: ${client.id.slice(0,6)}`}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="flex items-center gap-2 text-slate-500 text-xs truncate max-w-[150px]" title={client.email}>
                                                <Mail size={12}/> {client.email}
                                            </span>
                                            <span className="flex items-center gap-2 text-slate-500 text-xs">
                                                <Phone size={12}/> {client.phone}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${RFM_COLORS[client.rfmLabel] || RFM_COLORS['Lead']}`}>
                                            {client.rfmLabel === 'VIP' && <Crown size={10}/>}
                                            {client.rfmLabel === 'Em Risco' && <AlertCircle size={10}/>}
                                            {client.rfmLabel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                                        {client.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        {client.lastPurchase ? (
                                            <div className="text-xs">
                                                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                    <Calendar size={12} className="text-slate-400"/>
                                                    {new Date(client.lastPurchase).toLocaleDateString('pt-BR')}
                                                </div>
                                                <span className="text-[10px] text-slate-400 ml-4">
                                                    há {client.daysSinceLastBuy} dias
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300 italic">Nunca comprou</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }} 
                                            className="text-slate-300 hover:text-violet-600 transition p-2 hover:bg-slate-100 rounded-lg"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {/* Paginação */}
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="text-xs text-slate-500">
                            Mostrando <strong>{paginatedData.length}</strong> de <strong>{processedData.length}</strong> clientes
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 disabled:opacity-50 transition-all"><ChevronLeft size={16}/></button>
                            <span className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-700 min-w-[2rem] text-center">{page}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 disabled:opacity-50 transition-all"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Drawer */}
        <CustomerDrawer 
            isOpen={!!selectedClient} 
            client={selectedClient} 
            onClose={() => setSelectedClient(null)} 
        />

      </main>
    </div>
  );
}

// --- DRAWER DE DETALHES ---
function CustomerDrawer({ isOpen, client, onClose }: any) {
    // Estado interno para alternar visualização
    const [showRawData, setShowRawData] = useState(false);

    // Resetar estado quando mudar de cliente
    useEffect(() => {
        if(isOpen) setShowRawData(false);
    }, [isOpen, client]);

    if (!client) return null;

    const handleStartService = () => {
        if (!client.phone) {
            alert("Cliente sem telefone cadastrado.");
            return;
        }
        const cleanPhone = client.phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        const message = `Olá ${client.name}, tudo bem? Sou da Primícia e gostaria de falar sobre...`;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <>
            <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            
            <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 shadow-sm uppercase">
                            {client.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{client.name}</h2>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 border ${RFM_COLORS[client.rfmLabel]}`}>
                                {client.rfmLabel}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* VISÃO PADRÃO */}
                    {!showRawData && (
                        <>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">LTV Total</p>
                                    <p className="font-bold text-slate-700 text-lg">{client.ltv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pedidos</p>
                                    <p className="font-bold text-slate-700 text-lg">{client.totalTransactions}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ticket Médio</p>
                                    <p className="font-bold text-slate-700 text-lg">
                                        {client.totalTransactions > 0 ? (client.ltv / client.totalTransactions).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Users size={16} className="text-violet-500"/> Dados de Contato</h3>
                                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">E-mail</span><span className="font-medium text-slate-700">{client.email}</span></div>
                                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">Telefone</span><span className="font-medium text-slate-700">{client.phone}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">CPF/CNPJ</span><span className="font-medium text-slate-700">{client.cpf || 'Não informado'}</span></div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><ShoppingBag size={16} className="text-violet-500"/> Histórico Recente</h3>
                                <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                                    {client.recentTransactions?.map((tx: any) => (
                                        <div key={tx.id} className="relative pl-6">
                                            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-violet-500 border-2 border-white ring-1 ring-slate-100"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">Compra Realizada</p>
                                                    <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('pt-BR')} às {new Date(tx.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                                                </div>
                                                <span className="text-sm font-mono font-bold text-emerald-600">+{tx.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!client.recentTransactions || client.recentTransactions.length === 0) && <p className="text-xs text-slate-400 pl-6">Nenhuma transação recente.</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {/* VISÃO DADOS BRUTOS (JSON) */}
                    {showRawData && (
                        <div className="bg-slate-900 rounded-xl p-4 overflow-auto border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Code size={12}/> Payload JSON (ERP)</span>
                            </div>
                            <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                                {JSON.stringify(client, null, 2)}
                            </pre>
                        </div>
                    )}

                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    {/* BOTÃO "VISUALIZAR CADASTRO" AGORA É UM TOGGLE DE JSON */}
                    <button 
                        onClick={() => setShowRawData(!showRawData)}
                        className={`flex-1 border py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${showRawData ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                        {showRawData ? <Target size={16}/> : <Code size={16}/>}
                        {showRawData ? 'Ver Resumo' : 'Dados Técnicos'}
                    </button>
                    
                    {/* BOTÃO DE ATENDIMENTO */}
                    <button onClick={handleStartService} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2">
                        <MessageCircle size={18}/> Iniciar Atendimento
                    </button>
                </div>
            </div>
        </>
    )
}

// --- SHARED COMPONENTS ---
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