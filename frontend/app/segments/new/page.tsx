"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus, Bell, Fingerprint, Sparkles, ArrowDown, BarChart3, Mail,
  Smartphone, Wallet, RefreshCw, TrendingUp, AlertCircle, Save,
  RefreshCcw, Lock, BookOpen, ArrowLeft, CheckCircle2,
  Layers, Target, Calculator
} from 'lucide-react';
import Link from 'next/link';

import { UI_OPTIONS_INITIAL } from '../shared/constants';
import {
  StatCard, ChannelStat, RuleSelectionModal, LogicConnector,
  RfmBlock, BehaviorBlock, CharacteristicBlock, SegmentReferenceBlock
} from '../shared/components';
import { API_BASE_URL } from "@/lib/config";
import { useAuth, useUser } from "@clerk/nextjs";
import { TutorialModal, TutorialStep } from '@/components/shared';

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    badge: "Estratégia",
    title: "Construa sua Audiência",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300 text-lg">
          Aqui você usa blocos de lógica para filtrar sua base. Não é apenas selecionar filtros, é <strong>desenhar o perfil ideal</strong>.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
            <div className="font-bold text-indigo-700 dark:text-indigo-400 text-sm">🧩 Blocos</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-300">Combine RFM, Comportamento e Dados.</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/40 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">⚡ Automação</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-300">Segmentos dinâmicos alimentam seus fluxos.</div>
          </div>
        </div>
      </div>
    ),
    icon: <Target size={56} className="text-white" />,
    color: "bg-indigo-600",
    bgElement: "bg-indigo-400"
  },
  {
    badge: "Lógica",
    title: "Como Empilhar Regras?",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Você pode adicionar quantos blocos quiser. O segredo está nos conectores:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-1 rounded text-xs">E (AND)</div>
            <span className="text-sm text-slate-600 dark:text-slate-300">O cliente precisa atender a <strong>TODOS</strong> os critérios.</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 font-bold px-2 py-1 rounded text-xs">OU (OR)</div>
            <span className="text-sm text-slate-600 dark:text-slate-300">O cliente pode atender a <strong>QUALQUER</strong> critério.</span>
          </div>
        </div>
      </div>
    ),
    icon: <Layers size={56} className="text-white" />,
    color: "bg-emerald-600",
    bgElement: "bg-emerald-400"
  },
  {
    badge: "Previsibilidade",
    title: "Calculadora em Tempo Real",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Olhe para a direita 👉. Enquanto você adiciona regras, nós calculamos o impacto:
        </p>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-green-500" /> Quantos clientes serão atingidos.</li>
          <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-green-500" /> Qual a receita estimada desse grupo.</li>
          <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-green-500" /> Quantos têm E-mail ou WhatsApp válido.</li>
        </ul>
        <p className="text-xs text-slate-400 mt-2">
          Isso evita criar segmentos vazios ou muito pequenos.
        </p>
      </div>
    ),
    icon: <Calculator size={56} className="text-white" />,
    color: "bg-amber-500",
    bgElement: "bg-amber-300"
  }
];


// --- PÁGINA PRINCIPAL ---

