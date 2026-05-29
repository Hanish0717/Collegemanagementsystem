import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const DEPARTMENTS = [
  { _id: 'CSE', id: 'CSE', name: 'Computer Science and Engineering', code: 'CSE', isActive: true },
  { _id: 'ECE', id: 'ECE', name: 'Electronics and Communication Engineering', code: 'ECE', isActive: true },
  { _id: 'ME', id: 'ME', name: 'Mechanical Engineering', code: 'ME', isActive: true },
  { _id: 'CE', id: 'CE', name: 'Civil Engineering', code: 'CE', isActive: true },
  { _id: 'EE', id: 'EE', name: 'Electrical Engineering', code: 'EE', isActive: true }
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
    res.status(200).json({
      success: true,
      data: DEPARTMENTS,
    });
  } catch (error) {
    next(error);
  }
});

// Retrieve all active subjects for selects/dropdowns
router.get('/subjects', protect, async (req, res, next) => {
  try {
    const { department } = req.query;
    let filteredSubjects = SUBJECTS;
    if (department) {
      filteredSubjects = SUBJECTS.filter(s => s.department === department);
    }
    res.status(200).json({
      success: true,
      data: filteredSubjects,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
