import React from 'react';
import { AssessmentStatus, ASSESSMENT_STATUS_FLOW, STATUS_METADATA } from '@/types/assessment';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';

interface AssessmentWorkflowStepperProps {
  currentStatus: AssessmentStatus;
  onSelectStatus?: (status: AssessmentStatus) => void;
}

export const AssessmentWorkflowStepper: React.FC<AssessmentWorkflowStepperProps> = ({
  currentStatus,
  onSelectStatus
}) => {
  const currentIndex = ASSESSMENT_STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="w-full space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Assessment Lifecycle Workflow (12 Stages)
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Step {currentIndex >= 0 ? currentIndex + 1 : 1} of 12
        </span>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {ASSESSMENT_STATUS_FLOW.map((statusKey, index) => {
          const meta = STATUS_METADATA[statusKey];
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <button
              key={statusKey}
              type="button"
              onClick={() => onSelectStatus && onSelectStatus(statusKey)}
              disabled={!onSelectStatus}
              className={`relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/30 font-semibold shadow-sm'
                  : isCompleted
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">
                  #{index + 1}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
              <span className="text-xs font-semibold line-clamp-1">{meta.label}</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 font-normal">
                {meta.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
