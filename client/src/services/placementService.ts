import api from "../lib/api";

export interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  hrContact: string;
  email: string;
  phone: string;
  package: string;
  hiringStatus: string;
  previousYearHires: number;
}

export interface DriveItem {
  id: string;
  company: string;
  role: string;
  date: string;
  venue: string;
  applicationDeadline: string;
  status: string;
  studentCount: number;
  rounds: number;
  eligibilityBatch?: string;
  eligibilityDepartments?: string[];
  eligibilityMinCgpa?: number;
  eligibilityMaxBacklogs?: number;
  eligibilityGender?: string;
  eligibilitySkills?: string[];
  eligibilityGraduationYear?: number;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string;
  type: "Drive" | "Deadline" | "Interview";
  company: string;
  venue: string;
  details: string;
}

export interface PlacementNotification {
  id: string;
  title: string;
  time: string;
  type: string;
  unread: boolean;
}

export interface PlacementDashboardData {
  stats: Array<{ label: string; value: string; change: string; icon: string }>;
  drives: DriveItem[];
  companies: CompanyItem[];
  placementTrendData: Array<{ month: string; placed: number; applied: number; shortlisted: number; offers: number }>;
  departmentPlacementData: Array<{ name: string; value: number; color: string }>;
  packageAnalyticsData: Array<{ range: string; count: number; color: string }>;
  applications: Array<{ id: string; studentName: string; studentId: string; company: string; role: string; appliedDate: string; status: string; score: number; round: number }>;
  offers: Array<{ id: string; studentName: string; company: string; role: string; package: string; joiningDate: string; status: string; offerDate: string }>;
  interviews: Array<{ id: string; studentName: string; company: string; round: number; date: string; time: string; mode: string; venue: string; panelists: string[]; status: string }>;
  placementNotifications: PlacementNotification[];
}

export function validateCompanyPayload(payload: Partial<CompanyItem>): string | null {
  if (!payload.name || !payload.name.trim()) return "Company name is required.";
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return "Please enter a valid email address.";
  return null;
}

export function validateDrivePayload(payload: Partial<DriveItem>): string | null {
  if (!payload.company || !payload.company.trim()) return "Company name is required.";
  if (!payload.role || !payload.role.trim()) return "Job role is required.";
  return null;
}

export async function fetchPlacementData(): Promise<PlacementDashboardData> {
  const { data } = await api.get<{ success: boolean; data: PlacementDashboardData }>(
    "/api/placement/dashboard",
  );
  return data.data;
}

export async function fetchPlacementCalendar(): Promise<CalendarEventItem[]> {
  const { data } = await api.get<{ success: boolean; data: CalendarEventItem[] }>(
    "/api/placement/calendar"
  );
  return data.data;
}

export async function fetchPlacementNotifications(): Promise<PlacementNotification[]> {
  const { data } = await api.get<{ success: boolean; data: PlacementNotification[] }>(
    "/api/placement/notifications"
  );
  return data.data;
}

export async function markPlacementNotificationRead(id: string): Promise<void> {
  await api.put(`/api/placement/notifications/${id}/read`);
}

export async function createCompany(payload: Omit<CompanyItem, "id">): Promise<CompanyItem> {
  const err = validateCompanyPayload(payload);
  if (err) throw new Error(err);

  const { data } = await api.post<{ success: boolean; data: CompanyItem }>(
    "/api/placement/companies",
    payload,
  );
  return data.data;
}

