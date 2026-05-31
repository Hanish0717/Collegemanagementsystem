import express from 'express';
import { getPlacementDashboard, createCompany, updateCompany, createDrive, updateDrive } from '../controllers/placementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getPlacementDashboard);
router.post('/companies', protect, createCompany);
router.put('/companies/:id', protect, updateCompany);
router.post('/drives', protect, createDrive);
router.put('/drives/:id', protect, updateDrive);

export default router;
