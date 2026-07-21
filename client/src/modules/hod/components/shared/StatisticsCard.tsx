import React, { ComponentType } from 'react';
import { GlassCard } from './GlassCard';

interface StatisticsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: ComponentType<{ className?: string }>;
  accentColor?: string;
}

export function StatisticsCard({
  label,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  accentColor = 'blue',
}: StatisticsCardProps) {
  const colorStyles: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400' },
  };

  const style = colorStyles[accentColor] || colorStyles.blue;

  return (
    <GlassCard className="flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
          <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${style.bg} ${style.text} shadow-xs`}>
          <Icon className="size-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {change && (
          <span
            className={`font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
            }`}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
            {subtitle}
          </span>
        )}
      </div>
    </GlassCard>
  );
}
