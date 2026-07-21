import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hoverEffect = true, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm ${
        hoverEffect ? 'transition-all duration-300 hover:shadow-lg hover:border-blue-500/40 hover:-translate-y-0.5' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
