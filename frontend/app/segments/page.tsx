"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Trash2, ChevronDown, Activity, ShoppingCart, 
  Search, CreditCard, Bell, User, CheckCircle2, XCircle, 
  ListFilter, UserCog, Fingerprint, Users, PieChart, 
  Sparkles, ArrowDown, Split, BarChart3, Mail, 
  MessageSquare, Smartphone, Wallet, RefreshCw, TrendingUp, 
  AlertCircle, Save, X, RefreshCcw, Lock, Gauge, Info, BookOpen, Lightbulb, Zap, HelpCircle, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';


// --- CONFIGURAÇÕES DE UI ---

const RFM_STATUSES = [
  { id: 'Champions', label: '🏆 Champions (VIPs)', desc: 'Compram muito e frequentemente' },
  { id: 'Leais', label: '💎 Leais', desc: 'Compram com frequência regular' },
  { id: 'Recentes', label: '🌱 Recentes', desc: 'Fizeram a primeira compra agora' },
  { id: 'Em Risco', label: '⚠️ Em Risco', desc: 'Não compram há mais de 3 meses' },
  { id: 'Hibernando', label: '💤 Hibernando', desc: 'Não compram há mais de 6 meses' },
  { id: 'Novos / Sem Dados', label: '👻 Sem Compras', desc: 'Cadastrados que nunca compraram' },
];

const UI_OPTIONS_INITIAL = {
  categories: [], 
  departments: [],
  products: [],
  campaigns: [],
  search_terms: [],
  cities: [],
  states: [],
  segments: [],
  gender: ['Masculino', 'Feminino', 'Outro', 'Não informado'],
  boolean: ['Sim (True)', 'Não (False)'],
  dates: ['Hoje', 'Ontem', 'Últimos 7 dias', 'Últimos 30 dias', 'Últimos 60 dias', 'Últimos 90 dias'],
};

const EVENT_CATEGORIES: any = {
  NAV: { label: 'Navegação / Site', icon: Activity },
  CHECKOUT: { label: 'Checkout', icon: ShoppingCart },
  SEARCH: { label: 'Busca e Intenção', icon: Search },
  TRANSACTION: { label: 'Pedido / Transação', icon: CreditCard },
  COMMUNICATION: { label: 'Comunicação / Notificações', icon: Bell },
  RELATION: { label: 'Cadastro / Relacionamento', icon: User },
};

const EVENTS_DB = [
  { id: 'acessou-home', label: 'Acessou Home', category: 'NAV' },
  { id: 'acessou-departamento', label: 'Acessou Departamento', category: 'NAV' },
  { id: 'acessou-categoria', label: 'Acessou Categoria', category: 'NAV' },
  { id: 'acessou-produto', label: 'Acessou Produto', category: 'NAV' },
  { id: 'acessou-carrinho', label: 'Acessou Carrinho', category: 'NAV' },
  { id: 'acessou-checkout-dados-pessoais', label: 'Checkout: Dados Pessoais', category: 'CHECKOUT' },
  { id: 'acessou-checkout-email', label: 'Checkout: Email', category: 'CHECKOUT' },
  { id: 'acessou-checkout-endereco-entrega', label: 'Checkout: Endereço', category: 'CHECKOUT' },
  { id: 'acessou-checkout-pagamento', label: 'Checkout: Pagamento', category: 'CHECKOUT' },
  { id: 'buscou-produto', label: 'Buscou Produto', category: 'SEARCH' },
  { id: 'adicionou-produto-ao-carrinho', label: 'Add Produto ao Carrinho', category: 'SEARCH' },
  { id: 'fez-pedido', label: 'Fez Pedido', category: 'TRANSACTION', hasContext: true },
  { id: 'fez-pedido-produto', label: 'Fez Pedido (Item)', category: 'TRANSACTION', hasContext: true },
  { id: 'comprou', label: 'Comprou (Faturado)', category: 'TRANSACTION', hasContext: true },
  { id: 'comprou-produto', label: 'Comprou Produto', category: 'TRANSACTION', hasContext: true },
  { id: 'devolveu', label: 'Devolveu Pedido', category: 'TRANSACTION', hasContext: true },
  { id: 'open-notification', label: 'Abriu Notificação', category: 'COMMUNICATION' },
  { id: 'click-notification', label: 'Clicou Notificação', category: 'COMMUNICATION' },
  { id: 'receive-email-notification', label: 'Recebeu Email', category: 'COMMUNICATION' },
  { id: 'recebeu-notificacao-sms', label: 'Recebeu SMS', category: 'COMMUNICATION' },
  { id: 'recebeu-contato', label: 'Recebeu Contato', category: 'COMMUNICATION' },
  { id: 'register', label: 'Cadastrou-se', category: 'RELATION' },
  { id: 'descadastrou-agenda', label: 'Opt-out Agenda', category: 'RELATION' },
  { id: 'descadastrou-notificacao', label: 'Opt-out Notificações', category: 'RELATION' },
  { id: 'nao-conseguiu-contato', label: 'Não conseguiu contato', category: 'RELATION' },
  { id: 'erro-entrega-notificacao', label: 'Erro Entrega (Bounce)', category: 'RELATION' },
  { id: 'reportou-spam', label: 'Reportou Spam', category: 'RELATION' },
];

