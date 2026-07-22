import { hodApi } from '../api/hodApi';
import { DepartmentCode } from '../types';

export interface DepartmentFaculty {
  id: string;
  photoUrl?: string;
  empId: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  specialization: string;
  experience: string;
  subjectsAssigned: string;
  classesAssigned: string;
  attendance: number;
  publications: number;
  feedbackScore: number;
  status: 'Active' | 'On Leave' | 'Retired' | string;
  empType: 'Full-time' | 'Visiting' | 'Guest' | string;
  joiningDate?: string;
  email?: string;
  phone?: string;
  officeRoom?: string;
}

function mapFaculty(f: any): DepartmentFaculty {
  return {
    id: f.id,
    photoUrl: f.photo_url || f.photoUrl || '',
    empId: f.employee_id || f.empId || '',
    name: f.full_name || f.name || 'Faculty Demo',
    designation: f.designation || 'Associate Professor',
    department: f.department || '',
    qualification: f.qualification || 'M.Tech, Ph.D',
    specialization: f.specialization || 'Computer Science',
    experience: f.experience || '8 Years',
    subjectsAssigned: f.subjects_assigned || f.subjectsAssigned || 'Distributed Systems',
    classesAssigned: f.classes_assigned || f.classesAssigned || 'Sem 5 Sec A',
    attendance: f.attendance_percentage || f.attendance || 95,
    publications: f.publications || 4,
    feedbackScore: f.feedback_score || f.feedbackScore || 4.5,
    status: f.status || 'Active',
    empType: f.employment_type || f.empType || 'Full-time',
    joiningDate: f.joining_date || f.joiningDate,
    email: f.email || '',
    phone: f.phone_number || f.phone || '',
    officeRoom: f.office_room || f.officeRoom || 'Tech Block 101'
  };
}

export async function fetchDepartmentFaculty(deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{ success: boolean; faculty: any[] }>(
      '/api/hod/faculty',
      {},
      deptCode
    );
    const list = data.faculty || [];
    return list.map(mapFaculty);
  } catch (err) {
    console.warn('Backend faculty fetch fallback to isolated dataset');
    return getFallbackFaculty(deptCode);
  }
}

export async function fetchDepartmentFacultyById(facultyId: string, deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{ success: boolean; faculty: any }>(
      `/api/hod/faculty/${facultyId}`,
      {},
      deptCode
    );
    return mapFaculty(data.faculty);
  } catch (err) {
    const fallback = getFallbackFaculty(deptCode);
    return fallback.find((f) => f.id === facultyId) || fallback[0];
  }
}

function getFallbackFaculty(deptCode: DepartmentCode): DepartmentFaculty[] {
  const code = (deptCode || 'AIML').toUpperCase();

  return [
    { id: 'FAC-001', photoUrl: '', empId: 'EMP-AIML-101', name: 'Dr. Ramesh Kumar', designation: 'Professor & Head', department: code, qualification: 'Ph.D in AI & Vision', specialization: 'Deep Learning & Neural Networks', experience: '14 Years', subjectsAssigned: 'DL & Neural Networks (AIML501)', classesAssigned: 'Sem 5 Sec A, Sem 7 Sec A', attendance: 98, publications: 18, feedbackScore: 4.9, status: 'Active', empType: 'Full-time', email: 'ramesh.kumar@college.com', phone: '+91 98765 11111', officeRoom: 'Tech Block 304' },
    { id: 'FAC-002', photoUrl: '', empId: 'EMP-AIML-102', name: 'Prof. Sneha Verma', designation: 'Associate Professor', department: code, qualification: 'Ph.D in NLP', specialization: 'Natural Language Processing', experience: '9 Years', subjectsAssigned: 'NLP & Computational Linguistics', classesAssigned: 'Sem 5 Sec B', attendance: 95, publications: 11, feedbackScore: 4.7, status: 'Active', empType: 'Full-time', email: 'sneha.verma@college.com', phone: '+91 98765 11112', officeRoom: 'Tech Block 305' },
    { id: 'FAC-003', photoUrl: '', empId: 'EMP-AIML-103', name: 'Prof. Vikram Rathore', designation: 'Assistant Professor', department: code, qualification: 'M.Tech in ML', specialization: 'Computer Vision & Robotics', experience: '6 Years', subjectsAssigned: 'Computer Vision (AIML503)', classesAssigned: 'Sem 5 Sec C', attendance: 92, publications: 6, feedbackScore: 4.6, status: 'Active', empType: 'Full-time', email: 'vikram.rathore@college.com', phone: '+91 98765 11113', officeRoom: 'Tech Block 306' },
    { id: 'FAC-004', photoUrl: '', empId: 'EMP-AIML-104', name: 'Dr. Ananya Roy', designation: 'Assistant Professor', department: code, qualification: 'Ph.D in Reinforcement Learning', specialization: 'Reinforcement Learning', experience: '5 Years', subjectsAssigned: 'Reinforcement Learning (AIML701)', classesAssigned: 'Sem 7 Sec B', attendance: 96, publications: 9, feedbackScore: 4.8, status: 'Active', empType: 'Full-time', email: 'ananya.roy@college.com', phone: '+91 98765 11114', officeRoom: 'Tech Block 307' },
  ];
}
