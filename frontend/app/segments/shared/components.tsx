"use client";

import React, { useMemo } from 'react';
import {
  X, Gauge, Activity, UserCog, PieChart, Trash2, Plus,
  CheckCircle2, XCircle, Split, ListFilter, ChevronDown, Fingerprint, Users,
  BarChart3, RefreshCw, Sparkles, Wallet, TrendingUp, Mail, Smartphone, AlertCircle
} from 'lucide-react';
import {
  RFM_STATUSES, EVENT_CATEGORIES, EVENTS_DB, OPERATORS,
  SELECT_CLASS, BTN_ICON_CLASS, getEventById
} from './constants';

// --- VISUAL STATS ---
export const StatCard = ({ icon: Icon, label, value, color = "blue" }: any) => {
  const colorMap: any = { blue: "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400", green: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" };
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
      <div className={`p-2 rounded-lg ${colorMap[color]}`}><Icon size={18} /></div>
      <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p><p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p></div>
    </div>
  );
};

export const ChannelStat = ({ icon: Icon, label, count, total, color }: any) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
      <div className={`p-1.5 rounded-md bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm ${color}`}><Icon size={14} /></div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span><span className="text-xs font-bold text-slate-900 dark:text-slate-100">{count} ({percent}%)</span></div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color.replace('text-', 'bg-').replace('500', '500')}`} style={{ width: `${percent}%` }}></div></div>
      </div>
    </div>
  );
};

// --- PAINEL LATERAL (PREVIEW) ---
export const SegmentImpactPanel = ({ results, isCalculating, onClose, title }: any) => {
  return (
    <div className="w-[400px] bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-30 shrink-0 animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="text-slate-400" size={20} /> Impacto Atual</h2>{title && <p className="text-xs text-slate-500 mt-1 truncate max-w-[300px]">{title}</p>}</div>
        {onClose && (<button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>)}
      </div>
      {isCalculating && <div className="p-4 bg-blue-50 text-blue-700 text-sm font-bold flex items-center justify-center gap-2 animate-pulse"><RefreshCw size={16} className="animate-spin" /> Calculando dados em tempo real...</div>}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-lg">
          <div className="relative z-10"><p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Alcance Total</p><div className="flex items-baseline gap-2"><span className="text-4xl font-extrabold tracking-tight">{results?.metrics?.total || 0}</span><span className="text-sm font-medium text-emerald-400">({results?.metrics?.percent || 0}%)</span></div><p className="text-xs text-slate-500 mt-2">clientes da base total</p></div>
          <Sparkles className="absolute right-[-20px] top-[-20px] text-white opacity-5" size={120} />
        </div>
        <div className="grid grid-cols-2 gap-3"><StatCard icon={Wallet} label="Receita Est." value={`R$ ${(results?.metrics?.revenue?.total || 0).toLocaleString('pt-BR')}`} color="green" /><StatCard icon={TrendingUp} label="Ticket Médio" value={`R$ ${(results?.metrics?.revenue?.orders_count > 0 ? results.metrics.revenue.total / results.metrics.revenue.orders_count : 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} color="blue" /></div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Canais Habilitados</h3><div className="space-y-1"><ChannelStat icon={Mail} label="E-mail" count={results?.metrics?.channels?.email || 0} total={results?.metrics?.total || 1} color="text-blue-500" /><ChannelStat icon={Smartphone} label="WhatsApp" count={results?.metrics?.channels?.whatsapp || 0} total={results?.metrics?.total || 1} color="text-green-500" /></div></div>
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
  );
};

// --- LOGIC & INPUTS ---
export const LogicConnector = ({ logicOperator, toggleLogic }: any) => (
  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center group/connector">
    <div className="h-4 w-0.5 bg-gray-200 dark:bg-gray-700 absolute -top-4"></div><div className="h-4 w-0.5 bg-gray-200 dark:bg-gray-700 absolute -bottom-4"></div>
    <button onClick={toggleLogic} className={`relative z-20 px-4 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 ${logicOperator === 'OR' ? 'bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'}`}>{logicOperator === 'OR' ? <Split size={12} /> : <ListFilter size={12} />} {logicOperator === 'OR' ? 'OU' : 'E'}</button>
  </div>
);

