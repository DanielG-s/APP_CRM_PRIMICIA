import axios from 'axios';

import { API_BASE_URL } from '../lib/config';

// Ajuste a URL base conforme sua configuração (localhost ou produção)
const API_URL = `${API_BASE_URL}/webhook/crm/intelligence`;

const getHeaders = (token: string | null) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  }
});

export const intelligenceService = {
  // Listar todos os segmentos (com tendência)
  getSegments: async (token: string | null) => {
    const response = await axios.get(`${API_URL}/segments`, getHeaders(token));
    return response.data; // Espera retornar { segments: [], totalCustomers: 0 }
  },

  // Buscar um segmento por ID
  getSegmentById: async (token: string | null, id: string) => {
    const response = await axios.get(`${API_URL}/segments/${id}`, getHeaders(token));
    return response.data;
  },

  // Criar novo segmento
  createSegment: async (token: string | null, data: { name: string; rules: any; isDynamic: boolean }) => {
    const response = await axios.post(`${API_URL}/segments`, data, getHeaders(token));
    return response.data;
  },

  // Atualizar segmento existente
  updateSegment: async (token: string | null, id: string, data: any) => {
    const response = await axios.put(`${API_URL}/segments/${id}`, data, getHeaders(token));
    return response.data;
  },

  // Deletar segmento
  deleteSegment: async (token: string | null, id: string) => {
    const response = await axios.delete(`${API_URL}/segments/${id}`, getHeaders(token));
    return response.data;
  },

  // Alternar Status (Ativo/Pausado)
  toggleSegmentStatus: async (token: string | null, id: string) => {
    const response = await axios.patch(`${API_URL}/segments/${id}/status`, {}, getHeaders(token));
    return response.data;
  },

  // Calcular Preview (Calculadora)
  calculatePreview: async (token: string | null, rules: any[]) => {
    const response = await axios.post(`${API_URL}/preview`, { rules }, getHeaders(token));
    return response.data;
  },

  // Buscar opções para os selects (Filtros)
  getFilterOptions: async (token: string | null) => {
    const response = await axios.get(`${API_URL}/filters`, getHeaders(token));
    return response.data;
  },

  // Buscar dados do Dashboard RFM
  getRfmAnalysis: async (token: string | null) => {
    const response = await axios.get(`${API_URL}/rfm`, getHeaders(token));
    return response.data;
  }
};