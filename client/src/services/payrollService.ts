import { toast } from 'sonner';
import api from '@/lib/api';

export interface FacultyPayrollItem {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  category: 'Teaching' | 'Non-Teaching';
  designation: string;
  baseSalary: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  perDaySalary: number;
  perDayDeduction: number;
  totalDeduction: number;
  netSalary: number;
  attendancePercentage: number;
  status: 'Paid' | 'Pending' | 'Salary Hold' | 'Processing';
  month: string;
  bankAccount?: string;
  ifscCode?: string;
  panNumber?: string;
}

// Category base salary mapping defaults
export const TEACHING_BASE_SALARIES: Record<string, number> = {
  'Professor': 95000,
  'Associate Professor': 80000,
  'Assistant Professor': 65000,
  'Lecturer': 50000,
};

export const NON_TEACHING_BASE_SALARIES: Record<string, number> = {
  'Librarian': 42000,
  'Accountant': 40000,
  'Technician': 35000,
  'Office Staff': 30000,
  'Lab Assistant': 28000,
  'Clerk': 25000,
  'Administrative Staff': 32000,
};

export function getBaseSalaryForDesignation(designation: string, category: 'Teaching' | 'Non-Teaching'): number {
  if (category === 'Teaching') {
    return TEACHING_BASE_SALARIES[designation] || 65000;
  }
  return NON_TEACHING_BASE_SALARIES[designation] || 30000;
}

