import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, action, className = '' }: ChartCardProps) {
  return (
    <GlassCard className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 min-h-[220px]">{children}</div>
    </GlassCard>
  );
}
