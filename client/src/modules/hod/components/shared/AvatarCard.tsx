import React from 'react';
import { User } from 'lucide-react';

interface AvatarCardProps {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarCard({ name, subtitle, avatarUrl, badge, size = 'md' }: AvatarCardProps) {
  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className={`${sizeClasses[size]} rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs`} />
      ) : (
        <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black grid place-items-center shadow-xs`}>
          {getInitials(name)}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">{name}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}
