"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Filter, Check } from 'lucide-react';

interface FilterDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  sectionTitle?: string;
  labelMap?: Record<string, string>;
  mode?: 'multi' | 'single';
}

export function FilterDropdown({
  options,
  selected,
  onChange,
  label = 'Filtros',
  sectionTitle = 'Filtrar por',
  labelMap,
  mode = 'multi',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (mode === 'single') {
      onChange(selected.includes(option) ? [] : [option]);
      setIsOpen(false);
    } else {
      onChange(
        selected.includes(option)
          ? selected.filter(s => s !== option)
          : [...selected, option]
      );
    }
  };

  const displayLabel =
    selected.length > 0
      ? mode === 'single'
        ? (labelMap?.[selected[0]] ?? selected[0])
        : `${selected.length} Filtros`
      : label;

  const isActive = selected.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition ${
          isActive
            ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
      >
        <Filter size={14} />
        {displayLabel}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 z-30 animate-in fade-in zoom-in-95 duration-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-2">{sectionTitle}</p>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => handleSelect(opt)}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer"
            >
              {mode === 'multi' ? (
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  selected.includes(opt)
                    ? 'bg-violet-600 border-violet-600'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                }`}>
                  {selected.includes(opt) && <Check size={10} className="text-white" />}
                </div>
              ) : (
                <div className="w-4 h-4 flex items-center justify-center">
                  {selected.includes(opt) && <Check size={14} className="text-violet-600 dark:text-violet-400" />}
                </div>
              )}
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {labelMap?.[opt] ?? opt}
              </span>
            </div>
          ))}
          {mode === 'multi' && selected.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2 text-right px-2">
              <button
                onClick={() => onChange([])}
                className="text-[10px] text-red-500 font-bold hover:underline"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
