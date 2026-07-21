import { ReactNode, ComponentType } from 'react';

export type DepartmentCode = 'CSE' | 'AIML' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'IT' | string;

export interface DepartmentInfo {
  code: DepartmentCode;
  name: string;
  shortName: string;
  headName: string;
  headEmail: string;
  building: string;
  totalStudents: number;
  totalFaculty: number;
  totalLabs: number;
}

export interface HODDepartmentContextType {
  departmentCode: DepartmentCode;
  departmentInfo: DepartmentInfo;
  academicYear: string;
  currentSemester: string;
  setAcademicYear: (year: string) => void;
  setSemester: (sem: string) => void;
  filterByDepartment: <T extends { department?: string; department_code?: string }>(data: T[]) => T[];
  hasPermission: (action: string) => boolean;
}

export interface HODNavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | number;
  description?: string;
}

export interface HODAuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: string;
  category: 'Student' | 'Faculty' | 'Academic' | 'Attendance' | 'Exam' | 'System';
  details: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Failure';
}

export interface DepartmentKPI {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: ComponentType<{ className?: string }>;
  theme?: 'blue' | 'green' | 'purple' | 'amber' | 'emerald' | 'rose';
  gradient?: string;
}

export interface HODFilterState {
  search: string;
  department: DepartmentCode;
  academicYear: string;
  semester: string;
  section: string;
  batch: string;
  gender: string;
  status: string;
  facultyId: string;
  dateRange: { start: string; end: string };
  /** Filter by student admission category */
  admissionType: 'All' | 'Scholarship' | 'Management';
  /** Filter by exam fee payment defaulters — 'none' means no filter active */
  feeDefaulterFor: 'none' | 'mid1' | 'mid2' | 'labs' | 'semester';
}

