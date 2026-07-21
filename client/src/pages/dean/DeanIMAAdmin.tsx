import { useState } from 'react';
import {
  Sparkles, Award, FileText, Download, CalendarCheck, CheckCircle
} from 'lucide-react';
import { Card, StatCard } from '@/components/dashboard/ui';
import { exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

export function DeanIMAAdmin() {
  const [activeTab, setActiveTab] = useState<'grants' | 'publications' | 'patents' | 'fdp'>('grants');

  const [researchGrants, setResearchGrants] = useState([
    { id: 'GRT-501', title: 'DST SERB High Performance Computing AI', investigator: 'Dr. Srinivas Rao (CSE)', amount: '₹25.0 Lakhs', agency: 'DST India', status: 'Pending Dean Release' },
    { id: 'GRT-502', title: 'AICTE Modernization of VLSI Lab', investigator: 'Dr. K. V. Sharma (ECE)', amount: '₹18.5 Lakhs', agency: 'AICTE', status: 'Pending Dean Release' },
  ]);

  const handleDisburseGrant = (id: string, title: string) => {
    setResearchGrants((prev) => prev.filter((g) => g.id !== id));
    toast.success(`[Dean R&D Sanction] Released R&D Grant Disbursement for ${title}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              INNOVATION & RESEARCH COUNCIL
            </span>
            <span className="text-xs text-slate-400 font-mono">IMA Administration</span>
          </div>
          <h1 className="text-2xl font-black text-white">IMA Administration (Research & Mentorship)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Faculty research grant sanctions, IEEE/Scopus publications, IP patent filings, international conferences, and Faculty Development Programs (FDP).
          </p>
        </div>

        <button
          onClick={() => {
            exportToCSV('Dean_RD_Grants_Report', [
              { header: 'Grant ID', key: 'id' },
              { header: 'Project Title', key: 'title' },
              { header: 'Investigator', key: 'investigator' },
              { header: 'Amount', key: 'amount' },
              { header: 'Agency', key: 'agency' },
            ], researchGrants);
            toast.success('Exported R&D Audit Report to CSV!');
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-lg"
        >
          <Download className="size-4" /> Export R&D Report
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Research Grants" value="14" change="₹1.45 Cr Sanctioned" icon={Sparkles} />
        <StatCard label="Scopus/IEEE Papers" value="64" change="AY 2026-27 Index" icon={FileText} />
        <StatCard label="Patents Filed" value="8" change="Intellectual Property" icon={Award} />
        <StatCard label="Seminars & FDPs" value="22" change="Faculty Capability" icon={CalendarCheck} />
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'grants', label: 'Research Grants & Disbursements' },
          { id: 'publications', label: 'Scopus & IEEE Publications' },
          { id: 'patents', label: 'Patents & Intellectual Property' },
          { id: 'fdp', label: 'Faculty Development Programs (FDP)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grants */}
      {activeTab === 'grants' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Sanctioned Research Grants Disbursement Queue</h3>
          <div className="space-y-3">
            {researchGrants.map((g) => (
              <div key={g.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">{g.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Investigator: <strong>{g.investigator}</strong> • Funding Body: {g.agency} • Grant: <strong className="text-emerald-600">{g.amount}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleDisburseGrant(g.id, g.title)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <CheckCircle className="size-3.5" /> Sanction Disbursement
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