export const DynamicValueInput = ({ type, value, onChange, options, disabled, placeholder }: any) => {
  if (type === 'boolean') return (<div className="relative"><select className={`${SELECT_CLASS} appearance-none pr-8`} value={value} onChange={onChange} disabled={disabled}><option value="" disabled>Selecione...</option><option value="true">Sim / Verdadeiro</option><option value="false">Não / Falso</option></select><ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" /></div>);
  if (options && options.length > 0) return (<div className="relative w-full"><select className={`${SELECT_CLASS} appearance-none pr-8`} value={value} onChange={onChange} disabled={disabled}><option value="" disabled>Selecione...</option>{options.map((opt: any, idx: number) => <option key={idx} value={opt}>{opt}</option>)}</select><ListFilter size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" /></div>);
  return <input type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'} className={`${SELECT_CLASS}`} placeholder={placeholder || 'Valor...'} value={value} onChange={onChange} disabled={disabled} />;
};

// --- MODAL DE SELEÇÃO DE REGRA ---
export const RuleSelectionModal = ({ isOpen, onClose, onSelect }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative border dark:border-slate-800">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50"><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Escolha o tipo de regra</h3><button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"><X size={20} /></button></div>
        <div className="p-6 grid gap-4 max-h-[70vh] overflow-y-auto">
          <button onClick={() => onSelect('rfm')} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group text-left cursor-pointer"><div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Gauge size={24} /></div><div><span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">Ciclo de Vida (RFM)</span><span className="text-sm text-slate-500 dark:text-slate-400">Filtrar por status (ex: Champions, Em Risco)</span></div></button>
          <button onClick={() => onSelect('behavioral')} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group text-left cursor-pointer"><div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Activity size={24} /></div><div><span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">Comportamento</span><span className="text-sm text-slate-500 dark:text-slate-400">Baseado em ações (ex: Comprou, Visitou)</span></div></button>
          <button onClick={() => onSelect('characteristic')} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group text-left cursor-pointer"><div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><UserCog size={24} /></div><div><span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">Característica</span><span className="text-sm text-slate-500 dark:text-slate-400">Dados do perfil (ex: Cidade, Gênero)</span></div></button>
          <button onClick={() => onSelect('segment_ref')} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all group text-left cursor-pointer"><div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><PieChart size={24} /></div><div><span className="block font-bold text-slate-800 dark:text-slate-200 text-lg">Segmento</span><span className="text-sm text-slate-500 dark:text-slate-400">Reutilizar um grupo já existente</span></div></button>
        </div>
      </div>
    </div>
  );
};

// --- BLOCOS DE REGRAS ---
export const RfmBlock = ({ block, onUpdate, onRemove }: any) => {
  return (<div className="p-6"><div className="flex items-center gap-3 mb-5 pb-4 border-b border-amber-100/50 dark:border-amber-900/30"><div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg text-amber-700 dark:text-amber-400 shadow-sm"><Gauge size={20} /></div><div><span className="block text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Ciclo de Vida (RFM)</span></div><button onClick={() => onRemove(block.id)} className={BTN_ICON_CLASS}><Trash2 size={18} /></button></div><div className="flex flex-col md:flex-row items-center gap-4 bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/40"><div className="flex-1 w-full relative"><label className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase mb-1 block ml-1">Status do Cliente</label><div className="relative"><select className={`${SELECT_CLASS} pl-3 border-amber-200 dark:border-amber-800 focus:border-amber-400 focus:ring-amber-500 h-[48px] font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800`} value={block.status} onChange={(e) => onUpdate({ ...block, status: e.target.value })}><option value="" disabled>Selecione um status...</option>{RFM_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>{block.status && <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-2 ml-1">ℹ️ {RFM_STATUSES.find(s => s.id === block.status)?.desc}</p>}</div></div></div>);
};

