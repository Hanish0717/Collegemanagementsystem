import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getAssessments,
  getAssessmentById,
  getAssessmentsByDrive,
  createAssessment,
  updateAssessment,
  updateAssessmentStatus,
  deleteAssessment
} from '../controllers/assessmentController.js';

const router = express.Router();

// Allowed roles for Assessment Management Module (Company Recruiters & Placement Officers)
const assessmentRoles = authorizeRoles(
  'company_recruiter',
  'company-recruiter',
  'recruiter',
  'placement',
  'placement_officer',
  'placement-officer',
  'admin',
  'super_admin',
  'super-admin'
);

// All routes protected by JWT auth & RBAC
router.get('/', protect, assessmentRoles, getAssessments);
router.get('/drive/:driveId', protect, assessmentRoles, getAssessmentsByDrive);
router.get('/:id', protect, assessmentRoles, getAssessmentById);
router.post('/', protect, assessmentRoles, createAssessment);
router.put('/:id', protect, assessmentRoles, updateAssessment);
router.patch('/:id/status', protect, assessmentRoles, updateAssessmentStatus);
router.delete('/:id', protect, assessmentRoles, deleteAssessment);

export default router;
