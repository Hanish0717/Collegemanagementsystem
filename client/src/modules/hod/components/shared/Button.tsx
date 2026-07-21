import React, { ButtonHTMLAttributes, ReactNode, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconLeft?: ComponentType<{ className?: string }>;
  iconRight?: ComponentType<{ className?: string }>;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md shadow-blue-500/20 active:scale-[0.98]',
    secondary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md shadow-indigo-500/20 active:scale-[0.98]',
    outline: 'border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md shadow-rose-500/20 active:scale-[0.98]',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold',
    link: 'text-blue-600 dark:text-blue-400 hover:underline font-bold p-0 backdrop-blur-none',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-2xl gap-2',
    lg: 'px-6 py-3 text-sm font-extrabold rounded-2xl gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin shrink-0" />
      ) : IconLeft ? (
        <IconLeft className="size-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {!isLoading && IconRight ? <IconRight className="size-4 shrink-0" /> : null}
    </button>
  );
}
