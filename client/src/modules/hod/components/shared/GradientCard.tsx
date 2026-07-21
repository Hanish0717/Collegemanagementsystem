import React, { ReactNode } from 'react';

interface GradientCardProps {
  children: ReactNode;
  gradient?: string;
  className?: string;
}

export function GradientCard({
  children,
  gradient = 'from-blue-600 via-indigo-600 to-purple-700',
  className = '',
}: GradientCardProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} text-white rounded-3xl p-6 shadow-xl relative overflow-hidden ${className}`}>
      <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
