"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Users, Edit3, Trash2,
  RefreshCcw, Lock, Calendar, AlertCircle,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown,
  Lightbulb, MousePointerClick,
  TrendingUp, TrendingDown, Download
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { intelligenceService } from '@/services/intelligence.service';
import { API_BASE_URL } from '@/lib/config';
import { useAuth } from '@clerk/nextjs';
import { useRBAC } from '../../contexts/RBACContext';
import { SegmentImpactPanel } from '../shared/components';
import {
  PageHeader, TutorialModal, TutorialStep,
  SearchBar, FilterDropdown, SortableHeader, PaginationControl
} from '@/components/shared';

const SEGMENT_FILTER_LABELS: Record<string, string> = {
  active: 'Ativos',
  inactive: 'Inativos',
  dynamic: 'Dinâmicos',
  static: 'Estáticos',
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    badge: "Bem-vindo",
    title: "Domine sua Audiência",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
          Esta não é apenas uma lista de contatos. É o seu <strong>Centro de Inteligência</strong>.
          Aqui você transforma dados brutos em oportunidades de venda, criando grupos ultra-segmentados para suas campanhas.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <div className="font-bold text-indigo-700 dark:text-indigo-400 text-sm">🎯 Precisão</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-300">Filtre por comportamento, RFM e perfil.</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/40 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">📈 Retenção</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-300">Recupere clientes antes que eles sumam.</div>
          </div>
        </div>
      </div>
    ),
    icon: <Users size={56} className="text-white" />,
    color: "bg-slate-900",
    bgElement: "bg-indigo-500"
  },
  {
    badge: "Estratégia",
    title: "Dinâmico ou Estático?",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Você tem dois superpoderes aqui. Escolha o ideal para cada momento:
        </p>
        <ul className="space-y-3 mt-2">
          <li className="flex gap-3 items-start">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-600 dark:text-blue-400 mt-0.5"><RefreshCcw size={14} /></div>
            <div>
              <strong className="block text-slate-800 dark:text-slate-100 text-sm">Dinâmico (Automático)</strong>
              <span className="text-slate-500 dark:text-slate-400 text-xs">O sistema atualiza a lista todo dia. Ideal para "Aniversariantes" ou "Novos Clientes".</span>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded text-amber-600 dark:text-amber-400 mt-0.5"><Lock size={14} /></div>
            <div>
              <strong className="block text-slate-800 dark:text-slate-100 text-sm">Estático (Snapshot)</strong>
              <span className="text-slate-500 dark:text-slate-400 text-xs">Uma lista fixa que não muda. Perfeito para "Participantes do Evento X".</span>
            </div>
          </li>
        </ul>
      </div>
    ),
    icon: <RefreshCcw size={56} className="text-white" />,
    color: "bg-blue-600",
    bgElement: "bg-blue-400"
  },
  {
    badge: "Analytics",
    title: "Monitore a Saúde",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          A nova coluna de <strong>Alcance</strong> é o seu termômetro. Não olhe apenas o número total:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
            <div className="text-sm dark:text-slate-300">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Crescimento (Verde)</span>
              Novos clientes entraram no perfil.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <TrendingDown size={18} />
            </div>
            <div className="text-sm dark:text-slate-300">
              <span className="font-bold text-rose-700 dark:text-rose-400 block">Redução (Vermelho)</span>
              Clientes saíram ou deixaram de comprar.
            </div>
          </div>
        </div>
      </div>
    ),
    icon: <TrendingUp size={56} className="text-white" />,
    color: "bg-emerald-600",
    bgElement: "bg-emerald-400"
  },
  {
    badge: "Produtividade",
    title: "Profundidade num Clique",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Precisa de mais detalhes sem sair da tela?
        </p>
        <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/40 rounded-xl border border-amber-100 dark:border-amber-800 mb-2">
          <MousePointerClick size={24} className="text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <strong>Clique em qualquer linha da tabela</strong> para abrir a gaveta lateral. Lá você vê canais disponíveis (Email/Whats) e receita estimada.
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Use o botão <Download size={14} className="inline mx-1" /> para baixar o CSV e usar em outras ferramentas.
        </p>
      </div>
    ),
    icon: <Lightbulb size={56} className="text-white" />,
    color: "bg-amber-500",
    bgElement: "bg-amber-300"
  }
];

const Sparkline = ({ data, color = "#10b981" }: { data: number[], color?: string }) => {
  if (!data || data.length < 2) return null;
  const width = 60;
  const height = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="2" fill={color} />
    </svg>
  );
};

