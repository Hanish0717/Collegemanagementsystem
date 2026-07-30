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
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
  getBroadcasts,
  createBroadcast,
  getAudienceCounts,
} from '../controllers/adminController.js';
import {
  getWorkWalletTasks,
  createWorkWalletTask,
  updateWorkWalletTaskStatus,
} from '../controllers/workWalletController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('admin', 'super-admin', 'librarian', 'principal', 'dean', 'hod'));

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

// Operational Notifications
router.route('/notifications')
  .get(getAdminNotifications);

router.route('/notifications/mark-all-read')
  .post(markAllAdminNotificationsRead);

router.route('/notifications/:id')
  .delete(deleteAdminNotification);

router.route('/notifications/:id/read')
  .put(markAdminNotificationRead);

// Broadcast routes
router.route('/broadcasts')
  .get(getBroadcasts)
  .post(createBroadcast);

router.route('/audience-counts')
  .get(getAudienceCounts);

// Work Wallet routes
router.route('/work-wallet')
  .get(getWorkWalletTasks)
  .post(createWorkWalletTask);

router.route('/work-wallet/:id/status')
  .put(updateWorkWalletTaskStatus);

export default router;
