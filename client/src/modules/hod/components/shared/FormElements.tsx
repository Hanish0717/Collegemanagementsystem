import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, ComponentType } from 'react';

// Form Input
export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: ComponentType<{ className?: string }>;
}

export function FormInput({ label, helperText, error, iconLeft: IconLeft, className = '', ...props }: FormInputProps) {
  return (
    <div className="space-y-1 text-xs">
      {label && <label className="block font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        {IconLeft && <IconLeft className="absolute left-3 top-2.5 size-4 text-slate-400" />}
        <input
          className={`w-full ${IconLeft ? 'pl-9' : 'pl-3'} pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            error ? 'border-rose-500 ring-rose-500' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-rose-600 font-bold">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
}

// Form Textarea
export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function FormTextarea({ label, error, className = '', ...props }: FormTextareaProps) {
  return (
    <div className="space-y-1 text-xs">
      {label && <label className="block font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      <textarea
        className={`w-full p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
          error ? 'border-rose-500 ring-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-rose-600 font-bold">{error}</p>}
    </div>
  );
}

// Form Select
export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function FormSelect({ label, error, children, className = '', ...props }: FormSelectProps) {
  return (
    <div className="space-y-1 text-xs">
      {label && <label className="block font-bold text-slate-700 dark:text-slate-300">{label}</label>}
      <select
        className={`w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
          error ? 'border-rose-500 ring-rose-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-rose-600 font-bold">{error}</p>}
    </div>
  );
}

// Form Checkbox
export function FormCheckbox({ label, className = '', ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
      <input type="checkbox" className="size-4 rounded accent-blue-600 cursor-pointer" {...props} />
      <span className="text-slate-800 dark:text-slate-200">{label}</span>
    </label>
  );
}

// Form Toggle Switch
export function FormToggle({ checked, onChange, label }: { checked: boolean; onChange: (val: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex items-center gap-3 text-xs font-semibold cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${
          checked ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
        }`}
      >
        <div className="size-4 rounded-full bg-white shadow-xs" />
      </div>
      {label && <span className="text-slate-800 dark:text-slate-200">{label}</span>}
    </label>
  );
}
