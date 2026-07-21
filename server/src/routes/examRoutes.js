import express from 'express';
import {
  getExamStats,
  getExams,
  createExam,
  updateExam,
  deleteExam,
  getExamTimetable,
  saveExamTimetable,
  getHallTicketsEligibility,
  approveHallTicket,
  getExamResults,
  saveExamResults,
  getExamAnalytics,
  createCourse,
  getCourses,
  registerCourse,
  getMyRegistrations,
  getCourseAnalytics,
  getFacultyByDepartment,
  registerExam,
  getMyExamRegistrations,
  requestMarksCorrection,
  getPendingCorrections,
  approveMarksCorrection,
  getExtendedAnalytics,
  registerSupplementary
} from '../controllers/examController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get stats
router.get('/stats', getExamStats);

// Get/Create/Update/Delete exams
router.get('/', getExams);

// Course registration endpoints for students
router.get('/courses', getCourses);
router.post('/courses/register', authorizeRoles('student'), registerCourse);
router.get('/courses/my-registrations', authorizeRoles('student'), getMyRegistrations);
router.post('/courses/register-exam', authorizeRoles('student'), registerExam);
router.get('/courses/my-exam-registrations', authorizeRoles('student'), getMyExamRegistrations);

// Student supplementary registration
router.post('/supplementary/register', authorizeRoles('student'), registerSupplementary);

// Faculty marks correction request
router.post('/corrections/request', authorizeRoles('faculty', 'admin', 'super-admin', 'exam-cell'), requestMarksCorrection);

// Admin / Exam Cell / HOD management routes
router.use(authorizeRoles('admin', 'super-admin', 'exam-cell', 'hod'));

// Offered Course Creation & Analytics (Officers)
router.post('/courses', createCourse);
router.get('/courses/analytics', getCourseAnalytics);
router.get('/faculty', getFacultyByDepartment);

// Corrections review and approval
router.get('/corrections/pending', getPendingCorrections);
router.post('/corrections/approve', approveMarksCorrection);

router.post('/', createExam);
router.route('/:id')
  .put(updateExam)
  .delete(deleteExam);

// Timetables
router.route('/:id/timetable')
  .get(getExamTimetable)
  .post(saveExamTimetable);

// Hall tickets
router.get('/:id/hall-tickets', getHallTicketsEligibility);
router.post('/:id/hall-tickets/approve', approveHallTicket);

// Results
router.route('/:id/results')
  .get(getExamResults)
  .post(saveExamResults);

// Analytics
router.get('/:id/analytics', getExamAnalytics);
router.get('/:id/extended-analytics', getExtendedAnalytics);

export default router;
