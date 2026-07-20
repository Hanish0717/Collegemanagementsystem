import express from 'express';
import {
  getAccreditationDashboard,
  getCriteria,
  getMetrics,
  createMetric,
  updateMetric,
  deleteMetric,
  getEvidence,
  uploadEvidence,
  replaceEvidence,
  submitWorkflowState,
  getCommitteesAndMeetings,
  createMeeting,
  createActionItem,
  updateActionItemStatus,
  getAuditLogs,
  getRemarksHistory
} from '../controllers/accreditationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getAccreditationDashboard);
router.get('/criteria', getCriteria);

router.route('/metrics')
  .get(getMetrics)
  .post(createMetric);

router.route('/metrics/:id')
  .put(updateMetric)
  .delete(deleteMetric);

router.route('/evidence')
  .get(getEvidence)
  .post(uploadEvidence);

router.post('/evidence/:id/replace', replaceEvidence);
router.post('/evidence/:id/workflow', submitWorkflowState);

router.get('/committees', getCommitteesAndMeetings);
router.post('/meetings', createMeeting);

router.post('/action-items', createActionItem);
router.put('/action-items/:id', updateActionItemStatus);

router.get('/audit-logs', getAuditLogs);
router.get('/remarks/:documentId', getRemarksHistory);

export default router;
