import React, { ComponentType, ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  description: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  tone?: 'info' | 'warning' | 'success' | 'danger';
}

export function InfoCard({ title, description, icon: Icon, tone = 'info' }: InfoCardProps) {
  const toneClasses = {
    info: 'bg-blue-50/70 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800/40',
    warning: 'bg-amber-50/70 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/40',
    success: 'bg-emerald-50/70 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/40',
    danger: 'bg-rose-50/70 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/40',
  };

  return (
    <div className={`p-4 rounded-2xl border flex items-start gap-3 backdrop-blur-md ${toneClasses[tone]}`}>
      {Icon && <Icon className="size-5 shrink-0 mt-0.5" />}
      <div className="text-xs">
        <h4 className="font-extrabold">{title}</h4>
        <div className="mt-0.5 leading-relaxed font-medium">{description}</div>
      </div>
    </div>
  );
}
