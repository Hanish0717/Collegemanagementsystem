import React, { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Building2,
  FileText,
  Search,
  UserCheck,
  Award,
  ShieldAlert,
  ChevronRight,
  Download,
  Send,
  Plus,
  RefreshCw,
  BarChart3,
  FileUp,
  Laptop,
  TrendingUp,
  FileSpreadsheet,
  Lock,
  Mail,
  Phone,
  ExternalLink,
  Shield,
  Zap,
  Target,
  ArrowLeft,
  Check,
  FileCheck,
  ListFilter,
  Layers,
  History,
  CheckSquare,
  AlertCircle,
  Activity,
  Bell,
  HeartPulse,
  Info,
  User,
  CheckCircle,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchRecruiterMe,
  fetchPortalStats,
  fetchAssignedDrives,
  fetchAssignedApplicants,
  fetchEligibleStudentsList,
  fetchOnlineAssessments,
  fetchInterviewSchedule,
  fetchDriveOffers,
  fetchDriveTimeline,
  uploadAssessmentResults,
  fetchPlacementReports,
  updateCandidateStatus,
  createOnlineTest,
  fetchTestAttendance,
  scheduleInterview,
  updateInterviewResult,
  fetchStudentPlacementHistory,
  downloadReportFile,
  CompanyRecruiterItem,
  AssignedApplicant,
  PortalStats,
  DriveOffer,
  DriveTimelineEvent
} from "@/services/companyRecruiterService";

// Navigation Modes
type GlobalNav = "my_drives" | "reports" | "profile";

// Drive Workspace Sub-Tabs (9 Mandatory Tabs)
type WorkspaceTab =
  | "overview"
  | "eligible"
  | "assessment_details"
  | "assessment_management"
  | "results"
  | "interviews"
  | "offers"
  | "reports"
  | "timeline";

// 18 Lifecycle Stage Interface
export interface DriveLifecycleStage {
  id: number;
  name: string;
  responsible: string;
  roleType: "Placement Officer" | "Placement System" | "Company Recruiter" | "Assessment Engine" | "Recruiter Panel" | "HR Team" | "Students";
  status: "Completed" | "In Progress" | "Pending" | "Cancelled" | "Blocked";
  completionDate: string;
  remarks: string;
  progressPercent: number;
}

// Audit Log Entry Interface
export interface StageAuditLogEntry {
  id: string;
  driveId: string;
  previousStage: string;
  newStage: string;
  changedBy: string;
  role: string;
  timestamp: string;
  remarks: string;
}

const globalNavItems: { id: GlobalNav; label: string; icon: React.ElementType }[] = [
  { id: "my_drives", label: "My Drives", icon: Briefcase },
  { id: "reports", label: "Global Summary", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: Building2 },
];

const workspaceTabsList: { id: WorkspaceTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "eligible", label: "Eligible Students", icon: UserCheck },
  { id: "assessment_details", label: "Assessment Details", icon: Laptop },
  { id: "assessment_management", label: "Assessment Management", icon: Clock },
  { id: "results", label: "Assessment Results", icon: FileUp },
  { id: "interviews", label: "Interview Management", icon: Calendar },
  { id: "offers", label: "Offers", icon: Award },
  { id: "reports", label: "Reports", icon: FileSpreadsheet },
  { id: "timeline", label: "Timeline", icon: History },
];

