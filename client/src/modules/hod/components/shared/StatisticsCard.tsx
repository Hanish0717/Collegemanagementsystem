import React, { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  const colorStyles: Record<string, { bg: string; text: string; ring: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/20' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/20' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/20' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/20' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/20' },
  };

  const style = colorStyles[accentColor] || colorStyles.blue;

  return (
    <GlassCard className="flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
          <div className="mt-1.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${style.bg} ${style.text} ring-1 ${style.ring} shadow-xs group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="size-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {change && (
          <span
            className={`font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] ${
              isPositive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
            }`}
          >
            {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {change}
          </span>
        )}
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 font-medium truncate ml-auto">
            {subtitle}
          </span>
        )}
      </div>
    </GlassCard>
  );
}
