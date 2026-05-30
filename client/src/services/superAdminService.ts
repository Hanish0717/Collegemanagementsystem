import api from "../lib/api";

export interface DepartmentDistItem {
  name: string;
  value: number;
  color: string;
}

export interface SystemAnalyticsItem {
  month: string;
  users: number;
  revenue: number;
  tickets: number;
}

export interface UserActivityItem {
  day: string;
  logins: number;
  actions: number;
}

export interface ActivityLogItem {
  actor: string;
  action: string;
  target: string;
  time: string;
  type: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  type: string;
  time: string;
  unread: boolean;
}

export interface SuperAdminStats {
  totalDepartments: number;
  totalStudents: number;
  totalFaculty: number;
  totalAdmins: number;
  activeUsers: number;
  pendingApprovals: number;
  totalRevenue: number;
  departmentDistribution: DepartmentDistItem[];
  systemAnalytics: SystemAnalyticsItem[];
  userActivityData: UserActivityItem[];
  superAdminActivities: ActivityLogItem[];
  superAdminNotifications: NotificationItem[];
}

export interface Department {
  id: string;
  name: string;
  head: string;
  faculty: number;
  students: number;
  budget: string;
  status: string;
}

export interface Course {
  code: string;
  name: string;
  department: string;
  semester: string;
  credits: number;
  status: string;
}

export interface Backup {
  id: string;
  type: string;
  size: string;
  date: string;
  status: string;
  cloud: string;
}

export interface Automation {
  name: string;
  trigger: string;
  runs: number;
  success: number;
  enabled: boolean;
  frequency?: string;
  target?: string;
}

export interface AutomationLog {
  event: string;
  result: string;
  time: string;
  status: string;
}

export interface SecurityLog {
  id: string;
  user: string;
  event: string;
  ip: string;
  time: string;
  status: string;
}

// Stats & General Depts
export async function fetchSuperAdminStats(): Promise<SuperAdminStats> {
  const { data } = await api.get<{ success: boolean; data: SuperAdminStats }>(
    "/api/super-admin/dashboard/stats",
  );
  return data.data;
}

export async function fetchDepartments(): Promise<Department[]> {
  const { data } = await api.get<{ success: boolean; data: Department[] }>(
    "/api/super-admin/departments",
  );
  return data.data;
}

export async function addDepartment(dept: Omit<Department, "id"> & { id: string }): Promise<Department> {
  const { data } = await api.post<{ success: boolean; data: Department }>(
    "/api/super-admin/departments",
    dept,
  );
  return data.data;
}

export async function updateDepartment(code: string, dept: Omit<Department, "id">): Promise<Department> {
  const { data } = await api.put<{ success: boolean; data: Department }>(
    `/api/super-admin/departments/${code}`,
    dept,
  );
  return data.data;
}

export async function deleteDepartment(code: string): Promise<void> {
  await api.delete(`/api/super-admin/departments/${code}`);
}

// Courses (Subjects)
export async function fetchCourses(): Promise<Course[]> {
  const { data } = await api.get<{ success: boolean; data: Course[] }>(
    "/api/super-admin/courses",
  );
  return data.data;
}

export async function addCourse(course: Course): Promise<Course> {
  const { data } = await api.post<{ success: boolean; data: Course }>(
    "/api/super-admin/courses",
    course,
  );
  return data.data;
}

export async function updateCourse(code: string, course: Partial<Course>): Promise<Course> {
  const { data } = await api.put<{ success: boolean; data: Course }>(
    `/api/super-admin/courses/${code}`,
    course,
  );
  return data.data;
}

export async function deleteCourse(code: string): Promise<void> {
  await api.delete(`/api/super-admin/courses/${code}`);
}

// Backups
export async function fetchBackups(): Promise<{ backups: Backup[]; settings: boolean[] }> {
  const { data } = await api.get<{ success: boolean; data: { backups: Backup[]; settings: boolean[] } }>(
    "/api/super-admin/backups",
  );
  return data.data;
}

export async function createBackup(): Promise<Backup> {
  const { data } = await api.post<{ success: boolean; data: Backup }>(
    "/api/super-admin/backups",
  );
  return data.data;
}

export async function restoreBackup(id: string): Promise<string> {
  const { data } = await api.post<{ success: boolean; message: string }>(
    "/api/super-admin/backups/restore",
    { id },
  );
  return data.message;
}

