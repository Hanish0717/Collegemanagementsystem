import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import Faculty from '../models/faculty/Faculty.js';
import Student from '../models/student/Student.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('faculty', 'super-admin'));

// @desc    Get all students assigned to the logged-in faculty member
// @route   GET /api/faculty/students
// @access  Private (faculty)
router.get('/students', async (req, res, next) => {
  try {
    // Find Faculty profile for logged-in user
    const facultyMember = await Faculty.findOne({ user: req.user._id });
    if (!facultyMember) {
      const error = new Error('Faculty profile not found for this user account');
      error.statusCode = 404;
      return next(error);
    }

    // Find students where they are in assignedStudentIds OR their advisor is this faculty
    // OR matching the faculty's assigned sections and department
    const query = {
      $or: [
        { _id: { $in: facultyMember.assignedStudentIds } },
        { facultyAdvisor: facultyMember._id },
        { assignedFacultyIds: facultyMember._id },
        {
          department: facultyMember.department,
          section: { $in: facultyMember.assignedSections }
        }
      ],
      isActive: true
    };

    const students = await Student.find(query)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .sort({ fullName: 1 });

    // Format & return details
    res.status(200).json({
      success: true,
      data: {
        students,
        facultyProfile: {
          id: facultyMember._id,
          fullName: facultyMember.fullName,
          employeeId: facultyMember.employeeId,
          assignedSections: facultyMember.assignedSections,
          assignedSubjectsCount: facultyMember.assignedSubjects.length,
          studentCount: students.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
