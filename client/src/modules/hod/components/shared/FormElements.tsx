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
    <div className="space-y-1.5 text-xs">
      {label && <label className="block font-extrabold text-slate-800 dark:text-slate-200 tracking-wide">{label}</label>}
      <div className="relative">
        {IconLeft && <IconLeft className="absolute left-3.5 top-2.5 size-4 text-slate-400" />}
        <input
          className={`w-full ${IconLeft ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
            error ? 'border-rose-500 ring-2 ring-rose-500/30' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">{error}</p>
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
    <div className="space-y-1.5 text-xs">
      {label && <label className="block font-extrabold text-slate-800 dark:text-slate-200 tracking-wide">{label}</label>}
      <textarea
        className={`w-full p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
          error ? 'border-rose-500 ring-2 ring-rose-500/30' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">{error}</p>}
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
    <div className="space-y-1.5 text-xs">
      {label && <label className="block font-extrabold text-slate-800 dark:text-slate-200 tracking-wide">{label}</label>}
      <select
        className={`w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer ${
          error ? 'border-rose-500 ring-2 ring-rose-500/30' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">{error}</p>}
    </div>
  );
}

// Form Checkbox
export function FormCheckbox({ label, className = '', ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="inline-flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
      <input type="checkbox" className="size-4 rounded-md accent-blue-600 cursor-pointer" {...props} />
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
        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 flex items-center shadow-2xs ${
          checked ? 'bg-gradient-to-r from-blue-600 to-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
        }`}
      >
        <div className="size-4 rounded-full bg-white shadow-md" />
      </div>
      {label && <span className="text-slate-800 dark:text-slate-200">{label}</span>}
    </label>
  );
}
