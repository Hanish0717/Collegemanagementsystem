import { useState } from 'react';
import { ShieldCheck, CheckCircle, X, Download } from 'lucide-react';
import { Card, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function DeanApprovals() {
  const [approvals, setApprovals] = useState([
    { id: 'DA-101', type: 'Research Grant', detail: '₹5.5L — AI Supercomputing Node Lab (Dr. Srinivas Rao)', domain: 'IMA' },
    { id: 'DA-102', type: 'Curriculum Revision', detail: 'B.Tech CSE 2026-27 Syllabus Modernization (GenAI Elective)', domain: 'Academic' },
    { id: 'DA-103', type: 'Exam Re-evaluation', detail: 'Bulk Grace Marks Appeal — 14 Students (Data Structures)', domain: 'Examination' },
  ]);

  const handleApprove = (id: string, detail: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    toast.success(`[Dean Sanctioned] Approved ${id}: ${detail}`);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
            DEAN APPROVAL QUEUE
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Pending Executive Approvals</h1>
        </div>
      </div>

      <Card className="p-5">
        <div className="space-y-3">
          {approvals.map(a => (
            <div key={a.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-600">{a.id}</span>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">{a.type}</span>
                </div>
                <p className="text-xs text-slate-500">{a.detail}</p>
              </div>
              <button onClick={() => handleApprove(a.id, a.detail)} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                <CheckCircle className="size-3.5" /> Approve Request
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
