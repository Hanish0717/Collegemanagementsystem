import { DepartmentStudent } from './hodStudentService';
import { DepartmentSubject, LessonPlanItem } from './hodAcademicService';
import { DepartmentFaculty } from './hodFacultyService';
import { MentoringItem, ResearchPublicationItem, EventItem } from './hodMentoringResearchEventService';
import { ApprovalItem } from './hodApprovalsService';

const STORAGE_KEYS = {
  STUDENTS: 'cms_hod_dynamic_students',
  MENTORS: 'cms_hod_dynamic_mentors',
  SUBJECTS: 'cms_hod_dynamic_subjects',
  FACULTY: 'cms_hod_dynamic_faculty',
  APPROVALS: 'cms_hod_dynamic_approvals',
  EVENTS: 'cms_hod_dynamic_events',
  RESEARCH: 'cms_hod_dynamic_research',
};

// Helper: load from localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to read ${key} from storage`, e);
  }
  return fallback;
}

// Helper: save to localStorage & notify
function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('hod_store_updated', { detail: { key } }));
  } catch (e) {
    console.warn(`Failed to save ${key} to storage`, e);
  }
}

// Initial Default Mentors Mapping
const defaultCohortMentors: Record<string, string> = {
  'Sem 5 Section A': 'Prof. Vikram Rathore',
  'Sem 5 Section B': 'Prof. Sneha Verma',
  'Sem 7 Section A': 'Dr. Ananya Roy',
  'Sem 3 Section A': 'Dr. Ramesh Kumar',
};

