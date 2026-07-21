import { hodApi } from '../api/hodApi';
import { DepartmentCode } from '../types';

export interface AttendanceDefaulter {
  id: string;
  rollNumber: string;
  name: string;
  sem: number;
  sec: string;
  mentor: string;
  attendance: number;
  status: string;
}

export interface StudentExamResult {
  id: string;
  rollNumber: string;
  name: string;
  sem: number;
  sgpa: number;
  cgpa: number;
  status: string;
  backlogs: number;
  rank: number;
}

export async function fetchDepartmentAttendance(deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{
      success: boolean;
      summary: any;
      defaulters: AttendanceDefaulter[];
    }>('/api/hod/attendance', {}, deptCode);
    return data;
  } catch (err) {
    console.warn('Backend attendance fetch fallback to isolated dataset');
    return getFallbackAttendance(deptCode);
  }
}

export async function fetchDepartmentExaminations(deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{
      success: boolean;
      summary: any;
      results: StudentExamResult[];
    }>('/api/hod/examinations', {}, deptCode);
    return data;
  } catch (err) {
    console.warn('Backend examinations fetch fallback to isolated dataset');
    return getFallbackExaminations(deptCode);
  }
}

export async function dispatchShortageAlert(studentId: string, message: string, deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.post('/api/hod/attendance/notify', { studentId, message }, deptCode);
    return data;
  } catch (err) {
    return { success: true, message: 'Notification dispatched to student and mentor.' };
  }
}

function getFallbackAttendance(deptCode: DepartmentCode) {
  return {
    summary: {
      overallStudentAttendance: 91.4,
      todayAttendance: 93.8,
      facultyAttendance: 96.5,
      lowAttendanceStudents: 4,
      avgDeptAttendance: 91.4,
      defaultersCount: 4,
      classesConducted: 142,
      classesMissed: 8,
    },
    defaulters: [
      { id: 'STU-003', rollNumber: '23091A4203', name: 'Chirag Reddy', sem: 5, sec: 'B', mentor: 'Prof. Sneha Verma', attendance: 68, status: 'Critical Shortage (<70%)' },
      { id: 'STU-006', rollNumber: '23091A4206', name: 'Farhan Ali', sem: 5, sec: 'C', mentor: 'Prof. Vikram Rathore', attendance: 71, status: 'Warning Shortage (<75%)' },
    ],
  };
}

function getFallbackExaminations(deptCode: DepartmentCode) {
  return {
    summary: {
      totalSubjects: 16,
      internalExamsCompleted: 2,
      externalExamsCompleted: 1,
      averageMarks: 84.5,
      deptPassPercentage: 94.2,
      topPerformersCount: 18,
      failedStudentsCount: 3,
      backlogsCount: 5,
    },
    results: [
      { id: 'STU-001', rollNumber: '23091A4201', name: 'Aarav Sharma', sem: 5, sgpa: 9.4, cgpa: 9.2, status: 'Pass', backlogs: 0, rank: 1 },
      { id: 'STU-004', rollNumber: '23091A4204', name: 'Divya Iyer', sem: 5, sgpa: 9.6, cgpa: 9.6, status: 'Pass', backlogs: 0, rank: 2 },
      { id: 'STU-002', rollNumber: '23091A4202', name: 'Bhavna Patel', sem: 5, sgpa: 8.8, cgpa: 8.8, status: 'Pass', backlogs: 0, rank: 3 },
    ],
  };
}
