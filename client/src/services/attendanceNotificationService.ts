import api from '@/lib/api';

export interface AttendanceNotificationLog {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  department: string;
  attendance_percentage: number;
  notification_type: string;
  recipient_role: string;
  recipient_email: string;
  status: 'Sent' | 'Failed';
  error_details: string | null;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  warning: number;
  critical: number;
  detention: number;
  failed: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentLogs: AttendanceNotificationLog[];
}

export interface HistoryData {
  logs: AttendanceNotificationLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface HistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  slab?: string;
  status?: string;
}

export async function fetchNotificationDashboard(): Promise<DashboardData> {
  const { data } = await api.get<{ success: boolean; data: DashboardData }>(
    '/api/attendance-notifications/dashboard'
  );
  return data.data;
}

export async function fetchNotificationHistory(params: HistoryParams): Promise<HistoryData> {
  const { data } = await api.get<{ success: boolean; data: HistoryData }>(
    '/api/attendance-notifications/history',
    { params }
  );
  return data.data;
}

export async function triggerManualNotifications(): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    '/api/attendance-notifications/trigger'
  );
  return data;
}