export async function saveBackupSettings(settings: boolean[]): Promise<void> {
  await api.post("/api/super-admin/backups/settings", { settings });
}

// Automations
export async function fetchAutomations(): Promise<{ automations: Automation[]; logs: AutomationLog[] }> {
  const { data } = await api.get<{ success: boolean; data: { automations: Automation[]; logs: AutomationLog[] } }>(
    "/api/super-admin/automations",
  );
  return data.data;
}

export async function toggleAutomation(name: string, enabled: boolean): Promise<Automation> {
  const { data } = await api.put<{ success: boolean; data: Automation }>(
    `/api/super-admin/automations/${name}/toggle`,
    { enabled },
  );
  return data.data;
}

export async function saveAutomationSettings(name: string, frequency: string, target: string): Promise<Automation> {
  const { data } = await api.post<{ success: boolean; data: Automation }>(
    `/api/super-admin/automations/${name}/settings`,
    { frequency, target },
  );
  return data.data;
}

// Notifications
export async function fetchNotifications(): Promise<{ feed: NotificationItem[]; categories: boolean[] }> {
  const { data } = await api.get<{ success: boolean; data: { feed: NotificationItem[]; categories: boolean[] } }>(
    "/api/super-admin/notifications",
  );
  return data.data;
}

export async function toggleNotificationRead(id: string, unread: boolean): Promise<void> {
  await api.put(`/api/super-admin/notifications/${id}/read`, { unread });
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/api/super-admin/notifications/mark-all-read");
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/api/super-admin/notifications/${id}`);
}

export async function clearAllNotifications(): Promise<void> {
  await api.delete("/api/super-admin/notifications");
}

export async function saveNotificationCategories(categories: boolean[]): Promise<void> {
  await api.post("/api/super-admin/notifications/categories", { categories });
}

// Security Logs
export async function fetchSecurityLogs(): Promise<SecurityLog[]> {
  const { data } = await api.get<{ success: boolean; data: SecurityLog[] }>(
    "/api/super-admin/security-logs",
  );
  return data.data;
}

// Settings & Config
export async function fetchSystemSettings(): Promise<{ profile: any; securityOpts: boolean[]; notifOpts: boolean[] }> {
  const { data } = await api.get<{ success: boolean; data: { profile: any; securityOpts: boolean[]; notifOpts: boolean[] } }>(
    "/api/super-admin/settings",
  );
  return data.data;
}

export async function saveProfile(profile: { profileName: string; profileEmail: string; profilePhone: string; profileRole: string; profileBio: string }): Promise<void> {
  await api.post("/api/super-admin/settings/profile", profile);
}

export async function saveSecuritySettings(securityOpts: boolean[]): Promise<void> {
  await api.post("/api/super-admin/settings/security", { securityOpts });
}

export async function saveNotificationPrefs(notifOpts: boolean[]): Promise<void> {
  await api.post("/api/super-admin/settings/notifications", { notifOpts });
}

export async function updatePassword(payload: any): Promise<void> {
  await api.post("/api/super-admin/settings/password", payload);
}

export async function fetchSystemConfig(): Promise<{ toggles: { [key: string]: boolean }; institution: any }> {
  const { data } = await api.get<{ success: boolean; data: { toggles: { [key: string]: boolean }; institution: any } }>(
    "/api/super-admin/config",
  );
  return data.data;
}

export async function saveConfigToggles(toggles: { [key: string]: boolean }): Promise<void> {
  await api.post("/api/super-admin/config/toggles", { toggles });
}

export async function saveConfigInstitution(institution: any): Promise<void> {
  await api.post("/api/super-admin/config/institution", institution);
}

// Reports
export async function fetchReportsData(): Promise<any> {
  const { data } = await api.get<{ success: boolean; data: any }>(
    "/api/super-admin/reports/data",
  );
  return data.data;
}

export async function downloadReportCSV(reportName: string): Promise<Blob> {
  const type = reportName.toLowerCase().replace(" report", "").replace(" analytics", "").trim();
  const { data } = await api.get<Blob>(
    `/api/super-admin/reports/download/${type}`,
    {
      responseType: "blob",
    }
  );
  return data;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<{ success: boolean; data: User[] }>(
    "/api/super-admin/users"
  );
  return data.data;
}

export async function toggleUserStatus(id: string, isActive: boolean): Promise<User> {
  const { data } = await api.put<{ success: boolean; data: User }>(
    `/api/super-admin/users/${id}/status`,
    { isActive }
  );
  return data.data;
}



