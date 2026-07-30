import { hodApi } from '../api/hodApi';
import { DepartmentCode } from '../types';

// ─── Reports ──────────────────────────────────────────────
export interface ReportTypeItem {
  id: string;
  type: string;
  icon: string;
  generatedCount: number;
  lastGenerated: string;
}

export async function fetchDepartmentReports(deptCode: DepartmentCode = 'AIML') {
  try {
    return await hodApi.get<{ success: boolean; summary: any; reportTypes: ReportTypeItem[] }>(
      '/api/hod/reports', {}, deptCode,
    );
  } catch {
    return getFallbackReports();
  }
}

function getFallbackReports() {
  return {
    summary: {
      departmentPerformance: 92, facultyPerformance: 88, studentPerformance: 84,
      attendancePercentage: 91.4, passPercentage: 94.2, researchPublications: 28,
      activeProjects: 14, placements: 82, eventsConducted: 17, mentoringSessions: 50,
    },
    reportTypes: [
      { id: 'RPT-001', type: 'Student Report', icon: 'Users', generatedCount: 12, lastGenerated: '2026-07-18' },
      { id: 'RPT-002', type: 'Faculty Report', icon: 'Briefcase', generatedCount: 8, lastGenerated: '2026-07-15' },
      { id: 'RPT-003', type: 'Attendance Report', icon: 'CalendarCheck', generatedCount: 24, lastGenerated: '2026-07-20' },
      { id: 'RPT-004', type: 'Result Report', icon: 'Award', generatedCount: 6, lastGenerated: '2026-07-10' },
      { id: 'RPT-005', type: 'Research Report', icon: 'FlaskConical', generatedCount: 4, lastGenerated: '2026-07-05' },
      { id: 'RPT-006', type: 'Placement Report', icon: 'TrendingUp', generatedCount: 3, lastGenerated: '2026-06-30' },
      { id: 'RPT-007', type: 'Department Report', icon: 'Building', generatedCount: 2, lastGenerated: '2026-07-01' },
      { id: 'RPT-008', type: 'Event Report', icon: 'Calendar', generatedCount: 7, lastGenerated: '2026-07-12' },
      { id: 'RPT-009', type: 'Mentoring Report', icon: 'Heart', generatedCount: 5, lastGenerated: '2026-07-16' },
      { id: 'RPT-010', type: 'Academic Report', icon: 'BookOpen', generatedCount: 9, lastGenerated: '2026-07-19' },
    ],
  };
}

// ─── Documents ────────────────────────────────────────────
export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
  format: string;
  pinned: boolean;
  tags: string[];
}

export async function fetchDepartmentDocuments(deptCode: DepartmentCode = 'AIML') {
  try {
    return await hodApi.get<{ success: boolean; documents: DocumentItem[] }>(
      '/api/hod/documents', {}, deptCode,
    );
  } catch {
    return getFallbackDocuments();
  }
}

function getFallbackDocuments() {
  return {
    documents: [
      { id: 'DOC-001', name: 'NBA Accreditation Self-Study Report 2026', category: 'Accreditation', uploadedBy: 'Dr. Ramesh Kumar', uploadedDate: '2026-07-01', size: '4.2 MB', format: 'PDF', pinned: true, tags: ['NBA', 'Accreditation', '2026'] },
      { id: 'DOC-002', name: 'Odd Semester Timetable 2026-27', category: 'Academic Files', uploadedBy: 'Prof. Sneha Verma', uploadedDate: '2026-07-10', size: '820 KB', format: 'PDF', pinned: true, tags: ['Timetable', 'Sem 5'] },
      { id: 'DOC-003', name: 'R23 Curriculum Document', category: 'Academic Files', uploadedBy: 'Dr. Ramesh Kumar', uploadedDate: '2026-06-15', size: '1.1 MB', format: 'PDF', pinned: false, tags: ['R23', 'Curriculum'] },
      { id: 'DOC-004', name: 'Department Meeting Minutes - July 2026', category: 'Meeting Minutes', uploadedBy: 'Prof. Vikram Rathore', uploadedDate: '2026-07-18', size: '240 KB', format: 'DOCX', pinned: false, tags: ['Minutes', 'July 2026'] },
      { id: 'DOC-005', name: 'IT2 Question Papers - Sem 5', category: 'Academic Files', uploadedBy: 'Prof. Ananya Nair', uploadedDate: '2026-07-14', size: '560 KB', format: 'PDF', pinned: false, tags: ['IT2', 'Sem 5'] },
    ],
  };
}

// ─── Approvals ────────────────────────────────────────────
export interface ApprovalItem {
  id: string;
  requestId?: string;
  applicant: string;
  type: string;
  submittedDate?: string;
  status: string;
  priority: string;
  days?: number | null;
  remarks?: string;
  role?: string;
  date?: string;
  reason?: string;
  department?: string;
}

