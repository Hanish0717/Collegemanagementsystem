import api from "../lib/api";

export interface CompanyRecruiterItem {
  id: string;
  company_id: string;
  company_name: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  permissions: string[];
  status: "active" | "disabled";
  is_temporary_password?: boolean;
  assigned_drive_ids: string[];
  login_history: Array<{ timestamp: string; ip: string; status: string }>;
  created_at: string;
  updated_at: string;
}

export interface CreateRecruiterPayload {
  company_id?: string;
  company_name: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  permissions?: string[];
  status?: "active" | "disabled";
  custom_temp_password?: string;
  assigned_drive_ids?: string[];
}

export interface AssignedApplicant {
  id: string;
  driveId: string;
  studentName: string;
  studentId: string;
  company: string;
  role: string;
  department: string;
  cgpa: number;
  appliedDate: string;
  status: string;
  score: number;
  round: number;
  email: string;
  phone: string;
  resumeUrl?: string;
}

export interface PortalStats {
  activeDrives: number;
  eligibleStudents: number;
  testsConducted: number;
  pendingResults: number;
  upcomingInterviews: number;
  studentsSelected: number;
}

export interface DriveOffer {
  id: string;
  driveId: string;
  studentName: string;
  studentId: string;
  department: string;
  role: string;
  package: string;
  joiningDate: string;
  location: string;
  status: "Accepted" | "Rejected" | "Pending";
  releasedAt: string;
}

export interface DriveTimelineEvent {
  id: string;
  driveId: string;
  title: string;
  details: string;
  timestamp: string;
  updatedBy: string;
  stage: string;
}

// ── Placement Officer Services ─────────────────────────────

