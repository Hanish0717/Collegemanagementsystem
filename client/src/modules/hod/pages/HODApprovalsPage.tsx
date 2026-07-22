import React, { useState, useEffect } from 'react';
import { useHODDepartment } from '../hooks/useHODDepartment';
import { fetchDepartmentApprovals, submitApproval, ApprovalItem } from '../services/hodFinalService';
import { PageContainer } from '../components/shared/PageContainer';
import { StatisticsCard } from '../components/shared/StatisticsCard';
import { GlassCard } from '../components/shared/GlassCard';
import { AdvancedTable } from '../components/shared/AdvancedTable';
import { Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ActionsMenu } from '../components/shared/ActionsMenu';
import { Modal } from '../components/shared/Modal';
import { Button } from '../components/shared/Button';
import { NotificationToast } from '../components/shared/NotificationToast';
import { exportToTextDoc } from '../utils/exportUtils';
import {
  CheckCircle2, XCircle, Eye, MessageSquare, Download, Briefcase,
  CalendarCheck, Wrench, Calendar, Clock,
} from 'lucide-react';

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  Normal: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function HODApprovalsPage() {
  const { departmentInfo, departmentCode } = useHODDepartment();
  const [data, setData] = useState<any>(null);
  const [remarksModal, setRemarksModal] = useState<{ open: boolean; item: ApprovalItem | null; action: 'approve' | 'reject' }>({ open: false, item: null, action: 'approve' });
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchDepartmentApprovals(departmentCode).then(setData);
  }, [departmentCode]);

  const summary = data?.summary || {};
  const approvals: ApprovalItem[] = data?.approvals || [];

  const openModal = (item: ApprovalItem, action: 'approve' | 'reject') => {
    setRemarks('');
    setRemarksModal({ open: true, item, action });
  };

  const handleSubmit = async () => {
    if (!remarksModal.item) return;
    await submitApproval(remarksModal.item.id, remarksModal.action, remarks, departmentCode);
    setRemarksModal({ open: false, item: null, action: 'approve' });
    NotificationToast.success(
      remarksModal.action === 'approve' ? 'Request Approved ✓' : 'Request Rejected',
      `${remarksModal.item.requestId} has been ${remarksModal.action}d.`,
    );
  };

  const columns: Column<ApprovalItem>[] = [
    { key: 'requestId', header: 'Request ID', render: i => <span className="font-mono font-bold text-blue-600">{i.requestId}</span> },
    { key: 'applicant', header: 'Applicant', render: i => <span className="font-extrabold text-slate-900 dark:text-white">{i.applicant}</span> },
    { key: 'type', header: 'Request Type', render: i => <span className="font-semibold text-slate-700 dark:text-slate-300">{i.type}</span> },
    { key: 'submittedDate', header: 'Submitted', render: i => <span className="font-mono text-xs text-slate-500">{i.submittedDate}</span> },
    { key: 'days', header: 'Days', render: i => <span className="font-black text-slate-700 dark:text-white">{i.days ?? '—'}</span> },
    {
      key: 'priority', header: 'Priority',
      render: i => <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${PRIORITY_STYLES[i.priority] || PRIORITY_STYLES.Normal}`}>{i.priority}</span>,
    },
    { key: 'status', header: 'Status', render: i => <StatusBadge status={i.status} /> },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: i => (
        <div className="flex items-center gap-1 justify-end">
          {i.status === 'Pending' && (
            <>
              <button onClick={() => openModal(i, 'approve')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 text-[10px] font-black hover:bg-emerald-200 transition cursor-pointer">
                <CheckCircle2 className="size-3.5" /> Approve
              </button>
              <button onClick={() => openModal(i, 'reject')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 text-[10px] font-black hover:bg-rose-200 transition cursor-pointer">
                <XCircle className="size-3.5" /> Reject
              </button>
            </>
          )}
          <ActionsMenu items={[
            { label: 'View Details', icon: Eye, onClick: () => NotificationToast.info('Request Detail', `Viewing ${i.requestId}`) },
            {
              label: 'Download Attachment',
              icon: Download,
              onClick: () => {
                exportToTextDoc(`Approval_Attachment_${i.requestId}.txt`, `Approval Request Attachment — ${i.requestId}`, {
                  'Request ID': i.requestId,
                  'Applicant': i.applicant,
                  'Request Type': i.type,
                  'Department': departmentInfo.name,
                  'Duration': `${i.days ?? '—'} days`,
                  'Priority': i.priority,
                  'Status': i.status,
                });
                NotificationToast.success('Downloaded', 'Attachment saved.');
              },
            },
            { label: 'Add Remarks', icon: MessageSquare, onClick: () => openModal(i, 'approve') },
          ]} />
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Leave & Approvals Workbench"
      subtitle={`Faculty leave, on-duty, workshop permissions, and event approvals for ${departmentInfo.name}`}
      breadcrumbItems={[{ label: 'Leave & Approvals' }]}
      stats={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard label="Pending Approvals" value={summary.pendingTotal || 7} subtitle="Requires your action" icon={Clock} accentColor="rose" />
          <StatisticsCard label="Faculty Leave Requests" value={summary.facultyLeave || 3} subtitle="Pending review" icon={Briefcase} accentColor="blue" />
          <StatisticsCard label="On-Duty Requests" value={summary.odRequests || 2} subtitle="Conference / Workshop" icon={CalendarCheck} accentColor="emerald" />
          <StatisticsCard label="Event Approvals" value={summary.eventApprovals || 1} subtitle="Event clearances pending" icon={Calendar} accentColor="purple" />
        </div>
      }
    >
      <AdvancedTable
        title={`${departmentInfo.shortName} Pending Approvals`}
        subtitle={`All faculty leave, OD, and event approval requests requiring HOD action`}
        columns={columns}
        data={approvals}
        keyExtractor={i => i.id}
        searchPlaceholder="Search requests by applicant, type, or request ID..."
      />

      {/* Remarks Modal */}
      <Modal
        isOpen={remarksModal.open}
        onClose={() => setRemarksModal({ open: false, item: null, action: 'approve' })}
        title={remarksModal.action === 'approve' ? 'Approve Request' : 'Reject Request'}
        subtitle={`${remarksModal.item?.requestId} — ${remarksModal.item?.applicant}`}
        variant={remarksModal.action === 'approve' ? 'confirmation' : 'delete'}
        confirmLabel={remarksModal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        onConfirm={handleSubmit}
      >
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Request Type</span><span className="font-bold">{remarksModal.item?.type}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-bold">{remarksModal.item?.days ?? '—'} days</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Submitted</span><span className="font-bold">{remarksModal.item?.submittedDate}</span></div>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">HOD Remarks</label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add your remarks or reason (optional)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold resize-none"
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
