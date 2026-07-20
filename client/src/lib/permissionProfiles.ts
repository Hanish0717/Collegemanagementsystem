/**
 * Pre-configured Permission Profiles / Templates
 * 
 * Provides standard institutional permission matrices for rapid employee onboarding.
 */

export interface PermissionProfile {
  id: string;
  name: string;
  description: string;
  defaultDesignation: string;
  permissions: {
    userManagement: boolean;
    departmentManagement: boolean;
    courseManagement: boolean;
    attendanceApproval: boolean;
    examManagement: boolean;
    feeManagement: boolean;
    purchaseApproval: boolean;
    grievanceManagement: boolean;
    auditLogs: boolean;
    reports: boolean;
  };
}

export const PERMISSION_PROFILES: PermissionProfile[] = [
  {
    id: 'principal-template',
    name: 'Principal Template',
    description: 'Full executive administration, institutional oversight, and final approval authority.',
    defaultDesignation: 'Principal',
    permissions: {
      userManagement: true,
      departmentManagement: true,
      courseManagement: true,
      attendanceApproval: true,
      examManagement: true,
      feeManagement: true,
      purchaseApproval: true,
      grievanceManagement: true,
      auditLogs: true,
      reports: true,
    },
  },
  {
    id: 'vice-principal-template',
    name: 'Vice Principal Template',
    description: 'Executive operational administration, academic monitoring, and administrative escalation.',
    defaultDesignation: 'Vice Principal',
    permissions: {
      userManagement: true,
      departmentManagement: true,
      courseManagement: true,
      attendanceApproval: true,
      examManagement: true,
      feeManagement: false,
      purchaseApproval: true,
      grievanceManagement: true,
      auditLogs: true,
      reports: true,
    },
  },
  {
    id: 'dean-template',
    name: 'Dean Template',
    description: 'Domain-level administrative governance (Academics, Research, Exams, Student Affairs).',
    defaultDesignation: 'Dean',
    permissions: {
      userManagement: false,
      departmentManagement: true,
      courseManagement: true,
      attendanceApproval: true,
      examManagement: true,
      feeManagement: false,
      purchaseApproval: true,
      grievanceManagement: true,
      auditLogs: false,
      reports: true,
    },
  },
  {
    id: 'hod-template',
    name: 'HOD Template',
    description: 'Departmental leadership, program/semester management, and leave/purchase initial approvals.',
    defaultDesignation: 'HOD',
    permissions: {
      userManagement: false,
      departmentManagement: true,
      courseManagement: true,
      attendanceApproval: true,
      examManagement: false,
      feeManagement: false,
      purchaseApproval: true,
      grievanceManagement: true,
      auditLogs: false,
      reports: true,
    },
  },
  {
    id: 'faculty-template',
    name: 'Faculty Template',
    description: 'Standard teaching staff access: classroom management, student grading, and attendance submission.',
    defaultDesignation: 'Assistant Professor',
    permissions: {
      userManagement: false,
      departmentManagement: false,
      courseManagement: true,
      attendanceApproval: false,
      examManagement: false,
      feeManagement: false,
      purchaseApproval: false,
      grievanceManagement: false,
      auditLogs: false,
      reports: false,
    },
  },
  {
    id: 'exam-cell-template',
    name: 'Exam Cell Template',
    description: 'Specialized examination authority: timetabling, hall tickets, and mark sheet validation.',
    defaultDesignation: 'Associate Professor',
    permissions: {
      userManagement: false,
      departmentManagement: false,
      courseManagement: true,
      attendanceApproval: false,
      examManagement: true,
      feeManagement: false,
      purchaseApproval: false,
      grievanceManagement: false,
      auditLogs: false,
      reports: true,
    },
  },
  {
    id: 'accounts-template',
    name: 'Accounts Template',
    description: 'Financial administration: student fee collection, purchase order verification, and budgeting.',
    defaultDesignation: 'Lab Assistant',
    permissions: {
      userManagement: false,
      departmentManagement: false,
      courseManagement: false,
      attendanceApproval: false,
      examManagement: false,
      feeManagement: true,
      purchaseApproval: true,
      grievanceManagement: false,
      auditLogs: false,
      reports: true,
    },
  },
];

export default PERMISSION_PROFILES;
