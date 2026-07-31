export interface CompanyRecruiterItem {
  id: string;
  company_id: string;
  company_name: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  permissions: string[];
  status: 'active' | 'disabled';
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
  status?: 'active' | 'disabled';
  custom_temp_password?: string;
  assigned_drive_ids?: string[];
}

export interface SubmittedResultReviewItem {
  id: string;
  driveId: string;
  driveTitle: string;
  companyId: string;
  companyName: string;
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  uploadedAt: string;
  fileName: string;
  candidateCount: number;
  passCount: number;
  failCount: number;
  status: 'Pending TPO Review' | 'Approved' | 'Rejected' | 'Correction Requested' | 'Approved & Locked';
  isLocked: boolean;
  isSharedWithRecruiter: boolean;
  nextStage?: string;
  tpoRemarks?: string;
  candidates: Array<{
    studentId: string;
    studentName: string;
    rollNumber: string;
    department: string;
    score: number;
    status: 'Pass' | 'Fail' | 'Pending';
    stage?: string;
    round?: string;
    remarks?: string;
  }>;
}

export interface DecisionOverridePayload {
  studentId?: string;
  studentName?: string;
  rollNumber?: string;
  department?: string;
  actionType: 'STATUS_CHANGE' | 'ADD_STUDENT' | 'REMOVE_STUDENT';
  previousStatus?: string;
  newStatus?: string;
  score?: number;
  reason: string;
  remarks: string;
  approvalDate: string;
  officerName: string;
}

export interface SystemAuditLogEntry {
  id: string;
  timestamp: string;
  actorType: 'RECRUITER' | 'TPO' | 'STUDENT' | 'SYSTEM';
  action: string;
  ipAddress: string;
  officer?: string | null;
  recruiter?: string | null;
  oldValue: string;
  newValue: string;
  reason: string;
}
