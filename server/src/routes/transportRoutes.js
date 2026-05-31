import express from 'express';
import { getTransportDashboard, verifyStudentTransport, getBusTelemetry, updateBusTelemetry } from '../controllers/transportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getTransportDashboard);
router.post('/verify-student', protect, verifyStudentTransport);
router.get('/telemetry', protect, getBusTelemetry);
router.post('/telemetry', protect, updateBusTelemetry);

export default router;
