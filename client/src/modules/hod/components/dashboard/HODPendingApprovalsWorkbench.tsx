import React, { useState } from 'react';
import { GlassCard } from '../shared/GlassCard';
import { StatusBadge } from '../shared/StatusBadge';
import { NotificationToast } from '../shared/NotificationToast';
import { ClipboardList, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ApprovalItem {
  id: string;
  title: string;
  applicant: string;
  date: string;
  type: string;
  status: string;
}

interface HODPendingApprovalsWorkbenchProps {
  initialApprovals: ApprovalItem[];
}

export function HODPendingApprovalsWorkbench({ initialApprovals }: HODPendingApprovalsWorkbenchProps) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);

  const handleApprove = (id: string, title: string) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item))
    );
    NotificationToast.success('Request Approved', `Signed off ${title}`);
  };

  const handleReject = (id: string, title: string) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Rejected' } : item))
    );
    NotificationToast.error('Request Rejected', `Rejected signoff for ${title}`);
  };

  const pendingCount = approvals.filter((a) => a.status === 'Pending').length;

  return (
    <GlassCard>
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Pending Signoffs & Workflow Approvals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">One-click HOD authorization workbench</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          {pendingCount} Signoffs Needed
        </span>
      </div>

      <div className="space-y-3">
        {approvals.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-600 text-xs">{item.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  {item.type}
                </span>
                <StatusBadge status={item.status} />
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mt-1">{item.title}</h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Applicant: <strong>{item.applicant}</strong> • Submitted: {item.date}
              </p>
            </div>

            {item.status === 'Pending' ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleReject(item.id, item.title)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="size-3.5" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(item.id, item.title)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="size-3.5" /> Approve Signoff
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-400 italic">Signed Off</span>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
