import express from 'express';
import { getPlacementDashboard } from '../controllers/placementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getPlacementDashboard);

export default router;
