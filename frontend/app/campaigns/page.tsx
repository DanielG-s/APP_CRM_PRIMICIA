'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Calendar, Filter, Plus, MoreHorizontal,
  Mail, MessageSquare, Smartphone, Trash2, Copy, FileEdit,
  ChevronDown
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

export default function CampaignListPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      'ENVIO REALIZADO': 'bg-gray-200 text-gray-600',
      'AGENDADO': 'bg-blue-100 text-blue-700',
      'RASCUNHO': 'bg-yellow-100 text-yellow-700',
      'ERRO': 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>
        • {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-800 p-6">

      {/* HEADER E ABAS */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Canais</h1>
          <button
            onClick={handleCreateNew}
            className="bg-[#00C475] hover:bg-[#00a865] text-white px-4 py-2 rounded font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Criar campanha
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            <button className="pb-3 border-b-2 border-[#00C475] text-[#00C475] font-medium text-sm">Lista de campanhas</button>
            <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Resultados de Canais</button>
            <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Tempo real</button>
          </nav>
        </div>
      </div>

      {/* ÁREA DE FILTROS */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 space-y-4">

        {/* Filtros de Data e Botões */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 w-full md:w-auto">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-gray-400">Início</span>
            <span className="mx-2 text-gray-300">→</span>
            <span className="text-gray-400">Fim</span>
            <ChevronDown size={14} className="ml-2 text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Filtros e visualizações
            </span>
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded text-sm font-medium hover:bg-gray-200">Limpar filtros</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-400 rounded text-sm font-medium cursor-not-allowed">Aplicar</button>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-md py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C475]/50 focus:border-[#00C475]"
          />
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-4 w-12 text-center text-gray-400 font-medium">#</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Campanhas</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Criação</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Início</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fim</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Edição</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
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
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-center">
                      <div className="flex justify-center">{getChannelIcon(campaign.channel)}</div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 text-sm">{campaign.name}</p>
                      <p className="text-xs text-green-600 underline cursor-pointer hover:text-green-700 mt-0.5 mb-1 truncate max-w-[200px]">
                        Segmento: {campaign.segment}
                      </p>
                      <span className="inline-block bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-mono border border-gray-200">
                        ID: {campaign.id}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(campaign.status)}</td>
                    <td className="p-4 text-sm text-gray-600">{campaign.type}</td>
                    <td className="p-4 text-xs text-gray-500">{campaign.createdAt}</td>
                    <td className="p-4 text-xs text-gray-500">{campaign.startDate}</td>
                    <td className="p-4 text-xs text-gray-500">{campaign.endDate}</td>
                    <td className="p-4">
                      <p className="text-xs text-gray-500">{campaign.lastEdit}</p>
                      <p className="text-xs text-gray-400">{campaign.editedBy}</p>
                    </td>
                    <td className="p-4 text-right">
                      {/* Botões de Ação (Aparecem no Hover ou fixos) */}
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDuplicate(campaign)}
                          title="Duplicar"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(campaign.id)}
                          title="Editar"
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                        >
                          <FileEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          title="Excluir"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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