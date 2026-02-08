import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RecentSale } from '@/types/dashboard';

interface RecentSalesListProps {
    sales: RecentSale[];
}

export const RecentSalesList = ({ sales }: RecentSalesListProps) => (
    <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingBag size={18} className="text-emerald-500" /> Últimas Vendas
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {sales.length === 0 && <p className="text-xs text-slate-400 italic">Nenhuma venda recente.</p>}

            {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                    <div>
                        <p className="text-xs font-bold text-slate-700">{sale.customer}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{sale.store}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600">
                            +{sale.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
        <Link href="/results/retail" className="mt-4 text-xs font-bold text-violet-600 flex items-center justify-center gap-1 hover:underline pt-2 border-t border-slate-100">
            Ver Relatório Completo <ArrowRight size={12} />
        </Link>
    </div>
);
