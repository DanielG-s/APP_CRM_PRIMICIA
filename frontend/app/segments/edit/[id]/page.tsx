"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus, Bell, Fingerprint, Sparkles, ArrowDown, BarChart3, Mail,
  Smartphone, Wallet, RefreshCw, TrendingUp, AlertCircle, Save,
  RefreshCcw, Lock, BookOpen, Lightbulb, ArrowLeft, X, CheckCircle2,
  // Novos ícones para o tutorial
  Target, Layers, Calculator, Check
} from 'lucide-react';
import Link from 'next/link';

import { UI_OPTIONS_INITIAL } from '../../shared/constants';
import {
  StatCard, ChannelStat, RuleSelectionModal, LogicConnector,
  RfmBlock, BehaviorBlock, CharacteristicBlock, SegmentReferenceBlock
} from '../../shared/components';
import { API_BASE_URL } from '@/lib/config';
import { useAuth, useUser } from "@clerk/nextjs";

// --- MODAL DE TUTORIAL MASTERCLASS (EDIÇÃO) ---
const EditTutorialModal = ({ isOpen, onClose }: any) => {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const tutorials = [
    {
      badge: "Otimização",
      title: "Refine sua Estratégia",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-lg">
            Segmentos vivos trazem melhores resultados. Use este espaço para <strong>ajustar a precisão</strong> do seu público baseado no feedback das últimas campanhas.
          </p>
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex gap-3 items-center">
            <Target className="text-indigo-600 shrink-0" size={20} />
            <div className="text-sm text-indigo-800">
              <strong>Objetivo:</strong> Tente manter o público qualificado, não apenas numeroso.
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
      title: "Ajuste de Regras",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Adicione novas condições ou remova as que não fazem mais sentido. Lembre-se da hierarquia:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-xs">E (AND)</div>
              <span className="text-sm text-slate-600">Restringe o público (Ex: Mora em SP <strong>E</strong> Comprou ontem).</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded text-xs">OU (OR)</div>
              <span className="text-sm text-slate-600">Expande o público (Ex: Comprou Camisa <strong>OU</strong> Comprou Calça).</span>
            </div>
          </div>
        </div>
      ),
      icon: <Layers size={56} className="text-white" />,
      color: "bg-emerald-600",
      bgElement: "bg-emerald-400"
    },
    {
      badge: "Segurança",
      title: "Simule antes de Salvar",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Qualquer alteração nas regras reflete imediatamente no <strong>Painel Lateral</strong> à direita.
          </p>
          <ul className="space-y-2 text-sm text-slate-700 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-amber-600" /> Verifique se a <strong>Receita Estimada</strong> caiu muito.</li>
            <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-amber-600" /> Confirme se ainda há <strong>Canais de Contato</strong> (Email/Zap).</li>
          </ul>
        </div>
      ),
      icon: <Calculator size={56} className="text-white" />,
      color: "bg-amber-500",
      bgElement: "bg-amber-300"
    }
  ];

  const currentStep = tutorials[step];

  const handleNext = () => {
    if (step < tutorials.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    // Salva com uma chave específica para EDIÇÃO
    if (dontShowAgain) localStorage.setItem('crm_segment_edit_tutorial_hide', 'true');
    else localStorage.removeItem('crm_segment_edit_tutorial_hide');
    onClose();
    setTimeout(() => setStep(0), 300);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">

        {/* LADO ESQUERDO */}
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

        {/* LADO DIREITO */}
        <div className="flex-1 p-10 flex flex-col justify-between relative bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>

          <div className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300" key={step}>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">{currentStep.title}</h2>
            {currentStep.content}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {tutorials.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 ' + currentStep.color.replace('bg-', 'bg-') : 'w-2 bg-slate-200'}`}></div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {step > 0 ? (
                  <button onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors">Voltar</button>
                ) : (
                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setDontShowAgain(!dontShowAgain)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-slate-800 border-slate-800' : 'border-slate-300'}`}>
                      {dontShowAgain && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 select-none">Não mostrar mais</span>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-0.5 transition-all ${step === tutorials.length - 1 ? 'bg-slate-900 hover:bg-slate-800' : currentStep.color + ' hover:opacity-90'}`}
                >
                  {step === tutorials.length - 1 ? 'Voltar a Editar' : 'Próximo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

export default function EditSegmentPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const segmentId = params.id as string;

  const [blocks, setBlocks] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [segmentName, setSegmentName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDynamic, setIsDynamic] = useState(true);
  const [filterOptions, setFilterOptions] = useState(UI_OPTIONS_INITIAL);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State do Tutorial
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // EFEITO: ABRE TUTORIAL (Se não estiver escondido)
  useEffect(() => {
    const userHidEditTutorial = localStorage.getItem('crm_segment_edit_tutorial_hide');
    // Só abre o tutorial depois que os dados carregarem, para não poluir a tela de loading
    if (!isLoadingData && userHidEditTutorial !== 'true') {
      setIsTutorialOpen(true);
    }
  }, [isLoadingData]);

  // CARREGAR DADOS
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Carrega opções de filtro
        const token = await getToken();
        const resFilters = await fetch(`${API_BASE_URL}/webhook/crm/intelligence/filters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resFilters.ok) {
          const data = await resFilters.json();
          setFilterOptions(prev => ({ ...prev, ...data, segments: data.segments || [] }));
        }

        // 2. Carrega o segmento
        if (segmentId) {
          const resSegment = await fetch(`${API_BASE_URL}/webhook/crm/intelligence/segments/${segmentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resSegment.ok) {
            const segment = await resSegment.json();

            setSegmentName(segment.name);
            setIsDynamic(segment.isDynamic);

            // --- CORREÇÃO AQUI ---
            if (Array.isArray(segment.rules)) {
              // Garante que cada regra tenha um ID único para o React não reclamar
              const rulesWithIds = segment.rules.map((rule: any) => ({
                ...rule,
                id: rule.id || crypto.randomUUID() // Gera ID se faltar
              }));
              setBlocks(rulesWithIds);
            }
          } else {
            alert("Segmento não encontrado");
            router.push('/segments/list');
          }
        }
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchData();
  }, [segmentId, router, getToken]);

  // ENGINE (PREVIEW)
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

  // CRUD BLOCOS
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
    let styles = "bg-white border transition-all duration-300 relative z-0";
    if (category === 'behavioral') styles += " border-blue-100 shadow-sm hover:shadow-blue-100 hover:border-blue-200";
    else if (category === 'characteristic') styles += " border-purple-100 shadow-sm hover:shadow-purple-100 hover:border-purple-200";
    else if (category === 'segment_ref') styles += " border-teal-100 shadow-sm hover:shadow-teal-100 hover:border-teal-200";
    else if (category === 'rfm') styles += " border-amber-100 shadow-sm hover:shadow-amber-100 hover:border-amber-200";
    if (isOrLogic && isNotFirst) styles += " ring-2 ring-orange-100 border-orange-300";
    return styles;
  };

  const handleSave = async () => {
    if (!segmentName.trim()) { alert('Dê um nome ao segmento.'); return; }
    if (blocks.length === 0) { alert('Adicione regras.'); return; }
    setIsSaving(true); setSaveStatus('saving');
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/webhook/crm/intelligence/segments/${segmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: segmentName, rules: blocks, isDynamic: isDynamic }),
      });
      if (!response.ok) throw new Error(response.status === 409 ? 'NOME_DUPLICADO' : 'ERRO');
      setSaveStatus('success');
      setTimeout(() => { setSaveStatus('idle'); setIsSaving(false); router.push('/segments/list'); }, 1500);
    } catch (e: any) { setIsSaving(false); alert(e.message === 'NOME_DUPLICADO' ? 'Nome já existe' : 'Erro ao salvar'); }
  };

  if (isLoadingData) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400">Carregando...</div>;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      <main className="flex-1 flex flex-col h-screen overflow-hidden ml-20 md:ml-64 transition-all duration-300">

        <EditTutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Link href="/segments/list" className="hover:text-indigo-600 transition-colors"><ArrowLeft size={18} /></Link>
            <span>CRM / Marketing / <span className="font-semibold text-indigo-600">Editar Segmento</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsTutorialOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold mr-2 cursor-pointer">
              <BookOpen size={16} className="text-indigo-500" /> Como usar?
            </button>
            <Bell className="text-gray-400 cursor-pointer hover:text-indigo-600" size={20} />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-y-auto px-6 py-8 bg-slate-50/80">
            <div className="max-w-3xl mx-auto pb-32">

              <RuleSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={addBlock} />

              <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <Fingerprint className="text-blue-600" size={14} />
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Modo Edição</span>
                  </div>
                  <button onClick={handleSave} disabled={isSaving || saveStatus === 'success'} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${saveStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {saveStatus === 'success' ? <><CheckCircle2 size={16} /> Salvo!</> : <>{isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? 'Salvando...' : 'Salvar Alterações'}</>}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome do Segmento</label>
                    <input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)} placeholder="Ex: Clientes VIPs" className="block w-full text-2xl font-extrabold text-slate-900 bg-transparent border-0 border-b-2 border-slate-100 focus:ring-0 px-1 py-2" />
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setIsDynamic(!isDynamic)}>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">{isDynamic ? <RefreshCcw size={16} className="text-indigo-600" /> : <Lock size={16} className="text-amber-600" />}{isDynamic ? 'Segmento Dinâmico' : 'Lista Estática (Snapshot)'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{isDynamic ? 'A lista é atualizada automaticamente.' : 'A lista é congelada.'}</p>
                    </div>
                    <button type="button" className={`relative w-12 h-7 rounded-full transition-colors ${isDynamic ? 'bg-indigo-600' : 'bg-slate-300'}`}><span className={`absolute top-1/2 left-1 bg-white w-5 h-5 rounded-full shadow transform -translate-y-1/2 transition-transform ${isDynamic ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                  </div>
                </div>
              </div>

              <div className="space-y-10 relative min-h-[200px]">
                <div className="absolute left-1/2 top-4 bottom-20 w-px bg-slate-200 -translate-x-1/2 z-[-1] hidden md:block"></div>
                {blocks.length === 0 ? (
                  <div className="text-center py-12 opacity-60 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50 hover:bg-white hover:opacity-100 transition-all cursor-pointer" onClick={() => setIsModalOpen(true)}>
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500"><Plus size={32} /></div>
                    <h3 className="text-lg font-bold text-slate-700">Edite seu segmento</h3><p className="text-slate-500">Adicione ou remova regras abaixo.</p>
                  </div>
                ) : (
                  blocks.map((block, index) => (
                    <div key={block.id} className="relative group">
                      {index > 0 && <LogicConnector logicOperator={block.logicOperator} toggleLogic={() => updateBlock(index, { ...block, logicOperator: block.logicOperator === 'AND' ? 'OR' : 'AND' })} />}
                      <div className={`rounded-2xl overflow-hidden ${getBlockStyle(block.category, block.logicOperator === 'OR', index > 0)}`}>
                        {block.category === 'behavioral' && <BehaviorBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}
                        {block.category === 'characteristic' && <CharacteristicBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}
                        {block.category === 'segment_ref' && <SegmentReferenceBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}
                        {block.category === 'rfm' && <RfmBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}
                      </div>
                    </div>
                  ))
                )}
                <div className="relative pt-6 pb-12">
                  <div className="flex flex-col items-center justify-center gap-3"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => setIsModalOpen(true)}>Adicionar regra</span><ArrowDown size={16} className="text-slate-300 animate-bounce" /></div>
                  <div className="mt-4 flex justify-center"><button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all font-bold text-slate-700"><Plus size={18} className="text-slate-400" /> Nova Regra</button></div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[400px] bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-20 shrink-0">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="text-slate-400" size={20} /> Impacto Estimado</h2>
              {isCalculating && <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse"><RefreshCw size={12} className="animate-spin" /> Calculando...</div>}
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-lg">
                <div className="relative z-10"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Alcance Total</p><div className="flex items-baseline gap-2"><span className="text-4xl font-extrabold tracking-tight">{results?.metrics?.total || 0}</span><span className="text-sm font-medium text-emerald-400">({results?.metrics?.percent || 0}%)</span></div><p className="text-xs text-slate-500 mt-2">clientes da base total</p></div>
                <Sparkles className="absolute right-[-20px] top-[-20px] text-white opacity-5" size={120} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Wallet} label="Receita Est." value={`R$ ${(results?.metrics?.revenue?.total || 0).toLocaleString('pt-BR')}`} color="green" />
                <StatCard icon={TrendingUp} label="Ticket Médio" value={`R$ ${(results?.metrics?.revenue?.orders_count > 0 ? results.metrics.revenue.total / results.metrics.revenue.orders_count : 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} color="blue" />
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Canais Habilitados</h3>
                <div className="space-y-1">
                  <ChannelStat icon={Mail} label="E-mail" count={results?.metrics?.channels?.email || 0} total={results?.metrics?.total || 1} color="text-blue-500" />
                  <ChannelStat icon={Smartphone} label="WhatsApp" count={results?.metrics?.channels?.whatsapp || 0} total={results?.metrics?.total || 1} color="text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center"><span>Preview de Clientes</span><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">Amostra</span></h3>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {results?.matchedClients?.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {results.matchedClients.slice(0, 5).map((client: any) => (
                        <li key={client.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{client.name ? client.name.charAt(0) : 'C'}</div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 truncate">{client.name}</p><p className="text-xs text-slate-500 truncate">{client.email}</p>{client.rfm && (<span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] border border-amber-100 font-semibold">{client.rfm}</span>)}</div>
                          <div className="text-xs text-slate-400">{client.city}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (<div className="p-8 text-center text-slate-400 flex flex-col items-center"><AlertCircle size={24} className="mb-2 opacity-50" /><p className="text-sm">Nenhum cliente encontrado.</p></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}