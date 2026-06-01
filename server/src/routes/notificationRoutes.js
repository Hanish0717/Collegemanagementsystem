import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getPreferences, updatePreferences, getNotificationLogs } from '../controllers/notificationController.js';

const router = express.Router();

// Apply auth middleware to protect all notification endpoints
router.use(protect);

router.route('/preferences')
  .get(getPreferences)
  .put(updatePreferences);

router.route('/logs')
  .get(getNotificationLogs);

export default router;
