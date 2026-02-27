"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (n: number) => void;
}

export function PaginationControl({
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationControlProps) {
  const start = totalItems > 0 ? (page - 1) * itemsPerPage + 1 : 0;
  const end = Math.min(page * itemsPerPage, totalItems);

  return (
    <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {onItemsPerPageChange ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">Exibir</span>
          <select
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-violet-500 outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            de <span className="font-bold">{totalItems}</span> resultados
          </span>
        </div>
      ) : (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {totalItems > 0 ? `${start}-${end} de ${totalItems}` : '0 de 0'}
        </span>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        {onItemsPerPageChange && (
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
            Página {page} de {totalPages || 1}
          </span>
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
