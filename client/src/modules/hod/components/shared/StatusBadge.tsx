import React from 'react';

type StatusType = 'Active' | 'Inactive' | 'Pending' | 'Approved' | 'Rejected' | 'Warning' | 'Completed' | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalized = String(status).toLowerCase();

  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  if (['active', 'approved', 'completed', 'success', 'passed'].includes(normalized)) {
    colorClass = 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs';
  } else if (['pending', 'warning', 'in-progress', 'review'].includes(normalized)) {
    colorClass = 'bg-amber-50/90 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60 shadow-2xs';
  } else if (['inactive', 'rejected', 'failed', 'detention', 'blocked'].includes(normalized)) {
    colorClass = 'bg-rose-50/90 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60 shadow-2xs';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-extrabold tracking-wide ${colorClass}`}>
      <span className="size-1.5 rounded-full bg-current animate-pulse" />
      {label || status}
    </span>
  );
}
