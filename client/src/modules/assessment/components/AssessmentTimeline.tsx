import React from 'react';
import { AssessmentTimelineEvent } from '@/types/assessment';
import { Clock, CheckCircle, FileText, Send, Calendar, ShieldCheck, User } from 'lucide-react';

interface AssessmentTimelineProps {
  timeline: AssessmentTimelineEvent[];
}

export const AssessmentTimeline: React.FC<AssessmentTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
        No timeline events recorded yet.
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CREATED':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'SUBMITTED':
        return <Send className="h-4 w-4 text-amber-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'RESULTS_VERIFIED':
        return <ShieldCheck className="h-4 w-4 text-cyan-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span>Assessment Timeline & Lifecycle Audit</span>
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {timeline.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm">
              {getEventIcon(evt.event_type)}
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3.5 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {evt.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(evt.created_at).toLocaleString()}
                </span>
              </div>
              {evt.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400">{evt.description}</p>
              )}
              {evt.actor_name && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <User className="h-3 w-3" />
                  <span>{evt.actor_name} ({evt.actor_role || 'User'})</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
