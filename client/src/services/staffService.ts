import api from "@/lib/api";
import { FacultyUser } from "./adminService";

export interface StaffRecord {
  id: string;
  fullName: string;
  employeeId: string;
  email: string;
  phoneNumber?: string;
  department: string;
  designation: string;
  isActive: boolean;
  role: "Staff";
  createdAt: string;
}

export async function fetchStaff(): Promise<StaffRecord[]> {
  const { data } = await api.get<{ success: boolean; data: FacultyUser[] }>("/api/admin/faculty");
  return (data.data || []).map((fac) => ({
    id: fac._id,
    fullName: fac.fullName,
    employeeId: fac.employeeId,
    email: fac.email,
    phoneNumber: fac.phoneNumber,
    department: typeof fac.department === "object" && fac.department !== null ? fac.department.code : (fac.department || ""),
    designation: fac.designation,
    isActive: fac.isActive,
    role: "Staff",
    createdAt: (fac as any).createdAt || new Date().toISOString(),
  }));
}

export async function updateStaffStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  await api.put(`/api/admin/faculty/${id}`, { isActive });
}
