'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ChevronRight, Monitor, Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Importamos o NOVO editor que criamos com GrapesJS
// Certifique-se que o caminho está correto para onde você salvou o EmailEditor.tsx
import EmailEditor from '../../components/editor/EmailEditor'; 

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Estado da Campanha
  const [setupData, setSetupData] = useState({ 
    name: '', 
    subject: '', 
    channel: 'email' 
  });

  // Estado do conteúdo (para salvar temporariamente entre navegações se necessário)
  // O GrapesJS gerencia seu próprio estado interno, mas quando salvamos, guardamos aqui ou no banco
  const [editorData, setEditorData] = useState<{html: string, json: any} | null>(null);

  // --- FUNÇÃO DE SALVAR (Conectada ao GrapesJS) ---
  const handleEditorSave = async (html: string, json: any) => {
    setEditorData({ html, json }); // Guarda no estado local
    
    if (!setupData.name.trim()) {
      toast.error('Por favor, defina um nome para a campanha na etapa 1.');
      setStep(1); // Volta para a etapa 1 se não tiver nome
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Salvando campanha...');

    try {
      const payload = {
        name: setupData.name,
        subject: setupData.subject || setupData.name,
        channel: setupData.channel,
        content: {
          html: html,
          json: json
        },
        status: 'draft',
        createdAt: new Date().toISOString()
      };

      // Chama sua API (substitua pela rota real)
      const response = await fetch('/api/webhook/marketing/campaigns', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Falha ao salvar');

      toast.success('Campanha salva com sucesso!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar campanha.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20}/>
          </button>
          <div className="flex flex-col">
             <h1 className="font-bold text-slate-800 text-lg">
               {setupData.name || 'Nova Campanha'}
             </h1>
             <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
               Passo {step} de 3
             </span>
          </div>
        </div>

        {/* Stepper Visual */}
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 w-10 rounded-full transition-colors ${i <= step ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
            {isSaving && <span className="text-xs text-slate-400 animate-pulse">Salvando...</span>}
        </div>
      </header>

      {/* BODY PRINCIPAL */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        
        {/* --- STEP 1: CONFIGURAÇÃO INICIAL --- */}
        {step === 1 && (
            <div className="flex-1 flex items-center justify-center animate-in fade-in p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Configuração da Campanha</h2>
                        <p className="text-slate-500 text-sm">Defina os detalhes básicos antes de criar o design.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nome da Campanha</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Black Friday Geek 2026" 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                value={setupData.name} 
                                onChange={e => setSetupData({...setupData, name: e.target.value})} 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Assunto do E-mail</label>
                            <input 
                                type="text" 
                                placeholder="Ex: Ofertas imperdíveis para você!" 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                value={setupData.subject} 
                                onChange={e => setSetupData({...setupData, subject: e.target.value})} 
                            />
                        </div>
                        
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">Canal</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['email', 'whatsapp', 'sms'].map(c => (
                                    <button 
                                        key={c} 
                                        onClick={() => setSetupData({...setupData, channel: c})} 
                                        className={`p-3 border rounded-lg capitalize font-bold text-sm transition-all ${setupData.channel === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- STEP 2: EDITOR (GRAPESJS) --- */}
        {/* Mantemos montado mas escondido se não for o passo 2 para não perder o estado do GrapesJS ao navegar, ou usamos render condicional se preferir resetar */}
        <div className={`flex-1 h-full w-full ${step === 2 ? 'block' : 'hidden'}`}>
             <EmailEditor 
                onSave={handleEditorSave} 
                initialData={editorData?.json} // Se já tiver salvo algo, recarrega
             />
        </div>

        {/* --- STEP 3: REVISÃO E ENVIO --- */}
        {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in p-8 text-center space-y-6">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Monitor size={40} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800">Pronto para Enviar?</h2>
                 <p className="max-w-md text-slate-500">
                    Sua campanha <strong>{setupData.name}</strong> está salva como rascunho. 
                    Você pode revisar o HTML ou agendar o disparo agora.
                 </p>
                 
                 <div className="p-4 bg-slate-100 rounded-lg text-left w-full max-w-md text-xs font-mono text-slate-600 overflow-hidden">
                    <p className="font-bold mb-2">Resumo Técnico:</p>
                    <p>Channel: {setupData.channel}</p>
                    <p>Subject: {setupData.subject}</p>
                    <p>HTML Size: {editorData?.html?.length || 0} chars</p>
                 </div>

                 <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg text-lg transition-transform hover:scale-105">
                    Agendar Disparo
                 </button>
            </div>
        )}

      </main>

      {/* FOOTER NAV */}
      <footer className="h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0 z-30">
        <button 
            onClick={() => setStep(s => Math.max(1, s - 1))} 
            disabled={step === 1} 
            className="text-slate-500 font-bold disabled:opacity-30 hover:text-indigo-600 transition-colors"
        >
            Voltar
        </button>

        <div className="flex gap-4">
             {/* No passo 2, mostramos uma dica que o botão de salvar está DENTRO do editor */}
             {step === 2 && (
                 <span className="text-xs text-slate-400 flex items-center mr-4">
                    Dica: Use o ícone de disquete no painel para salvar o layout
                 </span>
             )}

             <button 
                onClick={() => {
                    if (step === 1 && !setupData.name) {
                        toast.error('Dê um nome para a campanha!');
                        return;
                    }
                    setStep(s => Math.min(3, s + 1));
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md flex items-center gap-2 transition-all"
             >
                {step === 3 ? 'Concluir' : 'Próximo'} <ChevronRight size={16}/>
             </button>
        </div>
      </footer>
    </div>
  );
}