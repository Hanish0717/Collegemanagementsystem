import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: any;
  onClick: () => void;
  isDanger?: boolean;
}

export function ActionsMenu({ items }: { items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 transition cursor-pointer"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl z-30 text-xs font-semibold animate-in fade-in zoom-in-95 duration-150">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl transition text-left cursor-pointer ${
                  item.isDanger
                    ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                {Icon && <Icon className="size-4" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
