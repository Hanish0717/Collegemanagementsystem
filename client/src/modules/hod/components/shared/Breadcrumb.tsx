import React from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
      <Link to="/hod/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1">
        <Home className="size-3.5" />
        <span>HOD</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="size-3 text-slate-400" />
          {item.to && index < items.length - 1 ? (
            <Link to={item.to} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-white font-bold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
