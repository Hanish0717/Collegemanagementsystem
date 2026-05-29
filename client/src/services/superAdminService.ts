import api from "../lib/api";

export interface SuperAdminStats {
  totalStudents: number;
  totalFaculty: number;
  totalAdmins: number;
  activeUsers: number;
  pendingApprovals: number;
  totalRevenue: number;
}

export async function fetchSuperAdminStats(): Promise<SuperAdminStats> {
  const { data } = await api.get<{ success: boolean; data: SuperAdminStats }>(
    "/api/super-admin/dashboard/stats",
  );
  return data.data;
}
