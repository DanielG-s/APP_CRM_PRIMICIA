'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Calendar, Filter, Plus, MoreHorizontal,
  Mail, MessageSquare, Smartphone, Trash2, Copy, FileEdit,
  ChevronDown, BookOpen, X, Lightbulb, MousePointerClick, TrendingUp, Check, Users
} from 'lucide-react';

// --- TIPOS DE DADOS ---
interface Campaign {
  id: string;
  name: string;
  segment: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
  status: 'ENVIO REALIZADO' | 'AGENDADO' | 'RASCUNHO' | 'ERRO';
  type: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  lastEdit: string;
  editedBy: string;
}

// --- DADOS MOCKADOS (Simulando o Banco de Dados) ---
const MOCK_DATA: Campaign[] = [
  {
    id: '01KEHE3YVFNRJRY4SAM083ZWF',
    name: 'HOT SUMMER',
    segment: 'TODOS USUARIOS SEM ERRO',
    channel: 'EMAIL',
    status: 'ENVIO REALIZADO',
    type: 'Apenas uma vez',
    createdAt: '09/01/2026 • 10:11',
    startDate: '10/01/2026 • 00:00',
    endDate: 'Indeterminado',
    lastEdit: '09/01/2026 • 10:11',
    editedBy: 'ADMIN'
  },
  {
    id: '01KED0YQTB4TE9MMZ9R1AQ8J6A',
    name: 'Basicos-sem-costura',
    segment: 'Comprou moda íntima há 6 meses',
    channel: 'EMAIL',
    status: 'ENVIO REALIZADO',
    type: 'Apenas uma vez',
    createdAt: '07/01/2026 • 17:04',
    startDate: '09/01/2026 • 00:00',
    endDate: 'Indeterminado',
    lastEdit: '07/01/2026 • 17:15',
    editedBy: 'ADMIN'
  },
  {
    id: '01KEABMEP4CVX9196F5AVEPG89',
    name: 'Bolsa Gift',
    segment: 'TODOS USUARIOS SEM ERRO',
    channel: 'WHATSAPP',
    status: 'AGENDADO',
    type: 'Apenas uma vez',
    createdAt: '06/01/2026 • 16:13',
    startDate: '07/01/2026 • 00:00',
    endDate: 'Indeterminado',
    lastEdit: '06/01/2026 • 16:13',
    editedBy: 'ADMIN'
  },
  {
    id: '01KCSK66WHXT6NHW60DHYP1RMB',
    name: 'Lojas Outlet',
    segment: 'TODOS USUARIOS SEM ERRO',
    channel: 'SMS',
    status: 'RASCUNHO',
    type: 'Apenas uma vez',
    createdAt: '18/12/2025 • 17:42',
    startDate: '05/01/2026 • 00:00',
    endDate: 'Indeterminado',
    lastEdit: '18/12/2025 • 17:42',
    editedBy: 'ADMIN'
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

// --- COMPONENTE: MODAL DE TUTORIAL (CAMPANHAS) ---
const CampaignsTutorialModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const tutorials = [
    {
      badge: "Comunicação",
      title: "Central de Campanhas",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-lg leading-relaxed">
            Aqui é onde a mágica acontece. Crie, gerencie e acompanhe <strong>todas as suas comunicações</strong> com a base de clientes em um só lugar.
          </p>
        </div>
      ),
      icon: <Users size={56} className="text-white" />,
      color: "bg-slate-900",
      bgElement: "bg-[#00C475]"
    },
    {
      badge: "Multicanal",
      title: "Alcance em Todos os Meios",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Fale com seu cliente onde ele estiver. O CRM suporta múltiplos canais de disparo:
          </p>
          <ul className="space-y-3 mt-2">
            <li className="flex gap-3 items-start">
              <div className="p-1.5 bg-green-100 rounded text-green-600 mt-0.5"><Smartphone size={14} /></div>
              <div>
                <strong className="block text-slate-800 text-sm">WhatsApp</strong>
                <span className="text-slate-500 text-xs">A maior taxa de abertura. Ideal para promoções relâmpago.</span>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <div className="p-1.5 bg-gray-100 rounded text-gray-600 mt-0.5"><Mail size={14} /></div>
              <div>
                <strong className="block text-slate-800 text-sm">E-mail Marketing</strong>
                <span className="text-slate-500 text-xs">Perfeito para newsletters, catálogos e anúncios prolongados.</span>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <div className="p-1.5 bg-blue-100 rounded text-blue-500 mt-0.5"><MessageSquare size={14} /></div>
              <div>
                <strong className="block text-slate-800 text-sm">SMS</strong>
                <span className="text-slate-500 text-xs">Comunicados rápidos e urgentes.</span>
              </div>
            </li>
          </ul>
        </div>
      ),
      icon: <TrendingUp size={56} className="text-white" />,
      color: "bg-[#00a865]",
      bgElement: "bg-[#00C475]"
    },
    {
      badge: "Controle",
      title: "Monitore o Status",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Não perca o controle do que está acontecendo:
          </p>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-2">
            <Lightbulb size={24} className="text-slate-600" />
            <div className="text-sm text-slate-700">
              Acompanhe facilmente se a campanha está <strong>Rascunho</strong>, <strong>Agendada</strong>, teve o <strong>Envio Realizado</strong> ou se ocorreu algum <strong>Erro</strong>.
            </div>
          </div>
        </div>
      ),
      icon: <Search size={56} className="text-white" />,
      color: "bg-blue-600",
      bgElement: "bg-blue-400"
    },
    {
      badge: "Ação",
      title: "Gestão Descomplicada",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Ações rápidas para produtividade máxima:
          </p>
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-2">
            <Copy size={24} className="text-amber-600" />
            <div className="text-sm text-slate-700">
              Passe o mouse sobre qualquer campanha para acessar ações rápidas: <strong>Duplicar</strong>, <strong>Editar</strong> ou <strong>Excluir</strong>.
            </div>
          </div>
        </div>
      ),
      icon: <MousePointerClick size={56} className="text-white" />,
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
    if (dontShowAgain) {
      localStorage.setItem('crm_campaigns_tutorial_hide', 'true');
    } else {
      localStorage.removeItem('crm_campaigns_tutorial_hide');
    }
    onClose();
    setTimeout(() => setStep(0), 300);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">

        {/* ESQUERDA */}
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

        {/* DIREITA */}
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
                  <button onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors">
                    Voltar
                  </button>
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
                  className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transform hover:-translate-y-0.5 transition-all ${step === tutorials.length - 1 ? 'bg-slate-900 hover:bg-slate-800' : currentStep.color + ' hover:opacity-90'}`}
                >
                  {step === tutorials.length - 1 ? 'Começar a Usar' : 'Próximo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CampaignListPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
    const userHidTutorial = localStorage.getItem('crm_campaigns_tutorial_hide');
    if (userHidTutorial !== 'true') {
      setIsTutorialOpen(true);
    }
  }, []);

  // Simula busca no banco de dados ao carregar
  useEffect(() => {
    setTimeout(() => {
      setCampaigns(MOCK_DATA);
      setIsLoading(false);
    }, 500);
  }, []);

  // --- AÇÕES ---

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleDuplicate = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: generateId(),
      name: `${campaign.name} (Cópia)`,
      status: 'RASCUNHO',
      createdAt: new Date().toLocaleString('pt-BR'),
      lastEdit: new Date().toLocaleString('pt-BR')
    };
    setCampaigns([newCampaign, ...campaigns]);
    alert('Campanha duplicada com sucesso!');
  };

  const handleEdit = (id: string) => {
    // Redireciona para a página de edição (usando a mesma estrutura do /new mas passando ID)
    // Você precisará adaptar o page.tsx do /new para aceitar edição ou criar uma rota [id]
    router.push(`/campaigns/${id}`);
  };

  const handleCreateNew = () => {
    router.push('/campaigns/new');
  };

  // --- FILTROS ---
  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HELPER VISUAL ---
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'EMAIL': return <Mail size={18} className="text-gray-500" />;
      case 'WHATSAPP': return <Smartphone size={18} className="text-green-600" />;
      case 'SMS': return <MessageSquare size={18} className="text-blue-500" />;
      default: return <Mail size={18} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      'ENVIO REALIZADO': 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
      'AGENDADO': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
      'RASCUNHO': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
      'ERRO': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
    };
    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 dark:bg-gray-800'}`}>
        • {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#020817] font-sans text-gray-800 dark:text-gray-100 p-6 transition-colors duration-300">
      <CampaignsTutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      {/* HEADER E ABAS */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Canais</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsTutorialOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all text-sm font-bold">
              <BookOpen size={18} className="text-[#00C475]" /> Como usar?
            </button>
            <button
              onClick={handleCreateNew}
              className="bg-[#00C475] hover:bg-[#00a865] text-white px-4 py-2 rounded font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Criar campanha
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-6">
            <button className="pb-3 border-b-2 border-[#00C475] text-[#00C475] font-medium text-sm">Lista de campanhas</button>
            <button className="pb-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm">Resultados de Canais</button>
            <button className="pb-3 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm">Tempo real</button>
          </nav>
        </div>
      </div>

      {/* ÁREA DE FILTROS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6 space-y-4">

        {/* Filtros de Data e Botões */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-300 w-full md:w-auto">
            <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
            <span className="text-gray-400 dark:text-gray-500">Início</span>
            <span className="mx-2 text-gray-300 dark:text-gray-600">→</span>
            <span className="text-gray-400 dark:text-gray-500">Fim</span>
            <ChevronDown size={14} className="ml-2 text-gray-400 dark:text-gray-500" />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              Filtros e visualizações
            </span>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>
            <button className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700">Limpar filtros</button>
            <button className="px-4 py-2 bg-gray-200 dark:bg-slate-800/50 text-gray-400 dark:text-gray-600 rounded text-sm font-medium cursor-not-allowed">Aplicar</button>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-md py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C475]/50 focus:border-[#00C475] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="p-4 w-12 text-center text-gray-400 dark:text-gray-500 font-medium">#</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campanhas</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Criação</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Início</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fim</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Edição</th>
                <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">Carregando campanhas...</td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">Nenhuma campanha encontrada.</td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4 text-center">
                      <div className="flex justify-center">{getChannelIcon(campaign.channel)}</div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{campaign.name}</p>
                      <p className="text-xs text-green-600 dark:text-green-500 underline cursor-pointer hover:text-green-700 dark:hover:text-green-400 mt-0.5 mb-1 truncate max-w-[200px]">
                        Segmento: {campaign.segment}
                      </p>
                      <span className="inline-block bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-gray-200 dark:border-slate-700">
                        ID: {campaign.id}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(campaign.status)}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{campaign.type}</td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{campaign.createdAt}</td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{campaign.startDate}</td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">{campaign.endDate}</td>
                    <td className="p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{campaign.lastEdit}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{campaign.editedBy}</p>
                    </td>
                    <td className="p-4 text-right">
                      {/* Botões de Ação (Aparecem no Hover ou fixos) */}
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDuplicate(campaign)}
                          title="Duplicar"
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(campaign.id)}
                          title="Editar"
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800 rounded"
                        >
                          <FileEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          title="Excluir"
                          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}