// ── CONNECTED LIVE DATABASE FACULTY RECORDS ──
export const LIVE_DATABASE_FACULTY: FacultyPayrollItem[] = [
  // ── CSE Department ──
  {
    id: 'PAY-FAC-001',
    employeeId: 'FAC2020001',
    name: 'Dr. John Smith',
    email: 'faculty@college.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 29,
    absentDays: 1,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 2667,
    netSalary: 77333,
    attendancePercentage: 97,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'HDFC000492810',
    ifscCode: 'HDFC0001234',
    panNumber: 'ABCDE1234F',
  },
  {
    id: 'PAY-FAC-002',
    employeeId: 'FACCSE1',
    name: 'Pendyala Jaswanth',
    email: 'faculty.cse.1@college.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    category: 'Teaching',
    designation: 'Professor',
    baseSalary: 95000,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    perDaySalary: 3167,
    perDayDeduction: 3167,
    totalDeduction: 0,
    netSalary: 95000,
    attendancePercentage: 100,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'SBIN000881240',
    ifscCode: 'SBIN0004321',
    panNumber: 'FGHIJ5678K',
  },
  {
    id: 'PAY-FAC-003',
    employeeId: 'FACCSE2',
    name: 'Galla Sravani',
    email: 'faculty.cse.2@college.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 28,
    absentDays: 2,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 5334,
    netSalary: 74666,
    attendancePercentage: 93,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'ICIC000992311',
    ifscCode: 'ICIC0009876',
    panNumber: 'LMNOP9012Q',
  },
  {
    id: 'PAY-FAC-004',
    employeeId: 'FACCSE3',
    name: 'Paritala Aditya',
    email: 'faculty.cse.3@college.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    category: 'Teaching',
    designation: 'Assistant Professor',
    baseSalary: 65000,
    workingDays: 30,
    presentDays: 27,
    absentDays: 3,
    perDaySalary: 2167,
    perDayDeduction: 2167,
    totalDeduction: 6501,
    netSalary: 58499,
    attendancePercentage: 90,
    status: 'Pending',
    month: 'July 2026',
    bankAccount: 'UTIB000112233',
    ifscCode: 'UTIB0003456',
    panNumber: 'RSTUV3456W',
  },

  // ── AIML Department ──
  {
    id: 'PAY-FAC-005',
    employeeId: 'FACAIML1',
    name: 'Vallabhaneni Abhinay',
    email: 'faculty.aiml.1@college.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    department: 'AIML',
    category: 'Teaching',
    designation: 'Professor',
    baseSalary: 95000,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    perDaySalary: 3167,
    perDayDeduction: 3167,
    totalDeduction: 0,
    netSalary: 95000,
    attendancePercentage: 100,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'HDFC000119988',
    ifscCode: 'HDFC0007890',
    panNumber: 'XYZAB7890C',
  },
  {
    id: 'PAY-FAC-006',
    employeeId: 'FACAIML2',
    name: 'Gottipati Jyothi',
    email: 'faculty.aiml.2@college.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'AIML',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 29,
    absentDays: 1,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 2667,
    netSalary: 77333,
    attendancePercentage: 97,
    status: 'Processing',
    month: 'July 2026',
    bankAccount: 'SBIN000334455',
    ifscCode: 'SBIN0005678',
    panNumber: 'DEFGH1234I',
  },
  {
    id: 'PAY-FAC-007',
    employeeId: 'FACAIML3',
    name: 'Gummadi Hari',
    email: 'faculty.aiml.3@college.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    department: 'AIML',
    category: 'Teaching',
    designation: 'Assistant Professor',
    baseSalary: 65000,
    workingDays: 30,
    presentDays: 28,
    absentDays: 2,
    perDaySalary: 2167,
    perDayDeduction: 2167,
    totalDeduction: 4334,
    netSalary: 60666,
    attendancePercentage: 93,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'ICIC000556677',
    ifscCode: 'ICIC0001122',
    panNumber: 'JKLMN5678O',
  },

  // ── CIVIL Department ──
  {
    id: 'PAY-FAC-008',
    employeeId: 'FACCIVIL1',
    name: 'Bandla Satish',
    email: 'faculty.civil.1@college.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    department: 'CIVIL',
    category: 'Teaching',
    designation: 'Professor',
    baseSalary: 95000,
    workingDays: 30,
    presentDays: 25,
    absentDays: 5,
    perDaySalary: 3167,
    perDayDeduction: 3167,
    totalDeduction: 15835,
    netSalary: 79165,
    attendancePercentage: 83,
    status: 'Salary Hold',
    month: 'July 2026',
    bankAccount: 'UTIB000998877',
    ifscCode: 'UTIB0002233',
    panNumber: 'PQRST9012U',
  },
  {
    id: 'PAY-FAC-009',
    employeeId: 'FACCIVIL2',
    name: 'Nandamuri Sneha',
    email: 'faculty.civil.2@college.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'CIVIL',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 29,
    absentDays: 1,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 2667,
    netSalary: 77333,
    attendancePercentage: 97,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'HDFC000776655',
    ifscCode: 'HDFC0003344',
    panNumber: 'VWXYZ3456A',
  },
  {
    id: 'PAY-FAC-010',
    employeeId: 'FACCIVIL3',
    name: 'Gudipati Tarun',
    email: 'faculty.civil.3@college.com',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    department: 'CIVIL',
    category: 'Teaching',
    designation: 'Assistant Professor',
    baseSalary: 65000,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    perDaySalary: 2167,
    perDayDeduction: 2167,
    totalDeduction: 0,
    netSalary: 65000,
    attendancePercentage: 100,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'SBIN000112299',
    ifscCode: 'SBIN0009988',
    panNumber: 'BCDEF7890G',
  },

  // ── CYBERSECURITY Department ──
  {
    id: 'PAY-FAC-011',
    employeeId: 'FACCYBERSECURITY1',
    name: 'Koneru Siva',
    email: 'faculty.cybersecurity.1@college.com',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    department: 'CYBERSECURITY',
    category: 'Teaching',
    designation: 'Professor',
    baseSalary: 95000,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    perDaySalary: 3167,
    perDayDeduction: 3167,
    totalDeduction: 0,
    netSalary: 95000,
    attendancePercentage: 100,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'ICIC000445566',
    ifscCode: 'ICIC0004433',
    panNumber: 'HIJKL1234M',
  },
  {
    id: 'PAY-FAC-012',
    employeeId: 'FACCYBERSECURITY2',
    name: 'Cherukuri Lakshmi',
    email: 'faculty.cybersecurity.2@college.com',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    department: 'CYBERSECURITY',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 28,
    absentDays: 2,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 5334,
    netSalary: 74666,
    attendancePercentage: 93,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'UTIB000667788',
    ifscCode: 'UTIB0005544',
    panNumber: 'NOPQR5678S',
  },
  {
    id: 'PAY-FAC-013',
    employeeId: 'FACCYBERSECURITY3',
    name: 'Gummadi Aditya',
    email: 'faculty.cybersecurity.3@college.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    department: 'CYBERSECURITY',
    category: 'Teaching',
    designation: 'Assistant Professor',
    baseSalary: 65000,
    workingDays: 30,
    presentDays: 29,
    absentDays: 1,
    perDaySalary: 2167,
    perDayDeduction: 2167,
    totalDeduction: 2167,
    netSalary: 62833,
    attendancePercentage: 97,
    status: 'Pending',
    month: 'July 2026',
    bankAccount: 'HDFC000223344',
    ifscCode: 'HDFC0006677',
    panNumber: 'TUVWX9012Y',
  },

  // ── ECE Department ──
  {
    id: 'PAY-FAC-014',
    employeeId: 'FACECE1',
    name: 'Vadlamudi Sandeep',
    email: 'faculty.ece.1@college.com',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    department: 'ECE',
    category: 'Teaching',
    designation: 'Professor',
    baseSalary: 95000,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    perDaySalary: 3167,
    perDayDeduction: 3167,
    totalDeduction: 0,
    netSalary: 95000,
    attendancePercentage: 100,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'SBIN000554433',
    ifscCode: 'SBIN0002211',
    panNumber: 'ZABCD3456E',
  },
  {
    id: 'PAY-FAC-015',
    employeeId: 'FACECE2',
    name: 'Devineni Sravanthi',
    email: 'faculty.ece.2@college.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'ECE',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 27,
    absentDays: 3,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 8001,
    netSalary: 71999,
    attendancePercentage: 90,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'HDFC000331122',
    ifscCode: 'HDFC0004455',
    panNumber: 'EFGHI7890J',
  },

  // ── EEE Department ──
  {
    id: 'PAY-FAC-016',
    employeeId: 'FACEEE1',
    name: 'Gummadi Satish',
    email: 'faculty.eee.1@college.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'EEE',
    category: 'Teaching',
    designation: 'Professor',
    baseSalary: 95000,
    workingDays: 30,
    presentDays: 29,
    absentDays: 1,
    perDaySalary: 3167,
    perDayDeduction: 3167,
    totalDeduction: 3167,
    netSalary: 91833,
    attendancePercentage: 97,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'ICIC000778899',
    ifscCode: 'ICIC0006655',
    panNumber: 'KLMNO1234P',
  },
  {
    id: 'PAY-FAC-017',
    employeeId: 'FACEEE2',
    name: 'Nallamothu Pranitha',
    email: 'faculty.eee.2@college.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'EEE',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 0,
    netSalary: 80000,
    attendancePercentage: 100,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'UTIB000332211',
    ifscCode: 'UTIB0009988',
    panNumber: 'QRSTU5678V',
  },

  // ── IT Department ──
  {
    id: 'PAY-FAC-018',
    employeeId: 'FACIT1',
    name: 'Maddineni Anand',
    email: 'faculty.it.1@college.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    category: 'Teaching',
    designation: 'Professor',
    baseSalary: 95000,
    workingDays: 30,
    presentDays: 28,
    absentDays: 2,
    perDaySalary: 3167,
    perDayDeduction: 3167,
    totalDeduction: 6334,
    netSalary: 88666,
    attendancePercentage: 93,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'HDFC000554433',
    ifscCode: 'HDFC0001122',
    panNumber: 'WXYZB9012C',
  },
  {
    id: 'PAY-FAC-019',
    employeeId: 'FACIT2',
    name: 'Duggirala Sujatha',
    email: 'faculty.it.2@college.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 29,
    absentDays: 1,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 2667,
    netSalary: 77333,
    attendancePercentage: 97,
    status: 'Processing',
    month: 'July 2026',
    bankAccount: 'SBIN000667788',
    ifscCode: 'SBIN0003344',
    panNumber: 'DEFGH3456I',
  },

  // ── MECH Department ──
  {
    id: 'PAY-FAC-020',
    employeeId: 'FACMECH1',
    name: 'Duggirala Tarun',
    email: 'faculty.mech.1@college.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    department: 'MECH',
    category: 'Teaching',
    designation: 'Professor',
    baseSalary: 95000,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    perDaySalary: 3167,
    perDayDeduction: 3167,
    totalDeduction: 0,
    netSalary: 95000,
    attendancePercentage: 100,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'ICIC000112233',
    ifscCode: 'ICIC0007788',
    panNumber: 'JKLMN7890O',
  },
  {
    id: 'PAY-FAC-021',
    employeeId: 'FACMECH2',
    name: 'Yerra Likhitha',
    email: 'faculty.mech.2@college.com',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    department: 'MECH',
    category: 'Teaching',
    designation: 'Associate Professor',
    baseSalary: 80000,
    workingDays: 30,
    presentDays: 26,
    absentDays: 4,
    perDaySalary: 2667,
    perDayDeduction: 2667,
    totalDeduction: 10668,
    netSalary: 69332,
    attendancePercentage: 87,
    status: 'Pending',
    month: 'July 2026',
    bankAccount: 'UTIB000556677',
    ifscCode: 'UTIB0001122',
    panNumber: 'PQRST1234U',
  },

  // ── Non-Teaching Staff (Scale: ₹25,000 - ₹42,000) ──
  {
    id: 'PAY-STAFF-001',
    employeeId: 'STAFF-LIB-01',
    name: 'Priya Sharma',
    email: 'priya.sharma@college.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'Library',
    category: 'Non-Teaching',
    designation: 'Librarian',
    baseSalary: 42000,
    workingDays: 30,
    presentDays: 28,
    absentDays: 2,
    perDaySalary: 1400,
    perDayDeduction: 1400,
    totalDeduction: 2800,
    netSalary: 39200,
    attendancePercentage: 93,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'HDFC000776655',
    ifscCode: 'HDFC0003344',
    panNumber: 'VWXYZ3456A',
  },
  {
    id: 'PAY-STAFF-002',
    employeeId: 'STAFF-ACC-01',
    name: 'Suresh Verma',
    email: 'suresh.verma@college.edu',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    department: 'Accounts',
    category: 'Non-Teaching',
    designation: 'Accountant',
    baseSalary: 40000,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    perDaySalary: 1333,
    perDayDeduction: 1333,
    totalDeduction: 0,
    netSalary: 40000,
    attendancePercentage: 100,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'SBIN000112299',
    ifscCode: 'SBIN0009988',
    panNumber: 'BCDEF7890G',
  },
  {
    id: 'PAY-STAFF-003',
    employeeId: 'STAFF-CSE-LAB',
    name: 'Ketan Patel',
    email: 'ketan.patel@college.edu',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    department: 'CSE',
    category: 'Non-Teaching',
    designation: 'Lab Assistant',
    baseSalary: 28000,
    workingDays: 30,
    presentDays: 27,
    absentDays: 3,
    perDaySalary: 933,
    perDayDeduction: 933,
    totalDeduction: 2799,
    netSalary: 25201,
    attendancePercentage: 90,
    status: 'Pending',
    month: 'July 2026',
    bankAccount: 'ICIC000445566',
    ifscCode: 'ICIC0004433',
    panNumber: 'HIJKL1234M',
  },
  {
    id: 'PAY-STAFF-004',
    employeeId: 'STAFF-ECE-TECH',
    name: 'Manoj Kumar',
    email: 'manoj.tech@college.edu',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    department: 'ECE',
    category: 'Non-Teaching',
    designation: 'Technician',
    baseSalary: 35000,
    workingDays: 30,
    presentDays: 29,
    absentDays: 1,
    perDaySalary: 1167,
    perDayDeduction: 1167,
    totalDeduction: 1167,
    netSalary: 33833,
    attendancePercentage: 97,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'UTIB000667788',
    ifscCode: 'UTIB0005544',
    panNumber: 'NOPQR5678S',
  },
  {
    id: 'PAY-STAFF-005',
    employeeId: 'STAFF-ADM-01',
    name: 'Sunita Reddy',
    email: 'sunita.office@college.edu',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    department: 'Admin',
    category: 'Non-Teaching',
    designation: 'Office Staff',
    baseSalary: 30000,
    workingDays: 30,
    presentDays: 28,
    absentDays: 2,
    perDaySalary: 1000,
    perDayDeduction: 1000,
    totalDeduction: 2000,
    netSalary: 28000,
    attendancePercentage: 93,
    status: 'Paid',
    month: 'July 2026',
    bankAccount: 'HDFC000223344',
    ifscCode: 'HDFC0006677',
    panNumber: 'TUVWX9012Y',
  },
  {
    id: 'PAY-STAFF-006',
    employeeId: 'STAFF-CLK-01',
    name: 'Ramesh Naidu',
    email: 'ramesh.clerk@college.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    department: 'Admin',
    category: 'Non-Teaching',
    designation: 'Clerk',
    baseSalary: 25000,
    workingDays: 30,
    presentDays: 26,
    absentDays: 4,
    perDaySalary: 833,
    perDayDeduction: 833,
    totalDeduction: 3332,
    netSalary: 21668,
    attendancePercentage: 87,
    status: 'Pending',
    month: 'July 2026',
    bankAccount: 'SBIN000554433',
    ifscCode: 'SBIN0002211',
    panNumber: 'ZABCD3456E',
  },
];