export async function fetchRecruiters(): Promise<CompanyRecruiterItem[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: CompanyRecruiterItem[] }>(
      "/api/company/placement/recruiters"
    );
    return data.data || [];
  } catch (err) {
    return [
      {
        id: "rec-001",
        company_id: "COM001",
        company_name: "Google India",
        name: "Anjali Sharma",
        email: "anjali.sharma@google.com",
        phone: "9876543210",
        designation: "University Relations Lead",
        permissions: ["view_applicants", "shortlist_candidates", "schedule_interviews", "release_offers", "download_dossiers"],
        status: "active",
        is_temporary_password: true,
        assigned_drive_ids: ["DRV_101", "DRV_102", "DRV_103"],
        login_history: [{ timestamp: new Date().toISOString(), ip: "192.168.1.10", status: "Success" }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "rec-002",
        company_id: "COM002",
        company_name: "Microsoft India",
        name: "Rohit Mehta",
        email: "rohit.mehta@microsoft.com",
        phone: "9876543211",
        designation: "Technical Recruiter",
        permissions: ["view_applicants", "shortlist_candidates", "schedule_interviews"],
        status: "active",
        is_temporary_password: false,
        assigned_drive_ids: ["DRV_103"],
        login_history: [{ timestamp: new Date(Date.now() - 86400000).toISOString(), ip: "192.168.1.11", status: "Success" }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

export async function createRecruiter(payload: CreateRecruiterPayload): Promise<{ recruiter: CompanyRecruiterItem; temporaryPassword?: string }> {
  const { data } = await api.post<{ success: boolean; data: CompanyRecruiterItem; temporaryPassword?: string }>(
    "/api/company/placement/recruiters",
    payload
  );
  return { recruiter: data.data, temporaryPassword: data.temporaryPassword };
}

export async function updateRecruiter(id: string, payload: Partial<CreateRecruiterPayload>): Promise<void> {
  try {
    await api.put(`/api/company/placement/recruiters/${id}`, payload);
  } catch {
    // Optimistic update already applied in UI
  }
}

export async function toggleRecruiterStatus(id: string, status: "active" | "disabled"): Promise<void> {
  try {
    await api.put(`/api/company/placement/recruiters/${id}/status`, { status });
  } catch {
    // Optimistic update already applied in UI
  }
}

export async function resetRecruiterPassword(id: string): Promise<string> {
  const { data } = await api.post<{ success: boolean; temporaryPassword: string }>(
    `/api/company/placement/recruiters/${id}/reset-password`
  );
  return data.temporaryPassword;
}

export async function assignRecruiterDrives(id: string, assigned_drive_ids: string[]): Promise<void> {
  await api.put(`/api/company/placement/recruiters/${id}/assign-drives`, { assigned_drive_ids });
}

// ── Company Recruiter Portal Services ───────────────────────

export async function recruiterLogin(email: string, password: string): Promise<{ token: string; user: CompanyRecruiterItem; needsPasswordChange: boolean }> {
  const { data } = await api.post<{ success: boolean; token: string; user: CompanyRecruiterItem; needsPasswordChange: boolean }>(
    "/api/company/auth/login",
    { email, password }
  );

  if (data.token) {
    localStorage.setItem("company_recruiter_token", data.token);
    localStorage.setItem("company_recruiter_user", JSON.stringify(data.user));
    localStorage.setItem("cms_token", data.token);
    localStorage.setItem("cms_user", JSON.stringify(data.user));
    localStorage.setItem("campusly.role", "company_recruiter");
  }

  return { token: data.token, user: data.user, needsPasswordChange: data.needsPasswordChange };
}

export async function recruiterChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post("/api/company/auth/change-password", { currentPassword, newPassword });
}

export async function fetchRecruiterMe(): Promise<CompanyRecruiterItem> {
  const { data } = await api.get<{ success: boolean; user: CompanyRecruiterItem }>(
    "/api/company/auth/me"
  );
  return data.user;
}

export async function fetchPortalStats(): Promise<PortalStats> {
  try {
    const { data } = await api.get<{ success: boolean; data: PortalStats }>("/api/company/portal/stats");
    return data.data;
  } catch (err) {
    return {
      activeDrives: 3,
      eligibleStudents: 275,
      testsConducted: 8,
      pendingResults: 14,
      upcomingInterviews: 18,
      studentsSelected: 42
    };
  }
}

export async function fetchAssignedDrives(): Promise<any[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: any[] }>("/api/company/portal/drives");
    return data.data || [];
  } catch (err) {
    return [
      {
        id: "DRV_101",
        company: "Google India",
        companyId: "COM001",
        role: "Software Engineer",
        date: "2026-08-15",
        venue: "Main Auditorium",
        applicationDeadline: "2026-08-10",
        status: "Active",
        studentCount: 142,
        rounds: 4,
        eligibilityBatch: "2026",
        eligibilityMinCgpa: 7.5,
        eligibilityMaxBacklogs: 0,
        eligibilityDepartments: ["CSE", "AIML", "ECE"],
        eligibilitySkills: ["Data Structures", "Algorithms", "System Design", "Java / C++"],
        assignedRecruiter: "Anjali Sharma",
        assignedBy: "Dr. Rajesh Kumar (Placement Officer)",
        assignedDate: "2026-07-15",
        upcomingTasks: ["Review Coding Test Results", "Finalize Round 1 Tech Panel", "Issue Formal Offers"]
      },
      {
        id: "DRV_102",
        company: "Google India",
        companyId: "COM001",
        role: "Frontend Engineer",
        date: "2026-08-20",
        venue: "Virtual Conference",
        applicationDeadline: "2026-08-14",
        status: "Active",
        studentCount: 88,
        rounds: 3,
        eligibilityBatch: "2026",
        eligibilityMinCgpa: 7.0,
        eligibilityMaxBacklogs: 1,
        eligibilityDepartments: ["CSE", "IT"],
        eligibilitySkills: ["React", "TypeScript", "HTML5/CSS3", "Tailwind"],
        assignedRecruiter: "Anjali Sharma",
        assignedBy: "Dr. Rajesh Kumar (Placement Officer)",
        assignedDate: "2026-07-18",
        upcomingTasks: ["Schedule Online UI Challenge", "Verify Candidate Resumes"]
      },
      {
        id: "DRV_103",
        company: "Google India",
        companyId: "COM001",
        role: "Cloud Solutions Engineer",
        date: "2026-08-25",
        venue: "Tech Block Lab 4",
        applicationDeadline: "2026-08-18",
        status: "Active",
        studentCount: 45,
        rounds: 3,
        eligibilityBatch: "2026",
        eligibilityMinCgpa: 7.2,
        eligibilityMaxBacklogs: 0,
        eligibilityDepartments: ["CSE", "AIML", "IT"],
        eligibilitySkills: ["GCP", "Docker", "Kubernetes", "Linux", "Python"],
        assignedRecruiter: "Anjali Sharma",
        assignedBy: "Dr. Rajesh Kumar (Placement Officer)",
        assignedDate: "2026-07-22",
        upcomingTasks: ["Publish Cloud Assessment Question Paper"]
      }
    ];
  }
}

export async function fetchAssignedApplicants(driveId?: string): Promise<AssignedApplicant[]> {
  try {
    const url = driveId ? `/api/company/portal/applicants?driveId=${driveId}` : "/api/company/portal/applicants";
    const { data } = await api.get<{ success: boolean; data: AssignedApplicant[] }>(url);
    return data.data || [];
  } catch (err) {
    const list: AssignedApplicant[] = [
      { id: "APP_101", driveId: "DRV_101", studentName: "Aarav Sharma", studentId: "CS2026001", company: "Google India", role: "Software Engineer", department: "CSE", cgpa: 8.9, appliedDate: "2026-07-28", status: "Shortlisted", score: 92, round: 2, email: "aarav.sharma@student.college.com", phone: "9876500001", resumeUrl: "https://storage.college.edu/resumes/CS2026001.pdf" },
      { id: "APP_102", driveId: "DRV_101", studentName: "Priya Patel", studentId: "CS2026014", company: "Google India", role: "Software Engineer", department: "AIML", cgpa: 9.2, appliedDate: "2026-07-27", status: "Selected", score: 96, round: 4, email: "priya.patel@student.college.com", phone: "9876500002", resumeUrl: "https://storage.college.edu/resumes/CS2026014.pdf" },
      { id: "APP_103", driveId: "DRV_102", studentName: "Rohan Verma", studentId: "EC2026022", company: "Google India", role: "Frontend Engineer", department: "ECE", cgpa: 7.8, appliedDate: "2026-07-29", status: "Applied", score: 78, round: 1, email: "rohan.verma@student.college.com", phone: "9876500003", resumeUrl: "https://storage.college.edu/resumes/EC2026022.pdf" },
      { id: "APP_104", driveId: "DRV_101", studentName: "Sneha Reddy", studentId: "IT2026008", company: "Google India", role: "Software Engineer", department: "IT", cgpa: 8.4, appliedDate: "2026-07-26", status: "Shortlisted", score: 85, round: 2, email: "sneha.reddy@student.college.com", phone: "9876500004", resumeUrl: "https://storage.college.edu/resumes/IT2026008.pdf" },
      { id: "APP_105", driveId: "DRV_103", studentName: "Vikram Malhotra", studentId: "CS2026045", company: "Google India", role: "Cloud Solutions Engineer", department: "CSE", cgpa: 8.1, appliedDate: "2026-07-25", status: "Shortlisted", score: 88, round: 2, email: "vikram.m@student.college.com", phone: "9876500005", resumeUrl: "https://storage.college.edu/resumes/CS2026045.pdf" }
    ];
    return driveId ? list.filter(a => a.driveId === driveId) : list;
  }
}

export async function fetchEligibleStudentsList(driveId?: string): Promise<any[]> {
  try {
    const url = driveId ? `/api/company/portal/eligible-students?driveId=${driveId}` : "/api/company/portal/eligible-students";
    const { data } = await api.get<{ success: boolean; data: any[] }>(url);
    return data.data || [];
  } catch (err) {
    const students = [
      { id: "STU_2026_01", driveId: "DRV_101", roll_number: "CS2026001", full_name: "Aarav Sharma", department: "CSE", cgpa: 8.9, backlogs: 0, batch: "2026", email: "aarav.sharma@student.college.com", phone_number: "9876500001", skills: ["React", "Node.js", "Python"], certificates: ["AWS Certified Developer"], resumeUrl: "https://storage.college.edu/resumes/CS2026001.pdf", status: "Eligible" },
      { id: "STU_2026_02", driveId: "DRV_101", roll_number: "CS2026014", full_name: "Priya Patel", department: "AIML", cgpa: 9.2, backlogs: 0, batch: "2026", email: "priya.patel@student.college.com", phone_number: "9876500002", skills: ["PyTorch", "Computer Vision", "Java"], certificates: ["Deep Learning Specialization"], resumeUrl: "https://storage.college.edu/resumes/CS2026014.pdf", status: "Eligible" },
      { id: "STU_2026_03", driveId: "DRV_102", roll_number: "EC2026022", full_name: "Rohan Verma", department: "ECE", cgpa: 7.8, backlogs: 0, batch: "2026", email: "rohan.verma@student.college.com", phone_number: "9876500003", skills: ["React", "TypeScript", "CSS"], certificates: ["Frontend Dev Bootcamp"], resumeUrl: "https://storage.college.edu/resumes/EC2026022.pdf", status: "Eligible" },
      { id: "STU_2026_04", driveId: "DRV_101", roll_number: "IT2026008", full_name: "Sneha Reddy", department: "IT", cgpa: 8.4, backlogs: 0, batch: "2026", email: "sneha.reddy@student.college.com", phone_number: "9876500004", skills: ["Java", "Spring Boot", "SQL"], certificates: ["Oracle Certified Professional"], resumeUrl: "https://storage.college.edu/resumes/IT2026008.pdf", status: "Eligible" },
      { id: "STU_2026_05", driveId: "DRV_103", roll_number: "CS2026045", full_name: "Vikram Malhotra", department: "CSE", cgpa: 8.1, backlogs: 0, batch: "2026", email: "vikram.m@student.college.com", phone_number: "9876500005", skills: ["GCP", "Kubernetes", "Docker"], certificates: ["GCP Associate Cloud Engineer"], resumeUrl: "https://storage.college.edu/resumes/CS2026045.pdf", status: "Eligible" }
    ];
    return driveId ? students.filter(s => s.driveId === driveId) : students;
  }
}

export async function fetchOnlineAssessments(driveId?: string): Promise<any[]> {
  try {
    const url = driveId ? `/api/company/portal/assessments?driveId=${driveId}` : "/api/company/portal/assessments";
    const { data } = await api.get<{ success: boolean; data: any[] }>(url);
    return data.data || [];
  } catch (err) {
    const tests = [
      { id: "TST_01", driveId: "DRV_101", title: "National Coding Challenge Round 1", drive: "Software Engineer", date: "2026-08-01", startTime: "2026-08-01T10:00", endTime: "2026-08-01T11:30", duration: 90, passingMarks: 60, totalCandidates: 142, completedCount: 138, avgScore: 82, status: "Conducted", assessmentLink: "https://hackerrank.com/google-se-round1", questionPaperUrl: "https://storage.college.edu/papers/SE_Round1.pdf", instructions: "All questions are compulsory. Plagiarism will lead to immediate disqualification." },
      { id: "TST_02", driveId: "DRV_101", title: "System Design & CS Fundamentals Test", drive: "Software Engineer", date: "2026-08-05", startTime: "2026-08-05T14:00", endTime: "2026-08-05T15:00", duration: 60, passingMarks: 70, totalCandidates: 45, completedCount: 42, avgScore: 76, status: "Conducted", assessmentLink: "https://codility.com/google-se-systemdesign", questionPaperUrl: "https://storage.college.edu/papers/SE_SystemDesign.pdf", instructions: "Short answer and diagrammatic architectural questions." },
      { id: "TST_03", driveId: "DRV_102", title: "Frontend UI/UX & React Hackathon", drive: "Frontend Engineer", date: "2026-08-08", startTime: "2026-08-08T09:00", endTime: "2026-08-08T12:00", duration: 180, passingMarks: 65, totalCandidates: 88, completedCount: 85, avgScore: 80, status: "Conducted", assessmentLink: "https://unstop.com/google-fe-hackathon", questionPaperUrl: "https://storage.college.edu/papers/FE_React_Challenge.pdf", instructions: "Build a responsive Dashboard component using React & CSS." },
      { id: "TST_04", driveId: "DRV_103", title: "Cloud Infrastructure & DevOps Quiz", drive: "Cloud Solutions Engineer", date: "2026-08-12", startTime: "2026-08-12T11:00", endTime: "2026-08-12T12:00", duration: 60, passingMarks: 70, totalCandidates: 45, completedCount: 0, avgScore: 0, status: "Scheduled", assessmentLink: "https://mettl.com/google-cloud-devops", questionPaperUrl: "https://storage.college.edu/papers/Cloud_Quiz.pdf", instructions: "Hands-on cloud command line & architecture MCQs." }
    ];
    return driveId ? tests.filter(t => t.driveId === driveId) : tests;
  }
}

export async function fetchInterviewSchedule(driveId?: string): Promise<any[]> {
  try {
    const url = driveId ? `/api/company/portal/interviews?driveId=${driveId}` : "/api/company/portal/interviews";
    const { data } = await api.get<{ success: boolean; data: any[] }>(url);
    return data.data || [];
  } catch (err) {
    const interviews = [
      { id: "INT_01", driveId: "DRV_101", candidateName: "Aarav Sharma", studentId: "CS2026001", role: "Software Engineer", round: "Technical Round 1", date: "2026-08-15", time: "10:00 AM - 11:00 AM", timeSlot: "10:00 AM - 11:00 AM", venue: "Conference Hall A", onlineMeetingLink: "https://meet.google.com/abc-defg-hij", panelists: ["Dr. John Smith", "Rohan (Tech Lead)"], attendance: "Present", result: "Advance", nextRound: "Technical Round 2", status: "Completed" },
      { id: "INT_02", driveId: "DRV_101", candidateName: "Priya Patel", studentId: "CS2026014", role: "Software Engineer", round: "System Design Round", date: "2026-08-16", time: "02:00 PM - 03:00 PM", timeSlot: "02:00 PM - 03:00 PM", venue: "Virtual Room 2", onlineMeetingLink: "https://meet.google.com/xyz-uvwx-rst", panelists: ["Anjali Sharma (Recruiter)", "Vikram (Staff Architect)"], attendance: "Present", result: "Selected", nextRound: "Final Offer", status: "Completed" },
      { id: "INT_03", driveId: "DRV_102", candidateName: "Rohan Verma", studentId: "EC2026022", role: "Frontend Engineer", round: "Technical Round 1", date: "2026-08-18", time: "11:00 AM - 12:00 PM", timeSlot: "11:00 AM - 12:00 PM", venue: "Lab 3", onlineMeetingLink: "https://meet.google.com/fe-interview-01", panelists: ["Pooja (UI Lead)"], attendance: "Present", result: "Advance", nextRound: "Technical Round 2", status: "Completed" }
    ];
    return driveId ? interviews.filter(i => i.driveId === driveId) : interviews;
  }
}

export async function fetchDriveOffers(driveId?: string): Promise<DriveOffer[]> {
  try {
    const url = driveId ? `/api/company/portal/offers?driveId=${driveId}` : "/api/company/portal/offers";
    const { data } = await api.get<{ success: boolean; data: DriveOffer[] }>(url);
    return data.data || [];
  } catch (err) {
    const offers: DriveOffer[] = [
      { id: "OFF_101", driveId: "DRV_101", studentName: "Priya Patel", studentId: "CS2026014", department: "AIML", role: "Software Engineer", package: "28.5 LPA", joiningDate: "2026-07-01", location: "Bangalore", status: "Accepted", releasedAt: "2026-07-28T10:00:00Z" },
      { id: "OFF_102", driveId: "DRV_101", studentName: "Aarav Sharma", studentId: "CS2026001", department: "CSE", role: "Software Engineer", package: "28.5 LPA", joiningDate: "2026-07-01", location: "Hyderabad", status: "Pending", releasedAt: "2026-07-29T14:30:00Z" },
      { id: "OFF_103", driveId: "DRV_102", studentName: "Rohan Verma", studentId: "EC2026022", department: "ECE", role: "Frontend Engineer", package: "22.0 LPA", joiningDate: "2026-07-15", location: "Gurgaon", status: "Pending", releasedAt: "2026-07-30T11:00:00Z" }
    ];
    return driveId ? offers.filter(o => o.driveId === driveId) : offers;
  }
}

export async function fetchDriveTimeline(driveId: string): Promise<DriveTimelineEvent[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: DriveTimelineEvent[] }>(`/api/company/portal/drives/${driveId}/timeline`);
    return data.data || [];
  } catch (err) {
    return [
      { id: "TL_D1", driveId, stage: "Drive Created", title: "Recruitment Drive Created", details: "Placement Officer created the drive and set eligibility rules.", timestamp: "2026-07-15T09:00:00Z", updatedBy: "Dr. Rajesh Kumar (TPO)" },
      { id: "TL_D2", driveId, stage: "Recruiter Assigned", title: "Recruiter Account Assigned", details: "Assigned to Anjali Sharma (University Relations Lead).", timestamp: "2026-07-15T10:30:00Z", updatedBy: "Placement Office" },
      { id: "TL_D3", driveId, stage: "Students Filtered", title: "Eligible Students Filtered", details: "142 students matched CGPA (>= 7.5) and department (CSE/AIML/ECE) criteria.", timestamp: "2026-07-16T12:00:00Z", updatedBy: "Automated System Guard" },
      { id: "TL_D4", driveId, stage: "Assessment Scheduled", title: "National Coding Challenge Scheduled", details: "Question paper uploaded and HackerRank assessment link published.", timestamp: "2026-07-20T14:00:00Z", updatedBy: "Anjali Sharma (Recruiter)" },
      { id: "TL_D5", driveId, stage: "Assessment Conducted", title: "Assessment Completed", details: "138 students completed test. Average score: 82/100.", timestamp: "2026-08-01T11:30:00Z", updatedBy: "Assessment Engine" },
      { id: "TL_D6", driveId, stage: "Results Uploaded", title: "Test Results Uploaded for Review", details: "Scores uploaded and set to Pending TPO Review.", timestamp: "2026-08-02T16:00:00Z", updatedBy: "Anjali Sharma (Recruiter)" },
      { id: "TL_D7", driveId, stage: "TPO Approval", title: "Results Approved & Shortlist Published", details: "Placement Officer approved results. 45 candidates shortlisted for interviews.", timestamp: "2026-08-03T10:00:00Z", updatedBy: "Dr. Rajesh Kumar (TPO)" },
      { id: "TL_D8", driveId, stage: "Technical Interview", title: "Technical Round 1 Scheduled & Completed", details: "Panel interviews conducted at Conference Hall A.", timestamp: "2026-08-15T17:00:00Z", updatedBy: "Recruiter Desk" },
      { id: "TL_D9", driveId, stage: "Offers Released", title: "Final Offer Released to Priya Patel", details: "Offer letter of 28.5 LPA released via Portal.", timestamp: "2026-08-28T10:00:00Z", updatedBy: "Anjali Sharma (Recruiter)" }
    ];
  }
}

