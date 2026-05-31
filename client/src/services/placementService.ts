import api from "../lib/api";

export interface CompanyItem {
  id: string;
  name: string;
  industry: string;
  hrContact: string;
  email: string;
  phone: string;
  package: string;
  hiringStatus: string;
  previousYearHires: number;
}

export interface DriveItem {
  id: string;
  company: string;
  role: string;
  date: string;
  venue: string;
  applicationDeadline: string;
  status: string;
  studentCount: number;
  rounds: number;
}

export interface PlacementDashboardData {
  stats: Array<{ label: string; value: string; change: string; icon: string }>;
  drives: DriveItem[];
  companies: CompanyItem[];
  placementTrendData: Array<{ month: string; placed: number; applied: number; shortlisted: number; offers: number }>;
  departmentPlacementData: Array<{ name: string; value: number; color: string }>;
  packageAnalyticsData: Array<{ range: string; count: number; color: string }>;
  applications: Array<{ id: string; studentName: string; studentId: string; company: string; role: string; appliedDate: string; status: string; score: number; round: number }>;
  offers: Array<{ id: string; studentName: string; company: string; role: string; package: string; joiningDate: string; status: string; offerDate: string }>;
  interviews: Array<{ id: string; studentName: string; company: string; round: number; date: string; time: string; mode: string; venue: string; panelists: string[]; status: string }>;
  placementNotifications: Array<{ id: string; title: string; time: string; type: string; unread: boolean }>;
}

export async function fetchPlacementData(): Promise<PlacementDashboardData> {
  const { data } = await api.get<{ success: boolean; data: PlacementDashboardData }>(
    "/api/placement/dashboard",
  );
  return data.data;
}

export async function createCompany(payload: Omit<CompanyItem, "id">): Promise<CompanyItem> {
  const { data } = await api.post<{ success: boolean; data: CompanyItem }>(
    "/api/placement/companies",
    payload,
  );
  return data.data;
}

export async function updateCompany(id: string, payload: Partial<CompanyItem>): Promise<CompanyItem> {
  const { data } = await api.put<{ success: boolean; data: CompanyItem }>(
    `/api/placement/companies/${id}`,
    payload,
  );
  return data.data;
}

export async function createDrive(payload: Omit<DriveItem, "id" | "studentCount" | "rounds">): Promise<DriveItem> {
  const { data } = await api.post<{ success: boolean; data: DriveItem }>(
    "/api/placement/drives",
    payload,
  );
  return data.data;
}

export async function updateDrive(id: string, payload: Partial<DriveItem>): Promise<DriveItem> {
  const { data } = await api.put<{ success: boolean; data: DriveItem }>(
    `/api/placement/drives/${id}`,
    payload,
  );
  return data.data;
}