const CONTEXT_OPTIONS = [
  { id: 'client', label: 'Por cliente (Geral)' },
  { id: 'order', label: 'No mesmo pedido' },
  { id: 'cart', label: 'No mesmo carrinho' },
  { id: 'date', label: 'Na mesma data' },
];

const OPERATORS: any = {
  string: [
    { id: 'equals', label: 'Igual a' },
    { id: 'not_equals', label: 'Diferente de' },
    { id: 'contains', label: 'Contém' },
    { id: 'is_set', label: 'Preenchido', noValue: true },
  ],
  number: [
    { id: 'equals', label: 'Igual a' },
    { id: 'greater_than', label: 'Maior que' },
    { id: 'less_than', label: 'Menor que' },
  ],
  date: [
    { id: 'equals', label: 'Igual a' },
    { id: 'greater_than', label: 'Depois de' },
    { id: 'less_than', label: 'Antes de' },
  ],
  boolean: [
    { id: 'is', label: 'É igual a' }
  ]
};

const getEventById = (id: string) => EVENTS_DB.find(e => e.id === id);
const SELECT_CLASS = "block w-full text-sm border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white rounded-lg focus:ring-2 focus:ring-offset-1 transition-all shadow-sm py-2 px-3 font-medium text-gray-700 cursor-pointer outline-none";
const BTN_ICON_CLASS = "ml-auto p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors";

// --- SUB-COMPONENTES VISUAIS ---

const StatCard = ({ icon: Icon, label, value, color = "blue" }: any) => {
  const colorMap: any = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600" };
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
      <div className={`p-2 rounded-lg ${colorMap[color]}`}><Icon size={18} /></div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const ChannelStat = ({ icon: Icon, label, count, total, color }: any) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
      <div className={`p-1.5 rounded-md bg-white border shadow-sm ${color}`}><Icon size={14} /></div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-xs font-bold text-slate-900">{count} ({percent}%)</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color.replace('text-', 'bg-').replace('500', '500')}`} style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const RuleSelectionModal = ({ isOpen, onClose, onSelect }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Escolha o tipo de regra</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-6 grid gap-4 max-h-[70vh] overflow-y-auto">
          <button onClick={() => onSelect('rfm')} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50 transition-all group text-left cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Gauge size={24} /></div>
            <div><span className="block font-bold text-slate-800 text-lg">Ciclo de Vida (RFM)</span><span className="text-sm text-slate-500">Filtrar por status (ex: Champions, Em Risco)</span></div>
          </button>
          <button onClick={() => onSelect('behavioral')} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Activity size={24} /></div>
            <div><span className="block font-bold text-slate-800 text-lg">Comportamento</span><span className="text-sm text-slate-500">Baseado em ações (ex: Comprou, Visitou)</span></div>
          </button>
          <button onClick={() => onSelect('characteristic')} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><UserCog size={24} /></div>
            <div><span className="block font-bold text-slate-800 text-lg">Característica</span><span className="text-sm text-slate-500">Dados do perfil (ex: Cidade, Gênero)</span></div>
          </button>
          <button onClick={() => onSelect('segment_ref')} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><PieChart size={24} /></div>
            <div><span className="block font-bold text-slate-800 text-lg">Segmento</span><span className="text-sm text-slate-500">Reutilizar um grupo já existente</span></div>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- BLOCOS DE REGRA COM BOTÃO DE EXCLUIR ---

const RfmBlock = ({ block, onUpdate, onRemove }: any) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-amber-100/50">
        <div className="bg-amber-100 p-2 rounded-lg text-amber-700 shadow-sm"><Gauge size={20} /></div>
        <div><span className="block text-xs font-bold text-amber-600 uppercase tracking-widest">Ciclo de Vida (RFM)</span></div>
        <button onClick={() => onRemove(block.id)} className={BTN_ICON_CLASS}><Trash2 size={18} /></button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
        <div className="flex-1 w-full relative">
          <label className="text-xs font-bold text-amber-800 uppercase mb-1 block ml-1">Status do Cliente</label>
          <div className="relative">
            <select 
                className={`${SELECT_CLASS} pl-3 border-amber-200 focus:border-amber-400 focus:ring-amber-500 h-[48px] font-semibold text-gray-800 bg-white`} 
                value={block.status} 
                onChange={(e) => onUpdate({ ...block, status: e.target.value })}
            >
                <option value="" disabled>Selecione um status...</option>
                {RFM_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          {block.status && <p className="text-xs text-amber-600/80 mt-2 ml-1">ℹ️ {RFM_STATUSES.find(s => s.id === block.status)?.desc}</p>}
        </div>
      </div>
    </div>
  );
};

