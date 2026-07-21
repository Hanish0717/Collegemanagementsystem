import React, { ComponentType, ReactNode } from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
}

export function EmptyState({
  title = 'No Department Data Found',
  description = 'There are no records matching your current department filter.',
  icon: Icon = FolderOpen,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
        <Icon className="size-8" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 font-medium">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
