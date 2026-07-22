import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <GlassCard className="shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shadow-xs">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
              Pending Signoffs & Workflow Approvals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              One-click HOD authorization workbench
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-md shadow-amber-500/25">
          {pendingCount} Signoffs Needed
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {approvals.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-blue-400/40 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{item.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                    {item.type}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm mt-1.5">{item.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Applicant: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.applicant}</strong> • Submitted: {item.date}
                </p>
              </div>

              {item.status === 'Pending' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(item.id, item.title)}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="size-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(item.id, item.title)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" /> Approve Signoff
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 italic bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                  {item.status}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
