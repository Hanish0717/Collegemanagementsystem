import React, { ReactNode, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Info, Trash2, Edit3, Upload, UserCheck, HelpCircle } from 'lucide-react';
import { Button } from './Button';

export type ModalVariant = 'confirmation' | 'delete' | 'edit' | 'preview' | 'upload' | 'assign' | 'approval' | 'success' | 'warning' | 'info';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  variant?: ModalVariant;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  variant = 'confirmation',
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantIcons: Record<ModalVariant, { icon: any; bg: string; text: string }> = {
    confirmation: { icon: HelpCircle, bg: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-600' },
    delete: { icon: Trash2, bg: 'bg-rose-100 dark:bg-rose-950/50', text: 'text-rose-600' },
    edit: { icon: Edit3, bg: 'bg-indigo-100 dark:bg-indigo-950/50', text: 'text-indigo-600' },
    preview: { icon: Info, bg: 'bg-purple-100 dark:bg-purple-950/50', text: 'text-purple-600' },
    upload: { icon: Upload, bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-600' },
    assign: { icon: UserCheck, bg: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-600' },
    approval: { icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-600' },
    success: { icon: CheckCircle2, bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-600' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-600' },
    info: { icon: Info, bg: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-600' },
  };

  const currentVariant = variantIcons[variant];
  const Icon = currentVariant.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="size-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${currentVariant.bg} ${currentVariant.text} shrink-0`}>
            <Icon className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>}
          </div>
        </div>

        {children && <div className="mt-4 text-xs font-medium space-y-3">{children}</div>}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              variant={variant === 'delete' ? 'danger' : 'primary'}
              size="sm"
              isLoading={isLoading}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
