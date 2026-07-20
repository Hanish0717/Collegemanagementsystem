import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getStudentsWithAttendance,
  getRecommendations,
  getSettings,
  updateSettings,
  getTemplates,
  updateTemplate,
  submitRequest,
  sendApprovedNotification,
  getHistory,
  getPending,
  approveRequest,
  rejectRequest
} from '../controllers/attendanceApprovalController.js';

const router = express.Router();

router.use(protect);

router.get('/students', getStudentsWithAttendance);
router.get('/recommendations', getRecommendations);
router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.get('/templates', getTemplates);
router.put('/template/:id', updateTemplate);
router.post('/notification/request', submitRequest);
router.post('/notification/send', sendApprovedNotification);
router.get('/history', getHistory);
router.get('/pending', getPending);
router.put('/approve/:id', approveRequest);
router.put('/reject/:id', rejectRequest);

export default router;
