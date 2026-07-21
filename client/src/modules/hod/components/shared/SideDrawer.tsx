import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function SideDrawer({ isOpen, onClose, title, subtitle, children, footer }: SideDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs font-semibold">{children}</div>

        {/* Footer */}
        {footer && <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">{footer}</div>}
      </div>
    </div>
  );
}
