"use client";

import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  align = 'left',
  className = '',
}: SortableHeaderProps) {
  const isActive = sortConfig.key === sortKey;
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  const flexAlign = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th
      className={`px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none ${alignClass} text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${flexAlign}`}>
        {label}
        <span>
          {isActive ? (
            sortConfig.direction === 'asc'
              ? <ArrowUp size={12} className="text-violet-600" />
              : <ArrowDown size={12} className="text-violet-600" />
          ) : (
            <ArrowUpDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-50 transition-opacity" />
          )}
        </span>
      </div>
    </th>
  );
}