const LogicConnector = ({ logicOperator, toggleLogic }: any) => (
  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center group/connector">
    <div className="h-4 w-0.5 bg-gray-200 absolute -top-4"></div>
    <div className="h-4 w-0.5 bg-gray-200 absolute -bottom-4"></div>
    <button onClick={toggleLogic} className={`relative z-20 px-4 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 ${logicOperator === 'OR' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
      {logicOperator === 'OR' ? <Split size={12} /> : <ListFilter size={12} />} {logicOperator === 'OR' ? 'OU' : 'E'}
    </button>
  </div>
);

const DynamicValueInput = ({ type, value, onChange, options, disabled, placeholder }: any) => {
  if (type === 'boolean') {
    return (
      <div className="relative">
        <select className={`${SELECT_CLASS} appearance-none pr-8`} value={value} onChange={onChange} disabled={disabled}>
          <option value="" disabled>Selecione...</option><option value="true">Sim / Verdadeiro</option><option value="false">Não / Falso</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
      </div>
    );
  }
  if (options && options.length > 0) {
    return (
      <div className="relative w-full">
        <select className={`${SELECT_CLASS} appearance-none pr-8`} value={value} onChange={onChange} disabled={disabled}>
          <option value="" disabled>Selecione...</option>
          {options.map((opt: any, idx: number) => <option key={idx} value={opt}>{opt}</option>)}
        </select>
        <ListFilter size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
      </div>
    );
  }
  return <input type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'} className={`${SELECT_CLASS}`} placeholder={placeholder || 'Valor...'} value={value} onChange={onChange} disabled={disabled} />;
};


const TutorialModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Lado Esquerdo: Visual/Título */}
        <div className="bg-slate-900 text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <BookOpen size={24} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Como criar<br/>Segmentos?</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Guia rápido para dominar a criação de audiências inteligentes no seu CRM.
            </p>
          </div>
          
          <div className="relative z-10 mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-500" /> Segmentos Dinâmicos
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-500" /> Filtros de RFM
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-500" /> Comportamento
            </div>
          </div>

          <Sparkles className="absolute -bottom-10 -right-10 text-white opacity-5 w-64 h-64" />
        </div>

        {/* Lado Direito: Conteúdo */}
        <div className="flex-1 bg-white p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Lightbulb size={20} className="text-amber-500" /> Conceitos Principais
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-8">
            
            {/* Seção 1: Blocos */}
            <div className="flex gap-4">
              <div className="mt-1"><div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div></div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Tipos de Regra (Blocos)</h4>
                <p className="text-sm text-slate-500 mb-3">Você constrói um segmento adicionando "blocos" de regras. Existem 4 tipos:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg">
                    <span className="text-xs font-bold text-amber-700 block mb-1">RFM (Ciclo de Vida)</span>
                    <p className="text-[11px] text-slate-600">Classifica clientes automaticamente como "Champions", "Em Risco", etc.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                    <span className="text-xs font-bold text-blue-700 block mb-1">Comportamento</span>
                    <p className="text-[11px] text-slate-600">Ações que o cliente fez (ex: Comprou, Visitou site).</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg">
                    <span className="text-xs font-bold text-purple-700 block mb-1">Característica</span>
                    <p className="text-[11px] text-slate-600">Dados do perfil (Cidade, Gênero, E-mail).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 2: Dinâmico vs Estático */}
            <div className="flex gap-4">
              <div className="mt-1"><div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div></div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Dinâmico vs. Estático</h4>
                <div className="space-y-3 mt-2">
                  <div className="flex items-start gap-3">
                    <RefreshCcw size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-sm text-slate-800">Dinâmico (Recomendado):</span>
                      <p className="text-xs text-slate-500">A lista se atualiza sozinha. Se um cliente entrar na regra amanhã, ele entra na lista automaticamente.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock size={18} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-sm text-slate-800">Estático (Snapshot):</span>
                      <p className="text-xs text-slate-500">Tira uma "foto" da lista agora. Mesmo que os clientes mudem de comportamento, a lista não muda.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 3: Lógica E/OU */}
            <div className="flex gap-4">
              <div className="mt-1"><div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">3</div></div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Conectores (E / OU)</h4>
                <p className="text-sm text-slate-500">
                  Ao adicionar mais de uma regra, você verá um conector entre elas. Clique nele para alternar:
                </p>
                <div className="flex gap-4 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">E (AND)</span>
                  <span className="text-xs text-slate-500 flex items-center">O cliente deve cumprir TODAS as regras.</span>
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">OU (OR)</span>
                  <span className="text-xs text-slate-500 flex items-center">O cliente deve cumprir PELO MENOS UMA regra.</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200">
              Entendi, vamos começar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- BLOCO DE COMPORTAMENTO (AJUSTADO: SEM CONTEXTO, LAYOUT LIMPO) ---
const BehaviorBlock = ({ block, onUpdate, onRemove, uiOptions }: any) => {
  const propertiesAvailable = useMemo(() => {
      const event = EVENTS_DB.find(e => e.id === block.event);
      if (!event) return [];
      
      const definitions: any = {
        _STANDARD: [
            { id: 'date', label: 'Data', type: 'date', options: uiOptions.dates },
            // REMOVIDO: options: uiOptions.counts
            { id: 'count', label: 'Frequência', type: 'number' }, 
        ],
        NAV: [
            { id: 'device', label: 'Dispositivo', type: 'string', options: ['mobile', 'desktop'] },
            { id: 'nome_categoria', label: 'Nome da Categoria', type: 'string', options: uiOptions.categories },
            { id: 'nome_departamento', label: 'Nome do Departamento', type: 'string', options: uiOptions.departments },
        ],
        TRANSACTION: [
            { id: 'produto_id', label: 'Nome do Produto', type: 'string', options: uiOptions.products },
            { id: 'categoria', label: 'Categoria', type: 'string', options: uiOptions.categories },
            // REMOVIDO: options: uiOptions.prices (Agora é livre)
            { id: 'subtotal', label: 'Valor (R$)', type: 'number' }, 
            { id: 'total', label: 'Total Pedido (R$)', type: 'number' },
            // REMOVIDO: options: uiOptions.counts
            { id: 'quantidade_produtos', label: 'Qtd. Produtos', type: 'number' }, 
        ],
        COMMUNICATION: [
            { id: 'campaign_id', label: 'ID da Campanha', type: 'string', options: uiOptions.campaigns },
            { id: 'subject', label: 'Assunto', type: 'string', options: uiOptions.search_terms }
        ],
        SEARCH: [
            { id: 'termo_busca', label: 'Termo buscado', type: 'string', options: uiOptions.search_terms },
            { id: 'total_resultados', label: 'Total de Resultados', type: 'number', options: uiOptions.counts } // Aqui talvez valha manter o count se for uma lista curta, ou remover também
        ]
      };

      let props = [...definitions._STANDARD];
      if (event.category === 'NAV') props = [...props, ...definitions.NAV];
      else if (['TRANSACTION', 'CHECKOUT'].includes(event.category) || event.id.includes('produto')) props = [...props, ...definitions.TRANSACTION];
      else if (event.category === 'SEARCH') props = [...props, ...definitions.SEARCH];
      else if (event.category === 'COMMUNICATION') props = [...props, ...definitions.COMMUNICATION];
      return props;
  }, [block.event, uiOptions]);

  const handleUpdateFilter = (idx: number, updated: any) => {
    const newFilters = [...block.filters]; newFilters[idx] = updated; onUpdate({ ...block, filters: newFilters });
  };

  return (
    <div className="p-6 relative">
      {/* CABEÇALHO: TIPO + EVENTO + EXCLUIR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        
        {/* Toggle: Fizeram / Não Fizeram */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button onClick={() => onUpdate({ ...block, type: 'did' })} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${block.type === 'did' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><CheckCircle2 size={14} /> Fizeram</button>
          <button onClick={() => onUpdate({ ...block, type: 'did_not' })} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${block.type === 'did_not' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><XCircle size={14} /> Não fizeram</button>
        </div>

        {/* Dropdown de Evento */}
        <div className="relative flex-1 w-full sm:w-auto min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500"><Activity size={18} /></div>
          <select 
            className={`${SELECT_CLASS} pl-10 border-blue-100 focus:border-blue-300 focus:ring-blue-500 h-[40px] font-semibold text-gray-800`} 
            value={block.event} 
            onChange={(e) => onUpdate({ ...block, event: e.target.value, filters: [] })}
          >
            <option value="" disabled>Selecione um evento...</option>
            {Object.keys(EVENT_CATEGORIES).map(catKey => (
              <optgroup key={catKey} label={EVENT_CATEGORIES[catKey].label}>
                {EVENTS_DB.filter(e => e.category === catKey).map(ev => <option key={ev.id} value={ev.id}>{ev.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Botão Excluir (Alinhado à direita com ml-auto) */}
        <button 
            onClick={() => onRemove(block.id)} 
            className="ml-auto p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            title="Remover regra"
        >
            <Trash2 size={18} />
        </button>
      </div>

      {/* ÁREA DE FILTROS (PROPRIEDADES) */}
      {block.event && (
        <div className="ml-2 pl-4 border-l-2 border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {block.filters.length === 0 && (
                <div className="text-xs text-slate-400 italic mb-2">Nenhum filtro aplicado (considerando todos).</div>
            )}

            {block.filters.map((filter: any, idx: number) => {
               const selectedProp = propertiesAvailable.find(p => p.id === filter.field);
               const type = selectedProp?.type || 'string';
               const ops = OPERATORS[type] || OPERATORS.string;
               const opDef = ops.find((o: any) => o.id === filter.operator);
               
               return (
                <div key={filter.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 group hover:border-blue-200 transition-colors">
                  <div className="flex-1 w-full sm:w-auto flex gap-2">
                    {/* Select Propriedade */}
                    <select className={`${SELECT_CLASS} py-1.5 text-xs focus:ring-blue-500`} value={filter.field} onChange={(e) => handleUpdateFilter(idx, { ...filter, field: e.target.value, operator: '', value: '' })}>
                      <option value="" disabled>Propriedade</option>
                      {propertiesAvailable.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                    {/* Select Operador */}
                    <select className={`${SELECT_CLASS} w-[110px] py-1.5 text-xs focus:ring-blue-500`} value={filter.operator} onChange={(e) => handleUpdateFilter(idx, { ...filter, operator: e.target.value })} disabled={!filter.field}>
                      <option value="" disabled>Operador</option>
                      {ops.map((op: any) => <option key={op.id} value={op.id}>{op.label}</option>)}
                    </select>
                  </div>
                  
                  {/* Input Valor (Dinâmico) */}
                  {!opDef?.noValue && (
                    <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[150px]">
                      <DynamicValueInput type={type} value={filter.value} options={selectedProp?.options} onChange={(e: any) => handleUpdateFilter(idx, { ...filter, value: e.target.value })} disabled={!filter.operator} />
                    </div>
                  )}
                  
                  {/* Remover Filtro Específico */}
                  <button onClick={() => onUpdate({ ...block, filters: block.filters.filter((_: any, i: number) => i !== idx) })} className="text-slate-300 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><Trash2 size={14} /></button>
                </div>
               );
            })}
          
          <button onClick={() => onUpdate({ ...block, filters: [...block.filters, { id: Date.now(), field: '', operator: '', value: '' }] })} className="group flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 font-bold px-3 py-2 rounded-lg hover:bg-blue-50 transition-all mt-2">
            <div className="bg-slate-200 group-hover:bg-blue-200 text-slate-500 group-hover:text-blue-600 rounded p-0.5 transition-colors"><Plus size={12} /></div> 
            Adicionar filtro
          </button>
        </div>
      )}
    </div>
  );
};

const CharacteristicBlock = ({ block, onUpdate, onRemove, uiOptions }: any) => {
  const CUSTOMER_FIELDS_DYNAMIC = useMemo(() => [
    { id: 'name', label: 'Nome Completo', type: 'string' },
    { id: 'email', label: 'E-mail', type: 'string' },
    { id: 'city', label: 'Cidade', type: 'string', options: uiOptions.cities },
    { id: 'state', label: 'Estado', type: 'string', options: uiOptions.states },
    { id: 'gender', label: 'Gênero', type: 'string', options: uiOptions.gender },
    { id: 'has_android', label: 'Possui Android', type: 'boolean' },
  ], [uiOptions]);

  const selectedField = CUSTOMER_FIELDS_DYNAMIC.find(f => f.id === block.field);
  const inputType = selectedField?.type || 'string';
  const operators = OPERATORS[inputType] || OPERATORS.string;
  const currentOpDef = operators.find((op: any) => op.id === block.operator);
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-purple-100/50">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-700 shadow-sm"><UserCog size={20} /></div>
        <div><span className="block text-xs font-bold text-purple-600 uppercase tracking-widest">Característica</span></div>
        <button onClick={() => onRemove(block.id)} className={BTN_ICON_CLASS}><Trash2 size={18} /></button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1">
          <div className="relative">
            <select className={`${SELECT_CLASS} pl-9 border-purple-100 focus:border-purple-300 focus:ring-purple-500`} value={block.field} onChange={(e) => onUpdate({ ...block, field: e.target.value, operator: '', value: '' })}>
              <option value="" disabled>Selecione um atributo...</option>
              {CUSTOMER_FIELDS_DYNAMIC.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
            <Fingerprint size={16} className="absolute left-3 top-3 text-purple-400 pointer-events-none" />
          </div>
        </div>
        <div className="w-full md:w-[180px]">
          <select className={`${SELECT_CLASS} border-purple-100 focus:border-purple-300 focus:ring-purple-500`} value={block.operator} onChange={(e) => onUpdate({ ...block, operator: e.target.value })} disabled={!block.field}>
            <option value="" disabled>Operador</option>
            {operators.map((op: any) => <option key={op.id} value={op.id}>{op.label}</option>)}
          </select>
        </div>
        {!currentOpDef?.noValue && (
          <div className="w-full md:flex-1">
             <DynamicValueInput type={inputType} value={block.value} options={selectedField?.options} onChange={(e: any) => onUpdate({ ...block, value: e.target.value })} disabled={!block.operator} placeholder="Valor..." />
          </div>
        )}
      </div>
    </div>
  );
};

const SegmentReferenceBlock = ({ block, onUpdate, onRemove, uiOptions }: any) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-teal-100/50">
        <div className="bg-teal-100 p-2 rounded-lg text-teal-700 shadow-sm"><PieChart size={20} /></div>
        <div><span className="block text-xs font-bold text-teal-600 uppercase tracking-widest">Segmento</span></div>
        <button onClick={() => onRemove(block.id)} className={BTN_ICON_CLASS}><Trash2 size={18} /></button>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
        <div className="flex bg-white p-1 rounded-lg shrink-0 shadow-sm w-full md:w-auto">
          <button onClick={() => onUpdate({ ...block, relation: 'in' })} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${block.relation === 'in' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><CheckCircle2 size={16} /> Faz parte</button>
          <button onClick={() => onUpdate({ ...block, relation: 'not_in' })} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${block.relation === 'not_in' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><XCircle size={16} /> Não faz parte</button>
        </div>
        <div className="flex-1 w-full relative">
          <Users size={18} className="absolute left-3 top-3 text-teal-500 pointer-events-none" />
          <select className={`${SELECT_CLASS} pl-10 border-teal-200 focus:border-teal-400 focus:ring-teal-500 h-[42px] font-semibold text-gray-700 bg-white`} value={block.segment_id} onChange={(e) => onUpdate({ ...block, segment_id: e.target.value })}>
            <option value="" disabled>Selecione um segmento...</option>
            {uiOptions.segments && uiOptions.segments.map((seg: any) => <option key={seg.id} value={seg.id}>{seg.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

export default function SegmentsPage() {
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

  useEffect(() => {
    async function fetchOptions() {
        try {
            const res = await fetch('http://localhost:3000/webhook/crm/intelligence/filters');
            if (res.ok) {
                const data = await res.json();
                setFilterOptions(prev => ({
                    ...prev,
                    cities: data.cities || [],
                    states: data.states || [],
                    products: data.products || [],
                    categories: data.categories || [],
                    departments: data.departments || [],
                    campaigns: data.campaigns || [],
                    search_terms: data.search_terms || [],
                    segments: data.segments || []
                }));
            }
        } catch (e) { console.error("Erro ao carregar filtros:", e); }
    }
    fetchOptions();
  }, []);

  useEffect(() => {
    if (blocks.length === 0) { setResults(null); return; }
    setIsCalculating(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:3000/webhook/crm/intelligence/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

  const updateBlock = (index: number, updatedBlock: any) => {
    const newBlocks = [...blocks]; newBlocks[index] = updatedBlock; setBlocks(newBlocks);
  };
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
    if (!segmentName.trim()) { alert('Dê um nome.'); return; }
    if (blocks.length === 0) { alert('Adicione regras.'); return; }

    const hasInvalidBlock = blocks.some(block => {
      if (block.category === 'rfm') return !block.status;
      if (block.category === 'behavioral') return !block.event;
      if (block.category === 'characteristic') return !block.field || !block.operator;
      if (block.category === 'segment_ref') return !block.segment_id;
      return false;
    });

    if (hasInvalidBlock) { alert('Preencha todas as regras.'); return; }

    setIsSaving(true); setSaveStatus('saving');
    try {
      const response = await fetch('http://localhost:3000/webhook/crm/intelligence/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: segmentName, rules: blocks, isDynamic: isDynamic }),
      });
      if (!response.ok) throw new Error(response.status === 409 ? 'NOME_DUPLICADO' : 'ERRO');
      setSaveStatus('success');
      setTimeout(() => { setSaveStatus('idle'); setIsSaving(false); setSegmentName(''); setBlocks([]); setIsDynamic(true); }, 2000);
    } catch (e: any) { setIsSaving(false); alert(e.message === 'NOME_DUPLICADO' ? 'Nome já existe' : 'Erro ao salvar'); }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Link href="/segments/list" className="hover:text-indigo-600 transition-colors" title="Voltar para lista">
                <ArrowLeft size={18} />
            </Link>
            <span>CRM / Marketing / <span className="font-semibold text-indigo-600">Criar Segmento</span></span>
          </div>
            <div className="flex items-center gap-4">
              {/* BOTÃO DE TUTORIAL */}
              <button onClick={() => setIsTutorialOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold mr-2">
                  <BookOpen size={16} className="text-indigo-500" /> Como usar?
              </button>
              <Bell className="text-gray-400 cursor-pointer hover:text-indigo-600" size={20} />
            </div>  
        </header>

        <div className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 overflow-y-auto px-6 py-8 bg-slate-50/80">
                <div className="max-w-3xl mx-auto pb-32">
                   
                   <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
                   <RuleSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={addBlock} />

                   <div className="mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                          <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            <Fingerprint className="text-blue-600" size={14} />
                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Builder Conectado</span>
                          </div>
                          <button onClick={handleSave} disabled={isSaving || saveStatus === 'success'} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${saveStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                              {saveStatus === 'success' ? <><CheckCircle2 size={16} /> Salvo!</> : <>{isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? 'Salvando...' : 'Salvar Segmento'}</>}
                          </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome do Segmento</label>
                          <input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)} placeholder="Ex: Clientes VIPs" className="block w-full text-2xl font-extrabold text-slate-900 bg-transparent border-0 border-b-2 border-slate-100 focus:ring-0 px-1 py-2" />
                        </div>

                        {/* --- CARD DINÂMICO/ESTÁTICO RICO (RESTAURADO) --- */}
                        <div 
                          className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => setIsDynamic(!isDynamic)}
                        >
                           <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                {isDynamic ? <RefreshCcw size={16} className="text-indigo-600" /> : <Lock size={16} className="text-amber-600" />}
                                {isDynamic ? 'Segmento Dinâmico' : 'Lista Estática (Snapshot)'}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {isDynamic 
                                  ? 'A lista é atualizada automaticamente conforme clientes mudam.' 
                                  : 'A lista é congelada com os clientes de hoje. Não muda.'}
                              </p>
                           </div>
                           <button 
                              type="button"
                              className={`
                                relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out 
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                                ${isDynamic ? 'bg-indigo-600' : 'bg-slate-300'}
                              `}
                           >
                              <span 
                                className={`
                                  absolute top-1/2 left-1 bg-white w-5 h-5 rounded-full shadow 
                                  transform -translate-y-1/2 transition-transform duration-200 ease-in-out
                                  ${isDynamic ? 'translate-x-5' : 'translate-x-0'}
                                `} 
                              />
                           </button>
                        </div>
                      </div>
                   </div>

                   {/* LISTA DE BLOCOS */}
                   <div className="space-y-10 relative min-h-[200px]">
                      <div className="absolute left-1/2 top-4 bottom-20 w-px bg-slate-200 -translate-x-1/2 z-[-1] hidden md:block"></div>
                      
                      {blocks.length === 0 ? (
                        <div className="text-center py-12 opacity-60 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50 hover:bg-white hover:opacity-100 transition-all cursor-pointer" onClick={() => setIsModalOpen(true)}>
                           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500"><Plus size={32} /></div>
                           <h3 className="text-lg font-bold text-slate-700">Comece seu segmento</h3><p className="text-slate-500">Clique para adicionar a primeira regra.</p>
                        </div>
                      ) : (
                        blocks.map((block, index) => (
                          <div key={block.id} className="relative group">
                              {index > 0 && <LogicConnector logicOperator={block.logicOperator} toggleLogic={() => updateBlock(index, { ...block, logicOperator: block.logicOperator === 'AND' ? 'OR' : 'AND' })} />}
                              <div className={`rounded-2xl overflow-hidden ${getBlockStyle(block.category, block.logicOperator === 'OR', index > 0)}`}>
                                  {block.category === 'behavioral' && <BehaviorBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}
                                  {block.category === 'characteristic' && <CharacteristicBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}
                                  {block.category === 'segment_ref' && <SegmentReferenceBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} uiOptions={filterOptions} />}
                                  {block.category === 'rfm' && <RfmBlock block={block} onUpdate={(u: any) => updateBlock(index, u)} onRemove={() => removeBlock(block.id)} />}
                              </div>
                          </div>
                        ))
                      )}

                      <div className="relative pt-6 pb-12">
                         <div className="flex flex-col items-center justify-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => setIsModalOpen(true)}>Adicionar regra</span>
                            <ArrowDown size={16} className="text-slate-300 animate-bounce" />
                         </div>
                         <div className="mt-4 flex justify-center">
                            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all font-bold text-slate-700">
                              <Plus size={18} className="text-slate-400" /> Nova Regra
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
            </div>

            {/* --- PREVIEW LATERAL RICO (RESTAURADO) --- */}
            <div className="w-[400px] bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-20 shrink-0">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="text-slate-400" size={20} /> Impacto Estimado</h2>
                  {isCalculating && <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse"><RefreshCw size={12} className="animate-spin" /> Calculando...</div>}
               </div>
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-lg">
                     <div className="relative z-10">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Alcance Total</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-extrabold tracking-tight">{results?.metrics?.total || 0}</span>
                           <span className="text-sm font-medium text-emerald-400">({results?.metrics?.percent || 0}%)</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">clientes da base total</p>
                     </div>
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
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                    <span>Preview de Clientes</span><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">Amostra</span></h3>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {results?.matchedClients?.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                        {results.matchedClients.slice(0, 5).map((client: any) => (
                            <li key={client.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{client.name ? client.name.charAt(0) : 'C'}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{client.name}</p>
                                <p className="text-xs text-slate-500 truncate">{client.email}</p>
                                {/* TAG RFM RESTAURADA E ESTILIZADA */}
                                {client.rfm && (
                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] border border-amber-100 font-semibold">
                                        {client.rfm}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-400">{client.city}</div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-slate-400 flex flex-col items-center"><AlertCircle size={24} className="mb-2 opacity-50" /><p className="text-sm">Nenhum cliente encontrado.</p></div>
                    )}
                    </div>
                </div>
               </div>
            </div>
        </div>
      </main>
    </div>
  );
}