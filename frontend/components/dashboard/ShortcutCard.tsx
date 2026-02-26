import Link from 'next/link';
import { ShortcutCardProps } from '@/types/dashboard';

export const ShortcutCard = ({ title, desc, icon, href, color }: ShortcutCardProps) => (
    <Link href={href} className="block">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all cursor-pointer group h-full">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${color}`}>
                {icon}
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
    </Link>
);