export default function SegmentsPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [segmentName, setSegmentName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isDynamic, setIsDynamic] = useState(true);
  const [filterOptions, setFilterOptions] = useState(UI_OPTIONS_INITIAL);

  // --- EFEITO: ABRE O TUTORIAL SE NÃO TIVER SIDO DISPENSADO ---
  useEffect(() => {
    const userHidCreationTutorial = localStorage.getItem('crm_segment_creation_tutorial_hide');
    if (userHidCreationTutorial !== 'true') {
      setIsTutorialOpen(true);
    }
  }, []);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/webhook/crm/intelligence/filters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFilterOptions(prev => ({ ...prev, ...data, segments: data.segments || [] }));
        }
      } catch (e) { console.error("Erro filtros:", e); }
    }
    fetchOptions();
  }, [getToken]);

  useEffect(() => {
    if (blocks.length === 0) { setResults(null); return; }
    setIsCalculating(true);
    const timer = setTimeout(async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/webhook/crm/intelligence/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rules: blocks }),
        });
        if (!response.ok) throw new Error('Falha');
        setResults(await response.json());
      } catch (error) { console.error(error); } finally { setIsCalculating(false); }
    }, 800);
    return () => clearTimeout(timer);
  }, [blocks]);

  const addBlock = (category: string) => {
    let newBlock: any = { id: crypto.randomUUID(), category: category, logicOperator: 'AND' };
    if (category === 'rfm') newBlock = { ...newBlock, status: '' };
    else if (category === 'behavioral') newBlock = { ...newBlock, type: 'did', event: '', context: 'client', filters: [] };
    else if (category === 'characteristic') newBlock = { ...newBlock, field: '', operator: '', value: '' };
    else if (category === 'segment_ref') newBlock = { ...newBlock, relation: 'in', segment_id: '' };
    setBlocks([...blocks, newBlock]);
    setIsModalOpen(false);
  };
  const updateBlock = (index: number, updatedBlock: any) => { const newBlocks = [...blocks]; newBlocks[index] = updatedBlock; setBlocks(newBlocks); };
  const removeBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));

  const getBlockStyle = (category: string, isOrLogic: boolean, isNotFirst: boolean) => {
    let styles = "bg-white dark:bg-slate-800 border dark:border-slate-700 transition-all duration-300 relative z-0";
    if (category === 'behavioral') styles += " border-blue-100 dark:border-blue-900/40 shadow-sm hover:border-blue-200 dark:hover:border-blue-800";
    else if (category === 'characteristic') styles += " border-purple-100 dark:border-purple-900/40 shadow-sm hover:border-purple-200 dark:hover:border-purple-800";
    else if (category === 'segment_ref') styles += " border-teal-100 dark:border-teal-900/40 shadow-sm hover:border-teal-200 dark:hover:border-teal-800";
    else if (category === 'rfm') styles += " border-amber-100 dark:border-amber-900/40 shadow-sm hover:border-amber-200 dark:hover:border-amber-800";
    if (isOrLogic && isNotFirst) styles += " ring-2 ring-orange-100 dark:ring-orange-900/40 border-orange-300 dark:border-orange-800";
    return styles;
  };

  const handleSave = async () => {
    if (!segmentName.trim()) { alert('Dê um nome ao segmento.'); return; }
    if (blocks.length === 0) { alert('Adicione pelo menos uma regra.'); return; }
    const hasInvalidBlock = blocks.some(block => {
      if (block.category === 'rfm') return !block.status;
      if (block.category === 'behavioral') return !block.event;
      if (block.category === 'characteristic') return !block.field || !block.operator;
      if (block.category === 'segment_ref') return !block.segment_id;
      return false;
    });
    if (hasInvalidBlock) { alert('Regras incompletas.'); return; }

    setIsSaving(true); setSaveStatus('saving');
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/webhook/crm/intelligence/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: segmentName, rules: blocks, isDynamic: isDynamic }),
      });
      if (!response.ok) throw new Error(response.status === 409 ? 'NOME_DUPLICADO' : 'ERRO');
      setSaveStatus('success');
      setTimeout(() => { setSaveStatus('idle'); setIsSaving(false); setSegmentName(''); setBlocks([]); setIsDynamic(true); }, 2000);
    } catch (e: any) { setIsSaving(false); alert(e.message === 'NOME_DUPLICADO' ? 'Nome já existe' : 'Erro ao salvar'); }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      <main className="flex-1 flex flex-col h-screen overflow-hidden ml-20 md:ml-64 transition-all duration-300 border-l border-slate-200 dark:border-slate-800">
        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          storageKey="crm_segment_creation_tutorial_hide"
          steps={TUTORIAL_STEPS}
          finishLabel="Criar Segmento"
        />
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/segments/list" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><ArrowLeft size={18} /></Link>
            <span>CRM / Marketing / <span className="font-semibold text-indigo-600 dark:text-indigo-400">Criar Segmento</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsTutorialOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold mr-2 cursor-pointer"><BookOpen size={16} className="text-indigo-500 dark:text-indigo-400" /> Como usar?</button>
            <Bell className="text-gray-400 dark:text-slate-500 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400" size={20} />
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-y-auto px-6 py-8 bg-slate-50/80 dark:bg-slate-900">
            <div className="max-w-3xl mx-auto pb-32">
              <RuleSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={addBlock} />
              <div className="mb-10 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40"><Fingerprint className="text-blue-600 dark:text-blue-400" size={14} /><span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Builder Conectado</span></div>
                  <button onClick={handleSave} disabled={isSaving || saveStatus === 'success'} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all outline-none border-none cursor-pointer ${saveStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white'}`}>{saveStatus === 'success' ? <><CheckCircle2 size={16} /> Salvo!</> : <>{isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? 'Salvando...' : 'Salvar Segmento'}</>}</button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome do Segmento</label><input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)} placeholder="Ex: Clientes VIPs" className="block w-full text-2xl font-extrabold text-slate-900 dark:text-slate-100 bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-700 focus:ring-0 px-1 py-2 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600" /></div>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsDynamic(!isDynamic)}>
                    <div className="flex-1"><p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">{isDynamic ? <RefreshCcw size={16} className="text-indigo-600 dark:text-indigo-400" /> : <Lock size={16} className="text-amber-600 dark:text-amber-400" />}{isDynamic ? 'Segmento Dinâmico' : 'Lista Estática (Snapshot)'}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{isDynamic ? 'A lista é atualizada automaticamente.' : 'A lista é congelada.'}</p></div>
                    <button type="button" className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer border-none outline-none ${isDynamic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`absolute top-1/2 left-1 bg-white w-5 h-5 rounded-full shadow transform -translate-y-1/2 transition-transform ${isDynamic ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                  </div>
                </div>
              </div>
              <div className="space-y-10 relative min-h-[200px]">
                <div className="absolute left-1/2 top-4 bottom-20 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2 z-[-1] hidden md:block"></div>
                {blocks.length === 0 ? (
                  <div className="text-center py-12 opacity-60 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:opacity-100 transition-all cursor-pointer" onClick={() => setIsModalOpen(true)}><div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500"><Plus size={32} /></div><h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Comece seu segmento</h3><p className="text-slate-500 dark:text-slate-400">Clique para adicionar a primeira regra.</p></div>
                ) : (blocks.map((block, index) => (<div key={block.id} className="relative group">{index > 0 && <LogicConnector logicOperator={block.logicOperator} toggleLogic={() => updateBlock(index, { ...block, logicOperator: block.logicOperator === 'AND' ? 'OR' : 'AND' })} />}<div className={`rounded-2xl overflow-hidden ${getBlockStyle(block.category, block.logicOperator === 'OR', index > 0)}`}>{block.category === 'behavioral' && <BehaviorBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}{block.category === 'characteristic' && <CharacteristicBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}{block.category === 'segment_ref' && <SegmentReferenceBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}{block.category === 'rfm' && <RfmBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}</div></div>)))}
                <div className="relative pt-6 pb-12"><div className="flex flex-col items-center justify-center gap-3"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors" onClick={() => setIsModalOpen(true)}>Adicionar regra</span><ArrowDown size={16} className="text-slate-300 dark:text-slate-600 animate-bounce" /></div><div className="mt-4 flex justify-center"><button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all font-bold text-slate-700 dark:text-slate-300 cursor-pointer"><Plus size={18} className="text-slate-400 dark:text-slate-500" /> Nova Regra</button></div></div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex-col shadow-xl z-20 shrink-0">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50"><h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><BarChart3 className="text-slate-400" size={20} /> Impacto Estimado</h2>{isCalculating && <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded-full animate-pulse"><RefreshCw size={12} className="animate-spin" /> Calculando...</div>}</div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-lg"><div className="relative z-10"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Alcance Total</p><div className="flex items-baseline gap-2"><span className="text-4xl font-extrabold tracking-tight">{results?.metrics?.total || 0}</span><span className="text-sm font-medium text-emerald-400">({results?.metrics?.percent || 0}%)</span></div><p className="text-xs text-slate-500 mt-2">clientes da base total</p></div><Sparkles className="absolute right-[-20px] top-[-20px] text-white opacity-5" size={120} /></div>
              <div className="grid grid-cols-2 gap-3"><StatCard icon={Wallet} label="Receita Est." value={`R$ ${(results?.metrics?.revenue?.total || 0).toLocaleString('pt-BR')}`} color="green" /><StatCard icon={TrendingUp} label="Ticket Médio" value={`R$ ${(results?.metrics?.revenue?.orders_count > 0 ? results.metrics.revenue.total / results.metrics.revenue.orders_count : 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} color="blue" /></div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Canais Habilitados</h3><div className="space-y-1"><ChannelStat icon={Mail} label="E-mail" count={results?.metrics?.channels?.email || 0} total={results?.metrics?.total || 1} color="text-blue-500" /><ChannelStat icon={Smartphone} label="WhatsApp" count={results?.metrics?.channels?.whatsapp || 0} total={results?.metrics?.total || 1} color="text-green-500" /></div></div>
              <div><h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center"><span>Preview de Clientes</span><span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]">Amostra</span></h3><div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">{results?.matchedClients?.length > 0 ? (<ul className="divide-y divide-slate-100 dark:divide-slate-700">{results.matchedClients.slice(0, 5).map((client: any) => (<li key={client.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs">{client.name ? client.name.charAt(0) : 'C'}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{client.name}</p><p className="text-xs text-slate-500 dark:text-slate-400 truncate">{client.email}</p>{client.rfm && (<span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] border border-amber-100 dark:border-amber-900/40 font-semibold">{client.rfm}</span>)}</div><div className="text-xs text-slate-400">{client.city}</div></li>))}</ul>) : (<div className="p-8 text-center text-slate-400 flex flex-col items-center"><AlertCircle size={24} className="mb-2 opacity-50" /><p className="text-sm">Nenhum cliente encontrado.</p></div>)}</div></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}