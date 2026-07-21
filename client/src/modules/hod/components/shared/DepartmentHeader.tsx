import React, { ReactNode } from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { useHODDepartment } from '../../hooks/useHODDepartment';

interface DepartmentHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function DepartmentHeader({ title, subtitle, breadcrumbItems = [], actions }: DepartmentHeaderProps) {
  const { departmentInfo } = useHODDepartment();

  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', to: '/hod/dashboard' },
    ...breadcrumbItems,
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
      <div>
        <Breadcrumb items={items} />
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {departmentInfo.shortName} Dept
          </span>
        </div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
