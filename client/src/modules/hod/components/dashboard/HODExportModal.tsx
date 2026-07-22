import React from 'react';
import { X, Download, FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { useHODDepartment } from '@/modules/hod/hooks/useHODDepartment';
import { NotificationToast } from '../shared/NotificationToast';
import { exportToCSV, exportToExcel } from '../../utils/exportUtils';
import { getDepartmentDashboardData } from '../../services/hodDashboardService';

interface HODExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HODExportModal({ isOpen, onClose }: HODExportModalProps) {
  const { departmentInfo, departmentCode } = useHODDepartment();

  if (!isOpen) return null;

  const handleExport = (format: string) => {
    NotificationToast.success(`Export Started (${format})`, `Downloading official ${departmentInfo.shortName} Department Dashboard report...`);
    const data = getDepartmentDashboardData(departmentCode);
    const exportRows = (data.kpiCards || []).map(card => ({
      KPI_ID: card.id,
      Metric: card.title,
      Value: card.value,
      Change: card.change,
      Status: card.badgeText || card.trend,
      Department: departmentInfo.name,
      Generated_At: new Date().toLocaleString()
    }));

    if (format === 'Print') {
      window.print();
    } else if (format === 'Excel') {
      exportToExcel(`HOD_${departmentInfo.shortName}_Dashboard_Report.csv`, exportRows);
    } else {
      exportToCSV(`HOD_${departmentInfo.shortName}_Dashboard_Report.csv`, exportRows);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
          <X className="size-5" />
        </button>

        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="size-5 text-blue-600" />
          Export Department Dashboard
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Select export format for <strong>{departmentInfo.name}</strong> analytics and KPI metrics.
        </p>

        <div className="mt-5 space-y-2.5">
          <button
            onClick={() => handleExport('PDF')}
            className="w-full p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100 transition flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-rose-600 text-white"><FileText className="size-5" /></div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs">Export as PDF / CSV Document</p>
              <p className="text-[10px] text-slate-500 font-medium">Includes high-resolution metrics & executive summary</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('Excel')}
            className="w-full p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 hover:bg-emerald-100 transition flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-emerald-600 text-white"><FileSpreadsheet className="size-5" /></div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs">Export as Excel Spreadsheet (.csv)</p>
              <p className="text-[10px] text-slate-500 font-medium">Complete tabular dataset for all 20 KPI metrics</p>
            </div>
          </button>

          <button
            onClick={() => handleExport('Print')}
            className="w-full p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 hover:bg-blue-100 transition flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-blue-600 text-white"><Printer className="size-5" /></div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs">Print Dashboard</p>
              <p className="text-[10px] text-slate-500 font-medium">Printer-friendly layout formatting</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
