import express from 'express';
import {
  getStudentDashboard,
  getStudentTimetable,
  getStudentResults,
  getStudentAssignments,
  submitAssignment,
  getStudentMaterials,
  trackMaterialDownload,
  getStudentLeaveRequests,
  createStudentLeaveRequest,
  getStudentPlacements,
  getStudentComplaints,
  createStudentComplaint,
  getStudentNotifications,
  markStudentNotificationRead,
  markAllStudentNotificationsRead,
  deleteStudentNotification,
  getStudentHallTicket,
} from '../controllers/studentModuleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Define allowed roles for standard student-only endpoints
const studentOnly = authorizeRoles('student', 'admin', 'super-admin');
// Define allowed roles for notifications (accessible by student, exam-cell, faculty, hod, hostel-warden, and all staff roles)
const notificationRoles = authorizeRoles('student', 'admin', 'super-admin', 'exam-cell', 'faculty', 'hod', 'hostel-warden', 'librarian', 'placement-officer', 'transport-manager', 'accountant');

router.get('/dashboard', studentOnly, getStudentDashboard);
router.get('/timetable', studentOnly, getStudentTimetable);
router.get('/results', studentOnly, getStudentResults);
router.get('/hall-ticket', studentOnly, getStudentHallTicket);
router.get('/assignments', studentOnly, getStudentAssignments);
router.post('/assignments/submit/:id', studentOnly, submitAssignment);
router.get('/materials', studentOnly, getStudentMaterials);
router.post('/materials/:id/download', studentOnly, trackMaterialDownload);
router.route('/leave')
  .get(studentOnly, getStudentLeaveRequests)
  .post(studentOnly, createStudentLeaveRequest);
router.get('/placements', studentOnly, getStudentPlacements);
router.route('/complaints')
  .get(studentOnly, getStudentComplaints)
  .post(studentOnly, createStudentComplaint);

router.get('/notifications', notificationRoles, getStudentNotifications);
router.put('/notifications/:id/read', notificationRoles, markStudentNotificationRead);
router.post('/notifications/mark-all-read', notificationRoles, markAllStudentNotificationsRead);
router.delete('/notifications/:id', notificationRoles, deleteStudentNotification);

export default router;
