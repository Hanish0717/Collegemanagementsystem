import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  triggerNotifications,
  getNotificationDashboard,
  getNotificationHistory
} from '../controllers/attendanceNotificationController.js';

const router = express.Router();

// All routes are protected and limited to admin and super-admin
router.use(protect);
router.use(authorizeRoles('admin', 'super-admin'));

router.post('/trigger', triggerNotifications);
router.get('/dashboard', getNotificationDashboard);
router.get('/history', getNotificationHistory);

export default router;
