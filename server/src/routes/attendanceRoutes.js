import express from 'express';
import {
  markAttendance,
  bulkMarkAttendance,
  getStudentAttendance,
  getClassAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceReport,
  markAttendanceViaQR,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply auth protecting middleware globally
router.use(protect);

// Faculty & Admin access endpoints
router.post('/mark', authorizeRoles('faculty', 'admin', 'super-admin'), markAttendance);
router.post('/bulk-mark', authorizeRoles('faculty', 'admin', 'super-admin'), bulkMarkAttendance);
router.get('/class', authorizeRoles('faculty', 'admin', 'super-admin'), getClassAttendance);

router
  .route('/:id')
  .put(authorizeRoles('faculty', 'admin', 'super-admin'), updateAttendance)
  .delete(authorizeRoles('faculty', 'admin', 'super-admin'), deleteAttendance);

// Student/Faculty/Admin access to stats
router.get('/student/:studentId', getStudentAttendance);

// Admin-only report generator access
router.get('/report', authorizeRoles('admin', 'super-admin'), getAttendanceReport);

// Student scan attendance QR Code access
router.post('/scan-qr', authorizeRoles('student'), markAttendanceViaQR);

export default router;
