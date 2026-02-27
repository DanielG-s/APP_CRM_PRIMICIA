"use client";

import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subvalue?: string;
  color?: string;
  variant?: 'kpi' | 'compact';
}

export function StatCard({
  icon,
  label,
  value,
  subvalue,
  color = 'bg-slate-100 text-slate-600',
  variant = 'kpi',
}: StatCardProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
          {subvalue && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subvalue}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
        {subvalue && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subvalue}</p>
        )}
      </div>
    </div>
  );
}
