"use client";

import React, { useEffect, useState } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, Calendar, Bell, LogOut, PieChart as PieIcon 
} from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [rfmData, setRfmData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRFM() {
      try {
        const res = await fetch('http://localhost:3000/webhook/crm/intelligence/rfm', { cache: 'no-store' });
        const data = await res.json();
        setRfmData(data);
      } catch (error) {
        console.error("Erro RFM:", error);
      }
    }
    fetchRFM();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* SIDEBAR PADRÃO */}
      <aside className="w-64 bg-[#1e2336] text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white mr-3">P</div>
          <span className="font-bold text-lg tracking-wide">PRIMÍCIA</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <Link href="/"><NavItem icon={<Home size={20}/>} label="Visão Geral" /></Link>
          <Link href="/clients"><NavItem icon={<Users size={20}/>} label="Clientes" /></Link>
          <Link href="/reports"><NavItem icon={<BarChart2 size={20}/>} label="Relatórios" active /></Link>
          
          <div className="pt-4 pb-2 pl-3 text-xs font-semibold text-gray-500 uppercase">Marketing</div>

          {/* Link para a tela de Capmanhas */}
          <Link href="/campaigns">
          <NavItem icon={<MessageCircle size={20}/>} label="Campanhas" />
          </Link>
          
          <NavItem icon={<Calendar size={20}/>} label="Agenda" />
          <NavItem icon={<Target size={20}/>} label="Metas" />
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="text-sm text-gray-500">
            CRM / <span className="font-semibold text-indigo-600">Inteligência RFM</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-400 cursor-pointer hover:text-indigo-600" size={20} />
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Saúde da Base (RFM)</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CARD DO GRÁFICO */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <PieIcon size={20} className="text-indigo-500"/> Distribuição de Clientes
              </h3>
              <div className="w-full h-full pb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rfmData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60} // Faz virar uma Rosca (Donut)
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {rfmData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CARD DE EXPLICAÇÃO (Dito Explica) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Entenda os Grupos</h3>
              <div className="space-y-4">
                <InfoItem color="bg-emerald-500" title="VIPs" desc="Gastaram +R$1k e compraram nos últimos 30 dias." />
                <InfoItem color="bg-blue-500" title="Ativos" desc="Compraram nos últimos 2 meses." />
                <InfoItem color="bg-amber-500" title="Em Risco" desc="Sem comprar há 4 meses. Ação necessária!" />
                <InfoItem color="bg-red-500" title="Perdidos" desc="Inativos há muito tempo." />
              </div>
              
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h4 className="text-indigo-800 font-semibold text-sm mb-1">Dica de Ouro 💡</h4>
                <p className="text-indigo-600 text-sm">
                  Tente recuperar os clientes "Em Risco" enviando um cupom de desconto via WhatsApp.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ color, title, desc }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-3 h-3 mt-1.5 rounded-full ${color} shrink-0`} />
      <div>
        <p className="font-bold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
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