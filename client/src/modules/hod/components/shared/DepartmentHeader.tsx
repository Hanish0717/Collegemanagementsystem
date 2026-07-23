import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { Sparkles } from 'lucide-react';

interface DepartmentHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function DepartmentHeader({ title, subtitle, breadcrumbItems = [], actions }: DepartmentHeaderProps) {
  const { departmentInfo } = useHODDepartment();

  const items: BreadcrumbItem[] = [
    { label: 'HOD Workspace', to: '/hod/dashboard' },
    ...breadcrumbItems,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80"
    >
      <div>
        <Breadcrumb items={items} />
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {title}
          </h1>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs flex items-center gap-1">
            <Sparkles className="size-3 text-amber-300" /> {departmentInfo.shortName} Department
          </span>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
    </motion.div>
  );
}
