import api from '../lib/api';

export interface DashboardStats {
  totalUsers?: number;
  totalStudents?: number;
  totalFaculty?: number;
  stats: Array<{ label: string; value: string; change: string; trend?: string; color?: string }>;
  departmentData: Array<{ name: string; value: number; color: string }>;
  attendanceData?: Array<{ day: string; present: number; absent: number }>;
  performanceData?: Array<{ month: string; score: number }>;
  events?: Array<{
    title: string;
    date: string;
    category: string;
    attendees: number;
    color: string;
  }>;
  activities?: Array<{ user?: string; actor?: string; action: string; target: string; time: string; type?: string }>;
}

export async function fetchDashboardData(): Promise<DashboardStats> {
  const { data } = await api.get<{ success: boolean; data: DashboardStats }>(
    '/api/dashboard/stats',
  );
  return data.data;
}
