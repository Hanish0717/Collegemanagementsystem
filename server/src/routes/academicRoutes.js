import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

const DEPARTMENTS = [
  { _id: 'CSE', id: 'CSE', name: 'Computer Science & Engineering', code: 'CSE', isActive: true },
  { _id: 'AIML', id: 'AIML', name: 'Artificial Intelligence & Machine Learning', code: 'AIML', isActive: true },
  { _id: 'AIDS', id: 'AIDS', name: 'Artificial Intelligence & Data Science', code: 'AIDS', isActive: true },
  { _id: 'CYBERSECURITY', id: 'CYBERSECURITY', name: 'Cybersecurity', code: 'CYBERSECURITY', isActive: true },
  { _id: 'IT', id: 'IT', name: 'Information Technology', code: 'IT', isActive: true },
  { _id: 'ECE', id: 'ECE', name: 'Electronics & Communication Engineering', code: 'ECE', isActive: true },
  { _id: 'EEE', id: 'EEE', name: 'Electrical & Electronics Engineering', code: 'EEE', isActive: true },
  { _id: 'MECH', id: 'MECH', name: 'Mechanical Engineering', code: 'MECH', isActive: true },
  { _id: 'CIVIL', id: 'CIVIL', name: 'Civil Engineering', code: 'CIVIL', isActive: true }
];

const SUBJECTS = [
  { _id: 'CS301', id: 'CS301', name: 'Data Structures', code: 'CS301', department: 'CSE', semester: 3, credits: 4, type: 'theory', isActive: true },
  { _id: 'CS401', id: 'CS401', name: 'Database Management Systems', code: 'CS401', department: 'CSE', semester: 4, credits: 4, type: 'theory', isActive: true },
  { _id: 'CS501', id: 'CS501', name: 'Operating Systems', code: 'CS501', department: 'CSE', semester: 5, credits: 4, type: 'theory', isActive: true },
  { _id: 'CS601', id: 'CS601', name: 'Computer Networks', code: 'CS601', department: 'CSE', semester: 6, credits: 3, type: 'theory', isActive: true },
  { _id: 'CS701', id: 'CS701', name: 'Machine Learning', code: 'CS701', department: 'CSE', semester: 7, credits: 4, type: 'elective', isActive: true },
  { _id: 'EC301', id: 'EC301', name: 'Digital Electronics', code: 'EC301', department: 'ECE', semester: 3, credits: 4, type: 'theory', isActive: true }
];

// Retrieve all active departments for selects/dropdowns
router.get('/departments', protect, async (req, res, next) => {
  try {
    const { data: dbDepts, error } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) throw error;

    if (!dbDepts || dbDepts.length === 0) {
      return res.status(200).json({
        success: true,
        data: DEPARTMENTS,
      });
    }

    const formattedDepts = dbDepts.map(d => ({
      _id: d.code,
      id: d.code,
      name: d.name,
      code: d.code,
      isActive: d.is_active,
      headOfDepartment: d.head_of_department,
      facultyCount: d.faculty_count,
      studentCount: d.student_count,
      budget: d.budget
    }));

    res.status(200).json({
      success: true,
      data: formattedDepts,
    });
  } catch (error) {
    console.error("Error fetching departments from DB, falling back:", error);
    res.status(200).json({
      success: true,
      data: DEPARTMENTS,
    });
  }
});

// Retrieve all active subjects for selects/dropdowns
router.get('/subjects', protect, async (req, res, next) => {
  try {
    const { department } = req.query;
    let query = supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true);
    
    if (department) {
      query = query.eq('department', department);
    }
    
    const { data: dbSubjects, error } = await query.order('code', { ascending: true });
    
    if (error) throw error;

    if (!dbSubjects || dbSubjects.length === 0) {
      let filteredSubjects = SUBJECTS;
      if (department) {
        filteredSubjects = SUBJECTS.filter(s => s.department === department);
      }
      return res.status(200).json({
        success: true,
        data: filteredSubjects,
      });
    }

    const formattedSubjects = dbSubjects.map(s => ({
      _id: s.code,
      id: s.code,
      name: s.name,
      code: s.code,
      department: s.department,
      semester: Number(s.semester.replace(/\D/g, '')) || 1, // extract number e.g. "Semester 3" -> 3
      credits: s.credits,
      isActive: s.is_active
    }));

    res.status(200).json({
      success: true,
      data: formattedSubjects,
    });
  } catch (error) {
    console.error("Error fetching subjects from DB, falling back:", error);
    let filteredSubjects = SUBJECTS;
    if (department) {
      filteredSubjects = SUBJECTS.filter(s => s.department === department);
    }
    res.status(200).json({
      success: true,
      data: filteredSubjects,
    });
  }
});

export default router;
