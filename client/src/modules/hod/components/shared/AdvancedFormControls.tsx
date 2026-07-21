import React, { useState } from 'react';
import { Calendar, X, Plus } from 'lucide-react';

export function FormDatePicker({ label, value, onChange }: { label?: string; value: string; onChange: (val: string) => void }) {
  return (
    <div className="space-y-1 text-xs">
      {label && <label className="block font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        <Calendar className="absolute left-3 top-2.5 size-4 text-slate-400" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export function FormDateRange({ label, startDate, endDate, onChange }: { label?: string; startDate: string; endDate: string; onChange: (start: string, end: string) => void }) {
  return (
    <div className="space-y-1 text-xs">
      {label && <label className="block font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 font-semibold"
        />
        <span className="text-slate-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 font-semibold"
        />
      </div>
    </div>
  );
}

export function FormTagInput({ label, tags, onChange }: { label?: string; tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()]);
      setInput('');
    }
  };

  const handleRemove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-1.5 text-xs">
      {label && <label className="block font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold flex items-center gap-1 text-[11px]">
            {tag}
            <button onClick={() => handleRemove(tag)} className="hover:text-rose-600"><X className="size-3" /></button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          placeholder="Add keyword & press Enter..."
          className="flex-1 bg-transparent border-none focus:outline-none text-xs font-semibold p-1"
        />
      </div>
    </div>
  );
}
