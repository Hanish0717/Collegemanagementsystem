import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter, Search } from 'lucide-react';
import { DataTable, Column } from './DataTable';

interface AdvancedTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilterKeys?: (keyof T)[];
  actions?: React.ReactNode;
}

export function AdvancedTable<T>({
  title,
  subtitle,
  columns,
  data,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  searchFilterKeys = [],
  actions,
}: AdvancedTableProps<T>) {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredData = data.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();

    if (searchFilterKeys.length > 0) {
      return searchFilterKeys.some((k) => String(item[k] ?? '').toLowerCase().includes(q));
    }

    return Object.values(item as any).some((val) => String(val ?? '').toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {(title || actions || searchPlaceholder) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl">
          <div>
            {title && <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
            </div>
            {actions}
          </div>
        </div>
      )}

      <DataTable columns={columns} data={paginatedData} keyExtractor={keyExtractor} />

      <div className="flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400 font-medium">
        <div>
          Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="px-3 py-1 font-bold text-slate-800 dark:text-slate-200">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
