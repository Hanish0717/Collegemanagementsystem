import api from "@/lib/api";

export interface FacultyNotification {
  id: string;
  title: string;
  type: string;
  priority: string;
  time: string;
  unread: boolean;
  created_at: string;
}

export interface FacultyNotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
  created_at: string;
}

export async function fetchFacultyNotifications(): Promise<FacultyNotification[]> {
  const { data } = await api.get<{ success: boolean; data: FacultyNotification[] }>(
    "/api/faculty/notifications"
  );
  return data.data;
}

export async function markFacultyNotificationRead(id: string): Promise<FacultyNotification> {
  const { data } = await api.put<{ success: boolean; data: FacultyNotification }>(
    `/api/faculty/notifications/${id}/read`
  );
  return data.data;
}

export async function markAllFacultyNotificationsRead(): Promise<void> {
  await api.post("/api/faculty/notifications/mark-all-read");
}

export async function fetchFacultyNotificationSettings(): Promise<FacultyNotificationSetting[]> {
  const { data } = await api.get<{ success: boolean; data: FacultyNotificationSetting[] }>(
    "/api/faculty/notification-settings"
  );
  return data.data;
}

export async function updateFacultyNotificationSetting(
  id: string,
  enabled: boolean
): Promise<FacultyNotificationSetting> {
  const { data } = await api.put<{ success: boolean; data: FacultyNotificationSetting }>(
    `/api/faculty/notification-settings/${id}`,
    { enabled }
  );
  return data.data;
}
