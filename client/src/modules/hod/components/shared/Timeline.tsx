import React, { ComponentType } from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  status?: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: 'blue' | 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose';
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  const toneClasses: Record<string, string> = {
    blue: 'bg-blue-600 text-white ring-blue-200 dark:ring-blue-900',
    indigo: 'bg-indigo-600 text-white ring-indigo-200 dark:ring-indigo-900',
    emerald: 'bg-emerald-600 text-white ring-emerald-200 dark:ring-emerald-900',
    purple: 'bg-purple-600 text-white ring-purple-200 dark:ring-purple-900',
    amber: 'bg-amber-600 text-white ring-amber-200 dark:ring-amber-900',
    rose: 'bg-rose-600 text-white ring-rose-200 dark:ring-rose-900',
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {items.map((item) => {
        const Icon = item.icon;
        const toneStyle = toneClasses[item.tone || 'blue'];
        return (
          <div key={item.id} className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-6 top-1 size-5 rounded-full ring-4 ${toneStyle} grid place-items-center shadow-xs`}>
              {Icon && <Icon className="size-3" />}
            </div>

            <div className="bg-white/70 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-extrabold text-slate-900 dark:text-white">{item.title}</h4>
                <span className="font-mono text-[10px] text-slate-400 font-semibold">{item.timestamp}</span>
              </div>
              {item.subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{item.subtitle}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