export default function SegmentListPage() {
  const { getToken } = useAuth();
  const { hasPermission } = useRBAC();
  const [segments, setSegments] = useState<any[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'updatedAt', direction: 'desc' });

  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-filter-dropdown]')) {
        // handled internally by FilterDropdown
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const userHidTutorial = localStorage.getItem('crm_segment_tutorial_hide');
    if (userHidTutorial !== 'true') setIsTutorialOpen(true);
    fetchSegments();
  }, []);

  useEffect(() => {
    if (!selectedSegment) { setPreviewData(null); return; }
    const fetchPreview = async () => {
      setIsPreviewLoading(true);
      try {
        const token = await getToken();
        const response = await intelligenceService.calculatePreview(token, selectedSegment.rules);
        setPreviewData(response);
      } catch (error) { console.error("Erro ao calcular preview", error); }
      finally { setIsPreviewLoading(false); }
    };
    const timer = setTimeout(fetchPreview, 200);
    return () => clearTimeout(timer);
  }, [selectedSegment]);

  const fetchSegments = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await intelligenceService.getSegments(token);
      if (data && data.segments && Array.isArray(data.segments)) {
        setSegments(data.segments);
        setTotalCustomers(data.totalCustomers || 0);
      } else if (Array.isArray(data)) {
        setSegments(data);
        setTotalCustomers(0);
      } else {
        setSegments([]);
      }
    } catch (error) {
      console.error('Erro ao buscar segmentos:', error);
      toast.error('Erro ao carregar segmentos.');
      setSegments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleToggleStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSegments(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    try {
      const token = await getToken();
      await intelligenceService.toggleSegmentStatus(token, id);
    } catch (_) { fetchSegments(); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Tem certeza?')) return;
    if (selectedSegment?.id === id) setSelectedSegment(null);
    setSegments(prev => prev.filter(s => s.id !== id));
    try {
      const token = await getToken();
      await intelligenceService.deleteSegment(token, id);
    } catch (_) { fetchSegments(); }
  };

  const handleExportCsv = (id: string) => {
    const exportUrl = `${API_BASE_URL}/webhook/crm/intelligence/segments/${id}/export`;
    window.open(exportUrl, '_blank');
    toast.success('Download iniciado!');
  };

  const activeFilterType = filterType[0] ?? 'all';

  const filteredSegments = segments.filter(s => {
    const matchesSearch = s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (activeFilterType === 'active') matchesFilter = s.active === true;
    if (activeFilterType === 'inactive') matchesFilter = s.active === false;
    if (activeFilterType === 'dynamic') matchesFilter = s.isDynamic === true;
    if (activeFilterType === 'static') matchesFilter = s.isDynamic === false;
    return matchesSearch && matchesFilter;
  });

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    if (sortConfig.key === 'type') { aValue = a.isDynamic ? 1 : 0; bValue = b.isDynamic ? 1 : 0; }
    if (sortConfig.key === 'active') { aValue = a.active ? 1 : 0; bValue = b.active ? 1 : 0; }
    if (sortConfig.key === 'lastCount') { aValue = a.lastCount || 0; bValue = b.lastCount || 0; }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedSegments.length / itemsPerPage);
  const paginatedSegments = sortedSegments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType, itemsPerPage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (_) { return '-'; }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          storageKey="crm_segment_tutorial_hide"
          steps={TUTORIAL_STEPS}
        />

        <PageHeader
          title="Minhas Audiências"
          subtitle="Gerencie seus grupos de clientes e regras de segmentação."
          icon={<Users size={18} />}
          onTutorialClick={() => setIsTutorialOpen(true)}
        >
          <Link href="/segments/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer">
              <Plus size={20} /> Novo Segmento
            </button>
          </Link>
        </PageHeader>

        <div className="flex-1 flex overflow-hidden w-full relative">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl"><Users size={24} /></div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total de Segmentos</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{segments.length}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl"><RefreshCcw size={24} /></div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Dinâmicos (Auto)</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{segments.filter(s => s.isDynamic).length}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl"><Lock size={24} /></div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Estáticos (Snapshot)</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{segments.filter(s => !s.isDynamic).length}</p>
                  </div>
                </div>
              </div>

              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar segmento por nome..."
              >
                <FilterDropdown
                  mode="single"
                  options={['active', 'inactive', 'dynamic', 'static']}
                  selected={filterType}
                  onChange={setFilterType}
                  sectionTitle="Filtrar por"
                  labelMap={SEGMENT_FILTER_LABELS}
                  label="Filtrar"
                />
              </SearchBar>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                      <RefreshCcw className="animate-spin text-indigo-500" size={24} />
                      Carregando segmentos...
                    </div>
                  ) : filteredSegments.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                        <AlertCircle size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Nenhum segmento encontrado</h3>
                      <Link href="/segments/new">
                        <button className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer mt-2">Criar agora</button>
                      </Link>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <SortableHeader label="Nome do Segmento" sortKey="name" sortConfig={sortConfig} onSort={handleSort} className="pl-6" />
                          <SortableHeader label="Tipo" sortKey="type" sortConfig={sortConfig} onSort={handleSort} />
                          <SortableHeader label="Status" sortKey="active" sortConfig={sortConfig} onSort={handleSort} />
                          <SortableHeader label="Alcance" sortKey="lastCount" sortConfig={sortConfig} onSort={handleSort} />
                          <SortableHeader label="Criado em" sortKey="createdAt" sortConfig={sortConfig} onSort={handleSort} />
                          <SortableHeader label="Última Modificação" sortKey="updatedAt" sortConfig={sortConfig} onSort={handleSort} />
                          <th className="p-4 text-right pr-6">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {paginatedSegments.map((seg) => {
                          const percent = totalCustomers > 0 ? Math.round(((seg.lastCount || 0) / totalCustomers) * 100) : 0;
                          const trend = parseFloat(seg.metrics?.trend || "0");

                          return (
                            <tr
                              key={seg.id}
                              onClick={() => setSelectedSegment(seg)}
                              className={`transition-colors group cursor-pointer ${
                                selectedSegment?.id === seg.id
                                  ? 'bg-indigo-50/60 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                                  : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-l-4 border-transparent'
                              }`}
                            >
                              <td className="p-4 pl-6">
                                <div className={`font-bold text-sm ${selectedSegment?.id === seg.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                  {seg.name}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {Array.isArray(seg.rules) ? seg.rules.length : 0} regras aplicadas
                                </div>
                              </td>
                              <td className="p-4">
                                {seg.isDynamic
                                  ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold border border-indigo-100 dark:border-indigo-800 uppercase tracking-wide"><RefreshCcw size={10} /> Dinâmico</span>
                                  : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700 uppercase tracking-wide"><Lock size={10} /> Estático</span>
                                }
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={(e) => handleToggleStatus(seg.id, e)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${seg.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${seg.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                              </td>
                              <td className="p-4 align-middle">
                                <div className="flex items-center gap-4">
                                  <div className="w-[100px]">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="font-bold text-slate-700 dark:text-slate-300">{seg.lastCount}</span>
                                      <span className="text-slate-400 text-[10px]">{percent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${percent > 50 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end justify-center min-w-[70px]">
                                    <Sparkline data={seg.metrics?.history || []} color={trend >= 0 ? "#10b981" : "#ef4444"} />
                                    {(() => {
                                      if (trend === 0) return <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Estável</div>;
                                      return (
                                        <div className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                          {trend > 0 ? '+' : ''}{seg.metrics?.netChange || 0}
                                          <span className="text-slate-400 font-normal ml-0.5">({trend}%)</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-slate-300 dark:text-slate-500" />
                                  {formatDate(seg.createdAt)}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatDate(seg.updatedAt)}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">por {seg.updatedBy?.name || seg.updatedBy?.email || 'Sistema'}</div>
                              </td>
                              <td className="p-4 text-right pr-6">
                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                  {hasPermission('app:export') && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleExportCsv(seg.id); }}
                                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg transition-colors cursor-pointer"
                                      title="Exportar CSV"
                                    >
                                      <Download size={18} />
                                    </button>
                                  )}
                                  <Link href={`/segments/edit/${seg.id}`} onClick={(e) => e.stopPropagation()}>
                                    <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors cursor-pointer">
                                      <Edit3 size={18} />
                                    </button>
                                  </Link>
                                  <button
                                    onClick={(e) => handleDelete(seg.id, e)}
                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
                {filteredSegments.length > 0 && (
                  <PaginationControl
                    page={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredSegments.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                )}
              </div>
            </div>
          </div>

          {selectedSegment && (
            <SegmentImpactPanel
              results={previewData}
              isCalculating={isPreviewLoading}
              title={selectedSegment.name}
              onClose={() => setSelectedSegment(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
