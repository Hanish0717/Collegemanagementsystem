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
  fetchPlacementDrives
} from '@/services/assessmentService';
import { AssessmentStatusBadge } from '../components/AssessmentStatusBadge';
import { AssessmentWorkflowStepper } from '../components/AssessmentWorkflowStepper';
import { AssessmentStatusModal } from '../components/AssessmentStatusModal';
import { CreateAssessmentModal } from '../components/CreateAssessmentModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AssessmentManagementPageProps {
  userRole?: 'placement' | 'recruiter' | 'admin';
}

export const AssessmentManagementPage: React.FC<AssessmentManagementPageProps> = ({
  userRole = 'placement'
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedDriveFilter, setSelectedDriveFilter] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssessmentForModal, setSelectedAssessmentForModal] = useState<Assessment | null>(null);
  const [activeTab, setActiveTab] = useState<'LIST' | 'FLOW'>('LIST');

  const loadData = async () => {
    setLoading(true);
    try {
      const [assessmentsData, drivesData] = await Promise.all([
        fetchAssessments(),
        fetchPlacementDrives()
      ]);
      setAssessments(assessmentsData);
      setDrives(drivesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssessment = async (dto: CreateAssessmentDTO) => {
    try {
      await createAssessment(dto);
      await loadData();
    } catch (err) {
      alert('Failed to create assessment.');
    }
  };

  const handleUpdateStatus = async (
    status: AssessmentStatus,
    comments: string,
    rejectionReason?: string
  ) => {
    if (!selectedAssessmentForModal) return;
    try {
      await updateAssessmentStatus(selectedAssessmentForModal.id, status, comments, rejectionReason);
      await loadData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Filtered List
  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      !searchTerm.trim() ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assessment_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'ALL' || a.status === selectedStatusFilter;
    const matchesDrive = selectedDriveFilter === 'ALL' || a.drive_id === selectedDriveFilter;

    return matchesSearch && matchesStatus && matchesDrive;
  });

  // Calculate metrics
  const totalCount = assessments.length;
  const pendingTPOCount = assessments.filter((a) => a.status === 'Submitted_to_TPO' || a.status === 'Pending_Approval').length;
  const inProgressCount = assessments.filter((a) => a.status === 'In_Progress' || a.status === 'Scheduled').length;
  const completedCount = assessments.filter(
    (a) => a.status === 'Completed' || a.status === 'Results_Verified' || a.status === 'Sent_to_Recruiter'
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
                Assessment Management Module
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Recruitment Drive Assessments Foundation & 12-Stage Status Lifecycle Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Assessments</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalCount}</p>
          <span className="text-[11px] text-slate-400">Across all Recruitment Drives</span>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending TPO Review</span>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-300">{pendingTPOCount}</p>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-400">Requires Placement Cell Action</span>
        </div>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled / Live</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-300">{inProgressCount}</p>
          <span className="text-[11px] text-blue-700/80 dark:text-blue-400">Active Test Windows</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified / Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-300">{completedCount}</p>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400">Results Package Delivered</span>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by assessment title, company, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Drive Filter */}
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

          {/* Status Filter */}
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

      {/* Data Section */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading Assessments Data...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <FileText className="h-10 w-10 text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Assessments Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              There are no recruitment assessments matching your search criteria or drive filter.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Assessment</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAssessments.map((asm) => (
              <div
                key={asm.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                        {asm.assessment_type}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {asm.company_name}
                      </span>
                      <AssessmentStatusBadge status={asm.status} showStepNumber />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {asm.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedAssessmentForModal(asm)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Manage Workflow Status</span>
                  </button>
                </div>

                {/* Workflow Stepper Preview */}
                <AssessmentWorkflowStepper currentStatus={asm.status} />

                {/* Meta details bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{asm.duration_minutes} Mins</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Marks / Cutoff</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{asm.total_marks} Marks ({asm.passing_marks} Pass)</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule Window</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {asm.scheduled_start ? new Date(asm.scheduled_start).toLocaleDateString() : 'Not Scheduled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Created By</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{asm.created_by_name || 'Recruiter'}</span>
                  </div>
                </div>

                {asm.instructions && (
                  <p className="text-xs text-slate-500 italic bg-slate-100/50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    <span className="font-semibold not-italic">Instructions: </span>{asm.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateAssessmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        drives={drives}
        onCreate={handleCreateAssessment}
      />

      {selectedAssessmentForModal && (
        <AssessmentStatusModal
          assessment={selectedAssessmentForModal}
          isOpen={!!selectedAssessmentForModal}
          onClose={() => setSelectedAssessmentForModal(null)}
          onConfirm={handleUpdateStatus}
        />
      )}
    </div>
  );
};
