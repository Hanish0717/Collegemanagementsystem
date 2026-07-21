import { FileText, Download, Printer } from 'lucide-react';
import { Card } from '@/components/dashboard/ui';
import { exportToCSV, printReport } from '@/lib/exportUtils';
import { toast } from 'sonner';

export function DeanReports() {
  const reports = [
    { title: 'Institutional Academic Audit AY 2026-27', domain: 'Academic', date: 'Jul 21' },
    { title: 'NAAC Criteria 1-7 Self-Study Compliance Log', domain: 'IQAC', date: 'Jul 20' },
    { title: 'R&D Grants & Patent Disbursal Statement', domain: 'IMA', date: 'Jul 19' },
    { title: 'Low Attendance & Condonation Defaulters List', domain: 'Student Admin', date: 'Jul 18' },
  ];

  const handleExport = (title: string, domain: string) => {
    exportToCSV(`Dean_Report_${domain}`, [
      { header: 'Report Title', key: 'title' },
      { header: 'Domain', key: 'domain' },
      { header: 'Generated Date', key: 'date' },
    ], [{ title, domain, date: new Date().toLocaleDateString() }]);
    toast.success(`Exported ${title} to CSV!`);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
            DEAN EXECUTIVE REPORTS
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Institutional Academic & R&D Reports</h1>
        </div>
      </div>

      <Card className="p-5">
        <div className="space-y-3">
          {reports.map((r, i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">{r.domain}</span>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">{r.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Generated: {r.date}</p>
              </div>
              <button onClick={() => handleExport(r.title, r.domain)} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                <Download className="size-3.5" /> Download CSV
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
