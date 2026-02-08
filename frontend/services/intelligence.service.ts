import axios from 'axios';

import { API_BASE_URL } from '../lib/config';

// Ajuste a URL base conforme sua configuração (localhost ou produção)
const API_URL = `${API_BASE_URL}/webhook/crm/intelligence`;

export const intelligenceService = {
  // Listar todos os segmentos (com tendência)
  getSegments: async () => {
    const response = await axios.get(`${API_URL}/segments`);
    return response.data; // Espera retornar { segments: [], totalCustomers: 0 }
  },

  // Buscar um segmento por ID
  getSegmentById: async (id: string) => {
    const response = await axios.get(`${API_URL}/segments/${id}`);
    return response.data;
  },

  // Criar novo segmento
  createSegment: async (data: { name: string; rules: any; isDynamic: boolean }) => {
    const response = await axios.post(`${API_URL}/segments`, data);
    return response.data;
  },

  // Atualizar segmento existente
  updateSegment: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/segments/${id}`, data);
    return response.data;
  },

  // Deletar segmento
  deleteSegment: async (id: string) => {
    const response = await axios.delete(`${API_URL}/segments/${id}`);
    return response.data;
  },

  // Alternar Status (Ativo/Pausado)
  toggleSegmentStatus: async (id: string) => {
    const response = await axios.patch(`${API_URL}/segments/${id}/status`);
    return response.data;
  },

  // Calcular Preview (Calculadora)
  calculatePreview: async (rules: any[]) => {
    const response = await axios.post(`${API_URL}/preview`, { rules });
    return response.data;
  },

  // Buscar opções para os selects (Filtros)
  getFilterOptions: async () => {
    const response = await axios.get(`${API_URL}/filters`);
    return response.data;
  },

  // Buscar dados do Dashboard RFM
  getRfmAnalysis: async () => {
    const response = await axios.get(`${API_URL}/rfm`);
    return response.data;
  }
};