import express from 'express';
import {
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  assignFaculty,
  getTimetable,
  createTimetableSlot,
  deleteTimetableSlot,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('admin', 'super-admin'));

// Faculty routes
router.route('/faculty')
  .get(getFaculty)
  .post(createFaculty);

router.route('/faculty/:id')
  .put(updateFaculty)
  .delete(deleteFaculty);

// Assignments
router.route('/assignments')
  .post(assignFaculty);

// Timetable routes
router.route('/timetable')
  .get(getTimetable)
  .post(createTimetableSlot);

router.route('/timetable/:id')
  .delete(deleteTimetableSlot);

export default router;
