import express from 'express';
import { getTransportDashboard } from '../controllers/transportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getTransportDashboard);

export default router;