export async function updateCompany(id: string, payload: Partial<CompanyItem>): Promise<CompanyItem> {
  const { data } = await api.put<{ success: boolean; data: CompanyItem }>(
    `/api/placement/companies/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteCompany(id: string): Promise<void> {
  await api.delete(`/api/placement/companies/${id}`);
}

export async function createDrive(payload: Omit<DriveItem, "id" | "studentCount" | "rounds">): Promise<DriveItem> {
  const err = validateDrivePayload(payload);
  if (err) throw new Error(err);

  const { data } = await api.post<{ success: boolean; data: DriveItem }>(
    "/api/placement/drives",
    payload,
  );
  return data.data;
}

export async function updateDrive(id: string, payload: Partial<DriveItem>): Promise<DriveItem> {
  const { data } = await api.put<{ success: boolean; data: DriveItem }>(
    `/api/placement/drives/${id}`,
    payload,
  );
  return data.data;
}

export async function createApplication(payload: any): Promise<any> {
  const { data } = await api.post<{ success: boolean; data: any }>(
    "/api/placement/applications",
    payload,
  );
  return data.data;
}

export async function updateApplication(id: string, payload: any): Promise<any> {
  const { data } = await api.put<{ success: boolean; data: any }>(
    `/api/placement/applications/${id}`,
    payload,
  );
  return data.data;
}

export async function createInterview(payload: any): Promise<any> {
  const { data } = await api.post<{ success: boolean; data: any }>(
    "/api/placement/interviews",
    payload,
  );
  return data.data;
}

export async function updateInterview(id: string, payload: any): Promise<any> {
  const { data } = await api.put<{ success: boolean; data: any }>(
    `/api/placement/interviews/${id}`,
    payload,
  );
  return data.data;
}

export async function fetchTrainingPrograms(): Promise<any[]> {
  const { data } = await api.get<{ success: boolean; data: any[] }>(
    "/api/placement/training"
  );
  return data.data;
}

export async function createTrainingProgram(payload: any): Promise<any> {
  const { data } = await api.post<{ success: boolean; data: any }>(
    "/api/placement/training",
    payload
  );
  return data.data;
}

export async function updateTrainingProgram(id: string, payload: any): Promise<any> {
  const { data } = await api.put<{ success: boolean; data: any }>(
    `/api/placement/training/${id}`,
    payload
  );
  return data.data;
}

export interface StudentApplicationItem {
  id: string;
  driveId: string;
  company: string;
  role: string;
  driveDate: string;
  deadline: string;
  isDeadlinePassed: boolean;
  studentId: string;
  studentName: string;
  appliedDate: string;
  status: "Draft" | "Submitted" | "Verified" | "Rejected" | "Withdrawn" | string;
  score: number;
  round: number;
  resumeUrl?: string;
  coverNote?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export async function fetchStudentApplications(studentId?: string): Promise<StudentApplicationItem[]> {
  const { data } = await api.get<{ success: boolean; data: StudentApplicationItem[] }>(
    `/api/placement/student-applications${studentId ? `?studentId=${studentId}` : ""}`
  );
  return data.data;
}

export async function withdrawStudentApplication(driveId: string, studentId: string): Promise<any> {
  const { data } = await api.put<{ success: boolean; data: any }>(
    "/api/placement/student-applications/withdraw",
    { driveId, studentId }
  );
  return data.data;
}

export function exportApplicationsToCsv(applications: any[], fileName = "placement_applications.csv") {
  if (!applications || applications.length === 0) return;

  const headers = ["Student Name", "Student ID", "Company", "Role", "Applied Date", "Status", "Score (%)", "Round"];
  const rows = applications.map((app) => [
    `"${app.studentName || ""}"`,
    `"${app.studentId || ""}"`,
    `"${app.company || ""}"`,
    `"${app.role || ""}"`,
    `"${app.appliedDate || ""}"`,
    `"${app.status || ""}"`,
    `"${app.score || 0}"`,
    `"${app.round || 1}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface StudentProfile {
  studentId: string;
  full_name: string;
  department: string;
  cgpa: number;
  backlogs: number;
  batch: string;
  gender: string;
  graduationYear: number;
  skills: string[];
}

export function checkStudentDriveEligibility(
  student: Partial<StudentProfile>,
  drive: DriveItem
): { isEligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  const batch = drive.eligibilityBatch || "All";
  const depts = drive.eligibilityDepartments || ["CSE", "ECE", "IT", "EEE", "MECH", "CIVIL"];
  const minCgpa = drive.eligibilityMinCgpa !== undefined ? Number(drive.eligibilityMinCgpa) : 7.0;
  const maxBacklogs = drive.eligibilityMaxBacklogs !== undefined ? Number(drive.eligibilityMaxBacklogs) : 0;
  const gender = drive.eligibilityGender || "All";
  const skills = drive.eligibilitySkills || [];
  const graduationYear = drive.eligibilityGraduationYear || 2026;

  const stuBatch = student.batch || "2026";
  const stuDept = student.department || "CSE";
  const stuCgpa = student.cgpa !== undefined ? Number(student.cgpa) : 8.0;
  const stuBacklogs = student.backlogs !== undefined ? Number(student.backlogs) : 0;
  const stuGender = student.gender || "Male";
  const stuYear = student.graduationYear || 2026;
  const stuSkills = (student.skills || ["python", "sql", "react"]).map((s) => String(s).toLowerCase());

  if (batch && batch !== "All" && stuBatch !== batch) {
    reasons.push(`Batch ${batch} required (Your Batch: ${stuBatch})`);
  }

  if (graduationYear && stuYear !== graduationYear) {
    reasons.push(`Graduation Year ${graduationYear} required (Your Year: ${stuYear})`);
  }

  if (depts && Array.isArray(depts) && depts.length > 0 && !depts.includes("All")) {
    if (!depts.some((d) => String(d).trim().toLowerCase() === String(stuDept).trim().toLowerCase())) {
      reasons.push(`Branch ${depts.join(", ")} required (Your Branch: ${stuDept})`);
    }
  }

  if (minCgpa > 0 && stuCgpa < minCgpa) {
    reasons.push(`Min CGPA ${minCgpa} required (Your CGPA: ${stuCgpa.toFixed(2)})`);
  }

  if (maxBacklogs < 100 && stuBacklogs > maxBacklogs) {
    reasons.push(`Active Backlogs must be <= ${maxBacklogs} (Your Active Backlogs: ${stuBacklogs})`);
  }

  if (gender && gender !== "All" && stuGender.toLowerCase() !== gender.toLowerCase()) {
    reasons.push(`Gender requirement: ${gender} (Your Gender: ${stuGender})`);
  }

  if (skills && Array.isArray(skills) && skills.length > 0) {
    const missing = skills.filter((reqSkill) => !stuSkills.includes(String(reqSkill).toLowerCase()));
    if (missing.length > 0) {
      reasons.push(`Required Skills missing: ${missing.join(", ")}`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
}

export interface NotificationHistoryItem {
  id: string;
  company: string;
  role: string;
  title: string;
  channels: string[];
  eligible_count: number;
  total_students: number;
  created_at: string;
}

export async function fetchNotificationHistory(): Promise<NotificationHistoryItem[]> {
  const { data } = await api.get<{ success: boolean; data: NotificationHistoryItem[] }>(
    "/api/placement/communication/history"
  );
  return data.data;
}

export interface DepartmentAnalyticsItem {
  department: string;
  totalStudents: number;
  placed: number;
  placementPct: number;
  avgPackage: number;
  highestPackage: number;
}

export interface CompanyAnalyticsItem {
  company: string;
  category: string;
  offers: number;
  highestPackage: number;
  avgPackage: number;
}

export interface PackageDistributionItem {
  range: string;
  count: number;
  color: string;
}

export interface MonthlyTrendItem {
  month: string;
  placed: number;
  offers: number;
  avgPackage: number;
}

export interface BatchComparisonItem {
  batch: string;
  totalStudents: number;
  campusPlaced: number;
  placementPct: number;
  avgPackage: number;
  highestPackage: number;
}

export interface BatchAnalyticsData {
  batchYear: string;
  totalStudents: number;
  placementTarget: number;
  activePlacementTarget: number;
  campusPlaced: number;
  alumniPlacement: number;
  offCampusPlacement: number;
  seekingEmployment: number;
  higherStudies: number;
  entrepreneurship: number;
  governmentExams: number;
  medicalLeave: number;
  remainingStudents: number;
  placementPercentage: number;
  highestPackage: number;
  averagePackage: number;
  medianPackage: number;
  lowestPackage: number;
  companiesVisited: number;
  totalOffers: number;
  dreamOffers: number;
  superDreamOffers: number;
  departmentWise: DepartmentAnalyticsItem[];
  companyWise: CompanyAnalyticsItem[];
  packageDistribution: PackageDistributionItem[];
  monthlyTrend: MonthlyTrendItem[];
  batchComparison: BatchComparisonItem[];
}

export async function fetchBatchAnalytics(batch: string = "2026"): Promise<BatchAnalyticsData> {
  const { data } = await api.get<{ success: boolean; data: BatchAnalyticsData }>(
    `/api/placement/analytics/batch?batch=${batch}`
  );
  return data.data;
}

export function exportAnalyticsToExcel(data: BatchAnalyticsData, fileName: string = "batch_analytics.csv") {
  const rows: string[] = [
    `"Metric","Value"`,
    `"Batch Year","${data.batchYear}"`,
    `"Total Students","${data.totalStudents}"`,
    `"Placement Target","${data.placementTarget}"`,
    `"Active Placement Target","${data.activePlacementTarget}"`,
    `"Campus Placed","${data.campusPlaced}"`,
    `"Alumni Placement","${data.alumniPlacement}"`,
    `"Off Campus Placement","${data.offCampusPlacement}"`,
    `"Seeking Employment","${data.seekingEmployment}"`,
    `"Higher Studies","${data.higherStudies}"`,
    `"Entrepreneurship","${data.entrepreneurship}"`,
    `"Government Exams","${data.governmentExams}"`,
    `"Medical Leave","${data.medicalLeave}"`,
    `"Remaining Students","${data.remainingStudents}"`,
    `"Placement %","${data.placementPercentage}%"`,
    `"Highest Package","${data.highestPackage} LPA"`,
    `"Average Package","${data.averagePackage} LPA"`,
    `"Median Package","${data.medianPackage} LPA"`,
    `"Lowest Package","${data.lowestPackage} LPA"`,
    `"Companies Visited","${data.companiesVisited}"`,
    `"Total Offers","${data.totalOffers}"`,
    `"Dream Offers (10-20 LPA)","${data.dreamOffers}"`,
    `"Super Dream Offers (>20 LPA)","${data.superDreamOffers}"`,
    "",
    `"Department","Total Students","Placed","Placement %","Avg Package","Highest Package"`,
    ...data.departmentWise.map(d => `"${d.department}","${d.totalStudents}","${d.placed}","${d.placementPct}%","${d.avgPackage} LPA","${d.highestPackage} LPA"`),
    "",
    `"Company","Category","Offers","Highest Package","Avg Package"`,
    ...data.companyWise.map(c => `"${c.company}","${c.category}","${c.offers}","${c.highestPackage} LPA","${c.avgPackage} LPA"`)
  ];

  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAnalyticsToPdf(data: BatchAnalyticsData, fileName: string = "batch_analytics.pdf") {
  const content = `========================================================================
           COLLEGE MANAGEMENT SYSTEM - BATCH ANALYTICS REPORT
========================================================================
Generated On     : ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}
Batch Year       : ${data.batchYear} Batch
Report Type      : Comprehensive Historical Placement Analytics
========================================================================

------------------------------------------------------------------------
1. BATCH SUMMARY (22 CORE METRICS)
------------------------------------------------------------------------
* Total Students Registered       : ${data.totalStudents}
* Placement Target               : ${data.placementTarget}
* Active Placement Seekers       : ${data.activePlacementTarget}
* Campus Placed                   : ${data.campusPlaced}
* Alumni Referral Placements      : ${data.alumniPlacement}
* Off-Campus Placements           : ${data.offCampusPlacement}
* Seeking Employment (Active)     : ${data.seekingEmployment}
* Pursuing Higher Studies         : ${data.higherStudies}
* Entrepreneurship / Startups     : ${data.entrepreneurship}
* Government Exam Aspirants       : ${data.governmentExams}
* Medical / Personal Leave        : ${data.medicalLeave}
* Remaining Unplaced Students     : ${data.remainingStudents}
------------------------------------------------------------------------
* Placement Success Ratio         : ${data.placementPercentage}%
* Highest Package Offered         : ${data.highestPackage} LPA
* Average Package                 : ${data.averagePackage} LPA
* Median Package                  : ${data.medianPackage} LPA
* Lowest Package Offered          : ${data.lowestPackage} LPA
* Companies Visited               : ${data.companiesVisited}
* Total Offers Received           : ${data.totalOffers}
* Dream Offers (10 - 20 LPA)       : ${data.dreamOffers}
* Super Dream Offers (> 20 LPA)   : ${data.superDreamOffers}

------------------------------------------------------------------------
2. DEPARTMENT-WISE BREAKDOWN
------------------------------------------------------------------------
${data.departmentWise.map((d, i) => `[${i + 1}] ${d.department}
  - Students: ${d.totalStudents} | Placed: ${d.placed} (${d.placementPct}%) | Avg: ${d.avgPackage} LPA | Max: ${d.highestPackage} LPA`).join("\n\n")}

------------------------------------------------------------------------
3. TOP RECRUITING COMPANIES
------------------------------------------------------------------------
${data.companyWise.map((c, i) => `[${i + 1}] ${c.company} (${c.category}) - Offers: ${c.offers} | Avg: ${c.avgPackage} LPA | Max: ${c.highestPackage} LPA`).join("\n")}

------------------------------------------------------------------------
4. HISTORICAL BATCH COMPARISON
------------------------------------------------------------------------
${data.batchComparison.map((b, i) => `* ${b.batch}: Placed ${b.campusPlaced}/${b.totalStudents} (${b.placementPct}%) | Avg: ${b.avgPackage} LPA | Max: ${b.highestPackage} LPA`).join("\n")}

========================================================================
            CONFIDENTIAL - CMS ACADEMIC ARCHIVES REPORT
========================================================================`;

  const blob = new Blob([content], { type: "application/pdf;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ExemptionRequestItem {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  exemptionType: "Higher Studies" | "Entrepreneurship" | "Government Exams" | "Medical Leave";
  reason: string;
  documentUrl: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  reviewNotes?: string;
}

export interface TargetAuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  studentName: string;
  exemptionType: string;
  prevActiveTarget: number;
  newActiveTarget: number;
  officerName: string;
  notes: string;
}

export interface TargetSummaryData {
  totalStudents: number;
  originalTarget: number;
  totalApprovedExemptions: number;
  activePlacementTarget: number;
  campusPlaced: number;
  placementPercentage: number;
  exemptionsBreakdown: {
    higherStudies: number;
    entrepreneurship: number;
    governmentExams: number;
    medicalLeave: number;
  };
  exemptionRequests: ExemptionRequestItem[];
  auditLogs: TargetAuditLogItem[];
}

export async function fetchPlacementTargets(): Promise<TargetSummaryData> {
  const { data } = await api.get<{ success: boolean; data: TargetSummaryData }>("/api/placement/targets");
  return data.data;
}

export async function updateExemptionStatus(
  id: string,
  status: "Approved" | "Rejected",
  reviewNotes?: string,
  studentName?: string,
  exemptionType?: string
): Promise<any> {
  const { data } = await api.put<{ success: boolean; message: string; newActiveTarget: number }>(
    `/api/placement/targets/exemptions/${id}/status`,
    { status, reviewNotes, studentName, exemptionType }
  );
  return data;
}

export async function submitExemptionRequest(payload: {
  studentId?: string;
  studentName: string;
  department?: string;
  exemptionType: "Higher Studies" | "Entrepreneurship" | "Government Exams" | "Medical Leave";
  reason: string;
  documentUrl?: string;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; message: string }>("/api/placement/targets/exemptions", payload);
  return data;
}

export interface DeclarationTimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
}

export interface CareerDeclarationItem {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  category: "Higher Studies" | "Entrepreneurship" | "Government Exams" | "Medical Leave";
  reason: string;
  pdfUrl: string;
  letterUrl: string;
  proofUrl: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected" | "Clarification Requested";
  parentStatus: "Pending Parent Consent" | "Parent Verified" | "Parent Disapproved";
  officerNotes?: string;
  createdAt: string;
  updatedAt?: string;
  timeline: DeclarationTimelineEvent[];
}

export async function fetchCareerDeclarations(studentId?: string): Promise<CareerDeclarationItem[]> {
  const url = studentId ? `/api/placement/career-declarations?studentId=${studentId}` : "/api/placement/career-declarations";
  const { data } = await api.get<{ success: boolean; data: CareerDeclarationItem[] }>(url);
  return data.data;
}

export async function submitCareerDeclaration(payload: {
  studentId?: string;
  studentName?: string;
  department?: string;
  category: "Higher Studies" | "Entrepreneurship" | "Government Exams" | "Medical Leave";
  reason: string;
  pdfUrl?: string;
  letterUrl?: string;
  proofUrl?: string;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; message: string; data: CareerDeclarationItem }>(
    "/api/placement/career-declarations",
    payload
  );
  return data;
}

export async function processDeclarationAction(
  id: string,
  action: "Approve" | "Reject" | "Request Clarification",
  officerNotes?: string
): Promise<any> {
  const { data } = await api.put<{ success: boolean; message: string; data: CareerDeclarationItem }>(
    `/api/placement/career-declarations/${id}/action`,
    { action, officerNotes }
  );
  return data;
}

export async function verifyParentDeclaration(id: string, parentConsent: boolean): Promise<any> {
  const { data } = await api.put<{ success: boolean; message: string; data: CareerDeclarationItem }>(
    `/api/placement/career-declarations/${id}/parent-verify`,
    { parentConsent }
  );
  return data;
}

export interface AlumniOpportunityItem {
  id: string;
  alumniName: string;
  alumniBatch: string;
  alumniCompany: string;
  alumniRole: string;
  alumniEmail: string;
  opportunityType: "Job Opportunity" | "Referral" | "Internship" | "PPO";
  company: string;
  role: string;
  package: string;
  vacancies: number;
  eligibilityMinCgpa: number;
  eligibilityDepartments: string[];
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedCount: number;
  referredCount: number;
  selectedCount: number;
  createdAt: string;
  officerNotes?: string;
}

export interface AlumniContributorItem {
  rank: number;
  name: string;
  batch: string;
  company: string;
  design: string;
  totalPosts: number;
  totalReferred: number;
  totalSelected: number;
  avatarTone?: string;
}

export interface AlumniPortalData {
  stats: {
    totalOpportunities: number;
    approvedCount: number;
    totalApplied: number;
    totalReferred: number;
    totalSelected: number;
    activeAlumniRecruiters: number;
  };
  opportunities: AlumniOpportunityItem[];
  topContributors: AlumniContributorItem[];
}

export async function fetchAlumniOpportunities(): Promise<AlumniPortalData> {
  const { data } = await api.get<{ success: boolean; data: AlumniPortalData }>("/api/placement/alumni-opportunities");
  return data.data;
}

export async function submitAlumniOpportunity(payload: {
  alumniName: string;
  alumniBatch?: string;
  alumniCompany?: string;
  alumniRole?: string;
  alumniEmail?: string;
  opportunityType: "Job Opportunity" | "Referral" | "Internship" | "PPO";
  company: string;
  role: string;
  package?: string;
  vacancies?: number;
  eligibilityMinCgpa?: number;
  eligibilityDepartments?: string[];
  description?: string;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; message: string; data: AlumniOpportunityItem }>(
    "/api/placement/alumni-opportunities",
    payload
  );
  return data;
}

export async function processAlumniOpportunityAction(
  id: string,
  action: "Approve" | "Reject",
  officerNotes?: string
): Promise<any> {
  const { data } = await api.put<{ success: boolean; message: string; data: AlumniOpportunityItem }>(
    `/api/placement/alumni-opportunities/${id}/action`,
    { action, officerNotes }
  );
  return data;
}

export interface ApplicationHistoryRecord {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  status: string;
  ctc: string;
}

export interface InterviewRatings {
  technical: number;
  hr: number;
  coding: number;
  communication: number;
  overallAvg: number;
}

export interface InterviewHistoryRecord {
  id: string;
  company: string;
  roundName: string;
  interviewDate: string;
  interviewer: string;
  score: string;
  outcome: string;
  feedback: string;
  ratings?: InterviewRatings;
}

export interface OfferHistoryRecord {
  id: string;
  company: string;
  role: string;
  package: string;
  joiningDate: string;
  status: "Accepted" | "Declined" | "Expired" | "Pending";
  offerLetterUrl: string;
  declinedReason?: string;
  bondYears?: string;
  location?: string;
  verified?: boolean;
}

export interface DocumentRecord {
  id: string;
  name: string;
  category: "Resume" | "Offer Letter" | "Certificate" | "NOC" | "ID Proof" | "Joining Letter";
  version: string;
  uploadedAt: string;
  fileUrl: string;
  verificationStatus: "Verified" | "Pending" | "Rejected";
}

export interface AuditTrailRecord {
  id: string;
  performedBy: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  reason?: string;
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  timestamp: string;
  category: "Application" | "Interview" | "Offer" | "Document" | "Status";
}

export interface AIStudentInsight {
  readinessScore: number;
  employabilityScore: number;
  placementProbabilityPct: number;
  strengths: string[];
  weaknesses: string[];
  resumeSuggestions: string[];
  missingSkills: string[];
  recommendedCertifications: string[];
  recommendedCompanies: string[];
}

export interface StudentComparisonData {
  departmentAvgCgpa: number;
  departmentAvgPackage: string;
  batchAvgPackage: string;
  topPackageInDepartment: string;
  candidateRankInDept: number;
  totalStudentsInDept: number;
}

export interface StudentPlacementDossier {
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  department: string;
  batch: string;
  cgpa: number;
  email: string;
  phone: string;
  careerStatus: string;
  eligibilityStatus: "Eligible" | "Exempted" | "Ineligible";
  resumeScore: number;
  employabilityScore: number;
  profileCompletionPct: number;
  lastUpdated: string;
  readinessBadge: "High Priority" | "Job Ready" | "Needs Mentorship" | "Placed";
  kpis: {
    applicationsCount: number;
    interviewsCount: number;
    offersCount: number;
    selectionsCount: number;
    rejectionsCount: number;
    currentPackageCTC: string;
    dreamOfferAchieved: boolean;
    salaryGrowthPct: string;
  };
  currentPlacement?: {
    company: string;
    role: string;
    package: string;
    joiningDate: string;
    offerLetterUrl: string;
    resumeUrl: string;
    bondYears?: string;
    location?: string;
    status: string;
    verified: boolean;
  };
  applicationHistory: ApplicationHistoryRecord[];
  interviewHistory: InterviewHistoryRecord[];
  offerHistory: OfferHistoryRecord[];
  timeline: { id: string; title: string; timestamp: string; description: string; companyLogo?: string; officerNotes?: string; documents?: { name: string; url: string }[] }[];
  documents: DocumentRecord[];
  auditTrail: AuditTrailRecord[];
  activityFeed: ActivityFeedItem[];
  aiInsights: AIStudentInsight;
  comparison: StudentComparisonData;
}

export async function fetchStudentPlacementHistory(studentId: string): Promise<StudentPlacementDossier> {
  const { data } = await api.get<{ success: boolean; data: StudentPlacementDossier }>(`/api/placement/history/student/${studentId}`);
  return data.data;
}

export async function fetchAllPlacementHistories(): Promise<StudentPlacementDossier[]> {
  const { data } = await api.get<{ success: boolean; data: StudentPlacementDossier[] }>("/api/placement/history/students");
  return data.data;
}

export interface PlacementReportCategoryData {
  type: string;
  title: string;
  summary: string;
  tableHeaders: string[];
  rows: Record<string, any>[];
  chartData: Record<string, any>[];
}

export async function fetchPlacementReportData(
  reportType: string,
  batchYear?: string,
  department?: string
): Promise<PlacementReportCategoryData> {
  const { data } = await api.get<{ success: boolean; data: PlacementReportCategoryData }>(
    `/api/placement/reports/generate?reportType=${encodeURIComponent(reportType)}&batchYear=${encodeURIComponent(batchYear || '')}&department=${encodeURIComponent(department || '')}`
  );
  return data.data;
}

export function exportReportDataToExcel(reportData: PlacementReportCategoryData, fileName: string = "Placement_Report") {
  const csvRows: string[] = [];
  csvRows.push(`REPORT TITLE: ${reportData.title.toUpperCase()}`);
  csvRows.push(`SUMMARY: ${reportData.summary}`);
  csvRows.push("");
  csvRows.push(reportData.tableHeaders.join(","));

  reportData.rows.forEach(r => {
    const rowValues = reportData.tableHeaders.map((_, i) => `"${r[`col${i}`] || ''}"`);
    csvRows.push(rowValues.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName.endsWith(".csv") ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface StudentPredictionItem {
  studentId: string;
  studentName: string;
  department: string;
  cgpa: number;
  backlogs: number;
  placementProbability: number;
  riskTier: "High Readiness" | "Moderate" | "At Risk";
  resumeScore: number;
  skillMatchScore: number;
  recommendedAction: string;
}

export interface SkillGapItem {
  skill: string;
  industryDemand: number;
  batchProficiency: number;
  gap: number;
}

export interface PlacementIntelligenceData {
  summary: {
    overallBatchProbability: number;
    totalEvaluated: number;
    highReadinessCount: number;
    moderateReadinessCount: number;
    atRiskCount: number;
    avgResumeScore: number;
  };
  studentPredictions: StudentPredictionItem[];
  skillGapAnalysis: SkillGapItem[];
  riskStudents: StudentPredictionItem[];
  departmentPerformance: { department: string; avgProbability: number; totalStudents: number; placedPct: number }[];
  companyTrends: { company: string; hires2024: number; hires2025: number; hires2026: number; growthPct: string }[];
  aiInsights: string[];
}

export async function fetchPlacementIntelligenceData(): Promise<PlacementIntelligenceData> {
  const { data } = await api.get<{ success: boolean; data: PlacementIntelligenceData }>("/api/placement/intelligence/predictions");
  return data.data;
}

export interface DriveReminderPayload {
  driveId: string;
  reminderType: "General" | "Deadline";
  target: "unapplied" | "all_eligible";
  customMessage?: string;
}

export interface DriveReminderResponse {
  success: boolean;
  message: string;
  notifiedCount: number;
}

export async function sendDriveReminder(payload: DriveReminderPayload): Promise<DriveReminderResponse> {
  const { data } = await api.post<DriveReminderResponse>("/api/placement/communication/send-reminder", payload);
  return data;
}

export async function fetchPlacementCalendar(): Promise<CalendarEventItem[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: CalendarEventItem[] }>("/api/placement/calendar");
    return data.data || [];
  } catch (err) {
    return [
      { id: "EVT_1", title: "Amazon Software Engineer Interview", date: "2026-07-27", type: "Interview", company: "Amazon India", venue: "Conference Hall B", details: "Technical Round 2 & Behavioral" },
      { id: "EVT_2", title: "TCS Digital Coding Round", date: "2026-07-27", type: "Interview", company: "TCS Digital", venue: "Computer Lab 3", details: "Hands-on Coding Assessment" },
      { id: "EVT_3", title: "Microsoft SDE Recruitment Drive", date: "2026-07-28", type: "Drive", company: "Microsoft", venue: "Main Auditorium", details: "Pre-placement talk & PPT" },
      { id: "EVT_4", title: "Qualcomm Hardware Application Deadline", date: "2026-07-29", type: "Deadline", company: "Qualcomm", venue: "Online Portal", details: "Final deadline for resume submission" },
    ];
  }
}
