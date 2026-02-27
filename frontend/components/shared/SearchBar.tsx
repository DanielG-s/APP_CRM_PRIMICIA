"use client";

import React, { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...', children }: SearchBarProps) {
  return (
    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-3">
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 flex-1 focus-within:border-violet-400 transition-colors">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          className="bg-transparent outline-none text-sm w-full placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-100"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
