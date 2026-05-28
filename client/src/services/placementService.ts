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
}

export async function fetchPlacementData(): Promise<PlacementDashboardData> {
  const { data } = await api.get<{ success: boolean; data: PlacementDashboardData }>("/api/placement/dashboard");
  return data.data;
}
