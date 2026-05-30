import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  gradient = "bg-gradient-primary",
}: {
  label: string;
  value: ReactNode;
  change?: string;
  icon: any;
  gradient?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 group hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
          {change && <div className="mt-1 text-xs text-emerald-600">{change} vs last month</div>}
        </div>
        <div
          className={`size-11 rounded-xl ${gradient} grid place-items-center text-white shadow-soft`}
        >
          <Icon className="size-5" />
        </div>
      </div>
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warn" | "danger" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
