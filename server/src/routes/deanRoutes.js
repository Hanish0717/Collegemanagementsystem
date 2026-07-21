import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getDeanDashboard,
  getDeanStudentDomain,
  getDeanExaminationDomain,
  getDeanAcademicDomain,
  getDeanImaDomain,
  getDeanIqacDomain,
} from '../controllers/deanController.js';

const router = express.Router();

// Apply authentication and Dean role authorization (also allow Principal & Super Admin)
router.use(protect);
router.use(authorizeRoles('dean', 'principal', 'vice_principal', 'admin', 'super-admin', 'super_admin'));

router.get('/dashboard', getDeanDashboard);
router.get('/student', getDeanStudentDomain);
router.get('/examination', getDeanExaminationDomain);
router.get('/academic', getDeanAcademicDomain);
router.get('/ima', getDeanImaDomain);
router.get('/iqac', getDeanIqacDomain);

export default router;
