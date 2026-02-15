import axios from "axios";

// Ajuste para sua URL base
import { API_BASE_URL } from '../lib/config';

const API_URL = API_BASE_URL;

export const settingsService = {
  // --- E-MAIL ---
  getEmailSettings: async () => {
    const response = await axios.get(`${API_URL}/settings/email`);
    return response.data;
  },

  updateEmailSettings: async (data: any) => {
    const response = await axios.post(`${API_URL}/settings/email`, data);
    return response.data;
  },

  // --- WHATSAPP ---
  getWhatsappInstances: async () => {
    const response = await axios.get(`${API_URL}/settings/whatsapp`);
    return response.data;
  },

  addWhatsappInstance: async (data: any) => {
    const response = await axios.post(`${API_URL}/settings/whatsapp`, data);
    return response.data;
  },

  deleteWhatsappInstance: async (id: string) => {
    const response = await axios.delete(`${API_URL}/settings/whatsapp/${id}`);
    return response.data;
  },

  // --- SMS (Visual / Futuro) ---
  saveSmsSettings: async (_data: any) => {
    // Como ainda não criamos a rota no backend, vamos simular um delay
    return new Promise((resolve) => setTimeout(resolve, 1000));
    // Quando criar o backend: return axios.post(`${API_URL}/settings/sms`, data);
  },

  // --- LOJA (GERAL) ---
  getStore: async () => {
    const response = await axios.get(`${API_URL}/settings/store`);
    return response.data;
  },

  updateStore: async (data: any) => {
    const response = await axios.post(`${API_URL}/settings/store`, data);
    return response.data;
  },

  // --- USUÁRIOS (EQUIPE) ---
  getUsers: async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await axios.post(`${API_URL}/users`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  }
};