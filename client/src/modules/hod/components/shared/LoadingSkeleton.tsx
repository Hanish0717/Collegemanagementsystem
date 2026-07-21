import React from 'react';

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/50">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3 mb-3" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4 mb-4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3" />
        </div>
      ))}
    </div>
  );
}
