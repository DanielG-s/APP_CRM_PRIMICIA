"use client";

import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
  colSpan?: number;
}

export function EmptyState({ icon, title, message, action, colSpan }: EmptyStateProps) {
  const content = (
    <div className="p-12 text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
        {icon ?? <AlertCircle size={32} />}
      </div>
      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">{title}</h3>
      {message && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );

  if (colSpan !== undefined) {
    return (
      <tr>
        <td colSpan={colSpan}>{content}</td>
      </tr>
    );
  }

  return content;
}
