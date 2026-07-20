import api from '@/lib/api';

export interface StudentWithAttendance {
  id: string;
  full_name: string;
  roll_number: string;
  admission_number?: string;
  email: string;
  phone_number?: string;
  gender?: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  overall_attendance: number;
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical' | 'Detention Risk';
  recommendation: string;
  suggested_recipients: string[];
  short_attendance_subjects: any[];
}

export interface AttendanceNotificationRequest {
  id: string;
  teacher_id: string;
  teacher_name: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  department: string;
  attendance_percentage: number;
  selected_recipients: string | string[];
  message_type: string;
  status: 'Pending HOD Approval' | 'Approved' | 'Sent' | 'Rejected' | 'Failed' | 'Returned for Changes';
  remarks: string | null;
  custom_message: string;
  subject?: string;
  message?: string;
  attachments?: string | any[];
  ip_address?: string;
  short_attendance_subjects: string | any[];
  student_ids?: string | any[];
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
}

export interface AttendanceNotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchStudents(): Promise<StudentWithAttendance[]> {
  const { data } = await api.get<{ success: boolean; data: StudentWithAttendance[] }>(
    '/api/attendance/students'
  );
  return data.data || [];
}

export async function fetchRecommendations(): Promise<StudentWithAttendance[]> {
  const { data } = await api.get<{ success: boolean; data: StudentWithAttendance[] }>(
    '/api/attendance/recommendations'
  );
  return data.data || [];
}

export async function fetchSettings(): Promise<{ enabled: boolean }> {
  const { data } = await api.get<{ success: boolean; enabled: boolean }>(
    '/api/attendance/settings'
  );
  return { enabled: data.enabled };
}

export async function updateSettings(enabled: boolean): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    '/api/attendance/settings',
    { enabled }
  );
  return data;
}

export async function fetchTemplates(): Promise<AttendanceNotificationTemplate[]> {
  const { data } = await api.get<{ success: boolean; data: AttendanceNotificationTemplate[] }>(
    '/api/attendance/templates'
  );
  return data.data || [];
}

export async function updateTemplate(
  id: string,
  payload: { subject: string; body: string }
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.put<{ success: boolean; message: string }>(
    `/api/attendance/template/${id}`,
    payload
  );
  return data;
}

export async function submitNotificationRequest(payload: {
  student_id?: string;
  student_ids?: string[];
  selected_recipients: string[];
  message_type: string;
  custom_message?: string;
  subject?: string;
  message?: string;
  attachments?: any[];
}): Promise<{ success: boolean; message: string; data: AttendanceNotificationRequest }> {
  const { data } = await api.post<{ success: boolean; message: string; data: AttendanceNotificationRequest }>(
    '/api/attendance/notification/request',
    payload
  );
  return data;
}

export async function fetchPendingRequests(): Promise<AttendanceNotificationRequest[]> {
  const { data } = await api.get<{ success: boolean; data: AttendanceNotificationRequest[] }>(
    '/api/attendance/pending'
  );
  return data.data || [];
}

export async function approveRequest(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.put<{ success: boolean; message: string }>(
    `/api/attendance/approve/${id}`
  );
  return data;
}

export async function rejectRequest(id: string, remarks: string, status?: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.put<{ success: boolean; message: string }>(
    `/api/attendance/reject/${id}`,
    { remarks, status }
  );
  return data;
}

export async function fetchWorkflowHistory(): Promise<AttendanceNotificationRequest[]> {
  const { data } = await api.get<{ success: boolean; data: AttendanceNotificationRequest[] }>(
    '/api/attendance/history'
  );
  return data.data || [];
}

export async function fetchApprovedRequests(): Promise<AttendanceNotificationRequest[]> {
  const { data } = await api.get<{ success: boolean; data: AttendanceNotificationRequest[] }>(
    '/api/attendance/history?requests=true'
  );
  return (data.data || []).filter(r => r.status === 'Approved');
}

export async function fetchPendingByTeacher(): Promise<AttendanceNotificationRequest[]> {
  const { data } = await api.get<{ success: boolean; data: AttendanceNotificationRequest[] }>(
    '/api/attendance/pending'
  );
  return data.data || [];
}

export async function fetchSentHistory(): Promise<AttendanceNotificationRequest[]> {
  const { data } = await api.get<{ success: boolean; data: AttendanceNotificationRequest[] }>(
    '/api/attendance/history'
  );
  return data.data || [];
}

export async function sendApprovedNotification(payload: {
  id: string;
  recipients?: string[];
  customSubject?: string;
  customBody?: string;
  studentIds?: string[];
}): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    '/api/attendance/notification/send',
    payload
  );
  return data;
}

