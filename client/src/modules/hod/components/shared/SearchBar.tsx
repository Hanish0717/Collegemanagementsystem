import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Global search...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-2.5 size-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 text-xs font-semibold backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-xs"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
