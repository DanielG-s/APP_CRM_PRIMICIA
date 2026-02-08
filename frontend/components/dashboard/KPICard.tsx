import { KPICardProps } from '@/types/dashboard';

export const KPICard = ({ label, value, subvalue, icon, color }: KPICardProps) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {subvalue && <p className="text-xs text-slate-400 mt-1">{subvalue}</p>}
        </div>
    </div>
);
