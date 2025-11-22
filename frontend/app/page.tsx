"use client"; 

import React, { useEffect, useState } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, 
  Calendar, Bell, LogOut
} from 'lucide-react';
import Link from 'next/link'; // <--- IMPORTANTE: Importar o Link do Next.js
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [totalVendas, setTotalVendas] = useState("R$ 0,00");
  const [dadosGrafico, setDadosGrafico] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const urlBackend = 'http://localhost:3000/webhook/erp/dashboard-total';
        const res = await fetch(urlBackend, { cache: 'no-store' });
        const data = await res.json();
        
        const valorNumerico = Number(data.total) || 0;
        const valorFormatado = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(valorNumerico);

        setTotalVendas(valorFormatado);

        const urlHistory = 'http://localhost:3000/webhook/erp/dashboard-history';
        const resHistory = await fetch(urlHistory, { cache: 'no-store' });
        const dataHistory = await resHistory.json();
        setDadosGrafico(dataHistory);
      } catch (error) {
        console.error("Erro:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#1e2336] text-white flex flex-col shrink-0 transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white mr-3">P</div>
          <span className="font-bold text-lg tracking-wide">PRIMÍCIA</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {/* Link para a própria Home */}
          <Link href="/">
            <NavItem icon={<Home size={20}/>} label="Visão Geral" active />
          </Link>
          
          {/* Link para a tela de Clientes */}
          <Link href="/clients">
            <NavItem icon={<Users size={20}/>} label="Clientes" />
          </Link>

          {/* Link para a tela de Relatórios */}
          <Link href="/reports">
            <NavItem icon={<BarChart2 size={20}/>} label="Relatórios" />
          </Link>

          <div className="pt-4 pb-2 pl-3 text-xs font-semibold text-gray-500 uppercase">Marketing</div>

          {/* Link para a tela de Capmanhas */}
          <Link href="/campaigns">
          <NavItem icon={<MessageCircle size={20}/>} label="Campanhas" />
          </Link>

          <NavItem icon={<Calendar size={20}/>} label="Agenda" />
          <NavItem icon={<Target size={20}/>} label="Metas" />
        </nav>

        <div className="p-4 border-t border-gray-700 bg-[#151926]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-xs">DA</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Daniel Admin</p>
              <p className="text-xs text-gray-500 truncate">Master</p>
            </div>
            <LogOut size={18} className="text-gray-400 hover:text-white cursor-pointer" />
          </div>
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="text-sm text-gray-500">
            CRM / <span className="font-semibold text-indigo-600">Visão Geral</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-400 cursor-pointer hover:text-indigo-600" size={20} />
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Bem-vindo ao Primícia CRM</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Vendas Totais</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalVendas}</h3>
                  </div>
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <BarChart2 size={24} />
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-4 font-medium flex items-center">
                  +12% <span className="text-gray-400 ml-1">vs mês anterior</span>
                </p>
             </div>

             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Novos Clientes</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">145</h3>
                  </div>
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Users size={24} />
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-4 font-medium flex items-center">
                  +5 novos <span className="text-gray-400 ml-1">hoje</span>
                </p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-96">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Evolução de Receita</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosGrafico} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vendas" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVendas)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
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