import api from "@/lib/api";

export interface StudentNotification {
  id: string;
  title: string;
  type: string;
  priority: string;
  time: string;
  unread: boolean;
  created_at: string;
}

function getNotificationEndpoint(role: string | null) {
  switch (role) {
    case "super_admin":
    case "super-admin":
      return {
        get: "/api/super-admin/notifications",
        read: (id: string) => `/api/super-admin/notifications/${id}/read`,
        readAll: "/api/super-admin/notifications/mark-all-read",
        delete: (id: string) => `/api/super-admin/notifications/${id}`
      };
    case "admin":
      return {
        get: "/api/admin/notifications",
        read: (id: string) => `/api/admin/notifications/${id}/read`,
        readAll: "/api/admin/notifications/mark-all-read",
        delete: null
      };
    case "faculty":
    case "lms":
      return {
        get: "/api/faculty/notifications",
        read: (id: string) => `/api/faculty/notifications/${id}/read`,
        readAll: "/api/faculty/notifications/mark-all-read",
        delete: null
      };
    case "hod":
      return {
        get: "/api/hod/notifications",
        read: (id: string) => `/api/hod/notifications/${id}/read`,
        readAll: "/api/hod/notifications/mark-all-read",
        delete: null
      };
    case "librarian":
      return {
        get: "/api/library/notifications",
        read: (id: string) => `/api/library/notifications/${id}/read`,
        readAll: null,
        delete: null
      };
    case "student":
    case "parent":
    case "warden":
    case "hostel-warden":
      return {
        get: "/api/student-module/notifications",
        read: (id: string) => `/api/student-module/notifications/${id}/read`,
        readAll: "/api/student-module/notifications/mark-all-read",
        delete: (id: string) => `/api/student-module/notifications/${id}`
      };
    default:
      return {
        get: null,
        read: null,
        readAll: null,
        delete: null
      };
  }
}

function getActiveRole(): string | null {
  return localStorage.getItem("campusly.role");
}

export async function fetchStudentNotifications(): Promise<StudentNotification[]> {
  const role = getActiveRole();
  const endpoints = getNotificationEndpoint(role);
  if (!endpoints.get) return [];

  try {
    const { data } = await api.get<{ success: boolean; data: any[] }>(endpoints.get);
    const rawList = data.data || [];
    return rawList.map((n) => ({
      id: n.id || String(Math.random()),
      title: n.title || "New system alert",
      type: n.type || n.category || "General",
      priority: n.priority || "Medium",
      time: n.time || "Just now",
      unread: n.unread !== undefined ? n.unread : true,
      created_at: n.created_at || new Date().toISOString()
    }));
  } catch (err) {
    console.warn(`Failed to fetch notifications for role ${role}, returning empty fallback.`);
    return [];
  }
}

export async function markStudentNotificationRead(id: string): Promise<StudentNotification> {
  const role = getActiveRole();
  const endpoints = getNotificationEndpoint(role);
  if (!endpoints.read) {
    return { id, title: "", type: "", priority: "", time: "", unread: false, created_at: "" };
  }

  try {
    const { data } = await api.put<{ success: boolean; data: any }>(endpoints.read(id));
    return data.data;
  } catch (err) {
    console.warn(`Failed to mark notification ${id} as read for role ${role}`);
    return { id, title: "", type: "", priority: "", time: "", unread: false, created_at: "" };
  }
}

export async function markAllStudentNotificationsRead(): Promise<void> {
  const role = getActiveRole();
  const endpoints = getNotificationEndpoint(role);
  if (!endpoints.readAll) return;

  try {
    await api.post(endpoints.readAll);
  } catch (err) {
    console.warn(`Failed to mark all notifications as read for role ${role}`);
  }
}

export async function deleteStudentNotification(id: string): Promise<void> {
  const role = getActiveRole();
  const endpoints = getNotificationEndpoint(role);
  if (!endpoints.delete) return;

  try {
    await api.delete(endpoints.delete(id));
  } catch (err) {
    console.warn(`Failed to delete notification ${id} for role ${role}`);
  }
}
