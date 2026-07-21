import { useState } from 'react';
import {
  Check, X, MessageSquare, Clock, FileText, Paperclip, Send,
  AlertCircle, ShieldCheck, UserCheck, History, ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export interface ApprovalRequest {
  id: string;
  title: string;
  requestor: string;
  role: string;
  department: string;
  domain: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  details: string;
  attachments?: string[];
  history?: {
    date: string;
    actor: string;
    role: string;
    action: string;
    comment?: string;
  }[];
}

interface Props {
  request: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: (requestId: string, action: 'approved' | 'rejected' | 'changes_requested', comment: string) => void;
}

export function ApprovalSystemModal({ request, isOpen, onClose, onActionComplete }: Props) {
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  if (!isOpen || !request) return null;

  const handleAction = (action: 'approved' | 'rejected' | 'changes_requested') => {
    if (action === 'rejected' && !comment.trim()) {
      toast.error('Please provide a reason in the comments box for rejection.');
      return;
    }
    onActionComplete(request.id, action, comment);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-2xl">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                  {request.id}
                </span>
                <Badge tone={request.urgency === 'critical' || request.urgency === 'high' ? 'danger' : 'warn'} className="text-[9px] uppercase">
                  {request.urgency} Urgency
                </Badge>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{request.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition cursor-pointer ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Request Details & Attachments
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="size-3.5" /> Audit Timeline
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'details' ? (
            <>
              {/* Requestor Info Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Submitted By</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{request.requestor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Role / Position</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{request.role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Department</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{request.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Submission Date</span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{request.date}</span>
                </div>
              </div>

              {/* Request Details Description */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1.5">Description & Justification</h4>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {request.details}
                </div>
              </div>

              {/* Attachments */}
              {request.attachments && request.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
                    <Paperclip className="size-3.5 text-blue-600" /> Supporting Attachments
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {request.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
                        <FileText className="size-4 text-blue-600" />
                        <span>{att}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment / Remarks Box */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
                  <MessageSquare className="size-3.5 text-slate-500" /> Approver Comments / Remarks
                </h4>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Enter remarks or justification for decision (Required if rejecting)..."
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[75px]"
                />
              </div>
            </>
          ) : (
            /* Audit Timeline View */
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Workflow History Trail</h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {(request.history || [
                  { date: request.date, actor: request.requestor, role: request.role, action: 'Submitted Approval Request', comment: 'Initial request submission' }
                ]).map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div className="absolute -left-6 top-0.5 size-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-slate-900 dark:text-white">{item.actor} ({item.role})</span>
                        <span className="font-mono text-[10px] text-slate-400">{item.date}</span>
                      </div>
                      <p className="font-semibold text-blue-600 text-[11px]">{item.action}</p>
                      {item.comment && <p className="text-[11px] text-slate-500 mt-1 italic">"{item.comment}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => handleAction('changes_requested')}
            className="px-4 py-2 rounded-xl border border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-xs transition cursor-pointer"
          >
            Request Changes
          </button>
          <button
            onClick={() => handleAction('rejected')}
            className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
          >
            <X className="size-4" /> Reject Request
          </button>
          <button
            onClick={() => handleAction('approved')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-1 cursor-pointer"
          >
            <Check className="size-4" /> Approve Request
          </button>
        </div>
      </div>
    </div>
  );
}
