import { useState } from 'react';
import {
  ShieldCheck, Award, FileText, CheckCircle, Download, Printer, Plus,
  TrendingUp, Users, Star, BarChart3, ChevronRight
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { exportToCSV, printReport } from '@/lib/exportUtils';
import { toast } from 'sonner';

export function IqacQualitySuite() {
  const [naacCriteria] = useState([
    { code: 'C-1', title: 'Curricular Aspects', score: 3.85, max: 4.0, filesCount: 14, status: 'Verified' },
    { code: 'C-2', title: 'Teaching-Learning & Evaluation', score: 3.90, max: 4.0, filesCount: 22, status: 'Verified' },
    { code: 'C-3', title: 'Research, Innovations & Extension', score: 3.72, max: 4.0, filesCount: 18, status: 'Audit Pending' },
    { code: 'C-4', title: 'Infrastructure & Learning Resources', score: 3.95, max: 4.0, filesCount: 16, status: 'Verified' },
    { code: 'C-5', title: 'Student Support & Progression', score: 3.88, max: 4.0, filesCount: 12, status: 'Verified' },
    { code: 'C-6', title: 'Governance, Leadership & Management', score: 3.80, max: 4.0, filesCount: 15, status: 'Verified' },
    { code: 'C-7', title: 'Institutional Values & Best Practices', score: 3.92, max: 4.0, filesCount: 10, status: 'Verified' },
  ]);

  const [atrs] = useState([
    { id: 'ATR-2026-01', title: 'Lab Modernization Action Plan', dept: 'CSE', date: 'Jul 15', status: 'Implemented' },
    { id: 'ATR-2026-02', title: 'Faculty Outcome-Based Education (OBE) Workshop', dept: 'Academic Cell', date: 'Jul 10', status: 'In Progress' },
  ]);

  const handleExportCSV = () => {
    exportToCSV('IQAC_NAAC_Accreditation_Audit', [
      { header: 'Criterion Code', key: 'code' },
      { header: 'Title', key: 'title' },
      { header: 'Score (out of 4.0)', key: 'score' },
      { header: 'Supporting Files', key: 'filesCount' },
      { header: 'Status', key: 'status' },
    ], naacCriteria);
    toast.success('IQAC Quality Ledger exported to CSV!');
  };

  const handlePrint = () => {
    printReport(
      'IQAC Institutional Quality Audit & NAAC Report',
      'Accreditation Scores & Criteria Verification Status',
      [
        { header: 'Code', key: 'code' },
        { header: 'Criterion Title', key: 'title' },
        { header: 'Internal Audit Score', key: 'score' },
        { header: 'Verification Status', key: 'status' },
      ],
      naacCriteria
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-400/30">
                INTERNAL QUALITY ASSURANCE CELL (IQAC)
              </span>
              <span className="text-xs text-slate-400 font-mono">NAAC A++ Governance</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="size-7 text-violet-400" /> Accreditation & Quality Suite
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              NAAC 7 Criteria audit management, NBA Tier-1 metrics, NIRF rankings data, Action Taken Reports (ATR) & feedback analysis.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleExportCSV} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Download className="size-4 text-violet-400" /> Export CSV
            </button>
            <button onClick={handlePrint} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Printer className="size-4 text-violet-400" /> Print Audit
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Overall CGPA Score" value="3.84 / 4.0" change="NAAC A++ Accredited" icon={Award} />
        <StatCard label="NBA Accredited Programs" value="6 / 6" change="Tier-1 Compliance" icon={CheckCircle} />
        <StatCard label="NIRF Ranking Band" value="Top 50" change="Engineering Discipline" icon={TrendingUp} />
        <StatCard label="Student Feedback Rating" value="4.6 / 5.0" change="94% Participation" icon={Star} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">NAAC 7 Criteria Self-Study Scores</h3>
            <div className="space-y-3">
              {naacCriteria.map(c => (
                <div key={c.code} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-violet-600 bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded">{c.code}</span>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{c.title}</span>
                    </div>
                    <Badge tone={c.status === 'Verified' ? 'success' : 'warn'} className="text-[9px]">{c.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Audit Score: <strong className="text-violet-600 font-mono">{c.score} / {c.max}</strong></span>
                    <span className="text-slate-400 font-normal text-[11px]">{c.filesCount} Evidence Documents</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-2 overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: `${(c.score / c.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Action Taken Reports (ATR)</h3>
            <div className="space-y-3">
              {atrs.map(a => (
                <div key={a.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-400 text-[10px]">{a.id}</span>
                    <Badge tone={a.status === 'Implemented' ? 'success' : 'info'} className="text-[9px]">{a.status}</Badge>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{a.title}</div>
                  <div className="text-slate-500 text-[10px] mt-1">Dept: {a.dept} • Date: {a.date}</div>
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('New Action Taken Report drafted.')} className="w-full mt-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer">
              Draft New ATR Document
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
