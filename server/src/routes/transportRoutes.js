import express from 'express';
import { 
  getTransportDashboard, 
  verifyStudentTransport, 
  getBusTelemetry, 
  updateBusTelemetry,
  assignBusToRoute,
  triggerTransportFeeDue
} from '../controllers/transportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getTransportDashboard);
router.post('/verify-student', protect, verifyStudentTransport);
router.get('/telemetry', protect, getBusTelemetry);
router.post('/telemetry', protect, updateBusTelemetry);
router.post('/assign-bus', protect, assignBusToRoute);
router.post('/trigger-fee', protect, triggerTransportFeeDue);

export default router;
