import React from 'react';
import { AssessmentStatus, STATUS_METADATA } from '@/types/assessment';

interface AssessmentStatusBadgeProps {
  status: AssessmentStatus;
  size?: 'sm' | 'md' | 'lg';
  showStepNumber?: boolean;
}

export const AssessmentStatusBadge: React.FC<AssessmentStatusBadgeProps> = ({
  status,
  size = 'md',
  showStepNumber = false
}) => {
  const meta = STATUS_METADATA[status] || STATUS_METADATA['Draft'];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${meta.bgColor} ${sizeClasses}`}
      title={meta.description}
    >
      {showStepNumber && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 text-[10px] font-bold">
          {meta.stepNumber}
        </span>
      )}
      <span>{meta.label}</span>
    </span>
  );
};
