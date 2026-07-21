import React, { ComponentType, useState } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { DepartmentHeader } from '../components/shared/DepartmentHeader';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { FilterPanel } from '../components/shared/FilterPanel';
import { InfoCard } from '../components/shared/InfoCard';
import { Plus, Download, Filter, Info, ShieldAlert, Sparkles } from 'lucide-react';

interface SubModuleConfig {
  slug: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  stats: {
    label: string;
    value: string | number;
    subtitle?: string;
    change?: string;
    icon: ComponentType<{ className?: string }>;
    color?: string;
  }[];
  sampleData: Record<string, any>[];
  columns: Column<any>[];
}

interface HODSubModulePageProps {
  config: SubModuleConfig;
}

export function HODSubModulePage({ config }: HODSubModulePageProps) {
  const { departmentInfo } = useHODDepartment();
  const [filters, setFilters] = useState({});

  return (
    <div className="space-y-6">
      <DepartmentHeader
        title={config.title}
        subtitle={`${config.subtitle} — Filtered for ${departmentInfo.name}`}
        breadcrumbItems={[{ label: config.title }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              <Download className="size-4 text-slate-500" /> Export CSV
            </button>
            <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer">
              <Plus className="size-4" /> Add New Entry
            </button>
          </div>
        }
      />

      <InfoCard
        tone="info"
        icon={Info}
        title={`${config.title} — Department Isolation Layer`}
        description={
          <>
            Displaying official records for <strong>{departmentInfo.name} ({departmentInfo.code})</strong>. HOD access level prevents cross-departmental record modifications.
          </>
        }
      />

      {/* KPI Stats */}
      {config.stats && config.stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.stats.map((stat, idx) => (
            <StatisticsCard
              key={idx}
              label={stat.label}
              value={stat.value}
              subtitle={stat.subtitle}
              change={stat.change}
              icon={stat.icon}
              accentColor={(stat.color as any) || 'blue'}
            />
          ))}
        </div>
      )}

      {/* Filter Cockpit */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      {/* Advanced Data Table */}
      <AdvancedTable
        title={`${departmentInfo.shortName} ${config.title} Records`}
        subtitle={`Live enterprise dataset isolated to ${departmentInfo.name}`}
        columns={config.columns}
        data={config.sampleData}
        keyExtractor={(item) => item.id || item.code || String(Math.random())}
        searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
      />
    </div>
  );
}
