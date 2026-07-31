import React, { useState, useEffect } from 'react';
import {
  Assessment,
  AssessmentStatus,
  ASSESSMENT_STATUS_FLOW,
  STATUS_METADATA,
  CreateAssessmentDTO
} from '@/types/assessment';
import {
  fetchAssessments,
  createAssessment,
  updateAssessmentStatus,
  deleteAssessment,
  fetchPlacementDrives
} from '@/services/assessmentService';
import { AssessmentStatusBadge } from '../components/AssessmentStatusBadge';
import { AssessmentWorkflowStepper } from '../components/AssessmentWorkflowStepper';
import { AssessmentStatusModal } from '../components/AssessmentStatusModal';
import { CreateAssessmentModal } from '../components/CreateAssessmentModal';
import { AssessmentTimeline } from '../components/AssessmentTimeline';
import { AssessmentHistory } from '../components/AssessmentHistory';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Trash2,
  Eye,
  Info,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface AssessmentManagementPageProps {
  userRole?: 'placement' | 'recruiter' | 'admin' | 'student';
}

export const AssessmentManagementPage: React.FC<AssessmentManagementPageProps> = ({
  userRole = 'placement'
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedDriveFilter, setSelectedDriveFilter] = useState<string>('ALL');

  // Role dashboard tabs
  const [recruiterTab, setRecruiterTab] = useState<'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED'>('ALL');
  const [tpoTab, setTpoTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SCHEDULED'>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssessmentForModal, setSelectedAssessmentForModal] = useState<Assessment | null>(null);
  const [viewDetailAssessment, setViewDetailAssessment] = useState<Assessment | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorAlert(null);
    try {
      const [assessmentsData, drivesData] = await Promise.all([
        fetchAssessments({ role: userRole }),
        fetchPlacementDrives()
      ]);
      setAssessments(assessmentsData);
      setDrives(drivesData);
    } catch (err: any) {
      console.error(err);
      setErrorAlert(err.message || 'Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  const handleCreateAssessment = async (dto: CreateAssessmentDTO) => {
    setErrorAlert(null);
    try {
      await createAssessment(dto);
      await loadData();
    } catch (err: any) {
      setErrorAlert(err.message || 'Validation Error: Failed to create assessment.');
    }
  };

  const handleUpdateStatus = async (
    status: AssessmentStatus,
    comments: string
  ) => {
    if (!selectedAssessmentForModal) return;
    setErrorAlert(null);
    try {
      await updateAssessmentStatus(selectedAssessmentForModal.id, status, comments);
      await loadData();
    } catch (err: any) {
      setErrorAlert(err.message || 'Validation Error: Failed to update status.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete assessment "${name}"?`)) return;
    setErrorAlert(null);
    try {
      await deleteAssessment(id);
      await loadData();
    } catch (err: any) {
      setErrorAlert(err.message || 'Cannot delete published or completed assessment.');
    }
  };

  // Role Filtering
  const getFilteredAssessments = () => {
    let list = [...assessments];

    // Student View Rule: Only show published assessments
    if (userRole === 'student') {
      list = list.filter((a) =>
        ['Published', 'In_Progress', 'Completed', 'Results_Published'].includes(a.current_status)
      );
    }

    // Recruiter Dashboard Tab Filtering
    if (userRole === 'recruiter') {
      if (recruiterTab === 'DRAFT') {
        list = list.filter((a) => a.current_status === 'Draft');
      } else if (recruiterTab === 'PENDING') {
        list = list.filter((a) => ['Submitted_to_TPO', 'Pending_Approval'].includes(a.current_status));
      } else if (recruiterTab === 'APPROVED') {
        list = list.filter((a) => ['Approved', 'Scheduled', 'Published'].includes(a.current_status));
      } else if (recruiterTab === 'COMPLETED') {
        list = list.filter((a) =>
          ['Completed', 'Results_Generated', 'Results_Verified', 'Results_Published', 'Sent_to_Recruiter'].includes(
            a.current_status
          )
        );
      }
    }

    // TPO Dashboard Tab Filtering
    if (userRole === 'placement' || userRole === 'admin') {
      if (tpoTab === 'PENDING') {
        list = list.filter((a) => ['Submitted_to_TPO', 'Pending_Approval'].includes(a.current_status));
      } else if (tpoTab === 'APPROVED') {
        list = list.filter((a) => a.current_status === 'Approved');
      } else if (tpoTab === 'SCHEDULED') {
        list = list.filter((a) => ['Scheduled', 'Published', 'In_Progress'].includes(a.current_status));
      }
    }

    // General Search & Filter Bar
    return list.filter((a) => {
      const name = a.assessment_name || a.title || '';
      const matchesSearch =
        !searchTerm.trim() ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.company_name && a.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = selectedStatusFilter === 'ALL' || a.current_status === selectedStatusFilter;
      const matchesDrive = selectedDriveFilter === 'ALL' || a.drive_id === selectedDriveFilter;

      return matchesSearch && matchesStatus && matchesDrive;
    });
  };

  const filteredList = getFilteredAssessments();

  // Metrics
  const totalCount = assessments.length;
  const draftCount = assessments.filter((a) => a.current_status === 'Draft').length;
  const pendingTPOCount = assessments.filter((a) =>
    ['Submitted_to_TPO', 'Pending_Approval'].includes(a.current_status)
  ).length;
  const approvedCount = assessments.filter((a) => a.current_status === 'Approved').length;
  const scheduledCount = assessments.filter((a) =>
    ['Scheduled', 'Published', 'In_Progress'].includes(a.current_status)
  ).length;
  const completedCount = assessments.filter((a) =>
    ['Completed', 'Results_Generated', 'Results_Verified', 'Results_Published', 'Sent_to_Recruiter'].includes(
      a.current_status
    )
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Assessment Management Foundation
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Hierarchy: Company → Recruitment Drive → Assessment (12-Stage Lifecycle)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh Assessments"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {userRole !== 'student' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Assessment</span>
            </button>
          )}
        </div>
      </div>

      {/* Validation Error Alert Banner */}
      {errorAlert && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 p-4 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorAlert}</div>
          <button onClick={() => setErrorAlert(null)} className="text-rose-500 hover:underline">Dismiss</button>
        </div>
      )}

      {/* RECRUITER DASHBOARD TAB BAR */}
      {userRole === 'recruiter' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recruiter Dashboard — My Assessments</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setRecruiterTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                recruiterTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setRecruiterTab('DRAFT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                recruiterTab === 'DRAFT'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              onClick={() => setRecruiterTab('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                recruiterTab === 'PENDING'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-slate-200'
              }`}
            >
              Pending TPO ({pendingTPOCount})
            </button>
            <button
              onClick={() => setRecruiterTab('APPROVED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                recruiterTab === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-slate-200'
              }`}
            >
              Approved & Published ({approvedCount + scheduledCount})
            </button>
            <button
              onClick={() => setRecruiterTab('COMPLETED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                recruiterTab === 'COMPLETED'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-400 hover:bg-slate-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>
      )}

      {/* TPO (PLACEMENT OFFICER) DASHBOARD TAB BAR */}
      {(userRole === 'placement' || userRole === 'admin') && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">TPO Dashboard — Assessment Governance</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setTpoTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tpoTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Assessments ({totalCount})
            </button>
            <button
              onClick={() => setTpoTab('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tpoTab === 'PENDING'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
              }`}
            >
              Pending Assessments ({pendingTPOCount})
            </button>
            <button
              onClick={() => setTpoTab('APPROVED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tpoTab === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
              }`}
            >
              Approved Assessments ({approvedCount})
            </button>
            <button
              onClick={() => setTpoTab('SCHEDULED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tpoTab === 'SCHEDULED'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 hover:bg-purple-200'
              }`}
            >
              Scheduled Assessments ({scheduledCount})
            </button>
          </div>
        </div>
      )}

      {/* STUDENT DASHBOARD BANNER */}
      {userRole === 'student' && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-950/20 p-4 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-purple-600" />
          <span>Student Notice: Only published or live assessments are displayed here once confirmed by TPO and Recruiter.</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by assessment name, company, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedDriveFilter}
              onChange={(e) => setSelectedDriveFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Recruitment Drives</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company_name || 'Drive'} ({d.job_title || 'Role'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All 12 Lifecycle Stages</option>
              {ASSESSMENT_STATUS_FLOW.map((s) => (
                <option key={s} value={s}>
                  {STATUS_METADATA[s].stepNumber}. {STATUS_METADATA[s].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List / Content Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading Assessment Foundation Data...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
          <FileText className="h-10 w-10 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Assessments Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            No assessments found matching the selected filter or status criteria.
          </p>
          {userRole !== 'student' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Assessment</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((asm) => {
            const name = asm.assessment_name || asm.title || 'Untitled Assessment';
            const status = asm.current_status || asm.status || 'Draft';
            const duration = asm.duration || asm.duration_minutes || 60;
            const isCompleted = ['Completed', 'Results_Generated', 'Results_Verified', 'Results_Published', 'Sent_to_Recruiter'].includes(status);
            const isPublished = ['Published', 'In_Progress', 'Completed', 'Results_Generated', 'Results_Verified', 'Results_Published', 'Sent_to_Recruiter'].includes(status);

            return (
              <div
                key={asm.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-500">
                        {asm.company_name || 'Recruitment Drive'}
                      </span>
                      <AssessmentStatusBadge status={status} showStepNumber />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewDetailAssessment(asm)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Timeline & History</span>
                    </button>

                    {userRole !== 'student' && (
                      <>
                        <button
                          onClick={() => setSelectedAssessmentForModal(asm)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          <span>Update Status</span>
                        </button>

                        <button
                          onClick={() => handleDelete(asm.id, name)}
                          disabled={isPublished}
                          title={isPublished ? 'Cannot delete published assessment' : 'Delete Assessment'}
                          className={`p-2 rounded-xl border transition ${
                            isPublished
                              ? 'border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700 cursor-not-allowed'
                              : 'border-rose-200 text-rose-600 dark:border-rose-900/50 dark:text-rose-400 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Workflow Stepper Bar */}
                <AssessmentWorkflowStepper currentStatus={status} />

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{duration} Minutes</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Marks / Cutoff</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{asm.total_marks} Marks ({asm.passing_marks} Pass)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Created By</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{asm.created_by || 'Recruiter'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Immutability</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isCompleted ? 'Locked (Completed)' : isPublished ? 'Delete Locked' : 'Editable Draft'}
                    </span>
                  </div>
                </div>

                {asm.instructions && (
                  <p className="text-xs text-slate-500 italic bg-slate-100/50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    <span className="font-semibold not-italic">Instructions: </span>{asm.instructions}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <CreateAssessmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        drives={drives}
        onCreate={handleCreateAssessment}
      />

      {/* Status Modal */}
      {selectedAssessmentForModal && (
        <AssessmentStatusModal
          assessment={selectedAssessmentForModal}
          isOpen={!!selectedAssessmentForModal}
          onClose={() => setSelectedAssessmentForModal(null)}
          onConfirm={handleUpdateStatus}
        />
      )}

      {/* Detail / Timeline & History View Modal */}
      {viewDetailAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Assessment Audit & Audit Logs
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {viewDetailAssessment.assessment_name || viewDetailAssessment.title}
                </h3>
              </div>
              <button
                onClick={() => setViewDetailAssessment(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <AssessmentWorkflowStepper currentStatus={viewDetailAssessment.current_status || viewDetailAssessment.status} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <AssessmentTimeline timeline={viewDetailAssessment.timeline || []} />
              <AssessmentHistory history={viewDetailAssessment.status_history || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
