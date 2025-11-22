"use client";

import React, { useState } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, Calendar, Bell, LogOut, Send, Smartphone, Mail 
} from 'lucide-react';
import Link from 'next/link';

export default function CampaignsPage() {
  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' ou 'email'

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e2336] text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white mr-3">P</div>
          <span className="font-bold text-lg tracking-wide">PRIMÍCIA</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <Link href="/"><NavItem icon={<Home size={20}/>} label="Visão Geral" /></Link>
          <Link href="/clients"><NavItem icon={<Users size={20}/>} label="Clientes" /></Link>
          <Link href="/reports"><NavItem icon={<BarChart2 size={20}/>} label="Relatórios" /></Link>
          
          <div className="pt-4 pb-2 pl-3 text-xs font-semibold text-gray-500 uppercase">Marketing</div>
          <Link href="/campaigns"><NavItem icon={<MessageCircle size={20}/>} label="Campanhas" active /></Link>
          
          <NavItem icon={<Calendar size={20}/>} label="Agenda" />
          <NavItem icon={<Target size={20}/>} label="Metas" />
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="text-sm text-gray-500">
            Marketing / <span className="font-semibold text-indigo-600">Nova Campanha</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-400 cursor-pointer hover:text-indigo-600" size={20} />
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Criar Nova Campanha</h1>
            <p className="text-gray-500 mb-8">Configure o disparo de mensagens para seus clientes.</p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              
              {/* 1. Escolha do Canal */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Canal de Envio</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 py-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${channel === 'whatsapp' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                  >
                    <Smartphone size={24} />
                    <span className="font-semibold">WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => setChannel('email')}
                    className={`flex-1 py-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${channel === 'email' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                  >
                    <Mail size={24} />
                    <span className="font-semibold">E-mail</span>
                  </button>
                </div>
              </div>

              {/* 2. Configurações */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Campanha</label>
                  <input type="text" placeholder="Ex: Promoção de Inverno - VIPs" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Público Alvo (Segmento)</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option>Todos os Clientes</option>
                    <option>⭐ Clientes VIP (RFM)</option>
                    <option>⚠️ Clientes em Risco</option>
                    <option>🎂 Aniversariantes do Mês</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <div className="relative">
                    <textarea 
                      rows={5} 
                      placeholder={channel === 'whatsapp' ? "Olá! Temos uma oferta especial..." : "Assunto: Oferta Especial..."}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    ></textarea>
                    <span className="absolute bottom-3 right-3 text-xs text-gray-400">0 / 160 caracteres</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Dica: Use <strong>{`{nome}`}</strong> para personalizar com o nome do cliente.
                  </p>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
                  <Send size={18} />
                  Agendar Disparo
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active }: any) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}