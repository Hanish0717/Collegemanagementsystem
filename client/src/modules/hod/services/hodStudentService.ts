import { hodApi } from '../api/hodApi';
import { DepartmentCode } from '../types';

export interface FeeStatus {
  mid1Paid: boolean;
  mid2Paid: boolean;
  labsPaid: boolean;
  semesterPaid: boolean;
}

export interface DepartmentStudent {
  id: string;
  photoUrl?: string;
  rollNumber: string;
  regNumber: string;
  name: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  batch: string;
  email: string;
  phone: string;
  mentor: string;
  attendance: number;
  cgpa: number;
  placementEligible: boolean;
  placementStatus: string;
  status: 'Active' | 'Inactive' | 'Warning' | 'Detained' | 'Graduated' | string;
  gender?: string;
  category?: string;
  hosteller?: boolean;
  /** Whether the student is on scholarship or pays their own fee (management quota) */
  admissionType: 'Scholarship' | 'Management';
  /** Type of scholarship — only applicable when admissionType is 'Scholarship' */
  scholarshipType?: 'Merit' | 'EBC' | 'State Government' | 'Central Government' | 'NRI' | string;
  /** Payment status for each exam event in the current semester */
  feeStatus: FeeStatus;
}

function mapStudent(s: any): DepartmentStudent {
  return {
    id: s.id,
    photoUrl: s.photo_url || s.photoUrl || '',
    rollNumber: s.roll_number || s.rollNumber || '',
    regNumber: s.reg_number || s.regNumber || '',
    name: s.full_name || s.name || 'Student Demo',
    department: s.department || '',
    year: s.year || (s.current_semester ? Math.ceil(s.current_semester / 2) : 3),
    semester: s.semester || s.current_semester || 5,
    section: s.section || 'A',
    batch: s.batch || '2023-2027',
    email: s.email || '',
    phone: s.phone_number || s.phone || '',
    mentor: s.mentor || 'Dr. Ramesh Kumar',
    attendance: s.attendance_percentage || s.attendance || 85,
    cgpa: s.cgpa || 8.0,
    placementEligible: s.placement_eligible !== undefined ? s.placement_eligible : true,
    placementStatus: s.placement_status || s.placementStatus || 'Eligible',
    status: s.status || 'Active',
    gender: s.gender,
    category: s.category,
    hosteller: s.hosteller !== undefined ? s.hosteller : (s.hostel_allocation !== undefined),
    admissionType: s.admission_type || s.admissionType || 'Management',
    scholarshipType: s.scholarship_type || s.scholarshipType,
    feeStatus: s.fee_status || s.feeStatus || { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: true }
  };
}

export async function fetchDepartmentStudents(deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{ success: boolean; students: any[] }>(
      '/api/hod/students',
      {},
      deptCode
    );
    const list = data.students || [];
    return list.map(mapStudent);
  } catch (err) {
    console.warn('Backend student fetch using persistent store');
  }
  return hodStore.getStudents(deptCode);
}

export async function fetchDepartmentStudentById(studentId: string, deptCode: DepartmentCode = 'AIML') {
  try {
    const data = await hodApi.get<{ success: boolean; student: any }>(
      `/api/hod/students/${studentId}`,
      {},
      deptCode
    );
    return mapStudent(data.student);
  } catch (err) {
    console.warn('Backend student fetch by id using persistent store');
  }
  const students = hodStore.getStudents(deptCode);
  return students.find((s) => s.id === studentId) || students[0];
}

