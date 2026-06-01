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
  getExamAnalytics
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

// Admin-only management routes
router.use(authorizeRoles('admin', 'super-admin'));

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

export default router;
