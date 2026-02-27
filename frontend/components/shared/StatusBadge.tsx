"use client";

import React from 'react';

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, string>;
  fallback?: string;
  size?: 'xs' | 'sm';
  dot?: boolean;
}

export function StatusBadge({
  status,
  colorMap,
  fallback = 'bg-gray-100 text-gray-500 border-gray-200',
  size = 'xs',
  dot = false,
}: StatusBadgeProps) {
  const colorClass = colorMap[status] ?? fallback;
  const textSize = size === 'xs' ? 'text-[9px]' : 'text-[10px]';
  const padding = size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-1';

  return (
    <span
      className={`inline-flex items-center rounded font-bold uppercase tracking-wide border ${textSize} ${padding} ${colorClass}`}
    >
      {dot && <span className="mr-0.5">•</span>}
      {status}
    </span>
  );
}