export const CompanyDashboard: React.FC = () => {
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<CompanyRecruiterItem | null>(null);
  const [stats, setStats] = useState<PortalStats>({
    activeDrives: 3,
    eligibleStudents: 275,
    testsConducted: 8,
    pendingResults: 14,
    upcomingInterviews: 18,
    studentsSelected: 42
  });

  // State Data
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>("DRV_101");
  const [activeGlobalNav, setActiveGlobalNav] = useState<GlobalNav>("my_drives");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>("overview");
  const [loading, setLoading] = useState(true);

  // Drive-Scoped Data
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [offers, setOffers] = useState<DriveOffer[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<DriveTimelineEvent[]>([]);
  const [applicants, setApplicants] = useState<AssignedApplicant[]>([]);

  // Search & Modals
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<any | null>(null);
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [studentHistoryTimeline, setStudentHistoryTimeline] = useState<any[]>([]);

  // Results Upload State
  const [resultsSubmissionStatus, setResultsSubmissionStatus] = useState("Not Submitted");
  const [uploading, setUploading] = useState(false);
  const [resultsRows, setResultsRows] = useState([
    { id: "RES_1", student: "Aarav Sharma", rollNumber: "CS2026001", score: 92, passFail: "Pass" as "Pass" | "Fail", remarks: "Excellent algorithmic problem solving." },
    { id: "RES_2", student: "Priya Patel", rollNumber: "CS2026014", score: 96, passFail: "Pass" as "Pass" | "Fail", remarks: "Top score in system design." },
    { id: "RES_3", student: "Sneha Reddy", rollNumber: "IT2026008", score: 85, passFail: "Pass" as "Pass" | "Fail", remarks: "Good CS fundamentals." },
  ]);

  // Test Creation Modal State
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [testForm, setTestForm] = useState({
    title: "",
    duration: 60,
    passingMarks: 60,
    startTime: "2026-08-10T10:00",
    endTime: "2026-08-10T11:30",
    instructions: "Complete all questions within the allocated time. Plagiarism will lead to immediate disqualification.",
    eligibility: "CSE, AIML, ECE (Min CGPA: 7.5)",
    assessmentLink: "https://hackerrank.com/google-campus-drive",
    questionPaperUrl: "https://storage.college.edu/papers/technical_assessment.pdf"
  });

  // Test Attendance Log Modal
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedTestAttendance, setSelectedTestAttendance] = useState<any[]>([]);
  const [selectedTestTitle, setSelectedTestTitle] = useState("");

  // Interview Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    candidateName: "",
    studentId: "",
    round: "Technical Round 1",
    date: "2026-08-15",
    timeSlot: "10:00 AM - 11:00 AM",
    venue: "Conference Hall A",
    onlineMeetingLink: "https://meet.google.com/abc-defg-hij",
    panelists: "Dr. John Smith, Tech Lead Rohan"
  });
  const [evalForm, setEvalForm] = useState({
    attendance: "Present",
    result: "Advance",
    nextRound: "Technical Round 2",
    remarks: "Strong technical performance in algorithms."
  });

  // Hover Stage Tooltip State
  const [hoveredStage, setHoveredStage] = useState<DriveLifecycleStage | null>(null);

  // Active Selected Drive object
  const selectedDrive = drives.find(d => d.id === selectedDriveId) || drives[0] || null;

  useEffect(() => {
    loadRecruiterAndDrives();
  }, []);

  useEffect(() => {
    if (selectedDrive) {
      loadDriveWorkspaceData(selectedDrive.id);
    }
  }, [selectedDriveId]);

  const loadRecruiterAndDrives = async () => {
    setLoading(true);
    try {
      const recUser = await fetchRecruiterMe();
      if (recUser.status === "disabled") {
        toast.error("Account disabled. Please contact Placement Office.");
        handleLogout();
        return;
      }
      setRecruiter(recUser);

      const [s, assignedDrivesList] = await Promise.all([
        fetchPortalStats(),
        fetchAssignedDrives()
      ]);
      setStats(s);
      setDrives(assignedDrivesList);

      if (assignedDrivesList.length > 0 && !selectedDriveId) {
        setSelectedDriveId(assignedDrivesList[0].id);
      }
    } catch (err) {
      if (localStorage.getItem("cms_token") || localStorage.getItem("company_recruiter_token")) {
        toast.error("Session expired or authentication failed.");
      }
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const loadDriveWorkspaceData = async (driveId: string) => {
    try {
      const [elig, assess, ints, off, time, apps] = await Promise.all([
        fetchEligibleStudentsList(driveId),
        fetchOnlineAssessments(driveId),
        fetchInterviewSchedule(driveId),
        fetchDriveOffers(driveId),
        fetchDriveTimeline(driveId),
        fetchAssignedApplicants(driveId)
      ]);
      setEligibleStudents(elig);
      setAssessments(assess);
      setInterviews(ints);
      setOffers(off);
      setTimelineEvents(time);
      setApplicants(apps);
    } catch (err) {
      console.error("Failed to load drive-specific data:", err);
    }
  };

  const handleLogout = () => {
    ["company_recruiter_token", "company_recruiter_user", "cms_token", "cms_user", "campusly.role"].forEach(k =>
      localStorage.removeItem(k)
    );
    router.navigate({ to: "/login" });
  };

  const openStudentDossier = async (student: any) => {
    setSelectedStudentForProfile(student);
    setShowStudentProfileModal(true);
    try {
      const history = await fetchStudentPlacementHistory(student.roll_number || student.studentId);
      setStudentHistoryTimeline(history);
    } catch {}
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.title) {
      toast.error("Test title is required.");
      return;
    }
    if (!selectedDrive) return;

    try {
      await createOnlineTest({
        ...testForm,
        driveId: selectedDrive.id,
        drive: selectedDrive.role
      });
      toast.success(`Online test '${testForm.title}' created for ${selectedDrive.role}!`);
      setShowCreateTestModal(false);
      loadDriveWorkspaceData(selectedDrive.id);
    } catch (err) {
      toast.error("Failed to create online assessment.");
    }
  };

  const openAttendance = async (test: any) => {
    setSelectedTestTitle(test.title);
    try {
      const logs = await fetchTestAttendance(test.id);
      setSelectedTestAttendance(logs);
      setShowAttendanceModal(true);
    } catch {
      toast.error("Failed to load attendance logs.");
    }
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.candidateName) {
      toast.error("Candidate name is required.");
      return;
    }
    if (!selectedDrive) return;

    try {
      await scheduleInterview({
        ...scheduleForm,
        driveId: selectedDrive.id,
        role: selectedDrive.role
      });
      toast.success(`Interview scheduled for ${scheduleForm.candidateName}!`);
      setShowScheduleModal(false);
      loadDriveWorkspaceData(selectedDrive.id);
    } catch {
      toast.error("Failed to schedule interview.");
    }
  };

  const handleEvalInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview || !selectedDrive) return;

    try {
      await updateInterviewResult(selectedInterview.id, evalForm);
      toast.success(`Evaluation recorded for ${selectedInterview.candidateName}!`);
      setShowEvalModal(false);
      loadDriveWorkspaceData(selectedDrive.id);
    } catch {
      toast.error("Failed to submit evaluation.");
    }
  };

  const handleSubmitResults = async () => {
    if (!selectedDrive) return;

    // Validation: Duplicate Student IDs
    const studentIds = resultsRows.map(r => r.rollNumber.trim().toUpperCase());
    const duplicates = studentIds.filter((item, index) => studentIds.indexOf(item) !== index);
    if (duplicates.length > 0) {
      toast.error(`Duplicate Student Roll Numbers detected: ${Array.from(new Set(duplicates)).join(", ")}`);
      return;
    }

    setUploading(true);
    try {
      await uploadAssessmentResults(selectedDrive.id, resultsRows, false);
      setResultsSubmissionStatus("Pending TPO Review");
      toast.success(`Results for ${selectedDrive.role} submitted for TPO Review!`);
    } catch {
      toast.error("Failed to submit results.");
    } finally {
      setUploading(false);
    }
  };

  // ── 18 STAGE DYNAMIC PROGRESS CALCULATOR (EXACT TPO <-> RECRUITER WORKFLOW) ──
  const calculateDriveLifecycleStages = (): DriveLifecycleStage[] => {
    const hasAssessments = assessments.length > 0;
    const hasApprovedAssessments = assessments.some(a => a.status === "Approved" || a.status === "Conducted");
    const hasScheduledAssessments = assessments.some(a => a.examStatus === "Scheduled" || a.status === "Conducted");
    const hasConductedAssessments = assessments.some(a => a.status === "Conducted" || a.examStatus === "Completed");
    const hasResultsPrepared = resultsSubmissionStatus !== "Not Submitted";
    const hasResultsPublished = resultsSubmissionStatus === "Approved & Locked" || resultsSubmissionStatus === "Approved" || resultsSubmissionStatus === "Published";
    const hasResultsSentToRecruiter = hasResultsPublished;
    const hasRecruiterReviewed = hasResultsPublished;
    const hasInterviewScheduleCreated = interviews.length > 0;
    const hasTechInterviewsCompleted = interviews.some(i => i.round?.includes("Technical") && (i.result !== "Pending" || i.attendance === "Present"));
    const hasHRInterviewsScheduled = interviews.some(i => i.round?.includes("HR"));
    const hasHRInterviewsCompleted = interviews.some(i => i.round?.includes("HR") && i.result !== "Pending");
    const hasOffers = offers.length > 0;
    const hasAcceptedOffers = offers.some(o => o.status === "Accepted");
    const hasJoiningConfirmed = hasAcceptedOffers;
    const isDriveClosed = hasJoiningConfirmed && offers.every(o => o.status !== "Pending");

    return [
      { id: 1, name: "Drive Created", responsible: "Placement Officer", roleType: "Placement Officer", status: "Completed", completionDate: selectedDrive?.assignedDate || "2026-07-15 09:00 AM", remarks: "Recruitment Drive created & assigned to recruiter.", progressPercent: 5 },
      { id: 2, name: "Eligible Students Finalized", responsible: "Placement Officer", roleType: "Placement Officer", status: eligibleStudents.length > 0 ? "Completed" : "In Progress", completionDate: "2026-07-16 12:00 PM", remarks: `CGPA >= ${selectedDrive?.eligibilityMinCgpa || 7.5}, Max Backlogs: ${selectedDrive?.eligibilityMaxBacklogs ?? 0}.`, progressPercent: 10 },
      { id: 3, name: "Assessment Details Submitted by Recruiter", responsible: "Company Recruiter", roleType: "Company Recruiter", status: hasAssessments ? "Completed" : "In Progress", completionDate: hasAssessments ? "2026-07-20 02:00 PM" : "Awaiting Recruiter Submission", remarks: hasAssessments ? "Recruiter provided assessment details & question paper." : "Recruiter defining assessment criteria.", progressPercent: 18 },
      { id: 4, name: "Assessment Approved by Placement Officer", responsible: "Placement Officer", roleType: "Placement Officer", status: hasApprovedAssessments ? "Completed" : (hasAssessments ? "In Progress" : "Pending"), completionDate: hasApprovedAssessments ? "2026-07-21 11:00 AM" : "Pending Approval", remarks: hasApprovedAssessments ? "Placement Officer validated assessment details." : "TPO reviewing assessment details.", progressPercent: 25 },
      { id: 5, name: "Assessment Scheduled", responsible: "Placement Officer", roleType: "Placement Officer", status: hasScheduledAssessments ? "Completed" : (hasApprovedAssessments ? "In Progress" : "Pending"), completionDate: hasScheduledAssessments ? "2026-07-22 04:00 PM" : "Pending Schedule", remarks: hasScheduledAssessments ? "Lab allocated & invigilators assigned by TPO." : "TPO scheduling assessment.", progressPercent: 32 },
      { id: 6, name: "Assessment Conducted", responsible: "Placement Officer", roleType: "Placement Officer", status: hasConductedAssessments ? "Completed" : (hasScheduledAssessments ? "In Progress" : "Pending"), completionDate: hasConductedAssessments ? "2026-08-01 11:30 AM" : "Awaiting Conduct", remarks: hasConductedAssessments ? `${assessments[0]?.completedCount || 138} student submissions completed.` : "Placement Officer conducting exam in labs.", progressPercent: 40 },
      { id: 7, name: "Assessment Results Prepared", responsible: "Placement Officer", roleType: "Placement Officer", status: hasResultsPrepared ? "Completed" : (hasConductedAssessments ? "In Progress" : "Pending"), completionDate: hasResultsPrepared ? "2026-08-02 02:00 PM" : "Evaluating", remarks: hasResultsPrepared ? "Scores evaluated and compiled by TPO Desk." : "TPO evaluating test responses.", progressPercent: 48 },
      { id: 8, name: "Results Published", responsible: "Placement Officer", roleType: "Placement Officer", status: hasResultsPublished ? "Completed" : (hasResultsPrepared ? "In Progress" : "Pending"), completionDate: hasResultsPublished ? "2026-08-03 10:00 AM" : "Pending Publication", remarks: hasResultsPublished ? "Placement Officer verified & published scores." : "TPO verifying scores for publication.", progressPercent: 55 },
      { id: 9, name: "Results Sent to Recruiter", responsible: "Placement Officer", roleType: "Placement Officer", status: hasResultsSentToRecruiter ? "Completed" : (hasResultsPublished ? "In Progress" : "Pending"), completionDate: hasResultsSentToRecruiter ? "2026-08-03 10:30 AM" : "Pending Dispatch", remarks: hasResultsSentToRecruiter ? "Published shortlist dispatched to Company Recruiter." : "TPO sending results to Recruiter.", progressPercent: 60 },
      { id: 10, name: "Recruiter Reviews Results", responsible: "Company Recruiter", roleType: "Company Recruiter", status: hasRecruiterReviewed ? "Completed" : (hasResultsSentToRecruiter ? "In Progress" : "Pending"), completionDate: hasRecruiterReviewed ? "2026-08-04 02:00 PM" : "Awaiting Review", remarks: hasRecruiterReviewed ? "Recruiter reviewed published candidate list." : "Recruiter analyzing published results.", progressPercent: 65 },
      { id: 11, name: "Technical Interview Scheduled", responsible: "Company Recruiter", roleType: "Company Recruiter", status: hasInterviewScheduleCreated ? "Completed" : (hasRecruiterReviewed ? "In Progress" : "Pending"), completionDate: hasInterviewScheduleCreated ? "2026-08-05 04:00 PM" : "Pending Schedule", remarks: hasInterviewScheduleCreated ? "Recruiter submitted technical interview slots." : "Recruiter scheduling technical round.", progressPercent: 72 },
      { id: 12, name: "Technical Interview Completed", responsible: "Recruiter Panel", roleType: "Recruiter Panel", status: hasTechInterviewsCompleted ? "Completed" : (hasInterviewScheduleCreated ? "In Progress" : "Pending"), completionDate: hasTechInterviewsCompleted ? "2026-08-15 05:00 PM" : "In Progress", remarks: hasTechInterviewsCompleted ? "Technical panel evaluations completed." : "Panel conducting technical interviews.", progressPercent: 78 },
      { id: 13, name: "HR Interview Scheduled", responsible: "Company Recruiter", roleType: "Company Recruiter", status: hasHRInterviewsScheduled ? "Completed" : (hasTechInterviewsCompleted ? "In Progress" : "Pending"), completionDate: hasHRInterviewsScheduled ? "2026-08-16 11:00 AM" : "Pending Schedule", remarks: hasHRInterviewsScheduled ? "HR interview slots created by Recruiter." : "Recruiter setting up HR rounds.", progressPercent: 84 },
      { id: 14, name: "HR Interview Completed", responsible: "HR Team", roleType: "HR Team", status: hasHRInterviewsCompleted ? "Completed" : (hasHRInterviewsScheduled ? "In Progress" : "Pending"), completionDate: hasHRInterviewsCompleted ? "2026-08-18 03:00 PM" : "In Progress", remarks: hasHRInterviewsCompleted ? "HR behavioral evaluations completed." : "HR team conducting evaluations.", progressPercent: 88 },
      { id: 15, name: "Offer Released", responsible: "Company Recruiter", roleType: "Company Recruiter", status: hasOffers ? "Completed" : (hasHRInterviewsCompleted ? "In Progress" : "Pending"), completionDate: hasOffers ? "2026-08-20 10:00 AM" : "Drafting Offers", remarks: hasOffers ? `${offers.length} formal offer packages released.` : "Recruiter drafting job offers.", progressPercent: 93 },
      { id: 16, name: "Offer Accepted / Declined", responsible: "Students", roleType: "Students", status: hasAcceptedOffers ? "Completed" : (hasOffers ? "In Progress" : "Pending"), completionDate: hasAcceptedOffers ? "2026-08-25 04:00 PM" : "Awaiting Student Action", remarks: hasAcceptedOffers ? "Student accepted job offer letter." : "Students reviewing offer packages.", progressPercent: 96 },
      { id: 17, name: "Joining Confirmed", responsible: "Placement Officer", roleType: "Placement Officer", status: hasJoiningConfirmed ? "Completed" : (hasAcceptedOffers ? "In Progress" : "Pending"), completionDate: hasJoiningConfirmed ? "2026-08-28 02:00 PM" : "Verifying Joining", remarks: hasJoiningConfirmed ? "TPO confirmed student joining & verification." : "TPO verifying joining documents.", progressPercent: 99 },
      { id: 18, name: "Drive Closed", responsible: "Placement Officer", roleType: "Placement Officer", status: isDriveClosed ? "Completed" : (hasJoiningConfirmed ? "In Progress" : "Pending"), completionDate: isDriveClosed ? "2026-08-30 05:00 PM" : "Pending Drive Closure", remarks: isDriveClosed ? "Placement Drive successfully closed & archived." : "Placement Officer preparing drive closure report.", progressPercent: 100 }
    ];
  };

  const lifecycleStages = calculateDriveLifecycleStages();
  const currentActiveStageObj = lifecycleStages.find(s => s.status === "In Progress") || lifecycleStages[5];
  const progressPercentage = currentActiveStageObj.progressPercent;

  // Dynamic Smart Insights Alerts Generator
  const generateSmartInsights = () => {
    const alerts: { title: string; desc: string; type: "warning" | "info" | "success" | "danger" }[] = [];

    if (resultsSubmissionStatus === "Pending TPO Review") {
      alerts.push({
        title: "TPO Approval Pending",
        desc: "Uploaded assessment scores are awaiting final Placement Officer validation.",
        type: "warning"
      });
    }

    if (assessments.length > 0 && !assessments.some(a => a.status === "Conducted")) {
      alerts.push({
        title: "Assessment Deadline Approaching",
        desc: `Online coding assessment deadline is scheduled for ${selectedDrive?.applicationDeadline || '10 Aug 2026'}.`,
        type: "info"
      });
    }

    if (interviews.length === 0) {
      alerts.push({
        title: "Interview Schedule Pending",
        desc: "No technical panel interview slots have been published for this drive yet.",
        type: "warning"
      });
    }

    if (offers.length === 0) {
      alerts.push({
        title: "Offer Packages Not Released",
        desc: "Final job offer letters have not been issued to candidates.",
        type: "info"
      });
    }

    alerts.push({
      title: "Drive Health Status: Healthy",
      desc: "All candidate dossiers and automated eligibility criteria are synchronized.",
      type: "success"
    });

    return alerts;
  };

  const smartInsights = generateSmartInsights();

  // Dynamic Context-Aware Quick Actions
  const getContextualQuickActions = () => {
    const stageName = currentActiveStageObj.name;
    const actions: { label: string; icon: React.ElementType; tab: WorkspaceTab; color: string }[] = [];

    if (stageName === "TPO Review" || stageName === "Results Uploaded") {
      actions.push({ label: "Upload / Edit Results", icon: FileUp, tab: "results", color: "bg-amber-500 text-white" });
      actions.push({ label: "View Eligible Students", icon: UserCheck, tab: "eligible", color: "bg-purple-600 text-white" });
      actions.push({ label: "Export Drive Report", icon: FileSpreadsheet, tab: "reports", color: "bg-emerald-600 text-white" });
    } else if (stageName === "Technical Interview" || stageName === "HR Interview") {
      actions.push({ label: "Schedule Technical Round", icon: Calendar, tab: "interviews", color: "bg-cyan-600 text-white" });
      actions.push({ label: "Record Round Evaluation", icon: CheckCircle2, tab: "interviews", color: "bg-purple-600 text-white" });
      actions.push({ label: "View Shortlisted Candidates", icon: Users, tab: "eligible", color: "bg-indigo-600 text-white" });
    } else {
      actions.push({ label: "Create Online Assessment", icon: Laptop, tab: "assessment_details", color: "bg-indigo-600 text-white" });
      actions.push({ label: "Schedule Interviews", icon: Calendar, tab: "interviews", color: "bg-cyan-600 text-white" });
      actions.push({ label: "Issue Formal Offers", icon: Award, tab: "offers", color: "bg-emerald-600 text-white" });
    }

    return actions;
  };

  const contextualActions = getContextualQuickActions();

  // Audit Logs Data
  const auditLogs: StageAuditLogEntry[] = [
    { id: "LOG_001", driveId: selectedDrive?.id || "DRV_101", previousStage: "None", newStage: "Drive Created", changedBy: "Dr. Rajesh Kumar", role: "Placement Officer", timestamp: "2026-07-15 09:00:00", remarks: "Drive initialized for Google India." },
    { id: "LOG_002", driveId: selectedDrive?.id || "DRV_101", previousStage: "Drive Created", newStage: "Eligible Students Finalized", changedBy: "Placement System", role: "Placement System", timestamp: "2026-07-16 12:00:00", remarks: "142 candidates matched CGPA criteria." },
    { id: "LOG_003", driveId: selectedDrive?.id || "DRV_101", previousStage: "Eligible Students Finalized", newStage: "Online Assessment Created", changedBy: "Anjali Sharma", role: "Company Recruiter", timestamp: "2026-07-20 14:00:00", remarks: "Published HackerRank coding test." },
    { id: "LOG_004", driveId: selectedDrive?.id || "DRV_101", previousStage: "Online Assessment Created", newStage: "Assessment Completed", changedBy: "Assessment Engine", role: "Assessment Engine", timestamp: "2026-08-01 11:30:00", remarks: "138 student submissions finalized." },
    { id: "LOG_005", driveId: selectedDrive?.id || "DRV_101", previousStage: "Assessment Completed", newStage: "Results Uploaded", changedBy: "Anjali Sharma", role: "Company Recruiter", timestamp: "2026-08-02 16:00:00", remarks: "Submitted test scores for TPO Review." }
  ];

  const filteredEligibleStudents = eligibleStudents.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = "w-full rounded-xl border border-input bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1";

  return (
    <div className="fixed inset-0 bg-background text-foreground flex overflow-hidden font-sans">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-500/20">
              {recruiter?.company_name?.charAt(0) || "C"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{recruiter?.company_name || "Company"}</p>
              <p className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider">Recruiter Portal</p>
            </div>
          </div>
        </div>

        {/* Recruiter Identity Banner */}
        <div className="px-4 py-3 border-b border-border bg-purple-500/5">
          <p className="text-xs font-semibold text-foreground truncate">{recruiter?.name || "Recruiter"}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{recruiter?.designation || "Recruiter"}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-500 font-semibold">Active Session</span>
          </div>
        </div>

        {/* Main Nav Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground px-3 py-1 tracking-wider">Navigation</p>
          {globalNavItems.map(({ id, label, icon: Icon }) => {
            const active = activeGlobalNav === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveGlobalNav(id);
                  if (id === "my_drives" && !selectedDriveId && drives.length > 0) {
                    setSelectedDriveId(drives[0].id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-purple-500" : ""}`} />
                <span>{label}</span>
                {id === "my_drives" && drives.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300">
                    {drives.length}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Drive Selector */}
          {activeGlobalNav === "my_drives" && drives.length > 0 && (
            <div className="pt-4 space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground px-3 py-1 tracking-wider">Assigned Drives</p>
              {drives.map(d => {
                const isSelected = selectedDriveId === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDriveId(d.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-purple-600 text-white font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <p className="truncate font-semibold">{d.role}</p>
                    <p className={`text-[10px] truncate ${isSelected ? "text-purple-200" : "text-muted-foreground"}`}>{d.company}</p>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-border space-y-2">
          <button
            onClick={loadRecruiterAndDrives}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="shrink-0 h-14 flex items-center justify-between px-6 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {activeGlobalNav === "my_drives" && selectedDrive && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Drive Workspace:</span>
                <span className="text-sm font-bold text-foreground">{selectedDrive.role}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  {selectedDrive.company}
                </span>
              </div>
            )}
            {activeGlobalNav !== "my_drives" && (
              <p className="font-semibold text-foreground text-sm">
                {activeGlobalNav === "reports" ? "Placement Analytics Summary" : "Recruiter Profile Credentials"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="size-3.5 text-purple-500" />
            <span>RBAC Protected</span>
            <span className="text-border">·</span>
            <span className="font-mono text-foreground">{recruiter?.email}</span>
          </div>
        </header>

        {/* ── DRIVE WORKSPACE TABS BAR ── */}
        {activeGlobalNav === "my_drives" && selectedDrive && (
          <div className="shrink-0 bg-card border-b border-border px-6">
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
              {workspaceTabsList.map(tab => {
                const Icon = tab.icon;
                const active = activeWorkspaceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveWorkspaceTab(tab.id)}
                    className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                      active
                        ? "border-purple-500 text-purple-600 dark:text-purple-400 font-bold bg-purple-500/5"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <Icon className={`size-4 ${active ? "text-purple-500" : ""}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scrollable Main Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-28 bg-muted rounded-2xl" />
              <div className="h-64 bg-muted rounded-2xl" />
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* VIEW: MY DRIVES WORKSPACE                             */}
          {/* ═════════════════════════════════════════════════════ */}
          {!loading && activeGlobalNav === "my_drives" && selectedDrive && (
            <div className="space-y-6">

              {/* ── STEP 17: PROFESSIONAL DRIVE STATUS DASHBOARD (TOP OF WORKSPACE) ── */}
              {activeWorkspaceTab === "overview" && (
                <div className="space-y-6">

                  {/* 1. TOP SUMMARY CARD */}
                  <div className="rounded-2xl border border-border bg-gradient-to-r from-purple-600/10 via-card to-card p-6 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-500 px-3 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> 🟢 {selectedDrive.status}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">ID: {selectedDrive.id}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mt-2">{selectedDrive.company}</h2>
                        <p className="text-base font-semibold text-purple-500">{selectedDrive.role} Recruitment Drive</p>
                      </div>

                      {/* Right Completion KPI Box */}
                      <div className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Drive Completion</p>
                          <p className="text-3xl font-extrabold text-purple-500">{progressPercentage}%</p>
                        </div>
                        <div className="border-r border-border h-10" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Stage</p>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm mt-0.5">
                            <span className="size-1.5 rounded-full bg-white animate-pulse" /> 🔵 {currentActiveStageObj.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Drive Information & Statistics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs border-t border-border pt-4">
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Drive Date</p>
                        <p className="font-bold text-foreground mt-0.5">{selectedDrive.date}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Registration Deadline</p>
                        <p className="font-bold text-rose-500 mt-0.5">{selectedDrive.applicationDeadline}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Assigned Recruiter</p>
                        <p className="font-bold text-foreground truncate mt-0.5">{selectedDrive.assignedRecruiter || recruiter?.name}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Assigned By (TPO)</p>
                        <p className="font-bold text-foreground truncate mt-0.5">{selectedDrive.assignedBy || "Dr. Rajesh Kumar"}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Eligible Students</p>
                        <p className="font-extrabold text-purple-500 mt-0.5">{eligibleStudents.length || 152}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Applied</p>
                        <p className="font-extrabold text-blue-500 mt-0.5">146</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background border border-border">
                        <p className="text-muted-foreground text-[10px] uppercase font-semibold">Offers Released</p>
                        <p className="font-extrabold text-emerald-500 mt-0.5">{offers.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. TWO-COLUMN: NEXT ACTION REQUIRED & UPCOMING STAGE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Next Action Required Box */}
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <AlertTriangle className="size-4 text-amber-500" /> Next Action Required
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                          High Priority
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-medium">
                        Placement Officer must review uploaded assessment results before the recruiter can continue with the Technical Interview stage.
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <div><span className="font-semibold text-foreground">Pending Since:</span> 2 Days</div>
                        <div><span className="font-semibold text-rose-500">Deadline:</span> Tomorrow 5:00 PM</div>
                      </div>
                    </div>

                    {/* Upcoming Stage Box */}
                    <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <PlayCircle className="size-4 text-blue-500" /> Upcoming Stage
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 border border-blue-500/30">
                          Stage 8 of 13
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground">Technical Interview</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Responsible: <span className="font-semibold text-purple-500">Company Recruiter Panel</span></p>
                      </div>
                      <p className="text-xs text-muted-foreground">Estimated Conduct Date: <strong className="text-foreground">22 Aug 2026</strong></p>
                    </div>
                  </div>

                  {/* 3. SMART INSIGHTS & CONTEXTUAL QUICK ACTIONS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Smart Insights Alerts */}
                    <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 space-y-3">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Sparkles className="size-4 text-purple-500" /> Smart Insights & Automated Alerts
                      </h4>
                      <div className="space-y-2">
                        {smartInsights.map((alert, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                              alert.type === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-300" :
                              alert.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300" :
                              "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-300"
                            }`}
                          >
                            <Info className="size-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-foreground">{alert.title}</p>
                              <p className="text-[11px] mt-0.5">{alert.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Context-Aware Quick Actions */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 flex flex-col">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Zap className="size-4 text-amber-500" /> Contextual Quick Actions
                      </h4>
                      <p className="text-xs text-muted-foreground">Actions dynamically tailored for stage '{currentActiveStageObj.name}'.</p>
                      <div className="space-y-2 flex-1 mt-2">
                        {contextualActions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveWorkspaceTab(act.tab)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border border-border text-xs font-semibold hover:opacity-90 transition-all ${act.color}`}
                          >
                            <span className="flex items-center gap-2">
                              <act.icon className="size-4" /> {act.label}
                            </span>
                            <ArrowRight className="size-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. 13-STAGE LIFECYCLE TRACKER STEPPER */}
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Activity className="size-5 text-purple-500" />
                          <h3 className="font-bold text-foreground text-base">End-to-End Recruitment Lifecycle Stepper</h3>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {progressPercentage}% Completed
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Visual stage tracker from Drive Creation to Joining Confirmation.
                        </p>
                      </div>

                      {/* Health Indicator Badge */}
                      <div className="flex items-center gap-3 bg-background p-2.5 rounded-xl border border-border text-xs">
                        <HeartPulse className="size-4 text-emerald-500" />
                        <div>
                          <span className="text-muted-foreground text-[10px] uppercase font-semibold">Drive Health:</span>
                          <span className="font-bold text-emerald-500 ml-1">Healthy / On Track</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Line */}
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    {/* 13-Stage Horizontal Stepper */}
                    <div className="overflow-x-auto pb-2">
                      <div className="flex items-start gap-3 min-w-[1100px]">
                        {lifecycleStages.map((stg) => {
                          const isCompleted = stg.status === "Completed";
                          const isInProgress = stg.status === "In Progress";
                          const isCancelled = stg.status === "Cancelled";

                          let badgeColor = "bg-muted text-muted-foreground border-border";
                          if (isCompleted) badgeColor = "bg-emerald-500 text-white border-emerald-600";
                          else if (isInProgress) badgeColor = "bg-blue-600 text-white border-blue-700 animate-pulse";
                          else if (isCancelled) badgeColor = "bg-rose-500 text-white border-rose-600";

                          return (
                            <div
                              key={stg.id}
                              onMouseEnter={() => setHoveredStage(stg)}
                              onMouseLeave={() => setHoveredStage(null)}
                              className={`flex-1 min-w-[85px] p-3 rounded-2xl border transition-all cursor-pointer relative ${
                                isInProgress ? "border-purple-500/50 bg-purple-500/5 shadow-sm" : "border-border bg-background hover:border-purple-500/30"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${badgeColor}`}>
                                  {isCompleted ? "✓" : stg.id}
                                </span>
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  isCompleted ? "bg-emerald-500/10 text-emerald-500" : isInProgress ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                                }`}>
                                  {stg.status}
                                </span>
                              </div>

                              <p className="text-[11px] font-bold text-foreground truncate" title={stg.name}>{stg.name}</p>
                              <p className="text-[9px] text-purple-500 font-semibold truncate mt-0.5">{stg.roleType}</p>
                              <p className="text-[9px] text-muted-foreground truncate mt-0.5">{stg.completionDate}</p>

                              {/* Hover Tooltip Card */}
                              {hoveredStage?.id === stg.id && (
                                <div className="absolute top-full left-0 mt-2 z-40 w-64 p-3 rounded-xl bg-card border border-border shadow-2xl text-xs space-y-1.5 pointer-events-none">
                                  <div className="flex items-center justify-between border-b border-border pb-1">
                                    <span className="font-bold text-foreground">{stg.name}</span>
                                    <span className="text-[10px] font-bold text-purple-500">{stg.status}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground"><strong>Responsible:</strong> {stg.responsible}</p>
                                  <p className="text-[11px] text-muted-foreground"><strong>Completion Date:</strong> {stg.completionDate}</p>
                                  <p className="text-[11px] text-muted-foreground"><strong>Remarks:</strong> {stg.remarks}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left 2 Cols: Eligibility Rules & Governance */}
                    <div className="lg:col-span-2 space-y-5">
                      {/* Eligibility Rules */}
                      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-purple-500" /> Drive Eligibility Criteria & Rules
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-background border border-border">
                            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Departments Allowed</p>
                            <p className="font-bold text-foreground mt-1">{(selectedDrive.eligibilityDepartments || ["CSE","AIML","ECE"]).join(", ")}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-border">
                            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Minimum CGPA</p>
                            <p className="font-bold text-amber-500 mt-1">{selectedDrive.eligibilityMinCgpa || 7.5} CGPA</p>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-border">
                            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Max Backlogs</p>
                            <p className="font-bold text-foreground mt-1">{selectedDrive.eligibilityMaxBacklogs ?? 0} Backlogs</p>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-border">
                            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Target Batch</p>
                            <p className="font-bold text-foreground mt-1">{selectedDrive.eligibilityBatch || "2026 Passing"}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-border sm:col-span-2">
                            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Required Skills</p>
                            <p className="font-semibold text-purple-500 mt-1">{(selectedDrive.eligibilitySkills || ["Data Structures","Algorithms","System Design"]).join(" · ")}</p>
                          </div>
                        </div>
                      </div>

                      {/* Governance Info */}
                      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <Shield className="size-4 text-indigo-500" /> Assignment & Governance Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Assigned Recruiter</p>
                            <p className="font-bold text-foreground mt-0.5">{selectedDrive.assignedRecruiter || recruiter?.name}</p>
                            <p className="text-[11px] text-muted-foreground">{recruiter?.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Assigned By (TPO)</p>
                            <p className="font-bold text-foreground mt-0.5">{selectedDrive.assignedBy || "Dr. Rajesh Kumar (TPO Head)"}</p>
                            <p className="text-[11px] text-muted-foreground">Assigned on {selectedDrive.assignedDate || "2026-07-15"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Action Items & Tasks */}
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <Clock className="size-4 text-amber-500" /> Action Items & Tasks
                        </h3>
                        <div className="space-y-2">
                          {(selectedDrive.upcomingTasks || ["Review Coding Test Results", "Finalize Round 1 Tech Panel", "Issue Formal Offers"]).map((task: string, i: number) => (
                            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background border border-border text-xs">
                              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                              <span className="font-medium text-foreground">{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2. ELIGIBLE STUDENTS TAB ── */}
              {activeWorkspaceTab === "eligible" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Eligible Students roster ({filteredEligibleStudents.length})</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Students matching criteria for {selectedDrive.role} (Min CGPA: {selectedDrive.eligibilityMinCgpa || 7.5}+).</p>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search student or roll..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-60 rounded-xl border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border overflow-hidden bg-card">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                        <tr>
                          <th className="px-5 py-3.5">Student Name & Roll</th>
                          <th className="px-5 py-3.5">Dept</th>
                          <th className="px-5 py-3.5">CGPA</th>
                          <th className="px-5 py-3.5">Backlogs</th>
                          <th className="px-5 py-3.5">Skills</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredEligibleStudents.map(stu => (
                          <tr key={stu.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="size-9 rounded-full bg-purple-500/10 text-purple-500 font-bold flex items-center justify-center text-xs">
                                  {stu.full_name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{stu.full_name}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">{stu.roll_number}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-blue-500">{stu.department}</td>
                            <td className="px-5 py-3.5 font-bold text-amber-500">{stu.cgpa}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{stu.backlogs || 0}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-wrap gap-1">
                                {(stu.skills || []).slice(0, 3).map((sk: string) => (
                                  <span key={sk} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <CheckCircle2 className="size-3" /> Eligible
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right space-x-2">
                              {stu.resumeUrl && (
                                <a
                                  href={stu.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:underline"
                                >
                                  <ExternalLink className="size-3" /> Resume
                                </a>
                              )}
                              <button
                                onClick={() => openStudentDossier(stu)}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── 3. ASSESSMENT DETAILS TAB (RECRUITER CREATES / SUBMITS DETAILS) ── */}
              {activeWorkspaceTab === "assessment_details" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Assessment Details & Requirements</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Recruiter provides test specifications, question paper, duration, and passing criteria for {selectedDrive.role}.</p>
                    </div>
                    <button
                      onClick={() => setShowCreateTestModal(true)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-all"
                    >
                      <Plus className="size-4" /> Create Assessment Details
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-300 flex items-start gap-3">
                    <Laptop className="size-4 shrink-0 mt-0.5 text-purple-500" />
                    <div>
                      <strong className="font-bold">Workflow Responsibility:</strong> Recruiter provides assessment details and question paper. Placement Officer approves, schedules, and conducts the assessment.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {assessments.length === 0 ? (
                      <div className="col-span-2 p-8 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
                        <Laptop className="size-8 mx-auto text-purple-500" />
                        <p className="font-bold text-sm text-foreground">No Assessment Details Submitted Yet</p>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          Click "Create Assessment Details" to upload the question paper, set passing criteria, and submit to the Placement Officer for approval.
                        </p>
                        <button
                          onClick={() => setShowCreateTestModal(true)}
                          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-all"
                        >
                          Submit Assessment Details
                        </button>
                      </div>
                    ) : (
                      assessments.map(test => (
                        <div key={test.id} className="rounded-2xl border border-border bg-card p-5 space-y-4 hover:border-purple-500/30 transition-all">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                test.status === "Approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : test.status === "Rejected" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}>{test.status || "Submitted to Placement Officer"}</span>
                              <h4 className="text-sm font-bold text-foreground mt-2">{test.title}</h4>
                              <p className="text-xs text-purple-500 font-medium">Drive: {test.drive || selectedDrive.role}</p>
                            </div>
                            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                              <FileText className="size-5" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                            <div><span className="text-muted-foreground">Type:</span> <span className="font-semibold text-foreground">{test.assessmentType || "Coding / Tech"}</span></div>
                            <div><span className="text-muted-foreground">Duration:</span> <span className="font-semibold text-foreground">{test.duration || 60} mins</span></div>
                            <div><span className="text-muted-foreground">Passing Cutoff:</span> <span className="font-bold text-amber-500">{test.passingMarks || 60}/100</span></div>
                            <div><span className="text-muted-foreground">Allowed Resources:</span> <span className="font-semibold text-foreground">{test.allowedResources || "Standard IDE"}</span></div>
                          </div>

                          {test.questionPaperUrl && (
                            <div className="p-2.5 rounded-xl bg-background border border-border text-xs flex items-center justify-between">
                              <span className="text-muted-foreground text-[11px]">Question Paper:</span>
                              <a href={test.questionPaperUrl} target="_blank" rel="noreferrer" className="text-purple-500 hover:underline font-mono text-[11px] truncate max-w-[220px]">
                                {test.questionPaperUrl} ↗
                              </a>
                            </div>
                          )}

                          {test.assessmentLink && (
                            <div className="p-2.5 rounded-xl bg-background border border-border text-xs flex items-center justify-between">
                              <span className="text-muted-foreground text-[11px]">Coding Test Link:</span>
                              <a href={test.assessmentLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-mono text-[11px] truncate max-w-[220px]">
                                {test.assessmentLink} ↗
                              </a>
                            </div>
                          )}

                          {test.instructions && (
                            <p className="text-[11px] text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
                              <strong>Instructions:</strong> {test.instructions}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                            <span>Status: <strong className="text-foreground">{test.status || "Pending TPO Approval"}</strong></span>
                            {test.tpoRemarks && <span className="text-emerald-500 font-semibold">{test.tpoRemarks}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── 4. ASSESSMENT MANAGEMENT TAB (PLACEMENT OFFICER RESPONSIBILITY) ── */}
              {activeWorkspaceTab === "assessment_management" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Assessment Management & Invigilation</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Managed by Placement Officer: Schedule, lab allocation, live exam conduct, and invigilation monitoring.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Placement Officer Desk
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 flex items-start gap-3">
                    <Clock className="size-4 shrink-0 mt-0.5 text-blue-500" />
                    <div>
                      <strong className="font-bold">Placement Cell Governance:</strong> The Placement Cell conducts the assessment, allocates computer labs, assigns invigilators, and verifies live attendance. Recruiter receives published scores after completion.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Schedule & Venue Card */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Calendar className="size-4 text-purple-500" /> Assessment Schedule & Venue
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-border">
                          <span className="text-muted-foreground">Assigned Venue:</span>
                          <span className="font-bold text-foreground">{selectedDrive?.venue || "Main Tech Block Lab 1"}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border">
                          <span className="text-muted-foreground">Lab Capacity:</span>
                          <span className="font-bold text-foreground">150 Systems (CS Lab 1 & 2)</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-border">
                          <span className="text-muted-foreground">Exam Date:</span>
                          <span className="font-bold text-purple-500">{selectedDrive?.date || "2026-08-15"}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-muted-foreground">Exam Time Slot:</span>
                          <span className="font-bold text-foreground">10:00 AM - 11:30 AM</span>
                        </div>
                      </div>
                    </div>

                    {/* Invigilation & Staff Card */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <UserCheck className="size-4 text-emerald-500" /> Assigned Invigilators
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between">
                          <span className="font-semibold text-foreground">Prof. Ramesh V. (CSE Dept)</span>
                          <span className="text-[10px] font-bold text-emerald-500">Chief Invigilator</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between">
                          <span className="font-semibold text-foreground">Dr. Sunita M. (IT Dept)</span>
                          <span className="text-[10px] font-bold text-blue-500">Lab Co-ordinator</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-between">
                          <span className="font-semibold text-foreground">Placement Cell Operations Team</span>
                          <span className="text-[10px] font-bold text-purple-500">System Monitoring</span>
                        </div>
                      </div>
                    </div>

                    {/* Conduct Status Card */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        <Shield className="size-4 text-amber-500" /> Exam Conduct Status
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                          <p className="font-bold">Status: Assessment Conducted & Completed</p>
                          <p className="text-[11px] mt-0.5">Placement Officer recorded attendance and compiled test answer scripts.</p>
                        </div>
                        <div className="flex justify-between text-xs pt-1">
                          <span className="text-muted-foreground">Eligible Candidates:</span>
                          <span className="font-bold text-foreground">{eligibleStudents.length || 142}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Present Candidates:</span>
                          <span className="font-bold text-emerald-500">138</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Absent Candidates:</span>
                          <span className="font-bold text-rose-500">4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 5. ASSESSMENT RESULTS TAB (PUBLISHED RESULTS REVIEW) ── */}
              {activeWorkspaceTab === "results" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Assessment Results & Roster</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Published candidate scores for {selectedDrive.role} verified by Placement Officer.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Published by TPO
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-300 flex items-start gap-3">
                    <ShieldAlert className="size-4 shrink-0 mt-0.5 text-emerald-500" />
                    <div>
                      <strong className="font-bold">Verified Results:</strong> Scores have been verified and published by the Placement Officer. Recruiter can review candidate scores and proceed to schedule Technical & HR Interviews. Recruiter score editing is strictly restricted.
                    </div>
                  </div>

                  {/* Summary Statistics Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-card border border-border">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">Total Evaluated</p>
                      <p className="text-xl font-extrabold text-foreground mt-1">{resultsRows.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">Passed Candidates</p>
                      <p className="text-xl font-extrabold text-emerald-500 mt-1">{resultsRows.filter(r => r.passFail === "Pass").length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">Highest Score</p>
                      <p className="text-xl font-extrabold text-amber-500 mt-1">{Math.max(...resultsRows.map(r => r.score || 0))}/100</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">Average Score</p>
                      <p className="text-xl font-extrabold text-purple-500 mt-1">{(resultsRows.reduce((a,c) => a + c.score, 0)/resultsRows.length).toFixed(1)}/100</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground">Candidate Assessment Roster</h4>
                      <button onClick={() => toast.success("Exporting published results to Excel...")} className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 hover:underline">
                        <FileSpreadsheet className="size-4" /> Export CSV / Excel
                      </button>
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                          <tr>
                            <th className="px-4 py-3">Student Name</th>
                            <th className="px-4 py-3">Roll Number</th>
                            <th className="px-4 py-3">Score (100)</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {resultsRows.map(row => (
                            <tr key={row.id} className="hover:bg-muted/20">
                              <td className="px-4 py-3 font-semibold text-foreground">{row.student}</td>
                              <td className="px-4 py-3 font-mono text-muted-foreground">{row.rollNumber}</td>
                              <td className="px-4 py-3 font-bold text-amber-500">{row.score}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  row.passFail === "Pass" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                }`}>
                                  {row.passFail}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{row.remarks || "Evaluated by Placement Officer Desk."}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                      <button
                        onClick={() => toast.success("Draft saved successfully.")}
                        className="rounded-xl border border-border px-5 py-2 text-xs font-semibold hover:bg-accent"
                      >
                        Save Draft
                      </button>
                      <button
                        onClick={handleSubmitResults}
                        disabled={uploading}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2 text-xs font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                      >
                        <Send className="size-4" /> Submit for TPO Review
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 5. INTERVIEW MANAGEMENT TAB ── */}
              {activeWorkspaceTab === "interviews" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Interview Management</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Schedule rounds and record evaluation for {selectedDrive.role}.</p>
                    </div>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-semibold shadow-md transition-all"
                    >
                      <Plus className="size-4" /> Schedule Interview
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3.5">Candidate</th>
                          <th className="px-4 py-3.5">Round</th>
                          <th className="px-4 py-3.5">Date & Time</th>
                          <th className="px-4 py-3.5">Venue / Meeting</th>
                          <th className="px-4 py-3.5">Panel Members</th>
                          <th className="px-4 py-3.5">Attendance</th>
                          <th className="px-4 py-3.5">Result</th>
                          <th className="px-4 py-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {interviews.map(int => (
                          <tr key={int.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-semibold text-foreground">
                              <p>{int.candidateName}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{int.studentId}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                                {int.round || "Technical Round 1"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-foreground">{int.date}</p>
                              <p className="text-[10px] font-mono text-cyan-500">{int.timeSlot || int.time}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">{int.venue || "Conference Hall A"}</p>
                              {int.onlineMeetingLink && (
                                <a href={int.onlineMeetingLink} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                                  Meeting Link ↗
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {Array.isArray(int.panelists) ? int.panelists.join(", ") : int.panelists || "Technical Panel"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                int.attendance === "Present" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}>{int.attendance || "Scheduled"}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                int.result === "Advance" || int.result === "Selected" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" : "bg-muted text-muted-foreground border border-border"
                              }`}>{int.result || "Pending"}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => { setSelectedInterview(int); setShowEvalModal(true); }}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20"
                              >
                                Evaluate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── 6. OFFERS TAB ── */}
              {activeWorkspaceTab === "offers" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Job Offers ({offers.length})</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Extended placement offer packages for {selectedDrive.role}.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                        <tr>
                          <th className="px-5 py-3.5">Student</th>
                          <th className="px-5 py-3.5">Department</th>
                          <th className="px-5 py-3.5">Package (CTC)</th>
                          <th className="px-5 py-3.5">Location</th>
                          <th className="px-5 py-3.5">Joining Date</th>
                          <th className="px-5 py-3.5">Offer Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {offers.map(off => (
                          <tr key={off.id} className="hover:bg-muted/30">
                            <td className="px-5 py-3.5 font-semibold text-foreground">
                              <p>{off.studentName}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{off.studentId}</p>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-blue-500">{off.department}</td>
                            <td className="px-5 py-3.5 font-bold text-emerald-500 text-sm">{off.package}</td>
                            <td className="px-5 py-3.5 font-medium text-foreground">{off.location}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{off.joiningDate}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                off.status === "Accepted" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                off.status === "Rejected" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}>{off.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── 7. REPORTS TAB ── */}
              {activeWorkspaceTab === "reports" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Drive Analytics & Export Suite</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Generate export reports specifically for {selectedDrive.role}.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { downloadReportFile("pdf", "drive", selectedDrive.id); toast.success("Downloading PDF Report..."); }}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 text-white px-3.5 py-2 text-xs font-semibold shadow hover:bg-rose-500"
                      >
                        <Download className="size-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => { downloadReportFile("excel", "drive", selectedDrive.id); toast.success("Downloading Excel Report..."); }}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-3.5 py-2 text-xs font-semibold shadow hover:bg-emerald-500"
                      >
                        <Download className="size-3.5" /> Excel
                      </button>
                      <button
                        onClick={() => { downloadReportFile("csv", "drive", selectedDrive.id); toast.success("Downloading CSV Report..."); }}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-3.5 py-2 text-xs font-semibold shadow hover:bg-blue-500"
                      >
                        <Download className="size-3.5" /> CSV
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <UserCheck className="size-4 text-purple-500" /> Eligible Students Report
                      </h4>
                      <p className="text-muted-foreground">Contains full list of {eligibleStudents.length} eligible candidates with CGPA, branch & skills.</p>
                    </div>
                    <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Laptop className="size-4 text-indigo-500" /> Online Assessment Report
                      </h4>
                      <p className="text-muted-foreground">Test submission logs, average scores ({assessments[0]?.avgScore || 82}/100) and pass/fail summary.</p>
                    </div>
                    <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Calendar className="size-4 text-cyan-500" /> Interview Evaluation Report
                      </h4>
                      <p className="text-muted-foreground">Technical and HR panel feedback, attendance logs and round advancement status.</p>
                    </div>
                    <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Award className="size-4 text-emerald-500" /> Final Selection & Offer Report
                      </h4>
                      <p className="text-muted-foreground">Final offer letters released, CTC package breakdown and student acceptance tracking.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 8. TIMELINE & AUDIT LOG TAB ── */}
              {activeWorkspaceTab === "timeline" && (
                <div className="space-y-6">
                  {/* Timeline Header */}
                  <div className="pb-3 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Drive Lifecycle Activity Timeline</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Chronological activity history for {selectedDrive.role}.</p>
                    </div>
                  </div>

                  {/* Activity Events Timeline */}
                  <div className="space-y-3">
                    {timelineEvents.map((ev, i) => (
                      <div key={ev.id || i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
                        <div className="size-9 rounded-xl bg-purple-500/10 text-purple-500 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 border border-purple-500/20">
                          {i + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-md border border-purple-500/20">
                              {ev.stage}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{new Date(ev.timestamp).toLocaleString()}</span>
                          </div>
                          <h4 className="font-bold text-foreground text-sm">{ev.title}</h4>
                          <p className="text-xs text-muted-foreground">{ev.details}</p>
                          <p className="text-[10px] text-purple-500 font-medium mt-1">Responsible: {ev.updatedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Immutable Audit Log Section */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                          <Lock className="size-4 text-indigo-500" /> Immutable Stage Transition Audit Log
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Automated tamper-evident log of all stage transitions.</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded border border-indigo-500/20">
                        Drive ID: {selectedDrive.id}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                          <tr>
                            <th className="px-4 py-3">Previous Stage</th>
                            <th className="px-4 py-3">New Stage</th>
                            <th className="px-4 py-3">Changed By</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {auditLogs.map(log => (
                            <tr key={log.id} className="hover:bg-muted/20">
                              <td className="px-4 py-3 text-muted-foreground">{log.previousStage}</td>
                              <td className="px-4 py-3 font-bold text-purple-500">{log.newStage}</td>
                              <td className="px-4 py-3 font-semibold text-foreground">{log.changedBy}</td>
                              <td className="px-4 py-3 text-muted-foreground">{log.role}</td>
                              <td className="px-4 py-3 font-mono text-muted-foreground">{log.timestamp}</td>
                              <td className="px-4 py-3 text-muted-foreground">{log.remarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* VIEW: GLOBAL REPORTS                                  */}
          {/* ═════════════════════════════════════════════════════ */}
          {!loading && activeGlobalNav === "reports" && (
            <div className="space-y-5 max-w-4xl">
              <div className="pb-3 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Placement Analytics Summary</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Aggregate stats across all assigned campus drives.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Total Drives</p>
                  <p className="text-3xl font-bold text-purple-500 mt-1">{drives.length}</p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Total Applicants</p>
                  <p className="text-3xl font-bold text-blue-500 mt-1">{stats.eligibleStudents}</p>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Total Offers</p>
                  <p className="text-3xl font-bold text-emerald-500 mt-1">{stats.studentsSelected}</p>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════ */}
          {/* VIEW: RECRUITER PROFILE                               */}
          {/* ═════════════════════════════════════════════════════ */}
          {!loading && activeGlobalNav === "profile" && recruiter && (
            <div className="space-y-5 max-w-xl">
              <div className="pb-3 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Recruiter Profile</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Authenticated corporate credentials & permissions.</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="size-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    {recruiter.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{recruiter.name}</p>
                    <p className="text-sm text-muted-foreground">{recruiter.designation}</p>
                    <span className="text-[10px] font-semibold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 mt-1 inline-block">
                      {recruiter.company_name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <p className="text-muted-foreground text-[10px] uppercase font-semibold">Official Email</p>
                    <p className="font-semibold text-foreground mt-0.5">{recruiter.email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <p className="text-muted-foreground text-[10px] uppercase font-semibold">Phone</p>
                    <p className="font-semibold text-foreground mt-0.5">{recruiter.phone || "9876543210"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── STUDENT PROFILE / DOSSIER MODAL ── */}
      {showStudentProfileModal && selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-base">Student Academic Profile</h3>
              <button onClick={() => setShowStudentProfileModal(false)}>
                <XCircle className="size-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="size-12 rounded-full bg-purple-500/10 text-purple-500 font-bold flex items-center justify-center text-lg">
                {selectedStudentForProfile.full_name?.charAt(0) || selectedStudentForProfile.studentName?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-foreground text-base">{selectedStudentForProfile.full_name || selectedStudentForProfile.studentName}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {selectedStudentForProfile.roll_number || selectedStudentForProfile.studentId} · {selectedStudentForProfile.department}
                </p>
                <div className="flex gap-3 mt-1 text-xs">
                  <span className="font-semibold text-amber-500">CGPA: {selectedStudentForProfile.cgpa}</span>
                  <span className="font-semibold text-blue-500">Backlogs: {selectedStudentForProfile.backlogs || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Skills & Certifications</p>
              <div className="flex flex-wrap gap-1.5">
                {(selectedStudentForProfile.skills || ["React", "Node.js", "Python"]).map((sk: string) => (
                  <span key={sk} className="text-xs bg-muted text-foreground px-2.5 py-1 rounded-full font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Placement History Timeline</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {studentHistoryTimeline.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-background border border-border text-xs space-y-0.5">
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowStudentProfileModal(false)}
              className="w-full rounded-xl border border-border py-2 text-sm font-semibold hover:bg-accent"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* ── CREATE TEST MODAL ── */}
      {showCreateTestModal && selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Laptop className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Create Online Assessment</h3>
                  <p className="text-xs text-muted-foreground">Drive: {selectedDrive.role}</p>
                </div>
              </div>
              <button onClick={() => setShowCreateTestModal(false)}>
                <XCircle className="size-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-3.5">
              <div>
                <label className={labelCls}>Test Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Technical Coding Challenge Round 1"
                  value={testForm.title}
                  onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Duration (Minutes)</label>
                  <input
                    type="number"
                    value={testForm.duration}
                    onChange={e => setTestForm({ ...testForm, duration: parseInt(e.target.value) || 60 })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Passing Cutoff Marks</label>
                  <input
                    type="number"
                    value={testForm.passingMarks}
                    onChange={e => setTestForm({ ...testForm, passingMarks: parseInt(e.target.value) || 60 })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start Time</label>
                  <input
                    type="datetime-local"
                    value={testForm.startTime}
                    onChange={e => setTestForm({ ...testForm, startTime: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End Time</label>
                  <input
                    type="datetime-local"
                    value={testForm.endTime}
                    onChange={e => setTestForm({ ...testForm, endTime: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>External Assessment Link (HackerRank/Codility/Mettl)</label>
                <input
                  type="url"
                  placeholder="https://hackerrank.com/..."
                  value={testForm.assessmentLink}
                  onChange={e => setTestForm({ ...testForm, assessmentLink: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Question Paper URL / File Upload</label>
                <input
                  type="text"
                  placeholder="https://storage.college.edu/papers/..."
                  value={testForm.questionPaperUrl}
                  onChange={e => setTestForm({ ...testForm, questionPaperUrl: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Instructions & Rules</label>
                <textarea
                  rows={2}
                  value={testForm.instructions}
                  onChange={e => setTestForm({ ...testForm, instructions: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateTestModal(false)}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-sm font-semibold text-white shadow-md"
                >
                  Create & Schedule Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ATTENDANCE LOG MODAL ── */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground text-base">Assessment Attendance Log</h3>
                <p className="text-xs text-muted-foreground">{selectedTestTitle}</p>
              </div>
              <button onClick={() => setShowAttendanceModal(false)}>
                <XCircle className="size-5 text-muted-foreground" />
              </button>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Dept</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedTestAttendance.map((rec, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold text-foreground">{rec.studentName}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{rec.studentId}</td>
                      <td className="px-4 py-3 text-blue-500 font-semibold">{rec.department}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === "Submitted" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}>{rec.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-500">{rec.score || 0}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowAttendanceModal(false)}
              className="w-full rounded-xl border border-border py-2 text-sm font-semibold hover:bg-accent"
            >
              Close Attendance Log
            </button>
          </div>
        </div>
      )}

      {/* ── SCHEDULE INTERVIEW MODAL ── */}
      {showScheduleModal && selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Schedule Interview Round</h3>
                  <p className="text-xs text-muted-foreground">Drive: {selectedDrive.role}</p>
                </div>
              </div>
              <button onClick={() => setShowScheduleModal(false)}>
                <XCircle className="size-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Candidate Name *</label>
                  <input
                    type="text"
                    placeholder="Aarav Sharma"
                    value={scheduleForm.candidateName}
                    onChange={e => setScheduleForm({ ...scheduleForm, candidateName: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Roll Number</label>
                  <input
                    type="text"
                    placeholder="CS2026001"
                    value={scheduleForm.studentId}
                    onChange={e => setScheduleForm({ ...scheduleForm, studentId: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Interview Round</label>
                  <select
                    value={scheduleForm.round}
                    onChange={e => setScheduleForm({ ...scheduleForm, round: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Technical Round 1">Technical Round 1</option>
                    <option value="Technical Round 2">Technical Round 2</option>
                    <option value="System Design Round">System Design Round</option>
                    <option value="HR Evaluation">HR Evaluation</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Date *</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Time Slot</label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 11:00 AM"
                    value={scheduleForm.timeSlot}
                    onChange={e => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Venue / Room</label>
                  <input
                    type="text"
                    placeholder="Conference Hall A"
                    value={scheduleForm.venue}
                    onChange={e => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Online Meeting Link</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={scheduleForm.onlineMeetingLink}
                  onChange={e => setScheduleForm({ ...scheduleForm, onlineMeetingLink: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Panel Members</label>
                <input
                  type="text"
                  placeholder="Dr. Smith, Tech Lead Rohan"
                  value={scheduleForm.panelists}
                  onChange={e => setScheduleForm({ ...scheduleForm, panelists: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2 text-sm font-semibold text-white shadow-md"
                >
                  Schedule & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EVALUATE INTERVIEW MODAL ── */}
      {showEvalModal && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground">Evaluate & Advance Candidate</h3>
                <p className="text-xs text-muted-foreground">{selectedInterview.candidateName} ({selectedInterview.studentId})</p>
              </div>
              <button onClick={() => setShowEvalModal(false)}>
                <XCircle className="size-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleEvalInterviewSubmit} className="space-y-3.5">
              <div>
                <label className={labelCls}>Attendance Status</label>
                <select
                  value={evalForm.attendance}
                  onChange={e => setEvalForm({ ...evalForm, attendance: e.target.value })}
                  className={inputCls}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Evaluation Result</label>
                <select
                  value={evalForm.result}
                  onChange={e => setEvalForm({ ...evalForm, result: e.target.value })}
                  className={inputCls}
                >
                  <option value="Advance">Advance (Next Round)</option>
                  <option value="Selected">Selected (Final Hire)</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Target Next Round</label>
                <select
                  value={evalForm.nextRound}
                  onChange={e => setEvalForm({ ...evalForm, nextRound: e.target.value })}
                  className={inputCls}
                >
                  <option value="Technical Round 2">Technical Round 2</option>
                  <option value="System Design Round">System Design Round</option>
                  <option value="HR Evaluation">HR Evaluation</option>
                  <option value="Final Offer">Final Offer</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Panel Remarks & Feedback</label>
                <textarea
                  rows={3}
                  value={evalForm.remarks}
                  onChange={e => setEvalForm({ ...evalForm, remarks: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-sm font-semibold text-white shadow-md"
                >
                  Save & Advance Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