function getFallbackStudents(deptCode: DepartmentCode): DepartmentStudent[] {
  const code = (deptCode || 'AIML').toUpperCase();

  return [
    {
      id: 'STU-001', photoUrl: '', rollNumber: '23091A4201', regNumber: 'REG-2023-4201',
      name: 'Aarav Sharma', department: code, year: 3, semester: 5, section: 'A', batch: '2023-2027',
      email: 'aarav.sharma@college.com', phone: '+91 98765 43210', mentor: 'Dr. Ramesh Kumar',
      attendance: 94, cgpa: 9.2, placementEligible: true, placementStatus: 'Placed (Microsoft)',
      status: 'Active', gender: 'Male', category: 'General', hosteller: false,
      admissionType: 'Scholarship', scholarshipType: 'Merit',
      feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: true },
    },
    {
      id: 'STU-002', photoUrl: '', rollNumber: '23091A4202', regNumber: 'REG-2023-4202',
      name: 'Bhavna Patel', department: code, year: 3, semester: 5, section: 'A', batch: '2023-2027',
      email: 'bhavna.patel@college.com', phone: '+91 98765 43211', mentor: 'Dr. Ramesh Kumar',
      attendance: 89, cgpa: 8.8, placementEligible: true, placementStatus: 'Eligible',
      status: 'Active', gender: 'Female', category: 'OBC', hosteller: true,
      admissionType: 'Management',
      feeStatus: { mid1Paid: true, mid2Paid: false, labsPaid: true, semesterPaid: false },
    },
    {
      id: 'STU-003', photoUrl: '', rollNumber: '23091A4203', regNumber: 'REG-2023-4203',
      name: 'Chirag Reddy', department: code, year: 3, semester: 5, section: 'B', batch: '2023-2027',
      email: 'chirag.reddy@college.com', phone: '+91 98765 43212', mentor: 'Prof. Sneha Verma',
      attendance: 68, cgpa: 7.4, placementEligible: false, placementStatus: 'Ineligible (Attendance)',
      status: 'Warning', gender: 'Male', category: 'SC', hosteller: false,
      admissionType: 'Scholarship', scholarshipType: 'State Government',
      feeStatus: { mid1Paid: false, mid2Paid: false, labsPaid: false, semesterPaid: false },
    },
    {
      id: 'STU-004', photoUrl: '', rollNumber: '23091A4204', regNumber: 'REG-2023-4204',
      name: 'Divya Iyer', department: code, year: 3, semester: 5, section: 'B', batch: '2023-2027',
      email: 'divya.iyer@college.com', phone: '+91 98765 43213', mentor: 'Prof. Sneha Verma',
      attendance: 96, cgpa: 9.6, placementEligible: true, placementStatus: 'Placed (Google)',
      status: 'Active', gender: 'Female', category: 'General', hosteller: true,
      admissionType: 'Management',
      feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: true },
    },
    {
      id: 'STU-005', photoUrl: '', rollNumber: '23091A4205', regNumber: 'REG-2023-4205',
      name: 'Eshwar Verma', department: code, year: 3, semester: 5, section: 'C', batch: '2023-2027',
      email: 'eshwar.verma@college.com', phone: '+91 98765 43214', mentor: 'Prof. Vikram Rathore',
      attendance: 82, cgpa: 8.1, placementEligible: true, placementStatus: 'Eligible',
      status: 'Active', gender: 'Male', category: 'ST', hosteller: false,
      admissionType: 'Scholarship', scholarshipType: 'Central Government',
      feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: false, semesterPaid: false },
    },
    {
      id: 'STU-006', photoUrl: '', rollNumber: '23091A4206', regNumber: 'REG-2023-4206',
      name: 'Farhan Ali', department: code, year: 3, semester: 5, section: 'C', batch: '2023-2027',
      email: 'farhan.ali@college.com', phone: '+91 98765 43215', mentor: 'Prof. Vikram Rathore',
      attendance: 71, cgpa: 7.8, placementEligible: false, placementStatus: 'Ineligible (Backlog)',
      status: 'Warning', gender: 'Male', category: 'General', hosteller: true,
      admissionType: 'Management',
      feeStatus: { mid1Paid: false, mid2Paid: true, labsPaid: false, semesterPaid: false },
    },
    {
      id: 'STU-007', photoUrl: '', rollNumber: '23091A4207', regNumber: 'REG-2023-4207',
      name: 'Geetha Nair', department: code, year: 3, semester: 5, section: 'A', batch: '2023-2027',
      email: 'geetha.nair@college.com', phone: '+91 98765 43216', mentor: 'Dr. Ramesh Kumar',
      attendance: 91, cgpa: 8.5, placementEligible: true, placementStatus: 'Eligible',
      status: 'Active', gender: 'Female', category: 'OBC', hosteller: false,
      admissionType: 'Scholarship', scholarshipType: 'EBC',
      feeStatus: { mid1Paid: true, mid2Paid: false, labsPaid: true, semesterPaid: false },
    },
    {
      id: 'STU-008', photoUrl: '', rollNumber: '23091A4208', regNumber: 'REG-2023-4208',
      name: 'Harish Bose', department: code, year: 3, semester: 5, section: 'B', batch: '2023-2027',
      email: 'harish.bose@college.com', phone: '+91 98765 43217', mentor: 'Prof. Sneha Verma',
      attendance: 85, cgpa: 7.9, placementEligible: true, placementStatus: 'Eligible',
      status: 'Active', gender: 'Male', category: 'General', hosteller: true,
      admissionType: 'Management',
      feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: false },
    },
  ];
}

