import express from 'express';
import { 
  getPlacementDashboard, 
  createCompany, 
  updateCompany, 
  createDrive, 
  updateDrive,
  createApplication,
  updateApplication,
  createInterview,
  updateInterview,
  getTrainingPrograms,
  createTrainingProgram,
  updateTrainingProgram
} from '../controllers/placementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getPlacementDashboard);
router.post('/companies', protect, createCompany);
router.put('/companies/:id', protect, updateCompany);
router.post('/drives', protect, createDrive);
router.put('/drives/:id', protect, updateDrive);

router.post('/applications', protect, createApplication);
router.put('/applications/:id', protect, updateApplication);
router.post('/interviews', protect, createInterview);
router.put('/interviews/:id', protect, updateInterview);

router.get('/training', protect, getTrainingPrograms);
router.post('/training', protect, createTrainingProgram);
router.put('/training/:id', protect, updateTrainingProgram);

export default router;
