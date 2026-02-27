"use client";

import React, { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onTutorialClick?: () => void;
  children?: ReactNode;
}

export function PageHeader({ icon, title, subtitle, onTutorialClick, children }: PageHeaderProps) {
  const { user } = useUser();

  return (
    <header className="h-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20 transition-colors">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 p-1.5 rounded-md">
            {icon}
          </span>
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 ml-9">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onTutorialClick && (
          <>
            <button
              onClick={onTutorialClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold cursor-pointer"
            >
              <BookOpen size={16} className="text-violet-500" />
              Como usar?
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          </>
        )}

        {children}

        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {user?.fullName || 'Usuário'}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Merxios Auth</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs transition-colors">
          {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
        </div>
      </div>
    </header>
  );
}
