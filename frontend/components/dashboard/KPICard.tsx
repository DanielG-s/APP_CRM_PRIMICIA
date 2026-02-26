import { KPICardProps } from '@/types/dashboard';

export const KPICard = ({ label, value, subvalue, icon, color }: KPICardProps) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
            {subvalue && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subvalue}</p>}
        </div>
    </div>
);
