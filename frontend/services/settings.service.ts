import axios from "axios";

// Ajuste para sua URL base
import { API_BASE_URL } from '../lib/config';

const API_URL = API_BASE_URL;

const getHeaders = (token: string | null) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  }
});

export const settingsService = {
  // --- E-MAIL ---
  getEmailSettings: async (token: string | null) => {
    const response = await axios.get(`${API_URL}/settings/email`, getHeaders(token));
    return response.data;
  },

  updateEmailSettings: async (token: string | null, data: any) => {
    const response = await axios.post(`${API_URL}/settings/email`, data, getHeaders(token));
    return response.data;
  },

  // --- WHATSAPP ---
  getWhatsappInstances: async (token: string | null) => {
    const response = await axios.get(`${API_URL}/settings/whatsapp`, getHeaders(token));
    return response.data;
  },

  addWhatsappInstance: async (token: string | null, data: any) => {
    const response = await axios.post(`${API_URL}/settings/whatsapp`, data, getHeaders(token));
    return response.data;
  },

  deleteWhatsappInstance: async (token: string | null, id: string) => {
    const response = await axios.delete(`${API_URL}/settings/whatsapp/${id}`, getHeaders(token));
    return response.data;
  },

  // --- SMS (Visual / Futuro) ---
  saveSmsSettings: async (token: string | null, _data: any) => {
    // Como ainda não criamos a rota no backend, vamos simular um delay
    return new Promise((resolve) => setTimeout(resolve, 1000));
    // Quando criar o backend: return axios.post(`${API_URL}/settings/sms`, data, getHeaders(token));
  },

  // --- LOJA (GERAL) ---
  getStore: async (token: string | null) => {
    const response = await axios.get(`${API_URL}/settings/store`, getHeaders(token));
    return response.data;
  },

  updateStore: async (token: string | null, data: any) => {
    const response = await axios.post(`${API_URL}/settings/store`, data, getHeaders(token));
    return response.data;
  },

  // --- USUÁRIOS (EQUIPE) ---
  getUsers: async (token: string | null) => {
    const response = await axios.get(`${API_URL}/users`, getHeaders(token));
    return response.data;
  },

  createUser: async (token: string | null, data: any) => {
    const response = await axios.post(`${API_URL}/users`, data, getHeaders(token));
    return response.data;
  },

  deleteUser: async (token: string | null, id: string) => {
    const response = await axios.delete(`${API_URL}/users/${id}`, getHeaders(token));
    return response.data;
  }
};