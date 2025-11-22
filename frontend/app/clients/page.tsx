"use client";

import React, { useEffect, useState } from 'react';
import { 
  Home, Users, BarChart2, MessageCircle, Target, 
  Calendar, Bell, LogOut, Search, Filter 
} from 'lucide-react';
import Link from 'next/link'; // Importante para navegação

export default function ClientsPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await fetch('http://localhost:3000/webhook/erp/customers', { cache: 'no-store' });
        const data = await res.json();
        setClientes(data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClientes();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* --- SIDEBAR (Idêntica à Dashboard) --- */}
      <aside className="w-64 bg-[#1e2336] text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white mr-3">P</div>
          <span className="font-bold text-lg tracking-wide">PRIMÍCIA</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {/* Usamos Link para navegar entre as páginas */}
          <Link href="/">
            <NavItem icon={<Home size={20}/>} label="Visão Geral" />
          </Link>
          
          <Link href="/clients">
            <NavItem icon={<Users size={20}/>} label="Clientes" active />
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
          </div>
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="text-sm text-gray-500">
            CRM / <span className="font-semibold text-indigo-600">Base de Clientes</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-400 cursor-pointer hover:text-indigo-600" size={20} />
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          
          {/* Cabeçalho da Tabela + Busca */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Meus Clientes</h1>
            <div className="flex gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou CPF..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-64"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
                    <Filter size={18} /> Filtros
                </button>
            </div>
          </div>

          {/* TABELA DE DADOS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Nome do Cliente</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Total Gasto (LTV)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">Carregando clientes...</td></tr>
                ) : clientes.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum cliente encontrado.</td></tr>
                ) : (
                    clientes.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{cliente.name}</div>
                            <div className="text-xs text-gray-400">CPF: {cliente.cpf}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{cliente.email}</div>
                            <div className="text-xs text-gray-400">{cliente.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.totalSpent)}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cliente.totalSpent > 1000 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {cliente.totalSpent > 1000 ? 'VIP' : 'Cliente'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                            <button className="text-indigo-600 hover:text-indigo-900 font-medium">Ver Perfil</button>
                        </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
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