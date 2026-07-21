import { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  subtitle,
  change,
  icon: Icon,
  theme = 'blue',
  hideGraph = false,
  hideChange = false,
}: {
  label: string;
  value: ReactNode;
  subtitle?: string;
  change?: string;
  icon: any;
  theme?: 'blue' | 'green' | 'purple' | 'amber';
  hideGraph?: boolean;
  hideChange?: boolean;
}) {
  // Single Royal Blue design system for all stat cards
  const style = {
    cardBg: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40',
    iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    stroke: '#1d4ed8',
    fill: 'rgba(29, 78, 216, 0.08)',
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden flex flex-col justify-between ${style.cardBg}`}
    >
      <div className="flex items-start justify-between z-10">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</div>
        </div>
        <div className={`size-10 rounded-xl grid place-items-center ${style.iconBg} shadow-xs`}>
          <Icon className="size-5" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 z-10 font-medium">{subtitle}</div>
      )}
      {change && !hideChange && (
        <div className="mt-1 text-xs text-blue-700 dark:text-blue-400 font-bold z-10">{change}</div>
      )}

      {/* Decorative Sparkline Graph SVG */}
      {!hideGraph && (
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-80">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
            <path
              d="M 0 20 Q 20 5, 40 18 T 80 8 T 100 15 L 100 25 L 0 25 Z"
              fill={style.fill}
            />
            <path
              d="M 0 20 Q 20 5, 40 18 T 80 8 T 100 15"
              fill="none"
              stroke={style.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {desc && <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{desc}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode;
  tone?: 'default' | 'success' | 'warn' | 'danger' | 'info' | 'purple' | 'amber';
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    warn: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    purple: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    amber: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = '',
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function QuickLinkItem({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 ${
        active
          ? 'bg-blue-50/80 border-blue-200 text-blue-700 shadow-xs dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-200 hover:bg-blue-50/30'
      }`}
    >
      <div className="size-10 rounded-xl bg-blue-50 dark:bg-slate-800 grid place-items-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-2">
        <Icon className="size-5" />
      </div>
      <span className="text-xs font-semibold text-center tracking-tight">{label}</span>
    </button>
  );
}
