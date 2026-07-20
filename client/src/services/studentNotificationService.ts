import api from '@/lib/api';

export interface StudentNotification {
  id: string;
  title: string;
  type: string;
  priority: string;
  time: string;
  unread: boolean;
  created_at: string;
}

export async function fetchStudentNotifications(): Promise<StudentNotification[]> {
  const { data } = await api.get<{ success: boolean; data: StudentNotification[] }>(
    '/api/student-module/notifications',
  );
  return data.data;
}

export async function markStudentNotificationRead(id: string): Promise<StudentNotification> {
  const { data } = await api.put<{ success: boolean; data: StudentNotification }>(
    `/api/student-module/notifications/${id}/read`,
  );
  return data.data;
}

export async function markAllStudentNotificationsRead(): Promise<void> {
  await api.post('/api/student-module/notifications/mark-all-read');
}

export async function deleteStudentNotification(id: string): Promise<void> {
  await api.delete(`/api/student-module/notifications/${id}`);
}
