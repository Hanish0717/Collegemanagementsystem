import React from 'react';
import { Check } from 'lucide-react';

export function LinearProgress({ value, label, color = 'bg-blue-600' }: { value: number; label?: string; color?: string }) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1.5 text-xs font-bold">
      {label && (
        <div className="flex justify-between text-slate-700 dark:text-slate-300">
          <span>{label}</span>
          <span className="font-extrabold text-slate-900 dark:text-white">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function CircularProgress({ value, size = 64, strokeWidth = 6, color = '#2563eb' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const percentage = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-100 dark:text-slate-800" fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
          fill="transparent"
        />
      </svg>
      <span className="absolute font-black text-xs text-slate-900 dark:text-white">{percentage}%</span>
    </div>
  );
}

export function StepProgress({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-between w-full text-xs font-extrabold">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2">
              <div
                className={`size-7 rounded-full grid place-items-center transition ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="size-4" /> : idx + 1}
              </div>
              <span className={isCurrent ? 'text-blue-600 font-extrabold' : 'text-slate-500 font-semibold'}>{step}</span>
            </div>
            {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
