import { useState } from 'react';
import { ShieldCheck, Award, FileText, Download, CheckCircle } from 'lucide-react';
import { Badge, Card, StatCard } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function DeanIQACAdmin() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              IQAC QUALITY GOVERNANCE
            </span>
            <span className="text-xs text-slate-400 font-mono">NAAC A++ Suite</span>
          </div>
          <h1 className="text-2xl font-black text-white">IQAC Quality Governance & NAAC Audit</h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional self-study report (SSR) verification, NBA accreditation status, and annual quality assurance audit.
          </p>
        </div>
        <button onClick={() => toast.success('Exported IQAC Quality Audit Report.')} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0">
          <Download className="size-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="NAAC Score" value="3.84 / 4.0" change="Grade A++" icon={Award} />
        <StatCard label="NBA Programs" value="6 / 6" change="Tier-1 Accredited" icon={CheckCircle} />
        <StatCard label="AQAR Report" value="Submitted" change="AY 2025-26" icon={FileText} />
        <StatCard label="Audit Compliance" value="100%" change="Verified" icon={ShieldCheck} />
      </div>

      <Card className="p-5">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">NAAC 7 Criteria Quality Verification</h3>
        <p className="text-xs text-slate-500 mb-4">All 7 NAAC criteria documents have been audited and verified by the Dean IQAC Council.</p>
        <button onClick={() => toast.success('NAAC Self-Study Report (SSR) digitally signed & submitted.')} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer">
          Digitally Sign SSR Report
        </button>
      </Card>
    </div>
  );
}