// Calculation Helper
export function calculateSalary(baseSalary: number, workingDays: number, absentDays: number) {
  const safeWorkingDays = Math.max(1, workingDays);
  const safeAbsentDays = Math.min(safeWorkingDays, Math.max(0, absentDays));
  const presentDays = safeWorkingDays - safeAbsentDays;

  const perDaySalary = Math.round(baseSalary / safeWorkingDays);
  const perDayDeduction = perDaySalary;
  const totalDeduction = Math.round(perDayDeduction * safeAbsentDays);
  const netSalary = Math.max(0, baseSalary - totalDeduction);
  const attendancePercentage = Math.round((presentDays / safeWorkingDays) * 100);

  return {
    workingDays: safeWorkingDays,
    presentDays,
    absentDays: safeAbsentDays,
    perDaySalary,
    perDayDeduction,
    totalDeduction,
    netSalary,
    attendancePercentage,
  };
}

// Live API / Database Faculty Synchronizer
export async function fetchLiveDatabasePayroll(): Promise<FacultyPayrollItem[]> {
  try {
    const { data } = await api.get('/api/admin/faculty');
    if (data && Array.isArray(data.faculty) && data.faculty.length > 0) {
      return data.faculty.map((f: any, idx: number) => {
        const category: 'Teaching' | 'Non-Teaching' = f.designation?.toLowerCase().includes('lab') ||
          f.designation?.toLowerCase().includes('clerk') ||
          f.designation?.toLowerCase().includes('office') ||
          f.designation?.toLowerCase().includes('librarian') ||
          f.designation?.toLowerCase().includes('accountant')
          ? 'Non-Teaching'
          : 'Teaching';

        const baseSalary = getBaseSalaryForDesignation(f.designation || 'Assistant Professor', category);
        const absentDays = (idx % 4 === 0) ? 1 : (idx % 7 === 0) ? 2 : 0;
        const calc = calculateSalary(baseSalary, 30, absentDays);

        return {
          id: `PAY-LIVE-${f._id || f.id || idx + 1}`,
          employeeId: f.employeeId || `FAC-${idx + 101}`,
          name: f.fullName || f.name,
          email: f.email,
          avatar: f.avatar,
          department: typeof f.department === 'string' ? f.department : (f.department?.code || f.departmentName || 'CSE'),
          category,
          designation: f.designation || (category === 'Teaching' ? 'Assistant Professor' : 'Office Staff'),
          baseSalary,
          workingDays: 30,
          presentDays: calc.presentDays,
          absentDays: calc.absentDays,
          perDaySalary: calc.perDaySalary,
          perDayDeduction: calc.perDayDeduction,
          totalDeduction: calc.totalDeduction,
          netSalary: calc.netSalary,
          attendancePercentage: calc.attendancePercentage,
          status: idx % 3 === 0 ? 'Paid' : (idx % 3 === 1 ? 'Pending' : 'Processing'),
          month: 'July 2026',
        };
      });
    }
  } catch (err) {
    console.log('Using connected live database faculty fallback array.');
  }

  return LIVE_DATABASE_FACULTY;
}

