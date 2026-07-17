import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  className,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  trendLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'indigo';
  className?: string;
}) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  };

  return (
    <div
      className={cn(
        'p-6 rounded-3xl border bg-card/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 group',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div
          className={cn(
            'p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110',
            colorStyles[color],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {trend && (
          <div
            className={cn(
              'flex items-center text-sm font-medium mb-1',
              trend.isPositive ? 'text-emerald-500' : 'text-rose-500',
            )}
          >
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}%
            {trendLabel && (
              <span className="text-muted-foreground ml-1.5 text-xs">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function GlassCard({
  children,
  className,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative rounded-3xl border bg-background/40 backdrop-blur-2xl shadow-sm overflow-hidden',
        glow &&
          'before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GradientHeader({
  title,
  description,
  icon: Icon,
  color = 'from-blue-600 to-indigo-600',
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border mb-6">
      <div className={cn('absolute inset-0 bg-gradient-to-r opacity-10', color)}></div>
      <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {Icon && (
            <div className={cn('p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br', color)}>
              <Icon className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="text-muted-foreground mt-1.5 text-base">{description}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}
