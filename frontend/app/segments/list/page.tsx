"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Users, Edit3, Trash2, 
  RefreshCcw, Lock, Calendar, Filter, AlertCircle,
  ChevronLeft, ChevronRight, Check, ArrowUp, ArrowDown, ArrowUpDown,
  BookOpen, X, Lightbulb, ToggleLeft, MousePointerClick
} from 'lucide-react';
import Link from 'next/link';

// --- COMPONENTE: MODAL DE TUTORIAL (LISTAGEM) ---
const ListTutorialModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Lado Esquerdo: Visual/Título */}
        <div className="bg-slate-900 text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <BookOpen size={24} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Gestão de<br/>Audiências</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Aprenda a organizar, filtrar e controlar seus segmentos de clientes com eficiência.
            </p>
          </div>
          
          <div className="relative z-10 mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Controle de Status
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Filtros Avançados
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Ordenação Rápida
            </div>
          </div>

          {/* Efeito decorativo */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Lado Direito: Conteúdo */}
        <div className="flex-1 bg-white p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Lightbulb size={20} className="text-amber-500" /> Dicas de Uso
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            
            {/* Dica 1: Status */}
            <div className="flex gap-4">
              <div className="mt-1"><div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div></div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">Ativar/Desativar Rápido <ToggleLeft size={16} className="text-slate-400"/></h4>
                <p className="text-sm text-slate-500 mb-2">
                  Use o botão de alternância (toggle) na coluna "Status" para ligar ou desligar um segmento instantaneamente.
                </p>
                <div className="flex gap-3 text-xs">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Verde = Ativo</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">Cinza = Inativo</span>
                </div>
              </div>
            </div>

            {/* Dica 2: Filtros */}
            <div className="flex gap-4">
              <div className="mt-1"><div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div></div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">Filtros Combinados <Filter size={16} className="text-slate-400"/></h4>
                <p className="text-sm text-slate-500">
                  Você pode buscar pelo <strong>Nome</strong> na barra de pesquisa E aplicar filtros de <strong>Tipo</strong> (Dinâmico/Estático) ao mesmo tempo clicando no ícone de funil.
                </p>
              </div>
            </div>

            {/* Dica 3: Ordenação */}
            <div className="flex gap-4">
              <div className="mt-1"><div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">3</div></div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">Ordenação por Coluna <MousePointerClick size={16} className="text-slate-400"/></h4>
                <p className="text-sm text-slate-500">
                  Clique no título de qualquer coluna (ex: "Última Modificação" ou "Status") para ordenar a lista. Clique novamente para inverter a ordem.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200 cursor-pointer">
              Entendi, obrigado!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- PÁGINA PRINCIPAL ---

