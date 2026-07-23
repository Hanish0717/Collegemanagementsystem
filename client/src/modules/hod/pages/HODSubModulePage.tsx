import React, { ComponentType, useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { DepartmentHeader } from '../components/shared/DepartmentHeader';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { FilterPanel } from '../components/shared/FilterPanel';
import { InfoCard } from '../components/shared/InfoCard';
import { Modal } from '../components/shared/Modal';
import { NotificationToast } from '../components/shared/NotificationToast';
import { exportToCSV } from '../utils/exportUtils';
import { Plus, Download, Filter, Info, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

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

  // Dynamic Table Data State with localStorage Persistence
  const [tableData, setTableData] = useState<Record<string, any>[]>(config.sampleData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Specialized form state for communication and other submodules
  const [commSubject, setCommSubject] = useState('');
  const [commRecipient, setCommRecipient] = useState('All Students & Faculty');
  const [commChannel, setCommChannel] = useState('Email & In-App Notification');
  const [commDate, setCommDate] = useState(new Date().toISOString().split('T')[0]);
  const [commStatus, setCommStatus] = useState('Delivered');

  // Generic form state fallback
  const [genericForm, setGenericForm] = useState<Record<string, string>>({});

  const storageKey = `cms_hod_submodule_${config.slug}_${departmentInfo.shortName}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setTableData(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error loading submodule store:', e);
      }
    }
    setTableData(config.sampleData);
  }, [config.slug, departmentInfo.shortName, config.sampleData]);

  const saveTableDataToStore = (newData: Record<string, any>[]) => {
    setTableData(newData);
    localStorage.setItem(storageKey, JSON.stringify(newData));
    window.dispatchEvent(new CustomEvent('hod_store_updated'));
  };

  // 1. Export CSV Action
  const handleExportCSV = () => {
    const filename = `${departmentInfo.shortName}_${config.title.replace(/[^a-zA-Z0-9]/g, '_')}_Records.csv`;

    const formattedData = tableData.map((row) => {
      const exportRow: Record<string, any> = {};
      config.columns.forEach((col) => {
        const rawVal = row[col.key] || row[col.key.toLowerCase()] || '';
        exportRow[col.header] = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal);
      });
      return exportRow;
    });

    exportToCSV(filename, formattedData);

    NotificationToast.success(
      'CSV Export Downloaded',
      `Exported ${formattedData.length} ${config.title} records for ${departmentInfo.shortName} department.`
    );
  };

  // 2. Add New Entry Action
  const handleOpenAddModal = () => {
    setCommSubject('');
    setCommRecipient('All Students & Faculty');
    setCommChannel('Email & In-App Notification');
    setCommDate(new Date().toISOString().split('T')[0]);
    setCommStatus('Delivered');

    const initialForm: Record<string, string> = {};
    config.columns.forEach((col) => {
      initialForm[col.key] = '';
    });
    setGenericForm(initialForm);
    setIsAddModalOpen(true);
  };

  const handleSaveNewEntry = () => {
    let newEntry: Record<string, any> = {};

    if (config.slug === 'communication') {
      if (!commSubject.trim()) {
        NotificationToast.warning('Missing Notice Subject', 'Please enter a valid notice subject or circular topic.');
        return;
      }

      newEntry = {
        id: `CIR-2026-${Math.floor(Math.random() * 900 + 100)}`,
        title: commSubject,
        notice: commSubject,
        subject: commSubject,
        recipient: commRecipient,
        group: commRecipient,
        channel: commChannel,
        date: commDate,
        status: commStatus,
        sender: `Dr. HOD (${departmentInfo.shortName})`,
      };
    } else {
      newEntry = {
        id: `REC-${Date.now()}`,
        ...genericForm,
        day: genericForm.day || 'Monday',
        time: genericForm.time || new Date().toLocaleString(),
        status: genericForm.status || 'Active',
        action: genericForm.action || 'Created New Department Entry',
        user: genericForm.user || `Dr. HOD (${departmentInfo.shortName})`,
      };

      const firstColKey = config.columns[0]?.key;
      if (firstColKey && !newEntry[firstColKey]) {
        newEntry[firstColKey] = `New ${config.title} Record`;
      }
    }

    const updated = [newEntry, ...tableData];
    saveTableDataToStore(updated);

    setIsAddModalOpen(false);
    NotificationToast.success(
      'New Circular Broadcast Created',
      `Broadcast notice "${commSubject || 'New Record'}" dispatched to ${commRecipient}.`
    );
  };

  return (
    <div className="space-y-6">
      <DepartmentHeader
        title={config.title}
        subtitle={`${config.subtitle} — Filtered for ${departmentInfo.name}`}
        breadcrumbItems={[{ label: config.title }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="size-4 text-slate-500" /> Export CSV
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
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
        data={tableData}
        keyExtractor={(item) => item.id || item.code || String(Math.random())}
        searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
      />

      {/* Add New Entry Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          config.slug === 'communication'
            ? 'Broadcast New Department Circular'
            : `Add New ${config.title} Entry`
        }
        subtitle={`Create new official record for ${departmentInfo.name}`}
        variant="edit"
        confirmLabel={config.slug === 'communication' ? 'Broadcast Notice Now' : 'Save New Entry'}
        onConfirm={handleSaveNewEntry}
      >
        {config.slug === 'communication' ? (
          /* Easy, Intuitive Form Controls for Communication Center */
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                Notice / Circular Subject
              </label>
              <input
                type="text"
                value={commSubject}
                onChange={(e) => setCommSubject(e.target.value)}
                placeholder="e.g. Mid-Term 2 Examination Time Table Announcement"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                Recipient Group (Who gets this notice?)
              </label>
              <select
                value={commRecipient}
                onChange={(e) => setCommRecipient(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="All Students & Faculty">All Department Students & Faculty (504 People)</option>
                <option value="Sem 5 Students">Sem 5 Students (120 Students)</option>
                <option value="Sem 3 Students">Sem 3 Students (120 Students)</option>
                <option value="Department Faculty Members">Department Faculty Members Only (24 Faculty)</option>
                <option value="All Parents & Guardians">All Parents & Guardians (480 Parents)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Dispatch Channel
                </label>
                <select
                  value={commChannel}
                  onChange={(e) => setCommChannel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="Email & In-App Notification">Email & In-App Push</option>
                  <option value="Email Broadcast Only">Email Broadcast Only</option>
                  <option value="SMS Alert Only">SMS Alert Only</option>
                  <option value="Official Noticeboard PDF">Official Noticeboard PDF</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Broadcast Date
                </label>
                <input
                  type="date"
                  value={commDate}
                  onChange={(e) => setCommDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                Delivery Status
              </label>
              <select
                value={commStatus}
                onChange={(e) => setCommStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <option value="Delivered">Delivered (Broadcast Immediately)</option>
                <option value="Scheduled">Scheduled (Queue for Tomorrow 09:00 AM)</option>
                <option value="Draft">Save as Internal Draft</option>
              </select>
            </div>
          </div>
        ) : (
          /* Generic Form Fallback for Other Submodules */
          <div className="space-y-3">
            {config.columns.map((col) => (
              <div key={col.key}>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {col.header}
                </label>
                <input
                  type="text"
                  value={genericForm[col.key] || ''}
                  onChange={(e) =>
                    setGenericForm((prev) => ({ ...prev, [col.key]: e.target.value }))
                  }
                  placeholder={`Enter ${col.header.toLowerCase()}...`}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-semibold text-xs"
                />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
