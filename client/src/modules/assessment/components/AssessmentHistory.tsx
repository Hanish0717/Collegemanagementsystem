import React from 'react';
import { AssessmentStatusHistory } from '@/types/assessment';
import { AssessmentStatusBadge } from './AssessmentStatusBadge';
import { History, ArrowRight } from 'lucide-react';

interface AssessmentHistoryProps {
  history: AssessmentStatusHistory[];
}

export const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
        No status history recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span>Status History Log</span>
      </h4>

      <div className="space-y-3">
        {history.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm space-y-2 text-xs"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {log.from_status ? (
                  <AssessmentStatusBadge status={log.from_status} size="sm" />
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <AssessmentStatusBadge status={log.to_status} size="sm" />
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>

            {log.comments && (
              <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                "{log.comments}"
              </p>
            )}

            <div className="text-[11px] text-slate-400">
              Changed by: <span className="font-semibold text-slate-700 dark:text-slate-300">{log.changed_by}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
