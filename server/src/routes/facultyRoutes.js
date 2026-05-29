import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('faculty', 'super-admin'));

// @desc    Get all students assigned to the logged-in faculty member
// @route   GET /api/faculty/students
// @access  Private (faculty)
router.get('/students', async (req, res, next) => {
  try {
    // Find Faculty profile for logged-in user
    const { data: facultyMember, error: facErr } = await supabase
      .from('faculty')
      .select('*')
      .eq('user_id', req.user.id || req.user._id)
      .maybeSingle();

    if (facErr || !facultyMember) {
      const error = new Error('Faculty profile not found for this user account');
      error.statusCode = 404;
      return next(error);
    }

    // Fetch all active students
    const { data: allStudents, error: studErr } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true);

    if (studErr) throw studErr;

    // Filter students assigned to this faculty member
    let matchingStudents = [];
    if (allStudents) {
      matchingStudents = allStudents.filter(student => {
        // Match department & section
        const matchesSection = (student.department === facultyMember.department) && 
                               (Array.isArray(facultyMember.assigned_sections) && 
                                facultyMember.assigned_sections.includes(student.section));
        
        // Match explicit student ID link
        const matchesId = Array.isArray(facultyMember.assigned_student_ids) && 
                          facultyMember.assigned_student_ids.includes(student.id);
        
        return matchesSection || matchesId;
      });
    }

    // Format students details for frontend
    const formattedStudents = matchingStudents.map(s => ({
      ...s,
      _id: s.id,
      fullName: s.full_name,
      rollNumber: s.roll_number,
      email: s.email,
      phoneNumber: s.phone_number,
      section: s.section,
      year: s.year,
      semester: s.semester,
      attendancePercentage: Number(s.attendance_percentage) || 100,
      cgpa: Number(s.cgpa) || 0,
      status: s.is_active ? 'Active' : 'Inactive',
      department: {
        name: s.department === 'CSE' ? 'Computer Science and Engineering' : 
              s.department === 'ECE' ? 'Electronics and Communication Engineering' : 
              s.department === 'ME' ? 'Mechanical Engineering' : 
              s.department === 'CE' ? 'Civil Engineering' : 
              s.department === 'EE' ? 'Electrical Engineering' : s.department,
        code: s.department
      }
    }));

    // Sort by name
    formattedStudents.sort((a, b) => a.fullName.localeCompare(b.fullName));

    // Return details
    res.status(200).json({
      success: true,
      data: {
        students: formattedStudents,
        facultyProfile: {
          id: facultyMember.id,
          fullName: facultyMember.full_name,
          employeeId: facultyMember.employee_id,
          assignedSections: Array.isArray(facultyMember.assigned_sections) ? facultyMember.assigned_sections : [],
          assignedSubjectsCount: Array.isArray(facultyMember.assigned_subjects) ? facultyMember.assigned_subjects.length : 0,
          studentCount: formattedStudents.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
