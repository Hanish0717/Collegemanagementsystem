import React from 'react';
import { GlassCard } from './GlassCard';

interface ProgressCardProps {
  title: string;
  percentage: number;
  subtitle?: string;
  color?: string;
}

export function ProgressCard({ title, percentage, subtitle, color = 'bg-blue-600' }: ProgressCardProps) {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <GlassCard>
      <div className="flex justify-between items-center text-xs font-bold mb-2">
        <span className="text-slate-700 dark:text-slate-300">{title}</span>
        <span className="text-slate-900 dark:text-white font-extrabold">{clamped}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${clamped}%` }} />
      </div>
      {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">{subtitle}</p>}
    </GlassCard>
  );
}
