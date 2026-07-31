import api from '@/lib/api';
import type {
  CompanyRecruiterItem,
  CreateRecruiterPayload,
  SubmittedResultReviewItem,
  DecisionOverridePayload,
  SystemAuditLogEntry,
} from '../types';

export async function fetchRecruiters(): Promise<CompanyRecruiterItem[]> {
  const { data } = await api.get<{ success: boolean; data: CompanyRecruiterItem[] }>(
    '/api/company/placement/recruiters',
  );
  return data.data || [];
}

export async function createCompanyRecruiter(
  payload: CreateRecruiterPayload,
): Promise<{ success: boolean; data: CompanyRecruiterItem; temporaryPassword?: string }> {
  const { data } = await api.post('/api/company/placement/recruiters', payload);
  return data;
}

export async function updateCompanyRecruiter(
  id: string,
  payload: Partial<CreateRecruiterPayload>,
): Promise<CompanyRecruiterItem> {
  const { data } = await api.put<{ success: boolean; data: CompanyRecruiterItem }>(
    `/api/company/placement/recruiters/${id}`,
    payload,
  );
  return data.data;
}

export async function toggleRecruiterStatus(
  id: string,
  status: 'active' | 'disabled',
): Promise<CompanyRecruiterItem> {
  const { data } = await api.put<{ success: boolean; data: CompanyRecruiterItem }>(
    `/api/company/placement/recruiters/${id}/status`,
    { status },
  );
  return data.data;
}

export async function resetRecruiterPassword(
  id: string,
): Promise<{ success: boolean; temporaryPassword?: string; message: string }> {
  const { data } = await api.post(`/api/company/placement/recruiters/${id}/reset-password`);
  return data;
}

export async function assignDrivesToRecruiter(
  id: string,
  assigned_drive_ids: string[],
): Promise<void> {
  await api.put(`/api/company/placement/recruiters/${id}/assign-drives`, { assigned_drive_ids });
}

export async function fetchSubmittedResultsForReview(): Promise<SubmittedResultReviewItem[]> {
  const { data } = await api.get<{ success: boolean; data: SubmittedResultReviewItem[] }>(
    '/api/company/placement/results-review',
  );
  return data.data || [];
}

export async function updateResultReviewStatus(
  id: string,
  status: 'Approved' | 'Rejected' | 'Correction Requested',
  remarks?: string,
): Promise<SubmittedResultReviewItem> {
  const { data } = await api.put<{ success: boolean; data: SubmittedResultReviewItem }>(
    `/api/company/placement/results-review/${id}/status`,
    { status, remarks },
  );
  return data.data;
}

export async function overrideCandidateDecision(
  id: string,
  payload: DecisionOverridePayload,
): Promise<any> {
  const { data } = await api.post(`/api/company/placement/results-review/${id}/override`, payload);
  return data;
}

export async function fetchResultOverrides(id: string): Promise<any[]> {
  const { data } = await api.get<{ success: boolean; data: any[] }>(
    `/api/company/placement/results-review/${id}/overrides`,
  );
  return data.data || [];
}

export async function lockAndShareResults(id: string): Promise<any> {
  const { data } = await api.post(`/api/company/placement/results-review/${id}/lock-and-share`);
  return data;
}

export async function fetchSystemAuditLogs(): Promise<SystemAuditLogEntry[]> {
  const { data } = await api.get<{ success: boolean; data: SystemAuditLogEntry[] }>(
    '/api/company/placement/audit-logs',
  );
  return data.data || [];
}

export async function fetchStudentPlacementHistory(studentId?: string): Promise<any[]> {
  const url = studentId
    ? `/api/company/placement/student-history/${studentId}`
    : '/api/company/placement/student-history';
  const { data } = await api.get<{ success: boolean; data: any[] }>(url);
  return data.data || [];
}
