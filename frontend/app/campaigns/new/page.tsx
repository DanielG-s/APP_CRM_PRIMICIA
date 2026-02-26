'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  X, Smile, Code, Monitor, LayoutGrid, ChevronRight,
  CheckCircle, FileEdit, Trash2, Mail, MessageSquare,
  Smartphone, Send
} from 'lucide-react';
import { useRBAC } from "../../contexts/RBACContext";

// Importação dinâmica do Editor de Email
const EmailEditor = dynamic(
  () => import('../../components/editor/EmailEditor'),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">Carregando editor...</div>
  }
);

type ChannelType = 'EMAIL' | 'SMS' | 'WHATSAPP';

export default function CampaignPage() {
  const { hasPermission } = useRBAC();
  // --- ESTADOS GERAIS ---
  const [activeChannel, setActiveChannel] = useState<ChannelType>('EMAIL');
  const [campaignName, setCampaignName] = useState('UsePrimicia');

  // --- ESTADOS DE EMAIL ---
  const [emailSubject, setEmailSubject] = useState('');
  const [isEmailEditorOpen, setIsEmailEditorOpen] = useState(false);
  const [savedEmailContent, setSavedEmailContent] = useState<{ html: string; json: any } | null>(null);

  // --- ESTADOS DE SMS ---
  const [smsMessage, setSmsMessage] = useState('');

  // --- ESTADOS DE WHATSAPP ---
  const [whatsappTemplate, setWhatsappTemplate] = useState('promocao_padrao');
  const [whatsappVars, setWhatsappVars] = useState({ 1: '', 2: '' }); // Ex: Olá {{1}}, sua oferta é {{2}}

  // --- HANDLERS ---

  const handleEmailEditorSave = (html: string, json: any) => {
    setSavedEmailContent({ html, json });
    setIsEmailEditorOpen(false);
  };

  const handleFinalSave = async () => {
    // Monta o payload baseado no canal ativo
    const payload: any = {
      name: campaignName,
      channel: activeChannel,
    };

    if (activeChannel === 'EMAIL') {
      if (!savedEmailContent) return alert("Crie o visual do e-mail antes de salvar.");
      payload.subject = emailSubject;
      payload.contentHtml = savedEmailContent.html;
      payload.contentJson = savedEmailContent.json;
    }
    else if (activeChannel === 'SMS') {
      if (!smsMessage) return alert("Escreva a mensagem do SMS.");
      payload.content = smsMessage;
    }
    else if (activeChannel === 'WHATSAPP') {
      payload.template = whatsappTemplate;
      payload.variables = whatsappVars;
    }

    console.log(`Salvando campanha de ${activeChannel}:`, payload);
    alert(`Campanha de ${activeChannel} salva com sucesso! (Ver console)`);
  };

  // --- RENDERIZAÇÃO CONDICIONAL: SE O EDITOR ESTIVER ABERTO (SÓ EMAIL) ---
  if (isEmailEditorOpen) {
    return (
      <EmailEditor
        initialData={savedEmailContent?.json}
        onSave={handleEmailEditorSave}
        onClose={() => setIsEmailEditorOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">

      {/* Header Fixo */}
      <header className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Nova Campanha</h1>
            <p className="text-xs text-gray-500">Configure sua campanha de marketing.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            disabled={!hasPermission('app:campaigns:send')}
            title={!hasPermission('app:campaigns:send') ? 'Você não tem permissão para disparar campanhas.' : ''}
            className="px-4 py-2 text-slate-600 border border-slate-200 rounded hover:bg-slate-50 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar teste
          </button>
          <button
            onClick={handleFinalSave}
            disabled={!hasPermission('app:campaigns:send')}
            title={!hasPermission('app:campaigns:send') ? 'Você não tem permissão para disparar campanhas.' : ''}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={16} /> Salvar Campanha
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar de Canais */}
        <aside className="w-64 bg-slate-50 border-r border-gray-200 p-6 flex flex-col gap-2 shrink-0 h-[calc(100vh-80px)] overflow-y-auto">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Canal de Envio</label>

          <ChannelButton
            active={activeChannel === 'EMAIL'}
            onClick={() => setActiveChannel('EMAIL')}
            icon={<Mail size={18} />}
            title="E-mail Marketing"
            desc="Newsletters e promoções"
          />

          <ChannelButton
            active={activeChannel === 'SMS'}
            onClick={() => setActiveChannel('SMS')}
            icon={<MessageSquare size={18} />}
            title="SMS"
            desc="Mensagens de texto curtas"
          />

          <ChannelButton
            active={activeChannel === 'WHATSAPP'}
            onClick={() => setActiveChannel('WHATSAPP')}
            icon={<Smartphone size={18} />}
            title="WhatsApp"
            desc="Mensagens via API Oficial"
          />
        </aside>

        {/* Área Principal de Conteúdo */}
        <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Configurações Comuns */}
            <section className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Configurações Gerais</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Nome Interno da Campanha</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* === CONTEÚDO DO CANAL SELECIONADO === */}

            {activeChannel === 'EMAIL' && (
              <div className="animate-in fade-in duration-300 space-y-8">
                {/* Configurações de Email */}
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800">Configurações de E-mail</h2>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Assunto</label>
                    <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="flex-1 px-3 py-2 text-slate-700 outline-none rounded-md"
                        placeholder="Ex: Oferta imperdível para você..."
                      />
                      <button className="p-2 text-gray-400 hover:text-blue-600"><Smile size={20} /></button>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-100" />

                {/* Visual do Email */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Conteúdo do E-mail</h2>
                    {!savedEmailContent && (
                      <button className="flex items-center gap-2 text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50 font-medium text-sm transition-colors">
                        <LayoutGrid size={18} /> Templates
                      </button>
                    )}
                  </div>

                  {savedEmailContent ? (
                    <div className="border border-green-200 bg-green-50/50 rounded-lg p-6 flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-white border border-green-100 rounded flex items-center justify-center shadow-sm">
                          <CheckCircle className="text-green-500" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">Template Configurado</h3>
                          <p className="text-sm text-gray-500 mt-1 mb-3">O visual do e-mail está pronto.</p>
                          <div className="flex gap-4">
                            <button onClick={() => setIsEmailEditorOpen(true)} className="text-sm font-medium text-blue-600 hover:underline">Editar</button>
                            <button onClick={() => setSavedEmailContent(null)} className="text-sm font-medium text-red-500 hover:underline">Remover</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div onClick={() => setIsEmailEditorOpen(true)} className="group border border-gray-200 hover:border-blue-400 bg-white p-6 rounded-lg cursor-pointer transition-all hover:shadow-md">
                        <div className="mb-4 p-3 bg-blue-50 w-fit rounded-lg text-blue-600 group-hover:scale-110 transition-transform"><Monitor size={24} /></div>
                        <h3 className="font-bold text-slate-700">Editor Visual</h3>
                        <p className="text-sm text-gray-500 mt-1">Arraste e solte elementos para criar seu e-mail.</p>
                      </div>
                      <div className="group border border-gray-200 hover:border-gray-300 bg-gray-50 p-6 rounded-lg cursor-not-allowed opacity-70">
                        <div className="mb-4 p-3 bg-gray-200 w-fit rounded-lg text-gray-500"><Code size={24} /></div>
                        <h3 className="font-bold text-slate-700">HTML Puro</h3>
                        <p className="text-sm text-gray-500 mt-1">Para desenvolvedores (Em breve).</p>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeChannel === 'SMS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-800">Mensagem de Texto</h2>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Conteúdo do SMS</label>
                    <textarea
                      className="w-full h-40 border border-gray-300 rounded p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Digite sua mensagem aqui..."
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      maxLength={160}
                    ></textarea>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Evite acentos para melhor compatibilidade.</span>
                      <span className={`${smsMessage.length > 150 ? 'text-red-500 font-bold' : ''}`}>
                        {smsMessage.length}/160
                      </span>
                    </div>
                  </div>
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded text-sm border border-yellow-100">
                    <strong>Dica:</strong> Links curtos são gerados automaticamente se você colar uma URL longa.
                  </div>
                </div>

                {/* Preview Celular SMS */}
                <div className="flex justify-center">
                  <PhonePreview>
                    <div className="bg-gray-200 p-3 rounded-lg rounded-tl-none self-start max-w-[85%] text-sm text-gray-800 shadow-sm relative">
                      {smsMessage || "Sua mensagem aparecerá aqui..."}
                      <span className="text-[10px] text-gray-500 block text-right mt-1">10:42</span>
                    </div>
                  </PhonePreview>
                </div>
              </div>
            )}

            {activeChannel === 'WHATSAPP' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800">Configuração WhatsApp</h2>

                  {/* Seleção de Template (Mock) */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">Template Aprovado (Meta)</label>
                    <select
                      value={whatsappTemplate}
                      onChange={(e) => setWhatsappTemplate(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-slate-700 bg-white"
                    >
                      <option value="promocao_padrao">promocao_padrao (Marketing)</option>
                      <option value="aviso_vencimento">aviso_vencimento (Utilidade)</option>
                      <option value="boas_vindas">boas_vindas (Marketing)</option>
                    </select>
                  </div>

                  {/* Campos Dinâmicos do Template */}
                  <div className="bg-slate-50 p-4 rounded border border-gray-200 space-y-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Variáveis do Template</h3>

                    <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
                      <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{'{{1}}'}</span>
                      <input
                        type="text"
                        placeholder="Nome do Cliente"
                        value={whatsappVars[1]}
                        onChange={(e) => setWhatsappVars({ ...whatsappVars, 1: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full"
                      />
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
                      <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{'{{2}}'}</span>
                      <input
                        type="text"
                        placeholder="Valor do Desconto / Link"
                        value={whatsappVars[2]}
                        onChange={(e) => setWhatsappVars({ ...whatsappVars, 2: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview Celular WhatsApp */}
                <div className="flex justify-center">
                  <PhonePreview type="whatsapp">
                    <div className="bg-[#dcf8c6] p-3 rounded-lg rounded-tr-none self-end max-w-[85%] text-sm text-gray-800 shadow-sm relative ml-auto border border-[#cceebb]">
                      <p className="font-bold text-xs text-green-800 mb-1">Empresa</p>
                      <p>
                        Olá {whatsappVars[1] || 'Maria'}, temos uma oferta especial para você!
                        <br /><br />
                        Aproveite {whatsappVars[2] || '10% OFF'} na sua próxima compra.
                      </p>
                      <div className="flex justify-end items-center gap-1 mt-1">
                        <span className="text-[10px] text-gray-500">10:42</span>
                        <CheckCircle size={10} className="text-blue-500" />
                      </div>
                    </div>

                    {/* Botão do Template (Simulação) */}
                    <div className="mt-2 bg-white rounded text-center py-2 text-blue-500 text-sm font-medium shadow-sm border border-gray-200 cursor-pointer">
                      Ver Oferta
                    </div>
                  </PhonePreview>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES VISUAIS ---

const ChannelButton = ({ active, onClick, icon, title, desc }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 border ${active
      ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
      : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
      }`}
  >
    <div className={`p-2 rounded-md ${active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
      {icon}
    </div>
    <div>
      <h3 className={`text-sm font-bold ${active ? 'text-blue-700' : 'text-gray-600'}`}>{title}</h3>
      <p className="text-[10px] text-gray-400 leading-tight">{desc}</p>
    </div>
  </button>
);

const PhonePreview = ({ children, type = 'sms' }: { children: React.ReactNode, type?: 'sms' | 'whatsapp' }) => (
  <div className="w-[280px] h-[500px] bg-gray-900 rounded-[30px] p-3 shadow-xl relative border-4 border-gray-800">
    {/* Notch */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>

    {/* Tela */}
    <div className={`w-full h-full bg-slate-100 rounded-[24px] overflow-hidden flex flex-col relative ${type === 'whatsapp' ? 'bg-[#ece5dd]' : 'bg-white'}`}>

      {/* Header do Celular */}
      <div className={`h-12 flex items-center px-4 gap-2 text-white text-xs ${type === 'whatsapp' ? 'bg-[#075e54]' : 'bg-gray-100 border-b text-gray-600'}`}>
        {type === 'whatsapp' ? (
          <>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">E</div>
            <span>Empresa</span>
          </>
        ) : (
          <div className="w-full text-center font-bold">Mensagens</div>
        )}
      </div>

      {/* Corpo da Mensagem */}
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto" style={type === 'whatsapp' ? { backgroundImage: 'radial-gradient(#cbd5e0 1px, transparent 1px)', backgroundSize: '20px 20px' } : {}}>
        <div className="text-[10px] text-gray-400 text-center my-2">Hoje</div>
        {children}
      </div>

      {/* Input Fake */}
      <div className="h-12 bg-white border-t flex items-center px-3 gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-200"></div>
        <div className="flex-1 h-8 bg-gray-100 rounded-full"></div>
        <Send size={16} className="text-gray-400" />
      </div>
    </div>
  </div>
);