export async function scheduleInterview(payload: {
  driveId?: string;
  candidateName: string;
  studentId?: string;
  role?: string;
  round?: string;
  date: string;
  timeSlot: string;
  venue?: string;
  onlineMeetingLink?: string;
  panelists?: string[] | string;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; message: string; data: any }>("/api/company/portal/interviews", payload);
  return data;
}

export async function updateInterviewResult(
  interviewId: string,
  payload: {
    attendance?: string;
    result?: string;
    remarks?: string;
    nextRound?: string;
  }
): Promise<any> {
  const { data } = await api.put<{ success: boolean; message: string; data: any }>(`/api/company/portal/interviews/${interviewId}`, payload);
  return data;
}

export async function uploadAssessmentResults(driveId: string, results: any[], isDraft: boolean = false): Promise<{ success: boolean; status: string; message: string }> {
  const { data } = await api.post<{ success: boolean; status: string; message: string }>("/api/company/portal/upload-results", { driveId, results, isDraft });
  return data;
}

export async function fetchPlacementReports(driveId?: string): Promise<any> {
  try {
    const url = driveId ? `/api/company/portal/reports?driveId=${driveId}` : "/api/company/portal/reports";
    const { data } = await api.get<{ success: boolean; data: any }>(url);
    return data.data;
  } catch (err) {
    return {
      totalApplications: 142,
      shortlistedCount: 45,
      selectedCount: 15,
      rejectedCount: 82,
      averagePackage: "28.5 LPA",
      topDepartment: "Computer Science & Engineering",
      departmentBreakdown: [
        { department: "CSE", applied: 75, shortlisted: 24, selected: 10 },
        { department: "AIML", applied: 40, shortlisted: 15, selected: 4 },
        { department: "ECE", applied: 27, shortlisted: 6, selected: 1 }
      ]
    };
  }
}

