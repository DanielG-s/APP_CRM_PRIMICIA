"use client";

import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { HistoryItem } from '@/types/dashboard';

const COLORS = {
    primary: "#6366f1",
    grid: "#e2e8f0"
};

interface RevenueChartProps {
    data: HistoryItem[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-violet-500" /> Evolução Recente
            </h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">Últimos 7 dias</span>
        </div>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `R$${val / 1000}k`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Vendas']}
                    />
                    <Area type="monotone" dataKey="vendas" stroke={COLORS.primary} strokeWidth={3} fill="url(#colorVendas)" activeDot={{ r: 6 }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);