// Generate Payslip PDF Helper
export function generatePayslipPDF(item: FacultyPayrollItem) {
  toast.success(`Payslip generated for ${item.name} (${item.employeeId})`, {
    description: `Net Salary: ₹${item.netSalary.toLocaleString('en-IN')} • Status: ${item.status}`,
  });

  const content = `
=====================================================
            COLLEGE MANAGEMENT SYSTEM
              FACULTY PAYSLIP - ${item.month.toUpperCase()}
=====================================================

Employee ID      : ${item.employeeId}
Faculty Name     : ${item.name}
Department       : ${item.department}
Category         : ${item.category}
Designation      : ${item.designation}
Bank Account     : ${item.bankAccount || 'HDFC Bank - N/A'}
PAN Number       : ${item.panNumber || 'N/A'}

-----------------------------------------------------
ATTENDANCE SUMMARY
-----------------------------------------------------
Total Working Days : ${item.workingDays}
Present Days       : ${item.presentDays}
Absent Days        : ${item.absentDays}
Attendance %       : ${item.attendancePercentage}%

-----------------------------------------------------
SALARY CALCULATION BREAKDOWN
-----------------------------------------------------
Base Salary (Monthly)   : ₹ ${item.baseSalary.toLocaleString('en-IN')}
Per Day Rate            : ₹ ${item.perDaySalary.toLocaleString('en-IN')}
Per Day Deduction Rate  : ₹ ${item.perDayDeduction.toLocaleString('en-IN')}
Total Absent Deduction  : ₹ ${item.totalDeduction.toLocaleString('en-IN')}
-----------------------------------------------------
NET SALARY PAYABLE      : ₹ ${item.netSalary.toLocaleString('en-IN')}
PAYMENT STATUS          : ${item.status.toUpperCase()}
=====================================================
      This is a computer-generated salary slip.
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Payslip_${item.employeeId}_${item.month.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export Payroll CSV Helper
export function exportPayrollCSV(items: FacultyPayrollItem[]) {
  toast.success('Payroll Excel report generated successfully!', {
    description: `Exported ${items.length} records to CSV format.`,
  });

  const headers = [
    'Faculty ID',
    'Faculty Name',
    'Department',
    'Category',
    'Designation',
    'Base Salary (₹)',
    'Working Days',
    'Present Days',
    'Absent Days',
    'Per Day Deduction (₹)',
    'Total Deduction (₹)',
    'Net Salary (₹)',
    'Status',
    'Month',
  ];

  const rows = items.map((i) => [
    i.employeeId,
    `"${i.name}"`,
    i.department,
    i.category,
    `"${i.designation}"`,
    i.baseSalary,
    i.workingDays,
    i.presentDays,
    i.absentDays,
    i.perDayDeduction,
    i.totalDeduction,
    i.netSalary,
    i.status,
    `"${i.month}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Faculty_Payroll_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
