import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DepartmentCode, DepartmentInfo, HODDepartmentContextType } from '../types';

const DEPARTMENT_METADATA_MAP: Record<string, DepartmentInfo> = {
  AIML: {
    code: 'AIML',
    name: 'Department of Artificial Intelligence & Machine Learning',
    shortName: 'AIML',
    headName: 'Dr. HOD AIML',
    headEmail: 'hod.aiml@college.com',
    building: 'Block B - AI Center',
    totalStudents: 480,
    totalFaculty: 24,
    totalLabs: 6,
  },
  CSE: {
    code: 'CSE',
    name: 'Department of Computer Science & Engineering',
    shortName: 'CSE',
    headName: 'Dr. Anjali Mehra',
    headEmail: 'hod.cse@college.com',
    building: 'Main Tech Block - Floor 3',
    totalStudents: 720,
    totalFaculty: 38,
    totalLabs: 10,
  },
  ECE: {
    code: 'ECE',
    name: 'Department of Electronics & Communication Engineering',
    shortName: 'ECE',
    headName: 'Dr. Ramesh Kumar',
    headEmail: 'hod.ece@college.com',
    building: 'VLSI Complex - Floor 2',
    totalStudents: 540,
    totalFaculty: 30,
    totalLabs: 8,
  },
  EEE: {
    code: 'EEE',
    name: 'Department of Electrical & Electronics Engineering',
    shortName: 'EEE',
    headName: 'Dr. Suresh Varma',
    headEmail: 'hod.eee@college.com',
    building: 'Power Systems Wing',
    totalStudents: 360,
    totalFaculty: 20,
    totalLabs: 6,
  },
  MECH: {
    code: 'MECH',
    name: 'Department of Mechanical Engineering',
    shortName: 'MECH',
    headName: 'Dr. Vikram Rathore',
    headEmail: 'hod.mech@college.com',
    building: 'Robotics Workshop Block',
    totalStudents: 420,
    totalFaculty: 22,
    totalLabs: 7,
  },
  CIVIL: {
    code: 'CIVIL',
    name: 'Department of Civil Engineering',
    shortName: 'CIVIL',
    headName: 'Dr. Rajesh Gupta',
    headEmail: 'hod.civil@college.com',
    building: 'Structures Building',
    totalStudents: 300,
    totalFaculty: 16,
    totalLabs: 5,
  },
  IT: {
    code: 'IT',
    name: 'Department of Information Technology',
    shortName: 'IT',
    headName: 'Dr. Neha Sharma',
    headEmail: 'hod.it@college.com',
    building: 'Main Tech Block - Floor 4',
    totalStudents: 360,
    totalFaculty: 18,
    totalLabs: 6,
  },
};

const HODDepartmentContext = createContext<HODDepartmentContextType | undefined>(undefined);

export function HODDepartmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [currentSemester, setSemester] = useState('Sem 5');
  const [selectedDeptCode, setSelectedDeptCode] = useState<DepartmentCode | null>(null);

  // Resolve department dynamically from logged in HOD user profile or explicit selection
  const departmentCode: DepartmentCode = useMemo(() => {
    if (selectedDeptCode) return selectedDeptCode;
    const userDept = user?.department || (user as any)?.dept || 'AIML';
    const normalized = String(userDept).toUpperCase().trim();
    return DEPARTMENT_METADATA_MAP[normalized] ? normalized : 'AIML';
  }, [user, selectedDeptCode]);

  const departmentInfo: DepartmentInfo = useMemo(() => {
    return (
      DEPARTMENT_METADATA_MAP[departmentCode] || {
        code: departmentCode,
        name: `Department of ${departmentCode}`,
        shortName: departmentCode,
        headName: user?.fullName || 'Head of Department',
        headEmail: user?.email || 'hod@college.com',
        building: 'Department Block',
        totalStudents: 400,
        totalFaculty: 20,
        totalLabs: 5,
      }
    );
  }, [departmentCode, user]);

  const setDepartmentCode = (code: DepartmentCode) => {
    const normalized = String(code).toUpperCase().trim();
    if (DEPARTMENT_METADATA_MAP[normalized]) {
      setSelectedDeptCode(normalized);
    }
  };

  // Enforce department isolation on any dataset
  const filterByDepartment = <T extends { department?: string; department_code?: string }>(
    data: T[],
  ): T[] => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => {
      const itemDept = (item.department || item.department_code || '').toUpperCase().trim();
      return !itemDept || itemDept === departmentCode.toUpperCase();
    });
  };

  // Permission Matrix enforcement for HOD role
  const hasPermission = (action: string): boolean => {
    const act = action.toLowerCase();
    const disallowed = ['create_students', 'delete_students', 'delete_faculty', 'edit_attendance', 'edit_marks', 'edit_payroll'];
    if (disallowed.includes(act)) return false;
    return true;
  };

  const value: HODDepartmentContextType = {
    departmentCode,
    departmentInfo,
    academicYear,
    currentSemester,
    setDepartmentCode,
    setAcademicYear,
    setSemester,
    filterByDepartment,
    hasPermission,
  };

  return (
    <HODDepartmentContext.Provider value={value}>
      {children}
    </HODDepartmentContext.Provider>
  );
}

export function useHODDepartment(): HODDepartmentContextType {
  const context = useContext(HODDepartmentContext);
  if (!context) {
    throw new Error('useHODDepartment must be used within a HODDepartmentProvider');
  }
  return context;
}