export const BehaviorBlock = ({ block, onUpdate, onRemove, uiOptions }: any) => {
  const propertiesAvailable = useMemo(() => {
    const event = EVENTS_DB.find(e => e.id === block.event);
    if (!event) return [];
    const definitions: any = { _STANDARD: [{ id: 'date', label: 'Data', type: 'date', options: uiOptions.dates }, { id: 'count', label: 'Frequência', type: 'number' }], NAV: [{ id: 'device', label: 'Dispositivo', type: 'string', options: ['mobile', 'desktop'] }, { id: 'nome_categoria', label: 'Nome da Categoria', type: 'string', options: uiOptions.categories }, { id: 'nome_departamento', label: 'Nome do Departamento', type: 'string', options: uiOptions.departments }], TRANSACTION: [{ id: 'produto_id', label: 'Nome do Produto', type: 'string', options: uiOptions.products }, { id: 'categoria', label: 'Categoria', type: 'string', options: uiOptions.categories }, { id: 'subtotal', label: 'Valor (R$)', type: 'number' }, { id: 'total', label: 'Total Pedido (R$)', type: 'number' }, { id: 'quantidade_produtos', label: 'Qtd. Produtos', type: 'number' }], COMMUNICATION: [{ id: 'campaign_id', label: 'ID da Campanha', type: 'string', options: uiOptions.campaigns }, { id: 'subject', label: 'Assunto', type: 'string', options: uiOptions.search_terms }], SEARCH: [{ id: 'termo_busca', label: 'Termo buscado', type: 'string', options: uiOptions.search_terms }, { id: 'total_resultados', label: 'Total de Resultados', type: 'number' }] };
    let props = [...definitions._STANDARD];
    if (event.category === 'NAV') props = [...props, ...definitions.NAV];
    else if (['TRANSACTION', 'CHECKOUT'].includes(event.category) || event.id.includes('produto')) props = [...props, ...definitions.TRANSACTION];
    else if (event.category === 'SEARCH') props = [...props, ...definitions.SEARCH];
    else if (event.category === 'COMMUNICATION') props = [...props, ...definitions.COMMUNICATION];
    return props;
  }, [block.event, uiOptions]);
  const handleUpdateFilter = (idx: number, updated: any) => { const newFilters = [...block.filters]; newFilters[idx] = updated; onUpdate({ ...block, filters: newFilters }); };
  return (<div className="p-6 relative"><div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"><div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0"><button onClick={() => onUpdate({ ...block, type: 'did' })} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${block.type === 'did' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><CheckCircle2 size={14} /> Fizeram</button><button onClick={() => onUpdate({ ...block, type: 'did_not' })} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${block.type === 'did_not' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><XCircle size={14} /> Não fizeram</button></div><div className="relative flex-1 w-full sm:w-auto min-w-[200px]"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500 dark:text-blue-400"><Activity size={18} /></div><select className={`${SELECT_CLASS} pl-10 border-blue-100 dark:border-blue-900/40 focus:border-blue-300 dark:focus:border-blue-600 focus:ring-blue-500 h-[40px] font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800`} value={block.event} onChange={(e) => onUpdate({ ...block, event: e.target.value, filters: [] })}><option value="" disabled>Selecione um evento...</option>{Object.keys(EVENT_CATEGORIES).map(catKey => (<optgroup key={catKey} label={EVENT_CATEGORIES[catKey].label}>{EVENTS_DB.filter(e => e.category === catKey).map(ev => <option key={ev.id} value={ev.id}>{ev.label}</option>)}</optgroup>))}</select></div><button onClick={() => onRemove(block.id)} className={`${BTN_ICON_CLASS} shrink-0`} title="Remover regra"><Trash2 size={18} /></button></div>{block.event && (<div className="ml-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">{block.filters.length === 0 && <div className="text-xs text-slate-400 italic mb-2">Nenhum filtro aplicado (considerando todos).</div>}{block.filters.map((filter: any, idx: number) => { const selectedProp = propertiesAvailable.find(p => p.id === filter.field); const type = selectedProp?.type || 'string'; const ops = OPERATORS[type] || OPERATORS.string; const opDef = ops.find((o: any) => o.id === filter.operator); return (<div key={filter.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 group hover:border-blue-200 dark:hover:border-blue-800 transition-colors"><div className="flex-1 w-full sm:w-auto flex gap-2"><select className={`${SELECT_CLASS} py-1.5 text-xs focus:ring-blue-500 dark:bg-slate-800`} value={filter.field} onChange={(e) => handleUpdateFilter(idx, { ...filter, field: e.target.value, operator: '', value: '' })}><option value="" disabled>Propriedade</option>{propertiesAvailable.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select><select className={`${SELECT_CLASS} w-[110px] py-1.5 text-xs focus:ring-blue-500 dark:bg-slate-800`} value={filter.operator} onChange={(e) => handleUpdateFilter(idx, { ...filter, operator: e.target.value })} disabled={!filter.field}><option value="" disabled>Operador</option>{ops.map((op: any) => <option key={op.id} value={op.id}>{op.label}</option>)}</select></div>{!opDef?.noValue && (<div className="w-full sm:w-auto sm:flex-1 sm:min-w-[150px]"><DynamicValueInput type={type} value={filter.value} options={selectedProp?.options} onChange={(e: any) => handleUpdateFilter(idx, { ...filter, value: e.target.value })} disabled={!filter.operator} /></div>)}<button onClick={() => onUpdate({ ...block, filters: block.filters.filter((_: any, i: number) => i !== idx) })} className="text-slate-300 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><Trash2 size={14} /></button></div>); })}<button onClick={() => onUpdate({ ...block, filters: [...block.filters, { id: Date.now(), field: '', operator: '', value: '' }] })} className="group flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all mt-2"><div className="bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 rounded p-0.5 transition-colors"><Plus size={12} /></div> Adicionar filtro</button></div>)}</div>);
};

export const CharacteristicBlock = ({ block, onUpdate, onRemove, uiOptions }: any) => {
  const CUSTOMER_FIELDS_DYNAMIC = useMemo(() => [{ id: 'name', label: 'Nome Completo', type: 'string' }, { id: 'email', label: 'E-mail', type: 'string' }, { id: 'city', label: 'Cidade', type: 'string', options: uiOptions.cities }, { id: 'state', label: 'Estado', type: 'string', options: uiOptions.states }, { id: 'gender', label: 'Gênero', type: 'string', options: uiOptions.gender }, { id: 'has_android', label: 'Possui Android', type: 'boolean' }], [uiOptions]);
  const selectedField = CUSTOMER_FIELDS_DYNAMIC.find(f => f.id === block.field);
  const inputType = selectedField?.type || 'string';
  const operators = OPERATORS[inputType] || OPERATORS.string;
  const currentOpDef = operators.find((op: any) => op.id === block.operator);
  return (<div className="p-6"><div className="flex items-center gap-3 mb-5 pb-4 border-b border-purple-100/50 dark:border-purple-900/30"><div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg text-purple-700 dark:text-purple-400 shadow-sm"><UserCog size={20} /></div><div><span className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Característica</span></div><button onClick={() => onRemove(block.id)} className={BTN_ICON_CLASS}><Trash2 size={18} /></button></div><div className="flex flex-col md:flex-row items-center gap-3"><div className="w-full md:flex-1"><div className="relative"><select className={`${SELECT_CLASS} pl-9 border-purple-100 dark:border-purple-900/40 focus:border-purple-300 dark:focus:border-purple-600 focus:ring-purple-500 dark:bg-slate-800`} value={block.field} onChange={(e) => onUpdate({ ...block, field: e.target.value, operator: '', value: '' })}><option value="" disabled>Selecione um atributo...</option>{CUSTOMER_FIELDS_DYNAMIC.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select><Fingerprint size={16} className="absolute left-3 top-3 text-purple-400 pointer-events-none" /></div></div><div className="w-full md:w-[180px]"><select className={`${SELECT_CLASS} border-purple-100 dark:border-purple-900/40 focus:border-purple-300 dark:focus:border-purple-600 focus:ring-purple-500 dark:bg-slate-800`} value={block.operator} onChange={(e) => onUpdate({ ...block, operator: e.target.value })} disabled={!block.field}><option value="" disabled>Operador</option>{operators.map((op: any) => <option key={op.id} value={op.id}>{op.label}</option>)}</select></div>{!currentOpDef?.noValue && (<div className="w-full md:flex-1"><DynamicValueInput type={inputType} value={block.value} options={selectedField?.options} onChange={(e: any) => onUpdate({ ...block, value: e.target.value })} disabled={!block.operator} placeholder="Valor..." /></div>)}</div></div>);
};

export const SegmentReferenceBlock = ({ block, onUpdate, onRemove, uiOptions }: any) => {
  return (<div className="p-6"><div className="flex items-center gap-3 mb-5 pb-4 border-b border-teal-100/50 dark:border-teal-900/30"><div className="bg-teal-100 dark:bg-teal-900/40 p-2 rounded-lg text-teal-700 dark:text-teal-400 shadow-sm"><PieChart size={20} /></div><div><span className="block text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Segmento</span></div><button onClick={() => onRemove(block.id)} className={BTN_ICON_CLASS}><Trash2 size={18} /></button></div><div className="flex flex-col md:flex-row items-center gap-4 bg-teal-50/50 dark:bg-teal-900/10 p-4 rounded-xl border border-teal-100 dark:border-teal-900/40"><div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg shrink-0 shadow-sm w-full md:w-auto"><button onClick={() => onUpdate({ ...block, relation: 'in' })} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${block.relation === 'in' ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><CheckCircle2 size={16} /> Faz parte</button><button onClick={() => onUpdate({ ...block, relation: 'not_in' })} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${block.relation === 'not_in' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><XCircle size={16} /> Não faz parte</button></div><div className="flex-1 w-full relative"><Users size={18} className="absolute left-3 top-3 text-teal-500 pointer-events-none" /><select className={`${SELECT_CLASS} pl-10 border-teal-200 dark:border-teal-800 focus:border-teal-400 focus:ring-teal-500 h-[42px] font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800`} value={block.segment_id} onChange={(e) => onUpdate({ ...block, segment_id: e.target.value })}><option value="" disabled>Selecione um segmento...</option>{uiOptions.segments && uiOptions.segments.map((seg: any) => <option key={seg.id} value={seg.id}>{seg.name}</option>)}</select></div></div></div>);
};