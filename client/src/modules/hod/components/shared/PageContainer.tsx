import React, { ReactNode } from 'react';
import { DepartmentHeader } from './DepartmentHeader';
import { BreadcrumbItem } from './Breadcrumb';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: ReactNode;
  filters?: ReactNode;
  stats?: ReactNode;
  children: ReactNode;
  footerActions?: ReactNode;
}

export function PageContainer({
  title,
  subtitle,
  breadcrumbItems = [],
  actions,
  filters,
  stats,
  children,
  footerActions,
}: PageContainerProps) {
  return (
    <div className="space-y-6">
      {/* Standardized Header */}
      <DepartmentHeader
        title={title}
        subtitle={subtitle}
        breadcrumbItems={breadcrumbItems}
        actions={actions}
      />

      {/* KPI Stats Grid Slot */}
      {stats && <div className="space-y-4">{stats}</div>}

      {/* Filters Slot */}
      {filters && <div>{filters}</div>}

      {/* Main Content Area */}
      <div className="space-y-6">{children}</div>

      {/* Footer Actions */}
      {footerActions && (
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          {footerActions}
        </div>
      )}
    </div>
  );
}
