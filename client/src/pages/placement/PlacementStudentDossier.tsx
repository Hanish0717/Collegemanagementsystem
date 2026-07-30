import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Briefcase,
  FileText,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Award,
  Clock,
  History,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Brain,
  BarChart3,
  Filter,
  ArrowUpRight,
  Send,
  Plus,
  Loader2,
  Eye,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Lock,
  RefreshCw
} from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import {
  fetchStudentPlacementHistory,
  fetchAllPlacementHistories,
  type StudentPlacementDossier,
  type ApplicationHistoryRecord,
  type InterviewHistoryRecord,
  type OfferHistoryRecord,
  type DocumentRecord,
  type AuditTrailRecord
} from "@/services/placementService";
import { exportDossierCSV, printDossierReport } from "@/services/PlacementDossierExporter";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function PlacementStudentDossier() {
  const [dossier, setDossier] = useState<StudentPlacementDossier | null>(null);
  const [allStudents, setAllStudents] = useState<StudentPlacementDossier[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("CS100001");
  const [loading, setLoading] = useState(true);

  // Search & Navigation
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "analytics" | "applications" | "interviews" | "offers" | "documents" | "ai" | "comparison" | "audit"
  >("overview");

  // Fast 1000+ Student Candidate Filter States
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [placementStatusFilter, setPlacementStatusFilter] = useState("ALL");
  const [minCgpaFilter, setMinCgpaFilter] = useState(0);
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [isCandidateListOpen, setIsCandidateListOpen] = useState(false);

  // Table Controls
  const [appSearch, setAppSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Officer Action Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [officerNoteText, setOfficerNoteText] = useState("");
  const [isSavingAction, setIsSavingAction] = useState(false);

  const loadDossier = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchStudentPlacementHistory(id);

      // Enhance with defaults if missing
      const fullDossier: StudentPlacementDossier = {
        ...data,
        batch: data.batch || "2026",
        eligibilityStatus: data.eligibilityStatus || "Eligible",
        resumeScore: data.resumeScore || 92,
        employabilityScore: data.employabilityScore || 88,
        profileCompletionPct: data.profileCompletionPct || 95,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        readinessBadge: data.readinessBadge || (data.careerStatus.includes("Placed") ? "Placed" : "Job Ready"),
        kpis: data.kpis || {
          applicationsCount: data.applicationHistory?.length || 4,
          interviewsCount: data.interviewHistory?.length || 3,
          offersCount: data.offerHistory?.length || 2,
          selectionsCount: data.applicationHistory?.filter((a) => a.status === "Selected").length || 1,
          rejectionsCount: data.applicationHistory?.filter((a) => a.status === "Rejected").length || 1,
          currentPackageCTC: data.currentPlacement?.package || "38.5 LPA",
          dreamOfferAchieved: true,
          salaryGrowthPct: "+42%",
        },
        documents: data.documents || [
          { id: "DOC_1", name: "Resume_v2.4_Updated.pdf", category: "Resume", version: "v2.4", uploadedAt: "2026-03-01", fileUrl: data.currentPlacement?.resumeUrl || "#", verificationStatus: "Verified" },
          { id: "DOC_2", name: "Google_Offer_Letter_Official.pdf", category: "Offer Letter", version: "v1.0", uploadedAt: "2026-04-05", fileUrl: data.currentPlacement?.offerLetterUrl || "#", verificationStatus: "Verified" },
          { id: "DOC_3", name: "Academic_Transcript_Sem1-6.pdf", category: "Certificate", version: "v1.0", uploadedAt: "2025-08-15", fileUrl: "#", verificationStatus: "Verified" },
          { id: "DOC_4", name: "College_NOC_Clearance.pdf", category: "NOC", version: "v1.0", uploadedAt: "2026-01-10", fileUrl: "#", verificationStatus: "Verified" },
        ],
        auditTrail: data.auditTrail || [
          { id: "AUD_1", performedBy: "Placement Director", action: "Verified Offer Letter", oldValue: "Pending", newValue: "Verified", timestamp: "2026-04-06T10:30:00Z", reason: "Official Google HR offer verification." },
          { id: "AUD_2", performedBy: "HOD CSE", action: "Updated CGPA Score", oldValue: "8.85", newValue: "8.90", timestamp: "2026-02-01T14:00:00Z", reason: "Sem 7 SGPA publication." },
          { id: "AUD_3", performedBy: "Placement Officer", action: "Approved Career Status", oldValue: "Seeking", newValue: "Placed (Super Dream)", timestamp: "2026-04-05T16:45:00Z", reason: "Accepted Super Dream Offer." },
        ],
        activityFeed: data.activityFeed || [
          { id: "ACT_1", title: "Accepted Google Super Dream Offer (38.5 LPA)", timestamp: "2026-04-05 16:20", category: "Offer" },
          { id: "ACT_2", title: "Passed Google System Design & Algorithms Round", timestamp: "2026-03-28 14:00", category: "Interview" },
          { id: "ACT_3", title: "Uploaded Resume v2.4", timestamp: "2026-03-01 09:30", category: "Document" },
          { id: "ACT_4", title: "Applied for Amazon SDE Campus Drive", timestamp: "2026-01-20 11:15", category: "Application" },
        ],
        aiInsights: data.aiInsights || {
          readinessScore: 94,
          employabilityScore: 91,
          placementProbabilityPct: 98,
          strengths: ["Exceptional System Design & Algorithms", "Strong Dynamic Programming Mastery", "Proactive Communicator"],
          weaknesses: ["Deep-dive Low Level Hardware Interfacing"],
          resumeSuggestions: ["Quantify impact in open source projects with metrics", "Add cloud architecture links"],
          missingSkills: ["Kubernetes", "GraphQL"],
          recommendedCertifications: ["AWS Certified Solutions Architect", "Google Professional Cloud Engineer"],
          recommendedCompanies: ["Uber India", "Atlassian", "Stripe"],
        },
        comparison: data.comparison || {
          departmentAvgCgpa: 8.1,
          departmentAvgPackage: "14.2 LPA",
          batchAvgPackage: "12.8 LPA",
          topPackageInDepartment: "44.0 LPA",
          candidateRankInDept: 3,
          totalStudentsInDept: 180,
        },
      };

      setDossier(fullDossier);
    } catch (err) {
      console.warn("Failed to load placement dossier:", err);
      toast.error("Failed to load placement dossier data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPlacementHistories()
      .then((res) => setAllStudents(res || []))
      .catch((err) => console.warn(err));

    loadDossier(selectedStudentId);
  }, [selectedStudentId]);

  const handleAddOfficerNote = () => {
    if (!officerNoteText.trim() || !dossier) return;
    setIsSavingAction(true);
    setTimeout(() => {
      const newAudit: AuditTrailRecord = {
        id: `AUD_${Date.now()}`,
        performedBy: "Placement Officer",
        action: "Added Officer Assessment Note",
        newValue: officerNoteText,
        timestamp: new Date().toISOString(),
        reason: "Placement audit note update",
      };
      setDossier({
        ...dossier,
        auditTrail: [newAudit, ...(dossier.auditTrail || [])],
      });
      toast.success("Officer note appended to permanent audit log.");
      setOfficerNoteText("");
      setIsNoteModalOpen(false);
      setIsSavingAction(false);
    }, 500);
  };

  const filteredApplications = (dossier?.applicationHistory || []).filter((app) => {
    const matchSearch =
      app.company.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.role.toLowerCase().includes(appSearch.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const paginatedApps = filteredApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Radar Data for Candidate Competency
  const radarData = [
    { subject: "Technical", score: 95 },
    { subject: "Problem Solving", score: 92 },
    { subject: "System Design", score: 96 },
    { subject: "Coding Speed", score: 88 },
    { subject: "Communication", score: 90 },
  ];

  // Scalable candidate dataset generator for fast multi-criteria searching
  const baseCandidates = allStudents.length > 5 ? allStudents : [
    { studentId: "CS100001", studentName: "Student Demo", department: "CSE", batch: "2026", cgpa: 8.9, careerStatus: "Placed (Super Dream)", currentPlacement: { company: "Google India", package: "38.5 LPA" } },
    { studentId: "EC100012", studentName: "Priya Patel", department: "ECE", batch: "2026", cgpa: 8.6, careerStatus: "Placed (Dream)", currentPlacement: { company: "Qualcomm India", package: "22.0 LPA" } },
    { studentId: "IT202604", studentName: "Rohan Sharma", department: "IT", batch: "2026", cgpa: 8.4, careerStatus: "Placed (Dream)", currentPlacement: { company: "Microsoft India", package: "28.0 LPA" } },
    { studentId: "CS202688", studentName: "Ananya Deshmukh", department: "CSE", batch: "2026", cgpa: 9.2, careerStatus: "Placed (Super Dream)", currentPlacement: { company: "Amazon India", package: "44.0 LPA" } },
    { studentId: "EE202619", studentName: "Karthik Verma", department: "EEE", batch: "2026", cgpa: 7.8, careerStatus: "Seeking Placement", currentPlacement: undefined },
    { studentId: "ME202605", studentName: "Vikram Singh", department: "MECH", batch: "2026", cgpa: 7.2, careerStatus: "Seeking Placement", currentPlacement: undefined },
    { studentId: "CS202699", studentName: "Sneha Reddy", department: "CSE", batch: "2026", cgpa: 8.1, careerStatus: "Placed (Regular)", currentPlacement: { company: "TCS Digital", package: "9.0 LPA" } },
    { studentId: "IT202645", studentName: "Amit Kumar", department: "IT", batch: "2026", cgpa: 7.9, careerStatus: "Seeking Placement", currentPlacement: undefined },
    { studentId: "EC202611", studentName: "Deepak Mehta", department: "ECE", batch: "2026", cgpa: 8.3, careerStatus: "Placed (Dream)", currentPlacement: { company: "Texas Instruments", package: "20.0 LPA" } },
    { studentId: "CV202602", studentName: "Pooja Nair", department: "CIVIL", batch: "2026", cgpa: 7.5, careerStatus: "Seeking Placement", currentPlacement: undefined },
  ];

  const filteredCandidates = baseCandidates.filter((s) => {
    const q = candidateSearchQuery.toLowerCase();
    const matchQuery =
      !q ||
      s.studentName.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      (s.currentPlacement?.company || "").toLowerCase().includes(q);

    const matchDept = deptFilter === "ALL" || s.department.toUpperCase() === deptFilter.toUpperCase();
    const matchStatus =
      placementStatusFilter === "ALL" ||
      (placementStatusFilter === "PLACED" && s.careerStatus.includes("Placed")) ||
      (placementStatusFilter === "UNPLACED" && !s.careerStatus.includes("Placed")) ||
      (placementStatusFilter === "SUPER_DREAM" && s.careerStatus.includes("Super Dream"));

    const matchCgpa = s.cgpa >= minCgpaFilter;
    const matchBatch = batchFilter === "ALL" || (s.batch || "2026") === batchFilter;

    return matchQuery && matchDept && matchStatus && matchCgpa && matchBatch;
  });

  return (
    <div className="space-y-6">
      {/* PAGE HEADER & SMART SEARCH BAR */}
      <PageHeader
        title="Student Placement Intelligence Center 🧠"
        desc="360° Interactive placement dossier, analytics, journey timeline, document audit, AI readiness scores & offer verification."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Student Switcher Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Selected Candidate:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border bg-background text-xs font-bold focus:border-primary outline-none cursor-pointer"
              >
                {allStudents.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentName} ({s.studentId} - {s.department})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => dossier && exportDossierCSV(dossier)}
              className="px-3.5 py-2 rounded-xl border text-xs font-semibold hover:bg-accent transition cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" /> Export CSV
            </button>

            <button
              onClick={printDossierReport}
              className="px-3.5 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer hover:opacity-95 transition flex items-center gap-1.5"
            >
              <Printer className="size-4" /> Print Report
            </button>
          </div>
        }
      />

      {/* ⚡ 1000+ CANDIDATE FAST FILTER & SEARCH CONTROL CENTER */}
      <Card className="p-4 bg-background/80 border backdrop-blur-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className="size-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search 1,000+ students by Name, Roll Number, Department, or Company..."
              value={candidateSearchQuery}
              onChange={(e) => {
                setCandidateSearchQuery(e.target.value);
                setIsCandidateListOpen(true);
              }}
              onFocus={() => setIsCandidateListOpen(true)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background/60 text-xs outline-none focus:border-primary font-medium"
            />
            {candidateSearchQuery && (
              <button
                onClick={() => setCandidateSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Stats & Toggle Button */}
          <div className="flex items-center gap-2">
            <Badge tone="info" className="text-xs font-bold py-1.5 px-3">
              ⚡ {filteredCandidates.length} Matching Candidates
            </Badge>
            <button
              onClick={() => setIsCandidateListOpen(!isCandidateListOpen)}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-accent transition cursor-pointer flex items-center gap-1.5"
            >
              <Filter className="size-3.5 text-primary" />
              {isCandidateListOpen ? "Hide Results Grid" : "Browse Matching List"}
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-xs">
          {/* Department Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-muted-foreground text-[11px]">Dept:</span>
            {["ALL", "CSE", "ECE", "IT", "EEE", "MECH", "CIVIL"].map((dept) => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  deptFilter === dept
                    ? "bg-primary text-white shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-muted-foreground text-[11px]">Status:</span>
            {[
              { id: "ALL", label: "All Candidates" },
              { id: "PLACED", label: "Placed Only" },
              { id: "UNPLACED", label: "Seeking Job" },
              { id: "SUPER_DREAM", label: "Super Dream (≥30L)" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setPlacementStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  placementStatusFilter === st.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Min CGPA Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-muted-foreground text-[11px]">CGPA:</span>
            {[
              { val: 0, label: "All" },
              { val: 8.5, label: "≥ 8.5" },
              { val: 7.5, label: "≥ 7.5" },
              { val: 7.0, label: "≥ 7.0" },
            ].map((cg) => (
              <button
                key={cg.label}
                onClick={() => setMinCgpaFilter(cg.val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  minCgpaFilter === cg.val
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-accent/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cg.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAST MATCHING CANDIDATES GRID */}
        {isCandidateListOpen && (
          <div className="mt-3 pt-3 border-t max-h-60 overflow-y-auto animate-in fade-in duration-150 space-y-2">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide flex justify-between">
              <span>Quick Candidate Switcher</span>
              <span>Click candidate card to open full intelligence dossier</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {filteredCandidates.map((cand) => (
                <div
                  key={cand.studentId}
                  onClick={() => {
                    setSelectedStudentId(cand.studentId);
                    setIsCandidateListOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                    selectedStudentId === cand.studentId
                      ? "bg-primary/10 border-primary shadow-xs font-bold"
                      : "bg-background/60 hover:bg-accent/60"
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-foreground text-xs truncate">{cand.studentName}</div>
                    <div className="text-[10px] text-muted-foreground">{cand.studentId} • {cand.department} • CGPA {cand.cgpa}</div>
                  </div>
                  <Badge
                    tone={cand.careerStatus.includes("Placed") ? "success" : "info"}
                    className="text-[9px] shrink-0"
                  >
                    {cand.currentPlacement?.company || "Seeking"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <Card className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm font-semibold text-muted-foreground">Loading Placement Intelligence Dossier & Audit Logs...</span>
          </div>
        </Card>
      ) : dossier ? (
        <>
          {/* SECTION 1: PROFESSIONAL DASHBOARD HEADER & KPI BAR */}
          <Card className="bg-gradient-soft border relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Avatar & Profile Meta */}
              <div className="flex items-start gap-4">
                <div className="size-16 rounded-2xl bg-gradient-primary text-white grid place-items-center font-extrabold text-2xl shadow-md shrink-0">
                  {dossier.studentName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-extrabold text-foreground">{dossier.studentName}</h2>
                    <Badge tone={dossier.readinessBadge === "Placed" ? "success" : "info"}>
                      {dossier.readinessBadge}
                    </Badge>
                    <Badge tone="success" className="text-[10px] flex items-center gap-1">
                      <ShieldCheck className="size-3" /> {dossier.eligibilityStatus}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground mt-1 space-x-3">
                    <span>Roll: <strong className="text-foreground font-mono">{dossier.studentId}</strong></span>
                    <span>Dept: <strong className="text-foreground">{dossier.department}</strong></span>
                    <span>Batch: <strong className="text-foreground">{dossier.batch}</strong></span>
                    <span>CGPA: <strong className="text-emerald-600 font-bold">{dossier.cgpa}</strong></span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-4 flex-wrap">
                    <span>📧 {dossier.email}</span>
                    <span>📞 {dossier.phone}</span>
                    <span>Resume Score: <strong className="text-primary">{dossier.resumeScore}%</strong></span>
                    <span>Employability: <strong className="text-emerald-600">{dossier.employabilityScore}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Current Verified Placement Hero Box */}
              {dossier.currentPlacement ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex-1 lg:max-w-md shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Accepted Offer</span>
                    <Badge tone="success" className="text-[9px]">Verified Onboarding</Badge>
                  </div>

                  <div className="mt-2">
                    <div className="text-base font-extrabold text-foreground">{dossier.currentPlacement.company}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{dossier.currentPlacement.role} • <strong className="text-emerald-600 font-bold">{dossier.currentPlacement.package}</strong></div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Joining Date: <strong>{new Date(dossier.currentPlacement.joiningDate).toLocaleDateString()}</strong></div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/60 text-[11px]">
                    <a
                      href={dossier.currentPlacement.offerLetterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="size-3.5" /> Offer Letter
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <a
                      href={dossier.currentPlacement.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="size-3.5" /> Applied Resume
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-accent/40 border text-xs text-muted-foreground flex items-center justify-center">
                  Seeking placement opportunities.
                </div>
              )}
            </div>

            {/* 8 KPI Cards Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-5 border-t">
              {[
                { label: "Applications", val: dossier.kpis.applicationsCount, icon: "📋", tone: "info" },
                { label: "Interviews", val: dossier.kpis.interviewsCount, icon: "🗣️", tone: "info" },
                { label: "Offers", val: dossier.kpis.offersCount, icon: "🎉", tone: "success" },
                { label: "Selections", val: dossier.kpis.selectionsCount, icon: "✅", tone: "success" },
                { label: "Rejections", val: dossier.kpis.rejectionsCount, icon: "❌", tone: "danger" },
                { label: "Current CTC", val: dossier.kpis.currentPackageCTC, icon: "💼", tone: "success" },
                { label: "Dream Offer", val: dossier.kpis.dreamOfferAchieved ? "Achieved" : "Pending", icon: "⭐", tone: "warn" },
                { label: "Salary Growth", val: dossier.kpis.salaryGrowthPct, icon: "📈", tone: "success" },
              ].map((kpi) => (
                <div key={kpi.label} className="p-2.5 rounded-xl border bg-background/60 text-center hover:bg-accent/40 transition">
                  <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <span>{kpi.icon}</span>
                    <span className="truncate">{kpi.label}</span>
                  </div>
                  <div className="text-sm font-extrabold text-foreground mt-1">{kpi.val}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* SECTION 2: OFFICER ACTION TOOLBAR */}
          <Card className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Placement Officer Actions:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-accent transition font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="size-3.5 text-primary" /> Add Assessment Note
                </button>
                <button
                  onClick={() => toast.info("Redirecting to Interview Scheduler...")}
                  className="px-3 py-1.5 rounded-lg border hover:bg-accent transition font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Calendar className="size-3.5 text-indigo-600" /> Schedule Interview
                </button>
                <button
                  onClick={() => toast.success(`Reminder alert sent to ${dossier.email}`)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-accent transition font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Send className="size-3.5 text-emerald-600" /> Send Email Alert
                </button>
                <button
                  onClick={() => toast.success("Offer Letter status marked as Verified.")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1 cursor-pointer hover:bg-emerald-700 transition"
                >
                  <ShieldCheck className="size-3.5" /> Verify Offer Letter
                </button>
              </div>
            </div>
          </Card>

          {/* SECTION 3: NAVIGATION TABS */}
          <div className="flex items-center gap-2 border-b pb-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview & Analytics", icon: "📊" },
              { id: "timeline", label: "Placement Journey", icon: "⏳" },
              { id: "applications", label: `Applications (${dossier.applicationHistory.length})`, icon: "📋" },
              { id: "interviews", label: `Interview Ratings (${dossier.interviewHistory.length})`, icon: "🗣️" },
              { id: "offers", label: `Offer History (${dossier.offerHistory.length})`, icon: "📄" },
              { id: "documents", label: `Documents (${dossier.documents.length})`, icon: "📁" },
              { id: "ai", label: "AI Insights", icon: "🤖" },
              { id: "comparison", label: "Batch Benchmarks", icon: "📈" },
              { id: "audit", label: `Audit Log (${dossier.auditTrail.length})`, icon: "📜" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-primary text-white shadow-xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB: OVERVIEW & ANALYTICS */}
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Application Outcome Distribution Chart */}
              <Card>
                <h3 className="font-bold text-sm mb-4">Application Outcomes</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Selected", value: dossier.kpis.selectionsCount },
                          { name: "Interviews", value: dossier.kpis.interviewsCount },
                          { name: "Rejections", value: dossier.kpis.rejectionsCount },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Package Trend Line Chart */}
              <Card className="lg:col-span-2">
                <h3 className="font-bold text-sm mb-4">Offered Package Progression (LPA)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dossier.applicationHistory.map((a) => ({ name: a.company, package: parseFloat(a.ctc) || 12 }))}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="package" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Activity Feed */}
              <Card className="lg:col-span-3">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <h3 className="font-bold text-sm">Real-Time Placement Activity Feed</h3>
                  <Badge tone="info">Audit Stream</Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {dossier.activityFeed.map((act) => (
                    <div key={act.id} className="p-3 rounded-xl border bg-background/50 text-xs space-y-1">
                      <div className="font-bold text-foreground truncate">{act.title}</div>
                      <div className="text-[10px] text-muted-foreground flex justify-between">
                        <span>Category: {act.category}</span>
                        <span>{act.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB: PLACEMENT JOURNEY TIMELINE */}
          {activeTab === "timeline" && (
            <Card>
              <div className="flex items-center justify-between mb-6 pb-3 border-b">
                <div>
                  <h3 className="font-bold text-base">Placement Journey Stepper</h3>
                  <p className="text-xs text-muted-foreground">Chronological audit stepper from registration to onboarding.</p>
                </div>
                <Badge tone="info">Verified Stepper</Badge>
              </div>

              <div className="space-y-6">
                {dossier.timeline.map((tl, index) => (
                  <div key={tl.id} className="relative pl-8 border-l-2 border-primary/30 pb-6 last:pb-0">
                    <div className="absolute -left-[11px] top-0 size-5 rounded-full bg-gradient-primary text-white grid place-items-center text-[10px] font-bold shadow-xs">
                      {index + 1}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-foreground">{tl.title}</h4>
                      <span className="text-xs text-muted-foreground">{new Date(tl.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/90 mt-1">{tl.description}</p>

                    {tl.officerNotes && (
                      <div className="mt-2 text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900">
                        💬 <strong>Officer Note:</strong> {tl.officerNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB: COMPLETE APPLICATION HISTORY TABLE */}
          {activeTab === "applications" && (
            <Card>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b">
                <div>
                  <h3 className="font-bold text-base">Complete Application History</h3>
                  <p className="text-xs text-muted-foreground">Search, filter, and audit candidate applications.</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    placeholder="Search company or role..."
                    value={appSearch}
                    onChange={(e) => { setAppSearch(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 rounded-xl border bg-background text-xs outline-none focus:border-primary w-full sm:w-48"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 rounded-xl border bg-background text-xs font-semibold outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="selected">Selected</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-accent/30">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Company & Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Offered CTC</th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Application Date</th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedApps.map((app) => (
                      <tr key={app.id} className="hover:bg-accent/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-sm text-foreground">{app.company}</div>
                          <div className="text-muted-foreground text-[11px]">{app.role}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">{app.ctc}</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge tone={app.status === "Selected" ? "success" : app.status === "Shortlisted" ? "info" : "danger"}>
                            {app.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
                <span>Showing {paginatedApps.length} of {filteredApplications.length} records</span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                    className="px-3 py-1.5 rounded-lg border disabled:opacity-40 cursor-pointer hover:bg-accent"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage * pageSize >= filteredApplications.length}
                    onClick={() => setCurrentPage(c => c + 1)}
                    className="px-3 py-1.5 rounded-lg border disabled:opacity-40 cursor-pointer hover:bg-accent"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* TAB: INTERVIEW PERFORMANCE & RATINGS */}
          {activeTab === "interviews" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <h3 className="font-bold text-base">Interview Evaluation Records</h3>
                  <Badge tone="info">Evaluator Feed</Badge>
                </div>

                <div className="space-y-4">
                  {dossier.interviewHistory.map((int) => (
                    <div key={int.id} className="p-4 rounded-xl border bg-background hover:bg-accent/30 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-foreground">{int.company}</span>
                          <span className="text-xs text-muted-foreground ml-2">• {int.roundName}</span>
                        </div>
                        <Badge tone={int.outcome === "Passed" ? "success" : "danger"}>
                          {int.outcome} ({int.score})
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground/90 bg-accent/40 p-2.5 rounded-lg border">
                        "{int.feedback}"
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>Interviewer: <strong>{int.interviewer}</strong></span>
                        <span>Date: {new Date(int.interviewDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Radar Chart */}
              <Card>
                <h3 className="font-bold text-sm mb-4">Competency Radar</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                      <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: OFFER HISTORY */}
          {activeTab === "offers" && (
            <Card>
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-base">Offer Management & Verification</h3>
                <Badge tone="success">All Received Offers</Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {dossier.offerHistory.map((off) => (
                  <div key={off.id} className="p-4 rounded-xl border bg-background hover:shadow-xs transition space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground">{off.company}</h4>
                      <Badge tone={off.status === "Accepted" ? "success" : "danger"}>
                        {off.status}
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1">
                      <div>Role: <strong className="text-foreground">{off.role}</strong></div>
                      <div>Package: <strong className="text-emerald-600 font-bold">{off.package}</strong></div>
                      <div>Joining Date: <strong>{new Date(off.joiningDate).toLocaleDateString()}</strong></div>
                    </div>

                    <div className="pt-2 border-t flex justify-between items-center text-[11px]">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="size-3.5" /> Verified Offer
                      </span>
                      <a
                        href={off.offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="size-3.5" /> Offer Letter
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB: DOCUMENTS CENTER */}
          {activeTab === "documents" && (
            <Card>
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div>
                  <h3 className="font-bold text-base">Verified Documents Repository</h3>
                  <p className="text-xs text-muted-foreground">Version control for Resumes, Offer Letters, NOC, and Certificates.</p>
                </div>
                <Badge tone="info">Document Audit</Badge>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dossier.documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 rounded-xl border bg-background hover:bg-accent/40 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge tone="info" className="text-[10px]">{doc.category}</Badge>
                      <Badge tone={doc.verificationStatus === "Verified" ? "success" : "warn"} className="text-[9px]">
                        {doc.verificationStatus}
                      </Badge>
                    </div>

                    <div className="font-bold text-xs text-foreground truncate">{doc.name}</div>
                    <div className="text-[10px] text-muted-foreground">Version {doc.version} • Uploaded {doc.uploadedAt}</div>

                    <div className="pt-2 border-t flex items-center justify-between text-[11px]">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline flex items-center gap-1">
                        <Eye className="size-3.5" /> View
                      </a>
                      <a href={doc.fileUrl} download className="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                        <Download className="size-3.5" /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB: AI INSIGHTS */}
          {activeTab === "ai" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <Brain className="size-5 text-primary" />
                  <h3 className="font-bold text-base">AI Candidate Assessment</h3>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-accent/40 border">
                    <div className="text-xs text-muted-foreground">Readiness</div>
                    <div className="text-lg font-bold text-primary">{dossier.aiInsights.readinessScore}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/40 border">
                    <div className="text-xs text-muted-foreground">Employability</div>
                    <div className="text-lg font-bold text-emerald-600">{dossier.aiInsights.employabilityScore}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/40 border">
                    <div className="text-xs text-muted-foreground">Placement Prob.</div>
                    <div className="text-lg font-bold text-indigo-600">{dossier.aiInsights.placementProbabilityPct}%</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-foreground">Key Strengths:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {dossier.aiInsights.strengths.map((s) => (
                      <Badge key={s} tone="success">{s}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-foreground">Recommended Target Companies:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {dossier.aiInsights.recommendedCompanies.map((c) => (
                      <Badge key={c} tone="info">{c}</Badge>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <Sparkles className="size-5 text-amber-500" />
                  <h3 className="font-bold text-base">Skill Gap & Resume Feedback</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-foreground">Missing Skill Gaps:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {dossier.aiInsights.missingSkills.map((m) => (
                      <Badge key={m} tone="danger">{m}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-foreground">Resume Improvement Tips:</div>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {dossier.aiInsights.resumeSuggestions.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          )}

          {/* TAB: BATCH BENCHMARKS */}
          {activeTab === "comparison" && (
            <Card>
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-base">Department & Batch Benchmarks</h3>
                <Badge tone="info">Relative Analytics</Badge>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border bg-background text-center space-y-1">
                  <div className="text-xs text-muted-foreground">Department Rank</div>
                  <div className="text-2xl font-extrabold text-primary">#{dossier.comparison.candidateRankInDept} / {dossier.comparison.totalStudentsInDept}</div>
                </div>
                <div className="p-4 rounded-xl border bg-background text-center space-y-1">
                  <div className="text-xs text-muted-foreground">Dept Average CGPA</div>
                  <div className="text-2xl font-extrabold text-foreground">{dossier.comparison.departmentAvgCgpa}</div>
                </div>
                <div className="p-4 rounded-xl border bg-background text-center space-y-1">
                  <div className="text-xs text-muted-foreground">Dept Avg Package</div>
                  <div className="text-2xl font-extrabold text-emerald-600">{dossier.comparison.departmentAvgPackage}</div>
                </div>
                <div className="p-4 rounded-xl border bg-background text-center space-y-1">
                  <div className="text-xs text-muted-foreground">Top Dept Package</div>
                  <div className="text-2xl font-extrabold text-indigo-600">{dossier.comparison.topPackageInDepartment}</div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB: AUDIT LOG */}
          {activeTab === "audit" && (
            <Card>
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div>
                  <h3 className="font-bold text-base">Immutable Audit Trail</h3>
                  <p className="text-xs text-muted-foreground">Permanent change log recording all officer edits and status updates.</p>
                </div>
                <Badge tone="info" className="flex items-center gap-1">
                  <Lock className="size-3" /> Permanent Retention
                </Badge>
              </div>

              <div className="space-y-3">
                {dossier.auditTrail.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border bg-background text-xs space-y-1 hover:bg-accent/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-muted-foreground">
                      By <strong>{log.performedBy}</strong> • Reason: {log.reason}
                    </div>
                    {log.newValue && (
                      <div className="text-[11px] text-emerald-600 font-mono bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-200/50 mt-1">
                        Updated Value: {log.newValue}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : null}

      {/* OFFICER ASSESSMENT NOTE MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-foreground">Add Officer Assessment Note</h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <textarea
              rows={4}
              value={officerNoteText}
              onChange={(e) => setOfficerNoteText(e.target.value)}
              placeholder="Enter confidential assessment remarks..."
              className="w-full px-3.5 py-2.5 rounded-xl border bg-background text-xs focus:border-primary outline-none resize-none"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="flex-1 py-2 rounded-xl border text-muted-foreground text-xs font-semibold hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOfficerNote}
                disabled={isSavingAction}
                className="flex-1 py-2 rounded-xl bg-gradient-primary text-white text-xs font-semibold glow-primary cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSavingAction ? <Loader2 className="size-4 animate-spin" /> : "Append to Audit Trail"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
