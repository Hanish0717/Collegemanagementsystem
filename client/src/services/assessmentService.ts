import { api } from '@/lib/api';
import { Assessment, AssessmentStatus, CreateAssessmentDTO } from '@/types/assessment';

export async function fetchAssessments(params?: {
  drive_id?: string;
  recruiter_id?: string;
  current_status?: string;
  search?: string;
  role?: string;
}): Promise<Assessment[]> {
  try {
    const query = new URLSearchParams();
    if (params?.drive_id) query.append('drive_id', params.drive_id);
    if (params?.recruiter_id) query.append('recruiter_id', params.recruiter_id);
    if (params?.current_status) query.append('current_status', params.current_status);
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<{ success: boolean; data: Assessment[] }>(`/assessments${queryString}`);
    return res.data?.data || [];
  } catch (err) {
    console.error('fetchAssessments error:', err);
    return [];
  }
}

export async function fetchAssessmentById(id: string): Promise<Assessment | null> {
  try {
    const res = await api.get<{ success: boolean; data: Assessment }>(`/assessments/${id}`);
    return res.data?.data || null;
  } catch (err) {
    console.error('fetchAssessmentById error:', err);
    return null;
  }
}

export async function fetchAssessmentsByDrive(driveId: string): Promise<Assessment[]> {
  try {
    const res = await api.get<{ success: boolean; data: Assessment[] }>(`/assessments/drive/${driveId}`);
    return res.data?.data || [];
  } catch (err) {
    console.error('fetchAssessmentsByDrive error:', err);
    return [];
  }
}

export async function createAssessment(data: CreateAssessmentDTO): Promise<Assessment | null> {
  try {
    const res = await api.post<{ success: boolean; data: Assessment }>('/assessments', data);
    return res.data?.data || null;
  } catch (err: any) {
    console.error('createAssessment error:', err);
    const errorMsg = err?.response?.data?.message || err.message || 'Failed to create assessment.';
    throw new Error(errorMsg);
  }
}

export async function updateAssessment(id: string, data: Partial<CreateAssessmentDTO>): Promise<Assessment | null> {
  try {
    const res = await api.put<{ success: boolean; data: Assessment }>(`/assessments/${id}`, data);
    return res.data?.data || null;
  } catch (err: any) {
    console.error('updateAssessment error:', err);
    const errorMsg = err?.response?.data?.message || err.message || 'Failed to update assessment.';
    throw new Error(errorMsg);
  }
}

export async function updateAssessmentStatus(
  id: string,
  current_status: AssessmentStatus,
  comments?: string
): Promise<Assessment | null> {
  try {
    const res = await api.patch<{ success: boolean; data: Assessment }>(`/assessments/${id}/status`, {
      current_status,
      status: current_status,
      comments
    });
    return res.data?.data || null;
  } catch (err: any) {
    console.error('updateAssessmentStatus error:', err);
    const errorMsg = err?.response?.data?.message || err.message || 'Failed to update status.';
    throw new Error(errorMsg);
  }
}

export async function deleteAssessment(id: string): Promise<boolean> {
  try {
    const res = await api.delete<{ success: boolean; message?: string }>(`/assessments/${id}`);
    return res.data?.success || false;
  } catch (err: any) {
    console.error('deleteAssessment error:', err);
    const errorMsg = err?.response?.data?.message || err.message || 'Failed to delete assessment.';
    throw new Error(errorMsg);
  }
}

export async function fetchPlacementDrives(): Promise<any[]> {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>('/company-recruiter/drives');
    if (res.data?.data) return res.data.data;

    const dashRes = await api.get<{ success: boolean; data: any }>('/placement/dashboard');
    return dashRes.data?.data?.drives || [];
  } catch (err) {
    console.error('fetchPlacementDrives error:', err);
    return [
      { id: 'd1111111-1111-1111-1111-111111111111', company_name: 'TechCorp Solutions', job_title: 'Software Development Engineer', drive_date: '2026-08-05' },
      { id: 'd2222222-2222-2222-2222-222222222222', company_name: 'Innovate Systems', job_title: 'Frontend Developer', drive_date: '2026-08-10' },
      { id: 'd3333333-3333-3333-3333-333333333333', company_name: 'Global Data Inc', job_title: 'Data Analyst', drive_date: '2026-08-15' }
    ];
  }
}