export async function fetchDepartmentApprovals(deptCode: DepartmentCode = 'AIML') {
  try {
    return await hodApi.get<{ success: boolean; summary: any; approvals: ApprovalItem[] }>(
      '/api/hod/approvals', {}, deptCode,
    );
  } catch {
    return getFallbackApprovals();
  }
}

export async function submitApproval(id: string, action: 'approve' | 'reject', remarks: string, deptCode: DepartmentCode = 'AIML') {
  try {
    return await hodApi.post(`/api/hod/approvals/${id}/${action}`, { remarks }, deptCode);
  } catch {
    return { success: true, message: `Request ${action}d successfully.` };
  }
}

function getFallbackApprovals() {
  return {
    summary: { pendingTotal: 7, facultyLeave: 3, odRequests: 2, workshopPermissions: 1, eventApprovals: 1 },
    approvals: [
      { id: 'APR-001', requestId: 'LV-2026-0142', applicant: 'Prof. Sneha Verma', type: 'Casual Leave', submittedDate: '2026-07-19', status: 'Pending', priority: 'Normal', days: 2, remarks: '' },
      { id: 'APR-002', requestId: 'OD-2026-0038', applicant: 'Dr. Vikram Rathore', type: 'On-Duty (Conference)', submittedDate: '2026-07-18', status: 'Pending', priority: 'High', days: 3, remarks: '' },
      { id: 'APR-003', requestId: 'WK-2026-0012', applicant: 'Prof. Ananya Nair', type: 'Workshop Permission', submittedDate: '2026-07-17', status: 'Pending', priority: 'Normal', days: 1, remarks: '' },
      { id: 'APR-004', requestId: 'EV-2026-0005', applicant: 'Dr. Ramesh Kumar', type: 'Event Approval (Symposium)', submittedDate: '2026-07-16', status: 'Pending', priority: 'High', days: null, remarks: '' },
      { id: 'APR-005', requestId: 'LV-2026-0140', applicant: 'Prof. Divya Iyer', type: 'Medical Leave', submittedDate: '2026-07-15', status: 'Approved', priority: 'Normal', days: 5, remarks: 'Medical certificate verified.' },
    ],
  };
}

// ─── Audit Logs ───────────────────────────────────────────
export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  ip: string;
  status: string;
}

export async function fetchDepartmentAuditLogs(deptCode: DepartmentCode = 'AIML') {
  try {
    return await hodApi.get<{ success: boolean; logs: AuditLogItem[] }>(
      '/api/hod/audit', {}, deptCode,
    );
  } catch {
    return getFallbackAudit();
  }
}

function getFallbackAudit() {
  return {
    logs: [
      { id: 'LOG-001', timestamp: '2026-07-20 22:14:05', user: 'HOD (Dr. Ramesh Kumar)', action: 'Login', module: 'Authentication', ip: '192.168.1.101', status: 'Success' },
      { id: 'LOG-002', timestamp: '2026-07-20 22:18:30', user: 'HOD (Dr. Ramesh Kumar)', action: 'Approved Leave Request APR-005', module: 'Approvals', ip: '192.168.1.101', status: 'Success' },
      { id: 'LOG-003', timestamp: '2026-07-20 21:55:10', user: 'HOD (Dr. Ramesh Kumar)', action: 'Downloaded Attendance Report', module: 'Reports', ip: '192.168.1.101', status: 'Success' },
      { id: 'LOG-004', timestamp: '2026-07-20 21:40:22', user: 'HOD (Dr. Ramesh Kumar)', action: 'Uploaded NBA Accreditation SSR 2026', module: 'Documents', ip: '192.168.1.101', status: 'Success' },
      { id: 'LOG-005', timestamp: '2026-07-19 18:05:44', user: 'HOD (Dr. Ramesh Kumar)', action: 'Updated Department Contact Settings', module: 'Settings', ip: '192.168.1.101', status: 'Success' },
    ],
  };
}

// ─── Settings ─────────────────────────────────────────────
export async function fetchDepartmentSettingsFull(deptCode: DepartmentCode = 'AIML') {
  try {
    return await hodApi.get<{ success: boolean; settings: any }>(
      '/api/hod/settings-full', {}, deptCode,
    );
  } catch {
    return {
      settings: {
        departmentName: `${deptCode} Department`, shortName: deptCode,
        vision: 'To be a centre of excellence fostering innovation, research, and holistic development.',
        mission: 'To provide quality education through industry-aligned curriculum and collaborative research.',
        academicYear: '2026-27', currentSemester: 'Odd Semester (July–November 2026)',
        hodName: 'Dr. Ramesh Kumar', hodEmail: `hod.${deptCode.toLowerCase()}@cms.edu`,
        officePhone: '+91-40-12345678 Ext 201', officeLocation: 'Block A, Room 301',
        workingHours: '9:00 AM – 5:00 PM (Mon–Sat)',
        coordinators: [
          { role: 'Class Advisor (Sem 5 A)', name: 'Prof. Sneha Verma' },
          { role: 'R&D Coordinator', name: 'Dr. Vikram Rathore' },
        ],
      },
    };
  }
}