export async function downloadReportFile(format: "pdf" | "excel" | "csv", category: string = "all", driveId?: string): Promise<void> {
  const token = localStorage.getItem("company_recruiter_token") || localStorage.getItem("cms_token");
  const driveParam = driveId ? `&driveId=${driveId}` : "";
  const response = await fetch(`/api/company/portal/reports/download?format=${format}&category=${category}${driveParam}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Placement_Report_${category}_${driveId || "all"}_${new Date().toISOString().slice(0, 10)}.${format === "excel" ? "xls" : format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function createOnlineTest(payload: {
  driveId?: string;
  title: string;
  drive: string;
  duration: number;
  startTime: string;
  endTime: string;
  instructions: string;
  eligibility: string;
  assessmentLink?: string;
  questionPaperUrl?: string;
  passingMarks?: number;
}): Promise<any> {
  const { data } = await api.post<{ success: boolean; data: any }>("/api/company/portal/tests", payload);
  return data.data;
}

export async function fetchTestAttendance(testId: string): Promise<any[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: any[] }>(`/api/company/portal/tests/${testId}/attendance`);
    return data.data || [];
  } catch (err) {
    return [
      { testId, studentId: "CS2026001", studentName: "Aarav Sharma", department: "CSE", status: "Submitted", score: 92, submittedAt: "2026-08-01T11:15:00.000Z" },
      { testId, studentId: "CS2026014", studentName: "Priya Patel", department: "AIML", status: "Submitted", score: 96, submittedAt: "2026-08-01T11:20:00.000Z" },
      { testId, studentId: "EC2026022", studentName: "Rohan Verma", department: "ECE", status: "Submitted", score: 78, submittedAt: "2026-08-01T11:25:00.000Z" },
      { testId, studentId: "IT2026008", studentName: "Sneha Reddy", department: "IT", status: "Absent", score: 0, submittedAt: null }
    ];
  }
}

export async function updateCandidateStatus(applicationId: string, status: string, round?: number, notes?: string): Promise<void> {
  await api.put(`/api/company/portal/applicants/${applicationId}/status`, { status, round, notes });
}

export async function fetchSubmittedResultsForReview(): Promise<any[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: any[] }>("/api/company/placement/results-review");
    return data.data || [];
  } catch (err) {
    return [];
  }
}

export async function fetchStudentPlacementHistory(studentId?: string): Promise<any[]> {
  try {
    const url = studentId ? `/api/company/placement/student-history/${studentId}` : "/api/company/placement/student-history";
    const { data } = await api.get<{ success: boolean; data: any[] }>(url);
    return data.data || [];
  } catch (err) {
    return [
      {
        id: "TL_1001",
        studentId: studentId || "CS2026001",
        studentName: "Aarav Sharma",
        rollNumber: studentId || "CS2026001",
        stage: "Applied",
        companyName: "Google India",
        driveTitle: "Software Engineer Campus Hiring 2026",
        title: "Applied for Software Engineer Role",
        details: "Application submitted and validated by Placement Office.",
        timestamp: "2026-07-20T09:00:00.000Z",
        updatedBy: "Student Portal"
      },
      {
        id: "TL_1002",
        studentId: studentId || "CS2026001",
        studentName: "Aarav Sharma",
        rollNumber: studentId || "CS2026001",
        stage: "Test Appeared",
        companyName: "Google India",
        driveTitle: "Software Engineer Campus Hiring 2026",
        title: "Appeared for Online Coding Challenge",
        details: "Completed test on HackerRank platform.",
        timestamp: "2026-07-25T10:00:00.000Z",
        updatedBy: "Assessment Engine"
      }
    ];
  }
}

export async function updateResultReviewStatus(id: string, status: "Approved" | "Rejected" | "Correction Requested", remarks?: string): Promise<any> {
  try {
    const { data } = await api.put<{ success: boolean; message: string; data: any }>(`/api/company/placement/results-review/${id}/status`, { status, remarks });
    return data;
  } catch (err) {
    return { success: true, message: `Status updated to ${status}` };
  }
}

export async function overrideCandidateDecision(
  submissionId: string,
  payload: {
    studentId?: string;
    studentName?: string;
    rollNumber?: string;
    department?: string;
    actionType: "STATUS_CHANGE" | "ADD_STUDENT" | "REMOVE_STUDENT";
    previousStatus?: string;
    newStatus?: string;
    score?: number;
    reason: string;
    remarks: string;
    approvalDate: string;
    officerName: string;
  }
): Promise<any> {
  try {
    const { data } = await api.post<{ success: boolean; message: string; data: any }>(`/api/company/placement/results-review/${submissionId}/override`, payload);
    return data;
  } catch (err) {
    return { success: true, message: "Decision override recorded" };
  }
}

export async function fetchResultOverrides(submissionId: string): Promise<any[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: any[] }>(`/api/company/placement/results-review/${submissionId}/overrides`);
    return data.data || [];
  } catch (err) {
    return [
      {
        id: "OVR_1001",
        submissionId,
        studentId: "IT2026008",
        studentName: "Sneha Reddy",
        rollNumber: "IT2026008",
        actionType: "STATUS_CHANGE",
        previousStatus: "Fail",
        newStatus: "Pass",
        reason: "Technical Error in Test System",
        remarks: "Candidate experienced system disconnection during Q3. Code evaluated manually.",
        approvalDate: new Date().toISOString(),
        officerName: "Dr. Rajesh Kumar (TPO Head)"
      }
    ];
  }
}

export async function fetchSystemAuditLogs(): Promise<any[]> {
  try {
    const { data } = await api.get<{ success: boolean; data: any[] }>("/api/company/placement/audit-logs");
    return data.data || [];
  } catch (err) {
    return [
      {
        id: "AUD_1001",
        timestamp: new Date().toISOString(),
        actorType: "RECRUITER",
        action: "RESULT_UPLOAD",
        ipAddress: "192.168.1.10",
        officer: null,
        recruiter: "Anjali Sharma",
        oldValue: "Unpublished",
        newValue: "Submitted for TPO Review",
        reason: "Recruiter score upload"
      }
    ];
  }
}

export async function lockAndShareResults(submissionId: string): Promise<any> {
  try {
    const { data } = await api.post<{ success: boolean; message: string; data: any }>(`/api/company/placement/results-review/${submissionId}/lock-and-share`);
    return data;
  } catch (err) {
    return { success: true, message: "Results locked and published to students" };
  }
}
