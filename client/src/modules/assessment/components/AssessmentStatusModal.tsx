import React, { useState } from 'react';
import { Assessment, AssessmentStatus, ASSESSMENT_STATUS_FLOW, STATUS_METADATA } from '@/types/assessment';
import { X, Send, AlertTriangle } from 'lucide-react';

interface AssessmentStatusModalProps {
  assessment: Assessment;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newStatus: AssessmentStatus, comments: string, rejectionReason?: string) => Promise<void>;
}

export const AssessmentStatusModal: React.FC<AssessmentStatusModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AssessmentStatus>(assessment.status);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirm(selectedStatus, comments, rejectionReason);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Update Assessment Workflow Status
            </h3>
            <p className="text-xs text-slate-500">{assessment.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Status Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Target Stage (12 Lifecycle Stages)
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as AssessmentStatus)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ASSESSMENT_STATUS_FLOW.map((st) => (
                <option key={st} value={st}>
                  {STATUS_METADATA[st].stepNumber}. {STATUS_METADATA[st].label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500 italic">
              {STATUS_METADATA[selectedStatus]?.description}
            </p>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Workflow Notes / Audit Comments
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide context or notes regarding this status change..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Optional Rejection Reason */}
          {selectedStatus === 'Draft' && assessment.status === 'Submitted_to_TPO' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Revision Requested / Rejection Rationale</span>
              </div>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this assessment was sent back to Draft for revisions..."
                className="w-full rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Updating Status...' : 'Apply Status Change'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
