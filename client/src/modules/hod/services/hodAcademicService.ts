import { hodApi } from '../api/hodApi';
import { DepartmentCode } from '../types';

export interface DepartmentSubject {
  code: string;
  name: string;
  credits: number;
  sem: number;
  year: number;
  section: string;
  type: 'Theory' | 'Lab' | string;
  faculty: string;
  coordinator: string;
  status: string;
}

export interface LessonPlanItem {
  id: string;
  subject: string;
  faculty: string;
  sem: number;
  totalUnits: number;
  completedUnits: number;
  pendingUnits: number;
  completionPct: number;
  status: 'Approved' | 'Pending' | 'Rejected' | string;
}

export async function fetchDepartmentAcademics(deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{
      success: boolean;
      summary: any;
      subjects: DepartmentSubject[];
      lessonPlans: LessonPlanItem[];
    }>('/api/hod/academics', {}, deptCode);
    return data;
  } catch (err) {
    console.warn('Backend academics fetch fallback to isolated dataset');
    return getFallbackAcademics(deptCode);
  }
}

export async function approveDepartmentLessonPlan(lessonPlanId: string, decision: 'approved' | 'rejected', deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.post('/api/hod/lesson-plan/approve', { lessonPlanId, decision }, deptCode);
    return data;
  } catch (err) {
    return { success: true, message: `Lesson plan ${lessonPlanId} has been ${decision}.` };
  }
}

function getFallbackAcademics(deptCode: DepartmentCode) {
  const code = (deptCode || 'AIML').toUpperCase();

  return {
    summary: {
      totalSubjects: 16,
      activeSubjects: 14,
      facultyAssigned: 12,
      coursesRunning: 8,
      pendingLessonPlans: 3,
      courseFilesUploaded: 12,
      labCourses: 6,
      theoryCourses: 10,
      upcomingExams: 2,
      upcomingEvents: 4,
      avgStudentPerformance: 88.5,
      avgAttendance: 91.2,
    },
    subjects: [
      { code: `${code}501`, name: 'Deep Learning & Neural Networks', credits: 4, sem: 5, year: 3, section: 'A', type: 'Theory', faculty: 'Dr. Ramesh Kumar', coordinator: 'Dr. Ramesh Kumar', status: 'Active' },
      { code: `${code}502`, name: 'Natural Language Processing', credits: 3, sem: 5, year: 3, section: 'B', type: 'Theory', faculty: 'Prof. Sneha Verma', coordinator: 'Prof. Sneha Verma', status: 'Active' },
      { code: `${code}503L`, name: 'Computer Vision & Robotics Lab', credits: 2, sem: 5, year: 3, section: 'C', type: 'Lab', faculty: 'Prof. Vikram Rathore', coordinator: 'Prof. Vikram Rathore', status: 'Active' },
      { code: `${code}701`, name: 'Reinforcement Learning & AI Agents', credits: 3, sem: 7, year: 4, section: 'A', type: 'Theory', faculty: 'Dr. Ananya Roy', coordinator: 'Dr. Ananya Roy', status: 'Active' },
    ],
    lessonPlans: [
      { id: 'LP-101', subject: `${code}501 — Deep Learning`, faculty: 'Dr. Ramesh Kumar', sem: 5, totalUnits: 5, completedUnits: 4, pendingUnits: 1, completionPct: 80, status: 'Approved' },
      { id: 'LP-102', subject: `${code}502 — NLP`, faculty: 'Prof. Sneha Verma', sem: 5, totalUnits: 5, completedUnits: 2, pendingUnits: 3, completionPct: 40, status: 'Pending' },
      { id: 'LP-103', subject: `${code}503L — Computer Vision Lab`, faculty: 'Prof. Vikram Rathore', sem: 5, totalUnits: 5, completedUnits: 3, pendingUnits: 2, completionPct: 60, status: 'Pending' },
    ],
  };
}
