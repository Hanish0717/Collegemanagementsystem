import React, { useState, useEffect } from "react";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  BarChart2,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  RefreshCw,
  Send,
  MessageSquare,
  Plus,
  Trash2,
  History,
  Lock,
  Edit3,
  Globe,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchSubmittedResultsForReview,
  updateResultReviewStatus,
  overrideCandidateDecision,
  fetchResultOverrides,
  fetchSystemAuditLogs,
  lockAndShareResults
} from "@/services/companyRecruiterService";

export const RecruiterResultsReview: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("Pending Review");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Review Status Action Modal state
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showCandidatesModal, setShowCandidatesModal] = useState<boolean>(false);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"Approved" | "Rejected" | "Correction Requested">("Approved");
  const [actionRemarks, setActionRemarks] = useState<string>("");
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // Decision Override Modal state
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideMode, setOverrideMode] = useState<"STATUS_CHANGE" | "ADD_STUDENT" | "REMOVE_STUDENT">("STATUS_CHANGE");
  const [overrideTargetCandidate, setOverrideTargetCandidate] = useState<any | null>(null);
  const [submittingOverride, setSubmittingOverride] = useState<boolean>(false);

  const [overrideForm, setOverrideForm] = useState({
    studentId: "",
    studentName: "",
    rollNumber: "",
    department: "CSE",
    previousStatus: "Fail",
    newStatus: "Pass",
    score: 85,
    reason: "Technical Error in Test System",
    remarks: "",
    approvalDate: new Date().toISOString().slice(0, 16),
    officerName: "Dr. Rajesh Kumar (TPO Head)"
  });

  // Audit Logs Modal state
  const [showAuditLogsModal, setShowAuditLogsModal] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState<boolean>(false);

  // System-Wide Immutable Audit Ledger Modal state
  const [showSystemLedgerModal, setShowSystemLedgerModal] = useState<boolean>(false);
  const [systemAuditLogs, setSystemAuditLogs] = useState<any[]>([]);
  const [ledgerSearch, setLedgerSearch] = useState<string>("");
  const [ledgerActionFilter, setLedgerActionFilter] = useState<string>("all");

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchSubmittedResultsForReview();
      setSubmissions(data);
    } catch (err) {
      toast.error("Failed to load result submissions for review.");
    } finally {
      setLoading(false);
    }
  };

  const openSystemLedgerModal = async () => {
    setShowSystemLedgerModal(true);
    try {
      const logs = await fetchSystemAuditLogs();
      setSystemAuditLogs(logs);
    } catch (err) {
      toast.error("Failed to fetch system audit logs.");
    }
  };

  const handleLockAndShare = async (sub: any) => {
    try {
      const res = await lockAndShareResults(sub.id);
      toast.success(res.message || "Final list approved & locked! Candidates advanced to Technical Interview.");
      loadSubmissions();
    } catch (err) {
      toast.error("Failed to lock and share results.");
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmittingAction(true);
    try {
      await updateResultReviewStatus(selectedSubmission.id, actionType, actionRemarks);
      toast.success(
        actionType === "Approved"
          ? "Results approved and finalized successfully!"
          : actionType === "Rejected"
          ? "Results rejected."
          : "Correction requested from recruiter."
      );
      setShowActionModal(false);
      setActionRemarks("");
      loadSubmissions();
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const openActionModal = (sub: any, type: "Approved" | "Rejected" | "Correction Requested") => {
    setSelectedSubmission(sub);
    setActionType(type);
    setActionRemarks(
      type === "Approved"
        ? "Results verified and approved for publication."
        : type === "Rejected"
        ? "Results rejected due to evaluation discrepancy."
        : "Please revise candidate score cutoffs and re-upload."
    );
    setShowActionModal(true);
  };

  // Open Override Modal for Status Change (Fail -> Pass, Pass -> Fail)
  const openStatusOverrideModal = (cand: any) => {
    setOverrideTargetCandidate(cand);
    setOverrideMode("STATUS_CHANGE");
    setOverrideForm({
      studentId: cand.studentId || cand.rollNumber,
      studentName: cand.studentName,
      rollNumber: cand.rollNumber,
      department: cand.department || "CSE",
      previousStatus: cand.status || "Fail",
      newStatus: cand.status === "Fail" ? "Pass" : "Fail",
      score: cand.score || 80,
      reason: "Technical Error in Test System",
      remarks: "",
      approvalDate: new Date().toISOString().slice(0, 16),
      officerName: "Dr. Rajesh Kumar (TPO Head)"
    });
    setShowOverrideModal(true);
  };

  // Open Override Modal for Adding Student
  const openAddStudentOverrideModal = () => {
    setOverrideTargetCandidate(null);
    setOverrideMode("ADD_STUDENT");
    setOverrideForm({
      studentId: `STU_${Date.now()}`,
      studentName: "",
      rollNumber: "",
      department: "CSE",
      previousStatus: "N/A",
      newStatus: "Pass",
      score: 85,
      reason: "Special Approval by TPO Desk",
      remarks: "",
      approvalDate: new Date().toISOString().slice(0, 16),
      officerName: "Dr. Rajesh Kumar (TPO Head)"
    });
    setShowOverrideModal(true);
  };

  // Open Override Modal for Removing Student
  const openRemoveStudentOverrideModal = (cand: any) => {
    setOverrideTargetCandidate(cand);
    setOverrideMode("REMOVE_STUDENT");
    setOverrideForm({
      studentId: cand.studentId || cand.rollNumber,
      studentName: cand.studentName,
      rollNumber: cand.rollNumber,
      department: cand.department || "CSE",
      previousStatus: cand.status || "Pass",
      newStatus: "REMOVED",
      score: cand.score || 0,
      reason: "Discrepancy in Cutoff Calculation",
      remarks: "",
      approvalDate: new Date().toISOString().slice(0, 16),
      officerName: "Dr. Rajesh Kumar (TPO Head)"
    });
    setShowOverrideModal(true);
  };

  // Handle Decision Override Submission
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    if (!overrideForm.reason || !overrideForm.remarks || !overrideForm.approvalDate || !overrideForm.officerName) {
      toast.error("Mandatory fields missing! Please fill Reason, Remarks, Approval Date, and Officer Name.");
      return;
    }

    setSubmittingOverride(true);
    try {
      await overrideCandidateDecision(selectedSubmission.id, {
        studentId: overrideForm.studentId,
        studentName: overrideForm.studentName,
        rollNumber: overrideForm.rollNumber,
        department: overrideForm.department,
        actionType: overrideMode,
        previousStatus: overrideForm.previousStatus,
        newStatus: overrideForm.newStatus,
        score: overrideForm.score,
        reason: overrideForm.reason,
        remarks: overrideForm.remarks,
        approvalDate: overrideForm.approvalDate,
        officerName: overrideForm.officerName
      });

      toast.success("Decision override recorded permanently in system audit log!");
      setShowOverrideModal(false);
      loadSubmissions();
    } catch (err) {
      toast.error("Failed to process override.");
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Load Permanent Audit Logs
  const openAuditLogsModal = async (sub: any) => {
    setSelectedSubmission(sub);
    setLoadingAuditLogs(true);
    setShowAuditLogsModal(true);
    try {
      const logs = await fetchResultOverrides(sub.id);
      setAuditLogs(logs);
    } catch (err) {
      toast.error("Failed to load override audit logs.");
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesFilter = statusFilter === "all" || sub.status === statusFilter;
    const matchesSearch =
      sub.driveTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.recruiterName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredSystemAuditLogs = systemAuditLogs.filter((log) => {
    const matchesFilter = ledgerActionFilter === "all" || log.action === ledgerActionFilter;
    const matchesSearch =
      (log.action || "").toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (log.officer || "").toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (log.recruiter || "").toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (log.reason || "").toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (log.ipAddress || "").includes(ledgerSearch);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = submissions.filter((s) => s.status === "Pending Review").length;
  const approvedCount = submissions.filter((s) => s.status === "Approved").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <span>Placement Officer Portal</span>
            <span>/</span>
            <span>Recruiter Results Review & Audit Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Recruiter Assessment Results & Immutable Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit recruiter activities, verify test scores, perform decision overrides, and inspect IP-tracked audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openSystemLedgerModal}
            className="flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2.5 text-xs font-semibold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
          >
            <Shield className="size-4" />
            <span>Immutable Audit Ledger</span>
          </button>

          <button
            onClick={loadSubmissions}
            className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="size-4" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* AUTOMATED MULTI-CHANNEL NOTIFICATION BROADCAST BANNER */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-900 dark:text-indigo-200 space-y-2 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
            <Send className="size-4 text-indigo-500" />
            <span>Automated Multi-Channel Notification Dispatcher</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300">In-App</span>
            <span className="bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300">College Email</span>
            <span className="bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300">Dashboard Alerts</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400">
          Upon Placement Officer approval & locking, automated notifications are immediately dispatched across all 3 channels:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 font-sans">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">🎓 Eligible Students Notification:</span>
            <span className="text-slate-800 dark:text-white italic">"You have been shortlisted for the Technical Interview."</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-blue-600 dark:text-blue-400 font-bold block mb-0.5">💼 Recruiter Notification:</span>
            <span className="text-slate-800 dark:text-white italic">"Final shortlist approved."</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-purple-600 dark:text-purple-400 font-bold block mb-0.5">🏛️ Placement Officer Notification:</span>
            <span className="text-slate-800 dark:text-white italic">"Recruitment process moved to Technical Round."</span>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase">Pending Review</span>
          <h3 className="text-2xl font-bold text-amber-500 mt-1">{pendingCount} Submissions</h3>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase">Approved Results</span>
          <h3 className="text-2xl font-bold text-emerald-500 mt-1">{approvedCount} Finalized</h3>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase">Review Queue</span>
          <h3 className="text-2xl font-bold text-blue-500 mt-1">{submissions.length} Total Drives</h3>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold uppercase">Audit Integrity</span>
          <h3 className="text-2xl font-bold text-indigo-500 mt-1">IP Tracked Logs</h3>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or drive..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {["Pending Review", "Approved", "Rejected", "Correction Requested", "all"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {st === "all" ? "All Statuses" : st}
            </button>
          ))}
        </div>
      </div>

      {/* SUBMISSION CARDS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
                <div className="h-6 w-48 bg-slate-800 rounded" />
                <div className="h-16 w-full bg-slate-800/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-xl">
            <FileCheck className="size-10 text-slate-600 mx-auto" />
            <p className="font-bold text-slate-300 text-sm">No Assessment Result Submissions Found</p>
            <p className="text-slate-500">There are currently no recruiter uploaded test submissions matching status "{statusFilter}".</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-xl hover:border-blue-500/40 transition-all"
            >
              {/* Header Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg border border-blue-500/20">
                    <Building2 className="size-6" />
                  </div>
                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : sub.status === "Pending Review"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}
                    >
                      {sub.status}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {sub.driveTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Company: <strong className="text-blue-600 dark:text-blue-400">{sub.companyName}</strong> | Recruiter: {sub.recruiterName} ({sub.recruiterEmail})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openAuditLogsModal(sub)}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1.5 text-xs font-semibold hover:bg-purple-500/20"
                  >
                    <History className="size-3.5" />
                    <span>Drive Audit Logs</span>
                  </button>
                  <span className="text-xs text-slate-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* TEST STATISTICS BREAKDOWN */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BarChart2 className="size-3.5 text-indigo-400" /> Test Performance Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Total Candidates</span>
                    <p className="font-bold text-slate-900 dark:text-white">{sub.testStats?.totalCandidates || sub.candidates?.length || 0}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Passed</span>
                    <p className="font-bold text-emerald-500">{sub.testStats?.passedCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Failed</span>
                    <p className="font-bold text-rose-500">{sub.testStats?.failedCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Highest Score</span>
                    <p className="font-bold text-amber-500">{sub.testStats?.highestScore || 0}/100</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Average Score</span>
                    <p className="font-bold text-blue-500">{sub.testStats?.averageScore || 0}</p>
                  </div>
                </div>
              </div>

              {/* 8-STEP WORKFLOW PIPELINE STEPPER */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span className="text-purple-600 dark:text-purple-400 uppercase tracking-wider font-bold">8-Step Placement Workflow Pipeline</span>
                  <span className="text-slate-700 dark:text-slate-300">Current Stage: <strong className="text-amber-600 dark:text-amber-400 font-bold">{sub.nextStage || sub.status}</strong></span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-[10px] text-center pt-1">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold">1. Recruiter Upload</div>
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold">2. Pending TPO Review</div>
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-semibold">3. TPO Reviews</div>
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-semibold">4. Manual Overrides</div>
                  <div className={`p-1.5 rounded-lg font-semibold ${sub.status === "Approved" || sub.isLocked ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>5. Approve Final List</div>
                  <div className={`p-1.5 rounded-lg font-semibold ${sub.isLocked ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>6. Lock Results</div>
                  <div className={`p-1.5 rounded-lg font-semibold ${sub.isSharedWithRecruiter ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>7. Share Recruiter</div>
                  <div className={`p-1.5 rounded-lg font-semibold ${sub.nextStage === "Proceed to Technical Interview" ? "bg-purple-600 text-white shadow-md font-bold" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>8. Tech Interview</div>
                </div>
              </div>

              {/* TPO Remarks if present */}
              {sub.tpoRemarks && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-blue-500 block mb-1">TPO Review Notes:</strong>
                  {sub.tpoRemarks}
                </div>
              )}

              {/* ACTIONS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => {
                    setSelectedSubmission(sub);
                    setShowCandidatesModal(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
                >
                  <Eye className="size-4" />
                  <span>View & Override Candidate Scores ({sub.candidates?.length || 0})</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openActionModal(sub, "Correction Requested")}
                    className="flex items-center gap-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-2 text-xs font-semibold hover:bg-amber-500/20"
                  >
                    <AlertTriangle className="size-3.5" />
                    <span>Request Correction</span>
                  </button>
                  <button
                    onClick={() => openActionModal(sub, "Rejected")}
                    className="flex items-center gap-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3 py-2 text-xs font-semibold hover:bg-rose-500/20"
                  >
                    <XCircle className="size-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleLockAndShare(sub)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 px-5 py-2 text-xs font-semibold hover:opacity-95 transition-all"
                  >
                    <Lock className="size-3.5" />
                    <span>Lock Results & Share with Recruiter (Proceed to Technical Interview)</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CANDIDATE EVALUATION & OVERRIDE WORKBENCH MODAL */}
      {showCandidatesModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Candidate Evaluation Scores & Decision Override Desk</h3>
                <p className="text-xs text-slate-400">{selectedSubmission.driveTitle} — {selectedSubmission.companyName}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={openAddStudentOverrideModal}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500 shadow"
                >
                  <Plus className="size-4" />
                  <span>Add Student to Results</span>
                </button>
                <button onClick={() => setShowCandidatesModal(false)}>
                  <XCircle className="size-5 text-slate-400 hover:text-white" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Dept</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Evaluation</th>
                    <th className="px-4 py-3">Recruiter Remarks</th>
                    <th className="px-4 py-3 text-right">Decision Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {(selectedSubmission.candidates || []).map((cand: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-white">{cand.studentName}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{cand.rollNumber}</td>
                      <td className="px-4 py-3 text-blue-400 font-semibold">{cand.department}</td>
                      <td className="px-4 py-3 font-bold text-amber-400">{cand.score}/100</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cand.status === "Pass"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {cand.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-300">{cand.remarks || "No remarks"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openStatusOverrideModal(cand)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                            title="Override decision status (Fail -> Pass or Pass -> Fail)"
                          >
                            <Edit3 className="size-3" />
                            <span>Override ({cand.status === "Fail" ? "Fail ➔ Pass" : "Pass ➔ Fail"})</span>
                          </button>

                          <button
                            onClick={() => openRemoveStudentOverrideModal(cand)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove Student from result list"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Every decision override requires Officer Name, Approval Date, Reason, and Remarks.
              </span>
              <button
                onClick={() => setShowCandidatesModal(false)}
                className="rounded-xl border border-slate-700 px-5 py-2 text-xs font-medium hover:bg-slate-800"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERRIDE DECISION FORM MODAL */}
      {showOverrideModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="size-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">
                  {overrideMode === "STATUS_CHANGE"
                    ? `Override Status: ${overrideForm.previousStatus} ➔ ${overrideForm.newStatus}`
                    : overrideMode === "ADD_STUDENT"
                    ? "Add Student to Official Results"
                    : "Remove Student from Results"}
                </h3>
              </div>
              <button onClick={() => setShowOverrideModal(false)}>
                <XCircle className="size-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
              {/* Mandatory Student Identification */}
              {overrideMode === "ADD_STUDENT" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Student Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Malhotra"
                      value={overrideForm.studentName}
                      onChange={(e) => setOverrideForm({ ...overrideForm, studentName: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Roll Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. CS2026045"
                      value={overrideForm.rollNumber}
                      onChange={(e) => setOverrideForm({ ...overrideForm, rollNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white text-xs font-mono"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Student</span>
                    <h4 className="font-bold text-white text-sm">{overrideForm.studentName}</h4>
                    <p className="text-xs text-slate-400 font-mono">{overrideForm.rollNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Action</span>
                    <p className="font-bold text-amber-400 text-xs">
                      {overrideForm.previousStatus} ➔ {overrideForm.newStatus}
                    </p>
                  </div>
                </div>
              )}

              {/* Mandatory Field 1: Reason Dropdown */}
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Reason for Override * (Mandatory)</label>
                <select
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white text-xs"
                  required
                >
                  <option value="Academic Re-evaluation">Academic Re-evaluation</option>
                  <option value="Technical Error in Test System">Technical Error in Test System</option>
                  <option value="Discrepancy in Cutoff Calculation">Discrepancy in Cutoff Calculation</option>
                  <option value="Special Approval by TPO Desk">Special Approval by TPO Desk</option>
                  <option value="Medical / Emergency Waiver">Medical / Emergency Waiver</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Mandatory Field 2: Detailed Remarks */}
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Detailed Remarks & Justification * (Mandatory)</label>
                <textarea
                  rows={3}
                  placeholder="Provide detailed explanation for this decision override..."
                  value={overrideForm.remarks}
                  onChange={(e) => setOverrideForm({ ...overrideForm, remarks: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white text-xs"
                  required
                ></textarea>
              </div>

              {/* Mandatory Fields 3 & 4: Approval Date & Officer Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Approval Date * (Mandatory)</label>
                  <input
                    type="datetime-local"
                    value={overrideForm.approvalDate}
                    onChange={(e) => setOverrideForm({ ...overrideForm, approvalDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Officer Name * (Mandatory)</label>
                  <input
                    type="text"
                    value={overrideForm.officerName}
                    onChange={(e) => setOverrideForm({ ...overrideForm, officerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-2">
                <Lock className="size-4 text-purple-400 shrink-0" />
                <span>Notice: Every override is permanently written to the audit ledger. No deletion allowed.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-semibold shadow-lg"
                >
                  {submittingOverride ? "Recording..." : "Save Permanent Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYSTEM-WIDE IMMUTABLE AUDIT LEDGER MODAL */}
      {showSystemLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">System-Wide Immutable Audit Ledger</h3>
                  <p className="text-xs text-slate-400">Complete IP-tracked audit history for Recruiter and TPO activities</p>
                </div>
              </div>
              <button onClick={() => setShowSystemLedgerModal(false)}>
                <XCircle className="size-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-purple-400" />
                <span>🔒 Immutable Ledger: Logs Recruiter Login, Question Upload, Test Creation, Result Upload, Approve, Reject, Override, Manual Addition, and Removal.</span>
              </div>
              <span className="font-bold font-mono text-[11px] bg-purple-500/20 px-2.5 py-1 rounded-md border border-purple-500/30">No Deletion Allowed</span>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search IP, Officer, Recruiter, Reason..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500"
                />
              </div>

              <select
                value={ledgerActionFilter}
                onChange={(e) => setLedgerActionFilter(e.target.value)}
                className="w-full sm:w-56 rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-white"
              >
                <option value="all">All Audit Actions</option>
                <option value="RECRUITER_LOGIN">Recruiter Login</option>
                <option value="QUESTION_UPLOAD">Question Upload</option>
                <option value="TEST_CREATION">Test Creation</option>
                <option value="RESULT_UPLOAD">Result Upload</option>
                <option value="APPROVE">Approve Results</option>
                <option value="REJECT">Reject Results</option>
                <option value="OVERRIDE">Decision Override</option>
                <option value="MANUAL_ADDITION">Manual Addition</option>
                <option value="MANUAL_REMOVAL">Manual Removal</option>
              </select>
            </div>

            {/* AUDIT LOG TABLE */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Actor & Identity</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Old Value ➔ New Value</th>
                    <th className="px-4 py-3">Reason / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredSystemAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 text-[11px] font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-400 font-semibold">{log.ipAddress}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.actorType === "TPO" ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"
                          }`}
                        >
                          {log.actorType}
                        </span>
                        <p className="font-semibold text-white mt-1 text-[11px]">
                          {log.officer || log.recruiter || "System"}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-bold text-purple-300">{log.action}</td>
                      <td className="px-4 py-3 text-[11px]">
                        <span className="text-slate-400">{log.oldValue}</span>
                        <span className="text-slate-500 mx-1">➔</span>
                        <span className="text-emerald-400 font-bold">{log.newValue}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-300">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSystemLedgerModal(false)}
                className="rounded-xl border border-slate-700 px-5 py-2 text-xs font-medium hover:bg-slate-800"
              >
                Close Audit Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterResultsReview;