export default function SegmentListPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States de Filtro/Busca/Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State de Tutorial
  const [isTutorialOpen, setIsTutorialOpen] = useState(false); // <--- NOVO STATE

  // State de Ordenação
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'updatedAt', 
    direction: 'desc' 
  });

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Carregar dados
  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const res = await fetch('http://localhost:3000/webhook/crm/intelligence/segments');
      if (res.ok) {
        const data = await res.json();
        setSegments(data);
      }
    } catch (error) {
      console.error("Erro ao buscar segmentos", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ORDENAÇÃO ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- CRUD ---
  const handleToggleStatus = async (id: string) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    try { await fetch(`http://localhost:3000/webhook/crm/intelligence/segments/${id}/status`, { method: 'PATCH' }); } 
    catch (e) { fetchSegments(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    setSegments(prev => prev.filter(s => s.id !== id));
    try { await fetch(`http://localhost:3000/webhook/crm/intelligence/segments/${id}`, { method: 'DELETE' }); } 
    catch (e) { fetchSegments(); }
  };

  // --- PROCESSAMENTO (Busca -> Filtro -> Ordenação -> Paginação) ---
  const filteredSegments = segments.filter(s => {
    const matchesSearch = s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (filterType === 'active') matchesFilter = s.active === true;
    if (filterType === 'inactive') matchesFilter = s.active === false;
    if (filterType === 'dynamic') matchesFilter = s.isDynamic === true;
    if (filterType === 'static') matchesFilter = s.isDynamic === false;
    return matchesSearch && matchesFilter;
  });

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    if (sortConfig.key === 'type') { aValue = a.isDynamic ? 1 : 0; bValue = b.isDynamic ? 1 : 0; }
    if (sortConfig.key === 'active') { aValue = a.active ? 1 : 0; bValue = b.active ? 1 : 0; }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedSegments.length / itemsPerPage);
  const paginatedSegments = sortedSegments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType, itemsPerPage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return '-'; }
  };

  const TableHeader = ({ label, sortKey, align = 'left' }: any) => (
    <th className={`p-4 ${align === 'right' ? 'text-right pr-6' : align === 'left' ? 'pl-6' : ''} cursor-pointer group hover:bg-slate-100 transition-colors select-none`} onClick={() => handleSort(sortKey)}>
        <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
            {label}
            <span className="text-slate-400">
                {sortConfig.key === sortKey ? (
                    sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-600" /> : <ArrowDown size={14} className="text-indigo-600" />
                ) : (<ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />)}
            </span>
        </div>
    </th>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* MODAL DE TUTORIAL RENDERIZADO AQUI */}
        <ListTutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Minhas Audiências</h1>
              <p className="text-sm text-slate-500">Gerencie seus grupos de clientes e regras de segmentação.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {/* BOTÃO DE TUTORIAL NO HEADER */}
             <button onClick={() => setIsTutorialOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold cursor-pointer">
                <BookOpen size={16} className="text-indigo-500" /> Como usar?
             </button>

             <div className="h-6 w-px bg-slate-200 mx-1"></div>

             <Link href="/segments">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer">
                <Plus size={20} /> Novo Segmento
                </button>
             </Link>
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-8 w-full">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                    <div><p className="text-slate-500 text-sm font-medium">Total de Segmentos</p><p className="text-2xl font-bold text-slate-800">{segments.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><RefreshCcw size={24} /></div>
                    <div><p className="text-slate-500 text-sm font-medium">Dinâmicos (Auto)</p><p className="text-2xl font-bold text-slate-800">{segments.filter(s => s.isDynamic).length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Lock size={24} /></div>
                    <div><p className="text-slate-500 text-sm font-medium">Estáticos (Snapshot)</p><p className="text-2xl font-bold text-slate-800">{segments.filter(s => !s.isDynamic).length}</p></div>
                </div>
            </div>

            {/* BARRA DE FERRAMENTAS */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm relative z-10">
                <Search className="text-slate-400 ml-2" size={20} />
                <input type="text" placeholder="Buscar segmento por nome..." className="flex-1 border-none focus:ring-0 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="relative" ref={filterMenuRef}>
                    <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${filterType !== 'all' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <Filter size={18} />
                        {filterType !== 'all' && <span className="text-xs font-bold capitalize">{filterType === 'active' ? 'Ativos' : filterType === 'inactive' ? 'Inativos' : filterType === 'dynamic' ? 'Dinâmicos' : 'Estáticos'}</span>}
                    </button>
                    {isFilterMenuOpen && (
                        <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200">
                             <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Filtrar por</div>
                             {['all', 'active', 'inactive', 'dynamic', 'static'].map(type => (
                                 <button key={type} onClick={() => { setFilterType(type); setIsFilterMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex justify-between items-center capitalize">
                                     {type === 'all' ? 'Todos' : type === 'active' ? 'Ativos' : type === 'inactive' ? 'Inativos' : type === 'dynamic' ? 'Dinâmicos' : 'Estáticos'}
                                     {filterType === type && <Check size={14} className="text-indigo-600" />}
                                 </button>
                             ))}
                        </div>
                    )}
                </div>
            </div>

            {/* TABELA DE LISTAGEM */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2"><RefreshCcw className="animate-spin text-indigo-500" size={24} />Carregando segmentos...</div>
                    ) : filteredSegments.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300"><AlertCircle size={32} /></div>
                            <h3 className="text-lg font-bold text-slate-700">Nenhum segmento encontrado</h3>
                            <Link href="/segments"><button className="text-indigo-600 font-bold hover:underline cursor-pointer mt-2">Criar agora</button></Link>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <TableHeader label="Nome do Segmento" sortKey="name" align="left" />
                                    <TableHeader label="Tipo" sortKey="type" />
                                    <TableHeader label="Status" sortKey="active" />
                                    <TableHeader label="Criado em" sortKey="createdAt" />
                                    <TableHeader label="Última Modificação" sortKey="updatedAt" />
                                    <th className="p-4 text-right pr-6">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedSegments.map((seg) => (
                                    <tr key={seg.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-slate-800 text-sm">{seg.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{Array.isArray(seg.rules) ? seg.rules.length : 0} regras aplicadas</div>
                                        </td>
                                        <td className="p-4">
                                            {seg.isDynamic ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-wide"><RefreshCcw size={10} /> Dinâmico</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 uppercase tracking-wide"><Lock size={10} /> Estático</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button onClick={() => handleToggleStatus(seg.id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${seg.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${seg.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-300" />{formatDate(seg.createdAt)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs font-bold text-slate-700">{formatDate(seg.updatedAt)}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">por {seg.updatedBy?.name || seg.updatedBy?.email || 'Sistema'}</div>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/segments/edit/${seg.id}`}><button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Edit3 size={18} /></button></Link>
                                                <button onClick={() => handleDelete(seg.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* RODAPÉ */}
                {filteredSegments.length > 0 && (
                    <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">Exibir</span>
                            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="text-xs border border-slate-200 rounded-lg bg-white py-1.5 px-2 text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                                <option value={10}>10</option><option value={50}>50</option><option value={100}>100</option>
                            </select>
                            <span className="text-xs text-slate-500">de <span className="font-bold">{filteredSegments.length}</span> resultados</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                            <span className="text-sm font-medium text-slate-700 px-2">Página {currentPage} de {totalPages || 1}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}