import express from 'express';
import {
  getFacultyAttendanceList,
  bulkMarkFacultyAttendance,
  getFacultyAttendanceHistory,
  updateFacultyAttendance,
  deleteFacultyAttendance
} from '../controllers/facultyAttendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply auth protecting middleware globally
router.use(protect);

// Admin / Super-Admin access endpoints
router.get('/list', authorizeRoles('admin', 'super-admin'), getFacultyAttendanceList);
router.post('/bulk-mark', authorizeRoles('admin', 'super-admin'), bulkMarkFacultyAttendance);
router.get('/faculty/:facultyId', authorizeRoles('admin', 'super-admin', 'faculty'), getFacultyAttendanceHistory);

router
  .route('/:id')
  .put(authorizeRoles('admin', 'super-admin'), updateFacultyAttendance)
  .delete(authorizeRoles('admin', 'super-admin'), deleteFacultyAttendance);

export default router;
