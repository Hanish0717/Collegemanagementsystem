import express from 'express';
import {
  getSuperAdminStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/superAdminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/dashboard/stats', protect, requireRole('super-admin'), getSuperAdminStats);

router.use(protect);
router.use(requireRole('super-admin'));

router.route('/admins')
  .get(getAdmins)
  .post(createAdmin);

router.route('/admins/:id')
  .put(updateAdmin)
  .delete(deleteAdmin);

export default router;