export const hodStore = {
  // ── MENTORS ─────────────────────────────────────────────────────────────
  getCohortMentors(): Record<string, string> {
    return loadFromStorage(STORAGE_KEYS.MENTORS, defaultCohortMentors);
  },

  setCohortMentor(cohort: string, mentorName: string) {
    const mentors = this.getCohortMentors();
    mentors[cohort] = mentorName;
    saveToStorage(STORAGE_KEYS.MENTORS, mentors);

    // Synchronize into students dataset
    const semMatch = cohort.match(/Sem\s*(\d+)/i);
    const secMatch = cohort.match(/Sec(?:tion)?\s*([A-Z])/i);
    if (semMatch && secMatch) {
      const sem = parseInt(semMatch[1], 10);
      const sec = secMatch[1].toUpperCase();
      this.updateStudentMentorsForCohort(sem, sec, mentorName);
    }
  },

  // ── STUDENTS ────────────────────────────────────────────────────────────
  getStudents(deptCode: string = 'AIML'): DepartmentStudent[] {
    const defaultStudents: DepartmentStudent[] = [
      { id: 'STU-001', photoUrl: '', rollNumber: '23091A4201', regNumber: 'REG-2023-4201', name: 'Aarav Sharma', department: deptCode, year: 3, semester: 5, section: 'A', batch: '2023-2027', email: 'aarav.sharma@college.com', phone: '+91 98765 43201', mentor: 'Prof. Vikram Rathore', attendance: 94, cgpa: 9.2, placementEligible: true, placementStatus: 'Placed (Microsoft)', status: 'Active', gender: 'Male', category: 'General', hosteller: false, admissionType: 'Scholarship', scholarshipType: 'Merit', feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: true } },
      { id: 'STU-002', photoUrl: '', rollNumber: '23091A4202', regNumber: 'REG-2023-4202', name: 'Bhavna Patel', department: deptCode, year: 3, semester: 5, section: 'A', batch: '2023-2027', email: 'bhavna.patel@college.com', phone: '+91 98765 43202', mentor: 'Prof. Vikram Rathore', attendance: 89, cgpa: 8.8, placementEligible: true, placementStatus: 'Eligible', status: 'Active', gender: 'Female', category: 'OBC', hosteller: true, admissionType: 'Management', feeStatus: { mid1Paid: true, mid2Paid: false, labsPaid: true, semesterPaid: false } },
      { id: 'STU-003', photoUrl: '', rollNumber: '23091A4203', regNumber: 'REG-2023-4203', name: 'Chirag Reddy', department: deptCode, year: 3, semester: 5, section: 'B', batch: '2023-2027', email: 'chirag.reddy@college.com', phone: '+91 98765 43203', mentor: 'Prof. Sneha Verma', attendance: 68, cgpa: 7.4, placementEligible: false, placementStatus: 'Ineligible (Attendance)', status: 'Warning', gender: 'Male', category: 'SC', hosteller: false, admissionType: 'Scholarship', scholarshipType: 'State Government', feeStatus: { mid1Paid: false, mid2Paid: false, labsPaid: false, semesterPaid: false } },
      { id: 'STU-004', photoUrl: '', rollNumber: '23091A4204', regNumber: 'REG-2023-4204', name: 'Divya Iyer', department: deptCode, year: 3, semester: 5, section: 'B', batch: '2023-2027', email: 'divya.iyer@college.com', phone: '+91 98765 43204', mentor: 'Prof. Sneha Verma', attendance: 96, cgpa: 9.6, placementEligible: true, placementStatus: 'Placed (Google)', status: 'Active', gender: 'Female', category: 'General', hosteller: true, admissionType: 'Management', feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: true } },
      { id: 'STU-005', photoUrl: '', rollNumber: '23091A4205', regNumber: 'REG-2023-4205', name: 'Eshwar Verma', department: deptCode, year: 3, semester: 5, section: 'C', batch: '2023-2027', email: 'eshwar.verma@college.com', phone: '+91 98765 43205', mentor: 'Dr. Ramesh Kumar', attendance: 82, cgpa: 8.1, placementEligible: true, placementStatus: 'Eligible', status: 'Active', gender: 'Male', category: 'ST', hosteller: false, admissionType: 'Scholarship', scholarshipType: 'Central Government', feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: false, semesterPaid: false } },
      { id: 'STU-006', photoUrl: '', rollNumber: '23091A4206', regNumber: 'REG-2023-4206', name: 'Farhan Ali', department: deptCode, year: 3, semester: 5, section: 'C', batch: '2023-2027', email: 'farhan.ali@college.com', phone: '+91 98765 43206', mentor: 'Dr. Ramesh Kumar', attendance: 71, cgpa: 7.8, placementEligible: false, placementStatus: 'Ineligible (Backlog)', status: 'Warning', gender: 'Male', category: 'General', hosteller: true, admissionType: 'Management', feeStatus: { mid1Paid: false, mid2Paid: true, labsPaid: false, semesterPaid: false } },
      { id: 'STU-007', photoUrl: '', rollNumber: '23091A4207', regNumber: 'REG-2023-4207', name: 'Geetha Nair', department: deptCode, year: 3, semester: 5, section: 'A', batch: '2023-2027', email: 'geetha.nair@college.com', phone: '+91 98765 43207', mentor: 'Prof. Vikram Rathore', attendance: 91, cgpa: 8.5, placementEligible: true, placementStatus: 'Eligible', status: 'Active', gender: 'Female', category: 'OBC', hosteller: false, admissionType: 'Scholarship', scholarshipType: 'EBC', feeStatus: { mid1Paid: true, mid2Paid: false, labsPaid: true, semesterPaid: false } },
      { id: 'STU-008', photoUrl: '', rollNumber: '23091A4208', regNumber: 'REG-2023-4208', name: 'Harish Bose', department: deptCode, year: 3, semester: 5, section: 'B', batch: '2023-2027', email: 'harish.bose@college.com', phone: '+91 98765 43208', mentor: 'Prof. Sneha Verma', attendance: 85, cgpa: 7.9, placementEligible: true, placementStatus: 'Eligible', status: 'Active', gender: 'Male', category: 'General', hosteller: true, admissionType: 'Management', feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: false } },
      { id: 'STU-009', photoUrl: '', rollNumber: '23091A4209', regNumber: 'REG-2023-4209', name: 'Ishita Roy', department: deptCode, year: 4, semester: 7, section: 'A', batch: '2023-2027', email: 'ishita.roy@college.com', phone: '+91 98765 43209', mentor: 'Prof. Vikram Rathore', attendance: 97, cgpa: 9.4, placementEligible: true, placementStatus: 'Placed (Amazon)', status: 'Active', gender: 'Female', category: 'General', hosteller: true, admissionType: 'Scholarship', scholarshipType: 'Merit', feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: true } },
      { id: 'STU-010', photoUrl: '', rollNumber: '23091A4210', regNumber: 'REG-2023-4210', name: 'Jai Kapoor', department: deptCode, year: 2, semester: 3, section: 'A', batch: '2023-2027', email: 'jai.kapoor@college.com', phone: '+91 98765 43210', mentor: 'Prof. Vikram Rathore', attendance: 90, cgpa: 8.7, placementEligible: true, placementStatus: 'Eligible', status: 'Active', gender: 'Male', category: 'General', hosteller: false, admissionType: 'Management', feeStatus: { mid1Paid: true, mid2Paid: true, labsPaid: true, semesterPaid: true } },
    ];

    const stored = loadFromStorage(STORAGE_KEYS.STUDENTS, defaultStudents);
    const mentors = this.getCohortMentors();

    const roster = (stored && stored.length >= defaultStudents.length) ? stored : defaultStudents;

    // Ensure cohort mentor assignments are reflected
    return roster.map((s) => {
      const cohortKey = `Sem ${s.semester} Section ${s.section}`;
      if (mentors[cohortKey]) {
        return { ...s, mentor: mentors[cohortKey] };
      }
      return s;
    });
  },

  updateStudentMentorsForCohort(sem: number, sec: string, mentorName: string) {
    const students = this.getStudents();
    const updated = students.map((s) => {
      if (s.semester === sem && s.section.toUpperCase() === sec.toUpperCase()) {
        return { ...s, mentor: mentorName };
      }
      return s;
    });
    saveToStorage(STORAGE_KEYS.STUDENTS, updated);
  },

  addStudent(newStudent: DepartmentStudent) {
    const students = this.getStudents();
    const updated = [newStudent, ...students];
    saveToStorage(STORAGE_KEYS.STUDENTS, updated);
  },

  // ── MENTORING LIST ──────────────────────────────────────────────────────
  getMentoringList(deptCode: string = 'AIML'): MentoringItem[] {
    const students = this.getStudents(deptCode);
    return students.map((s) => ({
      id: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      sem: s.semester,
      sec: s.section,
      mentor: s.mentor,
      lastMeeting: '2026-07-15',
      nextMeeting: '2026-08-05',
      riskLevel: s.attendance < 75 ? 'Critical' : s.cgpa < 7.5 ? 'High' : 'Low',
      attendance: s.attendance,
      cgpa: s.cgpa,
      status: s.status,
    }));
  },

  // ── FACULTY ─────────────────────────────────────────────────────────────
  getFaculty(deptCode: string = 'AIML'): DepartmentFaculty[] {
    const defaultFaculty: DepartmentFaculty[] = [
      { id: 'FAC-001', photoUrl: '', empId: 'EMP-AIML-101', name: 'Dr. Ramesh Kumar', designation: 'Professor & Head', department: deptCode, qualification: 'Ph.D in AI & Vision', specialization: 'Deep Learning & Neural Networks', experience: '14 Years', subjectsAssigned: 'DL & Neural Networks (AIML501)', classesAssigned: 'Sem 5 Sec A, Sem 7 Sec A', attendance: 98.5, publications: 14, feedbackScore: 4.8, status: 'Active', empType: 'Full-time' },
      { id: 'FAC-002', photoUrl: '', empId: 'EMP-AIML-102', name: 'Prof. Sneha Verma', designation: 'Associate Professor', department: deptCode, qualification: 'Ph.D in NLP', specialization: 'Natural Language Processing', experience: '9 Years', subjectsAssigned: 'NLP & Computational Linguistics (AIML502)', classesAssigned: 'Sem 5 Sec B', attendance: 95.0, publications: 11, feedbackScore: 4.7, status: 'Active', empType: 'Full-time' },
      { id: 'FAC-003', photoUrl: '', empId: 'EMP-AIML-103', name: 'Prof. Vikram Rathore', designation: 'Assistant Professor', department: deptCode, qualification: 'M.Tech in ML', specialization: 'Computer Vision & Robotics', experience: '6 Years', subjectsAssigned: 'Computer Vision (AIML503L)', classesAssigned: 'Sem 5 Sec C', attendance: 92.0, publications: 6, feedbackScore: 4.6, status: 'Active', empType: 'Full-time' },
      { id: 'FAC-004', photoUrl: '', empId: 'EMP-AIML-104', name: 'Dr. Ananya Roy', designation: 'Assistant Professor', department: deptCode, qualification: 'Ph.D in Reinforcement Learning', specialization: 'Reinforcement Learning', experience: '5 Years', subjectsAssigned: 'Reinforcement Learning (AIML701)', classesAssigned: 'Sem 7 Sec B', attendance: 96.0, publications: 9, feedbackScore: 4.8, status: 'Active', empType: 'Full-time' },
      { id: 'FAC-005', photoUrl: '', empId: 'EMP-AIML-105', name: 'Prof. Rajesh Sharma', designation: 'Assistant Professor', department: deptCode, qualification: 'Ph.D in Computer Science', specialization: 'Machine Learning', experience: '7 Years', subjectsAssigned: 'Foundations of AI & ML (AIML301)', classesAssigned: 'Sem 3 Sec A', attendance: 94.0, publications: 14, feedbackScore: 4.8, status: 'Active', empType: 'Full-time' },
    ];
    return loadFromStorage(STORAGE_KEYS.FACULTY, defaultFaculty);
  },

  assignFacultySubject(facultyId: string, facultyName: string, subjectName: string, subjectCode: string) {
    const faculty = this.getFaculty();
    const updatedFaculty = faculty.map((f) => {
      if (f.id === facultyId || f.name.toLowerCase() === facultyName.toLowerCase()) {
        return { ...f, subjectsAssigned: `${subjectName} (${subjectCode})` };
      }
      return f;
    });
    saveToStorage(STORAGE_KEYS.FACULTY, updatedFaculty);

    const subjects = this.getSubjects();
    const updatedSubjects = subjects.map((s) => {
      if (s.code.toLowerCase() === subjectCode.toLowerCase()) {
        return { ...s, faculty: facultyName, coordinator: facultyName };
      }
      return s;
    });
    saveToStorage(STORAGE_KEYS.SUBJECTS, updatedSubjects);
  },

  // ── SUBJECTS / COURSES ──────────────────────────────────────────────────
  getSubjects(deptCode: string = 'AIML'): DepartmentSubject[] {
    const defaultSubjects: DepartmentSubject[] = [
      { code: `${deptCode}501`, name: 'Deep Learning & Neural Networks', credits: 4, sem: 5, year: 3, section: 'A', type: 'Theory', faculty: 'Dr. Ramesh Kumar', coordinator: 'Dr. Ramesh Kumar', status: 'Active' },
      { code: `${deptCode}502`, name: 'Natural Language Processing', credits: 3, sem: 5, year: 3, section: 'B', type: 'Theory', faculty: 'Prof. Sneha Verma', coordinator: 'Prof. Sneha Verma', status: 'Active' },
      { code: `${deptCode}503L`, name: 'Computer Vision & Robotics Lab', credits: 2, sem: 5, year: 3, section: 'C', type: 'Lab', faculty: 'Prof. Vikram Rathore', coordinator: 'Prof. Vikram Rathore', status: 'Active' },
      { code: `${deptCode}701`, name: 'Reinforcement Learning & AI Agents', credits: 3, sem: 7, year: 4, section: 'A', type: 'Theory', faculty: 'Dr. Ananya Roy', coordinator: 'Dr. Ananya Roy', status: 'Active' },
    ];
    return loadFromStorage(STORAGE_KEYS.SUBJECTS, defaultSubjects);
  },

  addSubject(subject: DepartmentSubject) {
    const subjects = this.getSubjects();
    const updated = [...subjects, subject];
    saveToStorage(STORAGE_KEYS.SUBJECTS, updated);
  },

  assignFacultyToSubject(subjectCode: string, facultyName: string) {
    const subjects = this.getSubjects();
    const updated = subjects.map((s) =>
      s.code === subjectCode ? { ...s, faculty: facultyName, coordinator: facultyName } : s
    );
    saveToStorage(STORAGE_KEYS.SUBJECTS, updated);
  },

  // ── APPROVALS ──────────────────────────────────────────────────────────
  getApprovals(): ApprovalItem[] {
    const defaultApprovals: ApprovalItem[] = [
      { id: 'APP-101', type: 'Faculty Leave', applicant: 'Dr. Ramesh Kumar', role: 'Faculty', date: '2026-07-22', reason: 'Attending International AI Conference', status: 'Pending', priority: 'High', department: 'AIML' },
      { id: 'APP-102', type: 'Industrial Visit', applicant: 'Prof. Sneha Verma', role: 'Faculty', date: '2026-07-21', reason: 'Student Industrial Trip to ISRO Regional Center', status: 'Pending', priority: 'Medium', department: 'AIML' },
      { id: 'APP-103', type: 'Student Medical Leave', applicant: 'Chirag Reddy', role: 'Student', date: '2026-07-20', reason: 'Hospitalization due to viral fever', status: 'Pending', priority: 'High', department: 'AIML' },
    ];
    return loadFromStorage(STORAGE_KEYS.APPROVALS, defaultApprovals);
  },

  updateApprovalStatus(id: string, decision: 'Approved' | 'Rejected') {
    const approvals = this.getApprovals();
    const updated = approvals.map((app) =>
      app.id === id ? { ...app, status: decision } : app
    );
    saveToStorage(STORAGE_KEYS.APPROVALS, updated);
  },
};
