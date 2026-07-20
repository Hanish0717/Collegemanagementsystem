import React from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Download,
  Printer,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AdvancedTableToolbar({
  onSearch,
  onFilter,
  onExport,
  onPrint,
  searchPlaceholder = 'Search...',
}: {
  onSearch?: (val: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  searchPlaceholder?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 rounded-xl bg-background/50 border-muted"
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
        {onFilter && (
          <Button variant="outline" size="sm" onClick={onFilter} className="rounded-xl shrink-0">
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="rounded-xl shrink-0">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        )}
        {onPrint && (
          <Button variant="outline" size="sm" onClick={onPrint} className="rounded-xl shrink-0">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        )}
      </div>
    </div>
  );
}

export function StyledTable({
  headers,
  children,
}: {
  headers: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function TableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={cn('hover:bg-muted/30 transition-colors group', className)}>{children}</tr>;
}

export function TableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn('px-6 py-4 whitespace-nowrap', className)}>{children}</td>;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between mt-6 px-2">
      <p className="text-sm text-muted-foreground">
        Showing page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
        <span className="font-medium text-foreground">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-8 w-8 p-0"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            // Simple pagination logic for demo, usually involves ellipses
            let pageNum = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              pageNum = currentPage - 2 + i;
              if (pageNum > totalPages) return null;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'rounded-xl h-8 w-8 p-0',
                  currentPage === pageNum && 'bg-primary text-primary-foreground shadow-sm',
                )}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-8 w-8 p-0"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
