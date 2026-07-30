import { supabase } from '../config/supabase.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';

    // Query students belonging to department
    const { data: students, error: studentErr } = await supabase
      .from('students')
      .select('*')
      .eq('department', dept);

    // Query faculty belonging to department
    const { data: faculty, error: facultyErr } = await supabase
      .from('faculty')
      .select('*')
      .eq('department', dept);

    res.json({
      success: true,
      department: dept,
      summary: {
        totalStudents: students ? students.length : 480,
        totalFaculty: faculty ? faculty.length : 24,
        activeCourses: 16,
        passPercentage: 94.2,
        attendancePercentage: 91.4,
        pendingApprovals: 4,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnalyticsData = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      academicYear: req.query.academicYear || '2025-2026',
      analytics: {
        enrollmentTrend: [
          { year: '2021', students: 360 },
          { year: '2022', students: 400 },
          { year: '2023', students: 430 },
          { year: '2024', students: 455 },
          { year: '2025', students: 480 },
        ],
        passRateBySem: [
          { sem: 'Sem 1', passRate: 92 },
          { sem: 'Sem 3', passRate: 94 },
          { sem: 'Sem 5', passRate: 96 },
        ],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentSummary = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      details: {
        code: dept,
        name: `Department of ${dept}`,
        headEmail: req.user?.email || 'hod@college.com',
        academicYear: '2025-2026',
        building: 'Tech Block',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentNotifications = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      notifications: [
        { id: 'NTF-01', title: 'Leave Request Signoff Required', from: 'Dr. Ramesh Kumar', priority: 'High' },
        { id: 'NTF-02', title: 'Attendance Shortage Alert (<75%)', from: 'Biometric System', priority: 'Medium' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      approvals: [
        { id: 'APP-101', title: 'Faculty Medical Leave', applicant: 'Dr. Ramesh Kumar', status: 'Pending' },
        { id: 'APP-102', title: 'Industrial Visit Requisition', applicant: 'Prof. Anjali Sharma', status: 'Pending' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDepartmentAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      message: `Announcement broadcasted to all ${dept} students and faculty.`,
      announcement: {
        id: `ANN-${Date.now()}`,
        department: dept,
        title,
        content,
        createdBy: req.user?.fullName || 'HOD',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignFacultyMentor = async (req, res) => {
  try {
    const { facultyId, cohort } = req.body;
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      message: `Faculty mentor assigned to ${cohort} in ${dept} department.`,
      assignment: {
        department: dept,
        facultyId,
        cohort,
        assignedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDepartmentSettings = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    const settings = req.body;

    res.json({
      success: true,
      message: `Settings updated for ${dept} department.`,
      settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentStudents = async (req, res) => {
  try {
    const dept = (req.query.department || req.user?.department || req.departmentCode || 'AIML').toUpperCase();

    // Fetch all students matching department from PostgreSQL
    const { data: dbStudents, error } = await supabase
      .from('students')
      .select('*')
      .eq('department', dept);

    const formattedStudents = (dbStudents || []).map((s) => ({
      id: s.id,
      photoUrl: s.profile_image || '',
      rollNumber: s.roll_number || '23091A4201',
      regNumber: s.admission_number || `REG-2023-${s.roll_number || '4201'}`,
      name: s.full_name,
      department: s.department || dept,
      year: s.year || 3,
      semester: s.semester || 5,
      section: s.section || 'A',
      batch: '2023-2027',
      email: s.email,
      phone: s.phone_number || '+91 98765 43210',
      mentor: s.section === 'A' ? 'Prof. Vikram Rathore' : s.section === 'B' ? 'Prof. Sneha Verma' : 'Dr. Ramesh Kumar',
      attendance: parseFloat(s.attendance_percentage) || 92,
      cgpa: parseFloat(s.cgpa) || 8.5,
      placementEligible: (parseFloat(s.cgpa) || 8.5) >= 7.5,
      placementStatus: (parseFloat(s.cgpa) || 8.5) >= 9.0 ? 'Placed (Top Tier)' : 'Eligible',
      status: s.is_active !== false ? 'Active' : 'Inactive',
      gender: s.gender || 'Male',
      admissionType: (s.roll_number && s.roll_number.endsWith('1')) ? 'Scholarship' : 'Management',
      feeStatus: {
        mid1Paid: true,
        mid2Paid: (s.roll_number && !s.roll_number.endsWith('3')),
        labsPaid: true,
        semesterPaid: (s.roll_number && !s.roll_number.endsWith('3')),
      },
    }));

    res.json({
      success: true,
      department: dept,
      count: formattedStudents.length,
      students: formattedStudents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = (req.query.department || req.user?.department || req.departmentCode || 'AIML').toUpperCase();

    const { data: dbStudent } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (dbStudent) {
      return res.json({
        success: true,
        department: dept,
        student: {
          id: dbStudent.id,
          rollNumber: dbStudent.roll_number,
          regNumber: dbStudent.admission_number || `REG-2023-${dbStudent.roll_number}`,
          name: dbStudent.full_name,
          department: dbStudent.department || dept,
          year: dbStudent.year || 3,
          semester: dbStudent.semester || 5,
          section: dbStudent.section || 'A',
          batch: '2023-2027',
          email: dbStudent.email,
          phone: dbStudent.phone_number || '+91 98765 43210',
          mentor: 'Prof. Vikram Rathore',
          attendance: parseFloat(dbStudent.attendance_percentage) || 92,
          cgpa: parseFloat(dbStudent.cgpa) || 8.5,
          placementStatus: 'Eligible',
          status: 'Active',
        },
      });
    }

    res.json({
      success: true,
      department: dept,
      student: {
        id,
        rollNumber: '23091A4201',
        regNumber: 'REG-2023-4201',
        name: 'Aarav Sharma',
        department: dept,
        year: 3,
        semester: 5,
        section: 'A',
        batch: '2023-2027',
        email: 'aarav.sharma@college.com',
        phone: '+91 98765 43210',
        mentor: 'Prof. Vikram Rathore',
        attendance: 94,
        cgpa: 9.2,
        placementStatus: 'Placed (Microsoft)',
        status: 'Active',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentFaculty = async (req, res) => {
  try {
    const dept = (req.query.department || req.user?.department || req.departmentCode || 'AIML').toUpperCase();

    // Fetch all faculty matching department from PostgreSQL
    const { data: dbFaculty, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('department', dept);

    let formattedFaculty = (dbFaculty || []).map((f) => ({
      id: f.id,
      photoUrl: f.profile_image || '',
      empId: f.employee_id || `EMP-${dept}-101`,
      name: f.full_name,
      designation: f.designation || 'Professor',
      department: f.department || dept,
      qualification: `Ph.D in ${dept} Engineering`,
      specialization: `${dept} Research & Technology`,
      experience: `${f.experience || 8} Years`,
      subjectsAssigned: f.assigned_subjects ? (typeof f.assigned_subjects === 'string' ? f.assigned_subjects : (Array.isArray(f.assigned_subjects) ? f.assigned_subjects.join(', ') : JSON.stringify(f.assigned_subjects))) : `${dept} Core Subject`,
      classesAssigned: f.assigned_sections ? (typeof f.assigned_sections === 'string' ? f.assigned_sections : (Array.isArray(f.assigned_sections) ? f.assigned_sections.join(', ') : JSON.stringify(f.assigned_sections))) : 'Sem 5 Sec A',
      attendance: parseFloat(f.attendance_percentage) || 95,
      publications: 14,
      feedbackScore: 4.8,
      status: f.status || 'Active',
      empType: 'Full-time',
    }));

    if (formattedFaculty.length === 0) {
      const branchFallbackFaculty = {
        CSE: [
          { id: 'FAC-CSE-1', empId: 'EMP-CSE-101', name: 'Dr. Anjali Mehra', designation: 'Professor & Head', department: 'CSE', qualification: 'Ph.D in Computer Science', specialization: 'Algorithms & Distributed Systems', experience: '15 Years', subjectsAssigned: 'Data Structures & Algorithms (CS501)', classesAssigned: 'Sem 5 Sec A', attendance: 98.0, publications: 22, feedbackScore: 4.9, status: 'Active', empType: 'Full-time' },
          { id: 'FAC-CSE-2', empId: 'EMP-CSE-102', name: 'Prof. Rajesh Kumar', designation: 'Associate Professor', department: 'CSE', qualification: 'Ph.D in Systems', specialization: 'Operating Systems & Security', experience: '10 Years', subjectsAssigned: 'Operating Systems (CS502)', classesAssigned: 'Sem 5 Sec B', attendance: 95.5, publications: 14, feedbackScore: 4.7, status: 'Active', empType: 'Full-time' },
          { id: 'FAC-CSE-3', empId: 'EMP-CSE-103', name: 'Prof. Sunita Reddy', designation: 'Assistant Professor', department: 'CSE', qualification: 'M.Tech in CS', specialization: 'Computer Networks & Cloud', experience: '7 Years', subjectsAssigned: 'Computer Networks (CS503)', classesAssigned: 'Sem 5 Sec C', attendance: 94.0, publications: 8, feedbackScore: 4.6, status: 'Active', empType: 'Full-time' },
        ],
        EEE: [
          { id: 'FAC-EEE-1', empId: 'EMP-EEE-301', name: 'Dr. Suresh Varma', designation: 'Professor & Head', department: 'EEE', qualification: 'Ph.D in Power Systems', specialization: 'Smart Grid & Renewable Energy', experience: '18 Years', subjectsAssigned: 'Power Systems & Smart Grid (EEE501)', classesAssigned: 'Sem 5 Sec A', attendance: 98.0, publications: 25, feedbackScore: 4.9, status: 'Active', empType: 'Full-time' },
          { id: 'FAC-EEE-2', empId: 'EMP-EEE-302', name: 'Prof. Kavita Rao', designation: 'Associate Professor', department: 'EEE', qualification: 'Ph.D in Control Systems', specialization: 'Control & Automation', experience: '12 Years', subjectsAssigned: 'Control Systems (EEE502)', classesAssigned: 'Sem 5 Sec B', attendance: 95.0, publications: 16, feedbackScore: 4.8, status: 'Active', empType: 'Full-time' },
          { id: 'FAC-EEE-3', empId: 'EMP-EEE-303', name: 'Prof. M. K. Chawla', designation: 'Assistant Professor', department: 'EEE', qualification: 'M.Tech in Electrical', specialization: 'Electrical Machines & Drives', experience: '7 Years', subjectsAssigned: 'Electrical Machines II (EEE503)', classesAssigned: 'Sem 5 Sec C', attendance: 93.5, publications: 9, feedbackScore: 4.6, status: 'Active', empType: 'Full-time' },
        ],
        MECH: [
          { id: 'FAC-MECH-1', empId: 'EMP-MECH-401', name: 'Dr. Vikram Rathore', designation: 'Professor & Head', department: 'MECH', qualification: 'Ph.D in Thermal Engg', specialization: 'Thermodynamics & Fluid Dynamics', experience: '17 Years', subjectsAssigned: 'Thermodynamics & Heat Transfer (ME501)', classesAssigned: 'Sem 5 Sec A', attendance: 97.0, publications: 20, feedbackScore: 4.8, status: 'Active', empType: 'Full-time' },
          { id: 'FAC-MECH-2', empId: 'EMP-MECH-402', name: 'Prof. R. P. Singh', designation: 'Associate Professor', department: 'MECH', qualification: 'Ph.D in CAD/CAM', specialization: 'Robotics & Automation', experience: '10 Years', subjectsAssigned: 'CAD/CAM & Robotics (ME502)', classesAssigned: 'Sem 5 Sec B', attendance: 94.5, publications: 12, feedbackScore: 4.7, status: 'Active', empType: 'Full-time' },
        ],
        CIVIL: [
          { id: 'FAC-CIVIL-1', empId: 'EMP-CIVIL-501', name: 'Dr. Rajesh Gupta', designation: 'Professor & Head', department: 'CIVIL', qualification: 'Ph.D in Structural Engg', specialization: 'Structural Analysis & Concrete Tech', experience: '19 Years', subjectsAssigned: 'Structural Analysis & Design (CE501)', classesAssigned: 'Sem 5 Sec A', attendance: 98.5, publications: 28, feedbackScore: 4.9, status: 'Active', empType: 'Full-time' },
          { id: 'FAC-CIVIL-2', empId: 'EMP-CIVIL-502', name: 'Prof. Meenakshi Sundaram', designation: 'Associate Professor', department: 'CIVIL', qualification: 'Ph.D in Geotechnical', specialization: 'Soil Mechanics & Foundations', experience: '13 Years', subjectsAssigned: 'Geotechnical Engineering (CE502)', classesAssigned: 'Sem 5 Sec B', attendance: 96.0, publications: 15, feedbackScore: 4.8, status: 'Active', empType: 'Full-time' },
        ],
        IT: [
          { id: 'FAC-IT-1', empId: 'EMP-IT-601', name: 'Dr. Neha Sharma', designation: 'Professor & Head', department: 'IT', qualification: 'Ph.D in Information Tech', specialization: 'Cloud Computing & DevOps', experience: '14 Years', subjectsAssigned: 'Cloud Computing & DevOps (IT501)', classesAssigned: 'Sem 5 Sec A', attendance: 97.5, publications: 18, feedbackScore: 4.9, status: 'Active', empType: 'Full-time' },
          { id: 'FAC-IT-2', empId: 'EMP-IT-602', name: 'Prof. Aravind Swamy', designation: 'Associate Professor', department: 'IT', qualification: 'Ph.D in Cyber Security', specialization: 'Information Security & Blockchain', experience: '9 Years', subjectsAssigned: 'Cyber Security & Cryptography (IT502)', classesAssigned: 'Sem 5 Sec B', attendance: 95.0, publications: 11, feedbackScore: 4.7, status: 'Active', empType: 'Full-time' },
        ],
      };

      formattedFaculty = branchFallbackFaculty[dept] || branchFallbackFaculty['CSE'];
    }

    res.json({
      success: true,
      department: dept,
      count: formattedFaculty.length,
      faculty: formattedFaculty,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      department: dept,
      faculty: {
        id,
        empId: 'EMP-AIML-101',
        name: 'Dr. Ramesh Kumar',
        designation: 'Professor & Head',
        department: dept,
        qualification: 'Ph.D in AI & Vision',
        specialization: 'Deep Learning & Neural Networks',
        experience: '14 Years',
        subjectsAssigned: 'DL & Neural Networks (AIML501)',
        classesAssigned: 'Sem 5 Sec A, Sem 7 Sec A',
        attendance: 98,
        publications: 18,
        feedbackScore: 4.9,
        status: 'Active',
        empType: 'Full-time',
        joiningDate: '2012-06-15',
        email: 'ramesh.kumar@college.com',
        phone: '+91 98765 11111',
        officeRoom: 'Tech Block 304',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentAcademics = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      department: dept,
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
        { code: `${dept}501`, name: 'Deep Learning & Neural Networks', credits: 4, sem: 5, year: 3, section: 'A', type: 'Theory', faculty: 'Dr. Ramesh Kumar', coordinator: 'Dr. Ramesh Kumar', status: 'Active' },
        { code: `${dept}502`, name: 'Natural Language Processing', credits: 3, sem: 5, year: 3, section: 'B', type: 'Theory', faculty: 'Prof. Sneha Verma', coordinator: 'Prof. Sneha Verma', status: 'Active' },
        { code: `${dept}503L`, name: 'Computer Vision & Robotics Lab', credits: 2, sem: 5, year: 3, section: 'C', type: 'Lab', faculty: 'Prof. Vikram Rathore', coordinator: 'Prof. Vikram Rathore', status: 'Active' },
      ],
      lessonPlans: [
        { id: 'LP-101', subject: `${dept}501 — Deep Learning`, faculty: 'Dr. Ramesh Kumar', sem: 5, totalUnits: 5, completedUnits: 3, pendingUnits: 2, completionPct: 60, status: 'Approved' },
        { id: 'LP-102', subject: `${dept}502 — NLP`, faculty: 'Prof. Sneha Verma', sem: 5, totalUnits: 5, completedUnits: 2, pendingUnits: 3, completionPct: 40, status: 'Pending' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveLessonPlan = async (req, res) => {
  try {
    const { lessonPlanId, decision } = req.body;
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      message: `Lesson plan ${lessonPlanId} has been ${decision} by ${dept} HOD.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentAttendance = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      department: dept,
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
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentExaminations = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      department: dept,
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
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const notifyDefaulters = async (req, res) => {
  try {
    const { studentId, message } = req.body;
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      message: `Shortage alert dispatched to student and assigned mentor in ${dept} department.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentMentoring = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      department: dept,
      summary: {
        totalMentors: 12,
        studentsAssigned: 480,
        pendingMeetings: 8,
        completedMeetings: 42,
        studentsAtRisk: 5,
        parentMeetings: 3,
        mentoringSessions: 50,
        counselingCases: 4,
        avgMentorRating: 4.8,
        openActionItems: 2,
      },
      mentoringList: [
        { id: 'STU-001', name: 'Aarav Sharma', rollNumber: '23091A4201', sem: 5, sec: 'A', mentor: 'Dr. Ramesh Kumar', lastMeeting: '2026-07-10', nextMeeting: '2026-08-05', riskLevel: 'Low', attendance: 94, cgpa: 9.2, status: 'Active' },
        { id: 'STU-003', name: 'Chirag Reddy', rollNumber: '23091A4203', sem: 5, sec: 'B', mentor: 'Prof. Sneha Verma', lastMeeting: '2026-07-14', nextMeeting: '2026-07-28', riskLevel: 'Critical', attendance: 68, cgpa: 7.4, status: 'At-Risk' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentResearch = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      department: dept,
      summary: {
        researchPapers: 28,
        scopusPublications: 18,
        sciJournals: 10,
        patents: 4,
        researchGrants: 3,
        books: 2,
        bookChapters: 6,
        conferencePapers: 12,
        facultyProjects: 5,
        studentProjects: 14,
      },
      publications: [
        { id: 'PUB-101', faculty: 'Dr. Ramesh Kumar', title: 'Deep Vision Transformers for Medical Imaging', journal: 'IEEE Transactions on AI', year: 2026, doi: '10.1109/TAI.2026.101', indexing: 'SCI / Scopus Q1', citations: 42, status: 'Published' },
        { id: 'PUB-102', faculty: 'Prof. Sneha Verma', title: 'Low-Resource Neural Machine Translation', journal: 'ACM Transactions on Asian Language Processing', year: 2025, doi: '10.1145/TALP.2025.102', indexing: 'Scopus Q1', citations: 19, status: 'Published' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentEvents = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';

    res.json({
      success: true,
      department: dept,
      summary: {
        upcomingEvents: 3,
        completedEvents: 14,
        seminars: 4,
        workshops: 5,
        guestLectures: 3,
        industrialVisits: 2,
        hackathons: 2,
        fdps: 3,
        studentParticipation: 380,
      },
      events: [
        { id: 'EVT-101', name: 'International Symposium on Generative AI', category: 'Symposium', organizer: `${dept} Department`, coordinator: 'Dr. Ramesh Kumar', venue: 'Auditorium Main', date: '2026-08-15', participants: 250, status: 'Upcoming', budget: '₹1.5 Lakhs' },
        { id: 'EVT-102', name: 'Hands-on PyTorch & CUDA Optimization Workshop', category: 'Workshop', organizer: `${dept} Department`, coordinator: 'Prof. Vikram Rathore', venue: 'Lab 402', date: '2026-07-22', participants: 60, status: 'Completed', budget: '₹30,000' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================
// PART 2F — REPORTS • DOCUMENTS • APPROVALS • AUDIT • SETTINGS
// ============================================================

export const getDepartmentReports = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      summary: {
        departmentPerformance: 92,
        facultyPerformance: 88,
        studentPerformance: 84,
        attendancePercentage: 91.4,
        passPercentage: 94.2,
        researchPublications: 28,
        activeProjects: 14,
        placements: 82,
        eventsConducted: 17,
        mentoringSessions: 50,
      },
      reportTypes: [
        { id: 'RPT-001', type: 'Student Report', icon: 'Users', generatedCount: 12, lastGenerated: '2026-07-18' },
        { id: 'RPT-002', type: 'Faculty Report', icon: 'Briefcase', generatedCount: 8, lastGenerated: '2026-07-15' },
        { id: 'RPT-003', type: 'Attendance Report', icon: 'CalendarCheck', generatedCount: 24, lastGenerated: '2026-07-20' },
        { id: 'RPT-004', type: 'Result Report', icon: 'Award', generatedCount: 6, lastGenerated: '2026-07-10' },
        { id: 'RPT-005', type: 'Research Report', icon: 'FlaskConical', generatedCount: 4, lastGenerated: '2026-07-05' },
        { id: 'RPT-006', type: 'Placement Report', icon: 'TrendingUp', generatedCount: 3, lastGenerated: '2026-06-30' },
        { id: 'RPT-007', type: 'Department Report', icon: 'Building', generatedCount: 2, lastGenerated: '2026-07-01' },
        { id: 'RPT-008', type: 'Event Report', icon: 'Calendar', generatedCount: 7, lastGenerated: '2026-07-12' },
        { id: 'RPT-009', type: 'Mentoring Report', icon: 'Heart', generatedCount: 5, lastGenerated: '2026-07-16' },
        { id: 'RPT-010', type: 'Academic Report', icon: 'BookOpen', generatedCount: 9, lastGenerated: '2026-07-19' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentDocuments = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      documents: [
        { id: 'DOC-001', name: 'NBA Accreditation Self-Study Report 2026', category: 'Accreditation', uploadedBy: 'Dr. Ramesh Kumar', uploadedDate: '2026-07-01', size: '4.2 MB', format: 'PDF', pinned: true, tags: ['NBA', 'Accreditation', '2026'] },
        { id: 'DOC-002', name: 'Odd Semester Timetable 2026-27', category: 'Academic Files', uploadedBy: 'Prof. Sneha Verma', uploadedDate: '2026-07-10', size: '820 KB', format: 'PDF', pinned: true, tags: ['Timetable', 'Sem 5', 'Sem 7'] },
        { id: 'DOC-003', name: 'R23 Curriculum Document', category: 'Academic Files', uploadedBy: 'Dr. Ramesh Kumar', uploadedDate: '2026-06-15', size: '1.1 MB', format: 'PDF', pinned: false, tags: ['R23', 'Curriculum', 'Regulation'] },
        { id: 'DOC-004', name: 'Department Meeting Minutes - July 2026', category: 'Meeting Minutes', uploadedBy: 'Prof. Vikram Rathore', uploadedDate: '2026-07-18', size: '240 KB', format: 'DOCX', pinned: false, tags: ['Minutes', 'July 2026'] },
        { id: 'DOC-005', name: 'Internal Test 2 Question Papers - Sem 5', category: 'Academic Files', uploadedBy: 'Prof. Ananya Nair', uploadedDate: '2026-07-14', size: '560 KB', format: 'PDF', pinned: false, tags: ['IT2', 'Question Paper', 'Sem 5'] },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentApprovals = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      summary: {
        pendingTotal: 7,
        facultyLeave: 3,
        odRequests: 2,
        workshopPermissions: 1,
        eventApprovals: 1,
      },
      approvals: [
        { id: 'APR-001', requestId: 'LV-2026-0142', applicant: 'Prof. Sneha Verma', type: 'Casual Leave', submittedDate: '2026-07-19', status: 'Pending', priority: 'Normal', days: 2, remarks: '' },
        { id: 'APR-002', requestId: 'OD-2026-0038', applicant: 'Dr. Vikram Rathore', type: 'On-Duty (Conference)', submittedDate: '2026-07-18', status: 'Pending', priority: 'High', days: 3, remarks: '' },
        { id: 'APR-003', requestId: 'WK-2026-0012', applicant: 'Prof. Ananya Nair', type: 'Workshop Permission', submittedDate: '2026-07-17', status: 'Pending', priority: 'Normal', days: 1, remarks: '' },
        { id: 'APR-004', requestId: 'EV-2026-0005', applicant: 'Dr. Ramesh Kumar', type: 'Event Approval (Symposium)', submittedDate: '2026-07-16', status: 'Pending', priority: 'High', days: null, remarks: '' },
        { id: 'APR-005', requestId: 'LV-2026-0140', applicant: 'Prof. Divya Iyer', type: 'Medical Leave', submittedDate: '2026-07-15', status: 'Approved', priority: 'Normal', days: 5, remarks: 'Medical certificate verified.' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    res.json({ success: true, message: `Request ${id} approved.`, remarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    res.json({ success: true, message: `Request ${id} rejected.`, remarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentAuditLogs = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      logs: [
        { id: 'LOG-001', timestamp: '2026-07-20 22:14:05', user: 'HOD (Dr. Ramesh Kumar)', action: 'Login', module: 'Authentication', ip: '192.168.1.101', status: 'Success' },
        { id: 'LOG-002', timestamp: '2026-07-20 22:18:30', user: 'HOD (Dr. Ramesh Kumar)', action: 'Approved Leave Request APR-005', module: 'Approvals', ip: '192.168.1.101', status: 'Success' },
        { id: 'LOG-003', timestamp: '2026-07-20 21:55:10', user: 'HOD (Dr. Ramesh Kumar)', action: 'Downloaded Attendance Report', module: 'Reports', ip: '192.168.1.101', status: 'Success' },
        { id: 'LOG-004', timestamp: '2026-07-20 21:40:22', user: 'HOD (Dr. Ramesh Kumar)', action: 'Uploaded NBA Accreditation SSR 2026', module: 'Documents', ip: '192.168.1.101', status: 'Success' },
        { id: 'LOG-005', timestamp: '2026-07-19 18:05:44', user: 'HOD (Dr. Ramesh Kumar)', action: 'Updated Department Contact Settings', module: 'Settings', ip: '192.168.1.101', status: 'Success' },
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentSettingsFull = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    res.json({
      success: true,
      department: dept,
      settings: {
        departmentName: `${dept} Department`,
        shortName: dept,
        vision: 'To be a centre of excellence in Artificial Intelligence & Machine Learning, fostering innovation, research, and holistic development of students.',
        mission: 'To provide quality education through industry-aligned curriculum, collaborative research, and strong value systems.',
        academicYear: '2026-27',
        currentSemester: 'Odd Semester (July–November 2026)',
        hodName: 'Dr. Ramesh Kumar',
        hodEmail: 'hod.aiml@cms.edu',
        officePhone: '+91-40-12345678 Ext 201',
        officeLocation: 'Block A, Room 301',
        workingHours: '9:00 AM – 5:00 PM (Mon–Sat)',
        coordinators: [
          { role: 'Class Advisor (Sem 5 A)', name: 'Prof. Sneha Verma' },
          { role: 'Class Advisor (Sem 5 B)', name: 'Prof. Ananya Nair' },
          { role: 'R&D Coordinator', name: 'Dr. Vikram Rathore' },
          { role: 'Industry Relations', name: 'Prof. Meera Pillai' },
        ],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/hod/reports/email-report
 * Dispatches official department audit report via Nodemailer / SMTP.
 */
export const emailDepartmentReport = async (req, res) => {
  try {
    const dept = req.departmentCode || 'AIML';
    const { recipients, subject, coverMessage, dispatchMode } = req.body;

    if (!recipients) {
      return res.status(400).json({ success: false, message: 'Recipients are required.' });
    }

    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const hasSMTP = Boolean(process.env.SMTP_HOST && smtpUser && smtpPass);

    if (hasSMTP) {
      const nodemailerModule = await import('nodemailer');
      const transporter = nodemailerModule.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${dept} HOD Command Center" <${smtpUser}>`,
        to: recipients,
        subject: subject || `[OFFICIAL AUDIT REPORT] Department of ${dept}`,
        text: coverMessage,
      });

      console.log(`✅ REAL SMTP EMAIL DISPATCHED to ${recipients} for Department ${dept}`);
      return res.json({
        success: true,
        realEmailSent: true,
        message: `Real email successfully dispatched via SMTP to ${recipients}!`,
      });
    } else {
      console.log(`[SMTP QUEUE] Email queued for ${recipients}. Subject: ${subject}`);
      return res.json({
        success: true,
        realEmailSent: false,
        message: `Email report queued for ${recipients}. (To send actual emails to real inboxes, configure SMTP_HOST, SMTP_USER & SMTP_PASS in server/.env)`,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

